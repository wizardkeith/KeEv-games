import test from 'node:test';
import assert from 'node:assert/strict';
import 'fake-indexeddb/auto';
import {NullEngine} from '@babylonjs/core/Engines/nullEngine';
import {Scene} from '@babylonjs/core/scene';
import {Mesh} from '@babylonjs/core/Meshes/mesh';
import {VertexData} from '@babylonjs/core/Meshes/mesh.vertexData';
import {TransformNode} from '@babylonjs/core/Meshes/transformNode';
import {Vector3} from '@babylonjs/core/Maths/math.vector';
import {createNativeActors} from '../src/presentation/native-scene';
import {nativeGrouped} from '../src/art/native-characters';
import {NativeCustomerRoutes} from '../src/presentation/native-routes';
import {NativeCommitPresentation} from '../src/presentation/native-commits';
import {NativeDelivery} from '../src/presentation/native-delivery';
import {resolveMotionPolicy} from '../src/presentation/native-motion';
import {Core} from '../src/core/contracts';
import {execute} from '../src/core/simulation';
import {Saves,database} from '../src/platform/storage';
const start=Date.parse('2026-10-21T01:00:00Z'),core=new Core(execute);let id=0;
const policy=resolveMotionPolicy({quality:'high',visible:true,minimalFx:false,reduceMotion:false}),settings={open:true,visible:true,reduceMotion:false,capacity:2 as const};
test('real committed sale acquires one existing visitor, transfers the actual bag to left socket and exits without economic callbacks',async()=>{
 const db=await database('v31-scene-sale-'+(++id)),saves=new Saves(db,core);let before=await saves.loadOrCreate('sandbox',start);for(const command of [{kind:'buy',itemId:'off.tea',quantity:10},{kind:'display',itemId:'off.tea',slot:0},{kind:'open'}])before=await saves.command(before,{id:'setup-'+(++id),...command});
 const engine=new NullEngine(),scene=new Scene(engine);scene.useRightHandedSystem=true;
 const actors=createNativeActors(scene,(name,recipe,parent)=>{const node=new TransformNode(name,scene);if(parent)node.parent=parent;for(const g of nativeGrouped(recipe)){const mesh=new Mesh(name+'.mesh',scene),v=new VertexData();v.positions=g.geometry.positions;v.normals=g.geometry.normals;v.indices=g.geometry.indices;v.applyToMesh(mesh);mesh.parent=node;}return node;});
 const routes=new NativeCustomerRoutes(),presentation=new NativeCommitPresentation(),delivery=new NativeDelivery();presentation.baseline(before,0);
 try{
  let frame=routes.tick(0,settings);for(let n=0;n<2400&&!frame.actors.some(a=>a.id==='visitor-a'&&a.state==='browsing');n++){frame=routes.tick(1/60,settings);actors.frame(1/60,policy,frame,undefined,undefined);}
  assert.ok(frame.actors.some(a=>a.state==='browsing'));
  const after=await saves.settle(before,start+3600000,start+3600000);presentation.commit(before,after,'advance',0,undefined,policy);assert.ok(after.eventSequence>before.eventSequence);
  let transfer=false,exited=false,held=false,previous:Vector3|undefined,serviceFrames=0;
  for(let n=0;n<4200;n++){
   routes.tick(1/60,settings);const service=delivery.tick(1/60,presentation,routes,policy);frame=routes.tick(0,settings);actors.frame(1/60,policy,frame,service,undefined);if(service?.customerId)serviceFrames++;
   const bag=scene.getTransformNodeByName('native.prop.bag')!;bag.computeWorldMatrix(true);const at=bag.getAbsolutePosition().clone();
   if(actors.metrics().carriedBag){if(!transfer&&previous)assert.ok(Vector3.Distance(previous,at)<.10,'ownership switch keeps world bag position continuous');transfer=true;assert.equal(actors.metrics().carriedBag,'visitor-a');assert.ok(bag.parent?.name.includes('visitor-a')&&bag.parent?.name.includes('socket-left'));}
   else if(bag.isEnabled())held=true;
   if(bag.isEnabled())previous=at;
   assert.equal(actors.metrics().propCount,5);assert.ok(actors.metrics().activeProps.length<=2);
   if(n%5===0&&(service||actors.metrics().activeProps.length)){for(const node of [actors.staff.parts.get('hand-left')!,actors.staff.parts.get('hand-right')!,...scene.transformNodes.filter(p=>p.name.startsWith('native.prop.')&&p.isEnabled())])for(const mesh of node.getChildMeshes()){mesh.computeWorldMatrix(true);const positions=mesh.getVerticesData('position')??[];for(let k=0;k<positions.length;k+=3){const v=Vector3.TransformCoordinates(Vector3.FromArray(positions,k),mesh.getWorldMatrix());assert.ok(!(v.x>1.65&&v.x<3.55&&v.z>-1.96&&v.z<-1.04&&v.y>.08&&v.y<1.11-1e-6),'actual service hand/prop intersects counter at'+n+' '+node.name+' '+JSON.stringify(service)+' '+JSON.stringify({yaw:actors.staff.root.rotation.y,arm:actors.staff.parts.get('arm-right')!.rotation.asArray(),elbow:actors.staff.parts.get('forearm-right')!.rotation.asArray(),hand:actors.staff.parts.get('hand-right')!.rotation.asArray(),body:actors.staff.parts.get('body')!.position.asArray()})+' '+v.asArray());}}}

   if(transfer&&!frame.actors[0].enabled){exited=true;break;}
  }
  assert.ok(serviceFrames>100,'actual2.8-second packing sequence at acquired bay');assert.ok(held&&transfer&&exited);assert.equal(actors.metrics().carriedBag,null);assert.deepEqual(await saves.read('sandbox'),after,'only initial successful settlement changes economics');
  actors.clearProps();delivery.cancel(routes);assert.deepEqual(actors.metrics().activeProps,[]);
 }finally{routes.dispose();actors.dispose();scene.dispose();engine.dispose();db.close();}
});
test('unavailable or expired service falls back within bounds and hidden cancellation consumes no extra result',()=>{
 const routes=new NativeCustomerRoutes(),presentation=new NativeCommitPresentation(),delivery=new NativeDelivery();const before={...core.create('sandbox',start),revision:0},after={...before,revision:1,eventSequence:5};presentation.baseline(before,4);presentation.commit(before,after,'settle',4,undefined,policy);
 let frames=0;for(let n=0;n<180;n++){const service=delivery.tick(1/60,presentation,routes,policy);if(service){frames++;assert.equal(service.customerId,undefined);}}assert.ok(frames>100);assert.equal(presentation.current,undefined);
 delivery.cancel(routes);assert.equal(presentation.commit(before,after,'settle',4,undefined,policy)?.reason,'old-revision');routes.dispose();
});
