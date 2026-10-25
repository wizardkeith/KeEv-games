/** Ephemeral shop conversation, never a sale/customer accounting record.
 * Visible scene time, single bubble, bounded response queue, no hidden replay. */
import type {RouteFrame} from './native-routes';
const copy={
 'zh-HK':{
  welcome:['歡迎進來，隨意看看。','你好，慢慢選就好。','歡迎，有需要可以告訴我。'],
  reply:['謝謝，我想慢慢看看。','好的，我先看看這邊。','謝謝，這裡感覺很舒服。'],
  browse:['這幾件小物的配色很柔和。','我想挑一件日常用得到的小物。','這個角落的陳列很有心思。'],
  farewell:['謝謝到訪，下次見。','慢走，祝你今天愉快。','謝謝來看看，路上小心。'],
  goodbye:['謝謝，下次再來。','再見，祝你生意順利。','好的，再見。']},
 'zh-CN':{welcome:['欢迎进来，随意看看。','你好，慢慢选就好。','欢迎，有需要可以告诉我。'],reply:['谢谢，我想慢慢看看。','好的，我先看看这边。','谢谢，这里感觉很舒服。'],browse:['这几件小物的配色很柔和。','我想挑一件日常用得到的小物。','这个角落的陈列很用心。'],farewell:['谢谢到访，下次见。','慢走，祝你今天愉快。','谢谢来看看，路上小心。'],goodbye:['谢谢，下次再来。','再见，祝你生意顺利。','好的，再见。']},
 en:{welcome:['Welcome. Take your time looking around.','Hello! Feel free to browse.','Welcome. Let me know if you need anything.'],reply:['Thank you. I’ll have a look around.','Thanks, I’ll start over here.','Thank you. It feels lovely in here.'],browse:['These little things have such gentle colours.','I’d like to find something useful for every day.','This corner is thoughtfully arranged.'],farewell:['Thanks for visiting. See you next time.','Take care, and have a lovely day.','Thank you for stopping by. Have a safe journey.'],goodbye:['Thank you. I’ll visit again.','Goodbye, and have a good day at the shop.','Thanks. Goodbye!']},
 ja:{welcome:['いらっしゃいませ。どうぞごゆっくり。','こんにちは。ゆっくりご覧ください。','いらっしゃいませ。何かあればお声がけください。'],reply:['ありがとうございます。ゆっくり見てみます。','ありがとうございます。こちらから見てみます。','ありがとうございます。落ち着くお店ですね。'],browse:['どれもやさしい色合いですね。','毎日使える小物を選びたいですね。','この一角の並べ方、すてきですね。'],farewell:['お立ち寄りいただき、ありがとうございました。','お気をつけて。よい一日を。','ありがとうございました。またお待ちしています。'],goodbye:['ありがとうございます。また来ます。','さようなら。お仕事、頑張ってください。','ありがとうございます。それでは、また。']},
 th:{welcome:['ยินดีต้อนรับค่ะ ค่อย ๆ เลือกชมได้เลย','สวัสดีค่ะ เชิญเลือกชมตามสบาย','ยินดีต้อนรับค่ะ ต้องการอะไรบอกได้นะคะ'],reply:['ขอบคุณ ขอเดินดูก่อนนะ','ขอบคุณ ขอเริ่มดูทางนี้ก่อน','ขอบคุณ บรรยากาศที่นี่สบายดีจัง'],browse:['ของเล็ก ๆ เหล่านี้ใช้สีอ่อนโยนดีจัง','อยากเลือกของที่ได้ใช้ในทุกวัน','มุมนี้จัดวางอย่างใส่ใจดีจัง'],farewell:['ขอบคุณที่แวะมาค่ะ แล้วพบกันใหม่นะคะ','เดินทางดี ๆ ค่ะ ขอให้เป็นวันที่ดี','ขอบคุณที่มาชมค่ะ เดินทางปลอดภัยนะคะ'],goodbye:['ขอบคุณ แล้วจะแวะมาอีก','ลาก่อน ขอให้วันนี้ขายดีนะ','ขอบคุณ แล้วพบกันใหม่']}
} as const;
export type LifeKind=keyof typeof copy.en;
export interface LifeBubble {actor:string;kind:LifeKind;variant:number;age:number;serial:number;}
export const shopLifeText=(locale:string,b:Pick<LifeBubble,'kind'|'variant'>)=>(copy[locale as keyof typeof copy]??copy.en)[b.kind][b.variant];
export class NativeShopLife {
 private active:LifeBubble|undefined;private pending:{actor:string;kind:LifeKind;at:number;expires:number}|undefined;private time=0;private cooldown=0;private serial=0;private seed=17;private seen=new Set<string>();private browsed=new Set<string>();private last=new Map<LifeKind,number>();
 tick(seconds:number,routes:RouteFrame,greeting:{target:string|null;kind:'arrival'|'departure';elapsed:number|null},allowed:boolean,hasDisplay:boolean){
  this.time+=Math.max(0,Math.min(.05,seconds));
  for(const id of this.browsed)if(!routes.actors.some(a=>a.enabled&&a.id===id))this.browsed.delete(id);
  if(greeting.elapsed===null)this.seen.clear();
  const key=greeting.target+':'+greeting.kind;
  if(greeting.target&&greeting.elapsed!==null&&!this.seen.has(key)){
   this.seen.add(key);if(allowed){this.show('staff',greeting.kind==='arrival'?'welcome':'farewell');this.pending={actor:greeting.target,kind:greeting.kind==='arrival'?'reply':'goodbye',at:this.time+(greeting.kind==='departure'?2.8:3.8),expires:this.time+6.5};}
  }
  if(!allowed){this.cancel();return undefined;}
  if(this.active){this.active.age+=seconds;if(this.active.age>=(this.active.kind==='farewell'?2.6:3.5)||this.active.actor!=='staff'&&!routes.actors.some(a=>a.enabled&&a.id===this.active!.actor))this.active=undefined;}
  if(this.pending&&this.time>=this.pending.at&&!this.active){const p=this.pending;this.pending=undefined;if(this.time<=p.expires&&routes.actors.some(a=>a.id===p.actor&&a.enabled&&a.z<4.1)){this.show(p.actor,p.kind);this.cooldown=this.time+6;}}
  if(!this.active&&!this.pending&&this.time>=this.cooldown&&hasDisplay){const visitor=routes.actors.find(a=>a.enabled&&a.state==='browsing'&&a.browseProgress>.35&&!this.browsed.has(a.id));if(visitor){this.browsed.add(visitor.id);this.show(visitor.id,'browse');this.cooldown=this.time+12;}}
  return this.active?{...this.active}:undefined;
 }
 private show(actor:string,kind:LifeKind){this.seed=(Math.imul(this.seed,1664525)+1013904223)>>>0;let variant=this.seed%3;if(variant===this.last.get(kind))variant=(variant+1)%3;this.last.set(kind,variant);this.active={actor,kind,variant,age:0,serial:++this.serial};this.cooldown=this.time+4;}
 cancel(){this.active=undefined;this.pending=undefined;}
 metrics(){return {bubble:this.active?{...this.active}:null,pending:!!this.pending,serial:this.serial};}
}
