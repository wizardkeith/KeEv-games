import test from 'node:test';
import assert from 'node:assert/strict';
import {nativeCharacterParts,nativeGrouped} from '../src/art/native-characters';
import {buildV10Character} from '../src/art/characters-v10';
import {v11FaceZ} from '../src/art/character-v11';
import {buildV11Garden,buildV11Plant} from '../src/art/shop-v11';
test('V11 painted facial features attach to actual sculpt while preserving contact rig',()=>{
 const old=buildV10Character('misaki'),parts=nativeCharacterParts('misaki');
 for(const p of old.filter(p=>/^(forearm|hand|socket|leg|shin|foot)-/.test(p.id)))assert.deepEqual(parts.find(x=>x.id===p.id),p);
 for(const id of ['eye-left','eye-right','eyelid-left','eyelid-right','mouth','brow-left','brow-right']){
  const p=parts.find(p=>p.id===id)!;
  for(const s of p.recipe){assert.equal(s.shape,'mesh');if(s.shape!=='mesh')continue;for(let i=0;i<s.geometry.positions.length;i+=3){const [x,y,z]=s.geometry.positions.slice(i,i+3).map((v,k)=>v+p.pivot[k]);const gap=v11FaceZ(x,y)-z;assert.ok(s.baseColorTexture?gap>=.0007&&gap<=.0012:gap>=-.00006&&gap<=.0045,`${id}: actual skin gap ${gap}`);}}
 }
 const face=nativeGrouped(parts.find(p=>p.id==='head')!.recipe).find(g=>g.baseColorTexture?.endsWith('misaki-skin.png'));assert.ok(face);assert.equal(face!.color,'#FFFFFF');assert.equal(face!.geometry.uvs.length,face!.geometry.positions.length/3*2);
});
test('V11 garden is batched and plant retains seven articulated leaf attachments',()=>{
 const garden=buildV11Garden();assert.ok(garden.length<=8);const plant=buildV11Plant();assert.equal(plant.leaves.length,7);
 for(const p of [...garden,...plant.base,...plant.leaves.flatMap(p=>p.recipe)])if(p.shape==='mesh'){assert.ok(p.geometry.positions.every(Number.isFinite));assert.equal(p.geometry.normals.length,p.geometry.positions.length);assert.ok(p.geometry.indices.every(n=>Number.isSafeInteger(n)&&n>=0&&n<p.geometry.positions.length/3));}
});
