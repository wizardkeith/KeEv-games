/** Renderer-only two-link arm contact. Immutable rig lengths, actual world
 * shoulders and sockets; no root translation, finance, timers or saved state. */
import {Quaternion,Vector3} from '@babylonjs/core/Maths/math.vector';
import type {TransformNode} from '@babylonjs/core/Meshes/transformNode';
type Actor={root:TransformNode;parts:Map<string,TransformNode>};
const unitRotation=(from:Vector3,to:Vector3)=>{const q=Quaternion.Identity();Quaternion.FromUnitVectorsToRef(from.normalize(),to.normalize(),q);return q;};
export function reachGrip(actor:Actor,side:'left'|'right',grip:Vector3,weight:number){
 const upper=actor.parts.get('arm-'+side)!,lower=actor.parts.get('forearm-'+side)!,hand=actor.parts.get('hand-'+side)!,socket=actor.parts.get('socket-'+side)!;
 const old=(node:TransformNode)=>node.rotationQuaternion?.clone()??Quaternion.FromEulerVector(node.rotation);
 upper.computeWorldMatrix(true);const shoulder=upper.getAbsolutePosition().clone(),handWorld=Quaternion.RotationAxis(Vector3.Up(),actor.root.rotation.y),offset=socket.position.rotateByQuaternionToRef(handWorld,Vector3.Zero()),wrist=grip.subtract(offset),direction=wrist.subtract(shoulder),length=direction.length(),a=lower.position.length(),b=hand.position.length(),d=Math.min(a+b-.0005,Math.max(Math.abs(a-b)+.0005,length));direction.normalize();
 const along=(a*a-b*b+d*d)/(2*d),height=Math.sqrt(Math.max(0,a*a-along*along)),bend=Vector3.Down().subtract(direction.scale(Vector3.Dot(Vector3.Down(),direction))).normalize(),elbow=shoulder.add(direction.scale(along)).add(bend.scale(height));
 const bodyInverse=upper.parent!.getWorldMatrix().clone().invert(),localElbow=Vector3.TransformCoordinates(elbow,bodyInverse).subtract(upper.position),uq=unitRotation(lower.position.clone(),localElbow);
 upper.rotationQuaternion=Quaternion.Slerp(old(upper),uq,weight);upper.computeWorldMatrix(true);
 const localWrist=Vector3.TransformCoordinates(wrist,upper.getWorldMatrix().clone().invert()).subtract(lower.position),lq=unitRotation(hand.position.clone(),localWrist);
 lower.rotationQuaternion=Quaternion.Slerp(old(lower),lq,weight);lower.computeWorldMatrix(true);
 const hq=lower.absoluteRotationQuaternion.conjugate().multiply(handWorld);hand.rotationQuaternion=Quaternion.Slerp(old(hand),hq,weight);hand.computeWorldMatrix(true);socket.computeWorldMatrix(true);
 return {reach:length,maximum:a+b,socket:socket.getAbsolutePosition().clone()};
}
export function handoffMeeting(staff:Actor,guest:Actor){
 const a=staff.parts.get('arm-right')!,b=guest.parts.get('arm-left')!;a.computeWorldMatrix(true);b.computeWorldMatrix(true);
 const meeting=Vector3.Center(a.getAbsolutePosition(),b.getAbsolutePosition());meeting.y+=.065;
 const direction=guest.root.position.subtract(staff.root.position);direction.y=0;direction.normalize();
 return {staff:meeting.subtract(direction.scale(.018)),guest:meeting.add(direction.scale(.018))};
}
