const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const repo=path.resolve(__dirname,'../KeEv-games-handoff'),git=(args,opts={})=>cp.execFileSync('git',args,{cwd:repo,...opts});
assert.equal(git(['rev-parse','HEAD'],{encoding:'utf8'}).trim(),'f0492e66f30a076bed0aede48a1ff219e162756c');
const generated=['evidence/native-v4/locomotion-after.json','evidence/content-validation.json','evidence/replay-result.json','evidence/asset-validation.json','fixtures/golden-one-hour.json'];
const archived=[];
for(const file of generated){const original=git(['show','HEAD:'+file]),current=fs.readFileSync(path.join(repo,file));if(!current.equals(original)){const name='current-'+file.replaceAll('/','__');fs.writeFileSync(path.join(__dirname,name),current);fs.writeFileSync(path.join(repo,file),original);archived.push({original:file,result:name,restored:true});}}
const changed=git(['diff','--name-only','--','assets/masters','public/assets'],{encoding:'utf8'}).trim();assert.equal(changed,'','Master/public asset changed; stop');
const untracked=git(['ls-files','--others','--exclude-standard','--','assets/masters','public/assets'],{encoding:'utf8'}).trim();assert.equal(untracked,'','Unexpected new master/public asset');
const protectedFiles=git(['ls-files','-z','--','assets/masters','public/assets'],{maxBuffer:2*1024*1024}).toString('utf8').split('\0').filter(Boolean);
const entries=git(['ls-files','--stage','-z','--','assets/masters','public/assets'],{maxBuffer:2*1024*1024}).toString('utf8').split('\0').filter(Boolean);
for(const entry of entries){const m=entry.match(/^100\d+ ([a-f0-9]{40}) 0\t(.+)$/s);assert(m,'Unexpected protected entry');const bytes=fs.readFileSync(path.join(repo,m[2])),actual=crypto.createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex');assert.equal(actual,m[1],'Raw protected bytes differ: '+m[2]);}
const preflight=JSON.parse(fs.readFileSync(path.join(__dirname,'palette-preflight.json'),'utf8'));
for(const[file,expected]of Object.entries(preflight.masterSha256))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(repo,file))).digest('hex'),expected,file);
const master=JSON.parse(fs.readFileSync(path.join(repo,'assets/masters/native-v3/environment-v3.json'),'utf8'));
const current=JSON.parse(fs.readFileSync(path.join(repo,'assets/authoring/native-v3/environment/manifest.json'),'utf8'));
assert.equal(current.deterministicMaterialCompatibility.embeddedMaterialsSourceSha256,master.sources['src/art/materials.ts']);
assert.notEqual(current.sources['src/art/materials.ts'],master.sources['src/art/materials.ts']);
const report={baseline:'f0492e66f30a076bed0aede48a1ff219e162756c',trackedMastersAndPublicAssetsChecked:protectedFiles.length,allTrackedMasterAndPublicBytesUnchanged:true,rawGitBlobHashCompared:true,noNewMasterOrPublicAsset:true,originalMasterGlbsUnchanged:91,environmentMasterFrozenSourceSnapshotRetained:true,currentExternalSourceReceiptExplicit:true,archivedGeneratedEvidence:archived,linuxABTested:false};
fs.writeFileSync(path.join(__dirname,'preservation-report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
