/** Offline/local authoring hook. Captures actual static shop geometry to a
 * reusable HDR environment asset. Absent from ordinary production bundles.
 * No actor, inventory, transaction, clock or player data enters the probe. */
import {ReflectionProbe} from '@babylonjs/core/Probes/reflectionProbe';
import {HDRFiltering} from '@babylonjs/core/Materials/Textures/Filtering/hdrFiltering';

import type {Scene} from '@babylonjs/core/scene';
import type {PBRMaterial} from '@babylonjs/core/Materials/PBR/pbrMaterial';
export function installRoomSpecularAuthoring(scene:Scene){
 let captured=false;
 Object.assign(window,{littleShopAuthorRoomSpecular:async()=>{
  if(captured)throw Error('This authoring scene has already been captured');captured=true;
  const size=Number(import.meta.env.VITE_V11_ROOM_PROBE_SIZE??128),samples=size===128?64:16;if(size!==64&&size!==128)throw Error('Bounded64/128 room-probe resolution');
  const reflection=new ReflectionProbe('authoring.actual-static-room',size,scene,true,true,true);reflection.position.set(.10,1.48,-.10);reflection.refreshRate=0;
  // Exclude dynamic actors, carried props, hinged door, FX and real stock roots.
  reflection.renderList=scene.meshes.filter(m=>m.isEnabled()&&['room.modular.','room.styling.v9.','fixture.shop-counter.w1_1.','back.display.curated.v10.','display.1.material','display.2.material','display.3.material','plant.original.','native.window.','native.entry.'].some(p=>m.name.startsWith(p))&&!m.name.includes('actual-stock-batch'));
  const meshes=reflection.renderList.map(m=>m.name),materials=[...new Set(reflection.renderList.map(m=>m.material).filter(Boolean))]as PBRMaterial[];
  const clip=materials.map(m=>[m.clipPlane,m.clipPlane2,m.clipPlane3,m.clipPlane4]as const);
  const targets=scene.customRenderTargets,index=targets.indexOf(reflection.cubeTexture);if(index>=0)targets.splice(index,1);
  const engine=scene.getEngine(),loops=[...engine.activeRenderLoops];engine.stopRenderLoop();
  try{
   // Runtime window portal is relative to the player camera. The authoring
   // probe uses its six real views, so temporarily remove only those clip planes.
   materials.forEach(m=>{m.clipPlane=m.clipPlane2=m.clipPlane3=m.clipPlane4=null;});
   console.log('Room probe: rendering six faces');reflection.cubeTexture.render(false);console.log('Room probe: six faces done, prefiltering');
   await new HDRFiltering(scene.getEngine(),{quality:samples}).prefilter(reflection.cubeTexture);
   console.log('Room probe: GGX done, reading linear radiance');
   const images:number[][]=[],mipmaps:{position:number;length:number}[]=[];let offset=0;
   for(let mip=0;mip<=Math.log2(size);mip++)for(let face=0;face<6;face++){
    console.log('Room probe: read mip '+mip+' face '+face);const faceSize=size>>mip,linear=await reflection.cubeTexture.readPixels(face,mip);if(!(linear instanceof Float32Array)||linear.length!==faceSize*faceSize*4)throw Error('Expected finite linear float radiance');
    const rgba=new Uint8ClampedArray(linear.length);for(let i=0;i<linear.length;i+=4){const rgb=[linear[i],linear[i+1],linear[i+2]].map(v=>{if(!Number.isFinite(v))throw Error('Nonfinite radiance');return Math.max(0,v);}),d=Math.min(1,Math.floor(Math.max(255/Math.max(1e-7,...rgb),1))/255);for(let k=0;k<3;k++)rgba[i+k]=Math.round(Math.min(1,Math.pow(rgb[k]*d,1/2.2))*255);rgba[i+3]=Math.round(d*255);}
    // Same RGBD formula/container as installed Babylon8.32, encoded on a2D
    // canvas to avoid a second GPU readback/postprocess during PNG export.
    const canvas=document.createElement('canvas');canvas.width=canvas.height=faceSize;canvas.getContext('2d')!.putImageData(new ImageData(rgba,faceSize,faceSize),0,0);const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('RGBD PNG encoding failed')),'image/png')),bytes=Array.from(new Uint8Array(await blob.arrayBuffer()));images.push(bytes);mipmaps.push({position:offset,length:bytes.length});offset+=bytes.length;
   }
   const header={version:2,width:size,imageType:'image/png',specular:{mipmaps,lodGenerationScale:reflection.cubeTexture.lodGenerationScale}},prefix=new TextEncoder().encode(JSON.stringify(header)+'\0'),bytes=new Uint8Array(8+prefix.length+offset);bytes.set([0x86,0x16,0x87,0x96,0xf6,0xd6,0x96,0x36]);bytes.set(prefix,8);let next=8+prefix.length;for(const img of images){bytes.set(img,next);next+=img.length;}
   console.log('Room probe: all'+images.length+' RGBD mip faces encoded');
   return {bytes:Array.from(bytes),metadata:{source:'Actual game static meshes rendered in six linear HDR directions, Babylon8.32 GGX prefilter, CPU RGBD formula and PNG2Dcanvas; SDK env format, not a game screenshot or new model',size,samples,position:reflection.position.asArray(),meshes,excluded:'all actors, actual owned inventory, hinged door, parcels, FX and saves',use:'specular only; retain analytic diffuse SH, no extra realtime light or economic effect'}};
  }finally{materials.forEach((m,i)=>{[m.clipPlane,m.clipPlane2,m.clipPlane3,m.clipPlane4]=clip[i];});reflection.dispose();for(const loop of loops)engine.runRenderLoop(loop);}
 }});
}
