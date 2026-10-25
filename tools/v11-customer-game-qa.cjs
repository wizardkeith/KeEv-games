/** Actual production game, UI-created isolated Sandbox and ordinary camera
 * wheel input. No synthetic pose, injected inventory or transaction. */
const {chromium}=require('playwright'),fs=require('fs'),assert=require('node:assert/strict');
const out=process.env.QA_OUTPUT||'/workspace/qa/v11-slice/customer-game';fs.mkdirSync(out,{recursive:true});
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});try{
 const results=[];
 for(const [name,url]of [['before',process.env.QA_BEFORE],['after',process.env.QA_AFTER]]){
  const c=await b.newContext({viewport:{width:1280,height:900}}),p=await c.newPage(),errors=[];p.setDefaultTimeout(90000);p.on('pageerror',e=>errors.push(String(e)));
  await p.goto(url);await p.locator('[data-mode="sandbox"]').click();await p.waitForFunction(()=>document.querySelector('[data-mode="sandbox"]').ariaPressed==='true'&&!document.querySelector('#identity button[type="submit"]').disabled);await p.locator('#shop-name').fill('顧客模型 · 遊戲實拍');await p.locator('#identity button[type="submit"]').click();await p.waitForFunction(()=>window.littleShopDiagnostics?.().worldReady);
  if(await p.locator('[data-action="story-dismiss"]').isVisible())await p.locator('[data-action="story-dismiss"]').click();
  await p.locator('[data-action="panel"][data-panel="settings"]').click();await p.locator('#quality').selectOption('high');await p.locator('[data-action="hide"]').click();
  await p.locator('[data-action="open"]').click();await p.waitForFunction(()=>window.littleShopDiagnostics().world.customers.some(a=>a.id==='visitor-b'&&a.state==='browsing'),undefined,{timeout:120000});
  await p.mouse.move(600,450);await p.mouse.wheel(0,-2400);await p.waitForTimeout(3000);
  const d=await p.evaluate(()=>window.littleShopDiagnostics());await p.screenshot({path:out+'/'+name+'-female-in-game.png'});
  assert.deepEqual(errors,[]);results.push({name,url,diagnostic:d,errors,provenance:'Actual production WebGL shop and naturally browsing visitor-b, normal shop view with ordinary wheel zoom input; no pose or simulation injection, no sales claimed'});await c.close();
 }
 const a=results[0].diagnostic.world.cameraPose,z=results[1].diagnostic.world.cameraPose;assert.deepEqual(a,z,'same actual player camera pose');fs.writeFileSync(out+'/results.json',JSON.stringify({results,matchedCamera:true,limits:'Natural browsing phase can differ. Cloud SwiftShader only; not physical GPU/FPS/audio/native. Original target remains unaccepted.'},null,2));
}finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
