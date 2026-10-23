/** Native-v3 rigid-part motion authoring. Engine-neutral; seconds/metres/radians.
 * Facing -Z, Y-up right handed. Rotation samples ADD to the rig rest pose.
 * This data owns no timer, storage, inventory, cash, customer or renderer.
 */
export type StaffRotation = readonly [number, number, number];
export type StaffExpression = 'attentive' | 'focused' | 'smile';
export type StaffPropKind = 'bag' | 'box' | 'note' | 'cloth';
export interface StaffServiceFrame {
 readonly cue: {readonly kind: 'sale' | 'stock' | 'display'};
 readonly progress: number;
}
export interface StaffPose {
 readonly rotations: Readonly<Record<string, StaffRotation>>;
 readonly expression: StaffExpression;
 readonly eyelidClosure: number;
 readonly bodyLift: number;
 readonly turn: number;
 readonly clip: string;
 readonly progress: number;
 readonly prop: Readonly<{kind: StaffPropKind; owner: 'socket-left' | 'socket-right' | 'counter'; visible: boolean}>;
}
export const STAFF_CLIPS = Object.freeze({
 idle: {id:'native.staff.idle.v3',duration:6,loop:true,blend:.2,markers:[]},
 greet: {id:'native.staff.greet.v3',duration:1.8,loop:false,blend:.2,markers:[{time:.7,event:'outward-wave'}]},
 tidy: {id:'native.staff.tidy.v3',duration:2.6,loop:false,blend:.25,markers:[{time:.55,event:'cloth-contact'},{time:2.15,event:'cloth-release'}]},
 note: {id:'native.staff.check-note.v3',duration:2.8,loop:false,blend:.25,markers:[{time:.7,event:'note-held'},{time:2.2,event:'note-return'}]},
 stock: {id:'native.staff.receive-stock.v3',duration:2,loop:false,blend:.2,markers:[{time:.4,event:'box-contact'},{time:.9,event:'count'},{time:1.65,event:'box-return'}]},
 sale: {id:'native.staff.pack-handover.v3',duration:2.8,loop:false,blend:.2,markers:[{time:.55,event:'pack'},{time:1.26,event:'bag-lift'},{time:2.1,event:'handover-or-counter-release'},{time:2.52,event:'recover'}]},
 display: {id:'native.staff.acknowledge-display.v3',duration:.65,loop:false,blend:.12,markers:[{time:.3,event:'acknowledge'}]},
});
const ZERO: StaffRotation = [0,0,0];
const JOINTS = ['body','head','arm-left','arm-right','forearm-left','forearm-right','hand-left','hand-right','hair-secondary-left','hair-secondary-right'] as const;
const clamp = (p:number)=>Math.max(0,Math.min(1,p));
const smooth = (p:number)=>{const x=clamp(p);return x*x*(3-2*x);};
/** Compact envelope: exact neutral endpoints, C1 pose blending. */
const envelope = (p:number)=>smooth(p/.18)*smooth((1-p)/.18);
const turnEnvelope = (p:number)=>smooth(p/.25)*smooth((1-p)/.25);
function valid(value:number,label:string){if(!Number.isFinite(value)||value<0)throw new RangeError(label);return value;}
function blink(seconds:number){const t=(seconds%5.8)-2.8;return t>=0&&t<=.26?Math.sin(Math.PI*t/.26)**2:0;}

/**
 * Visible-time only. Sample the same time after UI repaint to get the same pose.
 * Service takes precedence over greeting, which takes precedence over idle work.
 * Caller suppresses sampling for Reduce Motion/hidden and resets prop ownership
 * on cancellation; this function cannot cancel or restart another channel.
 */
export function sampleStaff(visibleSeconds:number, service?:StaffServiceFrame, greetProgress?:number):StaffPose {
 valid(visibleSeconds,'visibleSeconds');
 if(service)valid(service.progress,'service progress');
 if(greetProgress!==undefined)valid(greetProgress,'greet progress');
 const rotations:Record<string,StaffRotation>={};for(const joint of JOINTS)rotations[joint]=ZERO;
 const idlePhase=visibleSeconds%6;
 let expression:StaffExpression='attentive',clip=STAFF_CLIPS.idle.id,progress=idlePhase/6,turn=0;
 let prop:StaffPose['prop']={kind:'note',owner:'counter',visible:false};
 rotations.head=[Math.sin((visibleSeconds%(Math.PI*2/.23))*.23)*.012,Math.sin((visibleSeconds%(Math.PI*2/.31))*.31)*.035,0];
 const bodyLift=Math.sin(idlePhase*Math.PI/3)*.003;
 let action:'greet'|'tidy'|'note'|'stock'|'sale'|'display'|undefined;
 if(service){action=service.cue.kind;progress=clamp(service.progress);}
 else if(greetProgress!==undefined&&greetProgress<=1){action='greet';progress=clamp(greetProgress);}
 else {
  // 16-second stagger, first readable task at six seconds. Two different tasks
  // alternate, with an unhurried pause. No wall-clock catch-up is involved.
  const phase=(visibleSeconds+10)%16;
  const cycle=Math.floor(((visibleSeconds+10)%32)/16);
  const kind=cycle%2===1?'tidy':'note';
  const duration=STAFF_CLIPS[kind].duration;
  if(phase<duration){action=kind;progress=phase/duration;}
 }
 if(action){
  const e=envelope(progress);clip=STAFF_CLIPS[action].id;
  if(action==='greet'){
   expression='smile';
   rotations.head=[-.025*e,-.07*e,-.035*e];
   // Positive right Z rotation moves the hanging arm OUTWARD (+X), away
   // from the torso. Shoulder pitch keeps forearm/hand in front of clothing.
   rotations['arm-right']=[.25*e,-.08*e,(.85+.075*Math.sin(progress*Math.PI*6))*e];
   rotations['forearm-right']=[.8*e,0,0];rotations['hand-right']=[0,.12*Math.sin(progress*Math.PI*6)*e,0];
  } else if(action==='display'){
   expression='smile';rotations.head=[.11*Math.sin(progress*Math.PI)**2,0,0];
  } else {
   expression=action==='sale'&&progress>.62?'smile':'focused';
   // Elbow-first clearance arc: tuck the lower arm in the staff-side aisle,
   // lift the upper arm, then unfold over the counter. Reverse that ordering
   // on recovery so hands never sweep through the solid counter edge.
   const tuck=smooth(progress/.04)*smooth((1-progress)/.04);
   const lift=smooth((progress-.04)/.11)*smooth((.96-progress)/.11);
   const unfold=smooth((progress-.15)/.07)*smooth((.85-progress)/.07);
   const elbow=(target:number)=>tuck*(1.48+(target-1.48)*unfold);
   rotations['arm-left']=[1.10*lift,0,-.16*lift];rotations['arm-right']=[1.10*lift,0,.16*lift];
   rotations['forearm-left']=[elbow(.95),0,0];rotations['forearm-right']=[elbow(.95),0,0];
   rotations.head=[.12*e,0,.012*e];
   if(action==='tidy'){
    rotations['arm-left']=[.4*lift,0,-.1*lift];rotations['forearm-left']=[elbow(.55),0,0];
    rotations['arm-right']=[1.12*lift,.18*Math.sin(progress*Math.PI*4)*unfold,.22*lift];
    rotations['forearm-right']=[elbow(.87),0,0];
    prop={kind:'cloth',owner:'socket-right',visible:progress>.16&&progress<.84};
   } else if(action==='note'){
    rotations['arm-left']=[1.05*lift,0,-.20*lift];rotations['forearm-left']=[elbow(1.05),0,0];
    rotations['arm-right']=[.76*lift,.05*lift,.18*lift];rotations['forearm-right']=[elbow(1.0),0,0];
    rotations.head=[.16*e,-.10*e,0];
    prop={kind:'note',owner:'socket-left',visible:progress>.18&&progress<.82};
   } else if(action==='stock'){
    rotations['forearm-right']=[elbow(.95+.12*Math.sin(progress*Math.PI*6)),0,0];
    rotations.head=[.14*e,-.035*e,0];
    prop={kind:'box',owner:'counter',visible:progress>.12&&progress<.88};
   } else if(action==='sale'){
    const reach=smooth((progress-.42)/.25)*smooth((.94-progress)/.15);
    rotations['arm-right']=[(1.10+.18*reach)*lift,0,(.16+.10*reach)*lift];
    rotations['forearm-right']=[elbow(.95-.48*reach),0,0];
    rotations['arm-left']=[1.10*lift,0,-.16*lift];
    rotations['forearm-left']=[elbow(.95),0,0];
    rotations.head=[(.12-.17*reach)*e,-.035*e,-.02*e];
    turn=-.08*turnEnvelope(progress);
    // Owner markers deliberately stay deterministic. Adapter keeps a single
    // prop pool, reparents at these boundaries, and disposes ownership on skip.
    prop={kind:'bag',owner:progress<.45?'counter':progress<.79?'socket-right':'counter',visible:progress>.12&&progress<.9};
   }
  }
  // Secondary locks follow a small bounded fraction of the head/work gesture.
  rotations['hair-secondary-left']=[0,0,-.035*Math.sin(progress*Math.PI*2)*e];
  rotations['hair-secondary-right']=[0,0,.028*Math.sin(progress*Math.PI*2+.6)*e];
 }
 // Canonical zero avoids signed-zero differences at identical neutral endpoints.
 for(const joint of Object.keys(rotations))rotations[joint]=rotations[joint].map(a=>a===0?0:a) as unknown as StaffRotation;
 return {rotations,expression,eyelidClosure:blink(visibleSeconds),bodyLift,turn,clip,progress,prop};
}
