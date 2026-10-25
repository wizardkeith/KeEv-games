/** Export actual static game geometry for a floor contact-occlusion bake.
 * Dynamic inventory/actors/door/parcel deliberately do not enter the bake. */
import fs from 'node:fs';
import {nativeMaterialIntent} from '../src/art/native-materials';
import {nativeWindowCanopy} from '../src/art/native-styling';
import {exteriorRecipe} from '../src/art/native-environment';
import {nativeLighting} from '../src/art/native-view';
import {nativeRoomRecipe,nativeCounterRecipe,nativeDisplayRecipe,plantParts} from '../src/art/native-environment';
import {nativeStylingRecipe} from '../src/art/native-styling';
import {backDisplayRecipe} from '../src/art/back-display-v10';
import {nativeSurfaceGeometry,type NativeSurface} from '../src/art/native-characters';
import layout from '../src/content/layout.json';
const meshes:unknown[]=[];
function add(name:string,parts:NativeSurface[],at=[0,0,0]){for(const [i,p]of parts.entries()){if((p.alpha??1)<1||p.roughness===.83)continue;const g=nativeSurfaceGeometry(p);if(Math.max(...g.positions.filter((_,i)=>i%3===1))+at[1]<=.080)continue;meshes.push({name:name+'.'+i,positions:g.positions.map((v,k)=>v+at[k%3]),indices:g.indices,material:nativeMaterialIntent(p)});}}
add('actual.room',nativeRoomRecipe());add('actual.counter',nativeCounterRecipe(),layout.counter.position);add('actual.styling',nativeStylingRecipe());add('actual.showroom',backDisplayRecipe());
for(const [i,d]of layout.displays.entries())add('actual.display.'+i,nativeDisplayRecipe(i),[d.position[0],.08,d.position[2]]);
for(const [i,[x,z,scale]]of [[-3.9,2.6,1.15],[-3.95,-2.7,1.4],[1.2,2.95,.52],[4.1,2.5,1.45]].entries()){const p=plantParts(scale),y=scale===.52?1.5235:.08;add('actual.plant.'+i,p.base,[x,y,z]);for(const [k,l]of p.leaves.entries())add('actual.plant.'+i+'.leaf.'+k,l.recipe,[x+l.pivot[0],y+l.pivot[1],z+l.pivot[2]]);}
add('actual.exterior',[...exteriorRecipe(),...nativeWindowCanopy()]);
const out=process.env.V11_BAKE_SCENE||'/workspace/qa/v11-slice/light-bake/actual-static-scene.json';fs.mkdirSync(out.slice(0,out.lastIndexOf('/')),{recursive:true});fs.writeFileSync(out,JSON.stringify({axes:'RH Y-up metres',lighting:nativeLighting,floor:{min:[-4.55,.079,-3.3],max:[4.55,.079,3.3]},meshes}));console.log(JSON.stringify({out,staticMeshes:meshes.length,staticLighting:true}));
