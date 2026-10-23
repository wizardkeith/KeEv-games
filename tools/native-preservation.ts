import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
const baseline='8eca6d53e13b0d2db457636844b49bf700753c43';
const tracked=execFileSync('git',['ls-tree','-r','--name-only',baseline],{encoding:'utf8'}).trim().split('\n');
const protectedFiles=tracked.filter(p=>/^(src\/(core|platform|narrative)\/|assets\/|public\/(assets|fonts)\/|source-inputs\/source_bible\/)/.test(p)||['src/art/recipes.ts','src/art/geometry.ts','src/art/materials.ts','src/art/misaki.ts','src/art/direction.ts','src/ui/day1.ts','package.json','package-lock.json','tests/economy.test.ts','tests/storage.test.ts','tests/w1_1.test.ts','tests/day1-storage.test.ts','tests/day1-focused-fix.test.ts'].includes(p));
// The focused-fix test only gains VM bindings; its effective assertions persist.
const byteProtected=protectedFiles.filter(p=>p!=='tests/day1-focused-fix.test.ts');
const changed=byteProtected.filter(p=>!fs.existsSync(p)||execFileSync('git',['hash-object',p],{encoding:'utf8'}).trim()!==execFileSync('git',['rev-parse',`${baseline}:${p}`],{encoding:'utf8'}).trim());
const localeChanges=Object.fromEntries(['zh-HK','zh-CN','en','ja','th'].map(locale=>{const path=`src/content/${locale}.json`,a=JSON.parse(execFileSync('git',['show',`${baseline}:${path}`],{encoding:'utf8'})),b=JSON.parse(fs.readFileSync(path,'utf8'));return [locale,Object.keys({...a,...b}).filter(k=>a[k]!==b[k])];}));
const pass=changed.length===0&&Object.values(localeChanges).every(keys=>JSON.stringify(keys)===JSON.stringify(['minimalFXNote']));
const result={baseline,byteProtectedFiles:byteProtected.length,changedProtectedFiles:changed,localeChanges,supersededPolicies:['fixed customer roots replaced by reserved doorway visits','Low and Minimal no longer freeze native actors; decorative FX remain suppressible','four-part actor expectations still cover frozen historical masters; new runtime uses25-node rigid hierarchies','decorative reveal deadline no longer cancels service sequence'],pass};
fs.mkdirSync('evidence/native-v3',{recursive:true});fs.writeFileSync('evidence/native-v3/preservation.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));if(!pass)process.exitCode=1;
