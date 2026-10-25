import {reachGrip,handoffMeeting} from './native-handoff';
import {STAFF_CLIPS} from './native-staff';
import {NativeStaffRoutine} from './native-staff-routine';
import {StaffAttention,attentionRotations,welcomeYaw} from './native-attention';
import {TransformNode} from '@babylonjs/core/Meshes/transformNode';
import {Vector3,Quaternion} from '@babylonjs/core/Maths/math.vector';
import type {Scene} from '@babylonjs/core/scene';
import {nativeCharacterParts,nativeCharacterIdentity,type NativeSurface,type NativeCharacterKind} from '../art/native-characters';
import {sampleIdle,type MotionPolicy} from './native-motion';
import {StaffMotionPlayer} from './native-staff-player';
import {NativeFootPlant} from './native-feet';
import type {DeliveryFrame} from './native-delivery';
import type {RouteFrame} from './native-routes';
import type {Part} from '../art/recipes';

export type NativeModel=(name:string,recipe:NativeSurface[],parent?:TransformNode)=>TransformNode;
/** Babylon adapter only. No simulation/storage dependency, callbacks or timers. */
export function createNativeActors(scene:Scene,model:NativeModel){
 function actor(kind:NativeCharacterKind){
  const root=new TransformNode(nativeCharacterIdentity[kind].id,scene),parts=new Map<string,TransformNode>();
  const recipe=nativeCharacterParts(kind);
  for(const p of recipe){const node=model(`${root.name}.${p.id}`,p.recipe);node.position.set(...p.pivot);parts.set(p.id,node);}
  for(const p of recipe)parts.get(p.id)!.parent=p.parent?parts.get(p.parent)!:root;
  const rest=new Map([...parts].map(([id,p])=>[id,p.position.clone()]));
  root.metadata=nativeCharacterIdentity[kind];
  const neutral=()=>{for(const [id,p] of parts){p.rotationQuaternion=null;p.rotation.setAll(0);p.position.copyFrom(rest.get(id)!);p.scaling.setAll(1);}for(const side of ['left','right'])parts.get('eyelid-'+side)?.setEnabled(false);};
  const face=(blink:number,expression='attentive',weights?:Readonly<Record<'attentive'|'focused'|'smile',number>>)=>{
   const smile=weights?.smile??Number(expression==='smile'),focus=weights?.focused??Number(expression==='focused');
   for(const side of ['left','right']){const lid=parts.get('eyelid-'+side),eye=parts.get('eye-'+side);lid?.setEnabled(blink>.45);eye?.setEnabled(blink<=.45);const brow=parts.get('brow-'+side);if(brow)brow.rotation.z=(side==='left'?1:-1)*(.05*smile-.05*focus);}
   const mouth=parts.get('mouth');if(mouth){mouth.scaling.x=1+.25*smile-.2*focus;mouth.rotation.z=-.04*smile;}
  };
  neutral();return {root,parts,rest,neutral,face};
 }
 const staff=actor('misaki');staff.root.position.set(2.6,.065,-.65);staff.root.rotation.y=welcomeYaw;
 const visitors=[actor('visitor-a'),actor('visitor-b')];visitors.forEach(a=>a.root.setEnabled(false));
 const paper=(size:Part['size'],at:Part['at'],color:string):Part=>({shape:'round',size,at,color,role:'paper',radius:.012});
 const propRecipes:Record<string,Part[]>={
  bag:[paper([.23,.29,.12],[0,.145,0],'#C8AE88'),paper([.235,.015,.125],[0,.282,0],'#E2CEAA'),{shape:'torus',size:[.13,.015,.13],at:[0,.31,0],turn:[Math.PI/2,0,0],color:'#A08B6E',role:'paper'},paper([.055,.07,.003],[0,.16,-.062],'#8AA18D')],
  box:[paper([.32,.20,.25],[0,.10,0],'#BFA27E'),paper([.035,.204,.252],[0,.102,0],'#E7D6B5'),paper([.12,.06,.002],[.06,.12,-.127],'#F0E6D0')],
  note:[paper([.21,.008,.15],[0,0,0],'#F3E8D2'),...[-.035,0,.035].map(z=>paper([.14,.002,.006],[0,.006,z],'#A6977C'))],
  cloth:[{shape:'round',size:[.21,.020,.16],at:[0,0,0],color:'#A9BCAB',role:'fabric',radius:.012}],
 };
 const props=new Map(Object.entries(propRecipes).map(([kind,p])=>[kind,model('native.prop.'+kind,p)]));props.forEach(p=>p.setEnabled(false));
 let carrySpare=model('native.prop.bag.reserve',propRecipes.bag),carried:{node:TransformNode;id:string;offset:Vector3}|undefined;carrySpare.setEnabled(false);
 const routine=new NativeStaffRoutine(),staffFeet=new NativeFootPlant();let routineState=routine.tick(0,{actors:[],doorOpen:false,doorAngle:0,corridorOwner:null},false,false);
 const attention=new StaffAttention();let attentionState={yaw:welcomeYaw,target:welcomeYaw,entry:0,work:false,mode:'welcome'};
 const staffPlayer=new StaffMotionPlayer(),feet=[new NativeFootPlant(),new NativeFootPlant()],wasEnabled=[false,false],receiveWeight=[0,0];
 const welcomed=new Set<string>();let greetingElapsed:number|undefined;let greetingTargetId:string|undefined,checkoutDock=false,contactDistance=Infinity;let contactPoints:{staff:number[];guest:number[];bagHandle?:number[];progress:number;customerId:string}|null=null;
 let visibleTime=0,clip='native.staff.idle.v3',ownerKey='',blendAge=0,blendOrigin=Vector3.Zero();
 const clearProps=()=>{contactDistance=Infinity;contactPoints=null;staffPlayer.cancel();ownerKey='';if(carried){carrySpare=carried.node;carried=undefined;}carrySpare.setEnabled(false);carrySpare.parent=null;for(const p of props.values()){p.setEnabled(false);p.parent=null;p.position.setAll(0);p.rotationQuaternion=null;p.rotation.setAll(0);}};
 function frame(seconds:number,policy:MotionPolicy,routes:RouteFrame,service:DeliveryFrame|undefined,greet:number|undefined,workRequested=!!service){
  if(policy.nativeMotion)visibleTime+=Math.min(.05,seconds);
  const previous=[...props.values()].find(p=>p.isEnabled());previous?.computeWorldMatrix(true);const previousPosition=previous?.getAbsolutePosition().clone();
  staff.neutral();
  for(const p of props.values()){p.setEnabled(false);p.parent=null;p.rotationQuaternion=null;p.rotation.setAll(0);}
  const busy=workRequested||attentionState.work||/staff\.(tidy|check-note|receive-stock|pack-handover)/.test(clip);
  if(routes.actors.some(a=>a.serviceRevision!==undefined)||service?.customerId)checkoutDock=true;else if(!busy)checkoutDock=false;
  routineState=routine.tick(seconds,routes,busy,policy.nativeMotion,greetingElapsed!==undefined,checkoutDock);staff.root.position.set(routineState.x,.065,routineState.z);
  for(const id of welcomed)if(!routes.actors.some(a=>a.id===id&&a.enabled))welcomed.delete(id);
  if(!policy.nativeMotion||workRequested||(greetingTargetId&&!routes.actors.some(a=>a.id===greetingTargetId&&a.enabled))){greetingElapsed=undefined;greetingTargetId=undefined;}
  const newcomer=routes.actors.find(a=>a.enabled&&a.state==='entering'&&!welcomed.has(a.id)&&Math.hypot(a.x-routineState.x,a.z-routineState.z)<1.9);
  if(newcomer&&!routineState.moving&&routineState.intent==='welcome'&&greetingElapsed===undefined&&policy.nativeMotion&&!workRequested){greetingElapsed=0;greetingTargetId=newcomer.id;welcomed.add(newcomer.id);}
  const localGreet=greetingElapsed===undefined?undefined:greetingElapsed/STAFF_CLIPS.greet.duration;
  if(greetingElapsed!==undefined){greetingElapsed+=Math.min(.05,seconds);if(greetingElapsed>=STAFF_CLIPS.greet.duration){greetingElapsed=undefined;greetingTargetId=undefined;}}
  const pose=staffPlayer.tick(seconds,service,localGreet??(routineState.moving?undefined:greet),policy.nativeMotion,routineState.atHome&&!routineState.moving);
  clip=policy.nativeMotion?pose.clip:'native.staff.still.v3';
  const work=/staff\.(tidy|check-note|receive-stock|pack-handover)/.test(pose.clip),handsBusy=pose.prop.visible||Math.max(...['left','right'].map(side=>Math.abs(pose.rotations['arm-'+side]?.[0]??0)))>.12;
  attentionState=attention.tick(seconds,routes,(work||workRequested)&&routineState.atWorkplace,pose.turn,handsBusy,policy.nativeMotion,routineState.moving?routineState.yaw:undefined,{staff:routineState,greetingTargetId});
  const rotations=attentionState.work?attentionRotations(pose.rotations,attentionState.entry):pose.rotations;
  if(policy.nativeMotion){for(const [id,r] of Object.entries(rotations))staff.parts.get(id)?.rotation.set(...r);staff.parts.get('body')!.position.y+=pose.bodyLift;staff.root.rotation.y=attentionState.yaw;staff.face(pose.eyelidClosure,pose.expression,pose.expressionWeights);
   if(pose.prop.visible&&(!attentionState.work||attentionState.entry>=.99)&&!(pose.prop.kind==='bag'&&service?.customerId&&routes.actors.some(a=>a.id===service.customerId&&a.hasBag))){const p=props.get(pose.prop.kind)!,key=pose.prop.kind+':'+pose.prop.owner,target=new Vector3(staff.root.position.x,1.116,-1.20);p.setEnabled(true);
    if(pose.prop.owner!=='counter'){const socket=staff.parts.get(pose.prop.owner)!;socket.computeWorldMatrix(true);p.parent=socket;target.set(0,-.06,0);if(service?.customerId&&pose.prop.kind==='bag'){target.copyFrom(Vector3.TransformCoordinates(socket.getAbsolutePosition().add(new Vector3(0,-.31,0)),socket.getWorldMatrix().clone().invert()));}p.rotationQuaternion=socket.absoluteRotationQuaternion.conjugate();}
    if(key!==ownerKey){blendAge=0;blendOrigin=previousPosition?previousPosition.clone():target.clone();if(p.parent&&previousPosition)blendOrigin=Vector3.TransformCoordinates(blendOrigin,(p.parent as TransformNode).getWorldMatrix().clone().invert());ownerKey=key;}
    blendAge+=seconds;p.position.copyFrom(Vector3.Lerp(blendOrigin,target,Math.min(1,blendAge/.16)));for(const m of p.getChildMeshes())m.visibility=pose.propOpacity;
   }else ownerKey='';
  }else{ownerKey='';staff.root.rotation.set(0,attentionState.yaw,0);staff.face(0);}
  const plantedStaff=staffFeet.tick(seconds,{...routineState,yaw:staff.root.rotation.y},policy.nativeMotion);staff.parts.get('body')!.position.y=plantedStaff.bodyDrop;
  for(const side of ['left','right'] as const){const leg=plantedStaff[side];for(const [id,q]of [[`leg-${side}`,leg.hip],[`shin-${side}`,leg.knee],[`foot-${side}`,leg.foot]]as const)staff.parts.get(id)!.rotationQuaternion=Quaternion.FromArray([...q]);if(routineState.speed>.02)staff.parts.get('arm-'+side)!.rotation.x=(side==='left'?-1:1)*plantedStaff.armSwing;}
  routes.actors.forEach((route,i)=>{const a=visitors[i];a.neutral();a.root.setEnabled(route.enabled);a.root.position.set(route.x,.065,route.z);a.root.rotation.y=route.yaw;
   const idle=sampleIdle(visibleTime,i*.43+.1,policy);a.parts.get('head')!.rotation.y=idle.headYawRadians;
   a.face(idle.eyelidClosure);
   if(route.enabled&&!wasEnabled[i])feet[i].reset();wasEnabled[i]=route.enabled;
   if(route.enabled){const planted=feet[i].tick(seconds,route,policy.nativeMotion);a.parts.get('body')!.position.y+=planted.bodyDrop;
    for(const side of ['left','right'] as const){const leg=planted[side];for(const [id,q]of [[`leg-${side}`,leg.hip],[`shin-${side}`,leg.knee],[`foot-${side}`,leg.foot]]as const)a.parts.get(id)!.rotationQuaternion=Quaternion.FromArray([...q]);a.parts.get('arm-'+side)!.rotation.x=(side==='left'?-1:1)*planted.armSwing;}
   }
   receiveWeight[i]+=Math.max(-seconds/.22,Math.min(seconds/.22,(route.state==='receiving'?1:0)-receiveWeight[i]));
   if(receiveWeight[i]>0||route.hasBag){a.parts.get('arm-left')!.rotation.set((route.hasBag ? .2 : 0)+(1.57-(route.hasBag ? .2 : 0))*receiveWeight[i],0,(route.hasBag?-.28:0)+((-.15)-(route.hasBag?-.28:0))*receiveWeight[i]);a.parts.get('forearm-left')!.rotation.x=0;a.parts.get('head')!.rotation.x=.075*Math.sin(Math.PI*route.handoverProgress);}
   if(route.state==='browsing'&&policy.nativeMotion){const p=route.browseProgress,smooth=(t:number)=>{const v=Math.max(0,Math.min(1,t));return v*v*(3-2*v);},look=smooth(p/.16)*smooth((1-p)/.18),reach=smooth((p-.24)/.22)*smooth((.88-p)/.22);a.parts.get('head')!.rotation.y+=.10*look;a.parts.get('head')!.rotation.x=.09*look;a.parts.get('arm-right')!.rotation.set(.58*reach,0,.15*reach);a.parts.get('forearm-right')!.rotation.x=.52*reach;}
  });
  contactDistance=Infinity;contactPoints=null;
  const customer=routes.actors.find(a=>a.id===service?.customerId&&a.enabled&&a.state==='receiving');
  if(customer&&service?.cue.kind==='sale'&&policy.nativeMotion){
   const guest=visitors[routes.actors.indexOf(customer)],smooth=(t:number)=>{const x=Math.max(0,Math.min(1,t));return x*x*(3-2*x);},weight=smooth((service.progress-.40)/.20)*smooth((.90-service.progress)/.16),meeting=handoffMeeting(staff,guest);
   reachGrip(staff,'right',meeting.staff,weight);reachGrip(guest,'left',meeting.guest,weight);
   const right=staff.parts.get('socket-right')!,left=guest.parts.get('socket-left')!;right.computeWorldMatrix(true);left.computeWorldMatrix(true);contactDistance=Vector3.Distance(right.getAbsolutePosition(),left.getAbsolutePosition());contactPoints={staff:right.getAbsolutePosition().asArray(),guest:left.getAbsolutePosition().asArray(),progress:service.progress,customerId:customer.id};
   if(pose.prop.kind==='bag'&&pose.prop.owner==='socket-right'&&blendAge>=.16&&!customer.hasBag){const bag=props.get('bag')!;if(bag.isEnabled()){const world=right.getAbsolutePosition().add(new Vector3(0,-.31,0));bag.position.copyFrom(Vector3.TransformCoordinates(world,right.getWorldMatrix().clone().invert()));bag.rotationQuaternion=right.absoluteRotationQuaternion.conjugate();}}
  }
  const recipient=routes.actors.find(a=>a.enabled&&a.hasBag);
  if(!policy.nativeMotion||!recipient){if(carried){carried.node.setEnabled(false);carried.node.parent=null;carrySpare=carried.node;carried=undefined;}}
  else {
   const a=visitors[routes.actors.indexOf(recipient)],socket=a.parts.get('socket-left')!;socket.computeWorldMatrix(true);
   if(!carried){const node=props.get('bag')!;const origin=previousPosition??node.getAbsolutePosition().clone();props.set('bag',carrySpare);carried={node,id:recipient.id,offset:origin.subtract(socket.getAbsolutePosition())};ownerKey='';}
   const c=carried;c.node.setEnabled(true);c.node.parent=socket;c.node.rotationQuaternion=socket.absoluteRotationQuaternion.conjugate();
   // Hang the handle below the left palm, forward of personal clothes/bag.
   const placed=socket.getAbsolutePosition().add(c.offset);c.node.position.copyFrom(Vector3.TransformCoordinates(placed,socket.getWorldMatrix().clone().invert()));for(const m of c.node.getChildMeshes())m.visibility=1;
  }
  if(contactPoints){const bag=carried?.node??props.get('bag')!;if(bag.isEnabled()){bag.computeWorldMatrix(true);contactPoints.bagHandle=bag.getAbsolutePosition().add(new Vector3(0,.31,0)).asArray();}}

 }
 return {frame,clearProps,staff,visitors,handoffReady:()=>contactDistance<.06,workReady:()=>routineState.atWorkplace&&attentionState.work&&attentionState.entry>=1,staffPosition:()=>({x:routineState.x,z:routineState.z,radius:.29}),metrics:()=>({rigVersion:nativeCharacterIdentity.version,staffClip:clip,staffRoutine:{...routineState},greetedVisitors:[...welcomed],localGreeting:greetingElapsed??null,greetingTargetId:greetingTargetId??null,contactDistance:Number.isFinite(contactDistance)?contactDistance:null,contact:contactPoints,attention:{...attentionState},propCount:props.size+1,carriedBag:carried?.id??null,activeProps:[...props,...(carried?[['bag',carried.node] as [string,TransformNode]]:[])].filter(([,p])=>p.isEnabled()).map(([kind,p])=>({kind,parent:p.parent?.name??'counter'})),visibleTime}),dispose(){clearProps();for(const p of new Set([...props.values(),carrySpare]))p.dispose();staff.root.dispose();visitors.forEach(a=>a.root.dispose());}};
}
