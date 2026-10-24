import test from 'node:test';
import assert from 'node:assert/strict';
import {newStockWorkspace,readStockWorkspace,saveStockWorkspace,changeStockView,stockViewKey} from '../src/ui/stock-state';
import {stockLocales,stockText} from '../src/ui/stock-copy';

test('vertical inventory retains independent filtered positions and explicit selection through persistence',()=>{
 const w=newStockWorkspace();w.selected='off.vase';w.listTop=740;
 changeStockView(w,{filter:'empty'});assert.equal(w.listTop,0);w.listTop=130;
 changeStockView(w,{query:'vase'});assert.equal(w.listTop,0);w.listTop=28;
 changeStockView(w,{query:''});assert.equal(w.listTop,130);
 changeStockView(w,{filter:'all'});assert.equal(w.listTop,740);assert.equal(w.selected,'off.vase');
 const map=new Map<string,string>(),storage={getItem:(k:string)=>map.get(k)??null,setItem:(k:string,v:string)=>{map.set(k,v)}};
 saveStockWorkspace(w,'sandbox',storage);const restored=readStockWorkspace('sandbox',storage);assert.deepEqual(restored,w);
 changeStockView(restored,{filter:'empty',query:'vase'});assert.equal(restored.listTop,28);assert.equal(restored.selected,'off.vase');assert.equal(readStockWorkspace('normal',storage).listTop,0);
});
test('legacy rail preference migrates without interpreting horizontal pixels as vertical position; malformed positions are bounded',()=>{
 const legacy=readStockWorkspace('legacy',{getItem:()=>JSON.stringify({query:'',filter:'all',selected:'off.vase',railLeft:2723})});assert.equal(legacy.selected,'off.vase');assert.equal(legacy.listTop,0);assert.deepEqual(legacy.positions,{});
 const invalid=readStockWorkspace('invalid',{getItem:()=>JSON.stringify({listTop:-3,positions:{bad:-1,text:'10',huge:999999}})});assert.equal(invalid.listTop,0);assert.deepEqual(invalid.positions,{huge:100000});
 const w=newStockWorkspace();for(let n=0;n<100;n++)changeStockView(w,{query:String(n)});assert.ok(Object.keys(w.positions).length<=64);assert.equal(stockViewKey(w),JSON.stringify(['99','all']));
});
test('five locales describe a product list and provide complete row and action headings',()=>{
 for(const locale of stockLocales){for(const key of ['item','actions','browse','quantity','total']as const)assert.ok(stockText(locale,key).length>0);assert.doesNotMatch(stockText(locale,'intro'),/card|卡|การ์ด/);}
});
