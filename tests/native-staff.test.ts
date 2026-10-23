import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {sampleStaff,STAFF_CLIPS,type StaffServiceFrame} from '../src/presentation/native-staff';

test('native staff motions have bounded rest-relative samples and exact action endpoints',()=>{
 for(const kind of ['stock','sale','display'] as const){
  for(let i=0;i<=200;i++){
   const frame:StaffServiceFrame={cue:{kind},progress:i/200};const p=sampleStaff(0,frame);
   for(const r of Object.values(p.rotations))for(const a of r){assert.ok(Number.isFinite(a));assert.ok(Math.abs(a)<2);}
   assert.ok(p.eyelidClosure>=0&&p.eyelidClosure<=1);
   if(i===0||i===200){for(const r of Object.values(p.rotations))assert.ok(r.every(a=>Math.abs(a)<1e-12));assert.equal(p.prop.visible,false);assert.ok(Math.abs(p.turn)<1e-12);}
  }
 }
 const start=sampleStaff(0,undefined,0),end=sampleStaff(0,undefined,1);
 assert.deepEqual(start.rotations,end.rotations);
 for(let i=1;i<100;i++){const p=sampleStaff(0,undefined,i/100);assert.ok(p.rotations['arm-right'][2]>0,'greeting shoulder turns outward');assert.ok(p.rotations['forearm-right'][0]>=0,'elbow remains forward');}
});

test('native staff idle work is visible-time deterministic, staggered, and yields to actual service',()=>{
 const tasks=new Set<string>();
 for(let i=0;i<700;i++){const p=sampleStaff(i*.05);if(p.prop.visible)tasks.add(p.prop.kind);assert.deepEqual(p,sampleStaff(i*.05),'repaint does not reset sample');}
 assert.ok(tasks.has('cloth'));assert.ok(tasks.has('note'));
 const work=sampleStaff(7);assert.equal(work.clip,STAFF_CLIPS.tidy.id);assert.equal(work.prop.visible,true);
 const override=sampleStaff(7,{cue:{kind:'stock'},progress:.5},.5);assert.equal(override.clip,STAFF_CLIPS.stock.id);assert.equal(override.prop.kind,'box');
 const greeting=sampleStaff(7,undefined,.5);assert.equal(greeting.clip,STAFF_CLIPS.greet.id);
 for(const seconds of [0,2.8,2.93,3.06,Number.MAX_VALUE]){const p=sampleStaff(seconds);assert.ok(Number.isFinite(p.bodyLift));for(const r of Object.values(p.rotations))assert.ok(r.every(Number.isFinite));}
 assert.ok(sampleStaff(2.93).eyelidClosure>.99);
 assert.throws(()=>sampleStaff(Infinity));assert.throws(()=>sampleStaff(-1));assert.throws(()=>sampleStaff(0,{cue:{kind:'sale'},progress:NaN}));
});

test('native staff export contract matches motion durations and does not call storage or timers',()=>{
 const contract=JSON.parse(fs.readFileSync('assets/authoring/native-v3/motion-contract.json','utf8'));
 assert.equal(contract.units.time,'seconds');assert.equal(contract.skeletalClips,false);
 for(const clip of Object.values(STAFF_CLIPS)){const record=contract.staffClips.find((r:{id:string})=>r.id===clip.id);assert.ok(record);assert.equal(record.duration,clip.duration);assert.deepEqual(record.markers,clip.markers);}
 const source=fs.readFileSync('src/presentation/native-staff.ts','utf8');assert.doesNotMatch(source,/\b(?:setTimeout|setInterval|Saves|settle|command)\s*\(/);
});


test('staff work tucks elbows before lifting over the counter and reverses that arc on recovery',()=>{
 for(const kind of ['stock','sale'] as const){
  const early=sampleStaff(0,{cue:{kind},progress:.04});
  assert.equal(early.rotations['arm-right'][0],0);
  assert.ok(early.rotations['forearm-right'][0]>1.4,'fold lower arm before reaching');
  const lifted=sampleStaff(0,{cue:{kind},progress:.15});
  assert.ok(lifted.rotations['arm-right'][0]>1.09);
  assert.ok(lifted.rotations['forearm-right'][0]>1.4,'keep elbow tucked until upper arm clears');
  const unfolding=sampleStaff(0,{cue:{kind},progress:.22});
  assert.ok(unfolding.rotations['forearm-right'][0]<1.2);
  const recovered=sampleStaff(0,{cue:{kind},progress:.96});
  assert.ok(Math.abs(recovered.rotations['arm-right'][0])<1e-12);
  assert.ok(recovered.rotations['forearm-right'][0]>1.4,'retract shoulder before lowering forearm');
 }
});
