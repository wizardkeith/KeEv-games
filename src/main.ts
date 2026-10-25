import {saleAccountingText} from './presentation/sale-accounting';
import {capturePrice,clearCommittedPriceDraft} from './ui/price-state';
import {capturePurchase,changeStockView,stockViewKey,newStockWorkspace,readStockWorkspace,saveStockWorkspace,parseQuantity,quantityDraft,setQuantity} from './ui/stock-state';
import './style.css';
import {FeedbackProjector} from './presentation/feedback';
import {NativeCommitPresentation} from './presentation/native-commits';
import {resolveMotionPolicy,type CapturedCommand} from './presentation/native-motion';
import {vfx} from './presentation/config';
import {readPreferences,savePreferences} from './presentation/preferences';
import {icon} from './ui/icons';
import {day1View,emptyStory,type StoryRecord,type BeatId,type StoryAction} from './narrative/day1';
import {day1Text} from './narrative/day1-copy';
import {day1Card} from './ui/day1';
import {shopGuidance,guidanceText,nextSandboxOpening} from './ui/shop-guidance';
const artReview=import.meta.env.VITE_ART_REVIEW==='1',modeKey=artReview?'shop.art-review.mode':'shop.mode',draftPrefix=artReview?'shop.art-review.draft.':'shop.w1.draft.';
const reviewDatabase=import.meta.env.VITE_DAY1_REVIEW==='1'?'next-stop-little-shop-day1-review':'next-stop-little-shop-art-review-w1_1a1';
const presentationStorageKey=artReview?'shop.art-review.presentation.v1':'shop.presentation.v1';
const feedback=new FeedbackProjector();
const nativePresentation=new NativeCommitPresentation();
let pendingCommand:CapturedCommand|undefined;
let presentationEpoch=0;
let returnPending=false;
import {catalog,type Mode,type Snapshot,type Command} from './core/contracts';
import {recoveryPreview,purchaseCost} from './core/recovery';import {loadCore} from './platform/loader';import {database,Saves} from './platform/storage';
import {t,esc,money,date,locale,setLocale,trading} from './ui/copy';
import {panelContent,identityForm,button} from './ui/panels';import {render} from './ui/dom';
import {commandId,draftFor,storeDraft,type UI} from './ui/session';
const app=document.querySelector<HTMLDivElement>('#app')!,canvas=document.querySelector<HTMLCanvasElement>('#world')!;
let mode:Mode=artReview?'sandbox':localStorage.getItem(modeKey)==='sandbox'?'sandbox':'normal';
const stockWorkspaceKey=()=>presentationStorageKey+'.stock.'+mode;
let state:Snapshot,saves:Saves,busy=false,world:Awaited<ReturnType<typeof import('./world')['createWorld']>>|undefined;
let story:StoryRecord|undefined,storyBusy=false,storyReplay=false;
const u:UI={panel:'',slot:0,zen:false,quality:'auto',sound:false,minimalFX:readPreferences(presentationStorageKey).minimalFX,feedbackKind:'',revealFx:false,reportDay:'',rename:false,draft:{quantity:'5',prices:{},shop:'',company:'',logo:'◇'},formError:'',formField:'',notice:'',blocking:'',worldFailed:false,stock:readStockWorkspace(stockWorkspaceKey())};
let focusReturn:HTMLElement|null=null,readyMs:number|null=null,worldReadyMs:number|null=null,noticeTimer:ReturnType<typeof setTimeout>|undefined,revealTimer:ReturnType<typeof setTimeout>|undefined;
const started=performance.now(),saleSound=new Audio('/assets/sale.wav');saleSound.volume=.12;
function download(data:string,name:string){const url=URL.createObjectURL(new Blob([data],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function notice(text:string){u.notice=text;clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>{u.notice='';draw();},6500);}
function actionButton(key:string,action:string,extra='',primary=false){return button(t(key),action,extra,primary,busy);}
async function syncStory(){const snapshot=state;try{const loaded=await saves.readStory(snapshot);if(state===snapshot)story=loaded;}catch{/* Narrative failure never blocks an intact economic save. */if(state===snapshot)story=emptyStory(snapshot);}}
async function storyAction(beat:BeatId,action:StoryAction){
 if(storyBusy||busy)return false;storyBusy=true;const snapshot=state,epoch=presentationEpoch;draw();
 try{let updated=await saves.markStory(snapshot,beat,action);if(state!==snapshot||epoch!==presentationEpoch)return false;
  if(action==='skip')updated=await saves.markStory(snapshot,beat,'dismiss');
  if(state!==snapshot||epoch!==presentationEpoch)return false;
  if(updated.unsupported){notice(day1Text(locale,'storyUnavailable'));return false;}
  story=updated;storyReplay=false;
  if(action==='skip')cancelFeedback();
  if(action==='dismiss')cancelFeedback();
  if(action==='read'&&beat==='welcome'&&!document.hidden)world?.gesture('greet');
  return true;
 }catch{/* A newer import/settlement owns the save; never retry an old story write. */await syncStory();return false;}
 finally{storyBusy=false;draw();if(state===snapshot&&!document.hidden){if(action==='dismiss'||action==='skip')document.querySelector<HTMLButtonElement>('button[data-panel="journal"]')?.focus({preventScroll:true});else document.querySelector<HTMLButtonElement>('#day1-story .day1-actions button')?.focus({preventScroll:true});}}
}
function nextAction(){
 if(recoveryPreview(state).eligible)return {text:'recoveryTitle',label:'recoveryTitle',panel:'stock'};
 const n=state.tutorial;
 if(n===3&&!state.open)return {text:'nextOpen',label:'navShelves',panel:'shelves'};
 return [{text:'nextBuy',label:'stock',panel:'stock'},{text:'nextDisplay',label:'navShelves',panel:'shelves'},{text:'nextOpen',label:'navShelves',panel:'shelves'},{text:state.open&&!trading(state)?'hours':'nextSale',label:mode==='sandbox'?'advance60':'report',panel:'report'},{text:'nextReveal',label:'journal',panel:'journal'}][Math.min(n,4)];
}
function draw(){
 if(!state)return;const previousRail=document.getElementById('stock-products');if(previousRail&&u.stock&&previousRail.dataset.view===stockViewKey(u.stock))u.stock.listTop=previousRail.scrollTop;document.documentElement.lang=locale;document.title=state.shopName?state.shopName+' · '+t('title'):t('title');document.body.classList.toggle('zen',u.zen);document.body.classList.toggle('drawer-open',!!u.panel);document.body.classList.toggle('minimal-fx',u.minimalFX);document.body.dataset.feedback=u.feedbackKind;
 const status=trading(state)?'isOpen':state.open?'outsideHours':'isClosed',next=nextAction(),guidance=shopGuidance(state,locale,busy||storyBusy);
 const oldActive=document.activeElement as HTMLInputElement|null;const activeId=oldActive?.id;const start=oldActive?.selectionStart,end=oldActive?.selectionEnd;
 render(app,`<header class="top"><div class="brand"><div class="brand-title"><span class="mark">${esc(state.logo)}</span><h1>${esc(state.shopName||t('welcome'))}</h1></div><p>${esc(t('subtitle'))}</p><div class="shop-context"><span class="statusdot ${trading(state)?'':'closed'}"></span>${esc(t(status))}<span class="mode-badge">${esc(t(mode==='sandbox'?'sandboxShort':'normalShort'))}</span></div></div><div class="balance"><small>${esc(t('cash'))}</small><strong>${money(state.cash)}</strong><span>${esc(date(state.watermark))} · Tokyo</span></div></header>
 <div class="world-note" ${u.worldFailed?'':'hidden'}><span>◇</span><p>${esc(t('noWebGL'))}</p></div>
 ${!world&&!u.worldFailed?`<p class="world-loading">${esc(t('worldPreparing'))}</p>`:''}
 ${!u.zen&&!u.panel?guidance||(recoveryPreview(state).eligible||!story?`<section class="next-card" aria-label="${esc(t('nextStep'))}"><span class="eyebrow">${esc(t('nextStep'))}</span><p>${esc(t(next.text))}</p>${actionButton(next.label,next.text==='nextSale'&&mode==='sandbox'?'advance':'panel',next.text==='nextSale'&&mode==='sandbox'?'data-minutes="60"':`data-panel="${next.panel}"`)}</section>`:day1Card(state,story,{locale,itemName:id=>t(catalog.offerings.find(o=>o.id===id)?.key??id),money},busy||storyBusy,storyReplay)):''}
 ${u.panel?`<aside id="drawer" class="sidebar ${u.panel==='stock'?'stock-sidebar':u.panel==='shelves'?'pricing-sidebar':''}" role="dialog" aria-modal="false" aria-labelledby="panel-title"><header class="panelhead"><h2 id="panel-title" tabindex="-1">${esc(t(u.panel))}</h2><button data-action="hide" class="closepanel" aria-label="${esc(t('closePanel'))}">×</button></header><div class="panelbody" id="panelbody">${panelContent(state,u,busy||storyBusy,story)}</div></aside>`:''}
 <div class="shop-controls"><span class="clock-note">${esc(t(mode==='sandbox'?'sandboxNote':'normalNote'))}</span><div class="control-actions">${actionButton(state.open?'close':'open','open','',true)}${mode==='sandbox'?actionButton('advance60','advance','data-minutes="60"'):actionButton('demo','mode')}</div></div>
 <nav class="dock" aria-label="${esc(t('navShelves'))}">${[['shelves','navShelves'],['stock','navStock'],['report','navReport'],['journal','navJournal'],['settings','more']].map(([p,label])=>`<button data-action="panel" data-panel="${p}" aria-pressed="${u.panel===p}">${icon(p)}<span>${esc(t(label))}</span></button>`).join('')}</nav>
 <p class="camera-hint">${esc(t('camera'))}</p>
 ${u.blocking?`<section class="blocking" role="alert"><p>${esc(t(u.blocking))}</p>${u.blocking==='stale'?actionButton('refresh','reload'):u.blocking==='long_gap'?actionButton('catchup','catchup'):actionButton('retry','retry')}${actionButton('export','export')}</section>`:''}
 ${u.notice?`<div class="message feedback-${esc(u.feedbackKind)}" role="status" aria-live="polite">${esc(u.notice)}</div>`:''}
 ${u.formError&&u.formField==='general'?`<div class="message field-error" role="alert">${esc(u.formError)}</div>`:''}
 ${u.zen?`<button class="zenbtn" data-action="zen">${esc(t('return'))}</button>`:''}
 ${!state.shopName||u.rename?identityForm(state,u,busy):''}`);
 if(activeId&&document.activeElement?.id!==activeId){const replacement=document.getElementById(activeId) as HTMLInputElement|null;if(replacement){replacement.focus({preventScroll:true});if(start!==null&&start!==undefined)try{replacement.setSelectionRange(start,end??start);}catch{}}}
 const rail=document.getElementById('stock-products');if(rail&&u.stock&&Math.abs(rail.scrollTop-u.stock.listTop)>1)rail.scrollTop=u.stock.listTop;if(u.stock)saveStockWorkspace(u.stock,stockWorkspaceKey());
 world?.minimal(u.minimalFX);world?.update(state);world?.selected(u.slot);world?.layout(!!u.panel&&!u.zen);world?.zen(u.zen);
}
function finishReveal(){clearTimeout(revealTimer);if(u.revealFx){u.revealFx=false;draw();}}
function cancelFeedback(){presentationEpoch++;nativePresentation.invalidate(presentationEpoch);world?.skip();finishReveal();u.feedbackKind='';}
function committed(previous:Snapshot,current:Snapshot,cause:string,targetSlot:number,epoch:number){
 const observation=nativePresentation.commit(previous,current,cause,epoch,pendingCommand,resolveMotionPolicy({quality:'high',minimalFx:u.minimalFX,reduceMotion:matchMedia('(prefers-reduced-motion: reduce)').matches,visible:!document.hidden}));
 if(observation?.status==='ignored')return;
 if(cause==='offline-return'||cause==='catchup'){if(!document.hidden&&epoch===presentationEpoch&&current.eventSequence>previous.eventSequence)notice(guidanceText(locale,'offline',{units:current.eventSequence-previous.eventSequence}));return;}
 if(previous.mode!==current.mode||['baseline','reload','retry','import','mode','choose-mode'].includes(cause))world?.baseline?.();
 // Consume every real committed delta even when its presentation became stale.
 const event=feedback.project(previous,current,cause,targetSlot);if(!event)return;
 clearTimeout(revealTimer);u.revealFx=false;u.feedbackKind=event.kind;
 if(event.sold>0){let text=t('sold')+' '+event.sold;const empty=catalog.offerings.filter(o=>previous.inventory[o.id].stock>0&&current.inventory[o.id].stock===0);if(empty.length)text+=' · '+empty.map(o=>t(o.key)).join(', ')+' '+t('soldOut');const accepted=observation?.summary?.accepted;if(accepted?.kind==='stock')text+=' · '+t('bought')+' ×'+accepted.quantity;if(accepted?.kind==='display')text+=' · '+t('placed')+' '+(accepted.slot+1);text+=' · '+day1Text(locale,'misaki')+': '+day1Text(locale,'sale');notice(event.kind==='support'?text+' · '+t('supportReceived'):text);}
 if(document.hidden||epoch!==presentationEpoch)return;
 if(event.accounting&&world?.saleMargin)world.saleMargin({...event.accounting,...saleAccountingText(locale,event.accounting.units),signed:(event.accounting.grossMargin<0?'−':'+')+money(Math.abs(event.accounting.grossMargin))});
 const started=world?.feedback(event)===true;
 if(event.kind==='reveal'&&started){u.revealFx=true;revealTimer=setTimeout(()=>{if(epoch!==presentationEpoch||!u.revealFx)return;world?.skipReveal();finishReveal();},vfx.reveal.duration);}
 if(event.sold>0&&u.sound){saleSound.currentTime=0;void saleSound.play().catch(()=>{});}
}
function fail(e:unknown,field='general'){
 const code=e instanceof Error?e.message:'invalid';
 if(['stale','storage','rollback','long_gap'].includes(code)){u.blocking=code;return;}
 u.formField=field;u.formError=t(code==='cash'?'cashError':code==='price'?'priceError':code==='quantity'?'quantityError':code==='identity'?'identityError':code);
 if(u.formError===code&&!['command_limit','recovery_ineligible','discovery_locked'].includes(code))u.formError=t('invalid');
}
async function run(action:()=>Promise<void>,field='general',success?:()=>void,cause='settle',targetSlot=u.slot){
 // Lock this intent synchronously, before the first await. Double clicks are
 // discarded rather than turned into a queue of fresh purchasing commands.
 if(busy)return;const actionFocus=document.activeElement as HTMLElement|null;const focusItem=actionFocus?.closest?.<HTMLElement>('.stock-row')?.dataset.item;busy=true;pendingCommand=undefined;u.notice='';u.formError='';u.formField='';draw();const previous=state,epoch=presentationEpoch;
 try{await action();u.blocking='';committed(previous,state,cause,targetSlot,epoch);await syncStory();success?.();}catch(e){fail(e,field);}finally{busy=false;storeDraft(mode,u.draft,draftPrefix);draw();if(focusItem&&actionFocus&&document.activeElement===document.body){const next=document.getElementById('place-'+focusItem)??document.getElementById('stock-search');next?.focus({preventScroll:true});}}
}
async function act(kind:string,data:Partial<Command>={}){const command={id:commandId(),kind,...data};pendingCommand={...command};state=await saves.command(state,command,mode==='normal'?Date.now():state.watermark,Date.now());}
function openPanel(p:string,source?:HTMLElement){if(source)focusReturn=source;const changed=u.panel!==p;u.panel=p;u.formError='';draw();if(changed){const body=document.getElementById('panelbody');if(body)body.scrollTop=0;}document.getElementById('panel-title')?.focus({preventScroll:true});}
function closePanel(){u.panel='';u.formError='';draw();focusReturn?.focus({preventScroll:true});}
async function switchMode(next:Mode){
 storeDraft(mode,u.draft,draftPrefix);const loaded=await saves.loadOrCreate(next,next==='sandbox'?Date.parse('2026-10-21T01:00:00Z'):Date.now());mode=next;state=loaded;storyReplay=false;u.draft=draftFor(mode,state,draftPrefix);u.rename=false;u.reportDay='';u.slot=0;u.stock=readStockWorkspace(stockWorkspaceKey());u.formError='';u.notice='';localStorage.setItem(modeKey,mode);returnPending=document.hidden||(mode==='normal'&&Date.now()-state.watermark>=60000);cancelFeedback();
}
app.addEventListener('scroll',e=>{
 const list=e.target as HTMLElement;if(list.id!=='stock-products'||!u.stock||list.dataset.view!==stockViewKey(u.stock))return;
 u.stock.listTop=list.scrollTop;saveStockWorkspace(u.stock,stockWorkspaceKey());
},true);
app.addEventListener('focusin',e=>{const row=(e.target as Element).closest<HTMLElement>('.stock-row');if(row&&u.stock){u.stock.selected=row.dataset.item??'';for(const r of Array.from(row.parentElement?.querySelectorAll<HTMLElement>('.stock-row')??[]))r.setAttribute('aria-current',String(r===row));saveStockWorkspace(u.stock,stockWorkspaceKey());}});
// Disclosure is UI-only. Hover previews; click/tap or native Enter/Space pins it.
app.addEventListener('pointerover',e=>{const target=(e.target as Element).closest('.set-status-card');if(target&&(e as PointerEvent).pointerType==='mouse'&&!u.setInfoOpen){u.setInfoOpen=true;draw();}});
app.addEventListener('pointerout',e=>{const card=(e.target as Element).closest('.set-status-card'),next=(e as PointerEvent).relatedTarget as Node|null;if(card&&!card.contains(next)&&!u.setInfoPinned&&u.setInfoOpen){u.setInfoOpen=false;draw();}});
app.addEventListener('keydown',e=>{if(e.key==='Escape'&&u.setInfoOpen){e.preventDefault();e.stopPropagation();u.setInfoOpen=false;u.setInfoPinned=false;draw();document.getElementById('set-info-toggle')?.focus({preventScroll:true});}});
app.addEventListener('input',e=>{
 const input=e.target as HTMLInputElement;if(input.dataset.quantityId){setQuantity(u.draft,input.dataset.quantityId,input.value);u.formError='';storeDraft(mode,u.draft,draftPrefix);draw();return;}if(input.id==='stock-search'){const w=u.stock??=newStockWorkspace();changeStockView(w,{query:input.value});draw();return;}switch(input.id){case 'qty':u.draft.quantity=input.value;break;case 'shop-name':u.draft.shop=input.value;break;case 'company-name':u.draft.company=input.value;break;case 'shop-logo':u.draft.logo=input.value;break;default:if(input.dataset.priceId){u.draft.prices[input.dataset.priceId]=input.value;u.formError='';u.formField='';input.setAttribute('aria-invalid','false');const note=document.getElementById(input.getAttribute('aria-describedby')??'');if(note){note.textContent='';note.className='price-status muted';note.setAttribute('role','status');}}}
 storeDraft(mode,u.draft,draftPrefix);if(input.id==='qty')draw();
});
app.addEventListener('change',e=>{
 const input=e.target as HTMLInputElement|HTMLSelectElement;
 if(input.id==='locale'){setLocale(input.value);draw();}
 if(input.id==='slot'){u.slot=Number(input.value);draw();}
 if(input.id==='reportDay'){u.reportDay=input.value;draw();}
 if(input.id==='quality'){u.quality=input.value;world?.quality(u.quality);}
 if(input.id==='minimal-fx'){u.minimalFX=(input as HTMLInputElement).checked;savePreferences({minimalFX:u.minimalFX},presentationStorageKey);draw();}
 if(input.id==='sound'){u.sound=(input as HTMLInputElement).checked;if(u.sound)void saleSound.play().catch(()=>{});}
 if(input.id==='import'){const file=(input as HTMLInputElement).files?.[0];if(file)void run(async()=>{state=await saves.import(state,await file.text());u.stock=newStockWorkspace();u.draft=draftFor(mode,state,draftPrefix);returnPending=document.hidden||(mode==='normal'&&Date.now()-state.watermark>=60000);cancelFeedback();},'general',undefined,'import');}
});
for(const event of ['pointerover','focusin'])app.addEventListener(event,e=>{const target=(e.target as Element).closest<HTMLElement>('[data-preview-slot]');if(target)world?.selected(Number(target.dataset.previewSlot));});
for(const event of ['pointerout','focusout'])app.addEventListener(event,e=>{if((e.target as Element).closest('[data-preview-slot]'))world?.selected(u.slot);});
app.addEventListener('submit',e=>{
 if((e.target as HTMLElement).id!=='identity')return;e.preventDefault();
 void run(async()=>{await act('identity',{text:u.draft.shop,company:u.draft.company,logo:u.draft.logo});u.rename=false;},'identity',()=>{notice(t('identitySaved'));});
});
app.addEventListener('click',e=>{
 if(u.setInfoOpen&&!(e.target as Element).closest('.set-status-card')){u.setInfoOpen=false;u.setInfoPinned=false;draw();}
 const target=(e.target as Element).closest<HTMLButtonElement>('button[data-action]');if(!target||target.disabled||target.ariaDisabled==='true')return;const a=target.dataset.action!,id=target.dataset.id!,n=Number(target.dataset.slot??u.slot);
 if(a==='set-info'){u.setInfoPinned=!u.setInfoPinned;u.setInfoOpen=u.setInfoPinned;draw();return;}if(a==='set-info-close'){u.setInfoOpen=false;u.setInfoPinned=false;draw();document.getElementById('set-info-toggle')?.focus({preventScroll:true});return;}
 if(a.startsWith('story-')){
  const beat=(target.dataset.beat??'welcome') as BeatId;
  if(a==='story-open'){if(busy||state.open)return;void run(async()=>{if(!state.open)await act('open');},'general',undefined,'open');return;}
  if(a==='story-read'||a==='story-skip'||a==='story-dismiss'){void storyAction(beat,a==='story-read'?'read':a==='story-skip'?'skip':'dismiss');return;}
  if(a==='story-report-read'){void storyAction('report','read').then(ok=>{if(ok){closePanel();document.getElementById('day1-heading')?.focus({preventScroll:true});}});return;}
  if(a==='story-replay'){void storyAction('welcome','reopen').then(ok=>{if(ok){storyReplay=true;closePanel();document.querySelector<HTMLButtonElement>('#day1-story button[data-action="story-read"]')?.focus({preventScroll:true});}});return;}
  if(a==='story-report'){u.reportDay=day1View(state,story??emptyStory(state)).day;openPanel('report',target);return;}
  if(a==='story-journal'){openPanel('journal',target);return;}
  if(a==='story-stock'){openPanel('stock',target);return;}
  if(a==='story-shelves'){openPanel('shelves',target);return;}
  if(a==='story-settings'){openPanel('settings',target);return;}
  if(a==='story-sandbox'){void run(async()=>{state=await saves.settle(state,state.watermark+15*60000,Date.now());},'general',undefined,'advance');return;}
 }
 if(a==='stock-filter'){const w=u.stock??=newStockWorkspace();changeStockView(w,{filter:target.dataset.filter as typeof w.filter});draw();return;}
 if(a==='stock-picker'){const w=u.stock??=newStockWorkspace();w.picker=w.picker===id?'':id;draw();return;}
 if(a==='stock-step'||a==='stock-quantity'){const raw=quantityDraft(u.draft,id),q=parseQuantity(raw);if(a==='stock-quantity')setQuantity(u.draft,id,target.dataset.quantity!);else if(q!==undefined)setQuantity(u.draft,id,String(Math.max(1,Math.min(1000,q+Number(target.dataset.step)))));u.formError='';storeDraft(mode,u.draft,draftPrefix);draw();return;}
 if(a==='panel'){openPanel(target.dataset.panel!,target);return;}if(a==='hide'){closePanel();return;}
 if(a==='select-slot'){u.slot=n;draw();return;}if(a==='stock-slot'){u.slot=n;openPanel('stock',target);return;}
 if(a==='skip-reveal'){cancelFeedback();draw();return;}
 if(a==='zen'){u.zen=!u.zen;draw();return;}
 if(a==='camera-shop'||a==='camera-staff'){world?.view(a==='camera-shop'?'shop':'staff');closePanel();return;}
 if(a==='cancel-price'){delete u.draft.prices[id];u.formError='';storeDraft(mode,u.draft,draftPrefix);draw();return;}
 if(a==='rename'){u.rename=true;u.draft.shop=state.shopName;u.draft.company=state.companyName;u.draft.logo=state.logo;draw();document.getElementById('shop-name')?.focus();return;}
 if(a==='cancel-identity'){u.rename=false;draw();return;}
 if(a==='export'){download(JSON.stringify(state,null,2),`little-shop-${mode}.json`);return;}
 const field=a==='buy'?'buy-'+id:a==='price'?'price-'+n:'general';
 let purchase:ReturnType<typeof capturePurchase>|undefined;if(a==='buy'){try{purchase=capturePurchase(state,u.draft,id);}catch(e){fail(e,field);draw();return;}}
 let pricing:ReturnType<typeof capturePrice>|undefined;if(a==='price'){try{pricing=capturePrice(state,u.draft,id);}catch(e){fail(e,field);draw();return;}}
 void run(async()=>{
  switch(a){
   case 'buy':{const intent=purchase!;if(intent.mode!==mode)throw Error('invalid');await act('buy',{itemId:intent.itemId,quantity:intent.quantity});const w=u.stock??=newStockWorkspace();w.recent[intent.itemId]=true;if(!state.shelves.includes(intent.itemId))w.picker=intent.itemId;notice(t(catalog.offerings.find(o=>o.id===intent.itemId)!.key)+' ×'+intent.quantity+' · '+t('bought'));break;}
   case 'display':{if(state.inventory[id].stock===0)throw Error('displayEmptyError');const oldSlot=state.shelves.indexOf(id);await act('display',{itemId:id,slot:n});if(u.stock){delete u.stock.recent[id];u.stock.picker='';}notice(oldSlot>=0&&oldSlot!==n?day1Text(locale,'moveShelf',{from:oldSlot+1,to:n+1}):t('placed')+' '+(n+1)+' · '+t('replacedNote'));break;}
   case 'price':{const intent=pricing!;if(intent.mode!==mode)throw Error('invalid');await act('price',{itemId:intent.itemId,price:intent.price});clearCommittedPriceDraft(u.draft,intent);u.formField=field;notice(t('priceSaved'));break;}
   case 'clear':await act('clear',{slot:n});break;
   case 'open':await act('open');break;
   case 'reveal':await act('reveal');u.panel='journal';notice(t('completeTitle'));break;
   case 'recover':await act('recover');u.draft.quantity='5';u.panel='stock';notice(t('supportReceived'));break;
   case 'advance':state=await saves.settle(state,state.watermark+Number(target.dataset.minutes)*60000,Date.now());break;
   case 'sandbox-enter':await switchMode('sandbox');break;
   case 'sandbox-hours':if(mode==='sandbox'){const time=nextSandboxOpening(state);if(time>state.watermark)state=await saves.settle(state,time,Date.now());}break;
   case 'mode':await switchMode(mode==='normal'?'sandbox':'normal');break;
   case 'choose-mode':if(target.dataset.mode!==mode)await switchMode(target.dataset.mode as Mode);break;
   case 'reload':{cancelFeedback();const loaded=await saves.read(mode);if(loaded)state=loaded;returnPending=document.hidden||(mode==='normal'&&Date.now()-state.watermark>=60000);break;}
   case 'catchup':state=await saves.settle(state,Math.min(Date.now(),state.watermark+86400000),Date.now());break;
   case 'retry':if(mode==='normal')state=await saves.settle(state,Date.now(),Date.now());else state=(await saves.read(mode))!;break;
  }
 },field,undefined,a,n);
});
document.addEventListener('keydown',e=>{
 if(e.key==='Escape'){if(u.rename){u.rename=false;draw();}else if(state?.shopName)closePanel();}
 if(e.key==='Tab'&&document.querySelector('.modalshade')){const focusables=Array.from(document.querySelectorAll<HTMLElement>('.modal button:not(:disabled),.modal input'));const first=focusables[0],last=focusables.at(-1);if(e.shiftKey&&document.activeElement===first){last?.focus();e.preventDefault();}else if(!e.shiftKey&&document.activeElement===last){first?.focus();e.preventDefault();}}
});
function resume(reason:'timer'|'return'='timer'){
 if(!state||!saves||mode!=='normal'||document.hidden||busy||['stale','storage','long_gap'].includes(u.blocking))return;
 const now=Date.now();if(now-state.watermark>=60000||now<state.lastWallTime||u.blocking==='rollback'){const cause=returnPending||reason==='return'?'offline-return':'settle';returnPending=false;void run(async()=>{state=await saves.settle(state,now,now);},'general',undefined,cause);}
}
async function boot(){
 // Record cancellation before any awaited startup work or actionable UI.
 document.addEventListener('visibilitychange',()=>{if(document.hidden){returnPending=true;cancelFeedback();draw();}else resume('return');});window.addEventListener('blur',()=>{returnPending=true;});window.addEventListener('focus',()=>resume('return'));
 const core=await loadCore();saves=new Saves(await database(artReview?reviewDatabase:"next-stop-little-shop-w1"),core);state=await saves.loadOrCreate(mode,mode==='sandbox'?Date.parse('2026-10-21T01:00:00Z'):Date.now());nativePresentation.baseline(state,presentationEpoch);u.draft=draftFor(mode,state,draftPrefix);await syncStory();draw();readyMs=performance.now()-started;
 try{const {createWorld}=await import('./world');world=await createWorld(canvas,n=>{u.slot=n;openPanel('shelves');},finishReveal,nativePresentation);world.update(state);world.layout(!!u.panel);worldReadyMs=performance.now()-started;}catch(e){console.error(e);u.worldFailed=true;}
 draw();if(!state.shopName)document.getElementById('shop-name')?.focus();
 setInterval(()=>resume('timer'),10000);resume('return');
 canvas.addEventListener('world-error',()=>{cancelFeedback();world?.dispose();world=undefined;u.worldFailed=true;draw();});
 Object.assign(window,{littleShopDiagnostics:()=>({core:'PORT_REQUIRED_FOR_UNITY',artReview,uiReadyMs:readyMs,startupMs:worldReadyMs,worldReady:!!world&&!u.worldFailed,worldEverReady:worldReadyMs!==null,worldAvailable:!!world&&!u.worldFailed,world:world?.metrics(),userAgent:navigator.userAgent,resources:performance.getEntriesByType('resource').map(e=>({name:e.name,duration:e.duration,transferSize:(e as PerformanceResourceTiming).transferSize,encodedBodySize:(e as PerformanceResourceTiming).encodedBodySize}))})});
}
boot().catch(e=>{console.error(e);app.innerHTML=`<main class="boot"><h2>${esc(t('loadError'))}</h2><p>${esc(t('recovery'))}</p><button id="raw">${esc(t('rawExport'))}</button></main>`;document.getElementById('raw')!.onclick=()=>{if(!saves)return;const tx=saves.db.transaction('saves','readonly'),r=tx.objectStore('saves').get('shop.w1.'+mode);r.onsuccess=()=>download(JSON.stringify(r.result,null,2),'little-shop-raw-recovery.json');};});
