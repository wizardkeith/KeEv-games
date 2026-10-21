import {config, type Mode, type Snapshot} from '../core/contracts';

// Presentation-only narrative state. No balances, reward claims or economic authority.
export const day1Beats=['welcome','choose','display','open','sale','report','memory','profit'] as const;
export type BeatId=typeof day1Beats[number];
export type StoryAction='read'|'skip'|'dismiss'|'reopen';
export interface StoryRecord {
 version:1;contentVersion:'day1.v1';mode:Mode;shopId:string;
 read:BeatId[];skipped:BeatId[];dismissed:boolean;
 observedRevision:number;observedEventSequence:number;profitDay?:string;
 // Returned only in memory when a newer writer owns the stored record.
 unsupported?:true;
}
export const storyKey=(s:Pick<Snapshot,'mode'|'shopId'>)=>`story.day1.v1.${s.mode}.${s.shopId}`;
export function emptyStory(s:Snapshot):StoryRecord{return {version:1,contentVersion:'day1.v1',mode:s.mode,shopId:s.shopId,read:[],skipped:[],dismissed:false,observedRevision:s.revision,observedEventSequence:s.eventSequence};}
const object=(x:unknown):x is Record<string,unknown>=>!!x&&typeof x==='object'&&!Array.isArray(x);
export const futureStory=(x:unknown):boolean=>object(x)&&typeof x.version==='number'&&Number.isSafeInteger(x.version)&&x.version>1;
const validIds=(x:unknown):x is BeatId[]=>Array.isArray(x)&&x.length<=day1Beats.length&&x.every(id=>day1Beats.includes(id))&&new Set(x).size===x.length;
export function readStoryRecord(raw:unknown,s:Snapshot):StoryRecord {
 const empty=emptyStory(s);
 if(futureStory(raw))return {...empty,unsupported:true};
 if(!object(raw)||raw.version!==1||raw.contentVersion!=='day1.v1'||raw.mode!==s.mode||raw.shopId!==s.shopId||!validIds(raw.read)||!validIds(raw.skipped)||typeof raw.dismissed!=='boolean'||!Number.isSafeInteger(raw.observedRevision)||Number(raw.observedRevision)<0||!Number.isSafeInteger(raw.observedEventSequence)||Number(raw.observedEventSequence)<0||(raw.profitDay!==undefined&&(typeof raw.profitDay!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(raw.profitDay))))return empty;
 return {version:1,contentVersion:'day1.v1',mode:s.mode,shopId:s.shopId,read:[...raw.read],skipped:[...raw.skipped],dismissed:raw.dismissed,observedRevision:Number(raw.observedRevision),observedEventSequence:Number(raw.observedEventSequence),...(raw.profitDay?{profitDay:String(raw.profitDay)}:{})};
}
export function day1View(s:Snapshot,story:StoryRecord){
 const local=new Date(s.watermark+9*3600000).toISOString(),day=local.slice(0,10),asOf=local.slice(0,16).replace('T',' ');
 const report=s.reports.find(r=>r.day===day);
 const hasStock=Object.values(s.inventory).some(i=>i.stock>0);
 const contextItemId=s.shelves.find(id=>id&&s.inventory[id]?.stock>0)||s.shelves.find(Boolean)||Object.keys(s.inventory).find(id=>s.inventory[id].stock>0);
 const hasDisplay=s.shelves.some(id=>id&&s.inventory[id]?.stock>0);
 const hasSale=s.eventSequence>0&&s.reports.some(r=>r.units>0);
 const hour=new Date(s.watermark+9*3600000).getUTCHours();
 const trading=s.open&&hour>=config.openHour&&hour<config.closeHour;
 const positive=!!report&&report.net>0;
 const handled=(id:BeatId)=>story.read.includes(id)||story.skipped.includes(id);
 let nextBeat:BeatId|'done';
 if(!handled('welcome'))nextBeat='welcome';
 else if(!hasSale&&!hasStock)nextBeat='choose';
 else if(!hasSale&&!hasDisplay)nextBeat='display';
 else if(!hasSale&&!s.open)nextBeat='open';
 else if(!hasSale)nextBeat='sale';
 else if(!handled('report'))nextBeat='report';
 else if(!handled('memory'))nextBeat='memory';
 else if(positive&&!handled('profit'))nextBeat='profit';
 else nextBeat='done';
 return {nextBeat,hasStock,hasDisplay,hasSale,positive,report,asOf,day,contextItemId,trading,complete:hasSale&&positive&&handled('report')&&handled('memory')};
}
export function storyEligible(s:Snapshot,id:BeatId):boolean {
 const view=day1View(s,emptyStory(s));
 if(id==='welcome'||id==='choose')return true;
 if(id==='display')return view.hasStock||view.hasSale;
 if(id==='open')return view.hasDisplay||view.hasSale;
 if(id==='sale')return view.hasSale;
 if(id==='report'||id==='memory')return view.hasSale;
 return view.hasSale&&view.positive;
}
export function mergeStory(raw:unknown,s:Snapshot,id:BeatId,action:StoryAction):StoryRecord {
 const story=readStoryRecord(raw,s);if(story.unsupported)return story;
 if(!day1Beats.includes(id)||!['read','skip','dismiss','reopen'].includes(action))throw Error('invalid');
 // Skipping a presentation never changes economic eligibility. Reading a result
 // requires a real committed result; dismissal/reopen need no milestone claim.
 if(action==='read'&&!storyEligible(s,id))throw Error('story_locked');
 if(action==='read')story.read=day1Beats.filter(b=>story.read.includes(b)||b===id);
 if(action==='skip')story.skipped=day1Beats.filter(b=>story.skipped.includes(b)||b===id);
 if(action==='dismiss')story.dismissed=true;
 if(action==='reopen')story.dismissed=false;
 if(action==='read'&&id==='profit')story.profitDay=day1View(s,story).day;
 story.observedRevision=s.revision;story.observedEventSequence=s.eventSequence;
 return story;
}
