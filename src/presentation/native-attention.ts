/** Presentation-only staff attention. RH forward -Z. Actual doorway and service
 * positions; no inventory, customer-spawn, economics, clock or action callbacks.
 * Existing work yaw/markers remain authoritative once oriented. Entry suppresses
 * reaching until the body arrives, then uses the existing elbow-first arc. */
import type {RouteFrame} from './native-routes';import type {StaffRotation} from './native-staff';
export const staffAttentionContract={id:'native.staff.attention.v9',staff:[2.6,-.65] as const,door:[3.05,3.20] as const,maxRadiansPerSecond:3.6,entrySeconds:.22};
const angle=(x:number,z:number)=>Math.atan2(staffAttentionContract.staff[0]-x,staffAttentionContract.staff[1]-z);
const delta=(a:number,b:number)=>Math.atan2(Math.sin(b-a),Math.cos(b-a));
const smooth=(x:number)=>{const t=Math.max(0,Math.min(1,x));return t*t*(3-2*t);};
export const welcomeYaw=angle(...staffAttentionContract.door);
export class StaffAttention {
 private yaw=welcomeYaw;private locked=false;private ready=false;private entry=0;private guest:string|undefined;
 tick(seconds:number,routes:RouteFrame,work:boolean,workYaw:number,handsBusy:boolean,motion:boolean,travelYaw?:number){
  if(!Number.isFinite(seconds)||seconds<0||!Number.isFinite(workYaw))throw Error('attention input');const dt=Math.min(.05,seconds);
  if(!motion){this.yaw=welcomeYaw;this.locked=false;this.ready=false;this.entry=0;this.guest=undefined;return {yaw:this.yaw,target:welcomeYaw,entry:0,work:false,mode:'welcome-still'};}
  const guests=routes.actors.filter(a=>a.enabled&&['entering','browsing','waiting','to-service','receiving'].includes(a.state));
  const chosen=guests.find(a=>a.id===this.guest)??guests.sort((a,b)=>Math.hypot(a.x-2.6,a.z+.65)-Math.hypot(b.x-2.6,b.z+.65))[0];this.guest=chosen?.id;
  if(work&&!this.locked){this.locked=true;this.ready=false;this.entry=0;}
  if(!work&&this.locked&&!handsBusy){this.locked=false;this.ready=false;this.entry=0;}
  const target=this.locked?workYaw:travelYaw!==undefined?travelYaw:chosen?angle(chosen.x,chosen.z):welcomeYaw;
  if(this.locked&&this.ready){this.yaw=workYaw;this.entry=Math.min(1,this.entry+dt/staffAttentionContract.entrySeconds);}
  else{const d=delta(this.yaw,target);this.yaw+=Math.max(-dt*staffAttentionContract.maxRadiansPerSecond,Math.min(dt*staffAttentionContract.maxRadiansPerSecond,d));
   if(this.locked&&Math.abs(delta(this.yaw,target))<.035){this.yaw=target;this.ready=true;this.entry=0;}
  }
  return {yaw:this.yaw,target,entry:this.locked?this.entry:1,work:this.locked,mode:this.locked?'work':travelYaw!==undefined?'walking':chosen?'customer':'welcome'};
 }
}
/** Existing elbow-first safety ordering, bounded to the remaining work pose.
 * Work clock continues; an unavailable orientation never delays a real commit. */
export function attentionRotations(rotations:Readonly<Record<string,StaffRotation>>,entry:number){
 if(entry>=1)return rotations;const seconds=Math.max(0,entry)*staffAttentionContract.entrySeconds,out={...rotations};
 const tuck=smooth(seconds/.04),lift=smooth((seconds-.04)/.11),unfold=smooth((seconds-.15)/.07);
 for(const side of ['left','right']){const arm='arm-'+side,elbow='forearm-'+side,hand='hand-'+side,a=rotations[arm]??[0,0,0],b=rotations[elbow]??[0,0,0];out[arm]=a.map(v=>v*lift) as unknown as StaffRotation;out[elbow]=[tuck*(1.48+(b[0]-1.48)*unfold),b[1]*lift,b[2]*lift];out[hand]=(rotations[hand]??[0,0,0]).map(v=>v*unfold) as unknown as StaffRotation;}
 return out;
}
