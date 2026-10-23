/** Native v3.1 foot placement, engine-neutral. Metres/radians/seconds; RH,+Y up,
 * actor faces -Z. One immutable stance anchor and one bounded swing per actor.
 * Rigid two-link IK maps the actual .25/.30m hierarchy; no simulation writes.
 */
export type FootVector=readonly [number,number,number];
export type FootQuaternion=readonly [number,number,number,number];
export interface FootRoot {readonly x:number;readonly z:number;readonly yaw:number;readonly distance:number;readonly speed:number;}
export interface PlantedLeg {readonly hip:FootQuaternion;readonly knee:FootQuaternion;readonly foot:FootQuaternion;readonly stance:boolean;readonly contactId:number;readonly ankleWorld:FootVector;readonly footYaw:number;}
export interface FootPlantPose {readonly bodyDrop:number;readonly left:PlantedLeg;readonly right:PlantedLeg;readonly armSwing:number;}
export const FOOT_PLANT_CONTRACT=Object.freeze({id:'native.feet.planted.v3.1',upperLength:.25,lowerLength:.30,halfStepMetres:.18,swingLiftMetres:.045,turnThresholdRadians:.16,settleSeconds:.28,stanceToleranceMetres:.002,soleWorldY:.08,ankleWorldY:.165,hipLocalY:.65,rootY:.065,maxDeltaSeconds:.05,method:'World ankle anchors and world foot yaw; two-link 3D rigid IK; forward knee pole; bounded one-foot swing. Hidden/reduced freezes state.'});
type Vec=[number,number,number];type Quat=[number,number,number,number];
const add=(a:FootVector,b:FootVector):Vec=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const sub=(a:FootVector,b:FootVector):Vec=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const mul=(a:FootVector,s:number):Vec=>[a[0]*s,a[1]*s,a[2]*s];
const dot=(a:FootVector,b:FootVector)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const cross=(a:FootVector,b:FootVector):Vec=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const length=(v:FootVector)=>Math.hypot(...v);
const normalized=(v:FootVector):Vec=>mul(v,1/Math.max(1e-12,length(v)));
const qmul=(a:FootQuaternion,b:FootQuaternion):Quat=>[a[3]*b[0]+a[0]*b[3]+a[1]*b[2]-a[2]*b[1],a[3]*b[1]-a[0]*b[2]+a[1]*b[3]+a[2]*b[0],a[3]*b[2]+a[0]*b[1]-a[1]*b[0]+a[2]*b[3],a[3]*b[3]-a[0]*b[0]-a[1]*b[1]-a[2]*b[2]];
const qinverse=(q:FootQuaternion):Quat=>[-q[0],-q[1],-q[2],q[3]];
const qyaw=(y:number):Quat=>[0,Math.sin(y/2),0,Math.cos(y/2)];
const qrotate=(q:FootQuaternion,v:FootVector):Vec=>qmul(qmul(q,[...v,0]),qinverse(q)).slice(0,3) as Vec;
function qfromTo(a:FootVector,b:FootVector):Quat {const x=normalized(a),y=normalized(b),d=dot(x,y);if(d<-.999999){const axis=normalized(cross(x,[1,0,0]));return [...axis,0];}const c=cross(x,y),q:Quat=[...c,1+d],n=Math.hypot(...q);return q.map(v=>v/n) as Quat;}
const yawVector=(v:FootVector,yaw:number):Vec=>qrotate(qyaw(yaw),v);
const planarDistance=(a:FootVector,b:FootVector)=>Math.hypot(a[0]-b[0],a[2]-b[2]);
const angle=(a:number,b:number)=>Math.atan2(Math.sin(b-a),Math.cos(b-a));
const smooth=(n:number)=>{const p=Math.max(0,Math.min(1,n));return p*p*(3-2*p);};
const mix=(a:FootVector,b:FootVector,t:number):Vec=>add(a,mul(sub(b,a),t));
interface Contact {position:Vec;yaw:number;id:number;}
interface Swing {side:0|1;from:Vec;target:Vec;fromYaw:number;targetYaw:number;progress:number;mode:'walk'|'settle'|'turn';}
function rootRest(root:FootRoot,side:0|1,forward=0):Vec {return add([root.x,.165,root.z],yawVector([side===0?-.1:.1,0,-forward],root.yaw));}
/** Reusable per pooled visitor. reset() only for fresh actor/true stream reload. */
export class NativeFootPlant {
 private root:FootRoot|undefined;
 private contacts:[Contact,Contact]|undefined;
 private swing:Swing|undefined;
 private next:0|1=0;
 private counter=0;
 private current:FootPlantPose|undefined;
 reset(){this.root=undefined;this.contacts=undefined;this.swing=undefined;this.current=undefined;this.next=0;}
 private seed(root:FootRoot){this.contacts=[0,1].map(side=>({position:rootRest(root,side as 0|1),yaw:root.yaw,id:++this.counter})) as [Contact,Contact];this.root={...root};this.swing=undefined;}
 private start(root:FootRoot,side:0|1,mode:Swing['mode']){
  const c=this.contacts![side],forward=mode==='walk'?.27:0;
  this.swing={side,from:[...c.position],target:rootRest(root,side,forward),fromYaw:c.yaw,targetYaw:root.yaw,progress:0,mode};this.next=side===0?1:0;
 }
 tick(deltaSeconds:number,root:FootRoot,motion=true):FootPlantPose {
  if(!Number.isFinite(deltaSeconds)||deltaSeconds<0||[root.x,root.z,root.yaw,root.speed,root.distance].some(v=>!Number.isFinite(v))||root.speed<0||root.distance<0)throw new RangeError('foot input');
  const dt=Math.min(.05,deltaSeconds);
  if(!this.root||!this.contacts||Math.hypot(root.x-this.root.x,root.z-this.root.z)>.8)this.seed(root);
  if(!motion&&this.current)return this.current;
  const old=this.root!,moved=Math.hypot(root.x-old.x,root.z-old.z),walking=moved>1e-7;
  if(this.swing?.mode==='walk'&&!walking&&root.speed<.015&&dt>0){const s=this.swing,c=this.contacts![s.side];this.swing={side:s.side,from:[...c.position],target:rootRest(root,s.side),fromYaw:c.yaw,targetYaw:root.yaw,progress:0,mode:'settle'};}
  if(!this.swing&&motion){
   if(walking)this.start(root,this.next,'walk');
   else if(dt>0){const needs=(side:0|1)=>{const c=this.contacts![side];return planarDistance(c.position,rootRest(root,side))>.055||Math.abs(angle(c.yaw,root.yaw))>.16;};const side=needs(this.next)?this.next:needs(this.next===0?1:0)?(this.next===0?1:0):undefined;if(side!==undefined)this.start(root,side,Math.abs(angle(this.contacts![side].yaw,root.yaw))>.16?'turn':'settle');}
  }
  if(this.swing&&motion){
   const s=this.swing,c=this.contacts![s.side];s.progress=Math.min(1,s.progress+(s.mode==='walk'?moved/.18:dt/.28));
   const p=s.progress,e=smooth(p);c.position=mix(s.from,s.target,e);c.position[1]+=.045*Math.sin(Math.PI*p)**2;c.yaw=s.fromYaw+angle(s.fromYaw,s.targetYaw)*e;
   if(p>=1){c.position=[...s.target];c.yaw=s.targetYaw;c.id=++this.counter;this.swing=undefined;}
  }
  this.root={...root};
  const positions=this.contacts!.map(c=>yawVector(sub(c.position,[root.x,.065,root.z]),-root.yaw));
  // Lower only as needed for two-link reach. Keeps actual link lengths and sole
  // targets; no root bounce or vertical-only fake foot planting.
  let bodyDrop=0;
  for(let side=0;side<2;side++){const p=positions[side],horizontal=Math.hypot(p[0]-(side===0?-.1:.1),p[2]),reach=Math.sqrt(Math.max(.01,.5498**2-horizontal**2));bodyDrop=Math.min(bodyDrop,p[1]+reach-.65);}
  bodyDrop=Math.max(-.12,bodyDrop);
  const solve=(side:0|1):PlantedLeg=>{
   const contact=this.contacts![side],hip:Vec=[side===0?-.1:.1,.65+bodyDrop,0],ankle=positions[side],v=sub(ankle,hip),distance=Math.min(.54999,Math.max(.05001,length(v))),u=normalized(v),a=(.25**2-.30**2+distance**2)/(2*distance),h=Math.sqrt(Math.max(0,.25**2-a*a));
   let pole=sub([0,0,-1],mul(u,dot([0,0,-1],u)));if(length(pole)<1e-6)pole=[1,0,0];
   const knee=add(hip,add(mul(u,a),mul(normalized(pole),h))),upper=qfromTo([0,-1,0],sub(knee,hip)),lowerWorld=qfromTo([0,-1,0],sub(ankle,knee)),lower=qmul(qinverse(upper),lowerWorld),foot=qmul(qinverse(lowerWorld),qyaw(contact.yaw-root.yaw));
   return {hip:upper,knee:lower,foot,stance:this.swing?.side!==side,contactId:contact.id,ankleWorld:[...contact.position],footYaw:contact.yaw};
  };
  const phase=(root.distance%.36)/.36;
  return this.current={bodyDrop,left:solve(0),right:solve(1),armSwing:motion?Math.sin(phase*Math.PI*2)*.12*Math.min(1,root.speed/.48):0};
 }
}
