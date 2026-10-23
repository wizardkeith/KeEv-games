import {capturePurchase,newStockWorkspace} from '../src/ui/stock-state';
import {nativeContext} from './native-context';
import {day1Text} from '../src/narrative/day1-copy';
import {Day1GestureClock} from '../src/presentation/day1';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import 'fake-indexeddb/auto';
import {Core,catalog,type Snapshot} from '../src/core/contracts';
import {purchaseCost} from '../src/core/recovery';
import {execute} from '../src/core/simulation';
import {database,Saves} from '../src/platform/storage';
import {FeedbackProjector} from '../src/presentation/feedback';
import {FeedbackClock,vfx,motionAllowed} from '../src/presentation/config';
// Execute the real main commit/run/click boundary and real world feedback methods.
// Only browser DOM/audio/timers/rendering are mocked. Savings below use real Saves + fake IDB.
const parse=(path:string)=>ts.createSourceFile(path,fs.readFileSync(path,'utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TS);
const main=parse('src/main.ts'),scene=parse('src/world.ts');
function functions(file:ts.SourceFile,names:string[]){const found:string[]=[];const visit=(n:ts.Node)=>{if(ts.isFunctionDeclaration(n)&&n.name&&names.includes(n.name.text))found.push(n.getText(file));ts.forEachChild(n,visit);};visit(file);assert.equal(found.length,names.length);return found.join('\n');}
function methods(names:string[]){const found:string[]=[];const visit=(n:ts.Node)=>{if(ts.isMethodDeclaration(n)&&names.includes(n.name.getText(scene)))found.push(n.getText(scene));ts.forEachChild(n,visit);};visit(scene);assert.equal(found.length,names.length);return found.join(',\n');}
let click='';for(const statement of main.statements){if(ts.isExpressionStatement(statement)&&ts.isCallExpression(statement.expression)){const c=statement.expression;if(c.expression.getText(main)==='app.addEventListener'&&c.arguments[0]?.getText(main)==="'click'")click=c.arguments[1].getText(main);}}
assert.ok(click,'actual click handler found');
const script=ts.transpileModule(functions(main,['finishReveal','cancelFeedback','committed','run','act'])+'\n'+functions(scene,['finishFeedback','advanceFeedback'])+`\nworld={${methods(['feedback','skip','skipReveal','quality','minimal'])}};\nclickHandler=${click};\nconst originalRun=run;run=(...args:any[])=>lastRun=originalRun(...args);`,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
const core=new Core(execute),epoch=Date.parse('2026-10-21T01:00:00Z');let id=0;
const apply=(s:Snapshot,kind:string,data={})=>({...core.apply(s,{id:'fx-fixture-'+(++id),kind,...data}),revision:s.revision+1});
function saleFixture(){let s=core.create('sandbox',epoch);s=apply(s,'buy',{itemId:'off.notebook',quantity:5});s=apply(s,'display',{itemId:'off.notebook',slot:1});return apply(s,'open');}
function deferred<T>(){let resolve!:(x:T)=>void;const promise=new Promise<T>(r=>resolve=r);return {promise,resolve};}
function boundary(state= saleFixture()){
 const timers=new Map<number,{fn:()=>void;ms:number}>(),clock=new FeedbackClock(),notices:string[]=[],errors:unknown[]=[];let timerId=0,plays=0,fxCalls=0;
 const c:any={...nativeContext(),capturePurchase,newStockWorkspace,state,clock,gestureClock:new Day1GestureClock(),syncStory:async()=>{},day1Text,locale:'en',vfx,motionAllowed,feedback:new FeedbackProjector(),catalog,presentationEpoch:0,busy:false,mode:'sandbox',draftPrefix:'qa.',disposed:false,effectiveQuality:'high',quality:'auto',frames:[],last:undefined,minimalFX:false,reduced:{matches:false},document:{hidden:false},revealTimer:undefined,u:{slot:1,sound:true,minimalFX:false,revealFx:false,feedbackKind:'',draft:{},formError:'',formField:'',blocking:''},draw:()=>{},storeDraft:()=>{},fail:(e:unknown)=>errors.push(e),notice:(s:string)=>notices.push(s),t:(key:string)=>key,commandId:()=>`integration-${++id}`,clearTimeout:(n:number)=>timers.delete(n),setTimeout:(fn:()=>void,ms:number)=>{timers.set(++timerId,{fn,ms});return timerId;},saleSound:{currentTime:0,play:()=>{plays++;return Promise.resolve();}},onFeedbackEnd:()=>c.finishReveal(),setQuality:(q:string)=>c.effectiveQuality=q};
 vm.createContext(c);vm.runInContext(script,c);const realFeedback=c.world.feedback;c.world.feedback=(e:unknown)=>{fxCalls++;return realFeedback(e);};
 const click=(action:string,data:Record<string,string>={})=>{c.clickHandler({target:{closest:()=>({disabled:false,dataset:{action,...data}})}});return c.lastRun as Promise<void>;};
 const reveal=()=>{const before=c.state;c.state=apply(before,'reveal');c.committed(before,c.state,'reveal',1,c.presentationEpoch);return c.state as Snapshot;};
 return {c,timers,clock,notices,errors,click,reveal,plays:()=>plays,fxCalls:()=>fxCalls,fireTimer(){const timer=timers.get(c.revealTimer);assert.ok(timer,'live reveal timer');assert.equal(timer.ms,vfx.reveal.duration);timer.fn();},setSale(){const before=c.state;c.state=apply(before,'settle',{target:epoch+3600000});return {before,after:c.state as Snapshot};}};
}

test('F1 deferred actual Saves result after hidden cancellation commits once without FX/audio or resume replay',async()=>{
 const db=await database('w11a1-hidden-'+(++id)),saves=new Saves(db,core);let before=await saves.loadOrCreate('sandbox',epoch);
 for(const [kind,data] of [['buy',{itemId:'off.notebook',quantity:5}],['display',{itemId:'off.notebook',slot:1}],['open',{}]] as const)before=await saves.command(before,{id:'setup-'+(++id),kind,...data});
 for(const resumeBeforeResolve of [false,true]){
  if(resumeBeforeResolve)before=await saves.command(before,{id:'restock-'+(++id),kind:'buy',itemId:'off.notebook',quantity:5});
  const b=boundary(before),gate=deferred<void>();let commits=0;const actual=saves.settle(before,before.watermark+3600000,before.watermark+3600000);commits++;
  b.c.pending=actual.then(async s=>{await gate.promise;return s;});const pending=vm.runInContext('run(async()=>{state=await pending;},"general",undefined,"settle")',b.c);
  b.c.document.hidden=true;b.c.cancelFeedback();if(resumeBeforeResolve)b.c.document.hidden=false;gate.resolve();await pending;
  const stored=(await saves.read('sandbox'))!;assert.equal(commits,1);assert.equal(stored.revision,before.revision+1);assert.equal(b.c.state.eventSequence,stored.eventSequence);assert.ok(stored.eventSequence>before.eventSequence);assert.equal(b.fxCalls(),0);assert.equal(b.plays(),0);assert.equal(b.clock.active,undefined);assert.equal(b.c.nativePresentation.metrics().consumedRevision,stored.revision);assert.equal(b.c.u.revealFx,false);assert.deepEqual(b.errors,[]);
  b.c.document.hidden=false;b.c.committed(before,stored,'settle',1,b.c.presentationEpoch);assert.equal(b.fxCalls(),0);assert.equal(b.plays(),0);before=stored;
 }
 db.close();
});
test('F1 world feedback rejects hidden/disposed callers independently of the UI guard',()=>{
 const b=boundary(),event={id:'late',kind:'sale',slot:1,units:1,sold:1};b.c.document.hidden=true;assert.equal(b.c.world.feedback(event),false);assert.equal(b.clock.active,undefined);b.c.document.hidden=false;b.c.disposed=true;assert.equal(b.c.world.feedback(event),false);assert.equal(b.clock.active,undefined);
});
test('F2 slow frames retain Skip until shared UI deadline synchronously cancels scene; normal completion also clears UI',()=>{
 const b=boundary();b.setSale();const saved=b.reveal();for(let i=0;i<12;i++)b.c.advanceFeedback(100);
 assert.equal(b.clock.active?.elapsed,600);assert.equal(b.c.u.revealFx,true);b.fireTimer();assert.equal(b.clock.active,undefined);assert.equal(b.c.u.revealFx,false);assert.equal(b.c.state.revealed,true);assert.equal(b.c.state.revision,saved.revision);
 const normal=boundary();normal.setSale();normal.reveal();for(let i=0;i<70;i++)normal.c.advanceFeedback(16);assert.equal(normal.clock.active,undefined);assert.equal(normal.c.u.revealFx,false);assert.equal(normal.timers.size,0);
 const timerFirst=boundary();timerFirst.setSale();timerFirst.reveal();timerFirst.fireTimer();assert.equal(timerFirst.clock.active,undefined);assert.equal(timerFirst.c.u.revealFx,false);
});
test('F2 skip, replacement, hidden/mode cancellation and failed scene preserve committed reveal without orphaned Skip',()=>{
 for(const end of ['skip','hidden','mode','context-loss','replacement']){
  const b=boundary();b.setSale();const saved=b.reveal();assert.equal(b.c.u.revealFx,true);
  const staleTimer=b.timers.get(b.c.revealTimer)!.fn;
  if(end==='skip')b.click('skip-reveal');else if(end==='replacement'){const next=apply(saved,'buy',{itemId:'off.pencil',quantity:1});b.c.state=next;b.c.committed(saved,next,'buy',1,b.c.presentationEpoch);}else{if(end==='hidden')b.c.document.hidden=true;b.c.cancelFeedback();if(end==='context-loss'){b.clock.dispose();b.c.world=undefined;}}
  if(end==='replacement'){staleTimer();assert.equal(b.clock.active?.kind,'stock','cancelled reveal timer cannot cancel replacement');}
  assert.equal(b.c.u.revealFx,false,end);assert.equal(b.c.state.revealed,true,end);assert.equal(b.timers.size,0,end);if(end!=='replacement')assert.equal(b.clock.active,undefined,end);
 }
 const failed=boundary();failed.setSale();failed.c.world=undefined;const saved=failed.reveal();assert.equal(failed.c.u.revealFx,false);assert.equal(failed.timers.size,0);assert.equal(saved.revealed,true);
});
test('F2 decorative discovery completes statically in Low, Minimal and Reduce Motion independently of native service',()=>{
 for(const policy of ['low','minimal','reduced']){
  const b=boundary();b.setSale();if(policy==='low')b.c.world.quality('low');if(policy==='minimal')b.c.world.minimal(true);if(policy==='reduced')b.c.reduced.matches=true;b.reveal();assert.equal(b.c.u.revealFx,false,policy);assert.equal(b.clock.active,undefined,policy);assert.equal(b.timers.size,0,policy);
  const changed=boundary();changed.setSale();changed.reveal();if(policy==='low')changed.c.effectiveQuality='low';if(policy==='minimal')changed.c.minimalFX=true;if(policy==='reduced')changed.c.reduced.matches=true;changed.c.advanceFeedback(16);assert.equal(changed.c.u.revealFx,false);assert.equal(changed.clock.active,undefined);assert.equal(changed.timers.size,0);
 }
});
test('F3 actual display click captures shelf 2 across deferred Saves while selection changes to shelf 3',async()=>{
 const db=await database('w11a1-target-'+(++id)),saves=new Saves(db,core);let before=await saves.loadOrCreate('sandbox',epoch);before=await saves.command(before,{id:'stock-'+(++id),kind:'buy',itemId:'off.notebook',quantity:5});
 const b=boundary(before),gate=deferred<void>();let calls=0,slot=-1;b.c.saves={command:(s:Snapshot,c:any,...rest:any[])=>{calls++;slot=c.slot;return saves.command(s,c,rest[0],rest[1]).then(async result=>{await gate.promise;return result;});}};
 const pending=b.click('display',{id:'off.notebook'});b.c.u.slot=2;gate.resolve();await pending;
 assert.deepEqual(b.errors,[]);assert.equal(calls,1);assert.equal(slot,1);assert.equal(b.c.state.shelves[1],'off.notebook');assert.equal(b.c.state.shelves[2],'');assert.equal(b.c.u.slot,2);assert.equal(b.clock.active?.slot,1);assert.equal(b.c.nativePresentation.current.cue.slot,1);assert.ok(b.notices.some(n=>n==='placed 2 · replacedNote'));
 assert.equal(new FeedbackProjector().project(before,b.c.state,'display',2)?.slot,1,'actual transition also defeats stale selection argument');
 const noOp={...core.apply(b.c.state,{id:'same-'+(++id),kind:'display',slot:1,itemId:'off.notebook'}),revision:b.c.state.revision+1};assert.equal(new FeedbackProjector().project(b.c.state,noOp,'display',2),undefined);
 const failed=boundary(before);failed.c.saves={command:()=>Promise.reject(Error('stale'))};await failed.click('display',{id:'off.notebook'});assert.equal(failed.errors.length,1);assert.equal(failed.fxCalls(),0);assert.equal(failed.clock.active,undefined);assert.equal(failed.c.state.revision,before.revision);
 const duplicate={...core.apply(b.c.state,{id:b.c.state.commandIds.at(-1),kind:'display',itemId:'off.notebook',slot:1}),revision:b.c.state.revision+1};assert.equal(new FeedbackProjector().project(b.c.state,duplicate,'display',2),undefined);
 db.close();
});
test('diagnostics separate historical world readiness from current availability after context loss',()=>{
 let initializer='';const visit=(n:ts.Node)=>{if(ts.isPropertyAssignment(n)&&n.name.getText(main)==='littleShopDiagnostics')initializer=n.initializer.getText(main);ts.forEachChild(n,visit);};visit(main);assert.ok(initializer);
 const c:any={...nativeContext(),artReview:false,readyMs:20,worldReadyMs:400,world:{metrics:()=>({})},u:{worldFailed:false},navigator:{userAgent:'test'},performance:{getEntriesByType:()=>[]}};vm.createContext(c);
 const code=ts.transpileModule('diagnostics='+initializer,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;vm.runInContext(code,c);
 assert.equal(c.diagnostics().worldEverReady,true);assert.equal(c.diagnostics().worldAvailable,true);c.world=undefined;c.u.worldFailed=true;const lost=c.diagnostics();assert.equal(lost.worldEverReady,true);assert.equal(lost.worldAvailable,false);assert.equal(lost.worldReady,false);assert.equal(lost.startupMs,400);
});
test('native service survives repeated Minimal setter, quality change and decorative reveal deadline; explicit skip still cleans it',()=>{
 const b=boundary(),sale=b.setSale();b.c.committed(sale.before,sale.after,'advance',1,0);assert.equal(b.c.nativePresentation.current.cue.kind,'sale');
 b.reveal();b.fireTimer();assert.equal(b.clock.active,undefined);assert.equal(b.c.nativePresentation.current.cue.kind,'sale','decorative timeout cannot cancel the packing channel');
 const frame=b.c.nativePresentation.current;for(let i=0;i<30;i++)b.c.world.minimal(true);b.c.world.quality('low');assert.deepEqual(b.c.nativePresentation.current,frame);
 b.c.world.skip();assert.equal(b.c.nativePresentation.current,undefined);assert.equal(b.c.nativePresentation.metrics().batches,0);
});
test('actual main act captures accepted buy quantity when the same successful IDB command first settles sales',async()=>{
 const db=await database('native-main-buy-'+(++id)),saves=new Saves(db,core);let before=await saves.loadOrCreate('normal',epoch);
 for(const [kind,data] of [['buy',{itemId:'off.notebook',quantity:5}],['display',{itemId:'off.notebook',slot:1}],['open',{}]] as const)before=await saves.command(before,{id:'main-fixture-'+(++id),kind,...data});
 const b=boundary(before);b.c.saves=saves;b.c.purchaseCost=purchaseCost;b.c.u.draft.quantities={'off.notebook':'3'};b.c.mode='normal';b.c.Date={now:()=>epoch+3600000};
 await b.click('buy',{id:'off.notebook'});assert.deepEqual(b.errors,[]);const stored=(await saves.read('normal'))!;assert.equal(stored.inventory['off.notebook'].stock,3);assert.equal(stored.eventSequence-before.eventSequence,5);
 assert.equal(b.c.nativePresentation.current.cue.kind,'stock');assert.equal(b.c.nativePresentation.current.cue.quantity,3);assert.ok(b.notices.some(text=>text.includes('sold 5')&&text.includes('bought ×3')));
 const policy={visible:true,reduceMotion:false,nativeMotion:true,decorativeMotion:true,customerCapacity:2,detailedIdle:true};for(let n=0;n<41;n++)b.c.nativePresentation.tick(.05,policy);assert.equal(b.c.nativePresentation.current.cue.kind,'sale');assert.equal(b.c.nativePresentation.current.cue.soldUnits,5);db.close();
});
