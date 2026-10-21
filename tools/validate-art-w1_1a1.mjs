// W1.1A1 independent loader and actual imported material checks; not rendered evidence.
import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {NullEngine} from '@babylonjs/core/Engines/nullEngine.js';
import {Scene} from '@babylonjs/core/scene.js';
import {SceneLoader} from '@babylonjs/core/Loading/sceneLoader.js';
import '@babylonjs/loaders/glTF/index.js';
const manifest=JSON.parse(fs.readFileSync('assets/authoring/w1_1a1/manifest.json','utf8'));
const engine=new NullEngine();const results=[];
for(const a of manifest.assets){
 const scene=new Scene(engine);scene.useRightHandedSystem=true;const bytes=fs.readFileSync(a.file);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),a.sha256);if(a.web)assert.deepEqual(fs.readFileSync(a.web),bytes);
 const json=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)).toString());const r=await SceneLoader.ImportMeshAsync(null,'',`data:base64,${bytes.toString('base64')}`,scene,undefined,'.glb');assert.ok(r.meshes.length>1);
 const materials=a.materials.map(spec=>{const authored=json.materials.find(x=>x.name===spec.materialId),actual=scene.materials.find(m=>m.name===spec.materialId);assert.ok(authored&&actual,spec.materialId);assert.equal(authored.doubleSided,spec.doubleSided);assert.equal(actual.backFaceCulling,!spec.doubleSided);assert.equal(actual.twoSidedLighting,spec.doubleSided);assert.equal(actual.roughness,spec.roughness);assert.equal(actual.metallic,spec.metallic);assert.equal(actual.alpha,spec.alpha);assert.equal(actual.needAlphaBlending(),spec.alphaMode==='BLEND'||spec.alpha<1);return {materialId:spec.materialId,role:spec.role,doubleSided:authored.doubleSided,backFaceCulling:actual.backFaceCulling,twoSidedLighting:actual.twoSidedLighting,alphaBlending:actual.needAlphaBlending(),iorIntent:authored.extras.iorIntent,importedIor:actual.indexOfRefraction};});
 const bounds=r.meshes.filter(m=>m.getTotalVertices()>0).map(m=>{m.computeWorldMatrix(true);const b=m.getBoundingInfo().boundingBox;return {min:b.minimumWorld.asArray(),max:b.maximumWorld.asArray()};});assert.ok(bounds.every(b=>[...b.min,...b.max].every(Number.isFinite)));results.push({id:a.id,meshes:r.meshes.length,materials,bounds,scope:'Actual NullEngine import/material adapter results only; WebGL appearance and native NOT TESTED'});scene.dispose();
}
engine.dispose();fs.writeFileSync('evidence/art-w1_1a1-independent-import.json',JSON.stringify(results,null,2));console.log(JSON.stringify({assets:results.length,result:'headless import and semantic sidedness passed',materialsChecked:results.reduce((n,x)=>n+x.materials.length,0)}));
