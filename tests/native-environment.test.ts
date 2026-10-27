import {nativeSurfaceGeometry,type NativeSurface} from '../src/art/native-characters';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {geometry} from '../src/art/geometry';
import {roomRecipe,type Part,type V3} from '../src/art/recipes';
import {nativeRoomRecipe,nativeDoorContract,doorLeafRecipe,doorSignRecipe,plantParts,exteriorRecipe,nativeCounterRecipe,nativeDisplayRecipe} from '../src/art/native-environment';

const sub=(a:number[],b:number[])=>a.map((v,i)=>v-b[i]);
const cross=(a:number[],b:number[])=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const dot=(a:number[],b:number[])=>a.reduce((n,v,i)=>n+v*b[i],0);
function rayHit(recipe:NativeSurface[],origin:V3,direction:V3,maxT:number){
 for(const p of recipe){const g=nativeSurfaceGeometry(p);for(let i=0;i<g.indices.length;i+=3){
  const a=g.positions.slice(g.indices[i]*3,g.indices[i]*3+3),b=g.positions.slice(g.indices[i+1]*3,g.indices[i+1]*3+3),c=g.positions.slice(g.indices[i+2]*3,g.indices[i+2]*3+3);
  const e1=sub(b,a),e2=sub(c,a),h=cross(direction,e2),det=dot(e1,h);if(Math.abs(det)<1e-10)continue;
  const inv=1/det,s=sub(origin,a),u=inv*dot(s,h);if(u<0||u>1)continue;const q=cross(s,e1),v=inv*dot(direction,q);if(v<0||u+v>1)continue;
  const t=inv*dot(e2,q);if(t>1e-8&&t<maxT)return true;
 }}return false;
}

test('native entry is a genuine gap through the back wall, including its skirting',()=>{
 const room=nativeRoomRecipe();
 for(const x of [2.50,2.75,3.05,3.35,3.60])for(const y of [.21,.50,1.0,1.60,2.25,2.45]){
  assert.equal(rayHit(room,[x,y,3.0],[0,0,1],.55),false,`wall across doorway at ${x},${y}`);
 }
 assert.equal(rayHit(room,[2,1,3.0],[0,0,1],.55),true,'left wall remains');
 assert.equal(rayHit(room,[4,1,3.0],[0,0,1],.55),true,'right wall remains');
 assert.equal(rayHit(room,[3.05,2.95,3.0],[0,0,1],.55),true,'lintel remains');
 assert.equal(rayHit(roomRecipe(),[3.05,1,3.0],[0,0,1],.55),true,'test distinguishes old blocked entry');
});

test('door hinge opens the real leaf outside and clears the reserved central traveler radius',()=>{
 const {hinge,openRadians,crossingOpenRadians}=nativeDoorContract;
 assert.equal(hinge[0],2.34);assert.ok(openRadians<0);assert.ok(Math.abs(openRadians)>crossingOpenRadians);
 const points=doorLeafRecipe().flatMap(p=>{const g=nativeSurfaceGeometry(p),out:number[][]=[];for(let i=0;i<g.positions.length;i+=3)out.push(g.positions.slice(i,i+3));return out;});
 const transformed=points.map(([x,y,z])=>[hinge[0]+x*Math.cos(openRadians)+z*Math.sin(openRadians),hinge[1]+y,hinge[2]-x*Math.sin(openRadians)+z*Math.cos(openRadians)]);
 assert.ok(Math.max(...transformed.map(p=>p[2]))>4.5,'leaf is opened toward +Z exterior');
 assert.ok(Math.max(...transformed.map(p=>p[0]))<3.05-.24,'fully opened leaf clears traveler body');
 assert.equal(rayHit(doorLeafRecipe(),[.71,1,-.20],[0,0,1],.4),true,'closed leaf has real glass geometry');
 assert.ok(doorSignRecipe().every(p=>nativeSurfaceGeometry(p).positions.every(Number.isFinite)));
});

test('plant movement is authored on seven local leaf attachments, never on pot or roots',()=>{
 const full=plantParts(1),small=plantParts(.38);assert.equal(full.leaves.length,7);
 assert.ok(full.base.some(p=>p.role==='ceramic'));assert.ok(full.base.every(p=>p.role!=='leaf'));
 assert.ok(full.leaves.every(l=>l.recipe.every(p=>p.role==='leaf')));
 const rest=JSON.stringify(full.base);
 for(let frame=0;frame<120;frame++)for(const [i,leaf] of full.leaves.entries()){
  const angle=Math.sin(frame*.01+i*1.7)*.018;
  for(const p of leaf.recipe){const g=nativeSurfaceGeometry(p);for(let j=0;j<g.positions.length;j+=3){const y=g.positions[j+1],z=g.positions[j+2];assert.ok(Number.isFinite(leaf.pivot[1]+y*Math.cos(angle)-z*Math.sin(angle)));}}
 }
 assert.equal(JSON.stringify(full.base),rest,'base remains unchanged while leaf-local transforms are sampled');
 for(let i=0;i<full.leaves.length;i++)for(let k=0;k<3;k++)assert.ok(Math.abs(small.leaves[i].pivot[k]-full.leaves[i].pivot[k]*.38)<1e-12);
 assert.throws(()=>plantParts(0),RangeError);assert.throws(()=>plantParts(NaN),RangeError);
});

test('new environment recipes retain finite unit normals, bounded geometry and material intent',()=>{
 const all=[...nativeRoomRecipe(),...doorLeafRecipe(),...doorSignRecipe(),...exteriorRecipe(),...nativeCounterRecipe(),...nativeDisplayRecipe(),...plantParts().base,...plantParts().leaves.flatMap(l=>l.recipe)];
 assert.ok(all.length<160,'small fixed scene authoring budget');
 for(const p of all){const g=nativeSurfaceGeometry(p);assert.ok(g.positions.every(Number.isFinite));assert.ok(g.indices.length>0);for(let i=0;i<g.normals.length;i+=3)assert.ok(Math.abs(Math.hypot(...g.normals.slice(i,i+3))-1)<1e-8);}
 assert.ok(exteriorRecipe().some(p=>p.role==='leaf'));
 assert.ok(nativeCounterRecipe().some(p=>p.role==='metal'));
});

test('all five Minimal FX explanations retain people and separate accessibility motion',()=>{
 const expected={en:['customer walking','Reduce Motion'], 'zh-HK':['保留顧客步行','減少動態'],'zh-CN':['保留顾客步行','减少动态'],ja:['客の歩行','別の設定'],th:['การเดินของลูกค้า','การตั้งค่าแยก']};
 for(const [locale,words] of Object.entries(expected)){const d=JSON.parse(fs.readFileSync(new URL(`../src/content/${locale}.json`,import.meta.url),'utf8'));for(const word of words)assert.ok(d.minimalFXNote.includes(word),`${locale}: ${word}`);}
});

test('portable environment master and source manifest match the actual runtime authoring',()=>{
 const masterURL=new URL('../assets/masters/native-v3/environment-v3.json',import.meta.url),manifestURL=new URL('../assets/authoring/native-v3/environment/manifest.json',import.meta.url);
 const bytes=fs.readFileSync(masterURL),master=JSON.parse(bytes.toString()),manifest=JSON.parse(fs.readFileSync(manifestURL,'utf8'));
 const hash=(data:Buffer)=>crypto.createHash('sha256').update(data).digest('hex');
 assert.equal(manifest.master.sizeBytes,bytes.length);assert.equal(manifest.master.sha256,hash(bytes));
 for(const [file,sha] of Object.entries(manifest.sources))assert.equal(hash(fs.readFileSync(new URL('../'+file,import.meta.url))),sha,`authoring changed without rebuild: ${file}`);
 assert.deepEqual(master.room,nativeRoomRecipe());assert.deepEqual(master.door,{contract:nativeDoorContract,leaf:doorLeafRecipe(),sign:doorSignRecipe()});
 assert.deepEqual(master.counter,nativeCounterRecipe());assert.deepEqual(master.display,nativeDisplayRecipe());assert.deepEqual(master.exterior,exteriorRecipe());
 for(const p of master.plants){const {scale,...parts}=p;assert.deepEqual(parts,JSON.parse(JSON.stringify(plantParts(scale))));}
 assert.equal(master.format,'engine-neutral-recipe-json');
});
