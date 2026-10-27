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

test('remade hollow ceramics have an open mouth, physical bottom and usable cavity',()=>{
 function vertical(id:string,x=0,z=0){const parts=nativeProductRecipe(id,'#B9AA95'),hits:number[]=[];for(const p of parts){const g=nativeSurfaceGeometry(p);for(let i=0;i<g.indices.length;i+=3){const [a,b,c]=g.indices.slice(i,i+3).map(n=>g.positions.slice(n*3,n*3+3));const det=(b[0]-a[0])*(c[2]-a[2])-(c[0]-a[0])*(b[2]-a[2]);if(Math.abs(det)<1e-12)continue;const u=((x-a[0])*(c[2]-a[2])-(c[0]-a[0])*(z-a[2]))/det,v=((b[0]-a[0])*(z-a[2])-(x-a[0])*(b[2]-a[2]))/det;if(u>=-1e-8&&v>=-1e-8&&u+v<=1+1e-8)hits.push(a[1]+u*(b[1]-a[1])+v*(c[1]-a[1]));}}return Math.max(...hits);}
 assert.ok(Math.abs(vertical('off.mug')-.030)<1e-8,'mouth ray reaches inner bottom, not a fake closed top');assert.ok(vertical('off.mug',.108,0)>.23,'actual rim surrounds cavity');assert.ok(Math.abs(vertical('off.vase')-.027)<1e-8);assert.ok(vertical('off.vase',.048,0)>.38);
});
