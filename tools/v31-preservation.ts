import fs from 'node:fs';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
const baseline='3869ef9aefcdc08c0aede158ec5276df89f7cbae';
const git=(...args:string[])=>execFileSync('git',args,{encoding:'utf8'}).trim();
const sha=(b:Buffer)=>crypto.createHash('sha256').update(b).digest('hex');
const files=git('ls-tree','-r','--name-only',baseline).split('\n');
// Native-v3 geometry/masters are intentionally revised, all older masters and
// accepted economic, storage, narrative, material and product sources are frozen.
const protectedFiles=files.filter(p=>/^(src\/(core|platform|narrative|content)\/|source-inputs\/|public\/fonts\/)/.test(p)
 || /^(assets|public\/assets)\//.test(p)&&!p.includes('/native-v3/')
 || ['src/art/recipes.ts','src/art/geometry.ts','src/art/materials.ts','src/art/misaki.ts','src/art/direction.ts','src/art/native-materials.ts','src/art/native-products.ts','src/ui/day1.ts','src/presentation/native-motion.ts','package.json','package-lock.json','.openai/hosting.json','tests/economy.test.ts','tests/storage.test.ts','tests/w1_1.test.ts','tests/day1-storage.test.ts','tests/day1-focused-fix.test.ts','tests/boot-presentation.test.ts'].includes(p));
const changed=protectedFiles.filter(p=>!fs.existsSync(p)||git('hash-object',p)!==git('rev-parse',`${baseline}:${p}`));
const starter='source-inputs/native-v3/Next_Stop_Little_Shop_Native_Motion_Starter_v3.ts';
const starterHash=sha(fs.readFileSync(starter));
const samplerHash=sha(fs.readFileSync('src/presentation/native-motion.ts'));
const pass=changed.length===0&&starterHash===samplerHash;
const report={baseline,protectedFileCount:protectedFiles.length,changedProtectedFiles:changed,starterHash,samplerHash,
 intentionalChanges:['native character skirt geometry / planted feet / staff playback and conditional customer route','UI-safe camera and face fill, layered native environment materials/exterior','five-language opening guide; same Saves boundary for legal Sandbox advance','return-started settlement adopts same stream watermark without route reset','focused tests, current source/export contracts and evidence'],
 unchanged:'Economic rules, schema, normal/sandbox save identities, transactional Saves, content IDs, five existing content locale files, Day1 story CTA/profit fixes, native products/A1/A2 material intent, historical assets, locked dependencies and hosting identity.',pass};
fs.mkdirSync('evidence/native-v3_1',{recursive:true});fs.writeFileSync('evidence/native-v3_1/preservation.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report));if(!pass)process.exitCode=1;
