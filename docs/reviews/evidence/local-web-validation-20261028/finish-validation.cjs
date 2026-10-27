const fs=require('node:fs');
const path=require('node:path');
const cp=require('node:child_process');
const crypto=require('node:crypto');
const assert=require('node:assert/strict');
const repo=path.resolve(__dirname,'../KeEv-games-handoff');
const exec=(args,opts={})=>cp.execFileSync('git',args,{cwd:repo,...opts});
assert.equal(exec(['rev-parse','HEAD'],{encoding:'utf8'}).trim(),'0638d652ebdca1280320fb93058bc5167bb2e2ca');
assert.equal(exec(['diff','--cached','--name-only'],{encoding:'utf8'}).trim(),'','Unexpected staged work');
const generated=['evidence/native-v4/locomotion-after.json','evidence/content-validation.json','evidence/replay-result.json','evidence/asset-validation.json','fixtures/golden-one-hour.json'];
const archived=[];
for(const file of generated){
  const canonical=exec(['show','HEAD:'+file],{maxBuffer:10*1024*1024});
  const current=fs.readFileSync(path.join(repo,file));
  if(!current.equals(canonical)){
    const name='current-'+file.replaceAll('/','__');
    fs.writeFileSync(path.join(__dirname,name),current);
    fs.writeFileSync(path.join(repo,file),canonical);
    archived.push({original:file,currentResult:name,originalRestored:true});
  }
}
// Refresh Git's CRLF-era stat sizes only for files still equal to their exact
// existing index blob. git add then changes no staged blob or source content.
const records=exec(['ls-files','--stage','-z'],{maxBuffer:8*1024*1024}).toString('utf8').split('\0').filter(Boolean);
const unchanged=[];
for(const record of records){
  const m=record.match(/^100\d+ ([a-f0-9]{40}) 0\t(.+)$/s);if(!m)continue;
  const [,expected,name]=m,bytes=fs.readFileSync(path.join(repo,name));
  const actual=crypto.createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex');
  if(actual===expected)unchanged.push(name);
}
exec(['add','--pathspec-from-file=-','--pathspec-file-nul'],{input:Buffer.from(unchanged.join('\0')+'\0'),maxBuffer:2*1024*1024});
assert.equal(exec(['diff','--cached','--name-only'],{encoding:'utf8'}).trim(),'','Stat refresh staged a content change');
const report={baseline:'0638d652ebdca1280320fb93058bc5167bb2e2ca',archivedGeneratedEvidence:archived,statEntriesRefreshed:unchanged.length,allRefreshedBytesEqualOriginalGitBlob:true,noProductContentStaged:true,changes:exec(['status','--porcelain=v1','--untracked-files=normal'],{encoding:'utf8'}).trim().split('\n')};
fs.writeFileSync(path.join(__dirname,'preservation-report.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report));
