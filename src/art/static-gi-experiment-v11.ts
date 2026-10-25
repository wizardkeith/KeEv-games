/** Local art experiment only. Static indirect-light atlas from real geometry,
 * never a replacement scene image or a gameplay/sale authority. Compile flag
 * is absent in the default build until rendered A/B and asset gates accept it. */
import {Mesh} from '@babylonjs/core/Meshes/mesh';import {VertexBuffer} from '@babylonjs/core/Buffers/buffer';import {Texture} from '@babylonjs/core/Materials/Textures/texture';import {PBRMaterial} from '@babylonjs/core/Materials/PBR/pbrMaterial';import {Color3} from '@babylonjs/core/Maths/math.color';import type {Scene} from '@babylonjs/core/scene';
export function staticGeometrySignature(g:{positions:ArrayLike<number>;normals:ArrayLike<number>;uvs:ArrayLike<number>;indices:ArrayLike<number>}){let h=2166136261;for(const a of [new Float32Array(g.positions),new Float32Array(g.normals),new Float32Array(g.uvs),new Uint32Array(g.indices)])for(const b of new Uint8Array(a.buffer))h=Math.imul(h^b,16777619);return(h>>>0).toString(16).padStart(8,'0');}
export async function installExperimentalStaticGI(scene:Scene){
 const [index,bytes]=await Promise.all([fetch('/assets/native-v11/static-gi-index.json').then(r=>{if(!r.ok)throw Error('experimental GI index missing');return r.json();}),fetch('/assets/native-v11/static-gi-uv.bin').then(r=>{if(!r.ok)throw Error('experimental GI UVs missing');return r.arrayBuffer();})]);
 const texture=new Texture('/assets/native-v11/static-indirect-prototype.png',scene,false,false);texture.gammaSpace=true;texture.coordinatesIndex=2;texture.wrapU=Texture.CLAMP_ADDRESSMODE;texture.wrapV=Texture.CLAMP_ADDRESSMODE;
 const cloned=new Map<PBRMaterial,PBRMaterial>();let applied=0,stale=0;
 for(const raw of scene.meshes){if(!(raw instanceof Mesh)||raw.name.startsWith('native.window.')||raw.metadata?.authoredColor==='#F8DDA5')continue;const record=index.records[raw.name];if(!record)continue;const positions=raw.getVerticesData(VertexBuffer.PositionKind)!,normals=raw.getVerticesData(VertexBuffer.NormalKind)!,uvs=raw.getVerticesData(VertexBuffer.UVKind)!,indices=raw.getIndices()!;
  if(record.indexCount!==indices.length||staticGeometrySignature({positions,normals,uvs,indices})!==record.signature){stale++;continue;}
  const repeat=(data:ArrayLike<number>,size:number)=>Array.from(indices).flatMap(i=>Array.from({length:size},(_,k)=>data[i*size+k]));const uv2=raw.getVerticesData(VertexBuffer.UV2Kind),uv3=new Float32Array(bytes,record.offset,record.byteLength/4);
  raw.setVerticesData(VertexBuffer.PositionKind,repeat(positions,3));raw.setVerticesData(VertexBuffer.NormalKind,repeat(normals,3));raw.setVerticesData(VertexBuffer.UVKind,repeat(uvs,2));if(uv2)raw.setVerticesData(VertexBuffer.UV2Kind,repeat(uv2,2));raw.setVerticesData(VertexBuffer.UV3Kind,uv3);raw.setIndices(Array.from({length:indices.length},(_,i)=>i));raw.refreshBoundingInfo();
  const original=raw.material as PBRMaterial;let mat=cloned.get(original);if(!mat){mat=original.clone('experimental.indirect.'+original.name)!;mat.emissiveTexture=texture;mat.emissiveColor=Color3.White();cloned.set(original,mat);}raw.material=mat;applied++;
 }
 scene.metadata={...scene.metadata,staticGIExperiment:{applied,stale,source:'actual static mesh/textured Cycles indirect bake; no actors or sellable tabletop stock',physicalAcceptance:false}};
}
