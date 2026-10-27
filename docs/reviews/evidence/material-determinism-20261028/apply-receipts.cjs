const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const repo=path.resolve(__dirname,'../KeEv-games-handoff');
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(path.join(repo,p))).digest('hex');
const preflight=JSON.parse(fs.readFileSync(path.join(__dirname,'preflight-rebuilds.json'),'utf8'));
assert.equal(preflight.allActiveRebuildsByteIdentical,true);
const exporters=['tools/export-misaki.ts','tools/export-native-characters.ts','tools/export-native-products.ts','tools/export-native-environment.ts'];
for(const file of exporters){const p=path.join(repo,file),text=fs.readFileSync(p,'utf8'),needle="'src/art/materials.ts'";assert.equal(text.split(needle).length-1,1,file);fs.writeFileSync(p,text.replace(needle,needle+",'src/art/srgb8-linear.ts'"));}
const files=['assets/authoring/day1/manifest.json','assets/authoring/native-v3/manifest.json','assets/authoring/native-v3/products-manifest.json','assets/authoring/native-v3/environment/manifest.json'];
const allowed=new Set(['src/art/materials.ts',...exporters]);const changes=[];
const masterPath='assets/masters/native-v3/environment-v3.json',masterBytes=fs.readFileSync(path.join(repo,masterPath)),master=JSON.parse(masterBytes);
for(const file of files){const p=path.join(repo,file),j=JSON.parse(fs.readFileSync(p,'utf8')),key=j.sourceSha256?'sourceSha256':'sources',map=j[key],changed=[];
  for(const source of Object.keys(map)){const digest=sha(source);if(digest!==map[source]){assert(allowed.has(source),'Unexpected source drift: '+source);changed.push({source,before:map[source],after:digest});map[source]=digest;}}
  map['src/art/srgb8-linear.ts']=sha('src/art/srgb8-linear.ts');
  if(key==='sources')j.deterministicMaterialCompatibility={kind:'current-source-compatible-with-frozen-master',baseline:'f0492e66f30a076bed0aede48a1ff219e162756c',frozenMasterPath:masterPath,frozenMasterSha256:sha(masterPath),embeddedSourceSnapshotPreserved:true,embeddedMaterialsSourceSha256:master.sources['src/art/materials.ts'],currentSourceReceipt:'manifest.sources',canonicalTableSha256:preflight.tableSha256,verification:'44 active GLB rebuilds and 342 relevant material RGB values exact; all existing master bytes retained',note:'Embedded master.sources is original snapshot provenance. This external sources map records the current compatible implementation, not a claim that the frozen master was rewritten.'};
  fs.writeFileSync(p,JSON.stringify(j,null,2)+'\n');changes.push({file,key,changed,addedCanonicalTableDependency:true});
}
assert(fs.readFileSync(path.join(repo,masterPath)).equals(masterBytes));
fs.writeFileSync(path.join(__dirname,'receipt-update-report.json'),JSON.stringify({masterBytesUnchanged:true,changes},null,2)+'\n');
console.log(JSON.stringify({receiptsUpdated:files.length,exporterSourceListsUpdated:exporters.length,environmentMasterBytesUnchanged:true}));
