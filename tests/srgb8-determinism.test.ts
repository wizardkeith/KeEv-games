import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {SRGB8_LINEAR} from '../src/art/srgb8-linear';
import {linearColor} from '../src/art/materials';
import {nativeMaterialIntent} from '../src/art/native-materials';

test('canonical 8-bit decode keeps the complete pinned table and the accepted byte-41 factor',()=>{
 assert.equal(SRGB8_LINEAR.length,256);assert.equal(SRGB8_LINEAR[0],0);assert.equal(SRGB8_LINEAR[255],1);
 assert.equal(createHash('sha256').update(JSON.stringify(SRGB8_LINEAR)).digest('hex'),'4210c27d186eac98ef2b3ba3c256bf146fe6857ac5314a32c209794366164fe4');
 SRGB8_LINEAR.forEach((value,i)=>{assert(Number.isFinite(value));if(i)assert(value>SRGB8_LINEAR[i-1]);});
 assert.deepEqual(linearColor('#292929'),[0.02217388479338738,0.02217388479338738,0.02217388479338738]);
 const bits=Buffer.alloc(8);bits.writeDoubleBE(linearColor('#4f3729')[2]);assert.equal(bits.toString('hex'),'3f96b4c0380d2dee');
 assert.throws(()=>linearColor('#xyzxyz'));
});

test('shared canonical decode and the unchanged native oak adapter preserve every recorded linear master factor exactly',()=>{
 const files=(dir:string):string[]=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(path.join(dir,e.name)):[path.join(dir,e.name)]);
 let checked=0;
 for(const file of files('assets/masters').filter(p=>p.endsWith('.glb'))){
  const bytes=fs.readFileSync(file),g=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)).toString('utf8'));
  for(const material of g.materials??[]){
   const hex=material.extras?.authoredSrgbHex??material.name?.match(/#[0-9a-f]{6}/i)?.[0];
   if(!/^#[0-9a-f]{6}$/i.test(hex??'')||!(material.extras?.colorEncoding==='linear-from-authored-srgb'||material.name?.includes('linear-srgb-v2')))continue;
   const actual=material.pbrMetallicRoughness?.baseColorFactor?.slice(0,3);if(!actual)continue;
   const expected=material.name.includes(':v11-oak-neutral-tint')?nativeMaterialIntent({role:'wood',color:hex,roughness:material.pbrMetallicRoughness.roughnessFactor}).baseColorLinear:linearColor(hex);
   assert.deepEqual(expected,actual,file+' '+material.name);checked++;
  }
 }
 assert(checked>=342,'All preflight master factors must be checked');
});
