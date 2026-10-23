import test from 'node:test';
import assert from 'node:assert/strict';
import {NativeCustomerRoutes,CUSTOMER_ROUTES,CUSTOMER_ROUTE_CONTRACT,fixtureClearance,type RouteFrame,type RouteSettings} from '../src/presentation/native-routes';

const active:RouteSettings={open:true,visible:true,reduceMotion:false,capacity:2};
const dt=1/60;
function sweepClearance(frame:RouteFrame):number {
 const {doorHinge:h,doorLeafWidth:w}=CUSTOMER_ROUTE_CONTRACT;
 const x=Math.cos(frame.doorAngle)*w,z=-Math.sin(frame.doorAngle)*w;
 let min=Infinity;
 for(const actor of frame.actors.filter(a=>a.enabled)){
  const dx=actor.x-h.x,dz=actor.z-h.z;
  const t=Math.max(0,Math.min(1,(dx*x+dz*z)/(w*w)));
  min=Math.min(min,Math.hypot(dx-x*t,dz-z*t));
 }
 return min;
}
function check(frame:RouteFrame):void {
 const enabled=frame.actors.filter(a=>a.enabled);
 assert.ok(enabled.length<=2);
 assert.ok(frame.doorAngle>=CUSTOMER_ROUTE_CONTRACT.doorMaxAngle&&frame.doorAngle<=0);
 for(const a of enabled){
  assert.ok([a.x,a.z,a.speed,a.distance,a.yaw,a.browseProgress].every(Number.isFinite));
  assert.ok(fixtureClearance(a)>=CUSTOMER_ROUTE_CONTRACT.radius-1e-9,'body clears table/counter footprints');
  assert.equal(a.hasBag,false,'a visual browse does not claim a sale');
  if(a.z>3.1&&a.z<3.35)assert.ok(Math.abs(a.x-3.05)<.01,'cross back wall through actual doorway');
 }
 if(enabled.length===2)assert.ok(Math.hypot(enabled[0].x-enabled[1].x,enabled[0].z-enabled[1].z)>=.52-1e-9,'two pool actors do not intersect');
 assert.ok(sweepClearance(frame)>.24,'moving door leaf does not sweep through actor radius');
}

test('authored routes have continuous radius clearance and use the door opening',()=>{
 for(const route of CUSTOMER_ROUTES){
  for(let i=1;i<route.length;i++)for(let sample=0;sample<=100;sample++){
   const t=sample/100,p={x:route[i-1].x*(1-t)+route[i].x*t,z:route[i-1].z*(1-t)+route[i].z*t};
   assert.ok(fixtureClearance(p)>=.24);
  }
  assert.ok(route.some(p=>p.x===3.05&&p.z===3.20));
 }
});

test('two pooled visitors enter, inspect and leave without crossing furniture or door leaf',()=>{
 const routes=new NativeCustomerRoutes(),states=[new Set<string>(),new Set<string>()];
 const walks=[0,0],departures=[0,0],last=[{x:4.18,z:4.05,d:0,on:false},{x:4.18,z:4.05,d:0,on:false}];
 for(let frame=0;frame<60*170;frame++){
  const current=routes.tick(dt,active);check(current);
  current.actors.forEach((a,index)=>{
   states[index].add(a.state);
   if(a.enabled&&last[index].on){
    const step=Math.hypot(a.x-last[index].x,a.z-last[index].z);
    assert.ok(step<=.62*dt+1e-9,'root never teleports during a visible visit');
    assert.ok(Math.abs((a.distance-last[index].d)-step)<1e-8,'gait distance is actual displacement');
    if(step>0)walks[index]++;
   }
   if(last[index].on&&!a.enabled){departures[index]++;assert.ok(a.x===4.18&&a.z===4.05,'disable only after outside route completion');}
   last[index]={x:a.x,z:a.z,d:a.distance,on:a.enabled};
  });
 }
 for(let i=0;i<2;i++){
  assert.ok(walks[i]>500);
  assert.ok(departures[i]>=1);
  for(const state of ['entering','browsing','leaving','outside'])assert.ok(states[i].has(state));
 }
});

test('close, rapid reopen and Low drain preserve trajectories and bounded reservations',()=>{
 const routes=new NativeCustomerRoutes();let frame!:RouteFrame;
 for(let i=0;i<60*19;i++)frame=routes.tick(dt,active);
 assert.ok(frame.actors.some(a=>a.enabled));
 const before=frame;
 frame=routes.tick(dt,{...active,open:false});check(frame);
 assert.equal(frame.actors.filter(a=>a.enabled).length,before.actors.filter(a=>a.enabled).length,'close cannot pop pooled actors');
 for(let i=0;i<60*8;i++){frame=routes.tick(dt,{...active,open:i%31<15});check(frame);}
 for(let i=0;i<60*100;i++){frame=routes.tick(dt,{...active,capacity:1});check(frame);}
 assert.equal(frame.actors[1].enabled,false,'second actor drains along exit in Low');
 assert.ok(frame.actors[0].distance>0,'Low retains walking');
 for(let i=0;i<60*75;i++){frame=routes.tick(dt,{...active,open:false,capacity:1});check(frame);}
 assert.ok(frame.actors.every(a=>!a.enabled));
 assert.equal(frame.corridorOwner,null);
 assert.equal(frame.doorAngle,0);
});

test('hidden, Reduce Motion, long gaps, repaint cancellation and disposal do not replay travel',()=>{
 const routes=new NativeCustomerRoutes();let frame!:RouteFrame;
 for(let i=0;i<60*7;i++)frame=routes.tick(dt,active);
 const before=frame;
 routes.cancelPresentation();
 const hidden=routes.tick(3600,{...active,visible:false});
 assert.deepEqual(hidden.actors.map(a=>[a.x,a.z,a.distance]),before.actors.map(a=>[a.x,a.z,a.distance]));
 assert.equal(hidden.doorAngle,before.doorAngle);
 const reduced=routes.tick(3600,{...active,reduceMotion:true});
 assert.deepEqual(reduced,hidden);
 const resumed=routes.tick(3600,active);
 for(let i=0;i<2;i++)assert.ok(Math.hypot(resumed.actors[i].x-before.actors[i].x,resumed.actors[i].z-before.actors[i].z)<=.62*.05+1e-9);
 assert.throws(()=>routes.tick(NaN,active),RangeError);
 routes.dispose();frame=routes.tick(500,active);
 assert.ok(frame.actors.every(a=>!a.enabled));assert.equal(frame.corridorOwner,null);
 routes.reset();assert.ok(routes.tick(100,active).actors.every(a=>!a.enabled),'disposed controller cannot restart');
});
