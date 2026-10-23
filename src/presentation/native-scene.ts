import {TransformNode} from '@babylonjs/core/Meshes/transformNode';
import {Vector3} from '@babylonjs/core/Maths/math.vector';
import type {Scene} from '@babylonjs/core/scene';
import {nativeCharacterParts,nativeCharacterIdentity,type NativeSurface,type NativeCharacterKind} from '../art/native-characters';
import {sampleIdle,sampleWalk,type MotionPolicy,type ServiceFrame} from './native-motion';
import {sampleStaff} from './native-staff';
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
  const neutral=()=>{for(const [id,p] of parts){p.rotation.setAll(0);p.position.copyFrom(rest.get(id)!);p.scaling.setAll(1);}for(const side of ['left','right'])parts.get('eyelid-'+side)?.setEnabled(false);};
  const face=(blink:number,expression='attentive')=>{
   for(const side of ['left','right']){const lid=parts.get('eyelid-'+side),eye=parts.get('eye-'+side);lid?.setEnabled(blink>.45);eye?.setEnabled(blink<=.45);const brow=parts.get('brow-'+side);if(brow)brow.rotation.z=expression==='focused'?(side==='left'?-.05:.05):expression==='smile'?(side==='left'?.05:-.05):0;}
   const mouth=parts.get('mouth');if(mouth){mouth.scaling.x=expression==='smile'?1.25:expression==='focused'?.8:1;mouth.rotation.z=expression==='smile'?-.04:0;}
  };
  neutral();return {root,parts,rest,neutral,face};
 }
 const staff=actor('misaki');staff.root.position.set(2.6,.065,-.65);
 const visitors=[actor('visitor-a'),actor('visitor-b')];visitors.forEach(a=>a.root.setEnabled(false));
 const paper=(size:Part['size'],at:Part['at'],color:string):Part=>({shape:'round',size,at,color,role:'paper',radius:.012});
 const propRecipes:Record<string,Part[]>={
  bag:[paper([.23,.29,.12],[0,.145,0],'#C8AE88'),paper([.235,.015,.125],[0,.282,0],'#E2CEAA'),{shape:'torus',size:[.13,.015,.13],at:[0,.31,0],turn:[Math.PI/2,0,0],color:'#A08B6E',role:'paper'},paper([.055,.07,.003],[0,.16,-.062],'#8AA18D')],
  box:[paper([.32,.20,.25],[0,.10,0],'#BFA27E'),paper([.035,.204,.252],[0,.102,0],'#E7D6B5'),paper([.12,.06,.002],[.06,.12,-.127],'#F0E6D0')],
  note:[paper([.15,.006,.11],[0,0,0],'#F3E8D2'),paper([.09,.002,.006],[0,.005,-.025],'#B5A38B')],
  cloth:[{shape:'round',size:[.16,.018,.13],at:[0,0,0],color:'#A9BCAB',role:'fabric',radius:.012}],
 };
 const props=new Map(Object.entries(propRecipes).map(([kind,p])=>[kind,model('native.prop.'+kind,p)]));props.forEach(p=>p.setEnabled(false));
 let visibleTime=0,clip='native.staff.idle.v3',ownerKey='',blendAge=0,blendOrigin=Vector3.Zero();
 const clearProps=()=>{ownerKey='';for(const p of props.values()){p.setEnabled(false);p.parent=null;p.position.setAll(0);p.rotationQuaternion=null;p.rotation.setAll(0);}};
 function frame(seconds:number,policy:MotionPolicy,routes:RouteFrame,service:ServiceFrame|undefined,greet:number|undefined){
  if(policy.nativeMotion)visibleTime+=Math.min(.05,seconds);
  const previous=[...props.values()].find(p=>p.isEnabled());previous?.computeWorldMatrix(true);const previousPosition=previous?.getAbsolutePosition().clone();
  staff.neutral();
  for(const p of props.values()){p.setEnabled(false);p.parent=null;p.rotationQuaternion=null;p.rotation.setAll(0);}
  const pose=sampleStaff(policy.nativeMotion?visibleTime:0,policy.nativeMotion?service:undefined,policy.nativeMotion?greet:undefined);
  clip=policy.nativeMotion?pose.clip:'native.staff.still.v3';
  if(policy.nativeMotion){for(const [id,r] of Object.entries(pose.rotations))staff.parts.get(id)?.rotation.set(...r);staff.parts.get('body')!.position.y+=pose.bodyLift;staff.root.rotation.y=pose.turn;staff.face(pose.eyelidClosure,pose.expression);
   if(pose.prop.visible){const p=props.get(pose.prop.kind)!,key=pose.prop.kind+':'+pose.prop.owner,target=new Vector3(2.60,1.116,-1.20);p.setEnabled(true);
    if(pose.prop.owner!=='counter'){const socket=staff.parts.get(pose.prop.owner)!;socket.computeWorldMatrix(true);p.parent=socket;target.set(0,-.06,0);p.rotationQuaternion=socket.absoluteRotationQuaternion.conjugate();}
    if(key!==ownerKey){blendAge=0;blendOrigin=previousPosition?previousPosition.clone():target.clone();if(p.parent&&previousPosition)blendOrigin=Vector3.TransformCoordinates(blendOrigin,(p.parent as TransformNode).getWorldMatrix().clone().invert());ownerKey=key;}
    blendAge+=seconds;p.position.copyFrom(Vector3.Lerp(blendOrigin,target,Math.min(1,blendAge/.16)));
   }else ownerKey='';
  }else{ownerKey='';staff.root.rotation.setAll(0);staff.face(0);}
  routes.actors.forEach((route,i)=>{const a=visitors[i];a.neutral();a.root.setEnabled(route.enabled);a.root.position.set(route.x,.065,route.z);a.root.rotation.y=route.yaw;
   const idle=sampleIdle(visibleTime,i*.43+.1,policy);a.parts.get('head')!.rotation.y=idle.headYawRadians;
   a.face(idle.eyelidClosure);
   const walk=sampleWalk(route.distance,route.speed,policy);
   for(const side of ['left','right'] as const){const hip=side==='left'?walk.leftHipRadians:walk.rightHipRadians,knee=-(side==='left'?walk.leftKneeRadians:walk.rightKneeRadians),lift=side==='left'?walk.leftFootLiftMetres:walk.rightFootLiftMetres;
    const leg=a.parts.get('leg-'+side)!,shin=a.parts.get('shin-'+side)!,foot=a.parts.get('foot-'+side)!;leg.rotation.x=hip;shin.rotation.x=knee;foot.rotation.x=-hip-knee;
    // Flat sole target for stance/swing; rigid joint compensation, not foot IK.
    leg.position.y+=lift-Math.abs(shin.position.y)*(1-Math.cos(hip))-Math.abs(foot.position.y)*(1-Math.cos(hip+knee));
    a.parts.get('arm-'+side)!.rotation.x=side==='left'?walk.leftArmRadians:walk.rightArmRadians;
   }
   if(route.state==='browsing'&&policy.nativeMotion){const p=route.browseProgress,e=Math.sin(Math.PI*p)**2;a.parts.get('head')!.rotation.y+=.12*Math.sin(p*Math.PI*2);a.parts.get('arm-right')!.rotation.set(.65*e,0,.18*e);a.parts.get('forearm-right')!.rotation.x=.6*e;}
  });
 }
 return {frame,clearProps,staff,visitors,metrics:()=>({rigVersion:nativeCharacterIdentity.version,staffClip:clip,propCount:props.size,activeProps:[...props].filter(([,p])=>p.isEnabled()).map(([kind,p])=>({kind,parent:p.parent?.name??'counter'})),visibleTime}),dispose(){clearProps();for(const p of props.values())p.dispose();staff.root.dispose();visitors.forEach(a=>a.root.dispose());}};
}
