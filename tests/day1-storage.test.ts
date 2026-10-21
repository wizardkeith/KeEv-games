import 'fake-indexeddb/auto';
import {IDBObjectStore} from 'fake-indexeddb';
import test from 'node:test';
import assert from 'node:assert/strict';
import {Core,type Snapshot,type Mode,type Command} from '../src/core/contracts';
import {execute} from '../src/core/simulation';
import {Saves,database} from '../src/platform/storage';
import {day1View,emptyStory,storyKey} from '../src/narrative/day1';
import {FeedbackProjector} from '../src/presentation/feedback';

const core=new Core(execute),start=Date.parse('2026-10-21T01:00:00Z');
let sequence=0;
async function fixture(mode:Mode='sandbox'){
 const name=`day1-storage-${process.pid}-${++sequence}`,db=await database(name),saves=new Saves(db,core);
 return {name,db,saves,state:await saves.loadOrCreate(mode,start)};
}
function raw(db:IDBDatabase,key:string):Promise<unknown>{return new Promise((resolve,reject)=>{const tx=db.transaction('saves','readonly'),r=tx.objectStore('saves').get(key);let data:unknown;r.onsuccess=()=>data=r.result;tx.oncomplete=()=>resolve(data);tx.onerror=()=>reject(tx.error);});}
function put(db:IDBDatabase,key:string,data:unknown):Promise<void>{return new Promise((resolve,reject)=>{const tx=db.transaction('saves','readwrite');tx.objectStore('saves').put(data,key);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);});}
async function setupTea(saves:Saves,s:Snapshot){
 for(const c of [{id:'tea',kind:'buy',itemId:'off.tea',quantity:5},{id:'shelf',kind:'display',itemId:'off.tea',slot:1},{id:'open',kind:'open'}] satisfies Command[])s=await saves.command(s,c);
 return s;
}

test('Day1 story-only actions leave every core field and raw schema2 snapshot unchanged',async()=>{
 const {db,saves,state}=await fixture();const before=await raw(db,'shop.w1.sandbox');
 assert.deepEqual(await saves.readStory(state),emptyStory(state));
 await saves.markStory(state,'welcome');await saves.markStory(state,'choose','skip');
 await saves.markStory(state,'sale','dismiss');await saves.markStory(state,'welcome','reopen');
 await assert.rejects(()=>saves.markStory(state,'sale'),/story_locked/);
 const story=await saves.readStory(state);assert.deepEqual(story.read,['welcome']);assert.deepEqual(story.skipped,['choose']);assert.equal(story.dismissed,false);
 assert.deepEqual(await raw(db,'shop.w1.sandbox'),before);assert.deepEqual(await saves.read('sandbox'),state);
 assert.equal(day1View(state,story).hasSale,false);assert.equal(day1View(state,story).nextBeat,'choose');db.close();
});

test('Day1 two database connections merge monotonic read and skip IDs without core revision writes',async()=>{
 const {name,db,saves,state}=await fixture();const db2=await database(name),other=new Saves(db2,core);
 await Promise.all([saves.markStory(state,'welcome'),other.markStory(state,'choose')]);
 await Promise.all([saves.markStory(state,'display','skip'),other.markStory(state,'open','skip')]);
 const story=await saves.readStory(state);assert.deepEqual(story.read,['welcome','choose']);assert.deepEqual(story.skipped,['display','open']);
 assert.deepEqual(await saves.read('sandbox'),state);db.close();db2.close();
});

test('Day1 fixed tea fixtures match unchanged economy, positive report and one aggregated sold5 feedback',async()=>{
 const {db,saves,state}=await fixture();let withStory=state,withoutStory=structuredClone(state);
 const commands:Command[]=[{id:'tea',kind:'buy',itemId:'off.tea',quantity:5},{id:'shelf',kind:'display',itemId:'off.tea',slot:1},{id:'open',kind:'open'}];
 await saves.markStory(withStory,'welcome');
 for(const c of commands){withStory=await saves.command(withStory,c);withoutStory=core.apply(withoutStory,c);await saves.markStory(withStory,'choose');assert.deepEqual(withStory,withoutStory);}
 const before=structuredClone(withStory);
 withStory=await saves.settle(withStory,start+15*60000,start+15*60000);withoutStory=core.apply(withoutStory,{id:`settle:${start+15*60000}`,kind:'settle',target:start+15*60000});withoutStory.lastWallTime=start+15*60000;
 assert.deepEqual(withStory,withoutStory);const r=withStory.reports[0];
 assert.deepEqual(r,{day:'2026-10-21',sales:75,cogs:35,salary:7,rent:5,operating:2,units:1,net:26});
 assert.equal(withStory.cash,4886);assert.deepEqual(withStory.inventory['off.tea'],{stock:4,price:75,bookCost:140,demandRemainder:300000});assert.equal(withStory.eventSequence,1);
 await saves.markStory(withStory,'sale');await saves.markStory(withStory,'report');await saves.markStory(withStory,'memory');const story=await saves.markStory(withStory,'profit');
 assert.equal(story.profitDay,'2026-10-21');assert.equal(day1View(withStory,story).positive,true);assert.equal(day1View(withStory,story).asOf,'2026-10-21 10:15');assert.equal(day1View(withStory,story).complete,true);
 assert.deepEqual(await saves.read('sandbox'),withoutStory);assert.equal(core.apply(withStory,{id:'reveal',kind:'reveal'}).revealed,true);
 const hour=core.apply(before,{id:'hour',kind:'settle',target:start+3600000});assert.deepEqual(hour.reports[0],{day:'2026-10-21',sales:375,cogs:175,salary:30,rent:20,operating:10,units:5,net:140});assert.equal(hour.cash,5140);assert.equal(hour.inventory['off.tea'].stock,0);
 const projector=new FeedbackProjector();assert.equal(projector.project(before,hour,'advance')?.sold,5);assert.equal(projector.project(before,hour,'advance'),undefined);assert.equal(new FeedbackProjector().project(before,hour,'reload'),undefined);db.close();
});

test('Day1 qualifications cover free choice, no sale before ten minutes, outside hours and old revealed progress',async()=>{
 const {db,saves,state}=await fixture();let s=await setupTea(saves,state),story=await saves.markStory(s,'welcome');
 const nine=core.apply(s,{id:'nine',kind:'settle',target:start+9*60000});assert.equal(day1View(nine,story).hasSale,false);assert.throws(()=>core.apply(nine,{id:'locked',kind:'reveal'}),/discovery_locked/);
 const ten=core.apply(s,{id:'ten',kind:'settle',target:start+10*60000});assert.equal(day1View(ten,story).hasSale,true);assert.equal(core.apply(ten,{id:'reveal',kind:'reveal'}).revealed,true);
 const nightStart=Date.parse('2026-10-20T17:55:00Z');let night=core.create('sandbox',nightStart);for(const c of [{id:'buy',kind:'buy',itemId:'off.tea',quantity:5},{id:'display',kind:'display',itemId:'off.tea',slot:0},{id:'open',kind:'open'}] satisfies Command[])night=core.apply(night,c);
 night=core.apply(night,{id:'night',kind:'settle',target:nightStart+15*60000});const view=day1View(night,story);assert.equal(view.trading,false);assert.equal(view.hasSale,false);assert.equal(view.positive,false);assert.throws(()=>core.apply(night,{id:'no-reveal',kind:'reveal'}),/discovery_locked/);
 let pencil=core.create('sandbox',start);for(const c of [{id:'buy',kind:'buy',itemId:'off.pencil',quantity:5},{id:'display',kind:'display',itemId:'off.pencil',slot:2},{id:'open',kind:'open'},{id:'15',kind:'settle',target:start+15*60000}] satisfies Command[])pencil=core.apply(pencil,c);
 assert.equal(pencil.reports[0].net,1);assert.equal(day1View(pencil,emptyStory(pencil)).contextItemId,'off.pencil');
 const old=core.apply(ten,{id:'old-reveal',kind:'reveal'});assert.equal(day1View(old,emptyStory(old)).hasSale,true);assert.equal(old.revealed,true);
 assert.equal(day1View(state,emptyStory(state)).hasStock,false);assert.throws(()=>core.apply(state,{id:'too-much',kind:'buy',itemId:'off.tea',quantity:1000}),/cash/);db.close();
});

test('Day1 a read profit date cannot claim current positive profit after later same-day costs',async()=>{
 const {db,saves,state}=await fixture();let s=await setupTea(saves,state);s=await saves.settle(s,start+15*60000,start+15*60000);const story=await saves.markStory(s,'profit');
 // Stop sales while original time/cost rules keep charging rent.
 s=await saves.command(s,{id:'close',kind:'open'});s=await saves.settle(s,start+10*3600000,start+10*3600000);
 const view=day1View(s,story);assert.equal(story.profitDay,'2026-10-21');assert.equal(view.report?.day,'2026-10-21');assert.equal(view.report!.net<0,true);assert.equal(view.positive,false);assert.equal(view.complete,false);assert.equal(view.asOf,'2026-10-21 20:00');
 await assert.rejects(()=>saves.markStory(s,'profit'),/story_locked/);db.close();
});

test('Day1 import is atomic, local-revision monotonic and rejects delayed pre-import story callbacks',async()=>{
 const {db,saves,state}=await fixture();await saves.markStory(state,'welcome');
 const normal=await saves.loadOrCreate('normal',start);await saves.markStory(normal,'choose');const normalStory=await raw(db,storyKey(normal));
 const imported=await saves.import(state,JSON.stringify({...state,revision:999}));assert.equal(imported.revision,state.revision+1);assert.deepEqual((await saves.readStory(imported)).read,[]);
 await assert.rejects(()=>saves.markStory(state,'choose'),/stale/);assert.deepEqual(await saves.readStory(imported),emptyStory(imported));assert.deepEqual(await raw(db,storyKey(normal)),normalStory);
 await saves.markStory(imported,'welcome');const before=await saves.read('sandbox'),storyBefore=await raw(db,storyKey(imported));
 const originalPut=IDBObjectStore.prototype.put;
 try{IDBObjectStore.prototype.put=function(value:unknown,key?:IDBValidKey){if(typeof key==='string'&&key.startsWith('story.day1.'))throw Error('forced_abort');return originalPut.call(this,value,key!);};
  await assert.rejects(()=>saves.import(imported,JSON.stringify(state)),/forced_abort/);
 }finally{IDBObjectStore.prototype.put=originalPut;}
 assert.deepEqual(await saves.read('sandbox'),before);assert.deepEqual(await raw(db,storyKey(imported)),storyBefore);db.close();
});

test('Day1 missing or damaged v1 sidecar recovers; unsupported future version is untouched even on import',async()=>{
 const {db,saves,state}=await fixture();const key=storyKey(state);assert.deepEqual(await saves.readStory(state),emptyStory(state));
 await put(db,key,{version:1,read:'broken',cash:999999});assert.deepEqual(await saves.readStory(state),emptyStory(state));assert.deepEqual((await saves.markStory(state,'welcome')).read,['welcome']);assert.deepEqual(await saves.read('sandbox'),state);
 const future={version:2,read:['future:memory'],newFormat:{doNotDestroy:true}};await put(db,key,future);
 assert.equal((await saves.readStory(state)).unsupported,true);assert.equal((await saves.markStory(state,'welcome')).unsupported,true);assert.deepEqual(await raw(db,key),future);
 const imported=await saves.import(state,JSON.stringify(state));assert.equal((await saves.readStory(imported)).unsupported,true);assert.deepEqual(await raw(db,key),future);assert.equal(imported.schemaVersion,2);assert.equal(imported.simulationVersion,'ts-w1-2');db.close();
});
