const cp = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const repo = path.resolve(__dirname, '../KeEv-games-handoff');
const head = cp.execFileSync('git',['rev-parse','HEAD'],{cwd:repo,encoding:'utf8'}).trim();
assert.equal(head, '0638d652ebdca1280320fb93058bc5167bb2e2ca');
const dirty = cp.execFileSync('git',['diff','--name-only'],{cwd:repo,encoding:'utf8'}).trim().split('\n').filter(Boolean);
assert(dirty.every(p => ['.gitattributes','.gitignore','evidence/native-v4/locomotion-after.json'].includes(p)), 'Unexpected tracked change; restore stopped');
const config = ['.gitattributes','.gitignore'].map(name => [name,fs.readFileSync(path.join(repo,name))]);
const generated = path.join(repo,'evidence/native-v4/locomotion-after.json');
if(dirty.includes('evidence/native-v4/locomotion-after.json')) fs.copyFileSync(generated,path.join(__dirname,'first-test-generated-locomotion-after.json'));
cp.execFileSync('git',['-c','core.autocrlf=false','checkout-index','--force','--all'],{cwd:repo,stdio:'inherit'});
for(const [name,bytes] of config) fs.writeFileSync(path.join(repo,name),bytes);
// checkout-index can keep stat-identical files. Normalize only when the result
// hashes to the exact existing Git blob; never infer or rewrite content.
const records = cp.execFileSync('git',['ls-files','--stage','-z'],{cwd:repo,maxBuffer:8*1024*1024}).toString('utf8').split('\0').filter(Boolean);
const normalized=[];
for(const record of records){
  const match=record.match(/^100\d+ ([a-f0-9]{40}) 0\t(.+)$/s);if(!match)continue;
  const [,expected,name]=match;if(['.gitattributes','.gitignore'].includes(name))continue;
  const file=path.join(repo,name),bytes=fs.readFileSync(file);
  if(bytes.includes(0)||!bytes.includes(Buffer.from('\r\n')))continue;
  const text=bytes.toString('utf8');if(!Buffer.from(text).equals(bytes))continue;
  const canonical=Buffer.from(text.replace(/\r\n/g,'\n'));
  const hash=crypto.createHash('sha1').update('blob '+canonical.length+'\0').update(canonical).digest('hex');
  if(hash!==expected)continue;
  fs.writeFileSync(file,canonical);normalized.push({path:name,before:bytes.length,after:canonical.length,gitBlob:expected});
}
const report={head,normalizedFiles:normalized.length,onlyExactGitBlobReconstruction:true,authoredConfigurationRetained:true,priorHistoricalEvidenceRestored:true,files:normalized};
fs.writeFileSync(path.join(__dirname,'canonical-checkout-report.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({head,normalizedFiles:normalized.length,onlyExactGitBlobReconstruction:true}));
