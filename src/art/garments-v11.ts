/** A continuous pleated skirt and gathered sleeves replace the V10 clothing
 * shapes for the hero slice. Rigid joints and arm lengths remain unchanged.
 * Apron/pocket are redraped over actual new support triangles, with thickness. */
import type {NativePart,NativeSurface,NativeMesh} from './native-characters';
import type {Geometry} from './geometry';
import {sculptLoft,sculptSweep,finishSculpt} from './sculpt-v10';
const material=(geometry:Geometry,color:string):NativeMesh=>({shape:'mesh',at:[0,0,0],geometry,color,role:'fabric',roughness:.90});
function skirt():NativeMesh{
 const controls=[{y:.301,x:.307,z:.255},{y:.330,x:.322,z:.267},{y:.46,x:.282,z:.240},{y:.60,x:.211,z:.169},{y:.74,x:.149,z:.110}],g=sculptLoft(controls,32,.068);
 for(let i=0;i<g.positions.length;i+=3){const y=g.positions[i+1],a=Math.atan2(g.positions[i+2],g.positions[i]),hemWeight=Math.max(0,1-(y-.30)/.44),detail=1+.022*Math.cos(a*13+.4)*hemWeight;g.positions[i]*=detail;g.positions[i+2]*=detail;g.positions[i+1]+=.0045*Math.sin(a*5)*hemWeight;}
 return material(finishSculpt(g),'#795D70');
}
export function frontZ(x:number,y:number,supports:NativeMesh[]){let front=Infinity;for(const s of supports){const g=s.geometry;for(let k=0;k<g.indices.length;k+=3){const [a,b,c]=g.indices.slice(k,k+3).map(i=>g.positions.slice(i*3,i*3+3)),d=(b[0]-a[0])*(c[1]-a[1])-(c[0]-a[0])*(b[1]-a[1]);if(Math.abs(d)<1e-12)continue;const u=((x-a[0])*(c[1]-a[1])-(c[0]-a[0])*(y-a[1]))/d,v=((b[0]-a[0])*(y-a[1])-(x-a[0])*(b[1]-a[1]))/d;if(u>=-1e-8&&v>=-1e-8&&u+v<=1+1e-8)front=Math.min(front,a[2]+u*(b[2]-a[2])+v*(c[2]-a[2]));}}return front;}
function redrape(part:NativeMesh,supports:NativeMesh[],gap:number):NativeMesh{
 const g={...part.geometry,positions:[...part.geometry.positions],normals:[...part.geometry.normals],indices:[...part.geometry.indices]},rows=new Map<string,{ids:number[];x:number;y:number;front:number}>();
 for(let i=0;i<g.positions.length;i+=3){const [x,y,z]=g.positions.slice(i,i+3),key=x.toFixed(10)+':'+y.toFixed(10),r=rows.get(key)??{ids:[],x,y,front:z};r.ids.push(i);r.front=Math.min(r.front,z);rows.set(key,r);}
 for(const r of rows.values()){const support=frontZ(r.x,r.y,supports);if(Number.isFinite(support)){const shift=Math.min(0,support-gap-r.front);for(const i of r.ids)g.positions[i+2]+=shift;}}
 return {...part,geometry:finishSculpt(g)};
}
interface PatternRow {y:number;inner:number;outer:number}
/** A closed, cut-and-sewn front pattern fitted to the actual curved torso.
 * It has thickness and continuous sloping shoulders, rather than upright bars. */
export function fittedPattern(rows:PatternRow[],support:NativeMesh,side:number,gap:number,color:string):NativeMesh{
 const cols=6,stride=cols+1,count=rows.length*stride,g:Geometry={positions:[],normals:[],indices:[]};
 for(let layer=0;layer<2;layer++)for(const [r,row]of rows.entries())for(let j=0;j<=cols;j++){
  const u=j/cols,x=side*(row.inner+(row.outer-row.inner)*u),sample=frontZ(x,row.y,[support]);
  if(!Number.isFinite(sample))throw Error('tailored garment outside torso '+x+','+row.y);
  const fold=.0015*Math.sin(u*Math.PI*4+r*.4)*(1-r/rows.length),z=sample-gap+layer*.0025+fold;g.positions.push(x,row.y,z);
 }
 for(let layer=0;layer<2;layer++)for(let r=0;r<rows.length-1;r++)for(let j=0;j<cols;j++){const a=layer*count+r*stride+j,b=a+1,c=a+stride,d=c+1;g.indices.push(...(layer?[a,b,c,b,d,c]:[a,c,b,b,c,d]));}
 const bridge=(a:number,b:number)=>{const n=g.positions.length/3;for(const i of [a,b,a+count,b+count])g.positions.push(...g.positions.slice(i*3,i*3+3));g.indices.push(n,n+1,n+2,n+1,n+3,n+2);};
 for(let j=0;j<cols;j++){bridge(j,j+1);bridge((rows.length-1)*stride+j+1,(rows.length-1)*stride+j);}for(let r=0;r<rows.length-1;r++){bridge((r+1)*stride,r*stride);bridge(r*stride+cols,(r+1)*stride+cols);}
 return material(finishSculpt(g),color);
}
function collarFlap(side:number):NativeMesh{
 const points=[[.022,1.205,-.055],[.053,1.195,-.072],[.071,1.174,-.105],[.065,1.147,-.129],[.027,1.172,-.091]],g:Geometry={positions:[],normals:[],indices:[]};
 for(let layer=0;layer<2;layer++)for(const [x,y,z]of points)g.positions.push(side*x,y,z+layer*.003);
 for(let j=1;j<4;j++){g.indices.push(0,j,j+1,5,5+j+1,5+j);}
 for(let j=0;j<5;j++){const next=(j+1)%5,n=g.positions.length/3;for(const id of [j,next,j+5,next+5])g.positions.push(...g.positions.slice(id*3,id*3+3));g.indices.push(n,n+1,n+2,n+1,n+3,n+2);}
 return material(finishSculpt(g),'#F3E8D4');
}
function tailoredUpperBody(body:NativePart){
 const torso=material(sculptLoft([{y:.735,x:.143,z:.109},{y:.82,x:.154,z:.121},{y:.96,x:.184,z:.142,cz:-.004},{y:1.065,x:.199,z:.135,cz:-.004},{y:1.12,x:.193,z:.117},{y:1.17,x:.136,z:.084},{y:1.202,x:.064,z:.054}],20,.008),'#819880');
 body.recipe[0]=torso;
 body.recipe[1]=fittedPattern([{y:.78,inner:-.066,outer:.066},{y:.86,inner:-.075,outer:.075},{y:.96,inner:-.079,outer:.079},{y:1.065,inner:-.075,outer:.075},{y:1.14,inner:-.056,outer:.056},{y:1.195,inner:-.035,outer:.035}],torso,1,.006,'#F3E8D4');
 body.recipe[2]={...material(sculptLoft([{y:1.185,x:.046,z:.043},{y:1.221,x:.042,z:.040},{y:1.263,x:.046,z:.043}],12),'#F2CBB2'),role:'skin',roughness:.78};
 for(const side of [-1,1]){
  const index=side<0?3:5;
  body.recipe[index]=fittedPattern([{y:.75,inner:.057,outer:.138},{y:.83,inner:.060,outer:.148},{y:.96,inner:.069,outer:.178},{y:1.065,inner:.068,outer:.192},{y:1.12,inner:.052,outer:.185},{y:1.17,inner:.032,outer:.126},{y:1.195,inner:.021,outer:.060}],torso,side,.011,'#819880');
  body.recipe[index+1]=collarFlap(side);
 }
 // Existing buttons are relocated to the real curved blouse front.
 for(let i=0;i<4;i++){const button=body.recipe[11+i],y=1.15-i*.063,z=frontZ(0,y,[torso])-.012;body.recipe[11+i]={...button,at:[0,y,z]};}
}
export function rebuildV11Garments(parts:NativePart[]):NativePart[]{
 const body=parts.find(p=>p.id==='body')!,newSkirt=skirt();tailoredUpperBody(body);
 // V10's explicit skirt/apron/pocket construction remains in its original
 // builder. This hero replacement operates on those known authoring parts.
 if(body.recipe[7]?.shape!=='mesh'||body.recipe[8]?.shape!=='mesh'||body.recipe[9]?.shape!=='mesh')throw Error('garment authoring structure changed');
 body.recipe[7]=newSkirt;
 const apron=redrape(body.recipe[8] as NativeMesh,[newSkirt],.018);body.recipe[8]=apron;body.recipe[9]=redrape(body.recipe[9] as NativeMesh,[apron],.010);
 for(const side of [-1,1]){const p=parts.find(p=>p.id==='arm-'+(side<0?'left':'right'))!;p.recipe=[material(sculptLoft([{y:-.224,x:.052,z:.049,cx:side*.006},{y:-.204,x:.069,z:.063,cx:side*.007},{y:-.14,x:.081,z:.071,cx:side*.006},{y:-.055,x:.078,z:.069},{y:.010,x:.064,z:.060,cx:-side*.013},{y:.056,x:.020,z:.024,cx:-side*.055}],16,.038),'#819880'),material(sculptLoft([{y:-.229,x:.045,z:.044,cx:side*.006},{y:-.224,x:.064,z:.059,cx:side*.006},{y:-.205,x:.073,z:.067,cx:side*.006},{y:-.182,x:.066,z:.061,cx:side*.006},{y:-.176,x:.051,z:.048,cx:side*.006}],12,.020),'#819880')];}
 return parts;
}
