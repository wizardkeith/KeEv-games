import './style.css';
import {catalog,type Mode,type Snapshot,type Command} from './core/contracts';
import {recoveryPreview,purchaseCost} from './core/recovery';import {loadCore} from './platform/loader';import {database,Saves} from './platform/storage';
import {t,esc,money,date,locale,setLocale,trading} from './ui/copy';
import {panelContent,identityForm,button} from './ui/panels';import {render} from './ui/dom';
import {commandId,draftFor,storeDraft,type UI} from './ui/session';
const app=document.querySelector<HTMLDivElement>('#app')!,canvas=document.querySelector<HTMLCanvasElement>('#world')!;
let mode:Mode=localStorage.getItem('shop.mode')==='sandbox'?'sandbox':'normal';
let state:Snapshot,saves:Saves,busy=false,world:Awaited<ReturnType<typeof import('./world')['createWorld']>>|undefined;
const u:UI={panel:'',slot:0,zen:false,quality:'auto',sound:false,reportDay:'',rename:false,draft:{quantity:'5',prices:{},shop:'',company:'',logo:'◇'},formError:'',formField:'',notice:'',blocking:'',worldFailed:false};
let focusReturn:HTMLElement|null=null,readyMs:number|null=null,worldReadyMs:number|null=null,noticeTimer:ReturnType<typeof setTimeout>|undefined;
const started=performance.now(),saleSound=new Audio('/assets/sale.wav');saleSound.volume=.25;
function download(data:string,name:string){const url=URL.createObjectURL(new Blob([data],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function notice(text:string){u.notice=text;clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>{u.notice='';draw();},6500);}
function actionButton(key:string,action:string,extra='',primary=false){return button(t(key),action,extra,primary,busy);}
function nextAction(){
 if(recoveryPreview(state).eligible)return {text:'recoveryTitle',label:'recoveryTitle',panel:'stock'};
 const n=state.tutorial;
 if(n===3&&!state.open)return {text:'nextOpen',label:'navShelves',panel:'shelves'};
 return [{text:'nextBuy',label:'stock',panel:'stock'},{text:'nextDisplay',label:'navShelves',panel:'shelves'},{text:'nextOpen',label:'navShelves',panel:'shelves'},{text:state.open&&!trading(state)?'hours':'nextSale',label:mode==='sandbox'?'advance60':'report',panel:'report'},{text:'nextReveal',label:'journal',panel:'journal'}][Math.min(n,4)];
}
function draw(){
 if(!state)return;document.documentElement.lang=locale;document.title=state.shopName?state.shopName+' · '+t('title'):t('title');document.body.classList.toggle('zen',u.zen);document.body.classList.toggle('drawer-open',!!u.panel);
 const status=trading(state)?'isOpen':state.open?'outsideHours':'isClosed',next=nextAction();
 const oldActive=document.activeElement as HTMLInputElement|null;const activeId=oldActive?.id;const start=oldActive?.selectionStart,end=oldActive?.selectionEnd;
 render(app,`<header class="top"><div class="brand"><div class="brand-title"><span class="mark">${esc(state.logo)}</span><h1>${esc(state.shopName||t('welcome'))}</h1></div><p>${esc(t('subtitle'))}</p><div class="shop-context"><span class="statusdot ${trading(state)?'':'closed'}"></span>${esc(t(status))}<span class="mode-badge">${esc(t(mode==='sandbox'?'sandboxShort':'normalShort'))}</span></div></div><div class="balance"><small>${esc(t('cash'))}</small><strong>${money(state.cash)}</strong><span>${esc(date(state.watermark))} · Tokyo</span></div></header>
 <div class="world-note" ${u.worldFailed?'':'hidden'}><span>◇</span><p>${esc(t('noWebGL'))}</p></div>
 ${!world&&!u.worldFailed?`<p class="world-loading">${esc(t('worldPreparing'))}</p>`:''}
 ${!state.revealed&&!u.zen?`<section class="next-card" aria-label="${esc(t('nextStep'))}"><span class="eyebrow">${esc(t('nextStep'))}</span><p>${esc(t(next.text))}</p>${actionButton(next.label,next.text==='nextSale'&&mode==='sandbox'?'advance':'panel',next.text==='nextSale'&&mode==='sandbox'?'data-minutes="60"':`data-panel="${next.panel}"`)}</section>`:''}
 ${u.panel?`<aside id="drawer" class="sidebar" role="dialog" aria-modal="false" aria-labelledby="panel-title"><header class="panelhead"><h2 id="panel-title" tabindex="-1">${esc(t(u.panel))}</h2><button data-action="hide" class="closepanel" aria-label="${esc(t('closePanel'))}">×</button></header><div class="panelbody" id="panelbody">${panelContent(state,u,busy)}</div></aside>`:''}
 <div class="shop-controls"><span class="clock-note">${esc(t(mode==='sandbox'?'sandboxNote':'normalNote'))}</span><div class="control-actions">${actionButton(state.open?'close':'open','open','',true)}${mode==='sandbox'?actionButton('advance60','advance','data-minutes="60"'):actionButton('demo','mode')}</div></div>
 <nav class="dock" aria-label="${esc(t('navShelves'))}">${[['shelves','navShelves','▦'],['stock','navStock','＋'],['report','navReport','≋'],['journal','navJournal','◇'],['settings','more','•••']].map(([p,label,icon])=>`<button data-action="panel" data-panel="${p}" aria-pressed="${u.panel===p}"><span aria-hidden="true">${icon}</span><span>${esc(t(label))}</span></button>`).join('')}</nav>
 <p class="camera-hint">${esc(t('camera'))}</p>
 ${u.blocking?`<section class="blocking" role="alert"><p>${esc(t(u.blocking))}</p>${u.blocking==='stale'?actionButton('refresh','reload'):u.blocking==='long_gap'?actionButton('catchup','catchup'):actionButton('retry','retry')}${actionButton('export','export')}</section>`:''}
 ${u.notice?`<div class="message" role="status" aria-live="polite">${esc(u.notice)}</div>`:''}
 ${u.formError&&u.formField==='general'?`<div class="message field-error" role="alert">${esc(u.formError)}</div>`:''}
 ${u.zen?`<button class="zenbtn" data-action="zen">${esc(t('return'))}</button>`:''}
 ${!state.shopName||u.rename?identityForm(state,u,busy):''}`);
 if(activeId&&document.activeElement?.id!==activeId){const replacement=document.getElementById(activeId) as HTMLInputElement|null;if(replacement){replacement.focus({preventScroll:true});if(start!==null&&start!==undefined)try{replacement.setSelectionRange(start,end??start);}catch{}}}
 world?.update(state);world?.selected(u.slot);world?.layout(!!u.panel&&!u.zen);world?.zen(u.zen);
}
function committed(previous:Snapshot,current:Snapshot){
 if(previous.mode!==current.mode)return;
 const sold=current.eventSequence-previous.eventSequence;
 if(sold>0){let text=t('sold')+' '+sold;const empty=catalog.offerings.filter(o=>previous.inventory[o.id].stock>0&&current.inventory[o.id].stock===0);if(empty.length)text+=' · '+empty.map(o=>t(o.key)).join(', ')+' '+t('soldOut');notice(text);if(u.sound)void saleSound.play().catch(()=>{});}
}
function fail(e:unknown,field='general'){
 const code=e instanceof Error?e.message:'invalid';
 if(['stale','storage','rollback','long_gap'].includes(code)){u.blocking=code;return;}
 u.formField=field;u.formError=t(code==='cash'?'cashError':code==='price'?'priceError':code==='quantity'?'quantityError':code==='identity'?'identityError':code);
 if(u.formError===code&&!['command_limit','recovery_ineligible','discovery_locked'].includes(code))u.formError=t('invalid');
}
async function run(action:()=>Promise<void>,field='general',success?:()=>void){
 // Lock this intent synchronously, before the first await. Double clicks are
 // discarded rather than turned into a queue of fresh purchasing commands.
 if(busy)return;busy=true;u.formError='';u.formField='';draw();const previous=state;
 try{await action();u.blocking='';committed(previous,state);success?.();}catch(e){fail(e,field);}finally{busy=false;storeDraft(mode,u.draft);draw();}
}
async function act(kind:string,data:Partial<Command>={}){state=await saves.command(state,{id:commandId(),kind,...data},mode==='normal'?Date.now():state.watermark,Date.now());}
function openPanel(p:string,source?:HTMLElement){if(source)focusReturn=source;const changed=u.panel!==p;u.panel=p;u.formError='';draw();if(changed){const body=document.getElementById('panelbody');if(body)body.scrollTop=0;}document.getElementById('panel-title')?.focus({preventScroll:true});}
function closePanel(){u.panel='';u.formError='';draw();focusReturn?.focus({preventScroll:true});}
async function switchMode(next:Mode){
 storeDraft(mode,u.draft);const loaded=await saves.loadOrCreate(next,next==='sandbox'?Date.parse('2026-10-21T01:00:00Z'):Date.now());mode=next;state=loaded;u.draft=draftFor(mode,state);u.rename=false;u.reportDay='';u.slot=0;u.formError='';u.notice='';localStorage.setItem('shop.mode',mode);
}
app.addEventListener('input',e=>{
 const input=e.target as HTMLInputElement;switch(input.id){case 'qty':u.draft.quantity=input.value;break;case 'shop-name':u.draft.shop=input.value;break;case 'company-name':u.draft.company=input.value;break;case 'shop-logo':u.draft.logo=input.value;break;default:if(input.dataset.priceId)u.draft.prices[input.dataset.priceId]=input.value;}
 storeDraft(mode,u.draft);if(input.id==='qty')draw();
});
app.addEventListener('change',e=>{
 const input=e.target as HTMLInputElement|HTMLSelectElement;
 if(input.id==='locale'){setLocale(input.value);draw();}
 if(input.id==='slot'){u.slot=Number(input.value);draw();}
 if(input.id==='reportDay'){u.reportDay=input.value;draw();}
 if(input.id==='quality'){u.quality=input.value;world?.quality(u.quality);}
 if(input.id==='sound'){u.sound=(input as HTMLInputElement).checked;if(u.sound)void saleSound.play().catch(()=>{});}
 if(input.id==='import'){const file=(input as HTMLInputElement).files?.[0];if(file)void run(async()=>{state=await saves.import(state,await file.text());u.draft=draftFor(mode,state);});}
});
app.addEventListener('submit',e=>{
 if((e.target as HTMLElement).id!=='identity')return;e.preventDefault();
 void run(async()=>{await act('identity',{text:u.draft.shop,company:u.draft.company,logo:u.draft.logo});u.rename=false;},'identity',()=>{notice(t('identitySaved'));});
});
app.addEventListener('click',e=>{
 const target=(e.target as Element).closest<HTMLButtonElement>('button[data-action]');if(!target||target.disabled)return;const a=target.dataset.action!,id=target.dataset.id!,n=Number(target.dataset.slot??u.slot);
 if(a==='panel'){openPanel(target.dataset.panel!,target);return;}if(a==='hide'){closePanel();return;}
 if(a==='select-slot'){u.slot=n;draw();return;}if(a==='stock-slot'){u.slot=n;openPanel('stock',target);return;}
 if(a==='zen'){u.zen=!u.zen;draw();return;}
 if(a==='cancel-price'){delete u.draft.prices[id];u.formError='';storeDraft(mode,u.draft);draw();return;}
 if(a==='rename'){u.rename=true;u.draft.shop=state.shopName;u.draft.company=state.companyName;u.draft.logo=state.logo;draw();document.getElementById('shop-name')?.focus();return;}
 if(a==='cancel-identity'){u.rename=false;draw();return;}
 if(a==='export'){download(JSON.stringify(state,null,2),`little-shop-${mode}.json`);return;}
 const field=a==='buy'?'buy-'+id:a==='price'?'price-'+n:'general';
 void run(async()=>{
  switch(a){
   case 'buy':{const q=Number(u.draft.quantity);if(!u.draft.quantity.trim()||!Number.isSafeInteger(q)||q<1||q>1000)throw Error('quantity');const o=catalog.offerings.find(x=>x.id===id)!;if(state.cash<purchaseCost(o.cost)*q){u.formField=field;throw Error('cash');}await act('buy',{itemId:id,quantity:q});notice(t(o.key)+' ×'+q+' · '+t('bought'));break;}
   case 'display':if(state.inventory[id].stock===0)throw Error('displayEmptyError');await act('display',{itemId:id,slot:u.slot});notice(t('placed')+' '+(u.slot+1)+' · '+t('replacedNote'));break;
   case 'price':{const raw=u.draft.prices[id]??String(state.inventory[id].price*10),price=Number(raw)/10;if(!raw.trim()||!Number.isSafeInteger(price)||price<1||price>100000)throw Error('price');await act('price',{itemId:id,price});delete u.draft.prices[id];notice(t('priceSaved'));break;}
   case 'clear':await act('clear',{slot:n});break;
   case 'open':await act('open');break;
   case 'reveal':await act('reveal');u.panel='journal';notice(t('completeTitle'));break;
   case 'recover':await act('recover');u.draft.quantity='5';u.panel='stock';notice(t('supportReceived'));break;
   case 'advance':state=await saves.settle(state,state.watermark+Number(target.dataset.minutes)*60000,Date.now());break;
   case 'mode':await switchMode(mode==='normal'?'sandbox':'normal');break;
   case 'choose-mode':if(target.dataset.mode!==mode)await switchMode(target.dataset.mode as Mode);break;
   case 'reload':{const loaded=await saves.read(mode);if(loaded)state=loaded;break;}
   case 'catchup':state=await saves.settle(state,Math.min(Date.now(),state.watermark+86400000),Date.now());break;
   case 'retry':if(mode==='normal')state=await saves.settle(state,Date.now(),Date.now());else state=(await saves.read(mode))!;break;
  }
 },field);
});
document.addEventListener('keydown',e=>{
 if(e.key==='Escape'){if(u.rename){u.rename=false;draw();}else if(state?.shopName)closePanel();}
 if(e.key==='Tab'&&document.querySelector('.modalshade')){const focusables=Array.from(document.querySelectorAll<HTMLElement>('.modal button:not(:disabled),.modal input'));const first=focusables[0],last=focusables.at(-1);if(e.shiftKey&&document.activeElement===first){last?.focus();e.preventDefault();}else if(!e.shiftKey&&document.activeElement===last){first?.focus();e.preventDefault();}}
});
function resume(){
 if(!state||mode!=='normal'||document.hidden||busy||['stale','storage','long_gap'].includes(u.blocking))return;
 const now=Date.now();if(now-state.watermark>=60000||now<state.lastWallTime||u.blocking==='rollback')void run(async()=>{state=await saves.settle(state,now,now);});
}
async function boot(){
 const core=await loadCore();saves=new Saves(await database(),core);state=await saves.loadOrCreate(mode,mode==='sandbox'?Date.parse('2026-10-21T01:00:00Z'):Date.now());u.draft=draftFor(mode,state);draw();readyMs=performance.now()-started;
 try{const {createWorld}=await import('./world');world=await createWorld(canvas,n=>{u.slot=n;openPanel('shelves');});world.update(state);world.layout(!!u.panel);worldReadyMs=performance.now()-started;}catch(e){console.error(e);u.worldFailed=true;}
 draw();if(!state.shopName)document.getElementById('shop-name')?.focus();
 document.addEventListener('visibilitychange',resume);window.addEventListener('focus',resume);setInterval(resume,10000);resume();
 canvas.addEventListener('world-error',()=>{u.worldFailed=true;draw();});
 Object.assign(window,{littleShopDiagnostics:()=>({core:'PORT_REQUIRED_FOR_UNITY',uiReadyMs:readyMs,startupMs:worldReadyMs,worldReady:worldReadyMs!==null,world:world?.metrics(),userAgent:navigator.userAgent,resources:performance.getEntriesByType('resource').map(e=>({name:e.name,duration:e.duration,transferSize:(e as PerformanceResourceTiming).transferSize,encodedBodySize:(e as PerformanceResourceTiming).encodedBodySize}))})});
}
boot().catch(e=>{console.error(e);app.innerHTML=`<main class="boot"><h2>${esc(t('loadError'))}</h2><p>${esc(t('recovery'))}</p><button id="raw">${esc(t('rawExport'))}</button></main>`;document.getElementById('raw')!.onclick=()=>{if(!saves)return;const tx=saves.db.transaction('saves','readonly'),r=tx.objectStore('saves').get('shop.w1.'+mode);r.onsuccess=()=>download(JSON.stringify(r.result,null,2),'little-shop-raw-recovery.json');};});
