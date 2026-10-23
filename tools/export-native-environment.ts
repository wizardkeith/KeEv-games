import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {nativeRoomRecipe,nativeDoorContract,doorLeafRecipe,doorSignRecipe,plantParts,exteriorRecipe,nativeCounterRecipe,nativeDisplayRecipe} from '../src/art/native-environment';

const root=process.cwd(),masterPath='assets/masters/native-v3/environment-v3.json',authoringPath='assets/authoring/native-v3/environment';
const hash=(buffer:Buffer|string)=>crypto.createHash('sha256').update(buffer).digest('hex');
const sourcePaths=['src/art/native-environment.ts','src/art/recipes.ts','src/art/geometry.ts','src/art/materials.ts','tools/export-native-environment.ts'];
const sources=Object.fromEntries(sourcePaths.map(file=>[file,hash(fs.readFileSync(path.join(root,file)))]));
const master={
 id:'environment.native-v3',format:'engine-neutral-recipe-json',version:3,
 units:'metres',coordinateSystem:'right-handed Y-up; character fronts -Z',colors:'authored sRGB hex; convert with materials.linearColor for standard linear-light PBR factors',
 notes:['A JSON mesh-authoring master, not a GLB or embedded animation clip.','Runtime meshes are rebuilt with art/geometry.ts and the Babylon world adapter.','Rigid part leaf and door movement is applied around the authored local pivots.','No UVs or image textures; solid geometry and semantic materials.','No device or WebGL visual validation is implied by this export.'],
 sources,
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
 id:master.id,version:3,master:{path:masterPath,sizeBytes:bytes.length,sha256:hash(bytes)},sources,
 rebuild:'node --import tsx tools/export-native-environment.ts',
 runtime:'src/world.ts imports native-environment.ts; geometry.ts builds the same authored recipes',
 assets:['split doorway and skirting, fixed jambs, real hinged glass leaf, separately hinged sign','fixed-base plants with seven leaf-local attachments','small cool-tone exterior branches, foliage and buildings','counter drawer/edge/base detail, display tabletop/feet/label detail'],
 validation:'tests/native-environment.test.ts checks geometric aperture, opened leaf clearance, stable plant bases, finite geometry/material intent and five Minimal FX translations. Actual WebGL appearance remains a separate acceptance step.',
},null,2)+'\n');
fs.writeFileSync(path.join(root,authoringPath,'README.txt'),`Native v3 environment source and interchange contract\n\nRebuild from repository root:\n  node --import tsx tools/export-native-environment.ts\n\nMaster: ${masterPath}\nThis engine-neutral JSON preserves the complete recipes, material roles, local pivots and source hashes used by the actual Web scene. The standard geometry builder produces actual indexed meshes with normals; the material adapter converts authored sRGB colours to linear PBR factors. It is not glTF and does not contain skeletal clips, texture atlases or UVs.\n\nMetres; right handed; Y-up. Door root at [2.34,0.08,3.20], negative local Y rotation opens into exterior +Z. The back wall and skirting are split around the aperture, not hidden behind glass. Door sign is a separate child at contract.signPivot. Route controller must fully open the door before crossing and keep it open until travelers clear the sweep.\n\nPlant base contains pot, soil and fixed stem. Every leaf attachment pivot is plant-local, its recipe is attachment-local. Apply restrained relative rotation to leaf nodes only. Exterior geometry is a small stationary window vignette and does not create gameplay terrain.\n\nCounter and display recipes keep existing footprints and surfaces while adding visible construction details. Product IDs, selection targets and authoritative inventory stay in the world/economic adapters.\n\nNo generated external images, paid assets or video dependencies were used. These original recipes were authored in this update. Source/geometry validation is not actual 3D visual acceptance or device performance evidence.\n`);
console.log(JSON.stringify({master:masterPath,sizeBytes:bytes.length,sha256:hash(bytes),manifest:`${authoringPath}/manifest.json`}));
