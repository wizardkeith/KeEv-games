import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {NullEngine} from '@babylonjs/core/Engines/nullEngine';
import {Scene} from '@babylonjs/core/scene';
import {TransformNode} from '@babylonjs/core/Meshes/transformNode';
import {Vector3} from '@babylonjs/core/Maths/math.vector';
import {nativeCharacterParts,nativeGrouped,nativeSurfaceGeometry,nativeRigContract,type NativeCharacterKind,type NativeSurface} from '../src/art/native-characters';
import {sampleStaff} from '../src/presentation/native-staff';
import {materialRenderState} from '../src/art/materials';
import {buildNativeCharacterGlb} from '../tools/export-native-characters';
const kinds:NativeCharacterKind[]=['misaki','visitor-a','visitor-b'];
const sha=(b:Buffer)=>crypto.createHash('sha256').update(b).digest('hex');
const manifest=()=>JSON.parse(fs.readFileSync('assets/authoring/native-v3/manifest.json','utf8'));

test('native v3 characters have distinct custom silhouettes, full local articulation and grounded 3.5–4 head proportions',()=>{
 const silhouettes=[];
 for(const kind of kinds){const parts=nativeCharacterParts(kind),lookup=new Map(parts.map(p=>[p.id,p]));
  for(const id of ['body','head','arm-left','arm-right','forearm-left','forearm-right','hand-left','hand-right','socket-left','socket-right','leg-left','leg-right','shin-left','shin-right','foot-left','foot-right','eye-left','eye-right','eyelid-left','eyelid-right','mouth','hair-secondary-left','hair-secondary-right'])assert.ok(lookup.has(id),id);
  const offset=(id:string):number[]=>{const p=lookup.get(id)!;return p.pivot.map((v,i)=>v+(p.parent?offset(p.parent)[i]:0));};
  let bottom=Infinity,top=-Infinity,headMin=Infinity,headMax=-Infinity,triangles=0,custom=0;
  for(const part of parts){assert.ok(!part.parent||lookup.has(part.parent));const at=offset(part.id);for(const surface of part.recipe){const g=nativeSurfaceGeometry(surface);custom+=Number(surface.shape==='mesh');triangles+=g.indices.length/3;for(let i=0;i<g.positions.length;i+=3){assert.ok(g.positions.slice(i,i+3).every(Number.isFinite));assert.ok(Math.abs(Math.hypot(...g.normals.slice(i,i+3))-1)<1e-11);bottom=Math.min(bottom,g.positions[i+1]+at[1]);top=Math.max(top,g.positions[i+1]+at[1]);if(part.id==='head'){if(surface===part.recipe[0])headMin=Math.min(headMin,g.positions[i+1]);headMax=Math.max(headMax,g.positions[i+1]);}}for(let i=0;i<g.indices.length;i+=3){const ids=g.indices.slice(i,i+3),a=ids.map(id=>g.positions.slice(id*3,id*3+3)),u=a[1].map((v,k)=>v-a[0][k]),v=a[2].map((v,k)=>v-a[0][k]),n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],sum=[0,1,2].map(k=>ids.reduce((s,id)=>s+g.normals[id*3+k],0));assert.ok(n.reduce((s,v,k)=>s+v*sum[k],0)>1e-17,'nondegenerate outward triangle');}}}
  assert.ok(Math.abs(bottom-.015)<1e-12,`real sole ${kind}: ${bottom}`);assert.equal(nativeRigContract.soleRestY,.015);assert.ok((top-bottom)/(headMax-headMin)>=3.5&&(top-bottom)/(headMax-headMin)<=4);assert.ok(custom>=15,'custom lofts form face, locks and tailored clothes');assert.ok(triangles<12000,'bounded geometry per pooled actor');
  silhouettes.push(JSON.stringify(parts.map(p=>[p.id,p.pivot,p.recipe.filter(s=>s.shape==='mesh').map(s=>nativeSurfaceGeometry(s).positions)])));
 }
 assert.equal(new Set(silhouettes).size,3,'not same mesh recoloured');
 const shoe=nativeGrouped(nativeCharacterParts('misaki').find(p=>p.id==='foot-right')!.recipe);assert.ok(shoe.some(g=>g.color==='#59483F'&&g.roughness===.48&&g.materialId.endsWith(':native-r0.48')));assert.ok(shoe.some(g=>g.color==='#8C7764'&&g.roughness===.84),'sole stays matte');
});

test('native v3 GLB outputs match runtime vertices, material linear factors, local pivots and parent hierarchy',()=>{
 const m=manifest();assert.equal(m.assets.length,3);
 for(const asset of m.assets){const kind=asset.kind as NativeCharacterKind,bytes=fs.readFileSync(asset.file);assert.equal(bytes.length,asset.bytes);assert.equal(sha(bytes),asset.sha256);assert.deepEqual(fs.readFileSync(asset.web),bytes);assert.deepEqual(buildNativeCharacterGlb(kind),bytes,'deterministic rebuild');
  const len=bytes.readUInt32LE(12),j=JSON.parse(bytes.subarray(20,20+len).toString()),start=28+len;assert.equal(bytes.readUInt32LE(8),bytes.length);assert.equal(j.animations,undefined);assert.equal(j.skins,undefined);
  const read=(id:number)=>{const a=j.accessors[id],v=j.bufferViews[a.bufferView],offset=start+(v.byteOffset??0);return Array.from({length:a.count*(a.type==='VEC3'?3:1)},(_,i)=>a.componentType===5126?bytes.readFloatLE(offset+i*4):bytes.readUInt32LE(offset+i*4));};
  for(const part of nativeCharacterParts(kind)){const ni=j.nodes.findIndex((n:any)=>n.name===part.id),node=j.nodes[ni],parent=j.nodes.find((n:any)=>n.name===part.parent)??j.nodes[0];assert.deepEqual(node.translation,part.pivot);assert.ok(parent.children.includes(ni));const groups=nativeGrouped(part.recipe);assert.equal(node.children?.length??0,groups.length+nativeCharacterParts(kind).filter(p=>p.parent===part.id).length);
   const surfaces=(node.children??[]).map((i:number)=>j.nodes[i]).filter((n:any)=>n.mesh!==undefined);assert.equal(surfaces.length,groups.length);groups.forEach((g,i)=>{const prim=j.meshes[surfaces[i].mesh].primitives[0],mat=j.materials[prim.material],render=materialRenderState(g.role,g.color,g.alpha);for(const [actual,expected] of [[read(prim.attributes.POSITION),g.geometry.positions],[read(prim.attributes.NORMAL),g.geometry.normals]]){assert.equal(actual.length,expected.length);actual.forEach((v:number,k:number)=>assert.ok(Math.abs(v-expected[k])<1e-7));}assert.deepEqual(read(prim.indices),g.geometry.indices);assert.deepEqual(mat.pbrMetallicRoughness.baseColorFactor,[...render.baseColorLinear,1]);assert.equal(mat.pbrMetallicRoughness.roughnessFactor,g.roughness);assert.equal(mat.name,g.materialId);});
  }
 }
 for(const [file,digest] of Object.entries(m.sourceSha256))assert.equal(sha(fs.readFileSync(file)),digest,file);
});

// Ray/triangle parity on actual closed authored garment surfaces, with an AABB
// early out. This handles tapered/pleated meshes rather than assuming cylinders.
function solidContains(surface:NativeSurface){
 const g=nativeSurfaceGeometry(surface),lo=[0,1,2].map(k=>g.positions.reduce((v,x,i)=>i%3===k?Math.min(v,x):v,Infinity)),hi=[0,1,2].map(k=>g.positions.reduce((v,x,i)=>i%3===k?Math.max(v,x):v,-Infinity));
 const direction=new Vector3(1,.213,.379).normalize(),triangles:Vector3[][]=[];for(let i=0;i<g.indices.length;i+=3)triangles.push(g.indices.slice(i,i+3).map(id=>Vector3.FromArray(g.positions,id*3)));
 return (point:Vector3)=>{const a=point.asArray();if(a.some((v,k)=>v<=lo[k]+1e-8||v>=hi[k]-1e-8))return false;let count=0;for(const [v0,v1,v2] of triangles){const e1=v1.subtract(v0),e2=v2.subtract(v0),h=Vector3.Cross(direction,e2),det=Vector3.Dot(e1,h);if(Math.abs(det)<1e-10)continue;const f=1/det,s=point.subtract(v0),u=f*Vector3.Dot(s,h);if(u<0||u>1)continue;const q=Vector3.Cross(s,e1),v=f*Vector3.Dot(direction,q);if(v<0||u+v>1)continue;if(f*Vector3.Dot(e2,q)>1e-8)count++;}return count%2===1;};
}

test('new native Misaki greeting keeps actual articulated palm/thumb vertices outside new torso, apron and skirt',()=>{
 const parts=nativeCharacterParts('misaki'),clothes=parts.find(p=>p.id==='body')!.recipe.filter(s=>s.role==='fabric').map(solidContains),rightHand=parts.find(p=>p.id==='hand-right')!.recipe.map(nativeSurfaceGeometry);
 const engine=new NullEngine(),scene=new Scene(engine);scene.useRightHandedSystem=true;try{
  const nodes=new Map<string,TransformNode>();for(const part of parts){const node=new TransformNode(part.id,scene);node.position.set(...part.pivot);nodes.set(part.id,node);}for(const part of parts)if(part.parent)nodes.get(part.id)!.parent=nodes.get(part.parent)!;
  for(let n=0;n<=100;n++){const pose=sampleStaff(0,undefined,n/100);for(const [id,rot] of Object.entries(pose.rotations))nodes.get(id)?.rotation.set(...rot);for(const node of nodes.values())node.computeWorldMatrix(true);const matrix=nodes.get('hand-right')!.getWorldMatrix();for(const g of rightHand)for(let i=0;i<g.positions.length;i+=3){const vertex=Vector3.TransformCoordinates(Vector3.FromArray(g.positions,i),matrix);assert.ok(!clothes.some(contains=>contains(vertex)),`new hand penetrates actual clothes at ${n/100}`);}}
 }finally{scene.dispose();engine.dispose();}
});
