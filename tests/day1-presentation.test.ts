import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import 'fake-indexeddb/auto';
import {Core,type Snapshot} from '../src/core/contracts';
import {execute} from '../src/core/simulation';
import {Saves,database} from '../src/platform/storage';
import {emptyStory,day1View} from '../src/narrative/day1';
import {day1Text} from '../src/narrative/day1-copy';
import {day1Card,day1Journal,day1Report} from '../src/ui/day1';
import {Day1GestureClock} from '../src/presentation/day1';
import {FeedbackClock,motionAllowed,vfx} from '../src/presentation/config';
import {FeedbackProjector} from '../src/presentation/feedback';
import {customerVisible} from '../src/presentation/poses';
const start=Date.parse('2026-10-21T01:00:00Z'),core=new Core(execute);let id=0;
const policy={low:false,minimal:false,reduced:false};
const parse=(p:string)=>ts.createSourceFile(p,fs.readFileSync(p,'utf8'),ts.ScriptTarget.Latest,true);
function extract(file:ts.SourceFile,names:string[],methods=false){const result:string[]=[];function visit(n:ts.Node){if((ts.isMethodDeclaration(n)||ts.isFunctionDeclaration(n))&&(methods?ts.isMethodDeclaration(n):ts.isFunctionDeclaration(n))&&n.name&&names.includes(n.name.getText(file)))result.push(n.getText(file));ts.forEachChild(n,visit);}visit(file);assert.equal(result.length,names.length);return result.join(methods?',\n':'\n');}
const main=parse('src/main.ts'),world=parse('src/world.ts');
test('Day1 real story UI boundary writes only sidecar; skip and greeting do not transact, old import callbacks cannot restore marks',async()=>{
 const db=await database('day1-ui-'+(++id)),saves=new Saves(db,core),snapshot=await saves.loadOrCreate('sandbox',start);let greets=0,cancels=0;
 const c:any={state:snapshot,story:emptyStory(snapshot),storyBusy:false,busy:false,storyReplay:false,presentationEpoch:0,saves,emptyStory,locale:'zh-HK',day1Text,draw:()=>{},notice:()=>{},document:{hidden:false,querySelector:()=>undefined},world:{gesture:()=>greets++},cancelFeedback:()=>{c.presentationEpoch++;cancels++;}};
 vm.createContext(c);vm.runInContext(ts.transpileModule(extract(main,['syncStory','storyAction']),{compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText,c);
 assert.equal(await c.storyAction('welcome','read'),true);assert.equal(greets,1);assert.ok(c.story.read.includes('welcome'));assert.deepEqual(await saves.read('sandbox'),snapshot);
 assert.equal(await c.storyAction('choose','skip'),true);assert.equal(c.story.dismissed,true);assert.equal(cancels,1);assert.deepEqual(await saves.read('sandbox'),snapshot);
 c.document.hidden=true;await c.storyAction('welcome','read');assert.equal(greets,1);
 const imported=await saves.import(snapshot,JSON.stringify(snapshot));assert.equal(imported.revision,snapshot.revision+1);
 // Simulates an old UI callback still carrying the pre-import object/revision.
 assert.equal(await c.storyAction('welcome','read'),false);assert.deepEqual((await saves.readStory(imported)).read,[]);assert.deepEqual(await saves.read('sandbox'),imported);db.close();
});
test('Day1 actual world boundary keeps pre-sale browsing, committed sale summary and one bounded gesture; all cancellation policies agree',()=>{
 const script=ts.transpileModule(extract(world,['finishFeedback','advanceFeedback'])+'\nworld={'+extract(world,['feedback','gesture','skip','quality','minimal'],true)+'};',{compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText;
 const c:any={clock:new FeedbackClock(),gestureClock:new Day1GestureClock(),disposed:false,effectiveQuality:'high',quality:'auto',frames:[],last:undefined,minimalFX:false,reduced:{matches:false},document:{hidden:false},motionAllowed,onFeedbackEnd:()=>{},setQuality:(q:string)=>c.effectiveQuality=q};vm.createContext(c);vm.runInContext(script,c);
 assert.equal(customerVisible(0,true,false),true);assert.equal(customerVisible(0,true,true),true);assert.equal(customerVisible(1,true,true),false);
 let s=core.create('sandbox',start);for(const cmd of [{kind:'buy',itemId:'off.tea',quantity:5},{kind:'display',itemId:'off.tea',slot:0},{kind:'open'}])s=core.apply(s,{id:'pose-'+(++id),...cmd});
 assert.equal(s.eventSequence,0);const after=core.apply(s,{id:'pose-settle',kind:'settle',target:start+3600000}),projector=new FeedbackProjector(),event=projector.project(s,after,'advance',0)!;assert.equal(event.sold,5);
 c.world.feedback(event);assert.equal(c.gestureClock.active.kind,'sale');assert.equal(projector.project(after,after,'reload',0),undefined);
 for(const cancellation of ['skip','hidden','low','minimal','reduced']){c.document.hidden=false;c.effectiveQuality='high';c.minimalFX=false;c.reduced.matches=false;c.world.gesture('greet');assert.equal(c.gestureClock.active.kind,'greet');if(cancellation==='skip')c.world.skip();if(cancellation==='hidden'){c.document.hidden=true;c.advanceFeedback(16);}if(cancellation==='low')c.world.quality('low');if(cancellation==='minimal')c.world.minimal(true);if(cancellation==='reduced'){c.reduced.matches=true;c.advanceFeedback(16);}assert.equal(c.gestureClock.active,undefined);}
 c.document.hidden=false;assert.equal(c.gestureClock.start('sale',policy),true);for(let i=0;i<15;i++)c.gestureClock.step(50,policy);assert.equal(c.gestureClock.active,undefined);c.gestureClock.step(5000,policy);assert.equal(c.gestureClock.active,undefined);
});
test('Day1 rendered UI uses live positive/negative as-of report, current selection and safe text; no remembered profit reconstruction',()=>{
 let s=core.create('sandbox',start);for(const cmd of [{kind:'buy',itemId:'off.tea',quantity:5},{kind:'display',itemId:'off.tea',slot:0},{kind:'open'},{kind:'settle',target:start+15*60000}])s=core.apply(s,{id:'markup-'+(++id),...cmd});
 const story={...emptyStory(s),read:['welcome','report','memory','profit'] as const,profitDay:'2026-10-21'};const record={...story,read:[...story.read]};
 const f={locale:'en',itemName:()=>'<script>tea</script>',money:(n:number)=>'JPY '+n*10};
 const html=day1Report(s,s.reports[0],record,f,false);assert.match(html,/JPY 260/);assert.match(html,/10:15/);assert.match(html,/net profit/);assert.ok(!html.includes('final profit'));
 const changed=core.apply(s,{id:'costs-'+(++id),kind:'settle',target:start+23*3600000});assert.ok(changed.reports[0].net<0);assert.equal(day1View(changed,record).positive,false);
 const loss=day1Report(changed,changed.reports[0],record,f,false);assert.match(loss,/not yet covered/);assert.ok(!loss.includes('JPY 260'));
 const journal=day1Journal(s,record,f,false);assert.ok(journal.includes('&lt;script&gt;tea&lt;/script&gt;'));assert.ok(!journal.includes('<script>'));
 const welcome=day1Card(s,emptyStory(s),f,false);assert.match(welcome,/already has sales on record/);
 const fresh=core.create('sandbox',start);assert.ok(!day1Journal(fresh,emptyStory(fresh),f,false).includes('already'));assert.match(day1Card(fresh,emptyStory(fresh),f,false),/Skip this part/);
});
