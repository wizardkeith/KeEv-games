const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {pathToFileURL}=require('node:url');
const repo=path.resolve(__dirname,'../KeEv-games-handoff');
const {build}=require(path.join(repo,'node_modules/esbuild'));
const preflight=JSON.parse(fs.readFileSync(path.join(__dirname,'palette-preflight.json'),'utf8'));
assert.equal(preflight.preservationPossible,true);
const table=preflight.table,sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const actual=process.env.USE_ACTUAL_SOURCE==='1';
const cached=path.join(repo,'node_modules/.cache/material-determinism');fs.mkdirSync(cached,{recursive:true});
const bundle=path.join(cached,'preflight.mjs');
(async()=>{
  await build({stdin:{contents:`export {buildNativeCharacterGlb} from './tools/export-native-characters';export {buildMisakiGlb} from './tools/export-misaki';export {glb as legacyGlb,assets as legacyAssets} from './tools/art-w1_1b';export {fixtureGlb,assets as fixtureAssets} from './tools/export-v4-fixtures';`,resolveDir:repo,sourcefile:'material-preservation-preflight.ts',loader:'ts'},outfile:bundle,bundle:true,format:'esm',platform:'node',packages:'external',plugins:[{name:'candidate-table-without-source-writes',setup(api){
    if(!actual)api.onLoad({filter:/src[\\/]art[\\/]materials\.ts$/},args=>{
      let text=fs.readFileSync(args.path,'utf8');const old="return [1,3,5].map(i=>{const c=parseInt(hex.slice(i,i+2),16)/255;return c<=.04045?c/12.92:Math.pow((c+.055)/1.055,2.4);}) as [number,number,number];";
      assert(text.includes(old));text='const candidateSrgb8='+JSON.stringify(table)+';\n'+text.replace(old,'return [1,3,5].map(i=>candidateSrgb8[parseInt(hex.slice(i,i+2),16)]) as [number,number,number];');return {contents:text,loader:'ts'};
    });
    api.onLoad({filter:/tools[\\/]art-w1_1b\.ts$/},args=>{const text=fs.readFileSync(args.path,'utf8'),cut=text.indexOf("fs.mkdirSync('assets/masters/w1_1b'");assert(cut>0);return {contents:text.slice(0,cut)+'\nexport {glb,assets};',loader:'ts'};});
    api.onLoad({filter:/tools[\\/]export-v4-fixtures\.ts$/},args=>{const text=fs.readFileSync(args.path,'utf8'),cut=text.indexOf("const root='assets/masters/native-v4'"),start=text.indexOf('const assets=',cut),end=text.indexOf('const records=assets.map',start);assert(cut>0&&start>cut&&end>start);return {contents:text.slice(0,cut)+text.slice(start,end)+'\nexport {assets};',loader:'ts'};});
  }}]});
  process.chdir(repo);
  const api=await import(pathToFileURL(bundle).href),results=[];
  function compare(file,rebuilt){const before=fs.readFileSync(file);assert(rebuilt.equals(before),'Candidate changes master: '+file);results.push({file,bytes:before.length,sha256:sha(before),byteIdentical:true});}
  for(const a of JSON.parse(fs.readFileSync('assets/authoring/native-v3/manifest.json','utf8')).assets)compare(a.file,api.buildNativeCharacterGlb(a.kind));
  for(const a of JSON.parse(fs.readFileSync('assets/authoring/day1/manifest.json','utf8')).assets)compare(a.file,api.buildMisakiGlb(a.expression));
  for(const a of api.legacyAssets)compare('assets/masters/w1_1b/'+a.name+'.glb',api.legacyGlb(a.name,a.recipe));
  for(const[id,parts]of api.fixtureAssets)compare('assets/masters/native-v4/'+id+'.glb',api.fixtureGlb(id,parts));
  for(const[file,digest]of Object.entries(preflight.masterSha256))assert.equal(sha(fs.readFileSync(file)),digest,'Original master modified by probe: '+file);
  const report={baseline:preflight.baseline,tableSha256:preflight.tableSha256,sourceKind:actual?'Actual worktree implementation':'In-memory candidate',originalMasterGlbsChecked:Object.keys(preflight.masterSha256).length,activeMasterRebuilds:results.length,allActiveRebuildsByteIdentical:true,allOriginalMasterGlbsUnchanged:true,relevantMaterialValuesExact:preflight.verifiedMaterialValues,sourceFilesWritten:false,masterFilesWritten:false,results};
  fs.writeFileSync(path.join(__dirname,actual?'actual-rebuilds.json':'preflight-rebuilds.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({activeMasterRebuilds:results.length,originalMasterGlbsChecked:report.originalMasterGlbsChecked,allByteIdentical:true,sourceFilesWritten:false,masterFilesWritten:false}));
})().catch(e=>{console.error(e);process.exitCode=1;});
