import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {NullEngine} from '@babylonjs/core/Engines/nullEngine';
import {Scene} from '@babylonjs/core/scene';
import {TransformNode} from '@babylonjs/core/Meshes/transformNode';
import {Quaternion,Vector3,Matrix} from '@babylonjs/core/Maths/math.vector';
import {nativeCharacterParts,nativeSurfaceGeometry,type NativeSurface,type NativeCharacterKind} from '../src/art/native-characters';
import {NativeFootPlant,type FootPlantPose,type FootRoot} from '../src/presentation/native-feet';
import {NativeCustomerRoutes} from '../src/presentation/native-routes';
const measurements:Record<string,unknown>={basis:'actual runtime authoring positions / indexed triangles transformed by Babylon matrices; output GLB parity covered by native-characters test',visualClaim:false,units:'metres; seconds; radians',stanceToleranceMetres:.002,skirtSeamToleranceMetres:.001};
function record(key:string,value:unknown){measurements[key]=value;fs.mkdirSync('evidence/native-v4',{recursive:true});fs.writeFileSync('evidence/native-v4/locomotion-after.json',JSON.stringify(measurements,null,2)+'\n');}
function rig(kind:NativeCharacterKind='visitor-b'){
 const engine=new NullEngine(),scene=new Scene(engine);scene.useRightHandedSystem=true;const root=new TransformNode('root',scene),parts=nativeCharacterParts(kind),nodes=new Map<string,TransformNode>();root.position.y=.065;
 for(const p of parts){const n=new TransformNode(p.id,scene);n.position.set(...p.pivot);nodes.set(p.id,n);}for(const p of parts)nodes.get(p.id)!.parent=p.parent?nodes.get(p.parent)!:root;
 const apply=(r:FootRoot,p:FootPlantPose)=>{root.position.set(r.x,.065,r.z);root.rotation.y=r.yaw;nodes.get('body')!.position.y=p.bodyDrop;for(const side of ['left','right']as const){const pose=p[side];for(const [part,q]of [['leg',pose.hip],['shin',pose.knee],['foot',pose.foot]]as const)nodes.get(part+'-'+side)!.rotationQuaternion=Quaternion.FromArray([...q]);}for(const n of nodes.values())n.computeWorldMatrix(true);};
 const points=(id:string)=>{const node=nodes.get(id)!;return parts.find(p=>p.id===id)!.recipe.flatMap(s=>{const g=nativeSurfaceGeometry(s);return Array.from({length:g.positions.length/3},(_,i)=>Vector3.TransformCoordinates(Vector3.FromArray(g.positions,i*3),node.getWorldMatrix()));});};
 const sole=(side:string)=>{const all=points('foot-'+side),low=Math.min(...all.map(v=>v.y)),bottom=all.filter(v=>Math.abs(v.y-low)<1e-6);return {y:low,center:bottom.reduce((sum,v)=>sum.add(v),Vector3.Zero()).scale(1/bottom.length)};};
 return {root,nodes,parts,apply,points,sole,dispose(){scene.dispose();engine.dispose();}};
}
function skirtRayZ(surface:NativeSurface){const g=nativeSurfaceGeometry(surface);return(x:number,y:number)=>{const hits:number[]=[];for(let i=0;i<g.indices.length;i+=3){const v=g.indices.slice(i,i+3).map(id=>g.positions.slice(id*3,id*3+3)),d=(v[1][1]-v[2][1])*(v[0][0]-v[2][0])+(v[2][0]-v[1][0])*(v[0][1]-v[2][1]);if(Math.abs(d)<1e-13)continue;const a=((v[1][1]-v[2][1])*(x-v[2][0])+(v[2][0]-v[1][0])*(y-v[2][1]))/d,b=((v[2][1]-v[0][1])*(x-v[2][0])+(v[0][0]-v[2][0])*(y-v[2][1]))/d,c=1-a-b;if(a>=-1e-9&&b>=-1e-9&&c>=-1e-9)hits.push(a*v[0][2]+b*v[1][2]+c*v[2][2]);}return hits.length?[Math.min(...hits),Math.max(...hits)]:undefined;};}

test('v3.1 actual indexed shoe support centroid stays planted for the entire stance, not only floor Y',()=>{
 const f=rig(),feet=new NativeFootPlant(),anchors=new Map<string,Vector3>();let maxDrift=0,leftSwings=0,rightSwings=0;
 try{for(let n=0;n<360;n++){const d=n*.48/120,r={x:0,z:-d,yaw:0,speed:.48,distance:d},p=feet.tick(1/120,r);f.apply(r,p);
  for(const side of ['left','right']as const){const s=f.sole(side);assert.ok(s.y>=.07999);if(p[side].stance){assert.ok(Math.abs(s.y-.08)<1e-5);const key=side+':'+p[side].contactId,previous=anchors.get(key);if(!previous)anchors.set(key,s.center);else maxDrift=Math.max(maxDrift,Math.hypot(previous.x-s.center.x,previous.z-s.center.z));}else{if(side==='left')leftSwings++;else rightSwings++;}}
 }assert.ok(maxDrift<.002,`support drift ${maxDrift}m exceeds2mm on1.6m character`);assert.ok(leftSwings>40&&rightSwings>40);assert.ok(anchors.size>5);record('straightSupport',{maximumSoleCentroidDriftMetres:maxDrift,contacts:anchors.size,leftSwingFrames:leftSwings,rightSwingFrames:rightSwings});}
 finally{f.dispose();}
});

test('v3.1 actual rig remains planted through route starts, stops and turning in High and Low; hidden freezes contacts',()=>{
 for(const capacity of [1,2]as const){const routes=new NativeCustomerRoutes(),f=rig(),feet=new NativeFootPlant(),anchors=new Map<string,Vector3>();let sawTurn=false,sawStop=false,priorYaw:number|undefined,maxDrift=0;
  try{for(let n=0;n<4200;n++){const frame=routes.tick(1/60,{open:n<3000,visible:true,reduceMotion:false,capacity}),a=frame.actors[0];if(!a.enabled){feet.reset();anchors.clear();continue;}const p=feet.tick(1/60,a);f.apply(a,p);if(priorYaw!==undefined&&Math.abs(a.yaw-priorYaw)>.002)sawTurn=true;priorYaw=a.yaw;if(a.speed===0)sawStop=true;
   for(const side of ['left','right']as const){const sole=f.sole(side);assert.ok(sole.y>=.0798,`sole below floor ${sole.y}`);if(p[side].stance){const key=side+':'+p[side].contactId,prior=anchors.get(key);if(prior)maxDrift=Math.max(maxDrift,Math.hypot(sole.center.x-prior.x,sole.center.z-prior.z));else anchors.set(key,sole.center);}}
   if(n===600){const paused=feet.tick(.05,a,false);assert.deepEqual(feet.tick(500,a,false),paused);}
  }assert.ok(sawTurn&&sawStop);assert.ok(maxDrift<.002,`capacity${capacity} stance drift ${maxDrift}`);record('routeCapacity'+capacity,{maximumSoleCentroidDriftMetres:maxDrift,sawTurn,sawStop,frames:4200});}
  finally{routes.dispose();f.dispose();}
 }
});

test('v3.1 full walking cycle keeps Visitor B skin inside the actual indexed skirt while visible socks/shoes remain',()=>{
 const f=rig(),feet=new NativeFootPlant(),skirt=f.parts.find(p=>p.id==='body')!.recipe.find(s=>s.shape==='mesh'&&Math.min(...s.geometry.positions.filter((_,i)=>i%3===1))<.3)!,rangeAt=skirtRayZ(skirt);let tested=0,maxExcess=-Infinity;
 try{for(let n=0;n<240;n++){const d=n*.48/120,r={x:0,z:-d,yaw:0,speed:.48,distance:d},p=feet.tick(1/120,r);f.apply(r,p);const body=f.nodes.get('body')!,inverse=Matrix.Invert(body.getWorldMatrix());
  for(const side of ['left','right'])for(const point of f.points('leg-'+side)){const v=Vector3.TransformCoordinates(point,inverse);if(v.y<=.245||v.y>=.62)continue;const range=rangeAt(v.x,v.y);assert.ok(range,'thigh must remain inside skirt XY silhouette');if(range){tested++;maxExcess=Math.max(maxExcess,range[0]-v.z,v.z-range[1]);}}
 }assert.ok(tested>1000);assert.ok(maxExcess<=.001,`skin outside skirt by${maxExcess}m;1mm seam tolerance`);record('straightSkirt',{testedVertices:tested,maximumOutsideMetres:Math.max(0,maxExcess),minimumZClearanceMetres:-maxExcess,fullLegAndShinMeshesRetained:true});
 for(const side of ['left','right']){assert.ok(f.points('shin-'+side).length>0,'visible sock mesh retained');assert.ok(f.points('foot-'+side).length>0);}
 }finally{f.dispose();}
});

test('v3.1 skirt encloses actual thigh triangles during full route turns and stop/recenter steps',()=>{
 const f=rig(),feet=new NativeFootPlant(),routes=new NativeCustomerRoutes(),skirt=f.parts.find(p=>p.id==='body')!.recipe.find(s=>s.shape==='mesh'&&Math.min(...s.geometry.positions.filter((_,i)=>i%3===1))<.3)!,rangeAt=skirtRayZ(skirt);let samples=0,maxExcess=-Infinity,worst:any;
 try{for(let n=0;n<4200;n++){const a=routes.tick(1/60,{open:n<3000,visible:true,reduceMotion:false,capacity:2}).actors[1];if(!a.enabled){feet.reset();continue;}const p=feet.tick(1/60,a);f.apply(a,p);if(n%9)continue;const inverse=Matrix.Invert(f.nodes.get('body')!.getWorldMatrix());for(const side of ['left','right'])for(const point of f.points('leg-'+side)){const v=Vector3.TransformCoordinates(point,inverse);if(v.y<=.245||v.y>=.62)continue;const range=rangeAt(v.x,v.y);assert.ok(range,'moving thigh inside skirt XY silhouette during turn');if(range){samples++;const excess=Math.max(range[0]-v.z,v.z-range[1]);if(excess>maxExcess){maxExcess=excess;worst={n,side,point:v.asArray(),range,root:a};}}}}
 assert.ok(samples>1000);assert.ok(maxExcess<=.001,`turn/recenter skin outside skirt ${maxExcess}m ${JSON.stringify(worst)}`);record('turnSkirt',{testedVertices:samples,maximumOutsideMetres:Math.max(0,maxExcess),minimumZClearanceMetres:-maxExcess,worst});
 }finally{routes.dispose();f.dispose();}
});
