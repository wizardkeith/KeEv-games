import{execFileSync}from'node:child_process';
import{CUSTOMER_ROUTES,CUSTOMER_ROUTE_CONTRACT}from'../src/presentation/native-routes';
import test from'node:test';import assert from'node:assert/strict';import fs from'node:fs';import{createHash}from'node:crypto';
import{backwallFormMode}from'../src/art/backwall-forms-v11';import{backDisplaySamples}from'../src/art/native-display';import{fixedSampleBounds}from'../src/art/decor-vignette-v11';import{nativeSurfaceGeometry,type NativeSurface}from'../src/art/native-characters';import{nativeStylingRecipe,nativeWindowCanopy}from'../src/art/native-styling';import{buildV11TrailingGreenery}from'../src/art/shop-v11';
const dir='assets/masters/native-v11/backwall-c38/',read=(file:string)=>JSON.parse(fs.readFileSync(dir+file,'utf8')),tri=(p:NativeSurface[])=>p.reduce((n,x)=>n+nativeSurfaceGeometry(x).indices.length/3,0);
test('C38 accepted forms are the development default and fixed sample identities remain non-authoritative',()=>{
 assert.equal(backwallFormMode,'shape');const samples=read('fixed-back-samples.json')as ReturnType<typeof backDisplaySamples>,old=backDisplaySamples().filter(s=>s.at[2]>2);assert.deepEqual(samples.map(s=>s.id),old.map(s=>s.id));assert.deepEqual(samples,old,'ordinary default uses the exact independently passed fixed-sample composition');
 for(const s of samples){assert.ok(s.at[2]>2.5&&s.at[2]<3.2);const b=fixedSampleBounds(s.id,s.turn,s.scale),bottom=s.at[1]+b.min,base=[1.0025,1.5225,2.2825].find(y=>bottom>=y&&bottom<y+.5);assert.ok(base!==undefined);assert.ok(Math.abs((bottom-base-.001)/b.height-Math.round((bottom-base-.001)/b.height))<1e-7,'physical shelf/stack support');}
});
test('C38 botanical replacements fit the original combined styling budget without raising the cap or adding a new stock category',()=>{
 const trailing=read('trailing-greenery.json')as NativeSurface[],near=read('window-near-branches.json')as NativeSurface[];
 const total=tri([...nativeStylingRecipe(),...nativeWindowCanopy()])-tri([...buildV11TrailingGreenery(),...nativeWindowCanopy()])+tri([...trailing,...near]);assert.ok(total<16000);
 for(const p of [...trailing,...near,...read('window-mid-far.json')]){const g=nativeSurfaceGeometry(p);assert.ok(g.positions.every(Number.isFinite));assert.ok(g.normals.every(Number.isFinite));assert.ok(g.indices.every(i=>Number.isInteger(i)&&i>=0&&i<g.positions.length/3));}
});
test('original C38 reusable mesh masters have readable exact provenance and remain explicitly unadopted form evidence',()=>{
 const p=read('provenance.json');assert.equal(p.intent.mode,'shape');assert.equal(p.intent.defaultAdopted,false);
 for(const [path,record]of Object.entries(p.files)as[string,{bytes:number;sha256:string}][]){const bytes=fs.readFileSync(path);assert.equal(bytes.length,record.bytes);assert.equal(createHash('sha256').update(bytes).digest('hex'),record.sha256);}
 // C38 is frozen and independently accepted. C39 may change material binders,
 // so verify its original source against the pinned accepted history as well
 // as every untouched master byte. C39 separately proves current geometry.
 for(const[path,sha]of Object.entries(p.sources))assert.equal(createHash('sha256').update(execFileSync('git',['show','1aae28cff5289bf266f523781131c65e86849001:'+path])).digest('hex'),sha,'accepted C38 historical authoring source differs: '+path);
});

// Full triangle/box separating axes: vertex-only clearance misses a leaf edge
// or branch segment cutting a shelf while every corner remains outside it.
function hitsBox(v:number[][],min:number[],max:number[]){const c=min.map((x,i)=>(x+max[i])/2),h=min.map((x,i)=>(max[i]-x)/2),p=v.map(a=>a.map((x,i)=>x-c[i])),edges=[0,1,2].map(i=>p[(i+1)%3].map((x,j)=>x-p[i][j])),cross=(a:number[],b:number[])=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],unit=[[1,0,0],[0,1,0],[0,0,1]],axes=[...unit,cross(edges[0],edges[1]),...edges.flatMap(e=>unit.map(a=>cross(e,a)))];for(const a of axes){if(Math.hypot(...a)<1e-12)continue;const q=p.map(v=>v.reduce((n,x,j)=>n+x*a[j],0)),r=h.reduce((n,x,j)=>n+x*Math.abs(a[j]),0);if(Math.min(...q)>r+1e-8||Math.max(...q)<-r-1e-8)return false;}return true;}
test('C38 actual botanical triangles wrap in front of all three shelf boards, not through them',()=>{
 const plants=read('trailing-greenery.json')as NativeSurface[],rails=[[.9175,1.0025],[1.4175,1.5225],[2.1775,2.2825]];
 for(const p of plants){const g=nativeSurfaceGeometry(p);for(let i=0;i<g.indices.length;i+=3){const t=g.indices.slice(i,i+3).map(n=>g.positions.slice(n*3,n*3+3));for(const[lo,hi]of rails)assert.equal(hitsBox(t,[-3.4,lo,2.535],[1.8,hi,3.165]),false,'plant triangle cuts back shelf: '+i);}}
});

test('C38 trailing foliage clears the existing customer-route body sweep without changing routes',()=>{
 const r=CUSTOMER_ROUTE_CONTRACT.radius,plants=read('trailing-greenery.json')as NativeSurface[];
 for(const path of CUSTOMER_ROUTES)for(let k=1;k<path.length;k++){
  const a=path[k-1],b=path[k],min=[Math.min(a.x,b.x)-r,.08,Math.min(a.z,b.z)-r],max=[Math.max(a.x,b.x)+r,2.10,Math.max(a.z,b.z)+r];
  for(const p of plants){const g=nativeSurfaceGeometry(p);for(let i=0;i<g.indices.length;i+=3){const t=g.indices.slice(i,i+3).map(n=>g.positions.slice(n*3,n*3+3));assert.equal(hitsBox(t,min,max),false,'plant triangle enters existing route-body sweep, segment'+k);}}
 }
});

test('C38 keeps the reviewed C37 masters and mixed display bytes, redistributing rather than adding trailing leaves',()=>{
 const oldDir='assets/masters/native-v11/backwall-c37/',old=JSON.parse(fs.readFileSync(oldDir+'provenance.json','utf8'));
 for(const[path,record]of Object.entries(old.files)as[string,{sha256:string}][])assert.equal(createHash('sha256').update(fs.readFileSync(path)).digest('hex'),record.sha256,'retained C37 master changed');
 for(const name of['fixed-back-samples.json','paper-work-bays.json'])assert.deepEqual(fs.readFileSync(dir+name),fs.readFileSync(oldDir+name),'accepted mixed dressing changed');
 const stats=(parts:NativeSurface[])=>{const groups=[{triangles:0,minY:Infinity,maxY:-Infinity},{triangles:0,minY:Infinity,maxY:-Infinity}];for(const p of parts.filter(p=>p.role==='leaf')){const g=nativeSurfaceGeometry(p);for(let i=0;i<g.indices.length;i+=3){const v=g.indices.slice(i,i+3).map(n=>g.positions.slice(n*3,n*3+3)),x=v.reduce((n,p)=>n+p[0]/3,0),at=x>0?1:x> -3.8?0:-1;if(at<0)continue;groups[at].triangles++;for(const p of v){groups[at].minY=Math.min(groups[at].minY,p[1]);groups[at].maxY=Math.max(groups[at].maxY,p[1]);}}}return groups;};
 const before=stats(JSON.parse(fs.readFileSync(oldDir+'trailing-greenery.json','utf8'))),after=stats(read('trailing-greenery.json'));assert.equal(after[0].triangles+after[1].triangles,before[0].triangles+before[1].triangles,'same total leaf geometry, not a count increase');assert.ok(after[1].triangles>after[0].triangles,'short plant carries the denser mass');assert.ok(after[0].minY+.45<after[1].minY,'long plant has a substantively lower silhouette');
});
test('C38 near canopy leaves a real projected opening for the front roof gable at the fixed normal game camera',()=>{
 const pose=JSON.parse(fs.readFileSync('evidence/native-v11/checkpoint-37-route-clearance/after248/results.json','utf8')).results[0].diagnostic.world.cameraPose;
 const camera=[pose.target[0]+pose.radius*Math.cos(pose.alpha)*Math.sin(pose.beta),pose.target[1]+pose.radius*Math.cos(pose.beta),pose.target[2]+pose.radius*Math.sin(pose.alpha)*Math.sin(pose.beta)];
 const project=(p:number[])=>{const t=(-4.47-camera[0])/(p[0]-camera[0]);return[camera[2]+(p[2]-camera[2])*t,camera[1]+(p[1]-camera[1])*t,0];};
 const contacts=(parts:NativeSurface[])=>{let hits=0;for(const p of parts){const g=nativeSurfaceGeometry(p);for(let i=0;i<g.indices.length;i+=3){const tri=g.indices.slice(i,i+3).map(n=>project(g.positions.slice(n*3,n*3+3)));if(hitsBox(tri,[-.35,1.38,-.001],[1.05,2.12,.001]))hits++;}}return hits;};
 assert.ok(contacts(JSON.parse(fs.readFileSync('assets/masters/native-v11/backwall-c37/window-near-branches.json','utf8')))>0,'control actually occluded this central view');assert.equal(contacts(read('window-near-branches.json')),0,'do not hide the ridge/eaves with near leaves or a branch');
});
