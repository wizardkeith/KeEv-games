import test from'node:test';import assert from'node:assert/strict';import fs from'node:fs';import{createHash}from'node:crypto';
import{backwallFormMode}from'../src/art/backwall-forms-v11';import{backDisplaySamples}from'../src/art/native-display';import{fixedSampleBounds}from'../src/art/decor-vignette-v11';import{nativeSurfaceGeometry,type NativeSurface}from'../src/art/native-characters';import{nativeStylingRecipe,nativeWindowCanopy}from'../src/art/native-styling';import{buildV11TrailingGreenery}from'../src/art/shop-v11';
const dir='assets/masters/native-v11/backwall-c37/',read=(file:string)=>JSON.parse(fs.readFileSync(dir+file,'utf8')),tri=(p:NativeSurface[])=>p.reduce((n,x)=>n+nativeSurfaceGeometry(x).indices.length/3,0);
test('C37 remains a scoped authoring variant; default is C36 and fixed sample identities stay non-authoritative',()=>{
 assert.equal(backwallFormMode,'control');const samples=read('fixed-back-samples.json')as ReturnType<typeof backDisplaySamples>,old=backDisplaySamples().filter(s=>s.at[2]>2);assert.deepEqual(samples.map(s=>s.id),old.map(s=>s.id));assert.ok(samples.some((s,i)=>JSON.stringify(s)!==JSON.stringify(old[i])),'a genuine form arrangement, not an identical renamed master');
 for(const s of samples){assert.ok(s.at[2]>2.5&&s.at[2]<3.2);const b=fixedSampleBounds(s.id,s.turn,s.scale),bottom=s.at[1]+b.min,base=[1.0025,1.5225,2.2825].find(y=>bottom>=y&&bottom<y+.5);assert.ok(base!==undefined);assert.ok(Math.abs((bottom-base-.001)/b.height-Math.round((bottom-base-.001)/b.height))<1e-7,'physical shelf/stack support');}
});
test('C37 botanical replacements fit the original combined styling budget without raising the cap or adding a new stock category',()=>{
 const trailing=read('trailing-greenery.json')as NativeSurface[],near=read('window-near-branches.json')as NativeSurface[];
 const total=tri([...nativeStylingRecipe(),...nativeWindowCanopy()])-tri([...buildV11TrailingGreenery(),...nativeWindowCanopy()])+tri([...trailing,...near]);assert.ok(total<16000);
 for(const p of [...trailing,...near,...read('window-mid-far.json')]){const g=nativeSurfaceGeometry(p);assert.ok(g.positions.every(Number.isFinite));assert.ok(g.normals.every(Number.isFinite));assert.ok(g.indices.every(i=>Number.isInteger(i)&&i>=0&&i<g.positions.length/3));}
});
test('original C37 reusable mesh masters have readable exact provenance and remain explicitly unadopted form evidence',()=>{
 const p=read('provenance.json');assert.equal(p.intent.mode,'shape');assert.equal(p.intent.defaultAdopted,false);
 for(const [path,record]of Object.entries(p.files)as[string,{bytes:number;sha256:string}][]){const bytes=fs.readFileSync(path);assert.equal(bytes.length,record.bytes);assert.equal(createHash('sha256').update(bytes).digest('hex'),record.sha256);}
 for(const[path,sha]of Object.entries(p.sources))assert.equal(createHash('sha256').update(fs.readFileSync(path)).digest('hex'),sha,'master source changed without rebuild: '+path);
});
