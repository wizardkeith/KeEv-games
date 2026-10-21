/** Observational source-boundary probe. Not a browser, WebGL or rendering test.
 * Runs extracted, unedited boot/run/commit lifecycle functions from repo source.
 * TypeScript's CommonJS transform routes boot's dynamic world import to an explicit
 * deferred renderer mock. Uses real Saves + fake IndexedDB; never player storage.
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';

const repo=path.resolve(process.argv[2]??process.cwd());
const output=path.resolve(process.argv[3]??path.join(path.dirname(fileURLToPath(import.meta.url)),'../reviewer_evidence/startup-visibility.json'));
const requireRepo=createRequire(path.join(repo,'package.json'));
const ts=requireRepo('typescript');requireRepo('fake-indexeddb/auto');
const load=(relative:string)=>import(pathToFileURL(path.join(repo,relative)).href);
const [{Core,catalog},{execute},{database,Saves},{FeedbackProjector},{vfx}]=await Promise.all([
 load('src/core/contracts.ts'),load('src/core/simulation.ts'),load('src/platform/storage.ts'),load('src/presentation/feedback.ts'),load('src/presentation/config.ts')
]);
const source=fs.readFileSync(path.join(repo,'src/main.ts'),'utf8');
const ast=ts.createSourceFile('src/main.ts',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TS);
const wanted=['boot','run','committed','cancelFeedback','finishReveal','resume'];
const extracted=ast.statements.filter((n:any)=>ts.isFunctionDeclaration(n)&&wanted.includes(n.name?.text));
if(extracted.length!==wanted.length)throw new Error('Expected actual lifecycle function declarations were not found');
const code=ts.transpileModule(extracted.map((n:any)=>n.getText(ast)).join('\n'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;
const deferred=()=>{let resolve!:(value?:any)=>void;const promise=new Promise<any>(r=>resolve=r);return {promise,resolve};};
const events=()=>{const listeners=new Map<string,Function[]>();return {addEventListener:(name:string,fn:Function)=>listeners.set(name,[...(listeners.get(name)??[]),fn]),emit:(name:string)=>{for(const fn of listeners.get(name)??[])fn();},count:(name:string)=>(listeners.get(name)??[]).length};};

const core=new Core(execute),start=Date.parse('2026-10-21T01:00:00Z');
const db=await database('reviewer-startup-visibility-'+Date.now()),fixtureSaves=new Saves(db,core);
let fixture=await fixtureSaves.loadOrCreate('sandbox',start),seq=0;
for(const [kind,data] of [['identity',{text:'Probe',company:'Probe',logo:'◇'}],['buy',{itemId:'off.notebook',quantity:5}],['display',{itemId:'off.notebook',slot:1}],['open',{}]] as const){
 fixture=await fixtureSaves.command(fixture,{id:'startup-fixture-'+(++seq),kind,...data});
}
const factoryEntered=deferred(),worldReady=deferred(),commandDelivery=deferred();
const docEvents=events(),windowEvents=events(),canvasEvents=events();
let fxCalls=0,audioPlays=0,drawCalls=0;
const world={feedback:()=>{fxCalls++;return true;},update:()=>{},layout:()=>{},skip:()=>{},dispose:()=>{},metrics:()=>({})};
const context:any={
 catalog,vfx,feedback:new FeedbackProjector(),presentationEpoch:0,busy:false,mode:'sandbox',artReview:true,draftPrefix:'reviewer.',state:undefined,saves:undefined,world:undefined,
 u:{slot:1,sound:true,revealFx:false,feedbackKind:'',draft:{},blocking:'',panel:'',worldFailed:false},
 document:{hidden:false,...docEvents,getElementById:()=>undefined},window:windowEvents,canvas:canvasEvents,
 navigator:{userAgent:'source-boundary-probe'},performance:{now:()=>1,getEntriesByType:()=>[]},started:0,readyMs:null,worldReadyMs:null,
 revealTimer:undefined,noticeTimer:undefined,loadCore:async()=>core,database:async()=>db,Saves,
 draftFor:()=>({}),draw:()=>{drawCalls++;},storeDraft:()=>{},notice:()=>{},t:(key:string)=>key,
 fail:(error:unknown)=>{throw error;},clearTimeout:()=>{},setTimeout:()=>0,setInterval:()=>0,
 saleSound:{currentTime:0,play:()=>{audioPlays++;return Promise.resolve();}},console,
 require:(name:string)=>{if(name!=='./world')throw new Error('Unexpected module '+name);return {createWorld:async()=>{factoryEntered.resolve();return await worldReady.promise;}};}
};
vm.createContext(context);vm.runInContext(code,context);
const boot=vm.runInContext('boot()',context);await factoryEntered.promise;
const before=context.state;
context.pending=context.saves.settle(before,before.watermark+3600000,before.watermark+3600000).then(async(result:any)=>{await commandDelivery.promise;return result;});
const run=vm.runInContext('run(async()=>{state=await pending;},"general",undefined,"settle")',context);
const beforeHide={worldAvailable:!!context.world,visibilityListeners:docEvents.count('visibilitychange'),epoch:context.presentationEpoch};
context.document.hidden=true;docEvents.emit('visibilitychange');
context.document.hidden=false;docEvents.emit('visibilitychange');
const afterResumeEpoch=context.presentationEpoch;
worldReady.resolve(world);await boot;
commandDelivery.resolve();await run;
const stored=await fixtureSaves.read('sandbox');
const result={
 kind:'observational-source-boundary',acceptancePassClaim:false,browser:false,webgl:false,
 source:{repo,mainSha256:createHash('sha256').update(source).digest('hex')},
 runtime:{node:process.version,typescript:ts.version},
 description:'An in-flight command begins while the first world is still loading; hide and resume occur before main registers visibility handlers; world readiness then precedes delivery of the successful commit.',
 boundary:{real:'Extracted actual boot/run/committed/cancelFeedback/finishReveal/resume, real core/projector/Saves, fake IndexedDB',mocked:'World module factory/readiness and renderer methods, document/window/canvas event targets, DOM draw, audio, timers, clock metadata',limitations:'No GPU, browser visibility scheduling, actual render, playback or performance evidence. This checks source control-flow wiring, not a new economic failure.'},
 beforeHide,afterResumeEpoch,afterBootVisibilityListeners:docEvents.count('visibilitychange'),
 observation:{documentHidden:context.document.hidden,fxCalls,audioPlays,drawCalls,beforeRevision:before.revision,storedRevision:stored?.revision,beforeSales:before.eventSequence,storedSales:stored?.eventSequence},
 interpretation:'Visibility listeners are installed only after createWorld resolves. In this startup window hide/resume does not increment the presentation epoch, so the late committed result can start one transient and one audio request after returning. The subscription placement also exists in W1.1A; this is a residual startup edge, not a newly introduced regression or duplicated economic commit.'
};
fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(result,null,2)+'\n');db.close();
console.log(JSON.stringify({output,...result.observation,beforeHide,afterResumeEpoch,afterBootVisibilityListeners:result.afterBootVisibilityListeners}));
