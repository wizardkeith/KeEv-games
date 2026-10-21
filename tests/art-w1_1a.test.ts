import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {geometry,grouped} from '../src/art/geometry';
import {materialRoles,materialSpec} from '../src/art/materials';
import {productRecipe,personParts,personRecipe,type Part,type V3} from '../src/art/recipes';
const dot=(a:number[],b:number[])=>a.reduce((v,x,i)=>v+x*b[i],0);
const length=(v:number[])=>Math.hypot(...v);
const normalize=(v:number[])=>v.map(x=>x/length(v));
const sub=(a:number[],b:number[])=>a.map((x,i)=>x-b[i]);
const cross=(u:number[],v:number[])=>[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];
const at=(x:number[],i:number)=>x.slice(i*3,i*3+3);
const derivative=(surface:(u:number,v:number)=>number[],u:number,v:number,axis:0|1)=>{const e=1e-5;return sub(surface(u+(axis===0?e:0),v+(axis===1?e:0)),surface(u-(axis===0?e:0),v-(axis===1?e:0)));};
const perpendicular=(normal:number[],tangent:number[])=>{assert.ok(Math.abs(dot(normal,normalize(tangent)))<1e-8,`normal/tangent dot ${dot(normal,normalize(tangent))}`);};
const part=(shape:Part['shape'],size:V3,extra:Partial<Part>={}):Part=>({shape,size,at:[0,0,0],color:'#FFFFFF',...extra});

test('ellipsoid normals are perpendicular to both true nonuniform surface tangents',()=>{
 const g=geometry(part('sphere',[4,1.4,.6]));const surface=(a:number,t:number)=>[2*Math.sin(t)*Math.cos(a),.7*Math.cos(t),.3*Math.sin(t)*Math.sin(a)];
 for(let row=1;row<8;row++)for(let col=0;col<12;col++){const a=col*2*Math.PI/12,t=row*Math.PI/8,n=at(g.normals,row*13+col);perpendicular(n,derivative(surface,a,t,0));perpendicular(n,derivative(surface,a,t,1));assert.ok(dot(n,at(g.positions,row*13+col))>0);}
});
test('tapered elliptical cylinder normals include slope and cross-section scale',()=>{
 const g=geometry(part('cylinder',[1.8,2,.6],{top:.25}));const surface=(a:number,y:number)=>[.9*(1-.75*y)*Math.cos(a),2*(y-.5),.3*(1-.75*y)*Math.sin(a)];
 for(let row=0;row<2;row++)for(let col=0;col<12;col++){const a=col*2*Math.PI/12,n=at(g.normals,row*13+col);perpendicular(n,derivative(surface,a,row,0));perpendicular(n,derivative(surface,a,row,1));assert.ok(n[1]>0,'narrowing upper end yields upward side normal');}
});
test('elliptically stretched torus uses inverse-transpose normals',()=>{
 const g=geometry(part('torus',[1.2,.18,.54]));const r=.51,t=.09,stretch=.45;const surface=(a:number,b:number)=>[(r+t*Math.cos(b))*Math.cos(a),t*Math.sin(b),(r+t*Math.cos(b))*Math.sin(a)*stretch];
 for(let i=0;i<20;i++)for(let j=0;j<6;j++){const a=i*2*Math.PI/20,b=j*2*Math.PI/6,n=at(g.normals,i*7+j);perpendicular(n,derivative(surface,a,b,0));perpendicular(n,derivative(surface,a,b,1));}
});
test('rotation preserves tangent-normal orthogonality and unit normals',()=>{
 const turn=.61,rot=(v:number[])=>[v[0]*Math.cos(turn)-v[1]*Math.sin(turn),v[0]*Math.sin(turn)+v[1]*Math.cos(turn),v[2]],p=part('sphere',[1.7,.8,.4],{turn:[0,0,turn],at:[2,-1,3]}),g=geometry(p);
 const surface=(a:number,t:number)=>rot([.85*Math.sin(t)*Math.cos(a),.4*Math.cos(t),.2*Math.sin(t)*Math.sin(a)]);
 for(let row=1;row<8;row++)for(let col=0;col<12;col++){const a=col*2*Math.PI/12,t=row*Math.PI/8,n=at(g.normals,row*13+col);assert.ok(Math.abs(length(n)-1)<1e-12);perpendicular(n,derivative(surface,a,t,0));perpendicular(n,derivative(surface,a,t,1));}
});
test('product curves and hollow mug have finite unit normals and correctly oriented nondegenerate triangles',()=>{
 for(const id of ['notebook','pencil','mug','tote','tea','cookie','card','towel','tray','vase'])for(const p of productRecipe('off.'+id)){
  const g=geometry(p);assert.ok(g.positions.every(Number.isFinite));for(let i=0;i<g.normals.length/3;i++)assert.ok(Math.abs(length(at(g.normals,i))-1)<1e-10);
  for(let i=0;i<g.indices.length;i+=3){const ids=g.indices.slice(i,i+3),a=at(g.positions,ids[0]),normal=cross(sub(at(g.positions,ids[1]),a),sub(at(g.positions,ids[2]),a)),average=[0,1,2].map(k=>ids.reduce((n,id)=>n+g.normals[id*3+k],0));assert.ok(length(normal)>1e-14);assert.ok(dot(normal,average)>0,`${id} has reversed winding`);}
 }
 const inside=productRecipe('off.mug').find(p=>p.inside)!;const g=geometry(inside);assert.ok(g.normals[0]<0,'inside wall points into the empty cavity');assert.equal(g.positions.length/3,26,'open shell has no cap across cup opening');
});
test('same-color different semantic materials remain distinct in grouping',()=>{
 const groups=grouped([part('box',[1,1,1],{role:'wood'}),part('box',[1,1,1],{role:'ceramic'}),part('box',[1,1,1],{role:'wood'})]);assert.equal(groups.length,2);assert.notEqual(groups[0].materialId,groups[1].materialId);assert.equal(groups[0].geometry.positions.length,2*groups[1].geometry.positions.length);assert.ok(materialSpec('ceramic').roughness<materialSpec('wood').roughness);assert.ok(materialSpec('paper').roughness>materialSpec('ceramic').roughness);assert.ok(materialSpec('metal').metallic>0);
 for(const role of materialRoles){const s=materialSpec(role);assert.ok(s.id.startsWith('mat.'));assert.ok(s.roughness>=0&&s.roughness<=1&&s.metallic>=0&&s.metallic<=1);}
});
test('generic semantic pivots flatten to exactly the static recipe without lost parts',()=>{
 const parts=personParts('#9E8CAA');assert.deepEqual(parts.map(p=>p.id),['body','head','arm-left','arm-right']);assert.deepEqual(parts.flatMap(x=>x.recipe),personRecipe('#9E8CAA'));assert.ok(parts.every(p=>p.pivot.every(Number.isFinite)));assert.ok(parts.find(p=>p.id==='head')!.recipe.some(p=>p.role==='skin'));assert.ok(parts.find(p=>p.id==='body')!.recipe.some(p=>p.role==='fabric'));
});
test('previous W1.1 GLB master and Web bytes remain unchanged',()=>{
 const manifest=JSON.parse(fs.readFileSync('assets/authoring/w1_1/manifest.json','utf8'));assert.equal(manifest.assets.length,15);for(const a of manifest.assets)for(const f of [a.file,a.web])assert.equal(crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex'),a.sha256,`retained ${f}`);
});
