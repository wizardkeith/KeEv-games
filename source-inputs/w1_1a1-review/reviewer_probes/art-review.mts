/**
 * Focused W1.1A reviewer reproductions. Application sources/assets are read only.
 * Usage (Node 24, dependencies already installed in the project):
 *   node /path/to/reviewer_probes/art-review.mts /path/to/candidate
 * Or from the project directory:
 *   node ../reviewer_probes/art-review.mts
 * Writes ../reviewer_evidence/art-review.json relative to this script's directory.
 * Exit 0 means evidence was captured; inspect findings, not the process exit code.
 * Source math + Babylon NullEngine import are NOT rendered WebGL visual evidence.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
import {fileURLToPath,pathToFileURL} from 'node:url';

if (process.argv.includes('--help')) {
  console.log('Usage: node art-review.mts [project-directory; default: cwd]\nOutput: ../reviewer_evidence/art-review.json relative to the script directory.');
  process.exit(0);
}
if (process.argv.length > 3) throw Error('Provide at most one project-directory argument.');
const project=path.resolve(process.argv[2]??process.cwd());
const output=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../reviewer_evidence/art-review.json');
const read=(relative)=>fs.readFileSync(path.join(project,relative));
const hash=(bytes)=>crypto.createHash('sha256').update(bytes).digest('hex');
const sourceFiles=['src/art/geometry.ts','src/art/recipes.ts','src/art/materials.ts','src/world.ts','tools/art-w1_1.ts'];
for(const file of ['package.json',...sourceFiles]) if(!fs.existsSync(path.join(project,file))) throw Error(`Missing ${file}; pass the application project directory.`);
const projectRequire=createRequire(path.join(project,'package.json'));
const dependency=async(name)=>import(pathToFileURL(projectRequire.resolve(name)).href);
const {register}=await dependency('tsx/esm/api');
const unregister=register();
let engine;

try {
  const [{geometry,grouped},{productRecipe,roomRecipe,counterRecipe},{materialSpec},typescript,
    {NullEngine},{Scene},{PBRMaterial},{Color3},{SceneLoader},{Vector3}]=await Promise.all([
    import(pathToFileURL(path.join(project,'src/art/geometry.ts')).href),
    import(pathToFileURL(path.join(project,'src/art/recipes.ts')).href),
    import(pathToFileURL(path.join(project,'src/art/materials.ts')).href),
    dependency('typescript'),dependency('@babylonjs/core/Engines/nullEngine.js'),
    dependency('@babylonjs/core/scene.js'),dependency('@babylonjs/core/Materials/PBR/pbrMaterial.js'),
    dependency('@babylonjs/core/Maths/math.color.js'),dependency('@babylonjs/core/Loading/sceneLoader.js'),
    dependency('@babylonjs/core/Maths/math.vector.js')
  ]);
  await dependency('@babylonjs/loaders/glTF/index.js');
  const ts=typescript.default??typescript;
  const worldText=read('src/world.ts').toString('utf8');
  const parsed=ts.createSourceFile('world.ts',worldText,ts.ScriptTarget.Latest,true,ts.ScriptKind.TS);
  let materialFunction,materialCache;
  const visit=(node)=>{
    if(ts.isFunctionDeclaration(node)&&node.name?.text==='material') materialFunction=node;
    if(ts.isVariableStatement(node)&&node.declarationList.declarations.some(d=>ts.isIdentifier(d.name)&&d.name.text==='materials')) materialCache=node;
    ts.forEachChild(node,visit);
  };
  visit(parsed);
  if(!materialFunction||!materialCache) throw Error('Runtime material adapter shape changed; update the AST extraction instead of substituting a hard-coded adapter.');
  const runtimeAdapterText=materialCache.getText(parsed)+'\n'+materialFunction.getText(parsed)+'\nreturn material;';
  const runtimeAdapterJs=ts.transpileModule(runtimeAdapterText,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.None}}).outputText;
  const makeRuntimeAdapter=new Function('scene','PBRMaterial','Color3','materialSpec',runtimeAdapterJs);
  const lineOf=(node)=>parsed.getLineAndCharacterOfPosition(node.getStart(parsed)).line+1;
  const manifest=JSON.parse(read('assets/authoring/w1_1a/manifest.json').toString('utf8'));
  const sub=(a,b)=>a.map((x,i)=>x-b[i]);
  const dot=(a,b)=>a.reduce((sum,x,i)=>sum+x*b[i],0);
  const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  const bounds=(positions)=>({min:[0,1,2].map(a=>Math.min(...positions.filter((_,i)=>i%3===a))),max:[0,1,2].map(a=>Math.max(...positions.filter((_,i)=>i%3===a)))});
  const origin=[.112,1,0],direction=[0,-1,0];
  // Double-sided mathematical triangle intersections: no GPU, camera or shading.
  const rayHits=(positions,indices,label)=>{
    const hits=[];
    for(let i=0;i<indices.length;i+=3){
      const [a,b,c]=Array.from(indices.slice(i,i+3),j=>Array.from(positions.slice(j*3,j*3+3)));
      const e1=sub(b,a),e2=sub(c,a),h=cross(direction,e2),det=dot(e1,h);
      if(Math.abs(det)<1e-10) continue;
      const inv=1/det,s=sub(origin,a),u=dot(s,h)*inv;
      if(u<0||u>1) continue;
      const q=cross(s,e1),v=dot(direction,q)*inv;
      if(v<0||u+v>1) continue;
      const distance=dot(e2,q)*inv;
      if(distance>=0) hits.push({label,triangle:i/3,distance,hitY:origin[1]-distance});
    }
    return hits;
  };
  const mugParts=productRecipe('off.mug');
  const outer=mugParts.find(p=>p.shape==='cylinder'&&p.open&&!p.inside);
  const inner=mugParts.find(p=>p.shape==='cylinder'&&p.open&&p.inside);
  const rim=mugParts.find(p=>p.shape==='torus'&&Math.abs(p.at[0])<1e-9&&Math.abs(p.at[2])<1e-9);
  const handle=mugParts.find(p=>p.shape==='torus'&&p.at[0]>.05);
  if(!outer||!inner||!rim||!handle) throw Error('Mug authoring topology changed; review the semantic part selection before reusing this probe.');
  const outerBounds=bounds(geometry(outer).positions),innerBounds=bounds(geometry(inner).positions),rimBounds=bounds(geometry(rim).positions),handleBounds=bounds(geometry(handle).positions);
  const sourceHits=mugParts.flatMap((p,i)=>{const g=geometry(p);return rayHits(g.positions,g.indices,`recipe.part.${i}`);}).sort((a,b)=>a.distance-b.distance);
  const radialPointInsideWallBand=origin[0]>innerBounds.max[0]&&origin[0]<outerBounds.max[0];
  const firstHitNearRim=sourceHits.length>0&&sourceHits[0].hitY>=outerBounds.max[1]-rim.size[1];
  const handleXGap=handleBounds.min[0]-outerBounds.max[0];
  engine=new NullEngine();
  const mugAsset=manifest.assets.find(a=>a.id==='off.mug');
  if(!mugAsset) throw Error('Missing off.mug GLB manifest entry.');
  const mugScene=new Scene(engine);mugScene.useRightHandedSystem=true;
  const mugBytes=read(mugAsset.file);
  const loadedMug=await SceneLoader.ImportMeshAsync(null,'',`data:base64,${mugBytes.toString('base64')}`,mugScene,undefined,'.glb');
  const glbHits=[];
  for(const mesh of loadedMug.meshes){
    if(!mesh.getTotalVertices()) continue;
    const positions=mesh.getVerticesData('position'),indices=mesh.getIndices();
    if(!positions||!indices) throw Error('Imported mug is missing position/index data.');
    const matrix=mesh.computeWorldMatrix(true),worldPositions=[];
    for(let i=0;i<positions.length;i+=3) worldPositions.push(...Vector3.TransformCoordinates(Vector3.FromArray(positions,i),matrix).asArray());
    glbHits.push(...rayHits(worldPositions,indices,mesh.name));
  }
  glbHits.sort((a,b)=>a.distance-b.distance);
  mugScene.dispose();
  const currentGroups=new Map([...grouped(counterRecipe()),...grouped(roomRecipe())].map(g=>[g.materialId,g]));
  const materialRows=[],assetProvenance=[{id:mugAsset.id,file:mugAsset.file,sha256:hash(mugBytes)}];
  const glassAssets=manifest.assets.filter(a=>a.materials.some(m=>m.role==='glass'));
  if(!glassAssets.length) throw Error('No glass assets found; review the probe scope.');
  const properties=(m)=>({albedo:m.albedoColor.asArray(),alpha:m.alpha,roughness:m.roughness,metallic:m.metallic,indexOfRefraction:m.indexOfRefraction,backFaceCulling:m.backFaceCulling,twoSidedLighting:m.twoSidedLighting,needsAlphaBlending:m.needAlphaBlending(),transparencyMode:m.transparencyMode});
  for(const asset of glassAssets){
    const bytes=read(asset.file),jsonLength=bytes.readUInt32LE(12),gltf=JSON.parse(bytes.subarray(20,20+jsonLength).toString('utf8'));
    assetProvenance.push({id:asset.id,file:asset.file,sha256:hash(bytes)});
    const scene=new Scene(engine);scene.useRightHandedSystem=true;
    await SceneLoader.ImportMeshAsync(null,'',`data:base64,${bytes.toString('base64')}`,scene,undefined,'.glb');
    const runtimeMaterial=makeRuntimeAdapter(scene,PBRMaterial,Color3,materialSpec);
    for(const authored of gltf.materials.filter(m=>m.extras?.semanticRole==='glass')){
      const group=currentGroups.get(authored.name),imported=scene.materials.find(m=>m.name===authored.name);
      if(!group||!imported) throw Error(`Cannot match actual glass material ${authored.name} to source and imported material.`);
      const runtime=runtimeMaterial(group.color,group.alpha,group.role),r=properties(runtime),g=properties(imported);
      materialRows.push({assetId:asset.id,file:asset.file,materialId:authored.name,role:group.role,
        runtime:r,glbImported:g,glbAuthored:{doubleSided:authored.doubleSided??false,iorIntent:authored.extras?.iorIntent??null,iorExtension:authored.extensions?.KHR_materials_ior??null},
        commonPbrValuesEqual:JSON.stringify([r.albedo,r.alpha,r.roughness,r.metallic])===JSON.stringify([g.albedo,g.alpha,g.roughness,g.metallic]),
        sidednessEqual:r.backFaceCulling===g.backFaceCulling&&r.twoSidedLighting===g.twoSidedLighting,
        iorEqual:r.indexOfRefraction===g.indexOfRefraction});
    }
    scene.dispose();
  }
  const report={
    schema:'w1.1a-focused-art-review.v1',generatedAt:new Date().toISOString(),project,
    scope:'Read-only source geometry, actual static GLB triangles and Babylon NullEngine material reimport. NOT a rendered WebGL visual test; no camera, lighting appearance, animation smoothness or native-device claim.',
    method:{runtimeMaterial:'AST-extract the actual materials cache declaration and material() function from src/world.ts; transpile and execute that function with the project Babylon version. No hard-coded substitute adapter.',runtimeAdapterLine:lineOf(materialFunction),runtimeCacheLine:lineOf(materialCache),ray:'Double-sided Moller-Trumbore intersections; actual GLB vertices transformed by their imported node world matrices.',bounds:'Source mesh vertex AABBs; positive X separation proves disconnection, overlapping AABBs alone would not prove attachment.',exitCode:'Zero means capture completed, not that findings passed.'},
    versions:{node:process.version,babylon:JSON.parse(read('package.json').toString('utf8')).dependencies['@babylonjs/core']},
    sources:sourceFiles.map(file=>({file,sha256:hash(read(file))})),assets:assetProvenance,
    mug:{units:'metres',outerBounds,innerBounds,rimBounds,handleBounds,
      rim:{rayOrigin:origin,rayDirection:direction,rayPointWithinAuthoredWallBand:radialPointInsideWallBand,outerMinusRimMaxX:outerBounds.max[0]-rimBounds.max[0],sourceHits,actualGlbHits:glbHits,sourceFirstHitNearRim:firstHitNearRim,provenRimGapAtProbe:radialPointInsideWallBand&&!firstHitNearRim&&glbHits.length>0&&glbHits[0].hitY<outerBounds.max[1]-rim.size[1],limits:'One specific rim point. A later topology redesign requires inspecting the probe point; this is not a general watertightness validator.'},
      handle:{authoredTurn:handle.turn??[0,0,0],minimumPositiveXSeparation:handleXGap,provenDisjointAlongX:handleXGap>1e-9,history:'The same handle orientation/separation class was present in W1.1 per the prior source review. This probe measures the current candidate only; do not label it a new W1.1A regression.'}},
    materials:{rows:materialRows,anySidednessMismatch:materialRows.some(r=>!r.sidednessEqual),iorNote:'ART_W1_1A.md explicitly documents IOR in extras as adapter intent, not a KHR_materials_ior extension. Record the differing imported default without misrepresenting it as a hidden claim. The sidedness mismatch is the actionable parity issue.',transparencyNote:'A null runtime transparencyMode can still produce alpha blending; compare needsAlphaBlending rather than treating different mode enum values as a defect.'},
    applicationFilesModified:false,renderedVisualEvidence:false
  };
  fs.mkdirSync(path.dirname(output),{recursive:true});
  fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({output,rimGap:report.mug.rim.provenRimGapAtProbe,handleDisjoint:report.mug.handle.provenDisjointAlongX,glassMaterials:materialRows.length,sidednessMismatch:report.materials.anySidednessMismatch,renderedVisualEvidence:false},null,2));
} finally {
  engine?.dispose();
  await unregister();
}
