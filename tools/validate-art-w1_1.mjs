// Independent headless interchange reload. This is not a WebGL/render test.
import fs from 'node:fs';
import {NullEngine} from '@babylonjs/core/Engines/nullEngine.js';
import {Scene} from '@babylonjs/core/scene.js';
import {SceneLoader} from '@babylonjs/core/Loading/sceneLoader.js';
import '@babylonjs/loaders/glTF/index.js';
const manifest=JSON.parse(fs.readFileSync('assets/authoring/w1_1/manifest.json','utf8'));
const engine=new NullEngine();const results=[];
for(const a of manifest.assets){const scene=new Scene(engine);scene.useRightHandedSystem=true;const bytes=fs.readFileSync(a.file);const r=await SceneLoader.ImportMeshAsync(null,'',`data:base64,${bytes.toString('base64')}`,scene,undefined,'.glb');if(r.meshes.length<2||!scene.materials.length)throw Error(a.id);const bounds=r.meshes.filter(m=>m.getTotalVertices()>0).map(m=>{m.computeWorldMatrix(true);const b=m.getBoundingInfo().boundingBox;return {min:b.minimumWorld.asArray(),max:b.maximumWorld.asArray()};});if(bounds.some(b=>[...b.min,...b.max].some(n=>!Number.isFinite(n))))throw Error(`nonfinite ${a.id}`);results.push({id:a.id,meshes:r.meshes.length,materials:scene.materials.length,bounds,scope:'NullEngine import only; WebGL/Unity/native NOT TESTED'});scene.dispose();}
engine.dispose();fs.writeFileSync('evidence/art-w1_1-independent-import.json',JSON.stringify(results,null,2));console.log(JSON.stringify({assets:results.length,result:'headless import passed'}));
