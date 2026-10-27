// Independent headless browser; never attaches to user windows or profiles.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const{pathToFileURL}=require('node:url');
const runtime=process.env.CODEX_NODE_MODULES;assert(runtime,'Use existing bundled Playwright; no installation');
const{chromium}=require(path.join(runtime,'playwright'));
const repo=path.resolve(__dirname,'../..');process.chdir(repo);
const out=path.resolve(process.env.QA_OUTPUT||'docs/reviews/evidence/misaki-grayform-v1-r9');fs.mkdirSync(out,{recursive:true});
const digest=b=>crypto.createHash('sha256').update(b).digest('hex');
const assets={r8:fs.readFileSync(process.env.R8_GLB),r9:fs.readFileSync('public/assets/misaki-grayform-v1/misaki-grayform.glb')};
assert.equal(digest(assets.r8),'0da0ef622a775aaa8d75b951cd8d8705bfc1bf73fd0ea94965216e722b7fc2f8');
const report={startedUtc:new Date().toISOString(),headless:true,independentBrowser:true,freshContexts:true,errors:[],screenshots:[],loadedAssets:[],limits:['No existing profile/window/display controlled','Grayform review fixture; production staff and player saves unchanged','No visual acceptance, collision/rig, sustained FPS or native-device certification','Original is a three-quarter illustration; front render is not an exact original front view']};
async function prepare(context,revision){
 await context.route('**/assets/misaki-grayform-v1/misaki-grayform.glb',route=>route.fulfill({status:200,contentType:'model/gltf-binary',body:assets[revision]}));
 const p=await context.newPage();p.setDefaultTimeout(180000);p.on('pageerror',e=>report.errors.push({revision,message:e.message}));
 p.on('response',r=>{if(new URL(r.url()).pathname.endsWith('/assets/misaki-grayform-v1/misaki-grayform.glb'))report.loadedAssets.push(r.body().then(b=>({revision,sha256:digest(b),bytes:b.length,status:r.status()})));});
 return p;
}
async function shot(p,file){const b=await p.screenshot({path:path.join(out,file)});report.screenshots.push({file,sha256:digest(b),bytes:b.length});}
async function save(p,mode){return p.evaluate(mode=>new Promise((resolve,reject)=>{const q=indexedDB.open('next-stop-little-shop-w1');q.onerror=()=>reject(q.error?.message);q.onsuccess=()=>{const d=q.result;if(!d.objectStoreNames.contains('saves')){d.close();resolve(null);return;}const r=d.transaction('saves','readonly').objectStore('saves').get('shop.w1.'+mode);r.onsuccess=()=>{resolve(r.result??null);d.close();};};}),mode);}
async function gpu(p){return p.evaluate(()=>{const gl=document.querySelector('canvas')?.getContext('webgl2');if(!gl)return null;const ext=gl.getExtension('WEBGL_debug_renderer_info');return {webgl2:true,renderer:ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER)};});}
(async()=>{let server,browser;try{
 const vite=await import(pathToFileURL(path.join(repo,'node_modules/vite/dist/node/index.js')).href);
 server=await vite.createServer({root:repo,server:{host:'127.0.0.1',port:0,strictPort:true},logLevel:'error'});await server.listen();const base='http://127.0.0.1:'+server.httpServer.address().port;
 browser=await chromium.launch({executablePath:process.env.QA_CHROME||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});report.browser=browser.version();report.studio={};report.game={};
 for(const revision of ['r8','r9']){
  const context=await browser.newContext({viewport:{width:720,height:900}}),p=await prepare(context,revision);
  await p.goto(base+'/tools/asset-foundation/studio-misaki-gray.html');await p.waitForFunction(()=>window.misakiGrayStudio?.ready);
  // Text-only capture label; both revisions still execute the identical,
  // byte-frozen studio module, cameras, lights and materials.
  await p.locator('label').evaluate((label,r)=>label.innerHTML='Misaki / hair '+r.toUpperCase()+'<br>Canonical only<br>Side/back inferred',revision);
  report.studio[revision]={gpu:await gpu(p),details:await p.evaluate(()=>({lighting:window.misakiGrayStudio.lighting,source:window.misakiGrayStudio.source})),captureLabelOnly:revision.toUpperCase(),views:[]};
  for(const view of ['front','threequarter','side','back']){await p.evaluate(v=>window.misakiGrayStudio.view(v),view);await p.evaluate(()=>window.misakiGrayStudio.afterRender());const file=revision+'-'+view+'.png';await shot(p,file);report.studio[revision].views.push(file);}
  await context.close();console.log(revision+' four studio views captured');
 }
 assert.deepEqual(report.studio.r9.details,report.studio.r8.details);assert.deepEqual(report.studio.r9.gpu,report.studio.r8.gpu);
 if(!process.argv.includes('--studio-only'))for(const revision of ['r8','r9']){
  const context=await browser.newContext({viewport:{width:1280,height:900},reducedMotion:'reduce'}),p=await prepare(context,revision);
  await p.goto(base+'/tools/asset-foundation/gameplay-misaki-gray.html');await p.locator('[data-mode="sandbox"]').click();
  await p.waitForFunction(()=>document.querySelector('[data-mode="sandbox"]').ariaPressed==='true'&&!document.querySelector('#identity button[type="submit"]').disabled);
  await p.locator('#shop-name').fill('Isolated hair form comparison');await p.locator('#identity button[type="submit"]').click();await p.waitForFunction(()=>window.misakiGrayform?.ready);
  if(await p.locator('[data-action="story-dismiss"]').isVisible())await p.locator('[data-action="story-dismiss"]').click();
  const normal=await save(p,'normal');await p.locator('[data-action="panel"][data-panel="settings"]').click();await p.locator('#quality').selectOption('high');await p.locator('[data-action="hide"]').click();
  for(const[name,side]of[['normal',0],['oblique-left',-1],['oblique-right',1]]){
   await p.evaluate(s=>window.foundation.oblique(s),side);await p.evaluate(()=>window.foundation.afterRender());await shot(p,revision+'-game-'+name+'.png');
   if(side===0)report.game[revision]=await p.evaluate(()=>{const d=window.littleShopDiagnostics().world;return{camera:d.cameraPose,quality:d.quality,grayform:window.misakiGrayform,foundation:window.foundation.lighting,paper:window.paperFoundation.lighting,renderer:d.renderer};});
  }
  if(revision==='r9'){
   await p.locator('[data-action="panel"][data-panel="stock"]').click();const row=p.locator('[data-item="off.mug"]');await row.locator('input').fill('3');const before=await save(p,'sandbox');
   await row.locator('[data-action="buy"]').click();await p.waitForFunction(()=>document.querySelector('.stock-workspace').ariaBusy==='false');if(!await row.locator('.shelf-picker').count())await row.locator('[data-action="stock-picker"]').click();await row.locator('[data-action="display"][data-slot="2"]').click();await p.waitForFunction(()=>document.querySelector('.stock-workspace').ariaBusy==='false');
   const after=await save(p,'sandbox');assert.equal(after.cash,before.cash-210);assert.equal(after.inventory['off.mug'].stock,3);assert.equal(after.shelves[2],'off.mug');await p.locator('[data-action="hide"]').click();await p.reload();await p.waitForFunction(()=>window.misakiGrayform?.ready);assert.deepEqual(await save(p,'sandbox'),after);assert.deepEqual(await save(p,'normal'),normal);
   await p.locator('[data-action="panel"][data-panel="settings"]').click();await p.locator('#quality').selectOption('low');await p.locator('#quality').selectOption('high');await p.locator('[data-action="hide"]').click();assert.equal(await p.evaluate(()=>window.misakiGrayform.ready),true);
   report.lifecycle={buy3:true,cashBefore:before.cash,cashAfter:after.cash,stock:3,shelf:2,reloadExact:true,normalUnchanged:true,lowHighRetained:true};
  }
  await context.close();console.log(revision+' normal and two oblique gameplay captures complete');
 }
 if(report.game.r9){for(const k of ['camera','quality','foundation','paper'])assert.deepEqual(report.game.r9[k],report.game.r8[k],k+' comparison frozen');assert.deepEqual(report.game.r9.grayform.lighting,report.game.r8.grayform.lighting);}
 report.loadedAssets=await Promise.all(report.loadedAssets);for(const a of report.loadedAssets)assert.equal(a.sha256,digest(assets[a.revision]));assert.deepEqual(report.errors,[]);
 report.assetSha256=Object.fromEntries(Object.entries(assets).map(([k,b])=>[k,digest(b)]));report.finishedUtc=new Date().toISOString();fs.writeFileSync(path.join(out,'capture.json'),JSON.stringify(report,null,2)+'\n');console.log('PASS same-renderer asset/camera/light comparison; '+report.screenshots.length+' captures');
}finally{await browser?.close();await server?.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
