import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import {buildNativeCharacterGlb} from '../KeEv-games-handoff/tools/export-native-characters.ts';
const repo=path.resolve(import.meta.dirname,'../KeEv-games-handoff');
process.chdir(repo);
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const parse=b=>{const length=b.readUInt32LE(12);return {json:JSON.parse(b.subarray(20,20+length)),bin:b.subarray(28+length)};};
const manifest=JSON.parse(fs.readFileSync('assets/authoring/native-v3/manifest.json','utf8'));
const results=[];
for(const asset of manifest.assets){
  const original=fs.readFileSync(asset.file),rebuilt=buildNativeCharacterGlb(asset.kind),a=parse(original),b=parse(rebuilt),diffs=[];
  const compare=(x,y,p='')=>{if(Object.is(x,y))return;if(typeof x!=='object'||x===null||typeof y!=='object'||y===null){diffs.push({path:p,original:x,rebuilt:y,numeric:typeof x==='number'&&typeof y==='number',absoluteDifference:typeof x==='number'&&typeof y==='number'?Math.abs(x-y):null});return;}for(const key of new Set([...Object.keys(x),...Object.keys(y)]))compare(x[key],y[key],p+'/'+key);};
  compare(a.json,b.json);
  const accessors=[];
  for(let i=0;i<a.json.accessors.length;i++){
    const aa=a.json.accessors[i],bb=b.json.accessors[i];if(aa.componentType!==bb.componentType||aa.count!==bb.count||aa.type!==bb.type){accessors.push({id:i,incompatible:true});continue;}
    const count=aa.count*({SCALAR:1,VEC2:2,VEC3:3,VEC4:4}[aa.type]||1),va=a.json.bufferViews[aa.bufferView],vb=b.json.bufferViews[bb.bufferView];let changed=0,maxAbs=0;
    for(let j=0;j<count;j++){const offsetA=(va.byteOffset||0)+(aa.byteOffset||0)+j*4,offsetB=(vb.byteOffset||0)+(bb.byteOffset||0)+j*4;const x=aa.componentType===5126?a.bin.readFloatLE(offsetA):a.bin.readUInt32LE(offsetA),y=bb.componentType===5126?b.bin.readFloatLE(offsetB):b.bin.readUInt32LE(offsetB);if(!Object.is(x,y)){changed++;maxAbs=Math.max(maxAbs,Math.abs(x-y));}}
    if(changed)accessors.push({id:i,componentType:aa.componentType,type:aa.type,changed,maxAbsoluteDifference:maxAbs});
  }
  results.push({kind:asset.kind,originalBytes:original.length,rebuiltBytes:rebuilt.length,originalSha256:hash(original),rebuiltSha256:hash(rebuilt),binaryChunkEqual:a.bin.equals(b.bin),jsonDifferenceCount:diffs.length,jsonDifferencesOnlyNumeric:diffs.every(d=>d.numeric),maximumJsonNumericDifference:Math.max(0,...diffs.filter(d=>d.numeric).map(d=>d.absoluteDifference)),jsonExamples:diffs.slice(0,12),differentAccessors:accessors,filesSaved:false});
}
const report={node:process.version,platform:process.platform,arch:process.arch,readOnlyRebuildComparison:true,originalAssetsUnmodified:true,results,conclusion:'Diagnostic comparison only; original strict byte-rebuild test remains unchanged and failed. No asset replacement or art acceptance.'};
fs.writeFileSync(path.resolve(import.meta.dirname,'native-glb-difference.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report));
