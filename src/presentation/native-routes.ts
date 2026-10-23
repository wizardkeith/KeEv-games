/**
 * Authored visual visits, independent of sales, inventory and wall-clock time.
 * Metres, RH / Y-up, actor forward -Z. One reservation covers the shared aisle;
 * it releases after the private branch clears, so distinct stops can overlap.
 * No visual customer is a buyer ID.
 */
export type RoutePoint = Readonly<{x:number;z:number}>;
export type CustomerRouteState = 'outside'|'entering'|'browsing'|'waiting'|'leaving'|'to-service'|'receiving'|'service-exit-wait';
export interface RouteSettings {
 readonly open:boolean;
 readonly visible:boolean;
 readonly reduceMotion:boolean;
 readonly capacity:1|2;
}
export interface CustomerRouteFrame {
 readonly id:'visitor-a'|'visitor-b';
 readonly enabled:boolean;
 readonly x:number;
 readonly z:number;
 readonly yaw:number;
 readonly speed:number;
 readonly distance:number;
 readonly state:CustomerRouteState;
 readonly browseProgress:number;
 readonly hasBag:boolean;
 readonly serviceRevision?:number;
 readonly handoverProgress:number;
}
export interface RouteFrame {
 readonly actors:readonly CustomerRouteFrame[];
 readonly doorOpen:boolean;
 /** Negative Y rotation, left hinge (2.34,3.20), opening towards exterior +Z. */
 readonly doorAngle:number;
 readonly corridorOwner:CustomerRouteFrame['id']|null;
}
export const CUSTOMER_ROUTE_CONTRACT = Object.freeze({
 id:'native.customer-routes.v3', units:'metres', forward:'-Z', radius:.24,
 maxSpeed:.54, acceleration:.92, turnRadiansPerSecond:2.2,
 doorHinge:Object.freeze({x:2.34,z:3.20}), doorLeafWidth:1.42,
 doorMaxAngle:-1.42, doorPassAngle:-1.30, maxDeltaSeconds:.05,
 servicePoint:Object.freeze({x:3.40,z:-.65}), serviceFacingYaw:Math.PI/2,
 serviceAcquireSeconds:8.5, serviceReadySeconds:4.5,
 staffAvoidance:Object.freeze({x:2.6,z:-.65,radius:.25}),
});
const point=(x:number,z:number):RoutePoint=>Object.freeze({x,z});
// Outside wait is deliberately off the leaf's sweep, unlike a centred doorstep.
const approach=[point(4.18,4.05),point(3.05,4.05),point(3.05,3.20),point(3.05,2.05)];
export const CUSTOMER_ROUTES:readonly (readonly RoutePoint[])[]=Object.freeze([
 Object.freeze([...approach,point(1.35,2.05),point(1.35,-.10)]),
 Object.freeze([...approach,point(-.65,2.05),point(-.65,1.10)]),
]);
export const CUSTOMER_OBSTACLES=Object.freeze([
 {id:'display.1',x:-2,z:-1.5,halfX:.79,halfZ:.475},
 {id:'display.2',x:.1,z:-.1,halfX:.79,halfZ:.475},
 {id:'display.3',x:-2,z:1.1,halfX:.79,halfZ:.475},
 {id:'counter',x:2.6,z:-1.5,halfX:.95,halfZ:.46},
 // Low cabinet / back shelves have the same plan silhouette.
 {id:'back.display',x:-.8,z:2.85,halfX:2.6,halfZ:.315},
]);
export function fixtureClearance(p:RoutePoint):number {
 return Math.min(...CUSTOMER_OBSTACLES.map(o=>Math.hypot(
  Math.max(0,Math.abs(p.x-o.x)-o.halfX),
  Math.max(0,Math.abs(p.z-o.z)-o.halfZ),
 )));
}
const distance=(a:RoutePoint,b:RoutePoint)=>Math.hypot(a.x-b.x,a.z-b.z);
const angleDelta=(a:number,b:number)=>Math.atan2(Math.sin(b-a),Math.cos(b-a));
function turn(a:number,b:number,dt:number):number {
 const delta=angleDelta(a,b),step=CUSTOMER_ROUTE_CONTRACT.turnRadiansPerSecond*dt;
 return a+Math.max(-step,Math.min(step,delta));
}
/** Round only corners whose entire sampled arc clears fixtures and staff.
 * Narrow door/aisle turns retain the authored stop/turn route. */
function roundedPath(path:readonly RoutePoint[]):readonly RoutePoint[]{
 if(path.length<3)return path;
 const out:RoutePoint[]=[path[0]];
 for(let i=1;i<path.length-1;i++){
  const a=path[i-1],b=path[i],c=path[i+1],ab=distance(a,b),bc=distance(b,c),r=Math.min(.42,ab*.35,bc*.35);
  if(r<.06){out.push(b);continue;}
  const start=point(b.x+(a.x-b.x)*r/ab,b.z+(a.z-b.z)*r/ab),end=point(b.x+(c.x-b.x)*r/bc,b.z+(c.z-b.z)*r/bc);
  const curve=Array.from({length:9},(_,n)=>{const t=n/8,v=1-t;return point(v*v*start.x+2*v*t*b.x+t*t*end.x,v*v*start.z+2*v*t*b.z+t*t*end.z);});
  if(curve.every(p=>fixtureClearance(p)>=.26&&distance(p,CUSTOMER_ROUTE_CONTRACT.staffAvoidance)>=.51)&&b.z<2.55)out.push(...curve);else out.push(b);
 }
 out.push(path.at(-1)!);return out;
}
interface Visitor {
 id:CustomerRouteFrame['id']; index:0|1; enabled:boolean; x:number;z:number;yaw:number;
 speed:number;distance:number;state:CustomerRouteState;path:readonly RoutePoint[];
 next:number;goal:'browse'|'outside'|'service';browseElapsed:number;browseDuration:number;
 wantsExit:boolean;cooldown:number;pause:number;hasBag:boolean;
}
function visitor(index:0|1):Visitor {
 const outside=CUSTOMER_ROUTES[index][0];
 return {id:index===0?'visitor-a':'visitor-b',index,enabled:false,...outside,
  yaw:Math.PI/2,speed:0,distance:0,state:'outside',path:[],next:0,goal:'browse',
  browseElapsed:0,browseDuration:index===0?8.4:9.2,wantsExit:false,cooldown:0,pause:0,hasBag:false};
}

export class NativeCustomerRoutes {
 private visitors:[Visitor,Visitor]=[visitor(0),visitor(1)];
 private owner:Visitor|undefined;
 private time=0;
 private nextArrival=.6;
 private nextApplicant=0;
 private door=0;
 private disposed=false;
 private lastServiceRevision=0;
 private service:{revision:number;visitor:Visitor;deadline:number;readyAt?:number;handedAt?:number}|undefined;

 /** One recent aggregate commit may reserve one existing, reachable browser.
  * Revision is a visual token only, never a buyer ID or count. Failed selection
  * also consumes the request so a historical receipt cannot recruit a later guest. */
 requestService(revision:number):CustomerRouteFrame['id']|undefined {
  if(!Number.isSafeInteger(revision)||revision<1)throw new RangeError('revision');
  if(this.disposed||revision<=this.lastServiceRevision)return;
  this.lastServiceRevision=revision;
  if(this.service)return;
  const candidates=this.visitors.filter(v=>v.enabled&&!v.wantsExit&&!v.hasBag&&(v.state==='browsing'||v.state==='entering')&&v.x>=1.3&&v.z<=2.1&&v.z>=-.12)
   .map(v=>{
    const end=CUSTOMER_ROUTE_CONTRACT.servicePoint;
    const direct=Array.from({length:25},(_,i)=>point(v.x+(end.x-v.x)*i/24,v.z+(end.z-v.z)*i/24)).every(p=>fixtureClearance(p)>=.25&&distance(p,CUSTOMER_ROUTE_CONTRACT.staffAvoidance)>=.51);
    const path=direct?[point(v.x,v.z),end]:[point(v.x,v.z),point(3.4,v.z),end];
    let heading=v.yaw,estimate=.4;
    for(let i=1;i<path.length;i++){const a=path[i-1],b=path[i],yaw=Math.atan2(a.x-b.x,a.z-b.z);estimate+=distance(a,b)/CUSTOMER_ROUTE_CONTRACT.maxSpeed+Math.abs(angleDelta(heading,yaw))/CUSTOMER_ROUTE_CONTRACT.turnRadiansPerSecond;heading=yaw;}
    estimate+=Math.abs(angleDelta(heading,CUSTOMER_ROUTE_CONTRACT.serviceFacingYaw))/CUSTOMER_ROUTE_CONTRACT.turnRadiansPerSecond;
    return {v,path,estimate};
   }).filter(c=>c.estimate<CUSTOMER_ROUTE_CONTRACT.serviceAcquireSeconds).sort((a,b)=>a.estimate-b.estimate);
  const chosen=candidates[0];if(!chosen)return;const v=chosen.v;
  v.path=roundedPath(chosen.path);
  v.next=1;v.goal='service';v.state='to-service';v.speed=0;v.pause=.10;
  this.service={revision,visitor:v,deadline:this.time+CUSTOMER_ROUTE_CONTRACT.serviceAcquireSeconds};
  return v.id;
 }
 serviceStatus(revision:number):'none'|'approaching'|'ready' {
  if(!this.service||this.service.revision!==revision)return 'none';
  return this.service.readyAt!==undefined?'ready':'approaching';
 }
 /** Called only by the visual release marker of the already committed summary. */
 handover(revision:number):boolean {
  const s=this.service;if(!s||s.revision!==revision||s.readyAt===undefined||s.handedAt!==undefined)return false;
  s.handedAt=this.time;s.visitor.hasBag=true;return true;
 }
 finishService(revision:number):void {
  const s=this.service;if(!s||s.revision!==revision)return;
  this.departService(s.visitor);this.service=undefined;
 }
 private departService(v:Visitor):void {
  // At the service bay, leave along the clear right aisle. If interrupted
  // earlier, undo only traversed private segments before rejoining the old route.
  v.path=roundedPath([point(v.x,v.z),point(3.40,v.z),point(3.40,2.05),point(3.05,2.05),point(3.05,3.20),point(3.05,4.05),point(4.18,4.05)]);
  v.next=1;v.goal='outside';v.state='service-exit-wait';v.wantsExit=true;v.speed=0;v.pause=.10;
  if(!this.owner||this.owner===v){v.state='leaving';v.wantsExit=false;this.owner=v;}
 }
 /** Hidden/cancel clears only a service/bag. Ordinary browsing positions survive. */
 cancelPresentation():void {
  if(this.service){this.service.visitor.hasBag=false;this.departService(this.service.visitor);this.service=undefined;}
  for(const v of this.visitors)v.hasBag=false;
 }
 /** Only for replacing a loaded save stream/context, never ordinary redraw. */
 reset():void {
  this.visitors=[visitor(0),visitor(1)];this.owner=undefined;
  this.time=0;this.nextArrival=.6;this.nextApplicant=0;this.door=0;this.service=undefined;this.lastServiceRevision=0;
 }
 dispose():void {this.reset();this.disposed=true;}

 private depart(v:Visitor):void {
  // Reverse only already traversed segments when closing during an entrance.
  const traversed=v.state==='entering'?v.path.slice(0,v.next):CUSTOMER_ROUTES[v.index];
  v.path=roundedPath([point(v.x,v.z),...traversed.slice().reverse()]);
  v.next=1;v.goal='outside';v.state='leaving';v.wantsExit=false;
  v.pause=.10;this.owner=v;
 }
 private arrive(v:Visitor):void {
  const route=CUSTOMER_ROUTES[v.index];
  v.enabled=true;v.x=route[0].x;v.z=route[0].z;v.yaw=Math.PI/2;
  v.path=roundedPath(route);v.next=1;v.goal='browse';v.state='entering';v.speed=0;
  v.browseElapsed=0;v.wantsExit=false;v.pause=.10;v.hasBag=false;this.owner=v;
  this.nextArrival=this.time+7.6;this.nextApplicant=1-v.index;
 }
 private move(v:Visitor,dt:number):void {
  const target=v.path[v.next];
  if(!target){
   v.speed=0;if(this.owner===v)this.owner=undefined;
   if(v.goal==='browse'){v.state='browsing';v.browseElapsed=0;}
   else if(v.goal==='service'){v.state='receiving';}
   else {v.enabled=false;v.hasBag=false;v.state='outside';v.cooldown=this.time+9+v.index*2;}
   return;
  }
  // Door opens fully before leaving the safe exterior wait. On departure it is
  // already requested from the beginning of the return route.
  if(v.z>=2.55&&this.door>CUSTOMER_ROUTE_CONTRACT.doorPassAngle){v.speed=0;return;}
  const dx=target.x-v.x,dz=target.z-v.z,remaining=Math.hypot(dx,dz);
  const future=v.path[v.next+1],previous=v.path[v.next-1];
  const straight=!!future&&!!previous&&Math.abs(angleDelta(
   Math.atan2(target.x-previous.x,target.z-previous.z),Math.atan2(future.x-target.x,future.z-target.z),
  ))<.55;
  if(remaining<.0001){v.distance+=remaining;v.x=target.x;v.z=target.z;v.next++;if(!straight){v.speed=0;v.pause=.10;}return;}
  const heading=Math.atan2(-dx,-dz);
  v.yaw=turn(v.yaw,heading,dt);
  if(v.pause>0){v.pause=Math.max(0,v.pause-dt);v.speed=0;return;}
  // Turns are in place at authored corners; no diagonal shortcut through tables.
  if(Math.abs(angleDelta(v.yaw,heading))>.25){v.speed=Math.max(0,v.speed-1.8*dt);return;}
  const maxSpeed=CUSTOMER_ROUTE_CONTRACT.maxSpeed-(v.index===0?0:.035);
  let brakingDistance=remaining;if(straight)for(let j=v.next;j<v.path.length-1&&brakingDistance<1;j++){const a=v.path[j],b=v.path[j+1],c=v.path[j+2];brakingDistance+=distance(a,b);if(c&&Math.abs(angleDelta(Math.atan2(b.x-a.x,b.z-a.z),Math.atan2(c.x-b.x,c.z-b.z)))>=.55)break;}
  const desired=Math.min(maxSpeed,Math.sqrt(2*CUSTOMER_ROUTE_CONTRACT.acceleration*brakingDistance));
  v.speed=Math.min(desired,v.speed+CUSTOMER_ROUTE_CONTRACT.acceleration*dt);
  const step=Math.min(remaining,v.speed*dt);
  const proposed={x:v.x+dx/remaining*step,z:v.z+dz/remaining*step};
  const clear=this.visitors.every(other=>!other.enabled||other===v||distance(proposed,other)>=CUSTOMER_ROUTE_CONTRACT.radius*2+.04);
  if(!clear||fixtureClearance(proposed)<CUSTOMER_ROUTE_CONTRACT.radius||distance(proposed,CUSTOMER_ROUTE_CONTRACT.staffAvoidance)<CUSTOMER_ROUTE_CONTRACT.radius+CUSTOMER_ROUTE_CONTRACT.staffAvoidance.radius){v.speed=0;return;}
  v.x=proposed.x;v.z=proposed.z;v.distance+=step;
  // The other visitor can enter once this one clears the shared aisle by a
  // full body diameter. Private branches remain distinct, not shared targets.
  if(this.owner===v&&v.goal==='browse'&&(
   (v.index===0&&v.x===1.35&&v.z<1.25)||
   (v.index===1&&v.z===2.05&&v.x<.75)
  ))this.owner=undefined;
 }
 tick(deltaSeconds:number,settings:RouteSettings):RouteFrame {
  if(!Number.isFinite(deltaSeconds)||deltaSeconds<0)throw new RangeError('deltaSeconds');
  if(settings.capacity!==1&&settings.capacity!==2)throw new RangeError('capacity');
  const dt=Math.min(deltaSeconds,CUSTOMER_ROUTE_CONTRACT.maxDeltaSeconds);
  if(this.disposed)return this.frame();
  // Hidden/reduced frames neither move roots nor accumulate arrival/browse time.
  // Leave the door stable too, including when a visitor straddles the threshold.
  if(!settings.visible||settings.reduceMotion){if(this.service)this.cancelPresentation();return this.frame(true);}
  this.time+=dt;
  if(this.service){const s=this.service;
   if(!settings.open||s.visitor.index>=settings.capacity||
    (s.readyAt===undefined&&this.time>s.deadline)||
    (s.readyAt!==undefined&&this.time-s.readyAt>CUSTOMER_ROUTE_CONTRACT.serviceReadySeconds))this.cancelPresentation();
  }
  for(const v of this.visitors){
   if(!v.enabled)continue;
   if(!settings.open||v.index>=settings.capacity)v.wantsExit=true;
   if(v.state==='entering'&&v.wantsExit&&(!this.owner||this.owner===v))this.depart(v);
   if(v.state==='receiving'){v.speed=0;v.yaw=turn(v.yaw,CUSTOMER_ROUTE_CONTRACT.serviceFacingYaw,dt);if(this.service?.visitor===v&&this.service.readyAt===undefined&&Math.abs(angleDelta(v.yaw,CUSTOMER_ROUTE_CONTRACT.serviceFacingYaw))<.04)this.service.readyAt=this.time;}
   if(v.state==='browsing'||v.state==='waiting'){
    v.yaw=turn(v.yaw,Math.PI/2,dt);v.speed=0;
    v.browseElapsed+=dt;
    if(v.browseElapsed>=v.browseDuration)v.wantsExit=true;
    if(v.wantsExit)v.state='waiting';
   }
  }
  if(!this.owner){
   // Outgoing visitors have priority; an inactive pool slot never blocks exits.
   const leaving=this.visitors.find(v=>v.enabled&&v.wantsExit&&v.state!=='leaving');
   if(leaving){if(leaving.state==='service-exit-wait'){leaving.state='leaving';leaving.wantsExit=false;this.owner=leaving;}else this.depart(leaving);}
   else if(settings.open&&this.time>=this.nextArrival){
    for(let offset=0;offset<2;offset++){
     const index=(this.nextApplicant+offset)%2,v=this.visitors[index];
     if(index<settings.capacity&&!v.enabled&&this.time>=v.cooldown){this.arrive(v);break;}
    }
   }
  }
  const request=!!this.owner;
  const desired=request?CUSTOMER_ROUTE_CONTRACT.doorMaxAngle:0;
  this.door+=Math.max(-2.8*dt,Math.min(2.8*dt,desired-this.door));
  for(const v of this.visitors)if(v.enabled&&(v.state==='entering'||v.state==='leaving'||v.state==='to-service'))this.move(v,dt);
  return this.frame();
 }
 private frame(stable=false):RouteFrame {
  return Object.freeze({actors:Object.freeze(this.visitors.map(v=>Object.freeze({
   id:v.id,enabled:v.enabled,x:v.x,z:v.z,yaw:v.yaw,speed:stable?0:v.speed,
   distance:v.distance,state:v.state,browseProgress:Math.min(1,v.browseElapsed/v.browseDuration),hasBag:v.hasBag,
   ...(this.service?.visitor===v?{serviceRevision:this.service.revision}:{}),
   handoverProgress:this.service?.visitor===v&&this.service.handedAt!==undefined?Math.min(1,(this.time-this.service.handedAt)/.65):0,
  }))),doorOpen:this.door<-.02,doorAngle:this.door,corridorOwner:this.owner?.id??null});
 }
}
