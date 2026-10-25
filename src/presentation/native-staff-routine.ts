/** A bounded staff-only walk in the existing right aisle. Visual time only;
 * no visits, sales, inventory, rewards or saved progression are created. */
import {fixtureClearance,type RouteFrame} from './native-routes';
export const staffRoutineContract={id:'native.staff.routine.v9',home:{x:2.6,z:-.65},welcome:{x:2.20,z:1.40},inspect:{x:2.22,z:.48},speed:.40,acceleration:.7,radius:.29,separation:.66};
export class NativeStaffRoutine {
 private x=2.6;private z=-.65;private yaw=0;private speed=0;private distance=0;private time=0;private intent='home';
 tick(seconds:number,routes:RouteFrame,work:boolean,motion:boolean,holdWelcome=false){
  if(!Number.isFinite(seconds)||seconds<0)throw Error('staff route delta');const dt=Math.min(.05,seconds);
  if(motion)this.time+=dt;
  const incoming=routes.actors.some(a=>a.enabled&&a.state==='entering'&&a.z>1.25);
  const phase=this.time%32;
  this.intent=work?'checkout':incoming||holdWelcome?'welcome':phase<9?'home':phase<17?'inspect':phase<25?'welcome':'home';
  const target=this.intent==='checkout'||this.intent==='home'?staffRoutineContract.home:this.intent==='welcome'?staffRoutineContract.welcome:staffRoutineContract.inspect;
  const dx=target.x-this.x,dz=target.z-this.z,remaining=Math.hypot(dx,dz);
  if(!motion){this.speed=0;return this.frame(target,remaining);}
  if(remaining>.002){const heading=Math.atan2(-dx,-dz),d=Math.atan2(Math.sin(heading-this.yaw),Math.cos(heading-this.yaw));this.yaw+=Math.max(-2.2*dt,Math.min(2.2*dt,d));
   if(Math.abs(d)<.18){const speed=Math.min(staffRoutineContract.speed,this.speed+staffRoutineContract.acceleration*dt,Math.sqrt(2*staffRoutineContract.acceleration*remaining)),step=Math.min(remaining,speed*dt),next={x:this.x+dx/remaining*step,z:this.z+dz/remaining*step};
    const clear=fixtureClearance(next)>=staffRoutineContract.radius&&routes.actors.every(a=>!a.enabled||Math.hypot(next.x-a.x,next.z-a.z)>=staffRoutineContract.separation);
    if(clear){this.x=next.x;this.z=next.z;this.distance+=step;this.speed=speed;}else this.speed=0;
   }else this.speed=0;
  }else{this.x=target.x;this.z=target.z;this.speed=0;}
  return this.frame(target,Math.hypot(target.x-this.x,target.z-this.z));
 }
 private frame(target:{x:number;z:number},remaining:number){return {x:this.x,z:this.z,yaw:this.yaw,speed:this.speed,distance:this.distance,intent:this.intent,target,atHome:Math.hypot(this.x-2.6,this.z+.65)<.008&&this.speed<.02,moving:remaining>.008};}
}
