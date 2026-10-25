/** UI intent only. Displayed JPY is ten times the existing integer core unit. */
import type {Snapshot} from '../core/contracts';
import type {Drafts} from './session';
export function capturePrice(s:Snapshot,d:Drafts,itemId:string){
 const raw=d.prices[itemId]??String(s.inventory[itemId].price*10),price=Number(raw)/10;
 if(!raw.trim()||!Number.isSafeInteger(price)||price<1||price>100000)throw Error('price');
 return Object.freeze({itemId,price,raw,mode:s.mode});
}
/** Do not discard a newer edit made while the captured write was pending. */
export function clearCommittedPriceDraft(d:Drafts,intent:ReturnType<typeof capturePrice>){if(d.prices[intent.itemId]===intent.raw)delete d.prices[intent.itemId];}
