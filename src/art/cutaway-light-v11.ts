/** A cutaway room still needs its ceiling to stop sunlight leaking over every
 * wall. This opaque plane casts ONLY into the sun's explicit shadow render list;
 * camera layer0 means it never covers the playable cutaway. Actual WebGL A/B,
 * not its existence, determines whether this authoring method is useful. */
import {Mesh} from '@babylonjs/core/Meshes/mesh';import {VertexData} from '@babylonjs/core/Meshes/mesh.vertexData';import {PBRMaterial} from '@babylonjs/core/Materials/PBR/pbrMaterial';import type {Scene} from '@babylonjs/core/scene';import type {ShadowGenerator} from '@babylonjs/core/Lights/Shadows/shadowGenerator';
export const cutawayLightContract={id:'native.cutaway.ceiling-shadow.v11',height:3.52,bounds:{minX:-4.55,maxX:4.55,minZ:-3.3,maxZ:3.3},cameraLayerMask:0,shadowOnly:true,primitiveCount:1,triangles:2,native:'Recreate camera-hidden opaque sun-shadow plane; not an ordinary visible glTF roof or GI. No actor, save, stock, navigation or camera operation depends on it.'} as const;
export function installCutawayShadow(scene:Scene,shadow:ShadowGenerator,enabled=true){
 scene.metadata={...scene.metadata,cutawayLighting:{...cutawayLightContract,enabled}};if(!enabled)return;
 const {minX,maxX,minZ,maxZ}=cutawayLightContract.bounds,y=cutawayLightContract.height,mesh=new Mesh(cutawayLightContract.id,scene),d=new VertexData();d.positions=[minX,y,minZ,maxX,y,minZ,maxX,y,maxZ,minX,y,maxZ];d.normals=[0,1,0,0,1,0,0,1,0,0,1,0];d.indices=[0,2,1,0,3,2];d.applyToMesh(mesh);
 const material=new PBRMaterial('native.cutaway.opaque-shadow',scene);material.backFaceCulling=false;material.alpha=1;mesh.material=material;mesh.layerMask=0;mesh.isPickable=false;mesh.receiveShadows=false;shadow.addShadowCaster(mesh,false);
 // Pinned SDK8.32 ObjectRenderer bypasses camera mask for explicit renderList
 // unless forced. State that standard public render-target setting explicitly.
 shadow.getShadowMap()!.forceLayerMaskCheck=false;
}
