import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {NullEngine} from '@babylonjs/core/Engines/nullEngine';
import {Scene} from '@babylonjs/core/scene';
import {ArcRotateCamera} from '@babylonjs/core/Cameras/arcRotateCamera';
import {Vector3,Matrix} from '@babylonjs/core/Maths/math.vector';
import {Viewport} from '@babylonjs/core/Maths/math.viewport';
import {linearColor,materialRenderState} from '../src/art/materials';
import {artDirection,curatedRadius} from '../src/art/direction';
import {displayRecipe,counterRecipe,personRecipe,palette,productRecipe} from '../src/art/recipes';
import {geometry} from '../src/art/geometry';
import {catalog} from '../src/core/contracts';
const hash=(b:Buffer)=>crypto.createHash('sha256').update(b).digest('hex');

test('authored sRGB decodes once to linear light, preserving black, white, low segment and alpha',()=>{
 assert.deepEqual(linearColor('#000000'),[0,0,0]);assert.deepEqual(linearColor('#FFFFFF'),[1,1,1]);
 const middle=linearColor('#808080')[0];assert.ok(Math.abs(middle-.21586050011389926)<1e-14);assert.ok(middle<.3,'reject raw normalized gamma code values');
 assert.ok(Math.abs(linearColor('#0A0000')[0]-(10/255)/12.92)<1e-14);assert.equal(materialRenderState('glass','#808080',.16).alpha,.16);assert.throws(()=>linearColor('grey'));
});

test('all actual candidate GLBs contain correctly decoded factors and original semantic alpha/sidedness',()=>{
 const manifest=JSON.parse(fs.readFileSync('assets/authoring/w1_1b/manifest.json','utf8'));assert.equal(manifest.assets.length,15);
 for(const a of manifest.assets){const bytes=fs.readFileSync(a.file);assert.equal(hash(bytes),a.sha256);assert.deepEqual(fs.readFileSync(a.web),bytes);
  const json=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)).toString());
  for(const m of json.materials){const spec=a.materials.find((s:{materialId:string})=>s.materialId===m.name);assert.ok(spec);assert.equal(m.extras.authoredSrgbHex,spec.color);assert.equal(m.extras.colorEncoding,'linear-from-authored-srgb');assert.deepEqual(m.pbrMetallicRoughness.baseColorFactor,[...linearColor(spec.color),spec.alpha]);assert.equal(m.doubleSided,spec.doubleSided);}
 }
});

test('curated frame envelope projects inside the real Babylon RH camera for Zen, normal and panel viewports',()=>{
 for(const [width,height] of [[1862,1166],[1363,650],[943,650],[375,500],[375,200]]){
  const engine=new NullEngine({renderWidth:width,renderHeight:height,textureSize:512,deterministicLockstep:false,lockstepMaxSteps:4});const scene=new Scene(engine);scene.useRightHandedSystem=true;
  try{const radius=curatedRadius(width/height);const camera=new ArcRotateCamera('projection-only',0,0,radius,Vector3.FromArray([...artDirection.target]),scene);camera.fov=.8;camera.minZ=.1;camera.maxZ=90;
   for(const alpha of Array.from({length:21},(_,i)=>-Math.PI/4-.27+i*.027))for(const deg of Array.from({length:11},(_,i)=>45+i)){camera.alpha=alpha;camera.beta=deg*Math.PI/180;const transform=camera.getViewMatrix(true).multiply(camera.getProjectionMatrix(true));for(const p of artDirection.framingHull){const projected=Vector3.Project(Vector3.FromArray([...p]),Matrix.Identity(),transform,new Viewport(0,0,width,height));assert.ok(projected.x>=width*.029&&projected.x<=width*.971,`${width}x${height} horizontal ${projected.x}`);assert.ok(projected.y>=height*.029&&projected.y<=height*.971,`${width}x${height} vertical ${projected.y}`);assert.ok(projected.z>0&&projected.z<1);}}
  }finally{scene.dispose();engine.dispose();}
 }
 const desktop=curatedRadius(1.6);assert.ok(desktop<15.8*.92&&desktop>15.8*.85,'desktop candidate closes toward 10% while fitting the full hull');
});

test('resting display products use the authored table surface with millimetre clearance, not a floating offset',()=>{
 for(const [recipe,base] of [[displayRecipe(),artDirection.fixtureBaseY],[counterRecipe(),artDirection.fixtureBaseY],[personRecipe(palette.staff),artDirection.actorBaseY]] as const){const min=Math.min(...recipe.flatMap(p=>geometry(p).positions.filter((_,i)=>i%3===1)));assert.ok(Math.abs(min+base-artDirection.floorY-artDirection.restingGap)<1e-10,'fixture/actor actually contacts floor, not only a shadow offset');}
 const table=displayRecipe()[0],g=geometry(table),top=Math.max(...g.positions.filter((_,i)=>i%3===1))+.08;assert.ok(Math.abs(top-artDirection.displaySurfaceY)<1e-12);
 for(const o of catalog.offerings){const bottom=Math.min(...productRecipe(o.id,o.color).flatMap(p=>geometry(p).positions.filter((_,i)=>i%3===1))),scale=o.id==='off.pencil'?1.05:.82,gap=artDirection.restingGap+bottom*scale;assert.ok(gap>=-.0001&&gap<.007,`${o.id} resting gap ${gap}`);}
});

test('accepted W1.1A1 master/Web bytes and frozen authoring sources remain intact',()=>{
 const m=JSON.parse(fs.readFileSync('assets/authoring/w1_1a1/manifest.json','utf8'));for(const a of m.assets)for(const p of [a.file,a.web].filter(Boolean))assert.equal(hash(fs.readFileSync(p)),a.sha256,p);
 const root='assets/authoring/w1_1a1/source_snapshot/',provenance=JSON.parse(fs.readFileSync(root+'PROVENANCE.json','utf8'));assert.equal(provenance.canonical_commit,'b093c50fa13cfca80c8b10fdfd96e716114a2d7d');for(const [name,digest] of Object.entries(provenance.files))assert.equal(hash(fs.readFileSync(root+name)),digest);
});
