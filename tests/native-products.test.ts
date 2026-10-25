import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {catalog} from '../src/core/contracts';
import {nativeProductRecipe} from '../src/art/native-products';
import {productRecipe} from '../src/art/recipes';
import {nativeSurfaceGeometry} from '../src/art/native-characters';
test('rebuilt native products preserve every SKU, finite sculpt geometry and exact master and source hashes match runtime',()=>{
 const master=JSON.parse(fs.readFileSync('assets/masters/native-v3/products-v3.json','utf8')),m=JSON.parse(fs.readFileSync('assets/authoring/native-v3/products-manifest.json','utf8')),sha=(b:Buffer)=>createHash('sha256').update(b).digest('hex');
 for(const o of catalog.offerings){const parts=nativeProductRecipe(o.id,o.color);assert.notDeepEqual(parts,productRecipe(o.id,o.color));assert.deepEqual(master.recipes.find((r:{id:string})=>r.id===o.id).parts,parts);for(const p of parts){const g=nativeSurfaceGeometry(p);assert.ok(g.positions.every(Number.isFinite));assert.ok(g.normals.every(Number.isFinite));}}
 assert.equal(master.recipes.length,catalog.offerings.length);assert.equal(sha(fs.readFileSync(m.file)),m.sha256);for(const [p,digest] of Object.entries(m.sourceSha256))assert.equal(sha(fs.readFileSync(p)),digest);
});
