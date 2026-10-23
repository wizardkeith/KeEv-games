import {nativeContext} from './native-context';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import 'fake-indexeddb/auto';
import {Core,type Snapshot} from '../src/core/contracts';
import {execute} from '../src/core/simulation';
import {Saves,database} from '../src/platform/storage';
import {emptyStory,type StoryRecord} from '../src/narrative/day1';
import {day1Card,day1Journal,day1Report} from '../src/ui/day1';
import {day1Text,day1CopyLocales} from '../src/narrative/day1-copy';
const core=new Core(execute),start=Date.parse('2026-10-21T01:00:00Z');let seq=0;
function functions(ast:ts.SourceFile,names:string[]){const found=ast.statements.filter((s):s is ts.FunctionDeclaration=>ts.isFunctionDeclaration(s)&&!!s.name&&names.includes(s.name.text));assert.equal(found.length,names.length);return found.map(n=>n.getText(ast)).join('\n');}
async function fixture(mode:'normal'|'sandbox'='sandbox'){
 const db=await database('focused-fix-'+(++seq)),saves=new Saves(db,core);let s=await saves.loadOrCreate(mode,start);
 for(const c of [{kind:'buy',itemId:'off.tea',quantity:5},{kind:'display',itemId:'off.tea',slot:0}])s=await saves.command(s,{id:'setup-'+(++seq),...c});return {db,saves,s};
}
test('opening story CTA executes actual run/act/Saves once; duplicate, deferred, stale and normal-clock intents never close an open shop',async()=>{
 const f=await fixture(),record={...emptyStory(f.s),read:['welcome'] as StoryRecord['read']};
 const markup=day1Card(f.s,record,{locale:'en',itemName:id=>id,money:n=>String(n)},false);
 assert.match(markup,/data-action="story-open"/);assert.match(markup,/>Open shop</);
 const ast=ts.createSourceFile('main.ts',fs.readFileSync('src/main.ts','utf8'),ts.ScriptTarget.Latest,true);
 let click='';for(const n of ast.statements){if(ts.isExpressionStatement(n)&&ts.isCallExpression(n.expression)&&n.expression.expression.getText(ast)==='app.addEventListener'&&n.expression.arguments[0]?.getText(ast)==="'click'")click=n.expression.arguments[1].getText(ast);}assert.ok(click);
 let release!:()=>void,calls=0;const gate=new Promise<void>(r=>release=r),errors:unknown[]=[],targets:unknown[]=[];
 const c:any={...nativeContext(),document:{activeElement:null,body:null},noticeTimer:undefined,clearTimeout:()=>{},state:f.s,mode:'sandbox',draftPrefix:'test.',saves:{command:async(...args:Parameters<Saves['command']>)=>{calls++;targets.push(args[2]);await gate;return f.saves.command(...args);}},commandId:()=>`intent-${++seq}`,busy:false,presentationEpoch:0,u:{slot:0,draft:{},formError:'',formField:'',blocking:''},draw:()=>{},syncStory:async()=>{},committed:()=>{},storeDraft:()=>{},fail:(e:unknown)=>errors.push(e),Date:{now:()=>start+15*60000}};
 vm.createContext(c);vm.runInContext(ts.transpileModule(functions(ast,['run','act'])+`\nclickHandler=${click};\nconst actualRun=run;run=(...args:any[])=>pending=actualRun(...args);`,{compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText,c);
 const clickOpen=()=>c.clickHandler({target:{closest:()=>({disabled:false,dataset:{action:'story-open',beat:'open'}})}});
 clickOpen();clickOpen();assert.equal(calls,1);assert.equal(c.busy,true);release();await c.pending;assert.deepEqual(errors,[]);assert.equal(c.state.open,true);assert.equal(c.state.commandIds.length,f.s.commandIds.length+1);assert.equal(targets[0],start);
 const opened=structuredClone(c.state);clickOpen();assert.equal(calls,1);assert.deepEqual(await f.saves.read('sandbox'),opened);
 // A second connection advances the core, while an old closed UI still receives an old CTA.
 c.state=f.s;clickOpen();await c.pending;assert.equal(errors.length,1);assert.match(String(errors[0]),/stale/);assert.deepEqual(await f.saves.read('sandbox'),opened);f.db.close();
 const n=await fixture('normal');let normalTarget:unknown;c.state=n.s;c.mode='normal';c.saves={command:async(...args:Parameters<Saves['command']>)=>{normalTarget=args[2];return n.saves.command(...args);}};clickOpen();await c.pending;assert.equal(normalTarget,start+15*60000);assert.equal(c.state.watermark,start+15*60000);assert.equal(c.state.open,true);n.db.close();
});
test('all five current-report pending messages preserve real first-profit history after same-day losses without rebuilding an old amount',async()=>{
 const {db,saves,s:initial}=await fixture();let s=await saves.command(initial,{id:'open-'+(++seq),kind:'open'});s=await saves.settle(s,start+15*60000,start+15*60000);
 assert.equal(s.reports[0].net,26);let record=await saves.markStory(s,'welcome');record=await saves.markStory(s,'report');
 for(const locale of day1CopyLocales)assert.ok(!day1Journal(s,record,{locale,itemName:id=>id,money:n=>String(n*10)},false).includes(day1Text(locale,'profitPending')),'positive report must not get a no-positive-net message while memory is unread');
 for(const beat of ['memory','profit'] as const)record=await saves.markStory(s,beat);
 s=await saves.settle(s,start+255*60000,start+255*60000);assert.equal(s.reports[0].net,-54);assert.equal(s.cash,4946);assert.equal(record.profitDay,'2026-10-21');assert.ok(record.read.includes('profit'));
 const forbidden:Record<string,RegExp>={'zh-HK':/首次|仍待達成/,en:/first|still ahead/i,ja:/初めて|これからです/,th:/ครั้งแรก|เป้าหมายข้างหน้า/,'zh-CN':/首次|仍待达成/};
 for(const locale of day1CopyLocales){const f={locale,itemName:(id:string)=>id,money:(n:number)=>String(n*10)},pending=day1Text(locale,'profitPending');assert.doesNotMatch(pending,forbidden[locale]);
  for(const html of [day1Card(s,record,f,false),day1Journal(s,record,f,false)]){assert.ok(html.includes(pending),locale);assert.ok(!html.includes('260'),locale);}
  const report=day1Report(s,s.reports[0],record,f,false);assert.match(report,/-540/);assert.match(report,/14:15/);assert.ok(!report.includes('260'));
  const neverProfit={...record,read:record.read.filter(x=>x!=='profit'),profitDay:undefined};assert.ok(day1Card(s,neverProfit,f,false).includes(pending));
 }
 assert.deepEqual((await saves.readStory(s)).read,record.read);db.close();
});
