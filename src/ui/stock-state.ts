import {catalog,type Snapshot} from '../core/contracts';
import {purchaseCost} from '../core/recovery';
import type {Drafts} from './session';
export interface StockWorkspace {query:string;filter:'all'|'displayed'|'empty';picker:string;recent:Record<string,boolean>;railLeft:number;selected:string}
export const newStockWorkspace=():StockWorkspace=>({query:'',filter:'all',picker:'',recent:{},railLeft:0,selected:''});
export function quantityDraft(d:Drafts,id:string){return d.quantities?.[id]??'5';}
export function setQuantity(d:Drafts,id:string,value:string){(d.quantities??={})[id]=value;}
export function parseQuantity(raw:string):number|undefined {if(!/^\d+$/.test(raw.trim()))return;const q=Number(raw);return Number.isSafeInteger(q)&&q>=1&&q<=1000?q:undefined;}
/** Capture a complete immutable intent before entering the asynchronous command path. */
export function capturePurchase(s:Snapshot,d:Drafts,id:string){const o=catalog.offerings.find(o=>o.id===id),quantity=parseQuantity(quantityDraft(d,id));if(!o||quantity===undefined)throw Error('quantity');if(s.cash<purchaseCost(o.cost)*quantity)throw Error('cash');return Object.freeze({itemId:id,quantity,mode:s.mode});}
