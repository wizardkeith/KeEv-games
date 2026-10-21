import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {NullEngine} from '@babylonjs/core/Engines/nullEngine';
import {Scene} from '@babylonjs/core/scene';
import {PBRMaterial} from '@babylonjs/core/Materials/PBR/pbrMaterial';
import {SceneLoader} from '@babylonjs/core/Loading/sceneLoader';
import '@babylonjs/loaders/glTF/glTFFileLoader';
import '@babylonjs/loaders/glTF/2.0/glTFLoader';
import {misakiParts,misakiIdentity,misakiPose} from '../src/art/misaki';
import {geometry,grouped} from '../src/art/geometry';
import {materialRenderState} from '../src/art/materials';
import {personParts,palette,type V3} from '../src/art/recipes';
const hash=(b:Buffer)=>crypto.createHash('sha256').update(b).digest('hex');
const manifest=()=>JSON.parse(fs.readFileSync('assets/authoring/day1/manifest.json','utf8'));

test('Misaki is an independently proportioned grounded character with real expression geometry and unit surface normals',()=>{
 const calm=misakiParts('calm'),smile=misakiParts('smile');assert.equal(misakiIdentity.economicBinding,'staff.graybox');assert.equal(calm.length,4);
 const generic=personParts(palette.staff);assert.notDeepEqual(calm.map(p=>p.recipe.map(q=>[q.shape,q.size,q.at])),generic.map(p=>p.recipe.map(q=>[q.shape,q.size,q.at])),'reject generic recolor');
 let min=Infinity,max=-Infinity;
 for(const expression of [calm,smile])for(const part of expression)for(const p of part.recipe){const g=geometry(p);for(let i=0;i<g.positions.length;i+=3){assert.ok(g.positions.slice(i,i+3).every(Number.isFinite));assert.ok(Math.abs(Math.hypot(...g.normals.slice(i,i+3))-1)<1e-12);min=Math.min(min,g.positions[i+1]);max=Math.max(max,g.positions[i+1]);}
  for(let i=0;i<g.indices.length;i+=3){const ids=g.indices.slice(i,i+3),a=ids.map(id=>g.positions.slice(id*3,id*3+3)),u=a[1].map((x,k)=>x-a[0][k]),v=a[2].map((x,k)=>x-a[0][k]),n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],norm=[0,1,2].map(k=>ids.reduce((sum,id)=>sum+g.normals[id*3+k],0));assert.ok(n.reduce((sum,x,k)=>sum+x*norm[k],0)>0,'positive winding and nondegenerate face');}}
 assert.ok(Math.abs(min-.015)<1e-12);assert.ok(Math.abs(max-1.48)<1e-12);assert.ok((max-min)/.4>=3.5&&(max-min)/.4<=4);
 assert.notDeepEqual(calm[1].recipe,smile[1].recipe);for(const index of [0,2,3])assert.deepEqual(calm[index],smile[index],'only expression head changes');
});

test('actual Misaki GLBs preserve every runtime vertex, normal, index, pivot and opaque material policy',()=>{
 for(const a of manifest().assets){const b=fs.readFileSync(a.file);assert.equal(b.length,a.bytes);assert.equal(hash(b),a.sha256);assert.deepEqual(fs.readFileSync(a.web),b);assert.equal(b.readUInt32LE(8),b.length);
  const len=b.readUInt32LE(12),j=JSON.parse(b.subarray(20,20+len).toString()),start=28+len;
  assert.equal(j.nodes[0].name,misakiIdentity.id);assert.equal(j.skins,undefined);assert.equal(j.animations,undefined);
  const read=(id:number)=>{const x=j.accessors[id],v=j.bufferViews[x.bufferView],o=start+(v.byteOffset??0)+(x.byteOffset??0),count=x.count*(x.type==='VEC3'?3:1);return Array.from({length:count},(_,i)=>x.componentType===5126?b.readFloatLE(o+i*4):b.readUInt32LE(o+i*4));};
  for(const part of misakiParts(a.expression)){const node=j.nodes.find((n:{name:string})=>n.name===part.id);assert.deepEqual(node.translation,part.pivot);const local=part.recipe.map(p=>({...p,at:p.at.map((n,i)=>n-part.pivot[i]) as V3})),groups=grouped(local);assert.equal(node.children.length,groups.length);
   groups.forEach((g,index)=>{const child=j.nodes[node.children[index]],prim=j.meshes[child.mesh].primitives[0],m=j.materials[prim.material],render=materialRenderState(g.role,g.color,g.alpha);for(const [actual,expected] of [[read(prim.attributes.POSITION),g.geometry.positions],[read(prim.attributes.NORMAL),g.geometry.normals]]){assert.equal(actual.length,expected.length);actual.forEach((v:number,i:number)=>assert.ok(Math.abs(v-expected[i])<1e-7));}assert.deepEqual(read(prim.indices),g.geometry.indices);assert.deepEqual(m.pbrMetallicRoughness.baseColorFactor,[...render.baseColorLinear,1]);assert.equal(m.pbrMetallicRoughness.roughnessFactor,render.roughness);assert.equal(m.doubleSided,false);assert.equal(m.alphaMode,undefined);});
  }
 }
});

test('independent Babylon Misaki import retains articulated nodes, finite bounds and PBR colors without skeleton claims',async()=>{
 const engine=new NullEngine();try{for(const a of manifest().assets){const scene=new Scene(engine);scene.useRightHandedSystem=true;try{const bytes=fs.readFileSync(a.file),loaded=await SceneLoader.ImportMeshAsync(null,'',`data:base64,${bytes.toString('base64')}`,scene,undefined,'.glb');assert.equal(loaded.skeletons.length,0);assert.equal(loaded.animationGroups.length,0);
   for(const part of misakiParts(a.expression)){assert.ok(scene.transformNodes.find(n=>n.name===part.id));for(const g of grouped(part.recipe)){const imported=scene.materials.find(m=>m.name===g.materialId) as PBRMaterial,render=materialRenderState(g.role,g.color,g.alpha);assert.ok(imported);assert.equal(imported.alpha,1);assert.equal(imported.backFaceCulling,true);assert.equal(imported.twoSidedLighting,false);assert.equal(imported.roughness,render.roughness);assert.equal(imported.metallic,render.metallic);assert.deepEqual(imported.albedoColor.asArray(),render.baseColorLinear);}}
   for(const mesh of loaded.meshes){mesh.computeWorldMatrix(true);const b=mesh.getBoundingInfo().boundingBox;assert.ok([...b.minimumWorld.asArray(),...b.maximumWorld.asArray()].every(Number.isFinite));}
  }finally{scene.dispose();}}}finally{engine.dispose();}
});

test('Misaki local pose sampling has zero root motion, bounded brief gestures and exact neutral endpoints',()=>{
 const neutral={headTilt:0,armLeft:0,armRight:0};for(const kind of ['greet','sale'] as const){for(const phase of [-1,0,1,2,NaN,Infinity])assert.deepEqual(misakiPose(kind,phase),neutral);for(let p=0;p<=1;p+=.01){const pose=misakiPose(kind,p);assert.deepEqual(Object.keys(pose),['headTilt','armLeft','armRight']);assert.ok(Object.values(pose).every(Number.isFinite));assert.ok(Math.abs(pose.armRight)<=.55&&Math.abs(pose.armLeft)<=.08&&Math.abs(pose.headTilt)<=.10);}}
 assert.notDeepEqual(misakiPose('greet',.5),neutral);assert.notDeepEqual(misakiPose('sale',.5),neutral);
});

test('new character source hashes are reproducible and every accepted W1.1B master remains byte-identical',()=>{
 for(const [name,digest] of Object.entries(manifest().sourceSha256))assert.equal(hash(fs.readFileSync(name)),digest,name);
 const old=JSON.parse(fs.readFileSync('assets/authoring/w1_1b/manifest.json','utf8'));assert.equal(old.assets.length,15);for(const a of old.assets)for(const p of [a.file,a.web])assert.equal(hash(fs.readFileSync(p)),a.sha256,p);
});
