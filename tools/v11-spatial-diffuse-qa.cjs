const assert=require('node:assert/strict'),fs=require('node:fs');
module.exports=async(p,expected,out,name)=>{
 const verify=async()=>{const d=await p.evaluate(()=>window.littleShopDiagnostics());assert.equal(d.world.sceneWindow.mode,'reach');assert.equal(d.world.sourceSeparation.mode,'off');assert.equal(d.world.spatialDiffuse.mode,expected);if(expected==='on'){assert.equal(d.world.spatialDiffuse.environmentIntensity,1);assert.ok(d.world.spatialDiffuse.receivers.length>=3);for(const r of d.world.spatialDiffuse.receivers){assert.equal(r.pluginApplied,true);assert.equal(r.compiled.hasWorldField,true);assert.equal(r.compiled.hemisphereCalls,2);assert.equal(r.compiled.irradianceCalls,1);assert.equal(r.compiled.specularFieldModification,false);}}return d;};
 await require('./v11-occlusion-qa.cjs')(p,true);await verify();
 if(process.env.QA_SPATIAL_QUALITY==='1'){
  const phases=[];
  for(const q of['low','high']){await p.locator('[data-action="panel"][data-panel="settings"]').click();await p.locator('#quality').selectOption(q);await p.locator('[data-action="hide"]').click();await require('./v11-occlusion-qa.cjs')(p,q==='high');await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));const d=await verify();assert.equal(d.world.quality,q);phases.push({quality:q,spatialDiffuse:d.world.spatialDiffuse,sceneOcclusion:d.world.sceneOcclusion,sceneWindow:d.world.sceneWindow});await p.screenshot({path:out+'/'+name+'-'+q+'-quality.png'});}
  fs.writeFileSync(out+'/'+name+'-quality.json',JSON.stringify(phases,null,2));
 }
};
