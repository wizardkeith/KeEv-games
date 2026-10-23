import test from 'node:test';
import assert from 'node:assert/strict';
import 'fake-indexeddb/auto';
import {Core} from '../src/core/contracts';
import {execute} from '../src/core/simulation';
import {database,Saves} from '../src/platform/storage';
import {FeedbackProjector} from '../src/presentation/feedback';
import {FeedbackClock,motionAllowed,vfx} from '../src/presentation/config';
import {customerPoses,customerVisible,browsePose} from '../src/presentation/poses';
import {NativeCustomerRoutes} from '../src/presentation/native-routes';
import layout from '../src/content/layout.json';
const core=new Core(execute),epoch=Date.parse('2026-10-21T01:00:00Z');
const create=()=>({...core.create('sandbox',epoch),revision:0});
const commit=(s:ReturnType<typeof create>,kind:string,data={})=>({...core.apply(s,{id:`${kind}:${s.revision}`,kind,...data}),revision:s.revision+1});
test('feedback follows actual commits; load/import/mode/duplicate never replay rewards',()=>{
 const p=new FeedbackProjector();let s=create(),next=commit(s,'buy',{itemId:'off.notebook',quantity:5});
 assert.equal(p.project(s,next,'buy')?.kind,'stock');assert.equal(p.project(s,next,'buy'),undefined);
 for(const cause of ['baseline','reload','retry','import','mode','choose-mode'])assert.equal(new FeedbackProjector().project(s,next,cause),undefined);
 s=next;next=commit(s,'display',{itemId:'off.notebook',slot:1});assert.equal(p.project(s,next,'display',1)?.slot,1);
 s=next;next=commit(s,'open');s=next;next=commit(s,'settle',{target:s.watermark+3600000});const event=p.project(s,next,'settle');assert.equal(event?.kind,'sale');assert.equal(event?.units,next.eventSequence-s.eventSequence);assert.ok(event!.units>0);
 s=next;next=commit(s,'reveal');assert.equal(p.project(s,next,'reveal')?.kind,'reveal');assert.equal(new FeedbackProjector().project(s,next,'reload'),undefined);
 const duplicate={...core.apply(next,{id:`reveal:${s.revision}`,kind:'reveal'}),revision:next.revision+1};assert.equal(p.project(next,duplicate,'reveal'),undefined);
 assert.ok(p.retainedIds<=64);
});
test('support is distinct from sales and remains one feedback after repeated commands',()=>{
 const s=create();s.cash=0;const next=commit(s,'recover'),p=new FeedbackProjector(),fx=p.project(s,next,'recover');assert.equal(fx?.kind,'support');assert.equal(fx?.sold,0);assert.equal(p.project(s,next,'recover'),undefined);
});
test('presentation clock has one bounded effect, skip/hidden/dispose prevent backlog and replay',()=>{
 const c=new FeedbackClock(),policy={low:false,minimal:false,reduced:false};c.start('reveal',0,policy);c.step(100000);assert.equal(c.active?.elapsed,50);c.start('sale',2,policy);assert.equal(c.active?.kind,'sale');assert.equal(c.active?.elapsed,0);c.step(20,true);assert.equal(c.active,undefined);c.step(100000);assert.equal(c.active,undefined);
 c.start('reveal',0,policy);c.cancel();assert.equal(c.active,undefined);c.start('reveal',0,policy);c.dispose();c.start('sale',0,policy);assert.equal(c.active,undefined);
 for(const key of ['low','minimal','reduced'] as const){const p={...policy,[key]:true};assert.equal(motionAllowed(p),false);const c=new FeedbackClock();c.start('reveal',0,p);assert.equal(c.active,undefined);}
 const clean=new FeedbackClock();for(let i=0;i<500;i++){clean.start('stock',1,policy);for(let n=0;n<12;n++)clean.step(50);assert.equal(clean.active,undefined);}assert.equal(vfx.policy.queueCapacity,0);assert.equal(vfx.dust.capacity,8);
});
test('native customer roots traverse actual retained layout clearance; Low drains a visitor instead of freezing everyone',()=>{
 const routes=new NativeCustomerRoutes(),radius=.24;let moved=false,browsed=false,last=routes.tick(0,{open:true,visible:true,reduceMotion:false,capacity:2});
 for(let n=0;n<7000;n++){const frame=routes.tick(1/60,{open:true,visible:true,reduceMotion:false,capacity:n<3500?2:1});for(const p of frame.actors.filter(a=>a.enabled)){
  if(p.speed>0)moved=true;if(p.state==='browsing')browsed=true;
  for(const d of layout.displays){const dx=Math.max(0,Math.abs(p.x-d.position[0])-.79),dz=Math.max(0,Math.abs(p.z-d.position[2])-.475);assert.ok(Math.hypot(dx,dz)>radius,'moving root clears authoritative shelf footprint');}
  const c=layout.counter.position;assert.ok(Math.hypot(Math.max(0,Math.abs(p.x-c[0])-.95),Math.max(0,Math.abs(p.z-c[2])-.46))>radius);
 }last=frame;}
 assert.equal(moved,true);assert.equal(browsed,true);assert.equal(last.actors[1].enabled,false);routes.dispose();
});
test('art review DB is isolated from both player slots; default database and CAS preserved',async()=>{
 const player=new Saves(await database(),core),normal=await player.loadOrCreate('normal',epoch),sandbox=await player.loadOrCreate('sandbox',epoch);
 const qa=new Saves(await database('next-stop-little-shop-art-review-w1_1a'),core);let s=await qa.loadOrCreate('sandbox',epoch);s=await qa.command(s,{id:'qa-buy',kind:'buy',itemId:'off.notebook',quantity:5});assert.equal(s.inventory['off.notebook'].stock,5);
 assert.deepEqual(await player.read('normal'),normal);assert.deepEqual(await player.read('sandbox'),sandbox);player.db.close();qa.db.close();
});
