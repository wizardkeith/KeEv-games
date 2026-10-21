import fs from 'node:fs';
import validator from 'gltf-validator';
import {NullEngine} from '@babylonjs/core/Engines/nullEngine.js';
import {Scene} from '@babylonjs/core/scene.js';
import {SceneLoader} from '@babylonjs/core/Loading/sceneLoader.js';
import '@babylonjs/loaders/glTF/index.js';
const results=[];
for(const name of ['counter','skin-test']){
 const bytes=fs.readFileSync(`public/assets/${name}.glb`);const v=await validator.validateBytes(new Uint8Array(bytes),{uri:`${name}.glb`});
 const engine=new NullEngine();const scene=new Scene(engine);scene.useRightHandedSystem=true;
 const r=await SceneLoader.ImportMeshAsync(null,'',`data:base64,${bytes.toString('base64')}`,scene,undefined,'.glb');
 const result={name,bytes:bytes.length,validator:v.issues,meshes:r.meshes.length,bones:r.skeletons.map(s=>s.bones.map(b=>b.name)),clips:r.animationGroups.map(a=>a.name)};results.push(result);
 if(v.issues.numErrors || (name==='skin-test'&&(!r.skeletons[0]||r.skeletons[0].bones.length<2||!r.animationGroups.some(a=>a.name==='GentleWave'))))throw Error(JSON.stringify(result));
 if(r.animationGroups[0]){r.animationGroups[0].start(true);scene.getAnimationRatio();r.animationGroups[0].goToFrame(30);}
 scene.dispose();engine.dispose();
}
fs.writeFileSync('evidence/asset-validation.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));
