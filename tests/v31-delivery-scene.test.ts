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
  let transfer=false,exited=false,held=false,previous:Vector3|undefined,serviceFrames=0,contactFrames=0,contactPath=0;let previousContact:Vector3|undefined;
  for(let n=0;n<4200;n++){
   const live={...settings,staff:actors.staffPosition(),serviceStaffReady:actors.workReady()};routes.tick(1/60,live);const service=delivery.tick(1/60,presentation,routes,policy,actors.workReady(),actors.handoffReady());frame=routes.tick(0,live);actors.frame(1/60,policy,frame,service,undefined,!!presentation.current);if(service?.customerId)serviceFrames++;
   const bag=scene.getTransformNodeByName('native.prop.bag')!;bag.computeWorldMatrix(true);const at=bag.getAbsolutePosition().clone();
   if(service?.customerId&&service.progress>=.60&&service.progress<=.74){const guest=actors.visitors[frame.actors.findIndex(a=>a.id===service.customerId)],right=actors.staff.parts.get('socket-right')!,left=guest.parts.get('socket-left')!;right.computeWorldMatrix(true);left.computeWorldMatrix(true);assert.ok(Vector3.Distance(right.getAbsolutePosition(),left.getAbsolutePosition())<.06,'actual hands remain in reachable contact across the whole exchange');assert.ok(Vector3.Distance(at.add(new Vector3(0,.31,0)),left.getAbsolutePosition())<.075,'bag handle remains within both palms, not sliding across the gap');if(previousContact)contactPath+=Vector3.Distance(at,previousContact);previousContact=at.clone();contactFrames++;}
   if(actors.metrics().carriedBag){if(!transfer&&previous){assert.ok(actors.handoffReady(),'release requires actual hand contact');assert.ok(Vector3.Distance(previous,at)<.01,'contact ownership switch preserves world position');}transfer=true;assert.equal(actors.metrics().carriedBag,'visitor-a');assert.ok(bag.parent?.name.includes('visitor-a')&&bag.parent?.name.includes('socket-left'));}
   else if(bag.isEnabled())held=true;
   if(bag.isEnabled())previous=at;
   assert.equal(actors.metrics().propCount,5);assert.ok(actors.metrics().activeProps.length<=2);
   if(n%5===0&&(service||actors.metrics().activeProps.length)){for(const node of [actors.staff.parts.get('hand-left')!,actors.staff.parts.get('hand-right')!,...actors.visitors.flatMap(a=>['arm-left','arm-right','forearm-left','forearm-right','hand-left','hand-right'].map(id=>a.parts.get(id)!)),...scene.transformNodes.filter(p=>p.name.startsWith('native.prop.')&&p.isEnabled())])for(const mesh of node.getChildMeshes()){mesh.computeWorldMatrix(true);const positions=mesh.getVerticesData('position')??[];for(let k=0;k<positions.length;k+=3){const v=Vector3.TransformCoordinates(Vector3.FromArray(positions,k),mesh.getWorldMatrix());assert.ok(!(v.x>1.65&&v.x<3.55&&v.z>-1.96&&v.z<-1.04&&v.y>.08&&v.y<1.11-1e-6),'actual service hand/prop intersects counter at'+n+' '+node.name+' '+JSON.stringify(service)+' '+JSON.stringify({yaw:actors.staff.root.rotation.y,arm:actors.staff.parts.get('arm-right')!.rotation.asArray(),elbow:actors.staff.parts.get('forearm-right')!.rotation.asArray(),hand:actors.staff.parts.get('hand-right')!.rotation.asArray(),body:actors.staff.parts.get('body')!.position.asArray()})+' '+v.asArray());}}}

   if(transfer&&!frame.actors[0].enabled){exited=true;break;}
  }
  assert.ok(contactFrames>15,'whole-contact-window sample count');assert.ok(contactPath<.12,'whole-contact-window bag path under12cm, not89cm across air');assert.ok(serviceFrames>100,'actual2.8-second packing sequence at acquired bay');assert.ok(held&&transfer&&exited);assert.equal(actors.metrics().carriedBag,null);assert.deepEqual(await saves.read('sandbox'),after,'only initial successful settlement changes economics');
  actors.clearProps();delivery.cancel(routes);assert.deepEqual(actors.metrics().activeProps,[]);
 }finally{routes.dispose();actors.dispose();scene.dispose();engine.dispose();db.close();}
});
test('unavailable or expired service falls back within bounds and hidden cancellation consumes no extra result',()=>{
 const routes=new NativeCustomerRoutes(),presentation=new NativeCommitPresentation(),delivery=new NativeDelivery();const before={...core.create('sandbox',start),revision:0},after={...before,revision:1,eventSequence:5};presentation.baseline(before,4);presentation.commit(before,after,'settle',4,undefined,policy);
 let frames=0;for(let n=0;n<180;n++){const service=delivery.tick(1/60,presentation,routes,policy);if(service){frames++;assert.equal(service.customerId,undefined);}}assert.ok(frames>100);assert.equal(presentation.current,undefined);
 delivery.cancel(routes);assert.equal(presentation.commit(before,after,'settle',4,undefined,policy)?.reason,'old-revision');routes.dispose();
});

test('v4 real committed sale selects reachable Visitor B and transfers the same single bag through the actual scene adapter',async()=>{
 const db=await database('v31-scene-sale-'+(++id)),saves=new Saves(db,core);let before=await saves.loadOrCreate('sandbox',start);for(const command of [{kind:'buy',itemId:'off.tea',quantity:10},{kind:'display',itemId:'off.tea',slot:0},{kind:'open'}])before=await saves.command(before,{id:'setup-'+(++id),...command});
 const engine=new NullEngine(),scene=new Scene(engine);scene.useRightHandedSystem=true;
 const actors=createNativeActors(scene,(name,recipe,parent)=>{const node=new TransformNode(name,scene);if(parent)node.parent=parent;for(const g of nativeGrouped(recipe)){const mesh=new Mesh(name+'.mesh',scene),v=new VertexData();v.positions=g.geometry.positions;v.normals=g.geometry.normals;v.indices=g.geometry.indices;v.applyToMesh(mesh);mesh.parent=node;}return node;});
 const routes=new NativeCustomerRoutes(),presentation=new NativeCommitPresentation(),delivery=new NativeDelivery();presentation.baseline(before,0);
 try{
  // Exercise the second pooled visitor after a real close/drain/reopen. The
  // new cashier is on the right corner; the earlier two-guest timing no longer
  // guarantees B is the nearest eligible browser. Do not force actor state.
  let frame=routes.tick(0,settings);for(let n=0;n<3000&&!frame.actors[0].enabled;n++){frame=routes.tick(1/60,{...settings,capacity:1});actors.frame(1/60,policy,frame,undefined,undefined);}
  for(let n=0;n<3000&&frame.actors.some(a=>a.enabled);n++){frame=routes.tick(1/60,{...settings,open:false});actors.frame(1/60,policy,frame,undefined,undefined);}
  assert.ok(frame.actors.every(a=>!a.enabled),'closure drains existing visitor');
  for(let n=0;n<4000&&!(frame.actors[1].enabled&&frame.actors[1].state==='entering'&&frame.actors[1].x>2.3&&frame.actors[1].z<=2.05);n++){frame=routes.tick(1/60,settings);actors.frame(1/60,policy,frame,undefined,undefined);}
  assert.equal(frame.actors[1].state,'entering');
  const after=await saves.settle(before,start+3600000,start+3600000);presentation.commit(before,after,'advance',0,undefined,policy);assert.ok(after.eventSequence>before.eventSequence);
  let transfer=false,exited=false,held=false,previous:Vector3|undefined,serviceFrames=0,contactFrames=0,contactPath=0;let previousContact:Vector3|undefined;
  for(let n=0;n<4200;n++){
   const live={...settings,staff:actors.staffPosition(),serviceStaffReady:actors.workReady()};routes.tick(1/60,live);const service=delivery.tick(1/60,presentation,routes,policy,actors.workReady(),actors.handoffReady());frame=routes.tick(0,live);actors.frame(1/60,policy,frame,service,undefined,!!presentation.current);if(service?.customerId)serviceFrames++;
   const bag=scene.getTransformNodeByName('native.prop.bag')!;bag.computeWorldMatrix(true);const at=bag.getAbsolutePosition().clone();
   if(service?.customerId&&service.progress>=.60&&service.progress<=.74){const guest=actors.visitors[frame.actors.findIndex(a=>a.id===service.customerId)],right=actors.staff.parts.get('socket-right')!,left=guest.parts.get('socket-left')!;right.computeWorldMatrix(true);left.computeWorldMatrix(true);assert.ok(Vector3.Distance(right.getAbsolutePosition(),left.getAbsolutePosition())<.06,'actual hands remain in reachable contact across the whole exchange');assert.ok(Vector3.Distance(at.add(new Vector3(0,.31,0)),left.getAbsolutePosition())<.075,'bag handle remains within both palms, not sliding across the gap');if(previousContact)contactPath+=Vector3.Distance(at,previousContact);previousContact=at.clone();contactFrames++;}
   if(actors.metrics().carriedBag){if(!transfer&&previous){assert.ok(actors.handoffReady(),'release requires actual hand contact');assert.ok(Vector3.Distance(previous,at)<.01,'contact ownership switch preserves world position');}transfer=true;assert.equal(actors.metrics().carriedBag,'visitor-b');assert.ok(bag.parent?.name.includes('visitor-b')&&bag.parent?.name.includes('socket-left'));}
   else if(bag.isEnabled())held=true;
   if(bag.isEnabled())previous=at;
   assert.equal(actors.metrics().propCount,5);assert.ok(actors.metrics().activeProps.length<=2);
   if(n%5===0&&(service||actors.metrics().activeProps.length)){for(const node of [actors.staff.parts.get('hand-left')!,actors.staff.parts.get('hand-right')!,...actors.visitors.flatMap(a=>['arm-left','arm-right','forearm-left','forearm-right','hand-left','hand-right'].map(id=>a.parts.get(id)!)),...scene.transformNodes.filter(p=>p.name.startsWith('native.prop.')&&p.isEnabled())])for(const mesh of node.getChildMeshes()){mesh.computeWorldMatrix(true);const positions=mesh.getVerticesData('position')??[];for(let k=0;k<positions.length;k+=3){const v=Vector3.TransformCoordinates(Vector3.FromArray(positions,k),mesh.getWorldMatrix());assert.ok(!(v.x>1.65&&v.x<3.55&&v.z>-1.96&&v.z<-1.04&&v.y>.08&&v.y<1.11-1e-6),'actual service hand/prop intersects counter at'+n+' '+node.name+' '+JSON.stringify(service)+' '+JSON.stringify({yaw:actors.staff.root.rotation.y,arm:actors.staff.parts.get('arm-right')!.rotation.asArray(),elbow:actors.staff.parts.get('forearm-right')!.rotation.asArray(),hand:actors.staff.parts.get('hand-right')!.rotation.asArray(),body:actors.staff.parts.get('body')!.position.asArray()})+' '+v.asArray());}}}

   if(transfer&&!frame.actors[1].enabled){exited=true;break;}
  }
  assert.ok(contactFrames>15,'whole-contact-window sample count');assert.ok(contactPath<.12,'whole-contact-window bag path under12cm, not89cm across air');assert.ok(serviceFrames>100,'actual2.8-second packing sequence at acquired bay');assert.ok(held&&transfer&&exited);assert.equal(actors.metrics().carriedBag,null);assert.deepEqual(await saves.read('sandbox'),after,'only initial successful settlement changes economics');
  actors.clearProps();delivery.cancel(routes);assert.deepEqual(actors.metrics().activeProps,[]);
 }finally{routes.dispose();actors.dispose();scene.dispose();engine.dispose();db.close();}
});
test('no physical-contact acknowledgement never transfers a bag or replays a completed economic result',()=>{
 const routes=new NativeCustomerRoutes(),presentation=new NativeCommitPresentation(),delivery=new NativeDelivery();let f=routes.tick(0,settings);for(let n=0;n<2400&&!f.actors.some(a=>a.state==='browsing');n++)f=routes.tick(1/60,settings);
 const before=core.create('sandbox',start),after={...before,revision:1,eventSequence:1};presentation.baseline(before,0);presentation.commit(before,after,'settle',0,undefined,policy);
 for(let n=0;n<3000;n++){routes.tick(1/60,settings);delivery.tick(1/60,presentation,routes,policy,true,false);assert.ok(routes.tick(0,settings).actors.every(a=>!a.hasBag),'missing contact never triggers ownership');}
 assert.equal(presentation.current,undefined);assert.equal(presentation.commit(before,after,'settle',0,undefined,policy)?.reason,'old-revision');routes.dispose();
});
test('actual contact and post-transfer interruption clear ownership without root jumps, stale bag replay or another settlement',()=>{
 for(const phase of [.58,.68])for(const reason of ['hidden','reduced','close','replacement'] as const){
  const engine=new NullEngine(),scene=new Scene(engine);scene.useRightHandedSystem=true;const actors=createNativeActors(scene,(name,_recipe,parent)=>{const n=new TransformNode(name,scene);if(parent)n.parent=parent;return n;}),routes=new NativeCustomerRoutes(),presentation=new NativeCommitPresentation(),delivery=new NativeDelivery();
  try{let f=routes.tick(0,settings);for(let n=0;n<3000&&!f.actors.some(a=>a.state==='browsing');n++){const live={...settings,staff:actors.staffPosition(),serviceStaffReady:actors.workReady()};f=routes.tick(1/60,live);actors.frame(1/60,policy,f,undefined,undefined);}
   let before=core.create('sandbox',start);for(const [i,command] of [{kind:'buy',itemId:'off.tea',quantity:10},{kind:'display',itemId:'off.tea',slot:0},{kind:'open'}].entries())before=core.apply(before,{id:'contact-setup-'+i,...command});const after=core.apply(before,{id:'contact-sale',kind:'settle',target:start+900000});const financial=JSON.stringify(after);presentation.baseline(before,0);presentation.commit(before,after,'advance',0,undefined,policy);
   let reached=false;for(let n=0;n<4000;n++){const live={...settings,staff:actors.staffPosition(),serviceStaffReady:actors.workReady()};routes.tick(1/60,live);const service=delivery.tick(1/60,presentation,routes,policy,actors.workReady(),actors.handoffReady());f=routes.tick(0,live);actors.frame(1/60,policy,f,service,undefined,!!presentation.current);if(service?.customerId&&service.progress>=phase){reached=true;break;}}
   assert.ok(reached,reason+' reaches actual contact phase');if(phase>.64)assert.equal(actors.metrics().carriedBag,'visitor-a');
   const positions=[actors.staff.root,...actors.visitors.map(a=>a.root)].map(a=>a.position.asArray());delivery.cancel(routes);presentation.cancel();actors.clearProps();if(reason==='replacement')presentation.baseline(after,0);
   const stopped=resolveMotionPolicy({quality:'low',minimalFx:true,reduceMotion:reason==='reduced',visible:reason!=='hidden'});f=routes.tick(0,{...settings,open:reason!=='close',visible:reason!=='hidden',reduceMotion:reason==='reduced'});actors.frame(0,stopped,f,undefined,undefined);
   assert.deepEqual([actors.staff.root,...actors.visitors.map(a=>a.root)].map(a=>a.position.asArray()),positions,'cancel changes ownership, not positions');assert.equal(actors.handoffReady(),false);assert.equal(actors.metrics().carriedBag,null);assert.deepEqual(actors.metrics().activeProps,[]);
   for(let n=0;n<120;n++){const live={...settings,open:reason!=='close',staff:actors.staffPosition(),serviceStaffReady:actors.workReady()};routes.tick(1/60,live);const service=delivery.tick(1/60,presentation,routes,policy,actors.workReady(),actors.handoffReady());f=routes.tick(0,live);actors.frame(1/60,policy,f,service,undefined,!!presentation.current);assert.equal(actors.metrics().carriedBag,null,'resume cannot replay old transfer');}
   assert.equal(JSON.stringify(after),financial,'visual interruption never rewrites the committed result');assert.equal(presentation.current,undefined);
  }finally{actors.dispose();routes.dispose();scene.dispose();engine.dispose();}
 }
});
