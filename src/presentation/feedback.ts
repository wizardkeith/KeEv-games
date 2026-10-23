import type {Snapshot} from '../core/contracts';
export type FeedbackKind='sale'|'stock'|'support'|'display'|'reveal';
export interface Feedback {id:string;kind:FeedbackKind;units:number;slot:number;sold:number}
const baselineCauses=new Set(['baseline','reload','retry','catchup','import','mode','choose-mode','offline-return']);
/** Only a transition returned by a successful, live commit may create feedback.
 * Loading a newer saved snapshot is a baseline, never a presentation replay. */
export class FeedbackProjector {
 private seen=new Set<string>();
 project(before:Snapshot,after:Snapshot,cause:string,slot=0):Feedback|undefined {
  if(baselineCauses.has(cause)||before.mode!==after.mode||before.shopId!==after.shopId||after.revision<=before.revision)return;
  const id=`${after.mode}:${after.shopId}:${after.revision}`;if(this.seen.has(id))return;
  this.seen.add(id);if(this.seen.size>64)this.seen.delete(this.seen.values().next().value!);
  const sold=Math.max(0,after.eventSequence-before.eventSequence);
  const bought=after.purchases-before.purchases;
  const support=after.recovery.total-before.recovery.total;
  const displaySlot=after.shelves.findIndex((id,i)=>!!id&&id!==before.shelves[i]);
  const displayed=displaySlot>=0;
  const kind:FeedbackKind|undefined=!before.revealed&&after.revealed&&cause==='reveal'?'reveal':support>0&&cause==='recover'?'support':sold>0?'sale':bought>0&&cause==='buy'?'stock':displayed&&cause==='display'?'display':undefined;
  return kind?{id,kind,sold,units:kind==='sale'?sold:kind==='stock'?Object.keys(after.inventory).reduce((n,id)=>n+Math.max(0,after.inventory[id].stock-before.inventory[id].stock),0):0,slot:kind==='display'?displaySlot:slot}:undefined;
 }
 reset(){this.seen.clear();}
 get retainedIds(){return this.seen.size;}
}
