import test from 'node:test';
import assert from 'node:assert/strict';
import 'fake-indexeddb/auto';
import {Core,type Command} from '../src/core/contracts';
import {execute} from '../src/core/simulation';
import {Saves,database} from '../src/platform/storage';
import {NativeCommitPresentation} from '../src/presentation/native-commits';
import {resolveMotionPolicy,makeStreamKey,NativeServiceSequencer,projectConfirmedCommit,sampleIdle,sampleWalk,advanceVisibleTime} from '../src/presentation/native-motion';
const core=new Core(execute),start=Date.parse('2026-10-21T01:00:00Z'),high=resolveMotionPolicy({quality:'high',minimalFx:false,reduceMotion:false,visible:true});let seq=0;
async function fixture(){const db=await database('native-commit-'+(++seq)),saves=new Saves(db,core);let s=await saves.loadOrCreate('sandbox',start);for(const c of [{kind:'buy',itemId:'off.tea',quantity:10},{kind:'display',itemId:'off.tea',slot:0},{kind:'open'}])s=await saves.command(s,{id:'setup-'+(++seq),...c});return {db,saves,s};}
test('real buy commit settles sold units and accepts captured quantity independently of net inventory; bounded cues retain both results',async()=>{
 const f=await fixture(),p=new NativeCommitPresentation();p.baseline(f.s,7);
 const c={id:'accepted-buy',kind:'buy',itemId:'off.tea',quantity:3};
 const after=await f.saves.command(f.s,c,start+3600000,start+3600000);assert.equal(after.eventSequence-f.s.eventSequence,6);assert.equal(after.inventory['off.tea'].stock-f.s.inventory['off.tea'].stock,-3);
 const observed=p.commit(f.s,after,'buy',7,c,high)!;assert.equal(observed.summary?.soldUnits,6);assert.deepEqual(observed.summary?.accepted,{kind:'stock',commandId:c.id,itemId:'off.tea',quantity:3});assert.equal(p.current?.cue.kind,'stock');
 for(let i=0;i<41;i++)p.tick(.05,high);assert.equal(p.current?.cue.kind,'sale');assert.equal((p.current?.cue as {soldUnits:number}).soldUnits,6);
 const stored=await f.saves.read('sandbox');for(let i=0;i<200;i++)p.tick(.05,high);assert.deepEqual(await f.saves.read('sandbox'),stored,'animation completion never writes economic state');assert.equal(p.current,undefined);
 assert.equal(p.commit(f.s,after,'buy',7,c,high)?.reason,'old-revision');f.db.close();
});
test('actual duplicate/no-op/aborted commands do not fake success and display binds captured target despite simultaneous sale',async()=>{
 const f=await fixture(),p=new NativeCommitPresentation();p.baseline(f.s,0);
 const buy={id:'second-stock',kind:'buy',itemId:'off.notebook',quantity:3};let before=await f.saves.command(f.s,buy);p.baseline(before,0);
 const display={id:'display-captured',kind:'display',itemId:'off.notebook',slot:2};const after=await f.saves.command(before,display,start+3600000,start+3600000);
 const summary=p.commit(before,after,'display',0,display,high)!.summary!;assert.ok(summary.soldUnits>0);assert.equal(summary.accepted?.kind,'display');assert.equal((summary.accepted as {slot:number}).slot,2);
 before=after;const same={...display,id:'no-change'};const noOp=await f.saves.command(before,same);assert.equal(p.commit(before,noOp,'display',0,same,high)?.summary?.accepted,undefined);
 const duplicate=await f.saves.command(noOp,display);assert.equal(p.commit(noOp,duplicate,'display',0,display,high)?.summary?.accepted,undefined);
 const watermark=p.metrics().consumedRevision;await assert.rejects(f.saves.command(before,{...buy,id:'stale-reject'}),/stale/);assert.equal(p.metrics().consumedRevision,watermark);f.db.close();
});
test('hidden/stale epochs consume before playback; baseline and replaced save incarnation never replay old callbacks',async()=>{
 const f=await fixture(),p=new NativeCommitPresentation();p.baseline(f.s,11);p.invalidate(12);
 const after=await f.saves.settle(f.s,start+3600000,start+3600000);assert.equal(p.commit(f.s,after,'settle',11,undefined,high)?.reason,'stale-epoch');assert.equal(p.current,undefined);
 assert.equal(p.commit(f.s,after,'settle',12,undefined,high)?.reason,'old-revision');
 const restocked=await f.saves.command(after,{id:'hidden-stock',kind:'buy',itemId:'off.tea',quantity:3});const hidden={...high,visible:false,nativeMotion:false};assert.equal(p.commit(after,restocked,'buy',12,{id:'hidden-stock',kind:'buy',itemId:'off.tea',quantity:3},hidden)?.reason,'hidden');assert.equal(p.current,undefined);
 p.baseline(restocked,12);assert.equal(p.commit(after,restocked,'reload',12,undefined,high),undefined);assert.equal(p.current,undefined);
 const stream=makeStreamKey('sandbox',f.s.shopId,'new'),s=new NativeServiceSequencer(stream,0,12);
 assert.equal(s.observe({streamKey:'foreign',revision:999,epoch:12,source:'settle',soldUnits:5},high).reason,'foreign-stream');assert.equal(s.consumedRevision,0);assert.throws(()=>s.observe({streamKey:stream,revision:1000,epoch:12,source:'settle',soldUnits:NaN},high));assert.equal(s.consumedRevision,0);
 f.db.close();
});
test('queue is one active and latest pending batch; Low/Minimal keep native motion, Reduce Motion and hidden cannot catch up',()=>{
 const stream=makeStreamKey('sandbox','shop','save'),s=new NativeServiceSequencer(stream,0,3);
 for(let n=1;n<=100;n++)s.observe({streamKey:stream,revision:n,epoch:3,source:'command',soldUnits:5,accepted:{kind:'stock',commandId:String(n),itemId:'off.tea',quantity:2}},high);
 assert.equal(s.queuedBatchCount,2);s.invalidatePresentation(4);assert.equal(s.queuedBatchCount,0);assert.equal(s.consumedRevision,100);
 for(const quality of ['high','low'] as const)for(const minimalFx of [false,true]){const policy=resolveMotionPolicy({quality,minimalFx,reduceMotion:false,visible:true});assert.equal(policy.nativeMotion,true);assert.equal(policy.decorativeMotion,quality==='high'&&!minimalFx);assert.ok(sampleWalk(.1,.48,policy).leftFootLiftMetres>0);}
 const reduced=resolveMotionPolicy({quality:'high',minimalFx:false,reduceMotion:true,visible:true});assert.equal(reduced.nativeMotion,false);assert.equal(advanceVisibleTime(10,500,high),10.05);assert.equal(advanceVisibleTime(10,500,reduced),10);
 for(const x of [0,.1,1,Number.MAX_VALUE]){assert.ok(Object.values(sampleIdle(x,x,high)).every(Number.isFinite));assert.ok(Object.values(sampleWalk(x,x,high)).every(Number.isFinite));}
 s.dispose();assert.equal(s.tick(1,high),undefined);
});
