import test from 'node:test';import assert from 'node:assert/strict';
import {Core} from '../src/core/contracts';import {execute} from '../src/core/simulation';
import {capturePrice,clearCommittedPriceDraft} from '../src/ui/price-state';import type {Drafts} from '../src/ui/session';
const core=new Core(execute),start=Date.parse('2026-10-21T01:00:00Z'),draft=():Drafts=>({quantity:'5',prices:{},shop:'',company:'',logo:''});
test('pricing intent captures existing JPY conversion before a deferred write; later edits survive that commit',()=>{
 let s=core.create('sandbox',start);s=core.apply(s,{id:'p.stock',kind:'buy',itemId:'off.mug',quantity:3});s=core.apply(s,{id:'p.display',kind:'display',itemId:'off.mug',slot:0});
 const d=draft();d.prices['off.mug']='710';const intent=capturePrice(s,d,'off.mug');assert.ok(Object.isFrozen(intent));d.prices['off.mug']='830';const after=core.apply(s,{id:'p.price',kind:'price',itemId:intent.itemId,price:intent.price});clearCommittedPriceDraft(d,intent);
 assert.equal(after.inventory['off.mug'].price,71);assert.equal(d.prices['off.mug'],'830');assert.equal(after.cash,s.cash);assert.equal(after.inventory['off.mug'].stock,3);assert.equal(after.inventory['off.mug'].bookCost,s.inventory['off.mug'].bookCost);assert.deepEqual(after.shelves,s.shelves);
});
test('pricing rejects fractional core units and out-of-range displayed values without touching drafts; successful matching draft clears',()=>{
 const s=core.create('sandbox',start),d=draft();for(const raw of ['',' ','0','9','11','-10','1000010','Infinity']){d.prices['off.mug']=raw;assert.throws(()=>capturePrice(s,d,'off.mug'),/price/);assert.equal(d.prices['off.mug'],raw)}
 for(const [raw,price]of [['10',1],['00710',71],['1000000',100000]]as const){d.prices['off.mug']=raw;const intent=capturePrice(s,d,'off.mug');assert.equal(intent.price,price);clearCommittedPriceDraft(d,intent);assert.equal(d.prices['off.mug'],undefined)}
});
