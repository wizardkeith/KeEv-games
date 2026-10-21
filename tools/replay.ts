import fs from 'node:fs';
import {create,apply} from '../src/core/simulation';
import {config,type Command,type Snapshot} from '../src/core/contracts';
export const epoch=Date.parse('2026-01-01T01:00:00Z');
export const commands:Command[]=[{id:'purchase',kind:'buy',itemId:'off.notebook',quantity:10},{id:'display',kind:'display',itemId:'off.notebook',slot:0},{id:'open',kind:'open'},{id:'hour',kind:'settle',target:epoch+3600000}];
export function run(){return commands.reduce((s,c)=>apply(s,c),create('sandbox',epoch));}
export const expected={cash:5020,purchases:400,stock:4,bookCost:160,sales:480,cogs:240,salary:30,rent:20,operating:10,net:180,units:6};
export function summary(s:Snapshot){const i=s.inventory['off.notebook'],r=s.reports[0];return {cash:s.cash,purchases:s.purchases,stock:i.stock,bookCost:i.bookCost,sales:r.sales,cogs:r.cogs,salary:r.salary,rent:r.rent,operating:r.operating,net:r.net,units:r.units};}
if(process.argv[1]?.endsWith('replay.ts')){const s=run(),actual=summary(s);if(JSON.stringify(actual)!==JSON.stringify(expected))throw Error('Golden mismatch');fs.writeFileSync('evidence/replay-result.json',JSON.stringify({fixture:'one-hour-v1',config,epoch,commands,expected,actual},null,2));fs.writeFileSync('fixtures/golden-one-hour.json',JSON.stringify({epoch,commands,expected},null,2));console.log(JSON.stringify(actual));}
