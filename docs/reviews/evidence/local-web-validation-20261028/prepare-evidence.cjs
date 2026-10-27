const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const assert=require('node:assert/strict');
const repo=path.resolve(__dirname,'../KeEv-games-handoff');
const out=path.join(repo,'docs/reviews/evidence/local-web-validation-20261028');
fs.mkdirSync(out,{recursive:true});
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const sanitize=text=>text.replaceAll(repo,'<checkout>').replaceAll(repo.replaceAll('\\','/'),'<checkout>').replaceAll(path.dirname(repo),'<task>').replaceAll(path.dirname(repo).replaceAll('\\','/'),'<task>').replace(/\r\n/g,'\n').replace(/^\uFEFF/,'').replace(/\x1b\[[0-9;]*m/g,'');
const copies=['dependency-audit.json','command-results-final.json','preservation-report.json','native-glb-difference.json','audit-dependencies.cjs','diagnose-native-glb.mjs','runtime-smoke.cjs','restore-canonical-checkout.cjs','finish-validation.cjs','prepare-evidence.cjs','test-final.log','build-final.log','validate-final.log','replay-final.log','asset-check-final.log','authoring-types.log','esbuild-hoisted-rebuild.log','pnpm-hoisted-install.log','windows-esbuild-shim.log','current-evidence__native-v4__locomotion-after.json'];
for(const name of copies){
  const text=fs.readFileSync(path.join(__dirname,name),'utf8');
  const clean=name.endsWith('.log')?sanitize(text).replace(/[ \t]+$/gm,''):sanitize(text);fs.writeFileSync(path.join(out,name),clean);
  if(name.endsWith('.json'))JSON.parse(clean);
}
const canonical=JSON.parse(fs.readFileSync(path.join(__dirname,'canonical-checkout-report.json'),'utf8'));
fs.writeFileSync(path.join(out,'canonical-checkout-summary.json'),JSON.stringify({baseline:canonical.head,normalizedFiles:canonical.normalizedFiles,onlyExactGitBlobReconstruction:canonical.onlyExactGitBlobReconstruction,authoredConfigurationRetained:canonical.authoredConfigurationRetained,priorHistoricalEvidenceRestored:canonical.priorHistoricalEvidenceRestored,fullTaskRecordSha256:hash(fs.readFileSync(path.join(__dirname,'canonical-checkout-report.json')))},null,2)+'\n');
const r6=fs.readFileSync(path.join(__dirname,'misaki-r6/asset-validation.json'),'utf8');
fs.writeFileSync(path.join(out,'misaki-r6-validation.json'),sanitize(r6));
const runtime=JSON.parse(fs.readFileSync(path.join(__dirname,'runtime/runtime-report.json'),'utf8'));
assert.equal(runtime.passed,true);assert.deepEqual(runtime.errors,[]);assert.deepEqual(runtime.requestFailures,[]);
fs.writeFileSync(path.join(out,'runtime-report.json'),JSON.stringify(runtime,null,2)+'\n');
for(const capture of [runtime.studio.screenshot,runtime.game.screenshot,runtime.production.screenshot]){
  const bytes=fs.readFileSync(path.join(__dirname,'runtime',capture.file));assert.equal(hash(bytes),capture.sha256);fs.writeFileSync(path.join(out,capture.file),bytes);
}
const results=JSON.parse(fs.readFileSync(path.join(__dirname,'command-results-final.json'),'utf8'));
const test=fs.readFileSync(path.join(__dirname,'test-final.log'),'utf8');
assert(/tests 302/.test(test)&&/pass 301/.test(test)&&/fail 1/.test(test));
const protectedFiles=['package.json','package-lock.json','assets/authoring/misaki-grayform-v1/misaki-grayform.blend','public/assets/misaki-grayform-v1/misaki-grayform.glb'];
const summary={recordedUtc:new Date().toISOString(),baseline:'0638d652ebdca1280320fb93058bc5167bb2e2ca',node:process.version,pnpm:'11.25.0',dependencyInstallUserApproved:true,onlyAllowedLifecycle:'esbuild@0.25.12 postinstall',unchangedSuite:{tests:302,passed:301,failed:1,skipped:0},commands:results,authoringStrictTypecheckExitCode:0,headlessRuntimePassed:runtime.passed,headlessBrowserClosed:runtime.browserClosed,localServersClosed:runtime.localServersClosed,originalPlayerProfilesAccessed:false,guiInputHoldMaintained:true,protectedSha256:Object.fromEntries(protectedFiles.map(file=>[file,hash(fs.readFileSync(path.join(repo,file)))])),noNewArt:true,noPublicDeployment:true,reusableDependenciesRetained:true};
fs.writeFileSync(path.join(out,'validation-summary.json'),JSON.stringify(summary,null,2)+'\n');
fs.writeFileSync(path.join(out,'README.md'),'# Local Web validation evidence\n\nSee `../../../LOCAL_WEB_VALIDATION_2026-10-28_zh-HK.md`. Logs are sanitized and line endings normalized. The original test suite remains 301/302; the JSON material-factor difference is recorded, not waived. PNGs are byte-exact screenshots from a new headless process and fresh isolated contexts, not desktop captures.\n\nThe .cjs/.mjs diagnostic snapshots were executed in the original task layout with a sibling KeEv-games-handoff checkout. runtime-smoke.cjs accepts KEEV_REPO, QA_OUTPUT and CODEX_NODE_MODULES for replay with existing tools; it downloads nothing. Do not run fixed-baseline restoration snapshots against another checkout.\n');
console.log(JSON.stringify({evidenceDirectory:'docs/reviews/evidence/local-web-validation-20261028',files:fs.readdirSync(out).length,summary}));
