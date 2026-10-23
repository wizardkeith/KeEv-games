import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import {execFileSync} from 'node:child_process';
import 'fake-indexeddb/auto';
import {Core,catalog,type Snapshot} from '../src/core/contracts';
import {execute} from '../src/core/simulation';
import {database,Saves} from '../src/platform/storage';
import {nativeContext} from './native-context';
import {FeedbackProjector} from '../src/presentation/feedback';
import {vfx} from '../src/presentation/config';
import {day1Text} from '../src/narrative/day1-copy';
import {shopGuidance,shopReadiness,nextSandboxOpening,guidanceText} from '../src/ui/shop-guidance';
import {NativeCustomerRoutes} from '../src/presentation/native-routes';
const core=new Core(execute),start=Date.parse('2026-10-21T01:00:00Z');let id=0;
function extract(code:string,names:string[]){const ast=ts.createSourceFile('main.ts',code,ts.ScriptTarget.Latest,true);const nodes=ast.statements.filter((n):n is ts.FunctionDeclaration=>ts.isFunctionDeclaration(n)&&!!n.name&&names.includes(n.name.text));assert.equal(nodes.length,names.length);return nodes.map(n=>n.getText(ast)).join('\n');}
async function harness(source=fs.readFileSync('src/main.ts','utf8')){
 const db=await database('v31-offline-'+(++id)),saves=new Saves(db,core);let s=await saves.loadOrCreate('normal',start);
 for(const command of [{kind:'buy',itemId:'off.notebook',quantity:20},{kind:'display',itemId:'off.notebook',slot:1},{kind:'open'}])s=await saves.command(s,{id:'fixture-'+(++id),...command});
 const routes=new NativeCustomerRoutes();for(let n=0;n<600;n++)routes.tick(1/60,{open:true,visible:true,reduceMotion:false,capacity:2});const positions=routes.tick(0,{open:true,visible:true,reduceMotion:false,capacity:2}).actors.map(a=>[a.x,a.z]);
 let writes=0,fx=0,audio=0,resets=0;const notices:string[]=[],errors:unknown[]=[];const c:any={...nativeContext(),state:s,mode:'normal',modeKey:'review-mode',storyReplay:false,draftFor:()=>({}),localStorage:{setItem:()=>{}},saves:{loadOrCreate:saves.loadOrCreate.bind(saves),settle:(...args:Parameters<Saves['settle']>)=>{writes++;return saves.settle(...args);}},busy:false,revealTimer:undefined,presentationEpoch:0,u:{slot:1,minimalFX:false,sound:true,blocking:'',draft:{}},catalog,t:(key:string)=>key,feedback:new FeedbackProjector(),vfx,locale:'en',day1Text,document:{hidden:false},Date:{now:()=>start+10*60000,parse:Date.parse},draw:()=>{},syncStory:async()=>{},storeDraft:()=>{},draftPrefix:'review.',notice:(text:string)=>notices.push(text),fail:(e:unknown)=>errors.push(e),clearTimeout:()=>{},setTimeout:()=>0,saleSound:{currentTime:0,play:()=>{audio++;return Promise.resolve();}},world:{feedback:()=>{fx++;return true;},baseline:()=>{resets++;routes.reset();},skip:()=>routes.cancelPresentation()}};
 c.nativePresentation.baseline(s,0);vm.createContext(c);vm.runInContext(ts.transpileModule(extract(source,['resume','run','committed','cancelFeedback','finishReveal','switchMode'])+'\nconst actualRun=run;run=(...args:any[])=>lastRun=actualRun(...args);',{compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText,c);
 return {db,saves,c,s,routes,positions,notices,errors,counts:()=>({writes,fx,audio,resets})};
}
test('reproduce v10 return-started settle bug; v3.1 return consumes same stream without service, scene reset or replay',async()=>{
 const old=await harness(execFileSync('git',['show','3869ef9aefcdc08c0aede158ec5276df89f7cbae:src/main.ts'],{encoding:'utf8'}));old.c.resume();await old.c.lastRun;assert.equal(old.c.nativePresentation.current.cue.kind,'sale');assert.deepEqual(old.errors,[]);assert.equal(old.counts().fx,1);old.db.close();
 const f=await harness(),stream=f.c.nativePresentation.metrics().stream;f.c.document.hidden=true;f.c.returnPending=true;f.c.cancelFeedback();f.c.document.hidden=false;f.c.resume('return');f.c.resume('return');await f.c.lastRun;
 const stored=(await f.saves.read('normal'))!;assert.ok(stored.eventSequence>f.s.eventSequence);assert.equal(stored.watermark,start+600000);assert.deepEqual(f.counts(),{writes:1,fx:0,audio:0,resets:0});assert.equal(f.c.nativePresentation.current,undefined);assert.equal(f.c.nativePresentation.metrics().stream,stream);assert.equal(f.c.nativePresentation.metrics().consumedRevision,stored.revision);assert.deepEqual(f.routes.tick(0,{open:true,visible:true,reduceMotion:false,capacity:2}).actors.map(a=>[a.x,a.z]),f.positions);assert.ok(f.notices[0].includes('while you were away'));assert.deepEqual(f.errors,[]);
 f.c.committed(f.s,stored,'settle',1,f.c.presentationEpoch);assert.equal(f.counts().fx,0,'acknowledged offline revision cannot replay as another cause');f.db.close();
});
test('continuously visible timer settlement retains live cue; foreign mode/import remain true baselines',async()=>{
 const f=await harness();f.c.resume('timer');await f.c.lastRun;assert.deepEqual(f.errors,[]);assert.equal(f.counts().fx,1);assert.equal(f.c.nativePresentation.current.cue.kind,'sale');const s=f.c.state,next=await f.saves.settle(s,s.watermark+60000,s.watermark+60000);f.c.committed(s,next,'catchup',1,0);assert.equal(f.counts().resets,0,'explicit offline catchup also preserves scene');assert.equal(f.c.nativePresentation.current,undefined);f.c.committed(next,next,'import',1,0);assert.equal(f.c.nativePresentation.current,undefined);assert.equal(f.counts().resets,1);f.db.close();
});
test('five-language hours guide uses committed Tokyo time and four real readiness conditions; sandbox advance preserves both slots',async()=>{
 const f=await harness();const night=await f.saves.settle(f.s,start+12*3600000,start+12*3600000);assert.equal(shopReadiness(night).time,false);
 for(const locale of ['zh-HK','en','ja','th','zh-CN']){const html=shopGuidance(night,locale);assert.ok(html.includes('22:00'));assert.ok(html.includes('10:00–20:00'));assert.ok(html.includes('sandbox-enter'));assert.ok(!html.includes('{time}'));assert.ok(guidanceText(locale,'offline',{units:5}).includes('5'));}
 let sandbox=await f.saves.loadOrCreate('sandbox',start);sandbox=await f.saves.command(sandbox,{id:'sandbox-stock',kind:'buy',itemId:'off.tea',quantity:3});sandbox=await f.saves.settle(sandbox,start+12*3600000,start+12*3600000);
 assert.deepEqual(await f.saves.loadOrCreate('sandbox',start),sandbox,'existing sandbox is never reset to initial10am');const target=nextSandboxOpening(sandbox);assert.equal(target,start+24*3600000);const advanced=await f.saves.settle(sandbox,target,target);assert.equal(advanced.inventory['off.tea'].stock,3);assert.ok(shopReadiness(advanced).time);assert.equal(nextSandboxOpening(advanced),advanced.watermark);assert.deepEqual(await f.saves.read('normal'),night);assert.throws(()=>nextSandboxOpening(night),/sandbox_only/);f.db.close();
});

test('returning from a different mode reconciles old Normal time as a baseline, not a new live purchase scene',async()=>{
 const f=await harness();await vm.runInContext("run(async()=>{await switchMode('sandbox');},'general',undefined,'mode')",f.c);assert.equal(f.c.mode,'sandbox');assert.deepEqual(await f.saves.read('normal'),f.s);
 await vm.runInContext("run(async()=>{await switchMode('normal');},'general',undefined,'mode')",f.c);assert.equal(f.c.mode,'normal');const resets=f.counts().resets;f.c.resume('timer');await f.c.lastRun;assert.ok(f.c.state.eventSequence>f.s.eventSequence);assert.equal(f.c.nativePresentation.current,undefined);assert.equal(f.counts().fx,0);assert.equal(f.counts().resets,resets);assert.deepEqual(f.errors,[]);f.db.close();
});
