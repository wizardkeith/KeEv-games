/** Actual static-room HDR reflection asset. The ordinary analytic diffuse SH,
 * every direct light and all nonceramic materials stay unchanged. No realtime
 * probe/capture or new light is installed in the playable game. */
import {CubeTexture} from '@babylonjs/core/Materials/Textures/cubeTexture';
import {PBRMaterial} from '@babylonjs/core/Materials/PBR/pbrMaterial';
import type {BaseTexture} from '@babylonjs/core/Materials/Textures/baseTexture';
import type {Scene} from '@babylonjs/core/scene';
export const roomSpecularContract={path:'/assets/native-v11/actual-static-room-specular.env',size:128,samples:64,position:[.10,1.48,-.10],role:'ceramic',diffuse:'Original analytic SH retained; no extra diffuse or real-time light',capturedSource:'6946fad89c409f7c03b1885c2c695e52af4b8f79 C17 scene plus C18 authoring hook, immutable107',source:'Actual255 static game meshes, six linear HDR directions, GGX prefilter, original RGBD PNG mip data',limits:'Static local approximation; not parallax-correct reflections, GI or final target acceptance'}as const;
export function applyRoomSpecular(scene:Scene,env:BaseTexture){
 const diffuse=scene.environmentTexture?.sphericalPolynomial;if(diffuse)env.sphericalPolynomial=diffuse;env.invertZ=true;
 const selected=new Set<PBRMaterial>();for(const mesh of scene.meshes)if(mesh.metadata?.materialRole===roomSpecularContract.role&&mesh.material instanceof PBRMaterial)selected.add(mesh.material);
 for(const material of selected)material.reflectionTexture=env;
 scene.metadata={...scene.metadata,roomSpecular:{status:'ready',materials:[...selected].map(m=>m.name),...roomSpecularContract}};return selected.size;
}
export async function installRoomSpecular(scene:Scene){
 let pending:CubeTexture|undefined;
 try{
  const env=await new Promise<CubeTexture>((resolve,reject)=>{pending=new CubeTexture(roomSpecularContract.path,scene,undefined,false,null,()=>resolve(pending!),message=>reject(Error(message??'Room reflection asset failed')),undefined,true,undefined,false);});
  if(env.getSize().width!==roomSpecularContract.size)throw Error('Room reflection resolution mismatch');applyRoomSpecular(scene,env);
 }catch(error){pending?.dispose();scene.metadata={...scene.metadata,roomSpecular:{status:'fallback',reason:String(error),source:'Original analytic room environment retained'}};}
}
