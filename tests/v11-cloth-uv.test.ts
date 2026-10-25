import {surfaceFinishSpec} from '../src/art/surface-finish-v11';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {nativeCharacterParts,nativeSurfaceGeometry,nativeGrouped} from '../src/art/native-characters';
import {nativeClothMaterial} from '../src/art/native-materials';
import {nativeGlaze} from '../src/art/native-materials';
import {buildNativeCharacterGlb} from '../tools/export-native-characters';
test('sculpted clothes receive varied metre UVs without changing any rendered triangle or authored atlas',()=>{
 let checked=0;
 for(const kind of ['misaki','visitor-a','visitor-b'] as const)for(const p of nativeCharacterParts(kind))for(const s of p.recipe){
  if(s.shape!=='mesh')continue;const a=s.geometry,g=nativeSurfaceGeometry(s);assert.equal(g.indices.length,a.indices.length);
  for(let i=0;i<g.indices.length;i++)for(let k=0;k<3;k++){
   assert.equal(g.positions[g.indices[i]*3+k],a.positions[a.indices[i]*3+k]+s.at[k]);assert.equal(g.normals[g.indices[i]*3+k],a.normals[a.indices[i]*3+k]);
  }
  if(s.role==='fabric'&&!a.uvs){checked++;assert.equal(g.uvs!.length,g.positions.length/3*2);assert.ok(g.uvs!.every(Number.isFinite));assert.ok(new Set(g.uvs).size>8,'not one-texel cloth');}
  if(a.uvs&&s.role!=='hair')assert.deepEqual(g.uvs,a.uvs,'authored facial/eye/flow UV unchanged');
 }
 assert.ok(checked>35);
});
test('actual portable pottery carries the same restrained standard glaze layer as Web',()=>{
 for(const id of ['off.mug','off.vase']){
  const bytes=fs.readFileSync('assets/masters/native-v4/product-'+id+'.glb'),len=bytes.readUInt32LE(12),j=JSON.parse(bytes.subarray(20,20+len).toString()),glaze=nativeGlaze('ceramic')!;
  assert.ok(j.extensionsUsed.includes('KHR_materials_clearcoat'));assert.ok(j.materials.length>0);
  for(const m of j.materials)assert.deepEqual(m.extensions.KHR_materials_clearcoat,{clearcoatFactor:glaze.intensity,clearcoatRoughnessFactor:glaze.roughness});
 }
 assert.equal(nativeGlaze('fabric'),undefined);assert.equal(nativeGlaze('wood'),undefined);
});
test('all portable actor fabric embeds exact Web weave/normal bytes, repeat and tangent frame',()=>{
 for(const kind of ['misaki','visitor-a','visitor-b'] as const){
  const bytes=buildNativeCharacterGlb(kind),len=bytes.readUInt32LE(12),j=JSON.parse(bytes.subarray(20,20+len).toString()),start=28+len;assert.ok(j.extensionsUsed.includes('KHR_texture_transform'));
  for(const m of j.materials.filter((m:any)=>m.extras.semanticRole==='fabric')){
   const spec=m.extras.surfaceFinish?surfaceFinishSpec(m.extras.surfaceFinish):nativeClothMaterial;
   for(const [tex,path]of [[m.pbrMetallicRoughness.baseColorTexture,spec.baseColor],[m.normalTexture,spec.normal]] as const){
    assert.deepEqual(tex.extensions.KHR_texture_transform.scale,[spec.repeat,spec.repeat]);const v=j.bufferViews[j.images[j.textures[tex.index].source].bufferView];assert.deepEqual(bytes.subarray(start+v.byteOffset,start+v.byteOffset+v.byteLength),fs.readFileSync(path.replace('/assets/','assets/masters/')));
   }assert.equal(m.normalTexture.scale,spec.normalScale);
  }
  for(const g of nativeCharacterParts(kind).flatMap(p=>nativeGrouped(p.recipe)).filter(g=>g.role==='fabric')){
   assert.equal(g.geometry.tangents!.length,g.geometry.positions.length/3*4);for(let i=0;i<g.geometry.positions.length/3;i++){const t=g.geometry.tangents!.slice(i*4,i*4+3),n=g.geometry.normals.slice(i*3,i*3+3);assert.ok(Math.abs(Math.hypot(...t)-1)<1e-10);assert.ok(Math.abs(t.reduce((s,v,k)=>s+v*n[k],0))<1e-10);}
  }
 }
});
