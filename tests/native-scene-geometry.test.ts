import test from 'node:test';
import assert from 'node:assert/strict';
import {NullEngine} from '@babylonjs/core/Engines/nullEngine';
import {Scene} from '@babylonjs/core/scene';
import {Mesh} from '@babylonjs/core/Meshes/mesh';
import {TransformNode} from '@babylonjs/core/Meshes/transformNode';
import {VertexData} from '@babylonjs/core/Meshes/mesh.vertexData';
import {Matrix,Vector3} from '@babylonjs/core/Maths/math.vector';
import {createNativeActors} from '../src/presentation/native-scene';
import {nativeGrouped,nativeCharacterParts,nativeSurfaceGeometry,type NativeSurface} from '../src/art/native-characters';
import {resolveMotionPolicy,type ServiceFrame} from '../src/presentation/native-motion';
import type {RouteFrame} from '../src/presentation/native-routes';
const HIGH=resolveMotionPolicy({quality:'high',visible:true,reduceMotion:false,minimalFx:false});
function fixture(){
 const engine=new NullEngine(),scene=new Scene(engine);scene.useRightHandedSystem=true;
 const model=(name:string,recipe:NativeSurface[],parent?:TransformNode)=>{const root=new TransformNode(name,scene);root.parent=parent??null;for(const [i,g] of nativeGrouped(recipe).entries()){const m=new Mesh(name+'.'+i,scene),v=new VertexData();v.positions=g.geometry.positions;v.normals=g.geometry.normals;v.indices=g.geometry.indices;v.applyToMesh(m);m.parent=root;}return root;};
 const actors=createNativeActors(scene,model);return {engine,scene,actors,dispose(){actors.dispose();scene.dispose();engine.dispose();}};
}
const routes=(distance=0,speed=0):RouteFrame=>({actors:[{id:0,enabled:true,x:1.35,z:-distance,yaw:0,speed,distance,state:speed?'walking':'browsing',browseProgress:0},{id:1,enabled:false,x:0,z:0,yaw:0,speed:0,distance:0,state:'absent',browseProgress:0}],doorOpen:0} as unknown as RouteFrame);
function vertices(node:TransformNode){node.computeWorldMatrix(true);const result:Vector3[]=[];for(const mesh of node.getChildMeshes(false).filter(m=>m.parent===node)){const values=mesh.getVerticesData('position')??[];mesh.computeWorldMatrix(true);for(let i=0;i<values.length;i+=3)result.push(Vector3.TransformCoordinates(Vector3.FromArray(values,i),mesh.getWorldMatrix()));}return result;}
function inside(surface:NativeSurface){
 const g=nativeSurfaceGeometry(surface),lo=[0,1,2].map(k=>g.positions.reduce((v,x,i)=>i%3===k?Math.min(v,x):v,Infinity)),hi=[0,1,2].map(k=>g.positions.reduce((v,x,i)=>i%3===k?Math.max(v,x):v,-Infinity)),ray=new Vector3(1,.213,.379).normalize(),triangles:Vector3[][]=[];
 for(let i=0;i<g.indices.length;i+=3)triangles.push(g.indices.slice(i,i+3).map(id=>Vector3.FromArray(g.positions,id*3)));
 return (point:Vector3)=>{if(point.asArray().some((v,k)=>v<=lo[k]+1e-8||v>=hi[k]-1e-8))return false;let n=0;for(const [a,b,c]of triangles){const u=b.subtract(a),v=c.subtract(a),h=Vector3.Cross(ray,v),det=Vector3.Dot(u,h);if(Math.abs(det)<1e-10)continue;const f=1/det,s=point.subtract(a),x=f*Vector3.Dot(s,h);if(x<0||x>1)continue;const q=Vector3.Cross(s,u),y=f*Vector3.Dot(ray,q);if(y<0||x+y>1)continue;if(f*Vector3.Dot(v,q)>1e-8)n++;}return n%2===1;};
}
const counterContains=(v:Vector3)=>v.x>1.65&&v.x<3.55&&v.z>-1.96&&v.z<-1.04&&v.y>.08&&v.y<1.11-1e-6;

test('native scene adapter stock/sale/display and both idle tasks keep articulated hands out of clothes and counter',()=>{
 const f=fixture(),clothes=nativeCharacterParts('misaki').find(p=>p.id==='body')!.recipe.filter(s=>s.role==='fabric').map(inside);try{
  const check=(label:string)=>{const body=f.actors.staff.parts.get('body')!;body.computeWorldMatrix(true);const inverse=Matrix.Invert(body.getWorldMatrix());for(const id of ['hand-left','hand-right'])for(const v of vertices(f.actors.staff.parts.get(id)!)){assert.ok(!counterContains(v),`${label}: ${id} in counter ${v.asArray()}`);const local=Vector3.TransformCoordinates(v,inverse);assert.ok(!clothes.some(contains=>contains(local)),`${label}: ${id} in actual garment`);}for(const id of ['forearm-left','forearm-right'])for(const v of vertices(f.actors.staff.parts.get(id)!))assert.ok(!counterContains(v),`${label}: ${id} in counter ${v.asArray()}`);};
  for(const kind of ['stock','sale','display']as const)for(let n=0;n<=100;n++){const frame:ServiceFrame={cue:kind==='sale'?{kind,soldUnits:5}:kind==='stock'?{kind,commandId:'stock',itemId:'off.mug',quantity:5}:{kind,commandId:'display',itemId:'off.mug',slot:1},receiptRevision:1,progress:n/100,stage:'act'};f.actors.frame(.02,HIGH,routes(),frame,undefined);check(`${kind} ${n/100}`);}
  // Drive the real adapter visible clock, rather than treating wall time as a
  // clip timer. The new 32s walking routine returns to the counter between
  // tasks; observe 80 simulated seconds and retain both safety assertions.
  const seen=new Set<string>();for(let n=0;n<1600;n++){f.actors.frame(.05,HIGH,routes(),undefined,undefined);const clip=f.actors.metrics().staffClip;if(clip.includes('check-note')||clip.includes('tidy')){seen.add(clip);check(`${clip} frame${n}`);}}
  assert.ok([...seen].some(s=>s.includes('check-note')));assert.ok([...seen].some(s=>s.includes('tidy')));
 }finally{f.dispose();}
});

test('native scene walk keeps stance foot at floor and alternates finite swing lift over a distance-driven cycle',()=>{
 const f=fixture();try{let leftHigh=0,rightHigh=0;for(let n=0;n<=100;n++){f.actors.frame(.015,HIGH,routes(n/100*.72,.48),undefined,undefined);const heights=['left','right'].map(s=>Math.min(...vertices(f.actors.visitors[0].parts.get('foot-'+s)!).map(v=>v.y)));assert.ok(heights.every(y=>Number.isFinite(y)&&y>=.0799),`foot below floor at${n}: ${heights}`);assert.ok(Math.abs(Math.min(...heights)-.08)<1e-5,`stance sole not grounded at${n}: ${heights}`);if(heights[0]>.10)leftHigh++;if(heights[1]>.10)rightHigh++;}assert.ok(leftHigh>15&&rightHigh>15,'both feet visibly alternate');for(let n=0;n<60;n++)f.actors.frame(1/60,HIGH,routes(.72,0),undefined,undefined);for(const s of ['left','right'])assert.ok(Math.abs(Math.min(...vertices(f.actors.visitors[0].parts.get('foot-'+s)!).map(v=>v.y))-.08)<1e-5,'rest feet grounded');}finally{f.dispose();}
});

test('native prop pool stays bounded and cancellation/hidden releases every owner',()=>{
 const f=fixture();try{const meshes=f.scene.meshes.length;for(let n=0;n<80;n++){f.actors.frame(.02,HIGH,routes(),{cue:{kind:'sale',soldUnits:7},receiptRevision:n+1,progress:(n%20)/20,stage:'act'},undefined);assert.equal(f.actors.metrics().propCount,5);assert.ok(f.actors.metrics().activeProps.length<=1);assert.equal(f.scene.meshes.length,meshes);}f.actors.clearProps();assert.deepEqual(f.actors.metrics().activeProps,[]);f.actors.frame(0,resolveMotionPolicy({quality:'low',visible:false,reduceMotion:false,minimalFx:true}),routes(),undefined,undefined);assert.deepEqual(f.actors.metrics().activeProps,[]);}finally{f.dispose();}
});

test('sale bag preserves its prior world pose across hand-to-counter ownership and never sinks through counter',()=>{
 const f=fixture();try{const owners=new Set<string>();for(let n=0;n<=100;n++){
  f.actors.frame(.028,HIGH,routes(),{cue:{kind:'sale',soldUnits:5},receiptRevision:1,progress:n/100,stage:'act'},undefined);
  for(const prop of f.actors.metrics().activeProps){assert.equal(prop.kind,'bag');owners.add(prop.parent);const node=f.scene.getTransformNodeByName('native.prop.bag')!;for(const v of vertices(node)){assert.ok(!counterContains(v),`bag intersects counter at phase${n/100}: ${v.asArray()}`);assert.ok(v.y>=1.11,'bag stays at/above counter while packed and handed forward');}}
 }assert.ok(owners.has('counter'));assert.ok([...owners].some(s=>s.includes('socket-right')),'real hand socket owns bag during lift');assert.deepEqual(f.actors.metrics().activeProps,[],'bag released at end');}finally{f.dispose();}
});
