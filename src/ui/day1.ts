import {catalog,type Snapshot,type Report} from '../core/contracts';
import {day1View,type StoryRecord,type BeatId} from '../narrative/day1';
import {day1Text,type Day1CopyKey} from '../narrative/day1-copy';
import zh from '../content/zh-HK.json';import en from '../content/en.json';import ja from '../content/ja.json';import th from '../content/th.json';import cn from '../content/zh-CN.json';
const openLabels:Record<string,string>={'zh-HK':zh.open,en:en.open,ja:ja.open,th:th.open,'zh-CN':cn.open};
// Pure markup, so the same strings/branching can be checked without a GPU.
const escape=(v:unknown)=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export interface Day1Format {locale:string;itemName:(id:string)=>string;money:(n:number)=>string;}
const text=(f:Day1Format,key:Day1CopyKey,values:Record<string,string|number>={})=>escape(day1Text(f.locale,key,values));
const button=(f:Day1Format,key:Day1CopyKey,action:string,beat:BeatId,busy:boolean,primary=false,label?:string)=>`<button type="button" data-action="${action}" data-beat="${beat}" class="${primary?'primary':''}" ${busy?'disabled':''}>${label===undefined?text(f,key):escape(label)}</button>`;
export function day1Moment(s:Snapshot,story:StoryRecord,f:Day1Format){const v=day1View(s,story),item=v.contextItemId;return text(f,!item?'memoryEmpty':item==='off.tea'?'memoryTea':'memoryOther',{item:item?f.itemName(item):''});}
export function day1Card(s:Snapshot,story:StoryRecord,f:Day1Format,busy:boolean,replay=false){
 if(story.dismissed&&!replay||story.unsupported)return '';
 const v=day1View(s,story),beat=replay?'welcome':v.nextBeat;
 let body='',cta='';const b=(key:Day1CopyKey,action:string,primary=true)=>button(f,key,action,beat==='done'?'memory':beat,busy,primary);
 switch(beat){
  case 'welcome':body=text(f,v.hasSale?'welcomeReturning':'welcome');cta=b('continue','story-read');break;
  case 'choose':body=text(f,'choose');cta=b('stockLabel','story-stock');break;
  case 'display':body=text(f,'display')+' '+text(f,v.contextItemId==='off.tea'?'chooseTea':'chooseOther',{item:v.contextItemId?f.itemName(v.contextItemId):''});cta=b('stockLabel','story-stock');break;
  case 'open':body=text(f,'open')+' '+text(f,v.contextItemId==='off.tea'?'chooseTea':'chooseOther',{item:v.contextItemId?f.itemName(v.contextItemId):''});cta=button(f,'continue','story-open','open',busy,true,openLabels[f.locale]??en.open);break;
  case 'sale':body=text(f,s.open&&!v.trading?'outsideHours':'waiting')+(v.contextItemId?' '+text(f,v.contextItemId==='off.tea'?'chooseTea':'chooseOther',{item:f.itemName(v.contextItemId)}):'');cta=s.mode==='sandbox'?b('advance15','story-sandbox'):b('sandbox','story-settings');break;
  case 'report':body=text(f,'reportIntro');cta=b('readReport','story-report');break;
  case 'memory':body=day1Moment(s,story,f);cta=b('acknowledge','story-read');break;
  case 'profit':body=text(f,'profit',{amount:f.money(v.report!.net)})+` <small>${text(f,'asOf',{date:v.day,time:v.asOf.slice(11)})}</small>`;cta=b('acknowledge','story-read');break;
  case 'done':body=text(f,!v.hasSale?'noSale':!story.read.includes('report')?'reportIntro':v.complete?'done':v.positive?'reportIntro':'profitPending');cta=b('showJournal','story-journal');break;
 }
 return `<section id="day1-story" class="next-card day1-card" aria-labelledby="day1-heading" data-beat="${beat}"><div class="day1-meta"><span class="eyebrow">${text(f,'title')}</span>${button(f,'dismiss','story-dismiss',beat==='done'?'memory':beat,busy)}</div><h2 id="day1-heading" tabindex="-1">${text(f,'misaki')}</h2><p>${body}</p><div class="day1-actions">${cta}${beat!=='done'?button(f,'skip','story-skip',beat,busy):''}</div></section>`;
}
export function day1Journal(s:Snapshot,story:StoryRecord,f:Day1Format,busy:boolean){
 const v=day1View(s,story);return `<section class="current-section day1-memory"><span class="eyebrow">${text(f,'title')}</span><h3>${text(f,'memoryTitle')}</h3><p>${v.hasSale?day1Moment(s,story,f):text(f,'welcome')}</p><p class="muted">${text(f,!v.hasSale?'noSale':!story.read.includes('report')?'reportIntro':v.complete?'done':v.positive?'reportIntro':'profitPending')}</p><div class="card-actions">${button(f,'replay','story-replay','welcome',busy)}${button(f,'readReport','story-report','report',busy,false)}</div><p class="muted">${text(f,'proposal')}</p></section>`;
}
export function day1Report(s:Snapshot,r:Report,story:StoryRecord,f:Day1Format,busy:boolean){
 const asof=Math.min(s.watermark,Date.parse(r.day+'T00:00:00Z')+15*3600000),local=new Date(asof+9*3600000).toISOString();
 const v=day1View(s,story);return `<section class="current-section day1-report"><h3>${text(f,r.net>0?'profitTitle':'lossTitle')}</h3><p class="muted">${escape(r.day)} · ${text(f,'asOf',{date:local.slice(0,10),time:local.slice(11,16)})}</p><p>${text(f,r.net>0?'profit':'loss',{amount:f.money(r.net)})}</p><p>${text(f,'reportIntro')}</p>${v.hasSale?button(f,'acknowledge','story-report-read','report',busy,true):''}</section>`;
}
