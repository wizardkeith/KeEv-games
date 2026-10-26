import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {Ray} from '@babylonjs/core/Culling/ray.core';
import {Vector3} from '@babylonjs/core/Maths/math.vector';
import {centralFlowerSprayRecipe,centralLinenRecipe} from '../src/art/display-quality-v11';
import {nativeSurfaceGeometry,type NativeSurface} from '../src/art/native-characters';
const originalMasters={"assets/masters/native-v11/display-quality/flower-spray.json": "b41b3afee5e7ed42b37058de62cdfcadee805965f96c5cedb6ea7b67e17334f0", "assets/masters/native-v11/display-quality/flower-spray.blend": "005389a2d8acbcefdcf1ed8dc1e73f4b67b6b4620ab2624f9eba37b25d44e777", "assets/masters/native-v11/display-quality/linen-rest.json": "1494d11f882da3d8caf607b2b07270a9caa3fda489c2522069db78d5786702ad", "assets/masters/native-v11/display-quality/linen-rest.blend": "a9618357aa476c26ab556bdfe52e0ae5eac9c8ff7a6a892ebb736b19197a867f"};
test('C29 keeps original C25/C28 editable masters and accepted192 reflection bytes',()=>{
 for(const[p,h]of Object.entries(originalMasters))assert.equal(createHash('sha256').update(fs.readFileSync(p)).digest('hex'),h,p);
 assert.equal(createHash('sha256').update(fs.readFileSync('public/assets/native-v11/soft-window-specular.env')).digest('hex'),'ab2ddab4e6f5b7e64370f7ba2fb63497326a4f19b669a5ccb459cfef8e2f3258');
});
test('compound petal surfaces keep upper/lower shading separate instead of cancelling the thin rim normals',()=>{
 const flowers=centralFlowerSprayRecipe().filter(p=>p.role==='paper');assert.equal(flowers.length,120);
 const provenance=JSON.parse(fs.readFileSync('assets/masters/native-v11/display-quality/flower-spray-c29-provenance.json','utf8'));
 assert.equal(provenance.heads.length,6);assert.equal(provenance.heads.reduce((n:number,h:{n:number})=>n+h.n,0),flowers.length);
 assert.ok(Math.max(...provenance.heads.map((h:{n:number})=>h.n))>=2*Math.min(...provenance.heads.map((h:{n:number})=>h.n)),'authored density variation, not equally spaced identical heads');
 for(const p of flowers){const g=nativeSurfaceGeometry(p);assert.equal(g.indices.length/3,10);for(let i=0;i<6;i++)assert.ok(g.normals[i*3+1]>.5,'whole upper petal faces remain upward, not seam-averaged to sideways');for(let i=6;i<12;i++)assert.ok(g.normals[i*3+1]<-.5,'underside keeps its own physically downward normals');for(let i=0;i<g.indices.length;i+=3){const[a,b,c]=g.indices.slice(i,i+3),v=[a,b,c].map(k=>Vector3.FromArray(g.positions.slice(k*3,k*3+3))),face=Vector3.Cross(v[1].subtract(v[0]),v[2].subtract(v[0])).normalize();assert.ok([a,b,c].every(k=>Vector3.Dot(face,Vector3.FromArray(g.normals.slice(k*3,k*3+3)))>.5),'normals agree with actual winding on both sides');}}
});
test('new linen preserves actual support heights while broad primary folds and arclength UV remain real geometry',()=>{
 const now=nativeSurfaceGeometry(centralLinenRecipe()[0]),old=nativeSurfaceGeometry(JSON.parse(fs.readFileSync('assets/masters/native-v11/display-quality/linen-rest.json','utf8'))as NativeSurface);
 const height=(g:typeof now,x:number,z:number)=>{const ray=new Ray(new Vector3(x,1.2,z),Vector3.Down(),1),hits=[];for(let i=0;i<g.indices.length;i+=3){const pts=g.indices.slice(i,i+3).map(k=>Vector3.FromArray(g.positions.slice(k*3,k*3+3))),hit=ray.intersectsTriangle(pts[0],pts[1],pts[2]);if(hit)hits.push(hit.distance);}assert.ok(hits.length);return 1.2-Math.min(...hits);};
 for(const x of[-.06,.08,.24,.40,.54])for(const z of[-.45,-.2,.1,.5])assert.ok(Math.abs(height(now,x,z)-height(old,x,z))<1e-7,'actual commodity support surface preserved');
 const band=Array.from({length:now.positions.length/3},(_,i)=>now.positions.slice(i*3,i*3+3)).filter(p=>p[1]>.78&&p[1]<.82).map(p=>p[2]);assert.ok(Math.max(...band)-Math.min(...band)>.035,'normal-scale principal folds, not only texture or bottom-edge wrinkles');
 const provenance=JSON.parse(fs.readFileSync('assets/masters/native-v11/display-quality/linen-c29-provenance.json','utf8'));assert.equal(provenance.primaryGravityFolds,3);assert.ok(provenance.surfaceArcMetres>1.43&&provenance.surfaceArcMetres<1.48);const v=now.uvs!.filter((_,i)=>i%2===1);assert.ok(Math.max(...v)>1.03&&Math.max(...v)<1.06,'fringe uses the same physical fabric scale');
});
