const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const repo=path.resolve(__dirname,'../KeEv-games-handoff');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const bits=n=>{const b=Buffer.alloc(8);b.writeDoubleBE(n);return b.toString('hex');};
const oldLinear=byte=>{const c=byte/255;return c<=.04045?c/12.92:Math.pow((c+.055)/1.055,2.4);};
function files(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(path.join(dir,e.name)):[path.join(dir,e.name)]);}
const paths=files(path.join(repo,'assets/masters')).filter(p=>p.endsWith('.glb'));
const constraints=new Map(),hashes={},counts={masters:paths.length,materials:0,labeledLinear:0,matchedChannels:0,explicitOverrides:0},overrides=[];
for(const file of paths){
  const bytes=fs.readFileSync(file),relative=path.relative(repo,file).replaceAll('\\','/');hashes[relative]=sha(bytes);
  if(bytes.toString('ascii',0,4)!=='glTF')throw Error('Unexpected master '+relative);
  const json=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)));
  for(const [i,material]of(json.materials||[]).entries()){
    counts.materials++;
    const hex=material.extras?.authoredSrgbHex||material.name?.match(/#[0-9a-f]{6}/i)?.[0];
    if(!/^#[0-9a-f]{6}$/i.test(hex||'')||!(material.extras?.colorEncoding==='linear-from-authored-srgb'||material.name?.includes('linear-srgb-v2')))continue;
    counts.labeledLinear++;
    const color=material.pbrMetallicRoughness?.baseColorFactor;if(!color)continue;
    // This adapter performs v*.40+peak*.60; even the peak can round 1 ULP.
    // Those outputs are not direct constraints on the shared decode table.
    if(material.name?.includes(':v11-oak-neutral-tint'))continue;
    for(let channel=0;channel<3;channel++){
      const byte=parseInt(hex.slice(1+channel*2,3+channel*2),16),value=color[channel];
      if(Math.abs(value-oldLinear(byte))>1e-12){counts.explicitOverrides++;overrides.push({file:relative,material:i,channel,hex,value});continue;}
      const entries=constraints.get(byte)||new Map(),key=bits(value),list=entries.get(key)||[];
      list.push({file:relative,material:i,channel,hex,value});entries.set(key,list);constraints.set(byte,entries);counts.matchedChannels++;
    }
  }
}
const conflicts=[...constraints].filter(([,values])=>values.size!==1).map(([byte,values])=>({byte,values:[...values].map(([bits,uses])=>({bits,value:uses[0].value,count:uses.length,examples:uses.slice(0,4)}))}));
const table=Array.from({length:256},(_,byte)=>constraints.has(byte)?[...constraints.get(byte).values()][0][0].value:oldLinear(byte));
const mismatches=[];let verifiedMaterialValues=0;
for(const file of paths){
  const bytes=fs.readFileSync(file),j=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)));
  for(const[i,m]of(j.materials||[]).entries()){
    const hex=m.extras?.authoredSrgbHex||m.name?.match(/#[0-9a-f]{6}/i)?.[0];
    if(!/^#[0-9a-f]{6}$/i.test(hex||'')||!(m.extras?.colorEncoding==='linear-from-authored-srgb'||m.name?.includes('linear-srgb-v2')))continue;
    let expected=[1,3,5].map(offset=>table[parseInt(hex.slice(offset,offset+2),16)]);
    if(m.name?.includes(':v11-oak-neutral-tint')){const peak=Math.max(...expected);expected=expected.map(v=>v*.40+peak*.60);}
    const actual=m.pbrMetallicRoughness?.baseColorFactor?.slice(0,3);if(!actual)continue;
    if(!expected.every((v,k)=>Object.is(v,actual[k])))mismatches.push({file:path.relative(repo,file).replaceAll('\\','/'),material:i,hex,expected,actual});else verifiedMaterialValues++;
  }
}
const differingFromLocal=table.map((value,byte)=>({byte,canonical:value,local:oldLinear(byte)})).filter(x=>!Object.is(x.canonical,x.local));
const report={baseline:'f0492e66f30a076bed0aede48a1ff219e162756c',counts,constrainedEntries:constraints.size,conflicts,explicitOverrides:overrides.slice(0,20),verifiedMaterialValues,mismatches,canonicalDiffersFromLocal:differingFromLocal,table,tableSha256:sha(Buffer.from(JSON.stringify(table))),masterSha256:hashes,canonicalSources:Object.fromEntries([...constraints].map(([byte,values])=>[byte,{value:[...values.values()][0][0].value,bits:[...values.keys()][0],uses:[...values.values()][0].length,example:[...values.values()][0][0]}])),preservationPossible:conflicts.length===0&&mismatches.length===0,sourceOrAssetsModified:false};
fs.writeFileSync(path.join(__dirname,'palette-preflight.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({counts,constrainedEntries:constraints.size,conflicts,verifiedMaterialValues,mismatches,differingFromLocal,tableSha256:report.tableSha256,preservationPossible:report.preservationPossible}));
