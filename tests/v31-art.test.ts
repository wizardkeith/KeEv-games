import {nativeSurfaceGeometry} from '../src/art/native-characters';
/** Non-rendering camera projection and geometry checks. This is not visual QA. */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {NullEngine} from '@babylonjs/core/Engines/nullEngine';
import {Scene} from '@babylonjs/core/scene';
import {ArcRotateCamera} from '@babylonjs/core/Cameras/arcRotateCamera';
import {Vector3,Matrix} from '@babylonjs/core/Maths/math.vector';
import {Viewport} from '@babylonjs/core/Maths/math.viewport';
import {nativeCameraFrame,nativeShopHull,nativeLighting,nativeViewContract} from '../src/art/native-view';
import {curatedRadius} from '../src/art/direction';
import {exteriorRecipe,nativeRoomRecipe,nativeCounterRecipe,nativeDisplayRecipe} from '../src/art/native-environment';
import {geometry} from '../src/art/geometry';

test('v3.1 candidate fits actual Babylon RH critical points within UI-safe viewports and moves closer without clipping entry, feet or shelves',()=>{
 for(const aspect of [.5,.75,1,1.5,2,2.5]){
  const height=800,width=Math.round(height*aspect),engine=new NullEngine({renderWidth:width,renderHeight:height,textureSize:512,deterministicLockstep:false,lockstepMaxSteps:4}),scene=new Scene(engine);scene.useRightHandedSystem=true;
  try{
   const frame=nativeCameraFrame(aspect),camera=new ArcRotateCamera('projection',0,0,frame.radius,Vector3.FromArray([...frame.target]),scene);camera.fov=.8;scene.activeCamera=camera;
   for(let i=0;i<=8;i++)for(let j=0;j<=4;j++){
    camera.alpha=nativeViewContract.alphaRange[0]+i*(nativeViewContract.alphaRange[1]-nativeViewContract.alphaRange[0])/8;
    camera.beta=nativeViewContract.betaRange[0]+j*(nativeViewContract.betaRange[1]-nativeViewContract.betaRange[0])/4;
    const transform=camera.getViewMatrix(true).multiply(camera.getProjectionMatrix(true));
    for(const point of nativeShopHull){const p=Vector3.Project(Vector3.FromArray([...point]),Matrix.Identity(),transform,new Viewport(0,0,width,height));assert.ok(p.x>0&&p.x<width&&p.y>0&&p.y<height,`critical hull clipped at aspect${aspect}: ${p.asArray()}`);assert.ok(p.z>0&&p.z<1);}
   }
   assert.ok(frame.radius<curatedRadius(aspect),'less empty-margin distance than v3');
   if(aspect>=1.5)assert.ok(frame.radius/curatedRadius(aspect)<=.81,'around21% closer wide candidate');
  }finally{scene.dispose();engine.dispose();}
 }
 const engine=new NullEngine({renderWidth:1400,renderHeight:900,textureSize:512,deterministicLockstep:false,lockstepMaxSteps:4}),scene=new Scene(engine);scene.useRightHandedSystem=true;
 try{const viewport=new Viewport(.03,.17,.68,.65),safe=viewport.toGlobal(1400,900),frame=nativeCameraFrame(safe.width/safe.height),camera=new ArcRotateCamera('safe',nativeViewContract.alpha,nativeViewContract.beta,frame.radius,Vector3.FromArray([...frame.target]),scene);camera.viewport=viewport;camera.fov=.8;
  const matrix=camera.getViewMatrix(true).multiply(camera.getProjectionMatrix(true));for(const p of nativeShopHull){const screen=Vector3.Project(Vector3.FromArray([...p]),Matrix.Identity(),matrix,safe);assert.ok(screen.x>safe.x&&screen.x<safe.x+safe.width&&screen.y>safe.y&&screen.y<safe.y+safe.height);}
 }finally{scene.dispose();engine.dispose();}
});

test('v3.1 staff view has separate intent; lighting preserves exposure and limits supplemental fill to facial surfaces',()=>{
 const shop=nativeCameraFrame(1.5),staff=nativeCameraFrame(1.5,.8,'staff');assert.ok(staff.radius<shop.radius*.55);assert.notDeepEqual(staff.target,shop.target);
 assert.equal(nativeLighting.exposure,1);assert.ok(nativeLighting.key.intensity<4&&nativeLighting.key.intensity>nativeLighting.fill.intensity*4,'directional window remains dominant within bounded light energy');assert.ok(nativeLighting.faceFill.intensity>0&&nativeLighting.faceFill.intensity<.5);assert.ok(nativeLighting.faceFill.direction[2]<0);
 assert.deepEqual(nativeLighting.faceFill.roles,['skin','ink']);assert.ok(!nativeLighting.faceFill.parts.includes('body'));assert.ok(!nativeLighting.faceFill.parts.includes('arm-right'));
 assert.throws(()=>nativeCameraFrame(0),RangeError);assert.throws(()=>nativeCameraFrame(1,NaN),RangeError);
});

test('v3.1 exterior replaces exposed high blocks with low gable/eave/window geometry and preserves warm indoor / cool outdoor material separation',()=>{
 const exterior=exteriorRecipe(),architecture=exterior.filter(p=>p.role!=='leaf'&&p.role!=='wood'),positions=architecture.flatMap(p=>nativeSurfaceGeometry(p).positions.filter((_,i)=>i%3===1));
 assert.ok(Math.max(...positions)<2.40,'architecture is lower than old3.1m exposed block');assert.ok(exterior.filter(p=>p.shape!=='mesh'&&p.turn&&Math.hypot(p.turn[0],p.turn[2])>.2&&p.role==='paint').length===4,'paired3D pitched roofs around a horizontal axis');assert.equal(exterior.filter(p=>p.role==='glass').length,4,'bounded recessed window bays');assert.ok(exterior.some(p=>p.role==='leaf'));
 assert.ok(exterior.length<=28,'small scenery geometry budget');for(const p of exterior){const g=nativeSurfaceGeometry(p);assert.ok(g.positions.every(Number.isFinite));assert.ok(g.normals.every(Number.isFinite));}
 const floor=nativeRoomRecipe().filter(p=>p.role==='wood'&&p.roughness===.83);assert.equal(floor.length,2,'remade staggered plank meshes stay batched into two material groups');assert.equal(new Set(floor.map(p=>p.color)).size,2);for(const surface of floor){const y=nativeSurfaceGeometry(surface).positions.filter((_,i)=>i%3===1);assert.ok(Math.abs(Math.max(...y)-.079)<1e-10&&Math.abs(Math.min(...y)-.061)<1e-10,'same real floor thickness and elevation');}assert.ok(floor.every(p=>p.role==='wood'));
 const floorColors=new Set(floor.map(p=>p.color));assert.ok(!floorColors.has(nativeCounterRecipe()[0].color));assert.ok(!floorColors.has(nativeDisplayRecipe()[0].color));
 assert.ok(floor.every(p=>p.roughness===.83));assert.equal(nativeCounterRecipe()[0].roughness,.57);assert.equal(nativeDisplayRecipe()[0].roughness,.64);
});
test('v3.1 environment master preserves actual runtime camera/light intent and native surface roughness',()=>{
 const master=JSON.parse(fs.readFileSync(new URL('../assets/masters/native-v3/environment-v3.json',import.meta.url),'utf8'));
 assert.deepEqual(master.presentation,JSON.parse(JSON.stringify({camera:nativeViewContract,lighting:nativeLighting})));
 assert.deepEqual(master.room,nativeRoomRecipe());assert.deepEqual(master.counter,nativeCounterRecipe());assert.deepEqual(master.display,nativeDisplayRecipe());
});
