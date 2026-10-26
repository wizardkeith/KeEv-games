/** Existing wood-pencil SKU remade at hand scale, on the retained +X axis.
 * The old 58cm / 4.6cm-wide prop read as an oversized rod. Continuous shaft,
 * ferrule and point contacts; the catalog/price/stock unit remains unchanged.
 */
import type {NativeSurface,NativeMesh} from './native-characters';
import type {V3} from './recipes';
import {sculptSweep} from './sculpt-v10';
export function buildV11Pencil(color:string):NativeSurface[]{
 const segment=(a:V3,b:V3,r:number,s:number,color:string,role:NativeMesh['role']):NativeMesh=>({shape:'mesh',at:[0,0,0],geometry:sculptSweep([a,b],[r,s],[r,s],1,6),color,role});
 return [
  segment([-.080,.006,0],[.070,.006,0],.0048,.0048,color,'paint'),
  segment([.070,.006,0],[.097,.006,0],.0048,.00115,'#C4A778','wood'),
  segment([.097,.006,0],[.104,.006,0],.00115,.00015,'#554C43','ink'),
  {shape:'cylinder',size:[.0102,.016,.0102],at:[-.084,.006,0],color:'#B9AF95',role:'metal',turn:[0,0,Math.PI/2],top:1,segments:12},
  ...[-.079,-.084,-.089].map(x=>({shape:'cylinder' as const,size:[.011,.0009,.011] as V3,at:[x,.006,0] as V3,color:'#B9AF95',role:'metal' as const,turn:[0,0,Math.PI/2] as V3,top:1,segments:12})),
  {shape:'round',size:[.018,.010,.010],at:[-.100,.006,0],color:'#CCAEAA',role:'paint',roughness:.86,radius:.0022},
 ];
}
