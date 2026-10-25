import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {nativeCharacterParts,nativeGrouped} from '../src/art/native-characters';
import {nativeHairMaterial} from '../src/art/native-materials';
import {buildNativeCharacterGlb} from '../tools/export-native-characters';
test('v10 rebuilt textured hair UV seams preserve triangle locality and supply unit orthogonal tangent frames without adding triangles',()=>{
 for(const kind of ['misaki','visitor-a','visitor-b'] as const){const groups=nativeCharacterParts(kind).flatMap(p=>nativeGrouped(p.recipe)),hair=groups.filter(g=>g.role==='hair'&&g.roughness===nativeHairMaterial.roughness);assert.equal(hair.length,5,'bounded material groups: three sculpted hair tones plus two secondary locks; all three sculpted actors share bounded tone grouping');
  for(const g of hair){const a=g.geometry;assert.equal(a.uvs.length,a.positions.length/3*2);assert.equal(a.tangents?.length,a.positions.length/3*4);assert.ok(a.uvs.every(Number.isFinite));for(let i=0;i<a.indices.length;i+=3){const u=a.indices.slice(i,i+3).map(n=>a.uvs[n*2]);assert.ok(Math.max(...u)-Math.min(...u)<=.500001,'wrap-crossing triangles must not stretch across the full texture');}for(let i=0;i<a.positions.length/3;i++){const t=a.tangents!.slice(i*4,i*4+3),n=a.normals.slice(i*3,i*3+3);assert.ok(Math.abs(Math.hypot(...t)-1)<1e-10);assert.ok(Math.abs(t.reduce((s,v,k)=>s+v*n[k],0))<1e-10);assert.ok(Math.abs(a.tangents![i*4+3])===1);}}
 }
});
test('v5 GLB carries the exact original colour/linear-normal bytes, UVs and tangents used by the Web bob',()=>{
 const colour=fs.readFileSync(nativeHairMaterial.baseColor.replace('/assets/','assets/masters/')),normal=fs.readFileSync(nativeHairMaterial.normal.replace('/assets/','assets/masters/'));assert.ok(colour.includes(Buffer.from('sRGB')));assert.ok(!normal.includes(Buffer.from('sRGB')));
 for(const kind of ['misaki','visitor-a','visitor-b'] as const){const bytes=buildNativeCharacterGlb(kind),len=bytes.readUInt32LE(12),j=JSON.parse(bytes.subarray(20,20+len).toString()),start=28+len;
  const expectedMaps=kind==='misaki'?[colour,normal,fs.readFileSync('assets/masters/native-v11/misaki-skin.png'),fs.readFileSync('assets/masters/native-v11/misaki-eyes.png')]:kind==='visitor-a'?[colour,normal,fs.readFileSync('assets/masters/native-v11/visitor-a-skin.png'),fs.readFileSync('assets/masters/native-v11/misaki-eyes.png')]:[colour,normal,fs.readFileSync('assets/masters/native-v11/misaki-skin.png'),fs.readFileSync('assets/masters/native-v11/misaki-eyes.png')];assert.equal(j.images.length,expectedMaps.length);for(const [n,expected]of expectedMaps.entries()){const v=j.bufferViews[j.images[n].bufferView];assert.deepEqual(bytes.subarray(start+v.byteOffset,start+v.byteOffset+v.byteLength),expected);}
  const read=(id:number)=>{const a=j.accessors[id],v=j.bufferViews[a.bufferView],components=a.type==='VEC4'?4:2;return Array.from({length:a.count*components},(_,i)=>bytes.readFloatLE(start+v.byteOffset+i*4));};
  const g=nativeCharacterParts(kind).flatMap(p=>nativeGrouped(p.recipe)).find(g=>g.role==='hair'&&g.roughness===nativeHairMaterial.roughness)!,material=j.materials.findIndex((m:any)=>m.normalTexture),p=j.meshes.flatMap((m:any)=>m.primitives).find((p:any)=>p.material===material);assert.equal(j.materials[material].normalTexture.scale,nativeHairMaterial.normalScale);assert.equal(j.materials[material].pbrMetallicRoughness.baseColorTexture.index,0);
  for(const [actual,expected]of [[read(p.attributes.TEXCOORD_0),g.geometry.uvs],[read(p.attributes.TANGENT),g.geometry.tangents!]]){assert.equal(actual.length,expected.length);actual.forEach((v,k)=>assert.ok(Math.abs(v-expected[k])<1e-6));}
 }
});
