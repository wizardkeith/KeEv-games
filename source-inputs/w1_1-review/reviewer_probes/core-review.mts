// Observational reproductions, NOT passing acceptance tests.
// Place reviewer_probes/ at the repository root. See README.txt.
import {create, apply, validate, execute} from '../src/core/simulation.ts';
import {Core, type Snapshot, type Command} from '../src/core/contracts.ts';
import {Saves, database} from '../src/platform/storage.ts';
import 'fake-indexeddb/auto';

const epoch = Date.parse('2026-10-21T01:00:00Z');
let sequence = 0;
const command = (s:Snapshot, kind:string, values:Partial<Command> = {}) =>
  apply(s, {id:`review:${++sequence}`, kind, ...values});
const settle = (s:Snapshot, minutes:number) => command(s, 'settle', {target:epoch+minutes*60000});
const outcome = (action:()=>unknown) => {try{return {accepted:true,value:action()};}catch(e){return {accepted:false,error:(e as Error).message};}};

let empty = create('normal',epoch);
empty = settle(empty,11*1440);
console.log(JSON.stringify({probe:'closed-empty-shop-eleven-days',cash:empty.cash,stock:Object.values(empty.inventory).reduce((sum,i)=>sum+i.stock,0),rent:empty.reports.reduce((sum,r)=>sum+r.rent,0),buyCheapest:outcome(()=>command(empty,'buy',{itemId:'off.pencil',quantity:1}))}));

let shop = create('sandbox',epoch);
shop = command(shop,'buy',{itemId:'off.notebook',quantity:1});
shop = command(shop,'display',{itemId:'off.notebook',slot:0});
shop = command(shop,'open');
let changed = command(shop,'price',{itemId:'off.notebook',price:81});
changed = settle(changed,10);
const before = {stock:changed.inventory['off.notebook'].stock,remainder:changed.inventory['off.notebook'].demandRemainder,sales:changed.reports[0].sales};
changed = command(changed,'price',{itemId:'off.notebook',price:100000});
changed = settle(changed,165);
let unchanged = command(shop,'price',{itemId:'off.notebook',price:100000});
unchanged = settle(unchanged,165);
console.log(JSON.stringify({probe:'price-remainder-transfer',before,changed:{cash:changed.cash,units:changed.eventSequence,sales:changed.reports[0].sales},fixedHighPrice:{cash:unchanged.cash,units:unchanged.eventSequence,sales:unchanged.reports[0].sales}}));

const db = await database();
const saves = new Saves(db,new Core(execute));
let saved = await saves.loadOrCreate('normal',epoch);
const malformed = structuredClone(saved) as any;
malformed.inventory['off.notebook'].stock = '10';
malformed.inventory['off.notebook'].bookCost = 400;
const accepted = outcome(()=>validate(malformed));
let stage = 'import';
try {
  saved = await saves.import(saved,JSON.stringify(malformed));
  stage = 'buy';
  saved = await saves.command(saved,{id:'string-stock-buy',kind:'buy',itemId:'off.notebook',quantity:1});
  stage = 'reload';
  const reloaded = await saves.read('normal');
  console.log(JSON.stringify({probe:'numeric-string-import',validationAccepted:accepted.accepted,stockAfterBuyingOne:saved.inventory['off.notebook'].stock,stockType:typeof saved.inventory['off.notebook'].stock,bookCost:saved.inventory['off.notebook'].bookCost,cash:saved.cash,reloadAccepted:!!reloaded}));
} catch (error) {
  // A corrected validator should reject this input. Record it and keep running.
  const current = await saves.read('normal');
  console.log(JSON.stringify({probe:'numeric-string-import',validationAccepted:accepted.accepted,rejectedAt:stage,error:(error as Error).message,persistedStock:current?.inventory['off.notebook'].stock,persistedCash:current?.cash}));
} finally {
  db.close();
}

const full = create('sandbox',epoch);
full.commandIds=Array.from({length:100000},(_,i)=>`ledger:${i}`);
console.log(JSON.stringify({probe:'full-ledger-settle',validation:outcome(()=>Boolean(validate(full))),settle:outcome(()=>{
  const result=settle(full,1);
  return {watermark:result.watermark,commandCount:result.commandIds.length,cash:result.cash};
})}));
