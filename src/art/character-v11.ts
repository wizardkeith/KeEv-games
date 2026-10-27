import {rebuildV11Shoes} from './shoes-v11';
import {rebuildV11Hands} from './hands-v11';
import {leafHairclip} from './hairclip-v11';
import {rebuildV11Garments} from './garments-v11';
/** V11 target slice: original editable Blender subdivision sculpt + authored UV
 * paint. Actual game meshes retain the V3 rigid hierarchy and contact pivots.
 * No target-image projection, billboard character or alternate simulation. */
import sculpt from '../../assets/masters/native-v11/misaki-head.json';
import type {NativePart,NativeSurface,NativeMesh} from './native-characters';
import {createV11Portrait} from './portrait-v11';
const source=sculpt as NativeMesh[];
const portrait=createV11Portrait(source[0].geometry,'/assets/native-v11/misaki-skin.png');
export const v11FaceZ=portrait.z;
const {eye,stroke,pigment}=portrait;
let cached:NativePart[]|undefined;
export function rebuildV11Misaki(parts:NativePart[]):NativePart[]{
 if(cached)return cached;
 const head=parts.find(p=>p.id==='head')!;head.recipe=source.filter((_,i)=>i!==10&&i!==16).map(s=>({...s}));head.recipe.push(leafHairclip(source.filter(s=>s.role==='hair')));
 for(const [side,index]of [['left',10],['right',16]]as const){const part=parts.find(p=>p.id==='hair-secondary-'+side)!;part.recipe=[{...source[index],geometry:{...source[index].geometry,positions:source[index].geometry.positions.map((v,i)=>v-part.pivot[i%3])}}];}
 for(const side of [-1,1]){const id=side<0?'left':'right',part=parts.find(p=>p.id==='eye-'+id)!;part.pivot=[side*.083,.161,0];part.recipe=eye(part.pivot);
  const lid=parts.find(p=>p.id==='eyelid-'+id)!;lid.pivot=[...part.pivot];lid.recipe=[stroke([[-.052,.001,0],[-.018,-.009,0],[.021,-.008,0],[.052,.004,0]],lid.pivot)];
  const brow=parts.find(p=>p.id==='brow-'+id)!;brow.pivot=[side*.084,.226,0];brow.recipe=[pigment([[-.034,-.002,0],[-.010,.007,0],[.017,.005,0],[.034,-.003,0]],brow.pivot,.0019)];
 }
 const mouth=parts.find(p=>p.id==='mouth')!;mouth.pivot=[0,.055,0];mouth.recipe=[{...stroke([[-.023,.003,0],[-.008,-.005,0],[.008,-.005,0],[.023,.003,0]],mouth.pivot,.0013),color:'#B46D60'}];
 cached=rebuildV11Shoes(rebuildV11Hands(rebuildV11Garments(parts)));return cached;
}
