import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import crypto from 'node:crypto';
import {floorContactUV,floorContactBake} from '../src/art/floor-bake-v11';
test('V11 real-geometry floor AO retains linear PNG bytes and shared upper-left UV2 in standard GLB',()=>{
 const master=fs.readFileSync('assets/masters/native-v11/shop-floor-contact.png'),web=fs.readFileSync('public/assets/native-v11/shop-floor-contact.png');assert.deepEqual(web,master);assert.equal(master.readUInt32BE(16),1024);assert.equal(master.readUInt32BE(20),1024);
 const receipt=JSON.parse(fs.readFileSync('assets/masters/native-v11/shop-contact-provenance.json','utf8'));assert.equal(receipt.dynamicObjectsIncluded,false);assert.equal(crypto.createHash('sha256').update(master).digest('hex'),receipt.pngSha256);
 assert.deepEqual(floorContactUV([-4.55,.079,3.3,4.55,.079,-3.3]),[0,0,1,1]);
 const b=fs.readFileSync('assets/masters/native-v4/room.glb'),len=b.readUInt32LE(12),doc=JSON.parse(b.subarray(20,20+len).toString()),start=28+len;const floor=doc.materials.flatMap((m:any,index:number)=>m.occlusionTexture?[{m,index}]:[]);assert.equal(floor.length,2);
 for(const {m,index}of floor){assert.equal(m.occlusionTexture.texCoord,1);assert.equal(m.occlusionTexture.strength,floorContactBake.strength);const image=doc.images[doc.textures[m.occlusionTexture.index].source],v=doc.bufferViews[image.bufferView];assert.deepEqual(b.subarray(start+v.byteOffset,start+v.byteOffset+v.byteLength),master);
  for(const p of doc.meshes.flatMap((m:any)=>m.primitives).filter((p:any)=>p.material===index)){const read=(n:number,components:number)=>{const a=doc.accessors[n],v=doc.bufferViews[a.bufferView];return Array.from({length:a.count*components},(_,i)=>b.readFloatLE(start+v.byteOffset+i*4));},pos=read(p.attributes.POSITION,3),uv=read(p.attributes.TEXCOORD_1,2),expected=floorContactUV(pos);assert.equal(uv.length,expected.length);uv.forEach((v,i)=>assert.ok(Math.abs(v-expected[i])<1e-6));}
 }
});
