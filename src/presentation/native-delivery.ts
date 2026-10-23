import type {NativeCommitPresentation} from './native-commits';
import type {MotionPolicy,ServiceFrame} from './native-motion';
import type {NativeCustomerRoutes} from './native-routes';
export type DeliveryFrame=ServiceFrame&{serviceYaw?:number;customerId?:string};
/** One recent, already committed sale may wait briefly for one existing actor.
 * This owns presentation time only; it cannot create money, stock or demand. */
export class NativeDelivery {
 private revision:number|undefined;
 private requested=0;
 private acquired=false;
 private handed=false;
 cancel(routes:NativeCustomerRoutes){routes.cancelPresentation();this.revision=undefined;this.acquired=false;this.handed=false;}
 tick(seconds:number,presentation:NativeCommitPresentation,routes:NativeCustomerRoutes,policy:MotionPolicy):DeliveryFrame|undefined {
  if(!policy.nativeMotion){this.cancel(routes);presentation.tick(seconds,policy);return;}
  const prepare=(frame:ServiceFrame|undefined)=>{
   if(frame?.cue.kind!=='sale'){if(this.revision!==undefined)routes.finishService(this.revision);this.revision=undefined;this.acquired=false;this.handed=false;return false;}
   if(frame.receiptRevision!==this.revision){if(this.revision!==undefined)routes.finishService(this.revision);this.revision=frame.receiptRevision;this.requested=0;this.handed=false;this.acquired=!!routes.requestService(frame.receiptRevision);}
   return this.acquired&&routes.serviceStatus(frame.receiptRevision)==='approaching';
  };
  const current=presentation.current;
  if(prepare(current)){this.requested+=Math.min(.05,seconds);if(this.requested<8.55)return;routes.cancelPresentation();this.acquired=false;}
  const frame=presentation.tick(seconds,policy);
  if(prepare(frame))return;
  if(frame?.cue.kind==='sale'&&this.acquired&&routes.serviceStatus(frame.receiptRevision)==='ready'){
   if(frame.progress>=.64&&!this.handed)this.handed=routes.handover(frame.receiptRevision);
   return {...frame,serviceYaw:-Math.PI/2,customerId:'visitor-a'};
  }
  return frame;
 }
}
