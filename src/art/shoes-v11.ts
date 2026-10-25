/** Rounded low leather shoes and continuous curved outsole. Same ankle joint,
 * exact 15mm sole rest height, footprint and locomotion/contact calibration. */
import type {NativePart,NativeMesh} from './native-characters';
import type {Geometry} from './geometry';
import {sculptLoft,sculptSweep} from './sculpt-v10';
const leather=(geometry:Geometry,color:string,roughness:number):NativeMesh=>({shape:'mesh',at:[0,0,0],color,role:'paint',roughness,geometry});
export function rebuildV11Shoes(parts:NativePart[]){
 for(const side of ['left','right']){
  const foot=parts.find(p=>p.id==='foot-'+side)!;
  foot.recipe=[leather(sculptLoft([{y:-.070,x:.055,z:.092,cz:-.034},{y:-.051,x:.060,z:.101,cz:-.034},{y:-.027,x:.053,z:.084,cz:-.029},{y:.003,x:.035,z:.048,cz:-.009}],16),'#59483F',.48),leather(sculptLoft([{y:-.085,x:.055,z:.095,cz:-.034},{y:-.078,x:.062,z:.103,cz:-.034},{y:-.063,x:.059,z:.100,cz:-.034}],12),'#8C7764',.84)];
  for(const z of [-.074,-.053])foot.recipe.push({...leather(sculptSweep([[-.024,-.010,z],[0,-.003,z-.005],[.024,-.010,z]],[.0017,.002,.0017],[.0017,.002,.0017],4,4),'#C2AC88',.90),role:'fabric'});
 }
 return parts;
}
