// PORT_REQUIRED_FOR_UNITY. Sole active W1 economy. C# experiment is frozen in proof/.
import {config,type Snapshot,type Command,type Mode} from './contracts';
export const LIMIT=1_000_000_000_000;
export const MAX_GAP=31*86400000;
function require(condition:unknown,code:string):asserts condition {if(!condition)throw new Error(code);}
export function capGroup(effects:number[],cap:number){return Math.max(-9000,Math.min(cap,effects.reduce((a,b)=>a+b,0)));}
export function roundEven(n:number,d:number){require(Number.isSafeInteger(n)&&n>=0&&Number.isSafeInteger(d)&&d>0,'number');const q=Math.floor(n/d),r=n%d;return q+Number(r*2>d||(r*2===d&&q%2===1));}
export {safeNumbers,validate} from './validation';
import {safeNumbers,validate} from './validation';
import {recoveryPreview} from './recovery';
export function create(mode:Mode,time:number):Snapshot {
 const s:Snapshot={shopId:'shop.player.1',region:'tokyo',district:'ikebukuro',archetype:'retail',specialization:'lifestyle-select',layoutId:'layout.graybox.1',staffRoster:['staff.graybox'],schemaVersion:2,contentVersion:'w1-provisional-1',simulationVersion:'ts-w1-2',recovery:{total:0,grants:[]},mode,rankingEligible:false,worldStateId:'tokyo.static.w1',shopName:'',companyName:'',logo:'◇',cash:config.initialCash,purchases:0,watermark:time,lastWallTime:time,revision:0,open:false,revealed:false,tutorial:0,eventSequence:0,inventory:Object.fromEntries(config.offerings.map(o=>[o.id,{stock:0,price:o.suggestedPrice,bookCost:0,demandRemainder:0}])),shelves:['','',''],commandIds:[],reports:[],breakdown:[],salaryRemainder:0,rentRemainder:0,operatingRemainder:0};return validate(s);
}
export function apply(input:Snapshot,cmd:Command):Snapshot {
 const s=structuredClone(validate(input));safeNumbers(cmd);require(typeof cmd.id==='string'&&cmd.id.length>0&&cmd.id.length<100,'command');if(cmd.kind!=='settle'&&s.commandIds.includes(cmd.id))return s;if(cmd.kind!=='settle')require(s.commandIds.length<100000,'command_limit');
 const id=cmd.itemId??'',item=s.inventory[id],o=config.offerings.find(x=>x.id===id);if(['buy','price','display'].includes(cmd.kind))require(o&&item&&Object.hasOwn(s.inventory,id),'references');
 switch(cmd.kind){
  case 'buy':{const q=cmd.quantity!;require(Number.isSafeInteger(q)&&q>0&&q<=1000&&item.stock+q<=100000,'quantity');const cost=roundEven(o!.cost*(10000-Math.max(0,Math.min(config.discountCapBp,config.discountBp))),10000);const total=cost*q;require(s.cash>=total,'cash');s.cash-=total;s.purchases+=total;item.stock+=q;item.bookCost+=total;break;}
  case 'display':{const n=cmd.slot!;require(Number.isInteger(n)&&n>=0&&n<3,'slot');s.shelves=s.shelves.map(x=>x===id?'':x);s.shelves[n]=id;break;}
  case 'clear':{const n=cmd.slot!;require(Number.isInteger(n)&&n>=0&&n<3,'slot');s.shelves[n]='';break;}
  case 'price':require(Number.isInteger(cmd.price)&&cmd.price!>=1&&cmd.price!<=100000,'price');if(item.price!==cmd.price){item.demandRemainder=0;item.price=cmd.price!;}break;
  case 'open':s.open=!s.open;break;
  case 'identity':require(typeof cmd.text==='string'&&cmd.text.trim().length>0&&cmd.text.length<=32&&typeof cmd.company==='string'&&cmd.company.length<=32&&typeof cmd.logo==='string'&&cmd.logo.length<=8,'identity');s.shopName=cmd.text.trim();s.companyName=cmd.company.trim();s.logo=cmd.logo;break;
  case 'reveal':require(s.reports.reduce((a,r)=>a+r.units,0)>=1,'discovery_locked');s.revealed=true;s.tutorial=5;break;
  case 'recover':{const p=recoveryPreview(s);require(p.eligible,'recovery_ineligible');s.recovery.grants.push({id:cmd.id,time:s.watermark,amount:p.amount,cashBefore:s.cash,cashAfter:p.targetCash});s.recovery.total+=p.amount;s.cash=p.targetCash;break;}
  case 'settle':settle(s,cmd.target!);break;
  default:throw new Error('command');
 }
 if(cmd.kind!=='settle')s.commandIds.push(cmd.id);advanceTutorial(s);s.revision++;return validate(s);
}
function advanceTutorial(s:Snapshot){
 // Free-choice route: milestones are predicates, remembered once earned.
 if(s.tutorial===0&&Object.values(s.inventory).some(i=>i.stock>0))s.tutorial=1;
 if(s.tutorial===1&&s.shelves.some(id=>id&&s.inventory[id].stock>0))s.tutorial=2;
 if(s.tutorial===2&&s.open)s.tutorial=3;
 if(s.tutorial===3&&s.eventSequence>0)s.tutorial=4;
 if(s.revealed)s.tutorial=5;
}
function settle(s:Snapshot,target:number){
 require(Number.isSafeInteger(target)&&target>=s.watermark,'rollback');require(target<=4102444800000&&target-s.watermark<=MAX_GAP,'long_gap');
 const start=Math.floor(s.watermark/60000),end=Math.floor(target/60000),active=s.shelves.filter(Boolean);const set=config.setPieces.length>0&&config.setPieces.every(x=>active.includes(x));const bonus=capGroup([set?config.setBonusBp:0],config.demandCapBp);let rate=config.baseDemandPerHour*(10000+bonus);if(active.length)rate=Math.min(rate,Math.floor(config.capacityPerHour*10000/active.length));
 s.breakdown=[{id:'base',value:config.baseDemandPerHour,unit:'units/h'},...['world','offering','staff','equipment'].map(id=>({id,value:0,unit:'bp'})),{id:'set',value:bonus,unit:'bp'},{id:'event',value:0,unit:'bp'},{id:'capacity',value:config.capacityPerHour,unit:'units/h'},{id:'conversion',value:config.conversionBp,unit:'bp'},...['sales','variable','period','net','ratings'].map(id=>({id,value:0,unit:'bp'}))];
 for(let m=start;m<end;m++){
  const local=new Date(m*60000+9*3600000),day=local.toISOString().slice(0,10);let r=s.reports.at(-1);if(!r||r.day!==day){r={day,sales:0,cogs:0,salary:0,rent:0,operating:0,units:0,net:0};s.reports.push(r);}
  const operating=s.open&&local.getUTCHours()>=config.openHour&&local.getUTCHours()<config.closeHour;
  const rent=Math.floor((s.rentRemainder+config.rentPerHour)/60);s.rentRemainder=(s.rentRemainder+config.rentPerHour)%60;r.rent+=rent;s.cash-=rent;
  if(operating){const salary=Math.floor((s.salaryRemainder+config.salaryPerHour)/60);s.salaryRemainder=(s.salaryRemainder+config.salaryPerHour)%60;const op=Math.floor((s.operatingRemainder+config.operatingPerHour)/60);s.operatingRemainder=(s.operatingRemainder+config.operatingPerHour)%60;r.salary+=salary;r.operating+=op;s.cash-=salary+op;
   for(const id of active){const item=s.inventory[id],o=config.offerings.find(x=>x.id===id)!;if(item.stock===0){item.demandRemainder=0;continue;}const priceConversion=Math.min(15000,Math.floor(o.suggestedPrice*10000/item.price));const converted=Math.floor(rate*Math.min(10000,Math.floor(config.conversionBp*priceConversion/10000))/10000);const accum=item.demandRemainder+converted,n=Math.min(item.stock,Math.floor(accum/600000));item.demandRemainder=accum%600000;
    if(n){const used=n===item.stock?item.bookCost:roundEven(item.bookCost*n,item.stock);item.stock-=n;item.bookCost-=used;const sale=n*item.price;s.cash+=sale;r.sales+=sale;r.cogs+=used;r.units+=n;s.eventSequence+=n;}
   }
  }
  r.net=r.sales-r.cogs-r.salary-r.rent-r.operating;
 }
 const last=s.reports.at(-1);if(last){for(const b of s.breakdown){if(b.id==='sales'){b.value=last.sales;b.unit='economic-units';}if(b.id==='variable'){b.value=last.cogs;b.unit='economic-units';}if(b.id==='period'){b.value=last.salary+last.rent+last.operating;b.unit='economic-units';}if(b.id==='net'){b.value=last.net;b.unit='economic-units';}}}
 s.watermark=target;
}
export function execute(json:string){try{require(json.length<=8000000,'invalid');const req=JSON.parse(json);safeNumbers(req);let state:Snapshot;if(req.op==='create')state=create(req.mode,req.time);else if(req.op==='validate')state=validate(req.state);else if(req.op==='command')state=apply(req.state,req.command);else throw new Error('operation');return JSON.stringify({ok:true,state});}catch(e){return JSON.stringify({ok:false,error:e instanceof Error?e.message:'invalid'});}}
