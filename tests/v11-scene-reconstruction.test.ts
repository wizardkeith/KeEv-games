import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {oakFloor,oakFloorLayout} from '../src/art/floor-v11';import {entryGardenRecipe,entryGardenIntent,entryPortalPlanes} from '../src/art/entry-garden-v11';import {nativeDisplayRecipe,nativeCounterRecipe,nativeRoomRecipe} from '../src/art/native-environment';import {nativeSurfaceGeometry,nativeGrouped} from '../src/art/native-characters';import {catalog} from '../src/core/contracts';import {stagedProducts} from '../src/art/staged-products-v11';import {nativeProductRecipe} from '../src/art/native-products';import {surfaceFinishSpec} from '../src/art/surface-finish-v11';import {counterV11Envelope} from '../src/art/fixtures-v11';import {CUSTOMER_OBSTACLES} from '../src/presentation/native-routes';
const bounds=(points:number[][])=>({lo:[0,1,2].map(k=>Math.min(...points.map(p=>p[k]))),hi:[0,1,2].map(k=>Math.max(...points.map(p=>p[k])))});
const points=(g:ReturnType<typeof nativeSurfaceGeometry>)=>Array.from({length:g.positions.length/3},(_,i)=>g.positions.slice(i*3,i*3+3));
test('real narrow X-grain floor has staggered physical boards, same walking elevation, outward faces and matching native PBR inputs',()=>{
 const f=oakFloor();assert.equal(f.length,2);let tri=0;
 for(const p of f){const g=p.geometry,b=bounds(points(g));assert.equal(p.finish,'oak-floor');assert.equal(p.roughness,.83);assert.ok(Math.abs(b.hi[1]-.079)<1e-10&&Math.abs(b.lo[1]-.061)<1e-10);tri+=g.indices.length/3;
  for(let i=0;i<g.indices.length;i+=3){const ids=g.indices.slice(i,i+3),[a,b,c]=ids.map(n=>g.positions.slice(n*3,n*3+3)),u=b.map((v,k)=>v-a[k]),v=c.map((v,k)=>v-a[k]),n=g.normals.slice(ids[0]*3,ids[0]*3+3);assert.ok((u[1]*v[2]-u[2]*v[1])*n[0]+(u[2]*v[0]-u[0]*v[2])*n[1]+(u[0]*v[1]-u[1]*v[0])*n[2]>0,'effective CCW faces point outward');}
  // Each top quad is one actual board, not a repeated joint image.
  for(let i=0;i<g.positions.length;i+=120){const top=Array.from({length:4},(_,j)=>g.positions.slice(i+j*3,i+j*3+3)),b=bounds(top);assert.ok(b.hi[0]-b.lo[0]>b.hi[2]-b.lo[2],'long boards along X');assert.ok(b.hi[2]-b.lo[2]<.18);}
 }
 assert.ok(tri<4500);assert.equal(oakFloorLayout.rows,36);const s=surfaceFinishSpec('oak-floor');assert.equal(s.repeat,1);
 const bytes=fs.readFileSync('assets/masters/native-v4/room.glb'),len=bytes.readUInt32LE(12),j=JSON.parse(bytes.subarray(20,20+len).toString()),start=28+len,m=j.materials.filter((m:any)=>m.extras?.surfaceFinish==='oak-floor');assert.equal(m.length,2);
 for(const material of m)for(const[t,path]of[[material.pbrMetallicRoughness.baseColorTexture,s.baseColor],[material.normalTexture,s.normal],[material.pbrMetallicRoughness.metallicRoughnessTexture,s.orm]]as const){const v=j.bufferViews[j.images[j.textures[t.index].source].bufferView],master=fs.readFileSync(path.replace('/assets/','assets/masters/'));assert.deepEqual(bytes.subarray(start+v.byteOffset,start+v.byteOffset+v.byteLength),master);assert.deepEqual(fs.readFileSync('public'+path),master);}
});
test('three furniture variants have distinct actual cabinet meshes, disconnected platforms and bounded compiled draw groups',()=>{
 const recipes=[0,1,2].map(nativeDisplayRecipe);assert.equal(new Set(recipes.map(p=>JSON.stringify(p))).size,3);
 for(const r of recipes){const b=bounds(r.flatMap(p=>points(nativeSurfaceGeometry(p))));assert.ok(b.lo[0]>=-1.301&&b.hi[0]<=.951&&b.lo[2]>=-.562&&b.hi[2]<=.551);assert.ok(nativeGrouped(r).length<=16);assert.ok(r.reduce((n,p)=>n+nativeSurfaceGeometry(p).indices.length/3,0)<5000);}
 // At riser height the old uninterrupted >1.4m cross-table plank is absent.
 for(const r of recipes)for(const p of r){const g=nativeSurfaceGeometry(p);for(let i=0;i<g.indices.length;i+=3){const t=g.indices.slice(i,i+3).map(n=>g.positions.slice(n*3,n*3+3));if(t.every(q=>q[1]>1.05&&Math.abs(q[1]-t[0][1])<1e-8)&&p.role==='wood')assert.ok(Math.max(...t.map(p=>p[0]))-Math.min(...t.map(p=>p[0]))<.60);}}
});
test('all existing product counts preserve their surviving geometry prefix and separated actual stock on all reconstructed fixtures',()=>{
 for(const o of catalog.offerings)for(const table of [0,1,2]){
  const size=nativeProductRecipe(o.id,o.color).length;let previous:string|undefined;
  for(let count=0;count<=9;count++){
   const r=stagedProducts(o.id,o.color,count,table);assert.equal(r.length,Math.min(count,8)*size);
   if(previous!==undefined)assert.equal(JSON.stringify(r.slice(0,Math.min(count-1,8)*size)),previous,'buy/settle does not rearrange surviving units');previous=JSON.stringify(r);
   const boxes=Array.from({length:Math.min(count,8)},(_,i)=>bounds(r.slice(i*size,(i+1)*size).flatMap(p=>points(nativeSurfaceGeometry(p)))));
   for(const b of boxes)assert.ok(b.lo[0]>(table===1?-.95:-.31)&&b.hi[0]<.95&&b.lo[2]>-.55&&b.hi[2]<.55,'stock fits each actual tabletop; central fixed-prop clearance is checked against actual relocated meshes in central-composition tests');
   for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++)assert.ok([0,1,2].some(k=>Math.min(boxes[i].hi[k],boxes[j].hi[k])-Math.max(boxes[i].lo[k],boxes[j].lo[k])<.001),`${o.id}/${table}/${count}/${i}/${j}`);
  }
 }
});
test('entrance courtyard uses real bounded meshes outside door sweep, clipped through actual aperture for each allowed orbit',()=>{
 const r=entryGardenRecipe(),b=bounds(r.flatMap(p=>points(nativeSurfaceGeometry(p))));assert.ok(b.lo[2]>=entryGardenIntent.minZ);assert.ok(b.lo[1]>=.015-1e-9);assert.ok(r.length<=8);assert.ok(r.reduce((n,p)=>n+nativeSurfaceGeometry(p).indices.length/3,0)<10000);assert.ok(!catalog.offerings.some(o=>o.id.includes('garden')));
 for(const x of [4.5,6.1,8])for(const z of [-7,-5.4,-3]){const camera:[number,number,number]=[x,7.56,z],planes=entryPortalPlanes(camera),inside=[3.05,1.33,3.30],outside=[1.5,1.33,3.30];assert.ok(planes.every(p=>p.slice(0,3).reduce((s,v,k)=>s+v*inside[k],p[3])<0));assert.ok(planes.some(p=>p.slice(0,3).reduce((s,v,k)=>s+v*outside[k],p[3])>0));}
});
test('wider foreground counter and conservative route blocker agree while original register surface height stays fixed',()=>{
 const b=bounds(nativeCounterRecipe().flatMap(p=>points(nativeSurfaceGeometry(p)))),c=CUSTOMER_OBSTACLES.find(p=>p.id==='counter')!;
 assert.ok(Math.abs(b.lo[0]+2.6-counterV11Envelope.minX)<1e-8);assert.ok(Math.abs(b.hi[0]+2.6-counterV11Envelope.maxX)<1e-8);assert.ok(Math.abs(c.x-c.halfX-counterV11Envelope.minX)<1e-8&&Math.abs(c.x+c.halfX-counterV11Envelope.maxX)<1e-8);
 assert.ok(nativeRoomRecipe().length<50,'material-compiled architecture keeps actual adapter draw grouping');
});
