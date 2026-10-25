import {catalog,type Mode,type Snapshot} from '../core/contracts';
export interface Drafts {quantity:string;quantities?:Record<string,string>;prices:Record<string,string>;shop:string;company:string;logo:string}
export interface UI {panel:string;slot:number;zen:boolean;quality:string;sound:boolean;minimalFX:boolean;feedbackKind:string;revealFx:boolean;reportDay:string;rename:boolean;draft:Drafts;formError:string;formField:string;notice:string;blocking:string;worldFailed:boolean;setInfoOpen?:boolean;setInfoPinned?:boolean;stock?:import('./stock-state').StockWorkspace}
export function draftFor(mode:Mode,s:Snapshot,prefix="shop.w1.draft."):Drafts{
 const base={quantity:'5',prices:{},shop:s.shopName,company:s.companyName,logo:s.logo};
 try{const d=JSON.parse(sessionStorage.getItem(prefix+mode)||'null');if(d&&typeof d.quantity==='string'&&typeof d.shop==='string'&&typeof d.company==='string'&&typeof d.logo==='string'&&d.prices&&Object.values(d.prices).every(v=>typeof v==='string')){const quantities:Record<string,string>={};for(const o of catalog.offerings)quantities[o.id]=typeof d.quantities?.[o.id]==='string'?d.quantities[o.id]:d.quantity;return {...d,quantities};}}catch{}return {...base,quantities:{}};
}
export function storeDraft(mode:Mode,draft:Drafts,prefix="shop.w1.draft."){try{sessionStorage.setItem(prefix+mode,JSON.stringify(draft));}catch{/* Unsaved draft persistence can be unavailable; simulation is untouched. */}}
export function commandId(){
 // Supported HTTP preview adapter as well as HTTPS: cryptographic UUID without
 // requiring randomUUID (secure-context-only in some browsers). No Math.random.
 if(typeof crypto.randomUUID==='function')return crypto.randomUUID();
 const a=crypto.getRandomValues(new Uint8Array(16));a[6]=(a[6]&15)|64;a[8]=(a[8]&63)|128;
 const h=Array.from(a,x=>x.toString(16).padStart(2,'0')).join('');return `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}`;
}
