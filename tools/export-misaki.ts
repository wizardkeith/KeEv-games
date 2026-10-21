// Build original Day 1 interchange assets from exactly the runtime recipes.
import fs from 'node:fs';
import crypto from 'node:crypto';
import {pathToFileURL} from 'node:url';
// @ts-expect-error Upstream gltf-validator supplies no declarations.
import validator from 'gltf-validator';
import {misakiParts,misakiIdentity,misakiPalette,type MisakiExpression} from '../src/art/misaki';
import {grouped} from '../src/art/geometry';
import {materialRenderState,materialSpec} from '../src/art/materials';
const hash=(b:Buffer)=>crypto.createHash('sha256').update(b).digest('hex');

/** Rigid articulated nodes, not a skinned rig. Vertices are local to each authored pivot. */
export function buildMisakiGlb(expression:MisakiExpression){
 const chunks:Buffer[]=[],views:object[]=[],accessors:object[]=[],materials:object[]=[],meshes:object[]=[],nodes:any[]=[{name:misakiIdentity.id,children:[],extras:{economicBinding:misakiIdentity.economicBinding,expression,authoring:'src/art/misaki.ts',rig:'procedural rigid part pivots, no skeleton or embedded clips'}}];let offset=0;
 const acc=(values:number[],type:'VEC3'|'SCALAR',target:number,bounds=false)=>{
  const data=type==='SCALAR'?new Uint32Array(values):new Float32Array(values),buffer=Buffer.from(data.buffer),view=views.length;
  views.push({buffer:0,byteOffset:offset,byteLength:buffer.byteLength,target});chunks.push(buffer);offset+=buffer.byteLength;
  const a:any={bufferView:view,componentType:type==='SCALAR'?5125:5126,count:data.length/(type==='VEC3'?3:1),type};
  if(bounds){a.min=[0,1,2].map(j=>Math.min(...values.filter((_,i)=>i%3===j)));a.max=[0,1,2].map(j=>Math.max(...values.filter((_,i)=>i%3===j)));}
  accessors.push(a);return accessors.length-1;
 };
 for(const part of misakiParts(expression)){
  const parent=nodes.length;nodes.push({name:part.id,translation:part.pivot,children:[]});nodes[0].children.push(parent);
  const local=part.recipe.map(p=>({...p,at:p.at.map((n,i)=>n-part.pivot[i]) as [number,number,number]}));
  for(const g of grouped(local)){
   const render=materialRenderState(g.role,g.color,g.alpha),mi=materials.length,mesh=meshes.length;
   materials.push({name:render.materialId,extras:{semanticRole:g.role,authoredSrgbHex:g.color,colorEncoding:render.colorEncoding,iorIntent:render.indexOfRefraction},doubleSided:render.doubleSided,pbrMetallicRoughness:{baseColorFactor:[...render.baseColorLinear,g.alpha],metallicFactor:render.metallic,roughnessFactor:render.roughness},...(render.alphaBlend?{alphaMode:'BLEND'}:{})});
   meshes.push({name:`${part.id}.${g.role}.${mesh}`,primitives:[{attributes:{POSITION:acc(g.geometry.positions,'VEC3',34962,true),NORMAL:acc(g.geometry.normals,'VEC3',34962)},indices:acc(g.geometry.indices,'SCALAR',34963),material:mi}]});
   const child=nodes.length;nodes.push({name:`${part.id}.${g.role}.${mesh}`,mesh});nodes[parent].children.push(child);
  }
 }
 const binary=Buffer.concat(chunks);let json=Buffer.from(JSON.stringify({asset:{version:'2.0',generator:'KeEv original Day 1 Misaki shared recipe'},scene:0,scenes:[{name:`Misaki ${expression}`,nodes:[0]}],nodes,meshes,materials,buffers:[{byteLength:binary.length}],bufferViews:views,accessors}));
 json=Buffer.concat([json,Buffer.alloc((4-json.length%4)%4,32)]);const header=Buffer.alloc(20),bh=Buffer.alloc(8);header.writeUInt32LE(0x46546c67);header.writeUInt32LE(2,4);header.writeUInt32LE(28+json.length+binary.length,8);header.writeUInt32LE(json.length,12);header.writeUInt32LE(0x4e4f534a,16);bh.writeUInt32LE(binary.length);bh.writeUInt32LE(0x004e4942,4);return Buffer.concat([header,json,bh,binary]);
}

export async function exportMisaki(){
 for(const p of ['assets/masters/day1','public/assets/day1','assets/authoring/day1'])fs.mkdirSync(p,{recursive:true});
 const assets=[];
 for(const expression of ['calm','smile'] as const){
  const bytes=buildMisakiGlb(expression),name=`misaki-${expression}-v1`,file=`assets/masters/day1/${name}.glb`,web=`public/assets/day1/${name}.glb`;
  const v=await validator.validateBytes(new Uint8Array(bytes),{uri:name+'.glb'});if(v.issues.numErrors||v.issues.numWarnings)throw Error(JSON.stringify(v.issues));
  fs.writeFileSync(file,bytes);fs.writeFileSync(web,bytes);
  assets.push({id:`${misakiIdentity.id}.${expression}`,expression,file,web,bytes:bytes.length,sha256:hash(bytes),parts:misakiParts(expression).map(part=>({id:part.id,pivot:part.pivot,groups:grouped(part.recipe).map(g=>({materialId:g.materialId,role:g.role,color:g.color,alpha:g.alpha,...materialSpec(g.role)}))})),validation:{errors:v.issues.numErrors,warnings:v.issues.numWarnings,infos:v.issues.numInfos}});
 }
 const sourceFiles=['src/art/misaki.ts','src/art/geometry.ts','src/art/materials.ts','src/art/recipes.ts','tools/export-misaki.ts'];
 const source=Object.fromEntries(sourceFiles.map(p=>[p,hash(fs.readFileSync(p))]));
 fs.writeFileSync('assets/authoring/day1/manifest.json',JSON.stringify({version:'day1-misaki-v1',identity:misakiIdentity,units:'metres',axes:'right handed, +Y up; scene +Z forward convention, authored actor face -Z matches existing world yaw adapter',pivot:'local shoes bottom=.015; runtime actorBaseY=.065 gives floor+.001',recipe:'src/art/misaki.ts',exportCommand:'node --import tsx tools/export-misaki.ts',sourceSha256:source,palette:misakiPalette,animation:{type:'procedural rigid part rotation; no skeleton / skins / embedded clips',sampler:'misakiPose(kind,progress)',rootMotion:false,expressions:'two authored head recipes; runtime toggles head nodes',owner:'presentation clock owns hide/skip/import/mode/quality cancellation'},rights:'Original project procedural geometry and design; no external model, texture or audio licence introduced',visualStatus:'structure/export/source parity checked; actual new 3D appearance and native material calibration require real rendering',assets},null,2)+'\n');
 console.log(JSON.stringify({assets:assets.length,bytes:assets.reduce((n,a)=>n+a.bytes,0),errors:0,warnings:0}));
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)await exportMisaki();
