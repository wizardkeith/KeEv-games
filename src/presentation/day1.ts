import {motionAllowed,type MotionPolicy,vfx} from './config';
/** One presentation-only gesture, never a queue or an economic command. */
export class Day1GestureClock {
 active?:{kind:'greet'|'sale';elapsed:number;duration:number};
 start(kind:'greet'|'sale',policy:MotionPolicy,hidden=false){this.cancel();if(!hidden&&!policy.reduced)this.active={kind,elapsed:0,duration:kind==='greet'?1800:2800};return !!this.active;}
 step(dt:number,policy:MotionPolicy,hidden=false){if(hidden||policy.reduced){this.cancel();return;}if(this.active){this.active.elapsed+=Math.max(0,Math.min(vfx.policy.maxDt,Number.isFinite(dt)?dt:0));if(this.active.elapsed>=this.active.duration)this.cancel();}}
 cancel(){this.active=undefined;}
}
