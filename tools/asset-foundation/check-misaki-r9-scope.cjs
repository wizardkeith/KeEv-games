// Keep the current deterministic-material fix, all game code and accepted assets.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..');process.chdir(root);
const base='ea6613cd001f3fe26cd9f4eadd8c972f5e872fea';
const allowed=new Set(['assets/authoring/misaki-grayform-v1/manifest.json','assets/authoring/misaki-grayform-v1/misaki-grayform.blend','public/assets/misaki-grayform-v1/misaki-grayform.glb','tools/asset-foundation/MISAKI_GRAY_README.md','PROJECT_STATE.md']);
const changed=cp.execFileSync('git',['diff','--name-only','--diff-filter=MDRT',base],{encoding:'utf8'}).trim().split('\n').filter(Boolean);
for(const file of changed)assert(allowed.has(file),'Out-of-scope tracked modification: '+file);
const list=cp.execFileSync('git',['ls-tree','-r','--name-only',base],{encoding:'utf8'}).trim().split('\n');
const frozen=list.filter(f=>!allowed.has(f));
const newAllowed=new Set(['tools/asset-foundation/misaki-hair-r9.py','tools/asset-foundation/inspect-misaki-r9.py','tools/asset-foundation/capture-misaki-r9.cjs','tools/asset-foundation/compare-misaki-r9.py','tools/asset-foundation/check-misaki-r9-scope.cjs','docs/MISAKI_HAIR_R9_2026-10-28_zh-HK.md']);
const newFiles=cp.execFileSync('git',['ls-files','--others','--exclude-standard'],{encoding:'utf8'}).trim().split('\n').filter(Boolean);
for(const f of newFiles)assert(newAllowed.has(f)||f.startsWith('docs/reviews/evidence/misaki-grayform-v1-r9/'),'Unexpected untracked file: '+f);
// Also constrain new files after staging/committing, when ls-files no longer
// lists them as untracked.
const added=cp.execFileSync('git',['diff','--name-only','--diff-filter=A',base],{encoding:'utf8'}).trim().split('\n').filter(Boolean);
for(const f of added)assert(newAllowed.has(f)||f.startsWith('docs/reviews/evidence/misaki-grayform-v1-r9/'),'Unexpected added file: '+f);
const report={baselineCommit:base,changedExistingFiles:changed.filter(f=>list.includes(f)),newFiles:[...new Set([...newFiles,...added])],frozenTrackedFiles:frozen.length,allOtherTrackedFilesUnchanged:true,protectedAreas:['src including deterministic sRGB8 lookup','tests','accepted asset sets','five locales, transactional saves and economy','studio/gameplay authoring TS camera/light source','.openai/hosting.json and original target'],limits:['Diff scope and technical checks are not visual acceptance']};
const out=process.env.QA_OUTPUT||'docs/reviews/evidence/misaki-grayform-v1-r9';fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'scope-validation.json'),JSON.stringify(report,null,2)+'\n');console.log(report);
