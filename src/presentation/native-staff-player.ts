/** Stateful native staff playback. Pure seconds/radians/metres; no timers,
 * storage, Babylon or economic writes. Clip clocks and cross-clip transitions
 * belong here; the renderer only binds the returned rest-relative pose. */
import {sampleStaff,STAFF_CLIPS,type StaffPose,type StaffServiceFrame,type StaffExpression,type StaffRotation,type StaffIdleTask} from './native-staff';

export interface StaffPlaybackPose extends StaffPose {
 readonly expressionWeights:Readonly<Record<StaffExpression,number>>;
 readonly propOpacity:number;
 readonly transitioning:boolean;
}
const clamp=(v:number)=>Math.max(0,Math.min(1,v));
const smooth=(v:number)=>{const x=clamp(v);return x*x*(3-2*x);};
const lerp=(a:number,b:number,t:number)=>a+(b-a)*t;
const expression=(name:StaffExpression)=>({attentive:Number(name==='attentive'),focused:Number(name==='focused'),smile:Number(name==='smile')});
const decorate=(pose:StaffPose):StaffPlaybackPose=>({...pose,expressionWeights:expression(pose.expression),propOpacity:Number(pose.prop.visible),transitioning:false});
const neutral=()=>decorate(sampleStaff(0,undefined,undefined,null));
const blendDuration=(clip:string)=>Math.max(.32,Math.min(.42,(Object.values(STAFF_CLIPS).find(c=>c.id===clip)?.blend??.2)+.12));

/** During an interruption the lower arms tuck before shoulder retraction and
 * unfold only after the shoulder reaches its new safe position. This follows
 * the same counter-clearance ordering as the authored work clips, rather than
 * linearly sweeping extended hands through a solid counter. */
function crossfade(from:StaffPlaybackPose,target:StaffPose,progress:number):StaffPlaybackPose {
 const p=clamp(progress),t=smooth(p),rotations:Record<string,StaffRotation>={};
 for(const id of Object.keys(target.rotations)){
  const a=from.rotations[id]??[0,0,0],b=target.rotations[id];
  rotations[id]=a.map((x,k)=>lerp(x,b[k],t)) as unknown as StaffRotation;
 }
 for(const side of ['left','right']){
  const shoulder='arm-'+side,elbow='forearm-'+side,a=from.rotations[shoulder],b=target.rotations[shoulder];
  const oldLower=from.rotations[elbow]??[0,0,0];
  if(a&&Math.max(...a.map(Math.abs),...oldLower.map(Math.abs))<.015){
   // Authored neutral entries already have their own elbow-first C1 envelope.
   // Damping those angles independently would destroy that clearance ordering.
   rotations[shoulder]=b;rotations[elbow]=target.rotations[elbow];continue;
  }
  if(!a||!b||Math.max(a[0],b[0])<.32)continue;
  const at=smooth((p-.25)/.5);
  rotations[shoulder]=a.map((x,k)=>lerp(x,b[k],at)) as unknown as StaffRotation;
  const oldElbow=from.rotations[elbow]??[0,0,0],newElbow=target.rotations[elbow]??[0,0,0];
  const angle=p<.25?lerp(oldElbow[0],1.48,smooth(p/.25)):p<.75?1.48:lerp(1.48,newElbow[0],smooth((p-.75)/.25));
  rotations[elbow]=[angle,lerp(oldElbow[1],newElbow[1],t),lerp(oldElbow[2],newElbow[2],t)];
 }
 const weights=expression(target.expression),mixed={} as Record<StaffExpression,number>;
 for(const key of ['attentive','focused','smile']as const)mixed[key]=lerp(from.expressionWeights[key],weights[key],t);
 // One outgoing prop fades while still safely held, before the arm retracts.
 // The incoming prop is not shown until the transition is finished. Socket
 // parent changes within a clip remain the renderer's world-pose operation.
 const opacity=from.propOpacity*(1-smooth(p/.25));
 const outgoing=opacity>1e-6&&from.prop.visible;
 return {...target,rotations,bodyLift:lerp(from.bodyLift,target.bodyLift,t),turn:lerp(from.turn,target.turn,t),eyelidClosure:lerp(from.eyelidClosure,target.eyelidClosure,t),expressionWeights:mixed,prop:outgoing?from.prop:{...target.prop,visible:false},propOpacity:outgoing?opacity:0,transitioning:p<1};
}

export class StaffMotionPlayer {
 private visibleTime=0;
 private idleWait=6;
 private idleTask:StaffIdleTask|undefined;
 private idleElapsed=0;
 private nextIdle:'tidy'|'note'='tidy';
 private currentPose:StaffPlaybackPose=neutral();
 private inputKey='idle';
 private lastServiceProgress=0;
 private lastGreetProgress=0;
 private repeat=0;
 private transition:{from:StaffPlaybackPose;elapsed:number;duration:number}|undefined;

 get current():StaffPlaybackPose{return this.currentPose;}
 /** Explicit hidden/skip/Reduce Motion cancellation is immediate; no old prop,
  * stale transition or midway idle task can reappear when playback resumes. */
 cancel():void {
  this.currentPose=neutral();this.transition=undefined;this.inputKey='idle';
  this.idleTask=undefined;this.idleElapsed=0;this.idleWait=7;
  this.lastServiceProgress=0;this.lastGreetProgress=0;
 }
 reset():void {this.cancel();this.visibleTime=0;this.idleWait=6;this.nextIdle='tidy';this.repeat=0;}

 tick(deltaSeconds:number,service:StaffServiceFrame|undefined,greetProgress:number|undefined,enabled:boolean):StaffPlaybackPose {
  if(!Number.isFinite(deltaSeconds)||deltaSeconds<0)throw new RangeError('staff delta seconds');
  if(!enabled){this.cancel();return this.currentPose;}
  const dt=Math.min(.05,deltaSeconds);this.visibleTime+=dt;
  let externalKey='idle';
  if(service){
   const identity=service as StaffServiceFrame&{receiptRevision?:number;cue:{commandId?:string}};
   if(service.progress+.03<this.lastServiceProgress)this.repeat++;
   this.lastServiceProgress=service.progress;
   externalKey=`service:${identity.receiptRevision??0}:${service.cue.kind}:${identity.cue.commandId??''}:${this.repeat}`;
  }else if(greetProgress!==undefined&&greetProgress<=1){
   if(greetProgress+.03<this.lastGreetProgress)this.repeat++;
   this.lastGreetProgress=greetProgress;externalKey='greet:'+this.repeat;
  }
  const hadExternal=this.inputKey.startsWith('service:')||this.inputKey.startsWith('greet:');
  if(externalKey!=='idle'){
   // Interrupt and discard work, never pause modulo into its middle later.
   this.idleTask=undefined;this.idleElapsed=0;this.idleWait=7;
  }else if(hadExternal){this.idleTask=undefined;this.idleElapsed=0;this.idleWait=7;}
  else if(this.idleTask){
   this.idleElapsed+=dt;const duration=STAFF_CLIPS[this.idleTask.kind].duration;
   if(this.idleElapsed>=duration){this.idleTask=undefined;this.idleElapsed=0;this.idleWait=9-duration;}
   else this.idleTask={kind:this.idleTask.kind,progress:this.idleElapsed/duration};
  }else{
   this.idleWait-=dt;
   if(this.idleWait<=1e-9){this.idleTask={kind:this.nextIdle,progress:0};this.idleElapsed=0;this.nextIdle=this.nextIdle==='tidy'?'note':'tidy';}
  }
  const target=sampleStaff(this.visibleTime,service,greetProgress,this.idleTask??null);
  const key=externalKey==='idle'?(this.idleTask?'task:'+this.idleTask.kind:'idle'):externalKey;
  if(key!==this.inputKey){this.transition={from:this.currentPose,elapsed:0,duration:Math.max(blendDuration(this.currentPose.clip),blendDuration(target.clip))};this.inputKey=key;}
  if(this.transition){
   const transition=this.transition;transition.elapsed+=dt;
   if(transition.elapsed>=transition.duration){this.transition=undefined;this.currentPose=decorate(target);}
   else this.currentPose=crossfade(transition.from,target,transition.elapsed/transition.duration);
  }else this.currentPose=decorate(target);
  return this.currentPose;
 }
}
