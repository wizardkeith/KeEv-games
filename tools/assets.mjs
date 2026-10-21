// Original procedural glTF 2.0 masters. metres, RH, +Y up, +Z forward.
import fs from 'node:fs';
import zlib from 'node:zlib';
function make(skinned){
 let chunks=[],length=0; const views=[],accessors=[];
 function acc(data,type,componentType=5126,bounds=false){
  const pad=(4-length%4)%4; if(pad){chunks.push(Buffer.alloc(pad));length+=pad;}
  const buf=Buffer.from(data.buffer,data.byteOffset,data.byteLength);let i=views.length;views.push({buffer:0,byteOffset:length,byteLength:buf.length});chunks.push(buf);length+=buf.length;
  let a={bufferView:i,componentType,count:data.length/({SCALAR:1,VEC3:3,VEC4:4,MAT4:16}[type]),type};
  if(bounds){let n={VEC3:3,SCALAR:1}[type];a.min=Array.from({length:n},(_,j)=>Math.min(...Array.from(data).filter((_,k)=>k%n===j)));a.max=Array.from({length:n},(_,j)=>Math.max(...Array.from(data).filter((_,k)=>k%n===j)));}
  accessors.push(a);return accessors.length-1;
 }
 // Face-split cube normals, origin at floor, with a middle skin seam.
 const p=[],norm=[],idx=[],joints=[],weights=[];
 const faces=[[[0,0,1],[[-.5,0,.5],[.5,0,.5],[.5,1,.5],[-.5,1,.5]]],[[0,0,-1],[[.5,0,-.5],[-.5,0,-.5],[-.5,1,-.5],[.5,1,-.5]]],[[1,0,0],[[.5,0,.5],[.5,0,-.5],[.5,1,-.5],[.5,1,.5]]],[[-1,0,0],[[-.5,0,-.5],[-.5,0,.5],[-.5,1,.5],[-.5,1,-.5]]],[[0,1,0],[[-.5,1,.5],[.5,1,.5],[.5,1,-.5],[-.5,1,-.5]]],[[0,-1,0],[[-.5,0,-.5],[.5,0,-.5],[.5,0,.5],[-.5,0,.5]]]];
 for(const [n,vs] of faces){let base=p.length/3;for(const v of vs){p.push(v[0]*(skinned?.35:1.4),v[1]*(skinned?1.4:.85),v[2]*(skinned?.3:.65));norm.push(...n);joints.push(0,v[1]?1:0,0,0);weights.push(v[1]?0:1,v[1]?1:0,0,0);}idx.push(base,base+1,base+2,base,base+2,base+3);}
 let attributes={POSITION:acc(new Float32Array(p),'VEC3',5126,true),NORMAL:acc(new Float32Array(norm),'VEC3')};let indices=acc(new Uint16Array(idx),'SCALAR',5123);
 const g={asset:{version:'2.0',generator:'KeEv W0 original procedural fixture v1'},scene:0,scenes:[{nodes:skinned?[0,1]:[0]}],nodes:[{name:skinned?'GenericSkinFixture':'ShopCounter',mesh:0}],meshes:[{name:skinned?'TwoBoneMesh':'CounterMesh',primitives:[{attributes,indices,material:0}]}],materials:[{name:'WarmMatte',pbrMetallicRoughness:{baseColorFactor:skinned?[.62,.55,.73,1]:[.56,.39,.26,1],metallicFactor:0,roughnessFactor:.85}}],bufferViews:views,accessors,buffers:[{byteLength:0}]};
 if(skinned){attributes.JOINTS_0=acc(new Uint16Array(joints),'VEC4',5123);attributes.WEIGHTS_0=acc(new Float32Array(weights),'VEC4');g.nodes[0].skin=0;g.nodes.push({name:'Root',children:[2]},{name:'Upper',translation:[0,.7,0]});let m=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];let m2=[...m];m2[13]=-.7;g.skins=[{name:'GenericTwoBone',joints:[1,2],skeleton:1,inverseBindMatrices:acc(new Float32Array([...m,...m2]),'MAT4')}];g.animations=[{name:'GentleWave',samplers:[{input:acc(new Float32Array([0,1,2]),'SCALAR',5126,true),output:acc(new Float32Array([0,0,0,1,0,0,.17364818,.98480775,0,0,0,1]),'VEC4'),interpolation:'LINEAR'}],channels:[{sampler:0,target:{node:2,path:'rotation'}}]}];}
 let bin=Buffer.concat(chunks);const bp=(4-bin.length%4)%4;bin=Buffer.concat([bin,Buffer.alloc(bp)]);g.buffers[0].byteLength=bin.length;let json=Buffer.from(JSON.stringify(g));json=Buffer.concat([json,Buffer.alloc((4-json.length%4)%4,32)]);const head=Buffer.alloc(20);head.writeUInt32LE(0x46546c67);head.writeUInt32LE(2,4);head.writeUInt32LE(28+json.length+bin.length,8);head.writeUInt32LE(json.length,12);head.writeUInt32LE(0x4e4f534a,16);const bh=Buffer.alloc(8);bh.writeUInt32LE(bin.length);bh.writeUInt32LE(0x004e4942,4);return Buffer.concat([head,json,bh,bin]);
}
fs.mkdirSync('assets/masters',{recursive:true});fs.mkdirSync('public/assets',{recursive:true});
for(const kind of ['counter','skin-test']){const b=make(kind==='skin-test');fs.writeFileSync(`assets/masters/${kind}.glb`,b);fs.writeFileSync(`public/assets/${kind}.glb`,b);fs.writeFileSync(`assets/masters/${kind}.glb.gz`,zlib.gzipSync(b,{level:9}));}
// Genuine generated lossless placeholder cue, mono PCM 16-bit 24kHz.
const rate=24000,n=4800,buf=Buffer.alloc(44+n*2);buf.write('RIFF');buf.writeUInt32LE(36+n*2,4);buf.write('WAVEfmt ',8);buf.writeUInt32LE(16,16);buf.writeUInt16LE(1,20);buf.writeUInt16LE(1,22);buf.writeUInt32LE(rate,24);buf.writeUInt32LE(rate*2,28);buf.writeUInt16LE(2,32);buf.writeUInt16LE(16,34);buf.write('data',36);buf.writeUInt32LE(n*2,40);for(let i=0;i<n;i++)buf.writeInt16LE(Math.round(Math.sin(i/rate*2*Math.PI*660)*Math.sin(Math.PI*i/n)**2*1800),44+i*2);fs.writeFileSync('assets/masters/sale.wav',buf);fs.copyFileSync('assets/masters/sale.wav','public/assets/sale.wav');
