/** Exact unwrapped sculpt input. Run before the Blender UV stage after editing
 * a garment; a signature mismatch stops stale atlases entering the game. */
import fs from 'node:fs';
import {buildV11FemaleRaw} from '../src/art/customer-female-v11';
import {buildV10Character} from '../src/art/characters-v10';
import {garmentSignature} from '../src/art/garment-uv-v11';
const parts=buildV11FemaleRaw(buildV10Character('visitor-b')),surfaces=Object.fromEntries(parts.flatMap(p=>p.recipe.flatMap((s,i)=>s.finish&&s.shape==='mesh'?[[p.id+':'+i,{signature:garmentSignature(s.geometry),finish:s.finish,geometry:s.geometry}]]:[])));
fs.writeFileSync('assets/masters/native-v11/visitor-b-cloth-input.json',JSON.stringify({version:1,units:'metres',axes:'RH Y up',surfaces})+'\n');console.log(JSON.stringify({surfaces:Object.keys(surfaces).length}));
