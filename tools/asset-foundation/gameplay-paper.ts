/** New representative set only; imports the frozen R4 fixture as adjacent baseline. */
import './gameplay';
import {EngineStore}from'@babylonjs/core/Engines/engineStore';
import {SceneLoader}from'@babylonjs/core/Loading/sceneLoader';
import {TransformNode}from'@babylonjs/core/Meshes/transformNode';
import {Mesh}from'@babylonjs/core/Meshes/mesh';
import {PBRMaterial}from'@babylonjs/core/Materials/PBR/pbrMaterial';
import {ShadowGenerator}from'@babylonjs/core/Lights/Shadows/shadowGenerator';
import '@babylonjs/loaders/glTF';
if(!import.meta.env.DEV)throw Error('Authoring fixture only');
const scene=EngineStore.LastCreatedScene!,mode=new URLSearchParams(location.search).get('mode')??'material';
const existing=new Map(scene.materials.filter((m):m is PBRMaterial=>m instanceof PBRMaterial).map(m=>[m.name,m]));
const gray=existing.get('Foundation neutral grayform')!;const removed=[];
// One low-cost reused R4 table is a test stand. No flower/cloth replication.
for(const m of scene.meshes.filter(m=>m.name.startsWith('display.1.material'))){m.setEnabled(false);removed.push({name:m.name,triangles:m.getTotalIndices()/3});}
for(const m of scene.meshes.filter((m):m is Mesh=>m instanceof Mesh&&(m.name.startsWith('room.styling.')||m.name.startsWith('back.display.curated.')))){
 const p=m.getVerticesData('position'),idx=m.getIndices();if(!p||!idx)continue;
 const inside=(v:number)=>p[v*3]>-3.31&&p[v*3]<-1&&p[v*3+1]>.80&&p[v*3+1]<2.1&&p[v*3+2]>-2.12&&p[v*3+2]<-.88;
 const kept:number[]=[];for(let i=0;i<idx.length;i+=3)if(![idx[i],idx[i+1],idx[i+2]].every(inside))kept.push(idx[i],idx[i+1],idx[i+2]);
 if(kept.length<idx.length){m.setIndices(kept);removed.push({name:m.name,triangles:(idx.length-kept.length)/3});}
}
const placement=new TransformNode('paper.component.test-stand',scene);placement.position.set(-2,.079,-1.5);placement.rotation.y=Math.PI;
const stand=await SceneLoader.ImportMeshAsync(null,'/assets/asset-foundation-v1/','table.glb',scene);stand.meshes[0].parent=placement;
const paper=await SceneLoader.ImportMeshAsync(null,'/assets/asset-foundation-paper-v1/','paper-display-set.glb',scene);paper.meshes[0].parent=placement;paper.meshes[0].position.y=.905;
const all=[...stand.meshes,...paper.meshes],sourceMaterials=new Set<PBRMaterial>(),duplicates=new Set<PBRMaterial>(),materialReuses:string[]=[];
for(const m of all){m.isPickable=false;m.receiveShadows=true;let mat=m.material as PBRMaterial;if(mat instanceof PBRMaterial){const shared=existing.get(mat.name);if(shared&&shared!==mat){duplicates.add(mat);m.material=shared;mat=shared;materialReuses.push(mat.name);}mat.maxSimultaneousLights=8;mat.environmentIntensity=.8;sourceMaterials.add(mat);}for(const light of scene.lights){const g=light.getShadowGenerator();if(g instanceof ShadowGenerator)g.addShadowCaster(m);}}
for(const mat of duplicates)mat.dispose(false,true);
if(mode==='gray')for(const m of all)if(m.getTotalVertices())m.material=gray;
await scene.whenReadyAsync();
Object.assign(window,{paperFoundation:{ready:true,mode,removed,materialReuses:[...new Set(materialReuses)],standTriangles:stand.meshes.reduce((n,m)=>n+m.getTotalIndices()/3,0),newTriangles:paper.meshes.reduce((n,m)=>n+m.getTotalIndices()/3,0),meshes:paper.meshes.filter(m=>m.getTotalVertices()).map(m=>({name:m.name,triangles:m.getTotalIndices()/3,vertices:m.getTotalVertices()})),lighting:{maxSimultaneousLights:8,environmentIntensity:.8,sceneEnvironmentIntensity:scene.environmentIntensity,exposure:scene.imageProcessingConfiguration.exposure,lights:scene.lights.map(l=>({name:l.name,type:l.getClassName(),intensity:l.intensity,enabled:l.isEnabled()})),actualMaterials:[...sourceMaterials,gray].map(m=>({name:m.name,maxSimultaneousLights:m.maxSimultaneousLights,environmentIntensity:m.environmentIntensity})).sort((a,b)=>a.name.localeCompare(b.name))},source:'Frozen R4 adjacent baseline and one reused R4 table support new decorative GLB components. Original app, normal camera, no inventory grants.'}});
