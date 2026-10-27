/** C30 controlled authoring diagnostic, OFF in ordinary builds.
 * Replaces diffuse only with albedo-free transport on exact original vertices.
 * No emissive image, camera-facing substitute, geometry or reflected-light edit.
 * Dynamic shadow masking is deliberately not yet certified; not release-ready. */
import {MaterialPluginBase} from '@babylonjs/core/Materials/materialPluginBase';
import {PBRMaterial} from '@babylonjs/core/Materials/PBR/pbrMaterial';
import {Mesh} from '@babylonjs/core/Meshes/mesh';
import {VertexBuffer} from '@babylonjs/core/Buffers/buffer';
import {Vector3} from '@babylonjs/core/Maths/math.vector';
import type {Scene} from '@babylonjs/core/scene';
class TableDiffuseDiagnostic extends MaterialPluginBase {
 constructor(m:PBRMaterial){super(m,'C30 albedo-free diffuse diagnostic',200,{},true,true);}
 getAttributes(a:string[]){a.push('c30Direct','c30Bounce','c30Weight');}
 getCustomCode(stage:string):Record<string,string>{return stage==='vertex'?{
  CUSTOM_VERTEX_DEFINITIONS:'attribute vec3 c30Direct; attribute vec3 c30Bounce; attribute float c30Weight; varying vec3 vC30Direct; varying vec3 vC30Bounce; varying float vC30Weight;',
  CUSTOM_VERTEX_MAIN_END:'vC30Direct=c30Direct;vC30Bounce=c30Bounce;vC30Weight=c30Weight;'
 }:{
  CUSTOM_FRAGMENT_DEFINITIONS:'varying vec3 vC30Direct; varying vec3 vC30Bounce; varying float vC30Weight;',
  CUSTOM_FRAGMENT_BEFORE_FINALCOLORCOMPOSITION:`
#ifndef UNLIT
float c30Weight=clamp(vC30Weight,0.0,1.0);
finalDiffuse=mix(finalDiffuse,surfaceAlbedo*(vC30Direct+vC30Bounce),c30Weight);
#ifdef REFLECTION
finalIrradiance*=1.0-c30Weight;
#endif
finalAmbient*=1.0-c30Weight;
#endif`
 };}
}
export function irradianceFingerprint(values:ArrayLike<number>){let h=2166136261;for(let i=0;i<values.length;i++)h=Math.imul(h^Math.round(values[i]*100000),16777619)>>>0;return h.toString(16).padStart(8,'0');}
export async function installTableIrradianceDiagnostic(scene:Scene){
 const response=await fetch('/assets/native-v11/table-irradiance-c30.json');if(!response.ok)throw Error('C30 diagnostic transport unavailable');const bytes=await response.arrayBuffer(),payloadSHA256=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(v=>v.toString(16).padStart(2,'0')).join(''),data=JSON.parse(new TextDecoder().decode(bytes));if(data.version!=='table-irradiance.c30.diagnostic.v1')throw Error('Wrong C30 transport version');const applied:string[]=[];
 const records=new Map<string,any>(data.records.map((r:any)=>[r.name,r]));
 const apply=(mesh:unknown)=>{if(!(mesh instanceof Mesh)||!(mesh.material instanceof PBRMaterial)||applied.includes(mesh.name))return;const r=records.get(mesh.name);if(!r)return;const world=mesh.computeWorldMatrix(true),p=mesh.getVerticesData(VertexBuffer.PositionKind),n=mesh.getVerticesData(VertexBuffer.NormalKind);if(!p||!n)return;const wp:number[]=[],wn:number[]=[];for(let i=0;i<p.length;i+=3){wp.push(...Vector3.TransformCoordinates(Vector3.FromArray(p,i),world).asArray());wn.push(...Vector3.TransformNormal(Vector3.FromArray(n,i),world).normalize().asArray());}
  if(r.vertices!==p.length/3||irradianceFingerprint(wp)!==r.positions||irradianceFingerprint(wn)!==r.normals){if(!mesh.name.includes('actual-stock-batch'))throw Error('Changed frozen geometry/normals '+r.name);return;}
  for(const k of ['direct','indirect'])if(r[k].length!==p.length||r[k].some((v:number)=>!Number.isFinite(v)||v<0||v>100))throw Error('Invalid diffuse field');
  if(r.weight.length!==p.length/3||r.weight.some((v:number)=>v!==0&&v!==1))throw Error('Invalid diffuse scope');
  mesh.setVerticesData('c30Direct',r.direct,false,3);mesh.setVerticesData('c30Bounce',r.indirect,false,3);mesh.setVerticesData('c30Weight',r.weight,false,1);
  const m=mesh.material.clone(mesh.material.name+':c30-diffuse-diagnostic');new TableDiffuseDiagnostic(m);mesh.material=m;applied.push(r.name);
 };
 scene.meshes.forEach(apply);const observer=scene.onNewMeshAddedObservable.add(m=>queueMicrotask(()=>{if(!scene.isDisposed)apply(m);}));scene.onDisposeObservable.addOnce(()=>scene.onNewMeshAddedObservable.remove(observer));
 scene.metadata={...scene.metadata,tableIrradiance:{version:data.version,status:'diagnostic-only',sourceSHA256:data.sourceSHA256,payloadSHA256,calibration:data.calibration??null,method:data.method,receivers:applied,limits:'Not release-ready: dynamic actors/stock shadow masking and alternate stock layouts pending. Current imported static8-stock only. No art acceptance.'}};
}
