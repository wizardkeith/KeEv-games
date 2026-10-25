/** Bounded local renderer diagnostic only; never the proposed game appearance.
 * Same real meshes/rig/camera/clock. Control records them; neutral removes cloth
 * textures/IBL and binds one diffuse direction to isolate primary form shading.
 */
import {Mesh} from '@babylonjs/core/Meshes/mesh';
import {VertexBuffer} from '@babylonjs/core/Buffers/buffer';
import {DirectionalLight} from '@babylonjs/core/Lights/directionalLight';
import {StandardMaterial} from '@babylonjs/core/Materials/standardMaterial';
import {Material} from '@babylonjs/core/Materials/material';
import {Vector3} from '@babylonjs/core/Maths/math.vector';
import {Color3} from '@babylonjs/core/Maths/math.color';
import type {Scene} from '@babylonjs/core/scene';
function signature(m:Mesh){
 let h=2166136261;
 for(const a of [new Float32Array(m.getVerticesData(VertexBuffer.PositionKind)!),new Float32Array(m.getVerticesData(VertexBuffer.NormalKind)!),new Uint32Array(m.getIndices()!)])for(const b of new Uint8Array(a.buffer))h=Math.imul(h^b,16777619);
 return(h>>>0).toString(16).padStart(8,'0');
}
export function installClothDiagnostic(scene:Scene,mode:'control'|'neutral'){
 const meshes=scene.meshes.filter((m):m is Mesh=>m instanceof Mesh&&m.name.startsWith('actor.')&&m.metadata?.materialRole==='fabric');
 const before=meshes.map(m=>({name:m.name,signature:signature(m),material:m.material?.name}));
 if(mode==='neutral'){
  for(const l of [...scene.lights])l.excludedMeshes=[...l.excludedMeshes,...meshes];
  const light=new DirectionalLight('DIAGNOSTIC ONLY single diffuse direction',new Vector3(-.75,-.60,.15),scene);light.diffuse=Color3.White();light.specular=Color3.Black();light.intensity=1;light.includedOnlyMeshes=meshes;
  const material=new StandardMaterial('DIAGNOSTIC ONLY neutral cloth, not art',scene);material.diffuseColor=new Color3(.6,.6,.6);material.specularColor=Color3.Black();material.ambientColor=Color3.Black();material.emissiveColor=Color3.Black();material.maxSimultaneousLights=1;material.sideOrientation=Material.CounterClockWiseSideOrientation;material.backFaceCulling=true;material.twoSidedLighting=false;
  for(const m of meshes)m.material=material;
 }
 const after=meshes.map(m=>({name:m.name,signature:signature(m),boundLights:m.lightSources.slice(0,mode==='neutral'?1:4).map(l=>l.name)}));
 if(before.some((m,i)=>m.name!==after[i].name||m.signature!==after[i].signature))throw Error('diagnostic changed actual cloth geometry');
 scene.metadata={...scene.metadata,clothDiagnostic:{mode,label:mode==='neutral'?'DIAGNOSTIC actual renderer, neutral cloth + single diffuse direction; NOT normal game art':'CONTROL current real game material/light, geometry unchanged',before,after,geometryUnchanged:true,scope:'Material/light diagnostic only; no pose/camera/time/inventory/sale mutation',singleDirection:mode==='neutral'?[-.75,-.60,.15]:null,shadowlessDiffuse:mode==='neutral'}};
}
