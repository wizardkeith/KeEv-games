/** A continuous pleated skirt and gathered sleeves replace the V10 clothing
 * shapes for the hero slice. Rigid joints and arm lengths remain unchanged.
 * Apron/pocket are redraped over actual new support triangles, with thickness. */
import type {NativePart,NativeSurface,NativeMesh} from './native-characters';
import type {Geometry} from './geometry';
import {sculptLoft,finishSculpt} from './sculpt-v10';
const material=(geometry:Geometry,color:string):NativeMesh=>({shape:'mesh',at:[0,0,0],geometry,color,role:'fabric',roughness:.90});
function skirt():NativeMesh{
 const controls=[{y:.301,x:.307,z:.255},{y:.330,x:.322,z:.267},{y:.46,x:.282,z:.240},{y:.60,x:.211,z:.169},{y:.74,x:.149,z:.110}],g=sculptLoft(controls,32,.068);
 for(let i=0;i<g.positions.length;i+=3){const y=g.positions[i+1],a=Math.atan2(g.positions[i+2],g.positions[i]),hemWeight=Math.max(0,1-(y-.30)/.44),detail=1+.022*Math.cos(a*13+.4)*hemWeight;g.positions[i]*=detail;g.positions[i+2]*=detail;g.positions[i+1]+=.0045*Math.sin(a*5)*hemWeight;}
 return material(finishSculpt(g),'#795D70');
}
function frontZ(x:number,y:number,supports:NativeMesh[]){let front=Infinity;for(const s of supports){const g=s.geometry;for(let k=0;k<g.indices.length;k+=3){const [a,b,c]=g.indices.slice(k,k+3).map(i=>g.positions.slice(i*3,i*3+3)),d=(b[0]-a[0])*(c[1]-a[1])-(c[0]-a[0])*(b[1]-a[1]);if(Math.abs(d)<1e-12)continue;const u=((x-a[0])*(c[1]-a[1])-(c[0]-a[0])*(y-a[1]))/d,v=((b[0]-a[0])*(y-a[1])-(x-a[0])*(b[1]-a[1]))/d;if(u>=-1e-8&&v>=-1e-8&&u+v<=1+1e-8)front=Math.min(front,a[2]+u*(b[2]-a[2])+v*(c[2]-a[2]));}}return front;}
function redrape(part:NativeMesh,supports:NativeMesh[],gap:number):NativeMesh{
 const g={...part.geometry,positions:[...part.geometry.positions],normals:[...part.geometry.normals],indices:[...part.geometry.indices]},rows=new Map<string,{ids:number[];x:number;y:number;front:number}>();
 for(let i=0;i<g.positions.length;i+=3){const [x,y,z]=g.positions.slice(i,i+3),key=x.toFixed(10)+':'+y.toFixed(10),r=rows.get(key)??{ids:[],x,y,front:z};r.ids.push(i);r.front=Math.min(r.front,z);rows.set(key,r);}
 for(const r of rows.values()){const support=frontZ(r.x,r.y,supports);if(Number.isFinite(support)){const shift=Math.min(0,support-gap-r.front);for(const i of r.ids)g.positions[i+2]+=shift;}}
 return {...part,geometry:finishSculpt(g)};
}
export function rebuildV11Garments(parts:NativePart[]):NativePart[]{
 const body=parts.find(p=>p.id==='body')!,newSkirt=skirt();
 // V10's explicit skirt/apron/pocket construction remains in its original
 // builder. This hero replacement operates on those known authoring parts.
 if(body.recipe[7]?.shape!=='mesh'||body.recipe[8]?.shape!=='mesh'||body.recipe[9]?.shape!=='mesh')throw Error('garment authoring structure changed');
 body.recipe[7]=newSkirt;
 const apron=redrape(body.recipe[8] as NativeMesh,[newSkirt],.018);body.recipe[8]=apron;body.recipe[9]=redrape(body.recipe[9] as NativeMesh,[apron],.010);
 for(const side of [-1,1]){const p=parts.find(p=>p.id==='arm-'+(side<0?'left':'right'))!;p.recipe=[material(sculptLoft([{y:-.224,x:.052,z:.049,cx:side*.006},{y:-.204,x:.069,z:.063,cx:side*.007},{y:-.14,x:.081,z:.071,cx:side*.006},{y:-.055,x:.078,z:.069},{y:.010,x:.064,z:.060,cx:-side*.013},{y:.056,x:.020,z:.024,cx:-side*.055}],16,.038),'#819880'),material(sculptLoft([{y:-.229,x:.045,z:.044,cx:side*.006},{y:-.224,x:.064,z:.059,cx:side*.006},{y:-.205,x:.073,z:.067,cx:side*.006},{y:-.182,x:.066,z:.061,cx:side*.006},{y:-.176,x:.051,z:.048,cx:side*.006}],12,.020),'#819880')];}
 return parts;
}
