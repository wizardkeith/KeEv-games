/**
 * W1.1A VFX observational reproductions — NOT acceptance tests.
 *
 * Run from a checked-out game repository with its original dependencies:
 *   node --import tsx /path/to/reviewer_probes/vfx-review.mts .
 * The first argument selects the repository; otherwise process.cwd() is used.
 * The optional second argument selects the evidence JSON output path.
 *
 * This reads real application sources and uses real core/projector/clock helpers.
 * committed()/cancelFeedback() are extracted from that repository's main.ts,
 * transpiled, and evaluated against explicit mocked presentation boundaries.
 * No browser, WebGL renderer, real IndexedDB, user save, or production Site is used.
 * Exit 0 means observations were collected; it does NOT mean defects are fixed.
 * If implementation dependencies change, adapt the boundary deliberately. A probe
 * error means incompatible/incomplete observation, never a rendering or fix PASS.
 */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';

const repository=path.resolve(process.argv[2]||process.cwd());
const scriptDirectory=path.dirname(fileURLToPath(import.meta.url));
const outputPath=path.resolve(process.argv[3]||path.join(scriptDirectory,'../reviewer_evidence/vfx-review.json'));
const repositoryRequire=createRequire(path.join(repository,'package.json'));
const ts=repositoryRequire('typescript');
const moduleAt=(relative:string)=>import(pathToFileURL(path.join(repository,relative)).href);
const [{Core,catalog},{execute},{FeedbackProjector},{FeedbackClock,vfx}]=await Promise.all([
  moduleAt('src/core/contracts.ts'),
  moduleAt('src/core/simulation.ts'),
  moduleAt('src/presentation/feedback.ts'),
  moduleAt('src/presentation/config.ts'),
]);

const sourcePath=path.join(repository,'src/main.ts');
const source=fs.readFileSync(sourcePath,'utf8');
const ast=ts.createSourceFile('main.ts',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TS);
const functionNames=['cancelFeedback','committed'];
const selected=ast.statements.filter((statement:any)=>
  ts.isFunctionDeclaration(statement)&&functionNames.includes(statement.name?.text));
if(selected.length!==functionNames.length){
  throw new Error('Required main.ts functions not located; adapt the observational boundary to the current source.');
}
const actualFunctions=ts.transpileModule(selected.map((statement:any)=>statement.getText(ast)).join('\n'),{
  compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext},
}).outputText;

const core=new Core(execute),epoch=Date.parse('2026-10-21T01:00:00Z');
let sequence=0;
const command=(state:any,kind:string,data:Record<string,unknown>={})=>
  core.apply(state,{id:'review-vfx-'+(++sequence),kind,...data});
const fresh=core.create('sandbox',epoch);
const bought=command(fresh,'buy',{itemId:'off.notebook',quantity:5});
const placed=command(bought,'display',{itemId:'off.notebook',slot:1});
const opened=command(placed,'open');
const sold=command(opened,'settle',{target:epoch+3600000});
const revealed=command(sold,'reveal');

function boundary(){
  const clock=new FeedbackClock();
  const timers=new Map<number,{fn:()=>void;ms:number}>();
  let timerId=0,soundPlays=0;
  const notices:string[]=[];
  const context:any={
    feedback:new FeedbackProjector(),
    u:{slot:1,minimalFX:false,revealFx:false,feedbackKind:'',sound:true},
    world:{
      feedback:(event:any)=>clock.start(event.kind,event.slot,{low:false,minimal:false,reduced:false}),
      skip:()=>clock.cancel(),
    },
    revealTimer:undefined,
    document:{hidden:false},
    matchMedia:()=>({matches:false}),
    clearTimeout:(id:number)=>timers.delete(id),
    setTimeout:(fn:()=>void,ms:number)=>{const id=++timerId;timers.set(id,{fn,ms});return id;},
    t:(key:string)=>key,
    notice:(text:string)=>notices.push(text),
    draw:()=>{},
    catalog,
    saleSound:{currentTime:0,play:()=>{soundPlays++;return Promise.resolve();}},
  };
  vm.createContext(context);
  vm.runInContext(actualFunctions,context,{filename:'main.ts:extracted-presentation-functions'});
  return {clock,timers,context,notices,soundPlays:()=>soundPlays};
}

const observations:Array<Record<string,unknown>>=[];
function observe(id:string,description:string,run:()=>Record<string,unknown>){
  try{observations.push({id,description,status:'observed',...run()});}
  catch(error){observations.push({id,description,status:'probe_error',error:error instanceof Error?error.message:String(error),interpretation:'No PASS/fix conclusion; adapt the mock boundary or inspect this error.'});}
}

observe('F1-hidden-commit-race','A live commit completes after the page-hidden cancellation.',()=>{
  const b=boundary();
  b.context.document.hidden=true;
  b.context.before=opened;b.context.after=sold;
  // Model the real ordering: hidden handler cancels, then the in-flight save
  // resolves and run() invokes the actual committed() function.
  vm.runInContext('cancelFeedback(); committed(before,after,"settle")',b.context);
  return {
    sequence:['document.hidden=true','cancelFeedback()','successful save result reaches committed()'],
    hidden:b.context.document.hidden,
    activeAfterCommit:b.clock.active?.kind??null,
    soundPlays:b.soundPlays(),
    collectedNotices:b.notices,
    originalObservation:'A sale transient is active and one sound playback is requested while hidden.',
    intendedRepair:'Consume the committed event without starting transient FX/audio while hidden; preserve any useful aggregate result separately.',
  };
});

observe('F2-reveal-clock-desync','The UI wall-clock reveal timer ends before the clamped scene clock.',()=>{
  const b=boundary();b.context.before=sold;b.context.after=revealed;
  vm.runInContext('committed(before,after,"reveal")',b.context);
  const intervalMs=100,frames=12;
  for(let frame=0;frame<frames;frame++)b.clock.step(intervalMs);
  const timer=b.timers.get(b.context.revealTimer);
  if(!timer)throw new Error('No UI reveal timer found; inspect whether the implementation intentionally unified its lifecycle.');
  // At 1,200 ms wall time the original 1,100 ms UI callback has elapsed.
  // Invoking that recorded callback models wall time, without sleeping.
  if(timer.ms>intervalMs*frames)throw new Error('Current UI timer exceeds this original reproduction interval; inspect the revised policy.');
  timer.fn();
  return {
    simulatedWallMs:intervalMs*frames,
    frameIntervalMs:intervalMs,
    uiTimerMs:timer.ms,
    uiRevealFlag:b.context.u.revealFx,
    active3DEffect:b.clock.active?.kind??null,
    sceneElapsedMs:b.clock.active?.elapsed??null,
    sceneDurationMs:b.clock.active?.duration??null,
    originalObservation:'UI reveal/Skip flag is false while the reveal clock remains active at 600/1100 ms.',
    intendedRepair:'Keep the Skip control and scene completion on the same presentation lifecycle, or explicitly finish/cancel the scene when the UI timer expires.',
  };
});

observe('F3-mutable-display-target','Current selection changes while a display command is awaiting commit.',()=>{
  // placed contains a committed change to zero-based shelf 1. The user selects
  // zero-based shelf 2 before main.ts reads u.slot during committed().
  const selectionAtCommit=2;
  const event=new FeedbackProjector().project(bought,placed,'display',selectionAtCommit);
  return {
    actualChangedShelfIndices:placed.shelves.map((id:string,index:number)=>id!==bought.shelves[index]?index:null).filter((index:number|null)=>index!==null),
    selectionAtCommit,
    feedbackSlot:event?.slot??null,
    kind:event?.kind??null,
    indices:'Zero-based: actual shelf 1 means player-facing shelf 2; current selection 2 means player-facing shelf 3.',
    originalObservation:'The committed shelf is index 1, but the feedback target is index 2.',
    intendedRepair:'Use the immutable target captured for the successful display command or derive the intended committed target, rather than the later UI selection.',
  };
});

const reviewedFiles=['src/main.ts','src/world.ts','src/presentation/feedback.ts','src/presentation/config.ts'];
const evidence={
  title:'W1.1A VFX observational source-boundary probes',
  generatedAt:new Date().toISOString(),
  repository,
  runtime:process.version,
  scope:'Read-only application-source inspection and Node observations. Real core/FeedbackProjector/FeedbackClock plus extracted original main.ts functions at explicitly mocked presentation boundaries. NOT a browser, WebGL, animation-rendering, FPS, GPU-disposal or physical-device test.',
  acceptanceMeaning:'Exit 0 only means observations were collected. This script does not assert the defects are fixed and does not turn old defective outputs into passing acceptance results.',
  sourceHashes:Object.fromEntries(reviewedFiles.map(relative=>[relative,createHash('sha256').update(fs.readFileSync(path.join(repository,relative))).digest('hex')])),
  fixture:{mode:'sandbox',startUtc:new Date(epoch).toISOString(),item:'off.notebook',quantity:5,displaySlotZeroBased:1,settlementMinutes:60,reportedRevealDurationMs:vfx.reveal.duration},
  mockedBoundaries:['world calls use the real FeedbackClock instead of a renderer','document.hidden','matchMedia(reduced=false)','setTimeout/clearTimeout recorded without real waiting','draw is a no-op','notice strings collected','audio play requests counted, no audio device used'],
  observations,
  limitations:[
    'F1 models the exact ordering of hidden cancellation then successful in-flight commit; it does not measure real IDB race frequency.',
    'F2 simulates 100 ms frame intervals and invokes the actual recorded UI callback; it does not claim a measured device frame rate.',
    'F3 verifies the actual projector target argument mismatch; it does not claim a rendered shelf animation was observed.',
    'Application source, normal/sandbox user saves and the production Site are not modified.',
  ],
};
fs.mkdirSync(path.dirname(outputPath),{recursive:true});
fs.writeFileSync(outputPath,JSON.stringify(evidence,null,2)+'\n','utf8');
for(const observation of observations)console.log(JSON.stringify(observation));
console.log(JSON.stringify({evidence:outputPath,observations:observations.length,acceptancePassClaim:false}));
