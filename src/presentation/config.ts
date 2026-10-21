/** Engine-neutral, presentation-only contract. All times are milliseconds. */
export const vfx={
 selection:{id:'fx.shelf.selection.v1',trigger:'selected-slot-change',duration:180,color:'#B59AC8',stableAlpha:.62},
 display:{id:'fx.display.settle.v1',trigger:'committed-display-delta',duration:200,lift:.025},
 sale:{id:'fx.sale.receipt.v1',trigger:'committed-eventSequence-delta',duration:700,color:'#98AC99'},
 stock:{id:'fx.stock.receipt.v1',trigger:'committed-purchase-delta',duration:600,color:'#C3AF8E'},
 support:{id:'fx.support.receipt.v1',trigger:'committed-recovery-total-delta',duration:700,color:'#B59AC8'},
 reveal:{id:'fx.sample.open.v1',trigger:'committed-revealed-false-to-true',duration:1100,color:'#D5C4DF'},
 dust:{id:'fx.window.dust.v1',trigger:'visible-high-quality',capacity:8,lifetime:12000,ratePerSecond:8/12,maxOpacity:.13,size:.018},
 policy:{majorCapacity:1,queueCapacity:0,maxDt:50,hidden:'cancel transient; pause ambient; no catchup',low:'no dust; static feedback',minimal:'no dust, pose animation or transient 3D feedback',reduced:'static poses and selection; immediate committed result'}
} as const;
export type MotionPolicy={low:boolean;minimal:boolean;reduced:boolean};
export function motionAllowed(p:MotionPolicy){return !p.low&&!p.minimal&&!p.reduced;}
export class FeedbackClock {
 active?:{kind:'sale'|'stock'|'support'|'display'|'reveal';slot:number;elapsed:number;duration:number};
 disposed=false;
 start(kind:NonNullable<FeedbackClock['active']>['kind'],slot:number,policy:MotionPolicy){if(this.disposed)return;this.active=motionAllowed(policy)?{kind,slot,elapsed:0,duration:vfx[kind].duration}:undefined;}
 step(dt:number,hidden=false){if(this.disposed)return;if(hidden){this.active=undefined;return;}if(this.active){this.active.elapsed+=Math.max(0,Math.min(vfx.policy.maxDt,Number.isFinite(dt)?dt:0));if(this.active.elapsed>=this.active.duration)this.active=undefined;}}
 cancel(){this.active=undefined;}
 dispose(){this.cancel();this.disposed=true;}
}
