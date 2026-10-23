import test from 'node:test';
import assert from 'node:assert/strict';
import {NullEngine} from '@babylonjs/core/Engines/nullEngine';
import {Scene} from '@babylonjs/core/scene';
import {TransformNode} from '@babylonjs/core/Meshes/transformNode';
import {Vector3,Matrix} from '@babylonjs/core/Maths/math.vector';
import {StaffMotionPlayer,type StaffPlaybackPose} from '../src/presentation/native-staff-player';
import {sampleStaff,type StaffServiceFrame} from '../src/presentation/native-staff';
import {nativeCharacterParts,nativeSurfaceGeometry,type NativeSurface} from '../src/art/native-characters';

function solidContains(surface:NativeSurface){
 const g=nativeSurfaceGeometry(surface),lo=[0,1,2].map(k=>g.positions.reduce((v,x,i)=>i%3===k?Math.min(v,x):v,Infinity)),hi=[0,1,2].map(k=>g.positions.reduce((v,x,i)=>i%3===k?Math.max(v,x):v,-Infinity));
 const direction=new Vector3(1,.213,.379).normalize(),triangles:Vector3[][]=[];for(let i=0;i<g.indices.length;i+=3)triangles.push(g.indices.slice(i,i+3).map(id=>Vector3.FromArray(g.positions,id*3)));
 return (point:Vector3)=>{const a=point.asArray();if(a.some((v,k)=>v<=lo[k]+1e-8||v>=hi[k]-1e-8))return false;let count=0;for(const [v0,v1,v2]of triangles){const e1=v1.subtract(v0),e2=v2.subtract(v0),h=Vector3.Cross(direction,e2),det=Vector3.Dot(e1,h);if(Math.abs(det)<1e-10)continue;const f=1/det,s=point.subtract(v0),u=f*Vector3.Dot(s,h);if(u<0||u>1)continue;const q=Vector3.Cross(s,e1),v=f*Vector3.Dot(direction,q);if(v<0||u+v>1)continue;if(f*Vector3.Dot(e2,q)>1e-8)count++;}return count%2===1;};
}
function rig(){
 const engine=new NullEngine(),scene=new Scene(engine);scene.useRightHandedSystem=true;const root=new TransformNode('staff',scene);root.position.set(2.6,.065,-.65);const parts=nativeCharacterParts('misaki'),nodes=new Map<string,TransformNode>();
 for(const p of parts){const node=new TransformNode(p.id,scene);node.position.set(...p.pivot);nodes.set(p.id,node);}for(const p of parts)nodes.get(p.id)!.parent=p.parent?nodes.get(p.parent)!:root;
 const clothes=parts.find(p=>p.id==='body')!.recipe.filter(s=>s.role==='fabric').map(solidContains);
 const points=Object.fromEntries(['hand-left','hand-right','forearm-left','forearm-right'].map(id=>[id,parts.find(p=>p.id===id)!.recipe.flatMap(s=>{const g=nativeSurfaceGeometry(s);return Array.from({length:g.positions.length/3},(_,i)=>Vector3.FromArray(g.positions,i*3));})]));
 function check(pose:StaffPlaybackPose,label:string){root.rotation.y=pose.turn;nodes.get('body')!.position.y=pose.bodyLift;for(const [id,r] of Object.entries(pose.rotations))nodes.get(id)?.rotation.set(...r);for(const node of nodes.values())node.computeWorldMatrix(true);const inverse=Matrix.Invert(nodes.get('body')!.getWorldMatrix());
  for(const [id,vertices]of Object.entries(points))for(const point of vertices){const world=Vector3.TransformCoordinates(point,nodes.get(id)!.getWorldMatrix());assert.ok(!(world.x>1.65&&world.x<3.55&&world.z>-1.96&&world.z<-1.04&&world.y>.08&&world.y<1.11-1e-6),`${label}: ${id} counter ${world.asArray()}`);if(id.startsWith('hand-'))assert.ok(!clothes.some(contains=>contains(Vector3.TransformCoordinates(world,inverse))),`${label}: ${id} clothing`);}
 }
 return {check,dispose(){scene.dispose();engine.dispose();}};
}
function advance(player:StaffMotionPlayer,seconds:number){let pose=player.current;for(let n=0;n<Math.round(seconds*60);n++)pose=player.tick(1/60,undefined,undefined,true);return pose;}
const jointDelta=(a:StaffPlaybackPose,b:StaffPlaybackPose)=>Math.max(...Object.keys(a.rotations).flatMap(id=>a.rotations[id].map((x,k)=>Math.abs(x-b.rotations[id][k]))));

test('v3.1 reproduces old tidy/service jump and consumes actual cross-clip blends instead of metadata only',()=>{
 assert.equal(sampleStaff(6.8).rotations['arm-right'][0],1.12);assert.equal(sampleStaff(23).rotations['arm-right'][0],.76);
 const player=new StaffMotionPlayer(),before=advance(player,6.8);assert.equal(before.clip,'native.staff.tidy.v3');assert.equal(before.rotations['arm-right'][0],1.12);
 const first=player.tick(0,{cue:{kind:'sale'},progress:0},undefined,true);assert.equal(jointDelta(before,first),0,'interruption preserves exact prior pose before elapsed transition');assert.equal(first.transitioning,true);
 let last=first,max=0;for(let n=1;n<=30;n++){const pose=player.tick(1/60,{cue:{kind:'sale'},progress:n/60/2.8},undefined,true);max=Math.max(max,jointDelta(last,pose));assert.ok(Object.values(pose.expressionWeights).every(w=>w>=0&&w<=1));assert.ok(Math.abs(Object.values(pose.expressionWeights).reduce((a,b)=>a+b,0)-1)<1e-10);last=pose;}
 assert.ok(max<.42,`bounded frame rotation ${max}`);assert.ok(max<1.12/2,'old64degree instantaneous jump removed');assert.equal(last.transitioning,false);
});

test('v3.1 interrupted tidy/note, service-to-idle and rapid command transitions keep actual hands/clothes/counter clear',()=>{
 const body=rig();try{
  for(const [seconds,kind]of [[6.8,'sale'],[22.8,'stock']]as const){const player=new StaffMotionPlayer();advance(player,seconds);body.check(player.current,'outgoing '+kind);
   for(let n=0;n<=180;n++){const service=n<=120?{cue:{kind},progress:n/120}:undefined;const pose=player.tick(1/60,service,undefined,true);body.check(pose,`${kind} ${n}`);if(n>140)assert.equal(pose.clip,'native.staff.idle.v3','fresh idle wait, never old modulo task midsection');}
  }
  const player=new StaffMotionPlayer();advance(player,6.8);const commands:StaffServiceFrame[]=[{cue:{kind:'stock'},progress:0},{cue:{kind:'stock'},progress:.5},{cue:{kind:'sale'},progress:0},{cue:{kind:'sale'},progress:.5},{cue:{kind:'display'},progress:0}];
  for(const [i,service]of commands.entries())for(let n=0;n<18;n++)body.check(player.tick(1/60,{...service,progress:Math.min(1,service.progress+n/60/2.8)},undefined,true),`rapid ${i} ${n}`);
  for(let n=0;n<24;n++)body.check(player.tick(1/60,undefined,n/24,true),`rapid greet ${n}`);
  for(let n=0;n<24;n++)body.check(player.tick(1/60,undefined,undefined,true),`rapid recovery ${n}`);
 }finally{body.dispose();}
});

test('v3.1 outgoing prop fades before arm retraction; hidden/skip/reduced cancel owners and no midway task returns',()=>{
 const player=new StaffMotionPlayer();let before=advance(player,6.8);assert.equal(before.prop.kind,'cloth');assert.equal(before.prop.visible,true);
 const frames=[];for(let n=0;n<=18;n++)frames.push(player.tick(n===0?0:1/60,{cue:{kind:'sale'},progress:n/60/2.8},undefined,true));
 assert.equal(frames[0].prop.kind,'cloth');assert.equal(frames[0].propOpacity,1);assert.ok(frames.some(p=>p.prop.visible&&p.propOpacity>0&&p.propOpacity<1));assert.ok(frames.slice(7,16).every(p=>!p.prop.visible),'outgoing prop is gone before shoulder retraction');
 for(let n=0;n<20;n++)player.tick(1/60,{cue:{kind:'stock'},progress:.4},undefined,true);player.cancel();assert.equal(player.current.prop.visible,false);assert.equal(player.current.transitioning,false);
 for(let n=0;n<30;n++)assert.equal(player.tick(1/60,undefined,undefined,true).clip,'native.staff.idle.v3');
 player.tick(.01,{cue:{kind:'sale'},progress:.5},undefined,true);player.tick(.05,undefined,undefined,false);assert.equal(player.current.prop.visible,false);assert.equal(player.current.turn,0);
 assert.throws(()=>player.tick(NaN,undefined,undefined,true));assert.equal(player.tick(30,undefined,undefined,true).clip,'native.staff.idle.v3','large gaps clamp to visible delta, not catchup');
});

test('v3.1 conditional service yaw blends with rest-relative body and returns to a fresh idle',()=>{
 const player=new StaffMotionPlayer(),body=rig();try{let last=player.current;for(let n=0;n<=168;n++){const pose=player.tick(1/60,{cue:{kind:'sale'},progress:n/168,serviceYaw:-Math.PI/2},undefined,true);body.check(pose,'service yaw '+n);assert.ok(Math.abs(pose.turn-last.turn)<.08);last=pose;}assert.equal(last.turn,0);for(let n=0;n<30;n++)body.check(player.tick(1/60,undefined,undefined,true),'yaw idle '+n);}finally{body.dispose();}
});
