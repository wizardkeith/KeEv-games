import test from 'node:test';
import assert from 'node:assert/strict';
import {day1Dictionaries,day1CopyLocales,day1Text,type Day1CopyKey} from '../src/narrative/day1-copy';

const keys=Object.keys(day1Dictionaries['zh-HK']) as Day1CopyKey[];
const tokens=(s:string)=>[...s.matchAll(/\{([a-zA-Z][a-zA-Z0-9]*)\}/g)].map(m=>m[1]).sort();
test('Day 1 five locales have complete, matching, nonempty copy and exact placeholder contracts',()=>{
 assert.equal(day1CopyLocales.length,5);
 assert.equal(keys.length,52);
 for(const locale of day1CopyLocales){
  assert.deepEqual(Object.keys(day1Dictionaries[locale]).sort(),[...keys].sort());
  for(const key of keys){
   const text=day1Dictionaries[locale][key];assert.ok(text.trim(),`${locale}:${key}`);
   assert.deepEqual(tokens(text),tokens(day1Dictionaries['zh-HK'][key]),`${locale}:${key}`);
   assert.ok(!/<[^>]+>/.test(text),'authored content contains no HTML');
   const rendered=day1Text(locale,key,{item:'Notebook',amount:'−¥200',date:'2026-10-21',time:'10:15',from:'1',to:'3',count:5});
   assert.deepEqual(tokens(rendered),[],`${locale}:${key} rendered`);
  }
 }
});
test('Day 1 interpolation returns text without recursive template interpretation and has a stable locale fallback',()=>{
 const item='<img onerror="x">{amount}&';
 assert.ok(day1Text('en','chooseOther',{item}).includes(item),'caller must HTML-escape plain text');
 assert.equal(day1Text('unknown','title'),day1Text('zh-HK','title'));
 assert.deepEqual(tokens(day1Text('en','asOf')),[],'missing optional display values do not expose raw template tokens');
 assert.equal(day1Text('en','moveShelf',{from:1,to:3}),'Moved from shelf 1 to shelf 3. Stock quantity is unchanged.');
});
test('Day 1 financial, return, and current-choice text keeps evidence and time boundaries explicit',()=>{
 for(const locale of day1CopyLocales){
  assert.ok(day1Text(locale,'profit',{amount:'¥260'}).includes('¥260'));
  assert.ok(day1Text(locale,'loss',{amount:'−¥540'}).includes('−¥540'));
  assert.ok(day1Text(locale,'asOf',{date:'2026-10-21',time:'10:15'}).includes('10:15'));
  assert.notEqual(day1Text(locale,'welcomeReturning'),day1Text(locale,'sale'));
  assert.ok(day1Text(locale,'memoryTea',{item:'Tea'}).includes('Tea'));
  assert.ok(day1Text(locale,'chooseOther',{item:'Cup'}).includes('Cup'));
 }
 assert.match(day1Text('en','reportIntro'),/cost of goods sold, wages, rent and operating costs/);
 assert.match(day1Text('en','profitExplained'),/current report/);
 assert.match(day1Text('en','reportCurrent'),/not the final result/);
 assert.match(day1Text('en','welcomeReturning'),/already has sales on record/);
 assert.match(day1Text('en','sandboxTime'),/active-play target, not a time limit/);
 assert.match(day1Text('en','normalTime'),/real time/);
 assert.equal(day1Text('en','advance15'),'+15 minutes');
 assert.doesNotMatch(day1Text('en','profitPending'),/explained|understood/i);
});
