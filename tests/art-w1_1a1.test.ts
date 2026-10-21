import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import ts from 'typescript';
import {NullEngine} from '@babylonjs/core/Engines/nullEngine';
import {Scene} from '@babylonjs/core/scene';
import {PBRMaterial} from '@babylonjs/core/Materials/PBR/pbrMaterial';
import {Color3} from '@babylonjs/core/Maths/math.color';
import {SceneLoader} from '@babylonjs/core/Loading/sceneLoader';
import '@babylonjs/loaders/glTF/glTFFileLoader';
import '@babylonjs/loaders/glTF/2.0/glTFLoader';
import {geometry,type Geometry} from '../src/art/geometry';
import {productRecipe,type Part} from '../src/art/recipes';
import {materialRenderState,type MaterialRole} from '../src/art/materials';
const sub=(a:number[],b:number[])=>a.map((x,i)=>x-b[i]),dot=(a:number[],b:number[])=>a.reduce((n,x,i)=>n+x*b[i],0),cross=(a:number[],b:number[])=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],vertex=(a:number[],i:number)=>a.slice(i*3,i*3+3);
function ray(g:Geometry,origin:number[],direction:number[]){const out:number[]=[];for(let i=0;i<g.indices.length;i+=3){const vs=g.indices.slice(i,i+3).map(j=>vertex(g.positions,j)),e1=sub(vs[1],vs[0]),e2=sub(vs[2],vs[0]),p=cross(direction,e2),det=dot(e1,p);if(Math.abs(det)<1e-12)continue;const t=sub(origin,vs[0]),u=dot(t,p)/det;if(u<-1e-9||u>1+1e-9)continue;const q=cross(t,e1),v=dot(direction,q)/det;if(v<-1e-9||u+v>1+1e-9)continue;const d=dot(e2,q)/det;if(d>1e-9)out.push(d);}return out.sort((a,b)=>a-b).filter((x,i,a)=>i===0||Math.abs(x-a[i-1])>1e-7);}
const merge=(parts:Part[]):Geometry=>{const out:Geometry={positions:[],normals:[],indices:[]};for(const p of parts){const g=geometry(p),base=out.positions.length/3;out.positions.push(...g.positions);out.normals.push(...g.normals);out.indices.push(...g.indices.map(x=>x+base));}return out;};
function glbGeometry(path:string):Geometry{const bytes=fs.readFileSync(path),jsonLength=bytes.readUInt32LE(12),json=JSON.parse(bytes.subarray(20,20+jsonLength).toString()),start=28+jsonLength;const out:Geometry={positions:[],normals:[],indices:[]};const accessor=(index:number)=>{const a=json.accessors[index],b=json.bufferViews[a.bufferView],offset=start+(b.byteOffset??0)+(a.byteOffset??0),count=a.count*(a.type==='VEC3'?3:1);return Array.from({length:count},(_,i)=>a.componentType===5126?bytes.readFloatLE(offset+i*4):bytes.readUInt32LE(offset+i*4));};for(const m of json.meshes)for(const p of m.primitives){const base=out.positions.length/3;out.positions.push(...accessor(p.attributes.POSITION));out.normals.push(...accessor(p.attributes.NORMAL));out.indices.push(...accessor(p.indices).map(x=>x+base));}return out;}
const mug=()=>productRecipe('off.mug');

test('mug rim shares both wall boundaries and seals the full polygonal annulus while leaving cavity open',()=>{
 const recipe=mug(),rim=geometry(recipe.find(p=>p.shape==='torus'&&!p.arc)!),outer=geometry(recipe[0]),inner=geometry(recipe[1]),all=merge(recipe);
 for(const wall of [outer,inner])for(let i=13;i<26;i++){const point=vertex(wall.positions,i);assert.ok(Array.from({length:rim.positions.length/3},(_,j)=>vertex(rim.positions,j)).some(q=>Math.hypot(...sub(q,point))<1e-12),'rim and wall share authored top boundary');}
 const step=Math.PI/6;for(let k=0;k<36;k++){const a=(k+.27)*Math.PI*2/36,sector=a%step,projection=Math.cos(step/2)/Math.cos(sector-step/2),r0=.0985*projection,r1=.1175*projection;for(const fraction of [.1,.5,.9]){const r=r0+(r1-r0)*fraction,hits=ray(all,[r*Math.cos(a),1,r*Math.sin(a)],[0,-1,0]);assert.ok(hits.length&&1-hits[0]>=.235-1e-9,`unsealed wall band at angle ${a}, fraction ${fraction}`);}}
 const center=ray(all,[0,1,0],[0,-1,0]);assert.ok(center.length>0);assert.ok(1-center[0]>.029&&1-center[0]<.04,'center enters empty cavity and reaches inner floor');
 const glb=glbGeometry('assets/masters/w1_1a1/mug.glb');for(const x of [0,.105,.112,.116]){const s=ray(all,[x,1,0],[0,-1,0]),b=ray(glb,[x,1,0],[0,-1,0]);assert.equal(s.length,b.length);s.forEach((v,i)=>assert.ok(Math.abs(v-b[i])<1e-7));}
});

test('mug handle has measured upper/lower surface contacts and an unobstructed opening without entering cavity',()=>{
 const recipe=mug(),handle=geometry(recipe.find(p=>p.arc)!),body=geometry(recipe[0]),glb=glbGeometry('assets/masters/w1_1a1/mug.glb');const contacts=[];
 for(const y of [.070,.180]){const bodyHits=ray(body,[0,y,0],[1,0,0]),surface=bodyHits[0],hits=ray(handle,[0,y,0],[1,0,0]);assert.ok(Math.abs(surface-.1175)<1e-12);assert.equal(hits.length%2,0,'closed handle produces paired entry/exit intersections');let overlap=0;for(let i=0;i<hits.length;i+=2)if(hits[i]<surface&&hits[i+1]>surface)overlap=Math.max(overlap,surface-hits[i]);assert.ok(overlap>.003&&overlap<.009,'outer cup triangle lies inside handle solid at a shallow real contact');const exportedHits=ray(glb,[0,y,0],[1,0,0]),sourceHits=ray(merge(recipe),[0,y,0],[1,0,0]);assert.equal(exportedHits.length,sourceHits.length);sourceHits.forEach((hit,i)=>assert.ok(Math.abs(exportedHits[i]-hit)<1e-7,'actual exported contact entry/exit surfaces match source'));assert.ok(exportedHits.some(x=>Math.abs(x-surface)<1e-7),'contact cup surface survives GLB export');contacts.push({y,x:surface,overlap});}
 assert.ok(contacts[1].y-contacts[0].y>.10);assert.ok(Math.min(...handle.positions.filter((_,i)=>i%3===0))>.0985,'handle cannot enter inner cavity');assert.deepEqual(ray(handle,[.17,.125,1],[0,0,-1]),[],'C-shaped handle aperture stays open');assert.deepEqual(ray(merge(recipe),[0,1,0],[0,-1,0]).slice(0,1).map(x=>Math.round((1-x)*1000)),[34]);
});

test('capped handle arc keeps finite unit normals, correct cap planes and nondegenerate winding',()=>{
 const part=mug().find(p=>p.arc)!,g=geometry(part);assert.ok(g.positions.every(Number.isFinite));for(let i=0;i<g.normals.length/3;i++)assert.ok(Math.abs(Math.hypot(...vertex(g.normals,i))-1)<1e-12);
 for(let i=0;i<g.indices.length;i+=3){const ids=g.indices.slice(i,i+3),a=vertex(g.positions,ids[0]),n=cross(sub(vertex(g.positions,ids[1]),a),sub(vertex(g.positions,ids[2]),a)),average=[0,1,2].map(k=>ids.reduce((sum,id)=>sum+g.normals[id*3+k],0));assert.ok(Math.hypot(...n)>1e-14);assert.ok(dot(n,average)>0);}
 const firstCap=(part.segments!+1)*7;for(const cap of [firstCap,firstCap+8]){const center=vertex(g.positions,cap),n=vertex(g.normals,cap);for(let j=1;j<8;j++)assert.ok(Math.abs(dot(n,sub(vertex(g.positions,cap+j),center)))<1e-12,'cap normal is perpendicular to stretched cross-section');}
});

test('actual runtime material adapter and independent GLB import agree on sidedness and common PBR state',async()=>{
 const source=ts.createSourceFile('world.ts',fs.readFileSync('src/world.ts','utf8'),ts.ScriptTarget.Latest,true);let declaration:ts.FunctionDeclaration|undefined;const visit=(n:ts.Node)=>{if(ts.isFunctionDeclaration(n)&&n.name?.text==='material')declaration=n;ts.forEachChild(n,visit);};visit(source);assert.ok(declaration,'actual world material factory found');const compiled=ts.transpileModule(`const materials=new Map();${declaration!.getText(source)};return material;`,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.None}}).outputText;const engine=new NullEngine(),runtimeScene=new Scene(engine);const runtime=new Function('PBRMaterial','Color3','scene','materialRenderState',compiled)(PBRMaterial,Color3,runtimeScene,materialRenderState) as (hex:string,alpha:number,role:MaterialRole)=>PBRMaterial;const manifest=JSON.parse(fs.readFileSync('assets/authoring/w1_1a1/manifest.json','utf8'));let double=0,single=0;
 try{for(const asset of manifest.assets){const scene=new Scene(engine),bytes=fs.readFileSync(asset.file);scene.useRightHandedSystem=true;const json=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)).toString());await SceneLoader.ImportMeshAsync(null,'',`data:base64,${bytes.toString('base64')}`,scene,undefined,'.glb');for(const spec of asset.materials){const current=runtime(spec.color,spec.alpha,spec.role),imported=scene.materials.find(m=>m.name===spec.materialId) as PBRMaterial,authored=json.materials.find((m:{name:string})=>m.name===spec.materialId);assert.ok(imported);assert.equal(current.name,spec.materialId,'runtime cache uses full shared identity');assert.equal(current.backFaceCulling,imported.backFaceCulling);assert.equal(current.twoSidedLighting,imported.twoSidedLighting);assert.equal(authored.doubleSided,spec.doubleSided);assert.equal(current.alpha,imported.alpha);assert.equal(current.roughness,imported.roughness);assert.equal(current.metallic,imported.metallic);assert.equal(current.needAlphaBlending(),imported.needAlphaBlending());assert.ok(current.albedoColor.equals(imported.albedoColor));spec.doubleSided?double++:single++;}scene.dispose();}assert.ok(double>=3&&single>0,'test covers transparent double-sided and opaque single-sided materials');}finally{runtimeScene.dispose();engine.dispose();}
});

test('published W1.1A masters/manifests remain intact and exact authoring source is frozen',()=>{
 const manifest=JSON.parse(fs.readFileSync('assets/authoring/w1_1a/manifest.json','utf8'));for(const asset of manifest.assets)for(const f of [asset.file,asset.web])assert.equal(crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex'),asset.sha256,`retained ${f}`);
 const baseline:Record<string,string>={'src/art/geometry.ts':'3cc4021dd3cdad55dd4656b83c6870d9282c4ecbcd0f82f3698cef7f2762278b','src/art/recipes.ts':'95d4063c0cd4011068b439a496540f2202650b0a8d60a26b3ccf642462829a4a','src/art/materials.ts':'aa6c8fbf38b2344ec486d3435b07af0087103922f63e638f01d91b4ae47ec5b8','tools/art-w1_1.ts':'04e165eaec32de7b5e14f43bafad7cc781b65f5a4c59f613147580b7be94d95d'};for(const [path,hash] of Object.entries(baseline))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(`assets/authoring/w1_1a/source_snapshot/${path}`)).digest('hex'),hash);
});
