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
/** Presentation-only draft: separate from transactional Normal/Sandbox saves. */
export function readStockWorkspace(key:string,storage:Pick<Storage,'getItem'>|undefined=globalThis.localStorage):StockWorkspace {
 const w=newStockWorkspace();try{const data=JSON.parse(storage?.getItem(key)??'null');if(!data||typeof data!=='object')return w;if(typeof data.query==='string')w.query=data.query.slice(0,256);if(['all','displayed','empty'].includes(data.filter))w.filter=data.filter;if(Number.isFinite(data.railLeft)&&data.railLeft>=0)w.railLeft=Math.min(100000,data.railLeft);if(catalog.offerings.some(o=>o.id===data.selected))w.selected=data.selected;}catch{/* Browser storage can be unavailable; in-memory browsing remains usable. */}return w;
}
export function saveStockWorkspace(w:StockWorkspace,key:string,storage:Pick<Storage,'getItem'|'setItem'>|undefined=globalThis.localStorage){
 const value=JSON.stringify({query:w.query,filter:w.filter,railLeft:w.railLeft,selected:w.selected});try{if(storage&&storage.getItem(key)!==value)storage.setItem(key,value);}catch{/* Never turn a presentation preference failure into an economic error. */}
}
