import {day1Text} from '../src/narrative/day1-copy';
import {Day1GestureClock} from '../src/presentation/day1';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import 'fake-indexeddb/auto';
import {Core,catalog} from '../src/core/contracts';
import {execute} from '../src/core/simulation';
import {database,Saves} from '../src/platform/storage';
import {FeedbackProjector} from '../src/presentation/feedback';
import {vfx} from '../src/presentation/config';
// Actual boot wiring and commit path, real Saves/fake IDB. Only browser/world,
// timers, audio and DOM draw are mocked; no GPU or browser-timing claim.
const source=fs.readFileSync('src/main.ts','utf8'),ast=ts.createSourceFile('main.ts',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TS);
const wanted=['boot','run','committed','cancelFeedback','finishReveal','resume'];
const extracted=ast.statements.filter(n=>ts.isFunctionDeclaration(n)&&n.name&&wanted.includes(n.name.text));assert.equal(extracted.length,wanted.length);
const code=ts.transpileModule(extracted.map(n=>n.getText(ast)).join('\n'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;
function deferred<T>(){let resolve!:(x:T)=>void,reject!:(e:Error)=>void;const promise=new Promise<T>((a,b)=>{resolve=a;reject=b;});return {promise,resolve,reject};}
function events(){const listeners=new Map<string,(()=>void)[]>();return {addEventListener:(name:string,fn:()=>void)=>listeners.set(name,[...(listeners.get(name)??[]),fn]),emit:(name:string)=>{for(const fn of listeners.get(name)??[])fn();},count:(name:string)=>listeners.get(name)?.length??0};}
const core=new Core(execute),start=Date.parse('2026-10-21T01:00:00Z');let sequence=0;
async function fixture(){
 const db=await database('closeout-startup-'+(++sequence)),saves=new Saves(db,core);let state=await saves.loadOrCreate('sandbox',start);
 for(const [kind,data] of [['identity',{text:'Review',company:'Review',logo:'◇'}],['buy',{itemId:'off.notebook',quantity:5}],['display',{itemId:'off.notebook',slot:1}],['open',{}]] as const)state=await saves.command(state,{id:'fixture-'+(++sequence),kind,...data});
 const loadingCore=deferred<Core>(),factoryEntered=deferred<void>(),worldReady=deferred<any>(),delivery=deferred<void>();
 const doc=events(),win=events(),canvas=events();let fx=0,audio=0,draws=0,saveCalls=0;const failures:unknown[]=[];
 const world={feedback:()=>{fx++;return true;},update:()=>{},layout:()=>{},skip:()=>{},dispose:()=>{},metrics:()=>({})};
 const c:any={catalog,vfx,day1Text,locale:'en',syncStory:async()=>{},feedback:new FeedbackProjector(),presentationEpoch:0,busy:false,mode:'sandbox',artReview:true,reviewDatabase:'day1-fixture',draftPrefix:'review.',state:undefined,saves:undefined,world:undefined,u:{slot:1,sound:true,revealFx:false,feedbackKind:'',draft:{},blocking:'',panel:'',worldFailed:false},document:{hidden:false,...doc,getElementById:()=>undefined},window:win,canvas,navigator:{userAgent:'boot-source-test'},performance:{now:()=>1,getEntriesByType:()=>[]},started:0,readyMs:null,worldReadyMs:null,revealTimer:undefined,noticeTimer:undefined,loadCore:()=>loadingCore.promise,database:async()=>db,Saves,draftFor:()=>({}),draw:()=>{if(c.state){assert.equal(doc.count('visibilitychange'),1,'one listener before every actionable draw');draws++;}},storeDraft:()=>{},notice:()=>{},t:(key:string)=>key,fail:(e:unknown)=>{throw e;},clearTimeout:()=>{},setTimeout:()=>0,setInterval:()=>0,saleSound:{currentTime:0,play:()=>{audio++;return Promise.resolve();}},console:{error:(e:unknown)=>failures.push(e)},require:(name:string)=>{assert.equal(name,'./world');return {createWorld:async()=>{factoryEntered.resolve();return worldReady.promise;}};}};
 vm.createContext(c);vm.runInContext(code,c);const boot=vm.runInContext('boot()',c);
 assert.equal(doc.count('visibilitychange'),1,'listener is wired before core/state/world await');assert.equal(win.count('focus'),1);assert.equal(c.state,undefined);
 // Early normal-mode resume must not access an uninitialized state/Saves.
 c.mode='normal';assert.doesNotThrow(()=>doc.emit('visibilitychange'));assert.doesNotThrow(()=>win.emit('focus'));assert.equal(c.busy,false);c.mode='sandbox';
 loadingCore.resolve(core);await factoryEntered.promise;const before=c.state;
 const actual=c.saves.settle(before,before.watermark+3600000,before.watermark+3600000);saveCalls++;
 c.pending=actual.then(async(result:any)=>{await delivery.promise;return result;});const operation=vm.runInContext('run(async()=>{state=await pending;},"general",undefined,"settle")',c);
 return {c,db,saves,doc,win,world,worldReady,delivery,boot,operation,before,failures,fx:()=>fx,audio:()=>audio,draws:()=>draws,saveCalls:()=>saveCalls};
}
test('boot wires cancellation before UI: deferred-world hide/resume consumes one commit without replay; visible completion still feeds back',async()=>{
 for(const hide of [true,false]){
  const b=await fixture();assert.equal(b.c.world,undefined);const epoch=b.c.presentationEpoch;
  if(hide){b.c.document.hidden=true;b.doc.emit('visibilitychange');assert.equal(b.c.presentationEpoch,epoch+1);b.c.document.hidden=false;b.doc.emit('visibilitychange');}
  b.worldReady.resolve(b.world);await b.boot;assert.equal(b.doc.count('visibilitychange'),1);assert.equal(b.win.count('focus'),1);
  b.delivery.resolve();await b.operation;const stored=(await b.saves.read('sandbox'))!;
  assert.equal(stored.revision,b.before.revision+1);assert.equal(stored.eventSequence-b.before.eventSequence,5);assert.equal(b.saveCalls(),1);assert.equal(b.fx(),hide?0:1);assert.equal(b.audio(),hide?0:1);assert.equal(b.c.state.revision,stored.revision);assert.deepEqual(b.failures,[]);
  b.c.committed(b.before,stored,'settle',1,b.c.presentationEpoch);assert.equal(b.fx(),hide?0:1);assert.equal(b.audio(),hide?0:1);b.db.close();
 }
});
test('hidden during deferred first world then world failure keeps usable committed state and never starts stale FX/audio',async()=>{
 const b=await fixture();b.c.document.hidden=true;b.doc.emit('visibilitychange');assert.equal(b.c.presentationEpoch,1);
 b.worldReady.reject(Error('WebGL unavailable fixture'));await b.boot;assert.equal(b.c.u.worldFailed,true);assert.equal(b.c.world,undefined);assert.equal(b.failures.length,1);
 b.delivery.resolve();await b.operation;const stored=(await b.saves.read('sandbox'))!;
 assert.equal(stored.revision,b.before.revision+1);assert.equal(stored.eventSequence-b.before.eventSequence,5);assert.equal(b.saveCalls(),1);assert.equal(b.fx(),0);assert.equal(b.audio(),0);assert.equal(b.c.u.revealFx,false);assert.ok(b.draws()>0);
 b.c.document.hidden=false;b.doc.emit('visibilitychange');assert.equal(b.doc.count('visibilitychange'),1);assert.equal(b.win.count('focus'),1);b.c.committed(b.before,stored,'settle',1,b.c.presentationEpoch);assert.equal(b.fx(),0);assert.equal(b.audio(),0);assert.equal((await b.saves.read('sandbox'))!.revision,stored.revision);b.db.close();
});
