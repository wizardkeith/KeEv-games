import {roomProbeContract} from '../src/art/native-room-probe';
import {nativeStylingRecipe,nativeWindowCanopy} from '../src/art/native-styling';
import {displaySamples,backDisplaySamples} from '../src/art/native-display';
import {catalog} from '../src/core/contracts';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {nativeRoomRecipe,nativeDoorContract,doorLeafRecipe,doorSignRecipe,plantParts,exteriorRecipe,nativeCounterRecipe,nativeDisplayRecipe} from '../src/art/native-environment';
import {nativeViewContract,nativeLighting} from '../src/art/native-view';

const root=process.cwd(),masterPath='assets/masters/native-v3/environment-v3.json',authoringPath='assets/authoring/native-v3/environment';
const hash=(buffer:Buffer|string)=>crypto.createHash('sha256').update(buffer).digest('hex');
const sourcePaths=['src/art/shop-v10.ts','src/art/tote-v10.ts','src/art/sculpt-v10.ts','assets/masters/native-v10/provenance.json','assets/masters/native-v10/surfaces.json','tools/generate-v10-surfaces.py','src/art/native-room-probe.ts','src/art/native-styling.ts','src/art/native-characters.ts','src/art/native-environment.ts','src/art/native-display.ts','src/art/back-display-v10.ts','src/art/native-view.ts','src/art/recipes.ts','src/art/geometry.ts','src/art/materials.ts','src/art/native-materials.ts','tools/export-native-environment.ts'];
const sources=Object.fromEntries(sourcePaths.map(file=>[file,hash(fs.readFileSync(path.join(root,file)))]));
const master={
 id:'environment.native-v3.1',format:'engine-neutral-recipe-json',version:'3.1',authoringVersion:'native-shop-v10',
 units:'metres',coordinateSystem:'right-handed Y-up; character fronts -Z',colors:'authored sRGB hex; convert with materials.linearColor for standard linear-light PBR factors',
 notes:['A JSON mesh-authoring master, not a GLB or embedded animation clip.','Runtime meshes are rebuilt with art/geometry.ts and the Babylon world adapter.','Rigid part leaf and door movement is applied around the authored local pivots.','Original V9 surface maps retained separately; nativeSurfaceGeometry supplies metre UVs; standard fixture GLBs embed their actual colour/normal maps.','No device or WebGL visual validation is implied by this export.'],
 sources,
 presentation:{camera:nativeViewContract,lighting:nativeLighting},roomProbe:roomProbeContract,surfaceAssets:JSON.parse(fs.readFileSync('assets/masters/native-v10/surfaces.json','utf8')),
 backDisplaySamples:backDisplaySamples(),displayVariants:[0,1,2].map(nativeDisplayRecipe),staging:catalog.offerings.map(o=>({id:o.id,samples:displaySamples(o.id,4,0)})),
 styling:nativeStylingRecipe(),windowCanopy:nativeWindowCanopy(),
 room:nativeRoomRecipe(),
 door:{contract:nativeDoorContract,leaf:doorLeafRecipe(),sign:doorSignRecipe()},
 plants:[1,.38,.52,.9,1.15].map(scale=>({scale,...plantParts(scale)})),
 exterior:exteriorRecipe(),counter:nativeCounterRecipe(),display:nativeDisplayRecipe(),
};
const bytes=Buffer.from(JSON.stringify(master,null,2)+'\n');
fs.mkdirSync(path.join(root,path.dirname(masterPath)),{recursive:true});
fs.mkdirSync(path.join(root,authoringPath),{recursive:true});
fs.writeFileSync(path.join(root,masterPath),bytes);
fs.writeFileSync(path.join(root,authoringPath,'manifest.json'),JSON.stringify({
 id:master.id,version:'3.1',master:{path:masterPath,sizeBytes:bytes.length,sha256:hash(bytes)},sources,
 rebuild:'node --import tsx tools/export-native-environment.ts',
 runtime:'src/world.ts imports native-environment.ts and native-view.ts; geometry.ts builds the same authored recipes. nativeGrouped/nativeMaterialIntent respect per-surface roughness while shared legacy materials remain unchanged.',
 assets:['split doorway and skirting, fixed jambs, real hinged glass leaf, separately hinged sign','fixed-base plants with seven leaf-local attachments','low cool-tone exterior buildings with paired gables, ridges, recessed window bays and small chimney; restrained foliage','counter drawer/edge/base detail, display tabletop/feet/label detail; native-only floor/table roughness and colour separation','actionable-shop and staff camera contracts with actual-safe-viewport fit, and restricted-face-fill lighting intent'],
 validation:'tests/native-environment.test.ts checks geometric aperture, opened leaf clearance, stable plant bases, finite geometry/material intent and five Minimal FX translations; tests/v31-art.test.ts checks actual Babylon RH projection fit, bounded low architectural geometry, native roughness and exported presentation parity. Neither is actual WebGL appearance acceptance.',
},null,2)+'\n');
fs.writeFileSync(path.join(root,authoringPath,'README.txt'),`Native v3.1 environment source and interchange contract\n\nRebuild from repository root:\n  node --import tsx tools/export-native-environment.ts\n\nMaster: ${masterPath}\nThis engine-neutral JSON preserves the complete recipes, material roles, local pivots and source hashes used by the actual Web scene. The standard geometry builder produces actual indexed meshes with normals; the material adapter converts authored sRGB colours to linear PBR factors. This JSON is not glTF and has no skeletal clips. It retains the procedural surface/probe contracts; nativeSurfaceGeometry derives metre UVs and the separate fixture GLBs embed the original surface maps.\n\nMetres; right handed; Y-up. Door root at [2.34,0.08,3.20], negative local Y rotation opens into exterior +Z. The back wall and skirting are split around the aperture, not hidden behind glass. Door sign is a separate child at contract.signPivot. Route controller must fully open the door before crossing and keep it open until travelers clear the sweep.\n\nPlant base contains pot, soil and fixed stem. Every leaf attachment pivot is plant-local, its recipe is attachment-local. Apply restrained relative rotation to leaf nodes only. Exterior geometry is a small stationary window vignette and does not create gameplay terrain.\n\nCounter and display recipes keep existing footprints and surfaces while adding visible construction details. Native-only matte floor roughness .83, counter top .57, display top .64 and wall shelf .76 are preserved per surface; they do not mutate shared historical material definitions. Product IDs, selection targets and authoritative inventory stay in the world/economic adapters.\n\nCamera/light intent is exported in master.presentation and authored in native-view.ts. The shop fit protects every critical shelf, counter, doorway/visitor foot/head and service-bay envelope over the curated yaw/elevation range inside the actual UI-safe viewport. Decorative outer plinth/upper-wall bounds do not force excess blank margins. Staff view is intentionally focused. Preserve user-selected zoom when resizing/repainting. Restricted face fill targets face skin/ink meshes only; exposure remains1 and no bloom is added. The candidate has been verified by geometry and Babylon projection matrices, not rendered WebGL. Low gables/ridges/window bays replace the previous tall raw exterior boxes.\n\nThe original Work-generated botanical print atlas is a2D albedo on real3D surfaces, with its own provenance and lossless master; no external stock model or video dependency is used. These original recipes were authored in this update. Source/geometry validation is not actual 3D visual acceptance or device performance evidence.\n`);
console.log(JSON.stringify({master:masterPath,sizeBytes:bytes.length,sha256:hash(bytes),manifest:`${authoringPath}/manifest.json`}));
