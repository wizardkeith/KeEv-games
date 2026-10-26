import test from 'node:test';import assert from 'node:assert/strict';
import {Ray} from '@babylonjs/core/Culling/ray.core';import {Vector3} from '@babylonjs/core/Maths/math.vector';
import {nativeProductRecipe} from '../src/art/native-products';import {nativeSurfaceGeometry} from '../src/art/native-characters';import {displaySamples} from '../src/art/native-display';import {stagedProducts} from '../src/art/staged-products-v11';import {nativeDisplayRecipe} from '../src/art/native-environment';import {artDirection} from '../src/art/direction';
test('hand-scale pencil is continuous at shaft, ferrule, wood and graphite; all parts retain the existing axis',()=>{
 const parts=nativeProductRecipe('off.pencil','#BBA368'),g=parts.map(nativeSurfaceGeometry),points=g.flatMap(g=>Array.from({length:g.positions.length/3},(_,i)=>g.positions.slice(i*3,i*3+3))),bounds=[0,1,2].map(k=>[Math.min(...points.map(p=>p[k])),Math.max(...points.map(p=>p[k]))]);
 assert.ok(Math.abs(bounds[0][1]-bounds[0][0]-.213)<1e-8);assert.ok(bounds[1][1]-bounds[1][0]<.012&&bounds[2][1]-bounds[2][0]<.012,'hand scale, not the former46mm thick rod');
 for(const[x,ids]of [[.070,[0,1]],[.097,[1,2]]]as[number,number[]][]){for(const id of ids)assert.ok(g[id].positions.some((v,i)=>i%3===0&&Math.fround(v)===Math.fround(x)),'adjoining endpoints are identical at actual WebGL/glTF float32 precision');}
 const xBounds=(n:number)=>[Math.min(...g[n].positions.filter((_,i)=>i%3===0)),Math.max(...g[n].positions.filter((_,i)=>i%3===0))];assert.ok(xBounds(3)[1]>xBounds(0)[0]&&xBounds(3)[0]<xBounds(7)[1],'continuous ferrule overlaps both wood shaft and eraser');
});
test('every owned pencil is separate and rests on actual table or riser geometry for all three tables and counts',()=>{
 const partCount=nativeProductRecipe('off.pencil','#BBA368').length;
 for(const table of [0,1,2])for(let count=0;count<=9;count++){
  const samples=displaySamples('off.pencil',count,table),parts=stagedProducts('off.pencil','#BBA368',count,table),fixture=nativeDisplayRecipe(table).map(nativeSurfaceGeometry);assert.equal(samples.length,Math.min(count,8));assert.equal(parts.length,samples.length*partCount);
  const boxes:{lo:number[];hi:number[]}[]=[];
  for(let k=0;k<samples.length;k++){
   const points=parts.slice(k*partCount,(k+1)*partCount).flatMap(p=>{const g=nativeSurfaceGeometry(p);return Array.from({length:g.positions.length/3},(_,i)=>g.positions.slice(i*3,i*3+3));});const lo=[0,1,2].map(i=>Math.min(...points.map(p=>p[i]))),hi=[0,1,2].map(i=>Math.max(...points.map(p=>p[i])));boxes.push({lo,hi});assert.ok(lo[0]>-.95&&hi[0]<.95&&lo[2]>-.55&&hi[2]<.55);
   const foot=points.find(p=>p[1]===lo[1])!,worldY=foot[1]+artDirection.displaySurfaceY+artDirection.restingGap,ray=new Ray(new Vector3(foot[0],worldY+.002,foot[2]),new Vector3(0,-1,0),.01),hits=[];
   for(const g of fixture)for(let i=0;i<g.indices.length;i+=3){const q=g.indices.slice(i,i+3).map(n=>new Vector3(g.positions[n*3],g.positions[n*3+1]+artDirection.fixtureBaseY,g.positions[n*3+2])),hit=ray.intersectsTriangle(q[0],q[1],q[2]);if(hit)hits.push(hit.distance);}
   assert.ok(hits.length>0&&Math.abs(Math.min(...hits)-.003)<1e-7,`actual1mm support gap, table${table}/count${count}/unit${k}`);
  }
  for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++)assert.ok([0,1,2].some(k=>Math.min(boxes[i].hi[k],boxes[j].hi[k])-Math.max(boxes[i].lo[k],boxes[j].lo[k])<.0001),'no hidden overlapping unit models');
 }
});
