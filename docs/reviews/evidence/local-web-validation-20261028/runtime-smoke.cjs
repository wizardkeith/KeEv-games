const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const {pathToFileURL} = require('node:url');
const runtime = process.env.CODEX_NODE_MODULES;
assert(runtime, 'Set CODEX_NODE_MODULES to the existing bundled dependency directory; no download is performed');
const {chromium} = require(path.join(runtime, 'playwright'));
const {PNG} = require(path.join(runtime, 'pngjs'));
const repo = path.resolve(process.env.KEEV_REPO || path.join(__dirname, '../KeEv-games-handoff'));
const out = path.resolve(process.env.QA_OUTPUT || path.join(__dirname, 'runtime'));
fs.mkdirSync(out,{recursive:true});
process.chdir(repo);
const report = {startedUtc:new Date().toISOString(),headless:true,independentBrowserProcess:true,contexts:'Fresh nonpersistent contexts; no existing browser/profile attached',errors:[],requestFailures:[],limitations:['Development authoring fixture is not adopted production art','No physical-device, sustained FPS, audio or visual acceptance claim']};
const digest = data => crypto.createHash('sha256').update(data).digest('hex');
const glb = fs.readFileSync(path.join(repo,'public/assets/misaki-grayform-v1/misaki-grayform.glb'));
assert.equal(digest(glb),'29f4ff9e8711f80cef1f5d899d9c5f0fab0facbf1841274678313581998bb823');
const expectedSha = digest(glb);
const captures = [];
function watch(page,label) {
  page.setDefaultTimeout(180000);
  page.on('pageerror',error => report.errors.push({page:label,message:error.message}));
  page.on('requestfailed',request => report.requestFailures.push({page:label,path:new URL(request.url()).pathname,error:request.failure()?.errorText}));
  page.on('response',response => {
    if(new URL(response.url()).pathname.endsWith('/assets/misaki-grayform-v1/misaki-grayform.glb')) captures.push(response.body().then(bytes => ({page:label,status:response.status(),bytes:bytes.length,sha256:digest(bytes)})));
  });
}
async function screenshot(page,file) {
  const bytes=await page.screenshot({path:path.join(out,file)});
  const png=PNG.sync.read(bytes),colors=new Set();
  for(let i=0;i<png.data.length;i+=16) colors.add(png.data.subarray(i,i+3).toString('hex'));
  assert(colors.size>50,'Rendered capture unexpectedly uniform');
  return {file,width:png.width,height:png.height,bytes:bytes.length,sampledColors:colors.size,sha256:digest(bytes)};
}
async function modeSave(page,mode) {
  return page.evaluate(mode=>new Promise((resolve,reject)=>{
    const request=indexedDB.open('next-stop-little-shop-w1');
    request.onerror=()=>reject(request.error?.message);
    request.onsuccess=()=>{const db=request.result;if(!db.objectStoreNames.contains('saves')){db.close();resolve(null);return;}const read=db.transaction('saves','readonly').objectStore('saves').get('shop.w1.'+mode);read.onsuccess=()=>{resolve(read.result??null);db.close();};read.onerror=()=>reject(read.error?.message);};
  }),mode);
}
async function enterSandbox(page,name) {
  await page.locator('[data-mode="sandbox"]').click();
  await page.waitForFunction(()=>document.querySelector('[data-mode="sandbox"]').ariaPressed==='true'&&!document.querySelector('#identity button[type="submit"]').disabled);
  await page.locator('#shop-name').fill(name);
  await page.locator('#identity button[type="submit"]').click();
  await page.waitForFunction(()=>window.littleShopDiagnostics?.().worldReady);
  if(await page.locator('[data-action="story-dismiss"]').isVisible())await page.locator('[data-action="story-dismiss"]').click();
}
async function gpu(page) {
  return page.evaluate(()=>{const canvas=document.querySelector('canvas'),gl=canvas?.getContext('webgl2');if(!gl)return {webgl2:false};const ext=gl.getExtension('WEBGL_debug_renderer_info');return {webgl2:true,version:gl.getParameter(gl.VERSION),vendor:gl.getParameter(gl.VENDOR),renderer:gl.getParameter(gl.RENDERER),unmaskedRenderer:ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):null};});
}
(async()=>{
  let dev,production,browser;
  try {
    const vite=await import(pathToFileURL(path.join(repo,'node_modules/vite/dist/node/index.js')).href);
    dev=await vite.createServer({root:repo,server:{host:'127.0.0.1',port:0,strictPort:true},logLevel:'error'});
    await dev.listen();
    const base='http://127.0.0.1:'+dev.httpServer.address().port;
    browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
    report.browserVersion=browser.version();
    const studio=await browser.newContext({viewport:{width:720,height:900}}),s=await studio.newPage();watch(s,'studio');
    await s.goto(base+'/tools/asset-foundation/studio-misaki-gray.html');
    await s.waitForFunction(()=>window.misakiGrayStudio?.ready);
    await s.evaluate(()=>window.misakiGrayStudio.view('threequarter'));
    await s.evaluate(()=>window.misakiGrayStudio.afterRender());
    report.studio={ready:true,gpu:await gpu(s),details:await s.evaluate(()=>({source:window.misakiGrayStudio.source,lighting:window.misakiGrayStudio.lighting})),screenshot:await screenshot(s,'studio-threequarter.png')};
    await studio.close();
    const context=await browser.newContext({viewport:{width:1280,height:900},reducedMotion:'reduce'}),g=await context.newPage();watch(g,'game-authoring');
    await g.goto(base+'/tools/asset-foundation/gameplay-misaki-gray.html');
    await enterSandbox(g,'Local isolated pipeline check');
    await g.waitForFunction(()=>window.misakiGrayform?.ready);
    const normal=await modeSave(g,'normal');
    const before=await modeSave(g,'sandbox');
    assert.equal(before.cash,5000);
    await g.locator('[data-action="panel"][data-panel="settings"]').click();
    await g.locator('#quality').selectOption('high');
    await g.locator('[data-action="hide"]').click();
    await g.evaluate(()=>window.foundation.afterRender());
    const fixture=await g.evaluate(()=>window.misakiGrayform);
    assert.equal(fixture.triangles,49368);
    report.game={worldReady:true,fixture,gpu:await gpu(g),renderer:await g.evaluate(()=>window.littleShopDiagnostics().world.renderer),screenshot:await screenshot(g,'game-authoring.png')};
    await g.locator('[data-action="panel"][data-panel="stock"]').click();
    const row=g.locator('[data-item="off.mug"]');
    await row.locator('input').fill('3');
    await row.locator('[data-action="buy"]').click();
    await g.waitForFunction(()=>document.querySelector('.stock-workspace').ariaBusy==='false');
    if(!await row.locator('.shelf-picker').count())await row.locator('[data-action="stock-picker"]').click();
    await row.locator('[data-action="display"][data-slot="2"]').click();
    await g.waitForFunction(()=>document.querySelector('.stock-workspace').ariaBusy==='false');
    const after=await modeSave(g,'sandbox');
    assert.equal(after.cash,4790);assert.equal(after.inventory['off.mug'].stock,3);assert.equal(after.shelves[2],'off.mug');
    await g.reload();await g.waitForFunction(()=>window.misakiGrayform?.ready&&window.littleShopDiagnostics?.().worldReady);
    assert.deepEqual(await modeSave(g,'sandbox'),after);
    assert.deepEqual(await modeSave(g,'normal'),normal);
    await g.locator('[data-action="panel"][data-panel="settings"]').click();
    await g.locator('#quality').selectOption('low');await g.locator('#quality').selectOption('high');
    await g.locator('[data-action="hide"]').click();
    assert.equal(await g.evaluate(()=>window.misakiGrayform.ready),true);
    report.lifecycle={isolatedSandbox:true,cashBefore:before.cash,cashAfter:after.cash,stock:3,shelf:2,reloadEqual:true,lowHighReady:true,isolatedNormalUnchanged:true,originalPlayerProfilesAccessed:false};
    await context.close();
    production=await vite.preview({root:repo,preview:{host:'127.0.0.1',port:0,strictPort:true},logLevel:'error'});
    const productionBase='http://127.0.0.1:'+production.httpServer.address().port;
    const prod=await browser.newContext({viewport:{width:1024,height:768},reducedMotion:'reduce'}),p=await prod.newPage();watch(p,'production');
    await p.goto(productionBase+'/');await enterSandbox(p,'Local production isolated check');
    report.production={worldReady:true,core:await p.evaluate(()=>window.littleShopDiagnostics().core),renderer:await p.evaluate(()=>window.littleShopDiagnostics().world.renderer),gpu:await gpu(p),screenshot:await screenshot(p,'production.png'),authoringFixtureAbsent:await p.evaluate(()=>!window.misakiGrayform)};
    assert.equal(report.production.authoringFixtureAbsent,true);
    await prod.close();
    report.assetResponses=await Promise.all(captures);
    for(const label of ['studio','game-authoring'])assert(report.assetResponses.some(r=>r.page===label&&r.status===200&&r.bytes===902132&&r.sha256===expectedSha),'Missing matching actual asset response: '+label);
    report.distAssetSha256=digest(fs.readFileSync(path.join(repo,'dist/assets/misaki-grayform-v1/misaki-grayform.glb')));
    assert.equal(report.distAssetSha256,expectedSha);
    assert.deepEqual(report.errors,[]);
    report.passed=true;
  } catch(error) { report.passed=false;report.failure={name:error.name,message:error.message,stack:error.stack};throw error; }
  finally {
    if(browser)await browser.close();
    if(dev)await dev.close();
    if(production)await new Promise(resolve=>production.httpServer.close(resolve));
    report.finishedUtc=new Date().toISOString();report.browserClosed=true;report.localServersClosed=true;
    fs.writeFileSync(path.join(out,'runtime-report.json'),JSON.stringify(report,null,2)+'\n');
    console.log(JSON.stringify({passed:report.passed,errors:report.errors,assetResponses:report.assetResponses,production:report.production?.worldReady,browserClosed:true,serversClosed:true}));
  }
})().catch(error=>{console.error(error);process.exitCode=1;});
