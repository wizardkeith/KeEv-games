/** Focused independent W1.1A1 A1/A2 audit; no application edits or rendering.
 * Usage: node art-a1a2.mts /path/to/canonical
 * Project must already have its locked dependencies installed.
 * Writes ../reviewer_evidence/art-a1a2.json relative to this script.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
import {fileURLToPath,pathToFileURL} from 'node:url';
const project=path.resolve(process.argv[2]??process.cwd());
const output=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../reviewer_evidence/art-a1a2.json');
const read=(name)=>fs.readFileSync(path.join(project,name));
const hash=(bytes)=>crypto.createHash('sha256').update(bytes).digest('hex');
// Read checkout identity without spawning a subprocess or changing the repository.
let commit=null;
try{const dotGit=path.join(project,'.git'),gitDir=fs.statSync(dotGit).isDirectory()?dotGit:path.resolve(project,fs.readFileSync(dotGit,'utf8').trim().replace(/^gitdir:\s*/,''));let head=fs.readFileSync(path.join(gitDir,'HEAD'),'utf8').trim();if(head.startsWith('ref: '))head=fs.readFileSync(path.join(gitDir,head.slice(5)),'utf8').trim();if(/^[a-f0-9]{40}$/.test(head))commit=head;}catch{/* Source and asset SHA256 values remain the authoritative probe provenance. */}
const req=createRequire(path.join(project,'package.json'));
const dep=(name)=>import(pathToFileURL(req.resolve(name)).href);
const {register}=await dep('tsx/esm/api'),unregister=register();
let engine;
try{
 const [{geometry},{productRecipe},{materialRenderState},typescript,{NullEngine},{Scene},{PBRMaterial},{Color3},{SceneLoader},{Vector3}]=await Promise.all([
  import(pathToFileURL(path.join(project,'src/art/geometry.ts')).href),
  import(pathToFileURL(path.join(project,'src/art/recipes.ts')).href),
  import(pathToFileURL(path.join(project,'src/art/materials.ts')).href),
  dep('typescript'),dep('@babylonjs/core/Engines/nullEngine.js'),dep('@babylonjs/core/scene.js'),
  dep('@babylonjs/core/Materials/PBR/pbrMaterial.js'),dep('@babylonjs/core/Maths/math.color.js'),
  dep('@babylonjs/core/Loading/sceneLoader.js'),dep('@babylonjs/core/Maths/math.vector.js')]);
 await dep('@babylonjs/loaders/glTF/index.js');
 const ts=typescript.default??typescript,worldText=read('src/world.ts').toString('utf8');
 const parsed=ts.createSourceFile('world.ts',worldText,ts.ScriptTarget.Latest,true,ts.ScriptKind.TS);
 let factory,cache;
 const visit=(n)=>{if(ts.isFunctionDeclaration(n)&&n.name?.text==='material')factory=n;if(ts.isVariableStatement(n)&&n.declarationList.declarations.some(d=>ts.isIdentifier(d.name)&&d.name.text==='materials'))cache=n;ts.forEachChild(n,visit);};visit(parsed);
 if(!factory||!cache)throw Error('Actual material adapter/cache could not be located.');
 const compiled=ts.transpileModule(cache.getText(parsed)+'\n'+factory.getText(parsed)+'\nreturn material;',{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.None}}).outputText;
 engine=new NullEngine();const runtimeScene=new Scene(engine);
 const runtime=new Function('scene','PBRMaterial','Color3','materialRenderState',compiled)(runtimeScene,PBRMaterial,Color3,materialRenderState);
 const sub=(a,b)=>a.map((x,i)=>x-b[i]),dot=(a,b)=>a.reduce((v,x,i)=>v+x*b[i],0),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
 const merge=(geometries)=>{const g={positions:[],indices:[]};for(const x of geometries){const offset=g.positions.length/3;g.positions.push(...x.positions);g.indices.push(...x.indices.map(i=>i+offset));}return g;};
 const ray=(g,origin,direction)=>{
  const distances=[];
  for(let i=0;i<g.indices.length;i+=3){
   const [a,b,c]=Array.from(g.indices.slice(i,i+3),j=>Array.from(g.positions.slice(j*3,j*3+3)));
   const e1=sub(b,a),e2=sub(c,a),h=cross(direction,e2),det=dot(e1,h);if(Math.abs(det)<1e-12)continue;
   const inv=1/det,s=sub(origin,a),u=dot(s,h)*inv;if(u<-1e-9||u>1+1e-9)continue;
   const q=cross(s,e1),v=dot(direction,q)*inv;if(v<-1e-9||u+v>1+1e-9)continue;
   const distance=dot(e2,q)*inv;if(distance>1e-9)distances.push(distance);
  }
  return distances.sort((a,b)=>a-b).filter((v,i,a)=>i===0||Math.abs(v-a[i-1])>1e-7);
 };
 const comparison=(a,b)=>({sameCount:a.length===b.length,maxAbsoluteError:a.length===b.length?Math.max(0,...a.map((v,i)=>Math.abs(v-b[i]))):null});
 const manifest=JSON.parse(read('assets/authoring/w1_1a1/manifest.json').toString('utf8'));
 const targetAssets=manifest.assets.filter(a=>a.id==='off.mug'||a.materials.some(m=>m.role==='glass'));
 const materialRows=[],assetRows=[];let importedMug;
 const props=(m)=>({name:m.name,albedo:m.albedoColor.asArray(),alpha:m.alpha,roughness:m.roughness,metallic:m.metallic,alphaBlend:m.needAlphaBlending(),backFaceCulling:m.backFaceCulling,twoSidedLighting:m.twoSidedLighting,indexOfRefraction:m.indexOfRefraction});
 for(const asset of targetAssets){
  const bytes=read(asset.file),jsonLength=bytes.readUInt32LE(12),json=JSON.parse(bytes.subarray(20,20+jsonLength).toString('utf8'));
  assetRows.push({id:asset.id,file:asset.file,sha256:hash(bytes),manifestHashMatches:hash(bytes)===asset.sha256});
  const scene=new Scene(engine);scene.useRightHandedSystem=true;
  const result=await SceneLoader.ImportMeshAsync(null,'',`data:base64,${bytes.toString('base64')}`,scene,undefined,'.glb');
  if(asset.id==='off.mug'){
   const meshes=[];
   for(const mesh of result.meshes){if(!mesh.getTotalVertices())continue;const positions=mesh.getVerticesData('position'),indices=mesh.getIndices(),matrix=mesh.computeWorldMatrix(true),world=[];for(let i=0;i<positions.length;i+=3)world.push(...Vector3.TransformCoordinates(Vector3.FromArray(positions,i),matrix).asArray());meshes.push({positions:world,indices:Array.from(indices)});}
   importedMug=merge(meshes);
  }
  for(const spec of asset.materials.filter(m=>asset.id==='off.mug'||m.role==='glass')){
   const imported=scene.materials.find(m=>m.name===spec.materialId),authored=json.materials.find(m=>m.name===spec.materialId);
   if(!imported||!authored)throw Error('Cannot match actual GLB material '+spec.materialId);
   const current=runtime(spec.color,spec.alpha,spec.role),r=props(current),g=props(imported);
   const {indexOfRefraction:ri,...commonR}=r,{indexOfRefraction:gi,...commonG}=g;
   materialRows.push({assetId:asset.id,role:spec.role,runtime:r,imported:g,commonFieldsEqual:JSON.stringify(commonR)===JSON.stringify(commonG),authoredDoubleSided:authored.doubleSided,sharedDoubleSided:materialRenderState(spec.role,spec.color,spec.alpha).doubleSided,iorIntent:authored.extras?.iorIntent,hasIorExtension:!!authored.extensions?.KHR_materials_ior});
  }
  scene.dispose();
 }
 if(!importedMug)throw Error('No actual mug geometry imported.');
 const recipe=productRecipe('off.mug'),sourceMug=merge(recipe.map(geometry)),outer=geometry(recipe.find(p=>p.shape==='cylinder'&&p.open&&!p.inside)),handle=geometry(recipe.find(p=>p.arc));
 const down=(g,x,z)=>ray(g,[x,1,z],[0,-1,0]);
 const oldRaySource=down(sourceMug,.112,0),oldRayImported=down(importedMug,.112,0),centerSource=down(sourceMug,0,0),centerImported=down(importedMug,0,0);
 const rimSamples=[];
 // Independently chosen 60 angles offset 2.7 degrees; three fractions across the polygonal wall band.
 for(let j=0;j<60;j++)for(const fraction of [.1,.5,.9]){
  const angle=(j*6+2.7)*Math.PI/180,projection=Math.cos(Math.PI/12)/Math.cos((angle%(Math.PI/6))-Math.PI/12),radius=(.0985+(.1175-.0985)*fraction)*projection,x=radius*Math.cos(angle),z=radius*Math.sin(angle),s=down(sourceMug,x,z),g=down(importedMug,x,z);
  rimSamples.push({angleDegrees:j*6+2.7,fraction,sourceFirstY:1-s[0],importedFirstY:1-g[0],...comparison(s,g)});
 }
 const contacts=[.070,.180].map(y=>{
  const bodyHits=ray(outer,[0,y,0],[1,0,0]),handleHits=ray(handle,[0,y,0],[1,0,0]),sourceHits=ray(sourceMug,[0,y,0],[1,0,0]),importedHits=ray(importedMug,[0,y,0],[1,0,0]),surfaceX=bodyHits[0],intervals=[];
  for(let i=0;i+1<handleHits.length;i+=2)intervals.push({entry:handleHits[i],exit:handleHits[i+1],containsBodySurface:handleHits[i]<surfaceX&&handleHits[i+1]>surfaceX});
  const contact=intervals.find(i=>i.containsBodySurface);
  return {y,bodySurfaceX:surfaceX,closedHandlePairs:handleHits.length%2===0,handleIntervals:intervals,contactOverlap:contact?surfaceX-contact.entry:null,sourceWholeMugHits:sourceHits,importedWholeMugHits:importedHits,...comparison(sourceHits,importedHits)};
 });
 const apertureSource=ray(handle,[.17,.125,1],[0,0,-1]),apertureImported=ray(importedMug,[.17,.125,1],[0,0,-1]);
 const handleMinX=Math.min(...handle.positions.filter((_,i)=>i%3===0));
 const sourceFiles=['src/art/geometry.ts','src/art/recipes.ts','src/art/materials.ts','src/world.ts','tools/art-w1_1.ts'];
 const report={schema:'w1.1a1-independent-a1a2.v1',generatedAt:new Date().toISOString(),project,commit,
  scope:'Known A1/A2 risks only. Actual canonical source geometry, actual GLB vertices with imported transforms, and AST-extracted real runtime material factory. Source/math/NullEngine evidence, NOT rendered WebGL appearance, native compatibility or performance.',
  sources:sourceFiles.map(file=>({file,sha256:hash(read(file))})),assets:assetRows,
  mug:{units:'metres',oldReproduction:{origin:[.112,1,0],direction:[0,-1,0],sourceFirstY:1-oldRaySource[0],importedFirstY:1-oldRayImported[0],...comparison(oldRaySource,oldRayImported)},center:{sourceFirstY:1-centerSource[0],importedFirstY:1-centerImported[0],...comparison(centerSource,centerImported)},rim:{sampleCount:rimSamples.length,minImportedFirstY:Math.min(...rimSamples.map(x=>x.importedFirstY)),maxImportedFirstY:Math.max(...rimSamples.map(x=>x.importedFirstY)),allSealWallBand:rimSamples.every(x=>x.sourceFirstY>=.235-1e-7&&x.importedFirstY>=.235-1e-7),maxSourceImportError:Math.max(...rimSamples.map(x=>x.maxAbsoluteError??Infinity)),samples:rimSamples},contacts,handle:{minX:handleMinX,innerRadius:.0985,staysOutsideCavity:handleMinX>.0985,apertureSourceHits:apertureSource,apertureImportedHits:apertureImported,apertureClear:apertureSource.length===0&&apertureImported.length===0,contactInterpretation:'Shallow intersecting ceramic volumes at two separate heights; no welded-topology claim.'}},
  materials:{runtimeFactoryLine:parsed.getLineAndCharacterOfPosition(factory.getStart(parsed)).line+1,rows:materialRows,allCommonFieldsMatch:materialRows.every(r=>r.commonFieldsEqual&&r.authoredDoubleSided===r.sharedDoubleSided),iorLimit:'IOR intentionally remains extras-only in GLB; imported glass IOR 1.5 differs from runtime intent 1.45. Existing documented native-adapter limitation, excluded from common-field parity gate.'},
  applicationSourceModified:false,renderedWebGLEvidence:false};
 fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({output,commit:report.commit,oldRayFirstY:report.mug.oldReproduction.importedFirstY,rimSamples:rimSamples.length,rimPass:report.mug.rim.allSealWallBand,centerFirstY:report.mug.center.importedFirstY,contacts:contacts.map(c=>({y:c.y,overlap:c.contactOverlap,sourceImportError:c.maxAbsoluteError})),apertureClear:report.mug.handle.apertureClear,materialCount:materialRows.length,materialCommonFieldsMatch:report.materials.allCommonFieldsMatch,renderedWebGLEvidence:false},null,2));
 runtimeScene.dispose();
}finally{engine?.dispose();await unregister();}
