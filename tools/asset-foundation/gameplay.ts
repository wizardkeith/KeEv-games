/** Isolated DEV authoring entry. Uses the real application and existing normal
 * camera, without changes to production sources, simulation or save format.
 * Component set is decorative preview geometry; it never grants SKU stock. */
import {EngineStore} from '@babylonjs/core/Engines/engineStore';
import {SceneLoader} from '@babylonjs/core/Loading/sceneLoader';
import {TransformNode} from '@babylonjs/core/Meshes/transformNode';
import {PBRMaterial} from '@babylonjs/core/Materials/PBR/pbrMaterial';
import {Color3} from '@babylonjs/core/Maths/math.color';
import {Vector3} from '@babylonjs/core/Maths/math.vector';
import {ShadowGenerator} from '@babylonjs/core/Lights/Shadows/shadowGenerator';
import {Mesh} from '@babylonjs/core/Meshes/mesh';
import '@babylonjs/loaders/glTF';
if (!import.meta.env.DEV) throw Error('Authoring fixture is DEV only');
const params=new URLSearchParams(location.search),mode=params.get('mode')??'material';
while(!(window as any).littleShopDiagnostics?.().worldReady) await new Promise(r=>setTimeout(r,100));
const scene=EngineStore.LastCreatedScene!;
const removed:{name:string;triangles:number}[]=[];
// Replace only the middle fixture. Existing pick/shelf lifecycle is retained by
// the app; this dedicated authoring page stages no purchasable samples there.
for(const m of scene.meshes.filter(m=>m.name.startsWith('display.2.material'))) {m.setEnabled(false);removed.push({name:m.name,triangles:m.getTotalIndices()/3});}
// Styling is batched by material. Exclude existing middle-vignette triangles
// from its draw indices, retaining the rest of each batch byte-for-byte.
for(const m of scene.meshes.filter((m):m is Mesh=>m instanceof Mesh&&(m.name.startsWith('room.styling.')||m.name.startsWith('back.display.curated.')))){
 const p=m.getVerticesData('position'),idx=m.getIndices();if(!p||!idx)continue;
 const inside=(v:number)=>p[v*3]>-.95&&p[v*3]<1.15&&p[v*3+1]>.80&&p[v*3+1]<2.1&&p[v*3+2]>-.72&&p[v*3+2]<.52;
 const kept:number[]=[];for(let i=0;i<idx.length;i+=3)if(![idx[i],idx[i+1],idx[i+2]].every(inside))kept.push(idx[i],idx[i+1],idx[i+2]);
 if(kept.length<idx.length){m.setIndices(kept);removed.push({name:m.name,triangles:(idx.length-kept.length)/3});}
}
const asset=await SceneLoader.ImportMeshAsync(null,'/assets/asset-foundation-v1/','display-set.glb',scene);
const placement=new TransformNode('foundation.preview.placement',scene);placement.position.set(.1,.079,-.1);placement.rotation.y=Math.PI;
asset.meshes[0].parent=placement;
for(const m of asset.meshes){m.receiveShadows=true;m.isPickable=false;const mat=m.material as PBRMaterial;if(mat instanceof PBRMaterial){mat.environmentIntensity=.8;mat.maxSimultaneousLights=8;}for(const light of scene.lights){const generator=light.getShadowGenerator();if(generator instanceof ShadowGenerator)generator.addShadowCaster(m);}}
const sourceMaterials=[...new Set(asset.meshes.map(m=>m.material))].filter((m):m is PBRMaterial=>m instanceof PBRMaterial);
const gray=new PBRMaterial('Foundation neutral grayform',scene);gray.albedoColor=Color3.FromHexString('#BEBEBE').toLinearSpace();gray.roughness=.78;gray.maxSimultaneousLights=8;gray.environmentIntensity=.8;
const materials=new Map(asset.meshes.map(m=>[m,m.material]));
if(mode==='gray')for(const m of asset.meshes)if(m.getTotalVertices())m.material=gray;
await scene.whenReadyAsync();
// Public authoring control used only by this fixture/capture. Studio framing is
// explicitly supplementary; normal screenshots use the application's camera.
const normalCamera=scene.activeCamera as any,normalAlpha=normalCamera.alpha,normalBeta=normalCamera.beta;
Object.assign(window,{foundation:{afterRender:()=>new Promise(resolve=>scene.onAfterRenderObservable.addOnce(()=>resolve(true))),oblique:(side:number)=>{normalCamera.alpha=normalAlpha+side*.24;normalCamera.beta=normalBeta;normalCamera.inertialAlphaOffset=normalCamera.inertialBetaOffset=normalCamera.inertialRadiusOffset=0;},ready:true,mode,lighting:{maxSimultaneousLights:8,environmentIntensity:.8,sceneEnvironmentIntensity:scene.environmentIntensity,exposure:scene.imageProcessingConfiguration.exposure,lights:scene.lights.map(l=>({name:l.name,type:l.getClassName(),intensity:l.intensity,enabled:l.isEnabled()})),actualMaterials:[...sourceMaterials,gray].map(m=>({name:m.name,maxSimultaneousLights:m.maxSimultaneousLights,environmentIntensity:m.environmentIntensity}))},removed,meshes:asset.meshes.filter(m=>m.getTotalVertices()).map(m=>({name:m.name,vertices:m.getTotalVertices(),triangles:m.getTotalIndices()/3})),materials:sourceMaterials.map(m=>({name:m.name,albedo:m.albedoColor.asArray(),roughness:m.roughness,clearcoat:m.clearCoat.intensity})),gray:(on:boolean)=>{for(const[m,mat]of materials)m.material=on&&m.getTotalVertices()?gray:mat;},studio:()=>{const c=scene.activeCamera as any;c.lowerRadiusLimit=1;c.upperRadiusLimit=30;c.setTarget(new Vector3(.1,.84,-.1));c.radius=3.1;c.alpha=-Math.PI/4;c.beta=1.04;},source:'Actual app scene plus independently imported GLB; dedicated DEV fixture; no save commands'}});
