import {nativeSurfaceGeometry,type NativeSurface} from '../src/art/native-characters';
import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {createHash} from 'node:crypto';
import {nativeStylingRecipe,nativeWindowCanopy} from '../src/art/native-styling';import {geometry} from '../src/art/geometry';import {nativeGrouped} from '../src/art/native-characters';
import {nativeDoorContract} from '../src/art/native-environment';
test('v9 fixed styling keeps real entry corridor clear and uses bounded original geometry',()=>{
 const styling=nativeStylingRecipe(),canopy=nativeWindowCanopy();assert.ok(styling.length+canopy.length<100);let triangles=0;
 for(const part of [...styling,...canopy]){const g=nativeSurfaceGeometry(part);triangles+=g.indices.length/3;assert.ok(g.positions.every(Number.isFinite));for(let i=0;i<g.normals.length;i+=3)assert.ok(Math.abs(Math.hypot(...g.normals.slice(i,i+3))-1)<1e-9);
  for(let i=0;i<g.positions.length;i+=3){const [x,y,z]=g.positions.slice(i,i+3);assert.ok(!(x>nativeDoorContract.aperture.minX&&x<nativeDoorContract.aperture.maxX&&y>.1&&y<2.5&&z>3.0&&z<3.6),'fixed decoration blocks threshold');}
 }
 assert.ok(triangles<16000,'bounded fixed dressing, no frame-time spawned assets');assert.ok(nativeGrouped(styling).length<18);assert.ok(canopy.every(p=>p.at[0]<-4.6),'outside canopy never crosses glass into shop');
});
test('v9 source master retains all actual fixed styling and canopy for native reuse',()=>{
 const m=JSON.parse(fs.readFileSync('assets/masters/native-v3/environment-v3.json','utf8'));assert.deepEqual(m.styling,nativeStylingRecipe());assert.deepEqual(m.windowCanopy,nativeWindowCanopy());
});
test('v9 original lossless material inputs have matching runtime/master bytes and declared hashes',()=>{
 const m=JSON.parse(fs.readFileSync('assets/masters/native-v9/surfaces.json','utf8'));assert.equal(m.assets.length,5);
 for(const record of m.assets){const master=fs.readFileSync('assets/masters/native-v9/'+record.file),web=fs.readFileSync('public/assets/native-v9/'+record.file);assert.deepEqual(master,web);assert.equal(createHash('sha256').update(master).digest('hex'),record.sha256);assert.equal(master.readUInt32BE(16),512);assert.equal(master.readUInt32BE(20),512);}
});
