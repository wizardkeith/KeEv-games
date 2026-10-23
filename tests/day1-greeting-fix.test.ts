import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {NullEngine} from '@babylonjs/core/Engines/nullEngine';
import {Scene} from '@babylonjs/core/scene';
import {TransformNode} from '@babylonjs/core/Meshes/transformNode';
import {Matrix,Vector3} from '@babylonjs/core/Maths/math.vector';
import {misakiParts,misakiPose,misakiPalette} from '../src/art/misaki';
import {geometry} from '../src/art/geometry';
import {artDirection} from '../src/art/direction';

// Classify actual generated 12-sided convex solids using their outward triangle
// planes, not an AABB or an assumed pose-angle sign. Caps and tapered sides count.
function solidPlanes(part:ReturnType<typeof misakiParts>[number]['recipe'][number]){
 const g=geometry(part),planes:{point:Vector3;normal:Vector3}[]=[];
 for(let i=0;i<g.indices.length;i+=3){const a=Vector3.FromArray(g.positions,g.indices[i]*3),b=Vector3.FromArray(g.positions,g.indices[i+1]*3),c=Vector3.FromArray(g.positions,g.indices[i+2]*3);planes.push({point:a,normal:Vector3.Cross(b.subtract(a),c.subtract(a)).normalize()});}
 return (p:Vector3)=>planes.every(plane=>Vector3.Dot(p.subtract(plane.point),plane.normal)<-1e-8);
}
export function greetingSamples(){
 const parts=misakiParts('calm'),right=parts.find(p=>p.id==='arm-right')!,body=parts.find(p=>p.id==='body')!;
 const inClothes=body.recipe.filter(p=>p.shape==='cylinder'&&p.role==='fabric'&&new Set<string>([misakiPalette.cardigan,misakiPalette.skirt]).has(p.color)).map(solidPlanes);
 assert.equal(inClothes.length,2,'actual torso and skirt frustums');
 const palm=right.recipe.find(p=>p.shape==='sphere'&&p.size[0]===.10&&p.size[1]===.12)!,thumb=right.recipe.find(p=>p.shape==='sphere'&&p.size[0]===.043)!;
 const hand=[palm,thumb].map(p=>geometry(p));assert.equal(hand[0].positions.length/3,117);
 const engine=new NullEngine(),scene=new Scene(engine);scene.useRightHandedSystem=true;
 try{
  const root=new TransformNode('actor.misaki.day1.v1',scene);root.position.set(2.6,artDirection.actorBaseY,-2.45);root.rotation.y=-.35;
  const arm=new TransformNode('arm-right',scene);arm.parent=root;arm.position.set(...right.pivot);root.computeWorldMatrix(true);
  const inverseRoot=Matrix.Invert(root.getWorldMatrix()),samples=[];
  for(let i=0;i<=100;i++){
   const progress=i/100,pose=misakiPose('greet',progress);arm.rotation.z=pose.armRight;const matrix=arm.computeWorldMatrix(true);
   const counts=hand.map(g=>{let inside=0;for(let n=0;n<g.positions.length;n+=3){const local=Vector3.FromArray(g.positions,n).subtract(Vector3.FromArray(right.pivot)),world=Vector3.TransformCoordinates(local,matrix),actor=Vector3.TransformCoordinates(world,inverseRoot);if(inClothes.some(contains=>contains(actor)))inside++;}return inside;});
   const center=Vector3.TransformCoordinates(Vector3.TransformCoordinates(Vector3.FromArray(palm.at).subtract(Vector3.FromArray(right.pivot)),matrix),inverseRoot);
   samples.push({progress,angle:pose.armRight,palmInside:counts[0],thumbInside:counts[1],center:center.asArray()});
  }
  return samples;
 }finally{scene.dispose();engine.dispose();}
}
test('Misaki greeting keeps actual transformed hand geometry outside torso/skirt for the complete clip',()=>{
 const samples=greetingSamples();
 if(process.env.DAY1_GREETING_EVIDENCE){fs.mkdirSync('evidence/day1-fix',{recursive:true});fs.writeFileSync(process.env.DAY1_GREETING_EVIDENCE,JSON.stringify({method:'Actual Babylon RH hierarchy, actor yaw/position and shoulder pivot; actual generated closed 12-sided torso/skirt triangle half-planes; no GPU visual claim',samples},null,2)+'\n');}
 for(const sample of samples){assert.equal(sample.palmInside,0,`palm inside clothes at progress ${sample.progress}`);assert.equal(sample.thumbInside,0,`thumb inside clothes at progress ${sample.progress}`);}
 assert.deepEqual(samples[0].center.map(n=>Number(n.toFixed(5))),[.27,.75,-.006]);assert.deepEqual(samples.at(-1)!.center.map(n=>Number(n.toFixed(5))),[.27,.75,-.006]);
});
