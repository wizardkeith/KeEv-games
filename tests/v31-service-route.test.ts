import test from 'node:test';
import assert from 'node:assert/strict';
import {NativeCustomerRoutes,CUSTOMER_ROUTE_CONTRACT,fixtureClearance,type RouteFrame,type RouteSettings} from '../src/presentation/native-routes';

const dt=1/60,settings:RouteSettings={open:true,visible:true,reduceMotion:false,capacity:2};
function check(frame:RouteFrame,previous?:RouteFrame){
 const visible=frame.actors.filter(a=>a.enabled);
 for(const actor of visible){
  assert.ok(fixtureClearance(actor)>=.24-1e-8,'service walk clears table/counter footprints');
  assert.ok(Math.hypot(actor.x-2.6,actor.z+.65)>=.49-1e-8,'service walk clears staff body radius');
  const before=previous?.actors.find(a=>a.id===actor.id);
  if(before?.enabled)assert.ok(Math.hypot(actor.x-before.x,actor.z-before.z)<=.62*dt+1e-8,'no service teleport');
 }
 if(visible.length===2)assert.ok(Math.hypot(visible[0].x-visible[1].x,visible[0].z-visible[1].z)>=.52-1e-8);
 const h=CUSTOMER_ROUTE_CONTRACT.doorHinge,w=CUSTOMER_ROUTE_CONTRACT.doorLeafWidth,x=Math.cos(frame.doorAngle)*w,z=-Math.sin(frame.doorAngle)*w;
 for(const actor of visible){const dx=actor.x-h.x,dz=actor.z-h.z,t=Math.max(0,Math.min(1,(dx*x+dz*z)/(w*w)));assert.ok(Math.hypot(dx-x*t,dz-z*t)>.24,'service exit clears moving door leaf');}
}
function browsing(capacity:1|2=2){
 const routes=new NativeCustomerRoutes();let frame!:RouteFrame;
 for(let n=0;n<60*35;n++){frame=routes.tick(dt,{...settings,capacity});if(frame.actors[0].state==='browsing')return {routes,frame};}
 throw Error('first guest never reached available viewing stop');
}
function toReady(routes:NativeCustomerRoutes,frame:RouteFrame,revision:number){
 let elapsed=0;
 while(routes.serviceStatus(revision)==='approaching'&&elapsed<CUSTOMER_ROUTE_CONTRACT.serviceAcquireSeconds+.05){const next=routes.tick(dt,settings);check(next,frame);frame=next;elapsed+=dt;}
 assert.equal(routes.serviceStatus(revision),'ready');assert.ok(elapsed<=CUSTOMER_ROUTE_CONTRACT.serviceAcquireSeconds);return {frame,elapsed};
}

test('one recent receipt reserves an existing reachable guest, transfers one generic bag, nods and exits through the door',()=>{
 const fixture=browsing(),r=fixture.routes;let frame=fixture.frame;
 assert.ok(frame.actors[0].enabled);assert.equal(r.requestService(11),'visitor-a');assert.equal(r.requestService(11),undefined);
 assert.equal(r.handover(11),false,'cannot give a bag before guest reaches service point');assert.equal(r.handover(10),false);
 ({frame}=toReady(r,frame,11));const a=frame.actors[0];assert.deepEqual([a.x,a.z],[CUSTOMER_ROUTE_CONTRACT.servicePoint.x,CUSTOMER_ROUTE_CONTRACT.servicePoint.z]);assert.ok(Math.abs(a.yaw-CUSTOMER_ROUTE_CONTRACT.serviceFacingYaw)<.04);assert.equal(a.hasBag,false);
 assert.equal(r.handover(10),false);assert.equal(r.handover(11),true);assert.equal(r.handover(11),false,'one owner transfer per summary');
 for(let n=0;n<30;n++){const next=r.tick(dt,settings);check(next,frame);frame=next;}
 assert.ok(frame.actors[0].handoverProgress>.5);assert.equal(frame.actors[0].hasBag,true);
 r.finishService(11);assert.equal(r.serviceStatus(11),'none');let departed=false;
 for(let n=0;n<60*45;n++){const next=r.tick(dt,settings);check(next,frame);frame=next;if(!frame.actors[0].enabled){departed=true;break;}}
 assert.equal(departed,true);assert.deepEqual([frame.actors[0].x,frame.actors[0].z],[4.18,4.05]);assert.equal(frame.actors[0].hasBag,false,'pool clears bag at completed departure');
});

test('no guest/duplicate/active reservation never creates a guest, queue or later historical pickup',()=>{
 const r=new NativeCustomerRoutes();assert.equal(r.requestService(20),undefined);
 let frame:RouteFrame=r.tick(0,settings);assert.ok(frame.actors.every(a=>!a.enabled));
 for(let n=0;n<60*35;n++){frame=r.tick(dt,settings);if(frame.actors[0].state==='browsing')break;}
 assert.equal(r.requestService(20),undefined,'failed request is not retried when a later guest appears');assert.equal(r.requestService(21),'visitor-a');assert.equal(r.requestService(22),undefined,'one reservation, no pending customer queue');
 ({frame}=toReady(r,frame,21));assert.equal(r.handover(22),false);assert.equal(r.handover(21),true);r.finishService(21);
 assert.equal(r.requestService(22),undefined,'rejected later request also remains consumed');assert.ok(frame.actors.filter(a=>a.enabled).length<=2);
 assert.throws(()=>r.requestService(NaN),RangeError);assert.throws(()=>r.requestService(0),RangeError);
});

test('hidden/Reduce/close/cancel preserve root positions, remove ownership and leave via authored paths without resetting other visitors',()=>{
 for(const reason of ['hidden','reduced','close','explicit'] as const){
  const f=browsing(),r=f.routes;let frame=f.frame;assert.equal(r.requestService(31),'visitor-a');
  for(let n=0;n<120;n++){const next=r.tick(dt,settings);check(next,frame);frame=next;}
  const before=frame;
  if(reason==='explicit'){r.cancelPresentation();frame=r.tick(0,settings);}
  else frame=r.tick(0,{...settings,visible:reason!=='hidden',reduceMotion:reason==='reduced',open:reason!=='close'});
  assert.equal(r.serviceStatus(31),'none');assert.deepEqual(frame.actors.map(a=>[a.x,a.z]),before.actors.map(a=>[a.x,a.z]),'cancellation does not restart entrance or move roots');assert.ok(frame.actors.every(a=>!a.hasBag));assert.equal(r.handover(31),false);
  for(let n=0;n<60*60;n++){const next=r.tick(dt,{...settings,open:false});check(next,frame);frame=next;}
  assert.ok(frame.actors.every(a=>!a.enabled));assert.equal(frame.corridorOwner,null);
 }
 const f=browsing(),r=f.routes;let frame=f.frame;r.requestService(40);({frame}=toReady(r,frame,40));r.handover(40);r.cancelPresentation();frame=r.tick(0,settings);assert.equal(frame.actors[0].hasBag,false,'hidden after release also clears generic bag owner');
});

test('ready reservation has a strict visual deadline; Low keeps a legitimate handoff and stale callbacks cannot attach a bag',()=>{
 const f=browsing(1),r=f.routes;let frame=f.frame;assert.equal(r.requestService(50),'visitor-a');
 for(let n=0;n<60*(CUSTOMER_ROUTE_CONTRACT.serviceAcquireSeconds+.05);n++){const next=r.tick(dt,{...settings,capacity:1});check(next,frame);frame=next;if(r.serviceStatus(50)==='ready')break;}
 assert.equal(r.serviceStatus(50),'ready');assert.equal(frame.actors[1].enabled,false);assert.equal(r.handover(50),true);
 for(let n=0;n<60*6;n++){const next=r.tick(dt,{...settings,capacity:1});check(next,frame);frame=next;}
 assert.equal(r.serviceStatus(50),'none','abandoned service cannot reserve indefinitely');assert.equal(frame.actors[0].hasBag,false);assert.equal(r.handover(50),false);
 r.reset();assert.equal(r.handover(50),false);assert.ok(r.tick(0,settings).actors.every(a=>!a.enabled));r.dispose();assert.equal(r.requestService(60),undefined);
});
