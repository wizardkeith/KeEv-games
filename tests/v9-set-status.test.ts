import test from 'node:test';import assert from 'node:assert/strict';import {Core} from '../src/core/contracts';import {execute} from '../src/core/simulation';import {setStatusView,setStatusPanel,setText,setStatusLocales} from '../src/ui/set-status';
const core=new Core(execute),start=Date.parse('2026-10-21T01:00:00Z');
test('set UI separates current shelf activation from actual stored settlement without granting or claiming anything',()=>{
 let s=core.create('sandbox',start),n=0;const command=(kind:string,data={})=>{s=core.apply(s,{id:String(++n),kind:'settle',target:s.watermark});s=core.apply(s,{id:String(++n),kind,...data});};
 command('buy',{itemId:'off.notebook',quantity:5});command('buy',{itemId:'off.pencil',quantity:5});command('display',{itemId:'off.notebook',slot:0});command('display',{itemId:'off.pencil',slot:1});
 const saved=JSON.stringify(s),v=setStatusView(s);assert.equal(v.active,true);assert.equal(v.last,0);assert.equal(v.bonus,10);assert.equal(v.tier,undefined);const html=setStatusPanel(s,{setInfoOpen:true});assert.ok(html.includes('aria-expanded="true"'));assert.ok(html.includes('0%'));assert.equal(JSON.stringify(s),saved);
 s=core.apply(s,{id:String(++n),kind:'settle',target:s.watermark});assert.equal(setStatusView(s).last,1000);assert.equal(s.eventSequence,0);command('clear',{slot:1});assert.equal(setStatusView(s).active,false);assert.equal(setStatusView(s).last,1000);assert.equal(s.inventory['off.pencil'].stock,5);
});
test('disclosure has keyboard-native buttons, a linked in-flow region and explicit text independent of colour',()=>{
 const s=core.create('sandbox',start),closed=setStatusPanel(s,{setInfoOpen:false}),open=setStatusPanel(s,{setInfoOpen:true});assert.ok(closed.includes('type="button"'));assert.ok(closed.includes('aria-controls="set-info-details"'));assert.ok(closed.includes('aria-expanded="false"'));assert.ok(closed.includes('id="set-info-details" class="set-info-details" hidden'));assert.ok(open.includes('data-action="set-info-close"'));assert.ok(!open.includes('role="tooltip"'));assert.ok(closed.includes('未啟動'));assert.ok(!closed.includes('qualityStandard'));
 for(const language of setStatusLocales)for(const key of ['active','inactive','conditions','effect','timing','last','tier','close']as const){const text=setText(language,key);assert.ok(text.length>3);assert.ok(!text.includes('{n}'));}
});
