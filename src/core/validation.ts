import {config,type Snapshot} from './contracts';
const LIMIT=1_000_000_000_000,TIME=4_102_444_800_000;
function need(c:unknown,code:string):asserts c {if(!c)throw Error(code);}
const plain=(x:unknown):x is Record<string,any>=>x!==null&&typeof x==='object'&&!Array.isArray(x);
function num(x:unknown,min:number,max:number,code='bounds'){need(typeof x==='number'&&Number.isSafeInteger(x)&&x>=min&&x<=max,code);}
export function safeNumbers(x:unknown):void {if(typeof x==='number')num(x,-TIME,TIME);else if(x&&typeof x==='object')for(const v of Object.values(x))safeNumbers(v);}
export function validate(input:Snapshot):Snapshot {
 need(plain(input),'invalid');const s=input;safeNumbers(s);
 const legacy=s.schemaVersion===1&&s.simulationVersion==='ts-w1-1';
 need((legacy||(s.schemaVersion===2&&s.simulationVersion==='ts-w1-2'))&&s.contentVersion==='w1-provisional-1','version');
 need((s.mode==='normal'||s.mode==='sandbox')&&s.rankingEligible===false,'mode');
 need(s.worldStateId==='tokyo.static.w1','world');
 need(s.shopId==='shop.player.1'&&s.region==='tokyo'&&s.district==='ikebukuro'&&s.layoutId==='layout.graybox.1'&&s.archetype==='retail'&&s.specialization==='lifestyle-select'&&Array.isArray(s.staffRoster)&&s.staffRoster.length===1&&s.staffRoster[0]==='staff.graybox','references');
 for(const v of [s.watermark,s.lastWallTime])num(v,0,TIME,'clock');
 num(s.cash,-LIMIT,LIMIT);for(const v of [s.purchases,s.revision,s.eventSequence])num(v,0,LIMIT);
 num(s.tutorial,0,5,'invalid');need(typeof s.open==='boolean'&&typeof s.revealed==='boolean','invalid');
 need(Array.isArray(s.commandIds)&&s.commandIds.length<=100000&&s.commandIds.every(x=>typeof x==='string'&&x.length>0&&x.length<100)&&new Set(s.commandIds).size===s.commandIds.length,'commands');
 need(plain(s.inventory)&&Object.keys(s.inventory).length===config.offerings.length,'references');
 for(const o of config.offerings){const i=s.inventory[o.id];need(plain(i),'inventory');num(i.stock,0,100000,'inventory');num(i.price,1,100000,'inventory');num(i.bookCost,0,LIMIT,'inventory');num(i.demandRemainder,0,599999,'inventory');need(i.stock>0||i.bookCost===0,'inventory');}
 need(Array.isArray(s.shelves)&&s.shelves.length===3&&s.shelves.every(x=>typeof x==='string'&&(x===''||Object.hasOwn(s.inventory,x)))&&new Set(s.shelves.filter(Boolean)).size===s.shelves.filter(Boolean).length,'layout');
 need(Array.isArray(s.reports)&&s.reports.length<=40000,'report');
 let previous='';for(const r of s.reports){need(plain(r)&&typeof r.day==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(r.day)&&Number.isFinite(Date.parse(r.day+'T00:00:00Z'))&&new Date(r.day+'T00:00:00Z').toISOString().slice(0,10)===r.day&&r.day>previous,'report');previous=r.day;for(const n of [r.sales,r.cogs,r.salary,r.rent,r.operating,r.units])num(n,0,LIMIT,'report');num(r.net,-LIMIT,LIMIT,'report');need(r.net===r.sales-r.cogs-r.salary-r.rent-r.operating,'report');}
 const stageIds=['base','world','offering','staff','equipment','set','event','capacity','conversion','sales','variable','period','net','ratings'];
 need(Array.isArray(s.breakdown)&&s.breakdown.length<=20,'breakdown');
 for(const b of s.breakdown){need(plain(b)&&stageIds.includes(b.id)&&['bp','units/h','economic-units'].includes(b.unit),'breakdown');num(b.value,-LIMIT,LIMIT,'breakdown');}
 for(const n of [s.salaryRemainder,s.rentRemainder,s.operatingRemainder])num(n,0,59,'remainder');
 for(const k of ['shopName','companyName'] as const)need(typeof s[k]==='string'&&s[k].length<=32,'identity');need(typeof s.logo==='string'&&s.logo.length<=8,'identity');
 if(legacy){
  const out=structuredClone(s);out.schemaVersion=2;out.simulationVersion='ts-w1-2';out.recovery={total:0,grants:[]};
  // Old fractional demand has no price provenance. Discard once at migration.
  for(const i of Object.values(out.inventory))i.demandRemainder=0;
  return validate(out);
 }
 need(plain(s.recovery)&&Array.isArray(s.recovery.grants)&&s.recovery.grants.length<=100000,'recovery');num(s.recovery.total,0,LIMIT,'recovery');
 const ids=new Set<string>();let total=0,last=0;
 for(const g of s.recovery.grants){need(plain(g)&&typeof g.id==='string'&&g.id.length>0&&g.id.length<100&&!ids.has(g.id)&&s.commandIds.includes(g.id),'recovery');ids.add(g.id);num(g.time,last,s.watermark,'recovery');last=g.time;num(g.amount,1,LIMIT,'recovery');num(g.cashBefore,-LIMIT,LIMIT,'recovery');num(g.cashAfter,0,LIMIT,'recovery');need(g.cashAfter-g.cashBefore===g.amount,'recovery');total+=g.amount;num(total,0,LIMIT,'recovery');}
 need(total===s.recovery.total,'recovery');return s;
}
