import {catalog,type Snapshot} from '../core/contracts';
import {purchaseCost} from '../core/recovery';
import type {Drafts} from './session';
export interface StockWorkspace {query:string;filter:'all'|'displayed'|'empty';picker:string;recent:Record<string,boolean>;listTop:number;positions:Record<string,number>;selected:string}
export const newStockWorkspace=():StockWorkspace=>({query:'',filter:'all',picker:'',recent:{},listTop:0,positions:{},selected:''});
export function quantityDraft(d:Drafts,id:string){return d.quantities?.[id]??'5';}
export function setQuantity(d:Drafts,id:string,value:string){(d.quantities??={})[id]=value;}
export function parseQuantity(raw:string):number|undefined {if(!/^\d+$/.test(raw.trim()))return;const q=Number(raw);return Number.isSafeInteger(q)&&q>=1&&q<=1000?q:undefined;}
/** Capture a complete immutable intent before entering the asynchronous command path. */
export function capturePurchase(s:Snapshot,d:Drafts,id:string){const o=catalog.offerings.find(o=>o.id===id),quantity=parseQuantity(quantityDraft(d,id));if(!o||quantity===undefined)throw Error('quantity');if(s.cash<purchaseCost(o.cost)*quantity)throw Error('cash');return Object.freeze({itemId:id,quantity,mode:s.mode});}
/** Presentation-only draft: separate from transactional Normal/Sandbox saves. */
export function readStockWorkspace(key:string,storage:Pick<Storage,'getItem'>|undefined=globalThis.localStorage):StockWorkspace {
 const w=newStockWorkspace();try{const data=JSON.parse(storage?.getItem(key)??'null');if(!data||typeof data!=='object')return w;if(typeof data.query==='string')w.query=data.query.slice(0,256);if(['all','displayed','empty'].includes(data.filter))w.filter=data.filter;if(Number.isFinite(data.listTop)&&data.listTop>=0)w.listTop=Math.min(100000,data.listTop);if(data.positions&&typeof data.positions==='object')for(const [key,value]of Object.entries(data.positions).slice(-64))if(key.length<=300&&typeof value==='number'&&Number.isFinite(value)&&value>=0)w.positions[key]=Math.min(100000,value);if(catalog.offerings.some(o=>o.id===data.selected))w.selected=data.selected;}catch{/* Browser storage can be unavailable; in-memory browsing remains usable. */}return w;
}
export function saveStockWorkspace(w:StockWorkspace,key:string,storage:Pick<Storage,'getItem'|'setItem'>|undefined=globalThis.localStorage){
 const value=JSON.stringify({query:w.query,filter:w.filter,listTop:w.listTop,positions:w.positions,selected:w.selected});try{if(storage&&storage.getItem(key)!==value)storage.setItem(key,value);}catch{/* Never turn a presentation preference failure into an economic error. */}
}

export function stockViewKey(w:Pick<StockWorkspace,'query'|'filter'>){return JSON.stringify([w.query,w.filter]);}
/** Retain each filtered list position without touching quantity or selection. */
export function changeStockView(w:StockWorkspace,patch:Partial<Pick<StockWorkspace,'query'|'filter'>>){
 w.positions[stockViewKey(w)]=w.listTop;Object.assign(w,patch);w.recent={};w.listTop=w.positions[stockViewKey(w)]??0;
 const keys=Object.keys(w.positions);for(const key of keys.slice(0,Math.max(0,keys.length-64)))delete w.positions[key];
}
