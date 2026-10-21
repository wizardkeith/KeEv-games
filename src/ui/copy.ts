import zh from '../content/zh-HK.json';import en from '../content/en.json';import ja from '../content/ja.json';import th from '../content/th.json';import cn from '../content/zh-CN.json';
import {catalog} from '../core/contracts';
export const dictionaries:Record<string,Record<string,string>>={'zh-HK':zh,en,ja,th,'zh-CN':cn};
export let locale=dictionaries[localStorage.getItem('shop.locale')||'']?localStorage.getItem('shop.locale')!:'zh-HK';
export const t=(key:string)=>dictionaries[locale][key]??key;
export function setLocale(l:string){if(dictionaries[l]){locale=l;localStorage.setItem('shop.locale',l);}}
export const esc=(s:unknown)=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export const money=(n:number)=>new Intl.NumberFormat(locale,{style:'currency',currency:'JPY',maximumFractionDigits:0}).format(n*catalog.config.yenPerUnit);
export const date=(n:number)=>new Intl.DateTimeFormat(locale,{timeZone:'Asia/Tokyo',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit',hour12:false}).format(n);
export const day=(n:number)=>new Date(n+9*3600000).toISOString().slice(0,10);
export const trading=(s:{open:boolean;watermark:number})=>s.open&&new Date(s.watermark+9*3600000).getUTCHours()>=catalog.config.openHour&&new Date(s.watermark+9*3600000).getUTCHours()<catalog.config.closeHour;
export const languageOptions=()=>Object.entries({'zh-HK':'中文(繁)',en:'English',ja:'日本語',th:'ไทย','zh-CN':'中文(简)'}).map(([k,v])=>`<option value="${k}" ${locale===k?'selected':''}>${v}</option>`).join('');
