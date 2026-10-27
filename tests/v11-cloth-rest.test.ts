import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Ray} from '@babylonjs/core/Culling/ray.core';
import {Vector3} from '@babylonjs/core/Maths/math.vector';
import {buildV11FemaleRaw} from '../src/art/customer-female-v11';
import {buildV10Character} from '../src/art/characters-v10';
import type {Geometry} from '../src/art/geometry';

const raw=()=>buildV11FemaleRaw(buildV10Character('visitor-b'));
function hits(g:Geometry,origin:Vector3,direction:Vector3,length:number){
 const ray=new Ray(origin,direction,length),distances:number[]=[];
 for(let i=0;i<g.indices.length;i+=3){const p=g.indices.slice(i,i+3).map(n=>Vector3.FromArray(g.positions,n*3)),hit=ray.intersectsTriangle(p[0],p[1],p[2]);if(hit&&hit.distance>=0&&hit.distance<=length)distances.push(hit.distance);}
 return distances.sort((a,b)=>a-b);
}
test('authored rest preserves every accepted shoulder/neck coordinate and the closed source topology',()=>{
 const input=JSON.parse(fs.readFileSync('assets/masters/native-v11/coat-rest-input.json','utf8')).surfaces['body:0'].geometry;
 const body=raw().find(p=>p.id==='body')!.recipe[0];assert.equal(body.shape,'mesh');if(body.shape!=='mesh')return;
 assert.deepEqual(body.geometry.indices,input.indices);let changed=0;
 for(let i=0;i<input.positions.length;i+=3){if(input.positions[i+1]>=.99)assert.deepEqual(body.geometry.positions.slice(i,i+3),input.positions.slice(i,i+3));else if(Math.hypot(...body.geometry.positions.slice(i,i+3).map((v,k)=>v-input.positions[i+k]))>.001)changed++;}
 assert.ok(changed>60,'lower garment is a real different rest shape, not texture-only');
});
test('rolled cuffs are hollow through their axes, with real inner walls and clearance for the wrist',()=>{
 for(const side of [-1,1]){const arm=raw().find(p=>p.id==='arm-'+(side<0?'left':'right'))!,cuff=arm.recipe[1];assert.equal(cuff.shape,'mesh');if(cuff.shape!=='mesh')continue;
  const x=side*.006,g=cuff.geometry;
  assert.deepEqual(hits(g,new Vector3(x,-.26,0),new Vector3(0,1,0),.12),[],'no solid cap across the sleeve opening');
  for(const y of [-.23,-.19]){const d=hits(g,new Vector3(x,y,0),new Vector3(1,0,0),.1);assert.ok(d.length>=2,'closed cloth thickness has inner and outer surfaces');assert.ok(d[0]>.033&&d[0]<.047,'wrist opening remains clear');assert.ok(d.at(-1)!-d[0]>.005,'visible roll has actual thickness');}
 }
});
