/** C49 authoring-only spatial indirect approximation. Diffuse hemispheres and
 * diffuse IBL only; direct key/shadows, specular IBL and exposure are untouched. */
import {MaterialPluginBase} from '@babylonjs/core/Materials/materialPluginBase';
import {PBRMaterial} from '@babylonjs/core/Materials/PBR/pbrMaterial';
import type {Scene} from '@babylonjs/core/scene';

export const spatialDiffuseIntent={id:'v11.c49.world-normal-diffuse.v1',defaultAdopted:false,horizontalBase:.48,cashier:[2.6,-1.5],cashierRadii:[1.65,1.4],scope:'One smooth world-position/world-normal diffuse-only approximation; not GI. No screen-coordinate light, specular change, texture or new asset.'}as const;
export const spatialDiffuseMode=import.meta.env?.VITE_V11_SPATIAL_DIFFUSE??'off';
const smooth=(a:number,b:number,v:number)=>{const t=Math.max(0,Math.min(1,(v-a)/(b-a)));return t*t*(3-2*t);};
/** CPU mirror for the bounded field/support diagnostics, not a rendered light factor. */
export function spatialDiffuseWeight(p:readonly number[],n:readonly number[]){
 const inside=smooth(-4.65,-4.35,p[0])*(1-smooth(3.15,3.55,Math.abs(p[2])));
 const up=smooth(.25,.85,n[1]),cashier=Math.exp(-1.2*(((p[0]-2.6)/1.65)**2+((p[2]+1.5)/1.4)**2));
 const back=(1-smooth(-2.8,-1.95,p[2]))*.65,entry=smooth(1.3,2.7,p[2])*smooth(.8,2,p[0])*.55;
 return 1-inside*up*.52*(1-Math.max(cashier,back,entry));
}
export const spatialDiffuseGLSL=`
float c49DiffuseWeight(vec3 p, vec3 n) {
 float inside=smoothstep(-4.65,-4.35,p.x)*(1.0-smoothstep(3.15,3.55,abs(p.z)));
 float up=smoothstep(.25,.85,n.y);
 vec2 cashierDelta=(p.xz-vec2(2.6,-1.5))/vec2(1.65,1.4);
 float cashier=exp(-1.2*dot(cashierDelta,cashierDelta));
 float back=(1.0-smoothstep(-2.8,-1.95,p.z))*.65;
 float entry=smoothstep(1.3,2.7,p.z)*smoothstep(.8,2.0,p.x)*.55;
 return 1.0-inside*up*.52*(1.0-max(cashier,max(back,entry)));
}`;
// Babylon's public plugin regex insertion runs after include expansion. Restrict
// to its exact hemispheric diffuse call; never scale info.diffuse for key/points.
export const hemisphereDiffusePattern='!info\\.diffuse=computeHemisphericDiffuseLighting\\(preInfo,diffuse[0-9]+\\.rgb,light[0-9]+\\.vLightGround\\);';
export class SpatialDiffusePlugin extends MaterialPluginBase {
 constructor(m:PBRMaterial){super(m,'C49 spatial indirect diffuse',210,{},true,true);}
 getCustomCode(stage:string):Record<string,string>|null{return stage==='fragment'?{
  CUSTOM_FRAGMENT_DEFINITIONS:spatialDiffuseGLSL,
  [hemisphereDiffusePattern]:'$0\ninfo.diffuse*=c49DiffuseWeight(vPositionW,normalW);',
  CUSTOM_FRAGMENT_BEFORE_FINALCOLORCOMPOSITION:`
#if defined(REFLECTION) && !defined(UNLIT)
finalIrradiance*=c49DiffuseWeight(vPositionW,normalW);
#endif`
 }:null;}
}
export function installSpatialDiffuse(scene:Scene,mode=spatialDiffuseMode){
 if(mode==='off')return undefined;
 if(mode!=='on')throw Error('Unknown C49 spatial diffuse mode');
 const applied=new Map<PBRMaterial,SpatialDiffusePlugin>();
 const apply=(m:unknown)=>{if(m instanceof PBRMaterial&&!m.unlit&&!applied.has(m)){applied.set(m,new SpatialDiffusePlugin(m));m.onDisposeObservable.addOnce(()=>applied.delete(m));}};
 scene.materials.forEach(apply);const observer=scene.onNewMaterialAddedObservable.add(m=>queueMicrotask(()=>{if(!scene.isDisposed)apply(m);}));const before=scene.onBeforeRenderObservable.add(()=>scene.materials.forEach(apply));
 scene.onDisposeObservable.addOnce(()=>{scene.onNewMaterialAddedObservable.remove(observer);scene.onBeforeRenderObservable.remove(before);});
 return{metrics(){return{...spatialDiffuseIntent,mode,appliedMaterials:applied.size,environmentIntensity:scene.environmentIntensity,probes:[{p:[.1,.079,.8],n:[0,1,0]},{p:[.1,1.1,-.1],n:[0,1,0]},{p:[2.6,1.1,-1.5],n:[0,1,0]},{p:[0,1.5,-3.2],n:[0,0,1]}].map(v=>({...v,diffuseWeight:spatialDiffuseWeight(v.p,v.n)})),receivers:scene.meshes.filter(m=>['room.modular.material23','display.2.material0','fixture.shop-counter.w1_1.material0'].includes(m.name)).map(mesh=>{const m=mesh.material as PBRMaterial,shader=mesh.subMeshes?.[0]?.effect?.fragmentSourceCode??'';return{name:mesh.name,material:m.name,pluginApplied:applied.has(m),environmentIntensity:m.environmentIntensity,reflection:m.reflectionTexture?.name??null,compiled:{hasWorldField:shader.includes('float c49DiffuseWeight('),hemisphereCalls:(shader.match(/info\.diffuse\*=c49DiffuseWeight/g)??[]).length,irradianceCalls:(shader.match(/finalIrradiance\*=c49DiffuseWeight/g)??[]).length,specularFieldModification:/finalRadiance(?:Scaled)?\s*\*=\s*c49DiffuseWeight/.test(shader)}};})};}};
}
