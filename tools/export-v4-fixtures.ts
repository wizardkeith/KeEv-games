import {catalog} from '../src/core/contracts';
import {nativeProductRecipe} from '../src/art/native-products';
/** Reusable individual fixture GLBs: actual runtime vertices, per-face UVs,
 * embedded original wood texture, metres/RH/+Y. No baked lighting or scene merge. */
import fs from 'node:fs';import {createHash} from 'node:crypto';
import {nativeGrouped,type NativeSurface} from '../src/art/native-characters';
import {nativeRoomRecipe,nativeCounterRecipe,nativeDisplayRecipe} from '../src/art/native-environment';
import {nativeMaterialIntent} from '../src/art/native-materials';
const texture=fs.readFileSync('assets/masters/native-v4/wood-grain-basecolor.png');
export function fixtureGlb(name:string,parts:NativeSurface[]){
 const chunks:Buffer[]=[],views:any[]=[],accessors:any[]=[];let offset=0;
 const append=(b:Buffer,target?:number)=>{const pad=(4-offset%4)%4;if(pad){chunks.push(Buffer.alloc(pad));offset+=pad;}const n=views.length;views.push({buffer:0,byteOffset:offset,byteLength:b.length,...(target?{target}:{})});chunks.push(b);offset+=b.length;return n;};
 const acc=(values:number[],components:number,target:number)=>{const b=Buffer.alloc(values.length*4);values.forEach((v,i)=>target===34963?b.writeUInt32LE(v,i*4):b.writeFloatLE(v,i*4));const v=append(b,target),id=accessors.length;accessors.push({bufferView:v,componentType:target===34963?5125:5126,count:values.length/components,type:components===3?'VEC3':components===2?'VEC2':'SCALAR',...(components===3?{min:[0,1,2].map(k=>Math.min(...values.filter((_,i)=>i%3===k))),max:[0,1,2].map(k=>Math.max(...values.filter((_,i)=>i%3===k)))}:{})});return id;};
 const groups=nativeGrouped(parts),materials:any[]=[],primitives=groups.map(g=>{const spec=nativeMaterialIntent(g),mat=materials.length;materials.push({name:g.materialId,pbrMetallicRoughness:{baseColorFactor:[...spec.baseColorLinear,g.alpha],roughnessFactor:g.roughness,metallicFactor:spec.metallic,...(g.role==='wood'?{baseColorTexture:{index:0}}:{})},...(g.alpha<1?{alphaMode:'BLEND'}:{}),doubleSided:!spec.backFaceCulling});return {attributes:{POSITION:acc(g.geometry.positions,3,34962),NORMAL:acc(g.geometry.normals,3,34962),TEXCOORD_0:acc(g.geometry.uvs!,2,34962)},indices:acc(g.geometry.indices,1,34963),material:mat};});
 const imageView=append(texture);const bin=Buffer.concat(chunks),bp=Buffer.concat([bin,Buffer.alloc((4-bin.length%4)%4)]);
 const json={asset:{version:'2.0',generator:'KeEv original v4 fixture exporter'},scene:0,scenes:[{nodes:[0]}],nodes:[{name,mesh:0}],meshes:[{primitives}],materials,buffers:[{byteLength:bin.length}],bufferViews:views,accessors,images:[{bufferView:imageView,mimeType:'image/png'}],samplers:[{magFilter:9729,minFilter:9987,wrapS:10497,wrapT:10497}],textures:[{source:0,sampler:0}]};
 const jb=Buffer.from(JSON.stringify(json)),jp=Buffer.concat([jb,Buffer.alloc((4-jb.length%4)%4,32)]),header=Buffer.alloc(12),jh=Buffer.alloc(8),bh=Buffer.alloc(8);header.writeUInt32LE(0x46546c67);header.writeUInt32LE(2,4);header.writeUInt32LE(28+jp.length+bp.length,8);jh.writeUInt32LE(jp.length);jh.writeUInt32LE(0x4e4f534a,4);bh.writeUInt32LE(bp.length);bh.writeUInt32LE(0x004e4942,4);return Buffer.concat([header,jh,jp,bh,bp]);
}
const root='assets/masters/native-v4';fs.mkdirSync(root,{recursive:true});
const assets=[['room',nativeRoomRecipe()],['counter',nativeCounterRecipe()],...[0,1,2].map(n=>['display-'+(n+1),nativeDisplayRecipe(n)]),...catalog.offerings.map(o=>['product-'+o.id,nativeProductRecipe(o.id,o.color)])] as [string,NativeSurface[]][];
const records=assets.map(([id,parts])=>{const file=`${root}/${id}.glb`,bytes=fixtureGlb(id,parts);fs.writeFileSync(file,bytes);return{id,file,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')};});fs.writeFileSync(root+'/fixtures-manifest.json',JSON.stringify({source:'tools/export-v4-fixtures.ts',rights:'Original authored procedural geometry and texture for this game',units:'metres',axes:'RH +Y up',uv:'nativeSurfaceGeometry metre-based box projection; sRGB base color; no baked lighting',assets:records},null,2)+'\n');console.log(records);
