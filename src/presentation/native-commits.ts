import type {Snapshot} from '../core/contracts';
import {NativeServiceSequencer,makeStreamKey,projectConfirmedCommit,type CapturedCommand,type MotionPolicy,type Observation} from './native-motion';

const baselines=new Set(['baseline','reload','retry','import','mode','choose-mode']);
/** App-owned lifecycle: survives deferred world creation and a missing GPU. */
export class NativeCommitPresentation {
 private incarnation=0;
 private sequence:NativeServiceSequencer|undefined;
 private epoch=0;
 baseline(state:Snapshot,epoch:number){
  this.sequence?.dispose();this.epoch=epoch;
  this.sequence=new NativeServiceSequencer(makeStreamKey(state.mode,state.shopId,String(++this.incarnation)),state.revision,epoch);
 }
 invalidate(epoch:number){if(epoch<=this.epoch)return;this.epoch=epoch;this.sequence?.invalidatePresentation(epoch);}
 commit(before:Snapshot,after:Snapshot,cause:string,epoch:number,command:CapturedCommand|undefined,policy:MotionPolicy):Observation|undefined {
  if(baselines.has(cause)||before.mode!==after.mode||before.shopId!==after.shopId){this.baseline(after,this.epoch);return;}
  if(after.revision<=before.revision)return;
  if(!this.sequence)this.baseline(before,this.epoch);
  const receipt=projectConfirmedCommit(before,after,{incarnation:String(this.incarnation),epoch,source:command?'command':'settle',...(command?{command:{...command}}:{})});
  // Returning/offline reconciliation consumes the same stream's watermark.
  // It is not a new save incarnation and never resets world customer routes.
  return this.sequence!.observe(receipt,cause==='offline-return'||cause==='catchup'?{...policy,visible:false,nativeMotion:false}:policy);
 }
 tick(seconds:number,policy:MotionPolicy){return this.sequence?.tick(seconds,policy);}
 cancel(){this.sequence?.cancelVisuals();}
 get current(){return this.sequence?.current();}
 metrics(){return {epoch:this.epoch,stream:this.sequence?.streamKey,consumedRevision:this.sequence?.consumedRevision,batches:this.sequence?.queuedBatchCount??0};}
}
