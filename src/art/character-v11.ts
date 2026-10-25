import {rebuildV11Shoes} from './shoes-v11';
import {rebuildV11Hands} from './hands-v11';
import {leafHairclip} from './hairclip-v11';
import {rebuildV11Garments} from './garments-v11';
/** V11 target slice: original editable Blender subdivision sculpt + authored UV
 * paint. Actual game meshes retain the V3 rigid hierarchy and contact pivots.
 * No target-image projection, billboard character or alternate simulation. */
import sculpt from '../../assets/masters/native-v11/misaki-head.json';
import type {NativePart,NativeSurface,NativeMesh} from './native-characters';
import {sculptSweep,finishSculpt} from './sculpt-v10';
import type {Geometry} from './geometry';
const source=sculpt as NativeMesh[];
const skin=source[0].geometry;
/** Intersect the actual subdivided face, so painted eyes/lips touch its skin
 * rather than assuming a flat front plane in front of a spherical head. */
export function v11FaceZ(x:number,y:number){
 let front=Infinity;
 for(let i=0;i<skin.indices.length;i+=3){const [a,b,c]=skin.indices.slice(i,i+3).map(n=>n*3),ax=skin.positions[a],ay=skin.positions[a+1],bx=skin.positions[b],by=skin.positions[b+1],cx=skin.positions[c],cy=skin.positions[c+1],d=(bx-ax)*(cy-ay)-(cx-ax)*(by-ay);if(Math.abs(d)<1e-12)continue;const u=((x-ax)*(cy-ay)-(cx-ax)*(y-ay))/d,v=((bx-ax)*(y-ay)-(x-ax)*(by-ay))/d;if(u>=-1e-8&&v>=-1e-8&&u+v<=1+1e-8)front=Math.min(front,skin.positions[a+2]+u*(skin.positions[b+2]-skin.positions[a+2])+v*(skin.positions[c+2]-skin.positions[a+2]));}
 if(!Number.isFinite(front))throw new RangeError('facial feature outside actual skin');return front;
}
function mounted(g:Geometry,pivot:number[],gap=.0008){
 for(let i=0;i<g.positions.length;i+=3)g.positions[i+2]=v11FaceZ(g.positions[i]+pivot[0],g.positions[i+1]+pivot[1])-gap-pivot[2];return finishSculpt(g);
}
const ink='#603D2E';
function eye(pivot:number[]):NativeSurface[]{
 const n=24,rows=3,g:Geometry&{uvs:number[]}={positions:[],normals:[],indices:[],uvs:[]};
 for(let r=0;r<=rows;r++)for(let j=0;j<=n;j++){const u=j/n*2-1,v=r/rows*2-1,h=Math.max(.0001,(1-u*u)**.55)*.041,x=u*.051,y=v*h;g.positions.push(x,y,0);g.uvs.push(1-j/n,1-r/rows);}
 for(let r=0;r<rows;r++)for(let j=0;j<n;j++){const a=r*(n+1)+j;g.indices.push(a,a+n+1,a+1,a+1,a+n+1,a+n+2);}
 return [{shape:'mesh',at:[0,0,0],color:'#FFFFFF',role:'ink',roughness:.67,baseColorTexture:'/assets/native-v11/misaki-eyes.png',geometry:mounted(g,pivot,.0009)}, skinLid([[-.051,0,0],[-.028,.034,0],[.014,.041,0],[.051,.010,0]],pivot,.0018), skinLid([[-.051,0,0],[-.020,-.038,0],[.020,-.036,0],[.051,0,0]],pivot,.0012,8),pigment([[-.051,.001,0],[-.028,.035,0],[.014,.042,0],[.051,.011,0]],pivot,.0012,8,.0037)];
}
function stroke(points:[number,number,number][],pivot:number[],radius=.0018,steps=12):NativeMesh{
 const g=sculptSweep(points,points.map(()=>radius),points.map(()=>radius),steps,4);for(let i=0;i<g.positions.length;i+=3)g.positions[i+2]+=v11FaceZ(g.positions[i]+pivot[0],g.positions[i+1]+pivot[1])-radius+.00005-pivot[2];return {shape:'mesh',at:[0,0,0],role:'ink',color:ink,geometry:finishSculpt(g)};
}
/** glTF image UVs are top-down. Match the actual front-view skin atlas on
 * the lid as well, so a flat pale material does not make a detached eye ring. */
function skinLid(points:[number,number,number][],pivot:number[],radius:number,steps=12):NativeMesh{
 const s=stroke(points,pivot,radius,steps),uvs:number[]=[];for(let i=0;i<s.geometry.positions.length;i+=3){const x=s.geometry.positions[i]+pivot[0],y=s.geometry.positions[i+1]+pivot[1];uvs.push(.5-x/.46,1-(y+.035)/.44);}return {...s,color:'#FFFFFF',role:'skin',roughness:.78,baseColorTexture:'/assets/native-v11/misaki-skin.png',geometry:{...s.geometry,uvs}};
}
/** Thin tapered pigment fitted to the sculpt; printed brows/liner avoid the
 * previous round, raised dark tube while the eyelid itself remains real skin. */
function pigment(points:[number,number,number][],pivot:number[],width:number,steps=12,gap=.0015):NativeMesh{
 const g:Geometry={positions:[],normals:[],indices:[]};
 for(let i=0;i<=steps;i++){const t=i/steps,p=Math.min(points.length-1-1e-8,t*(points.length-1)),j=Math.floor(p),u=p-j,v=[j-1,j,j+1,j+2].map(k=>points[Math.max(0,Math.min(points.length-1,k))]),at=(k:number)=>.5*(2*v[1][k]+(-v[0][k]+v[2][k])*u+(2*v[0][k]-5*v[1][k]+4*v[2][k]-v[3][k])*u*u+(-v[0][k]+3*v[1][k]-3*v[2][k]+v[3][k])*u*u*u),x=at(0),y=at(1),w=width*(.15+.85*Math.sin(Math.PI*t)**.5);for(const side of [-1,1]){const py=y+side*w;g.positions.push(x,py,v11FaceZ(x+pivot[0],py+pivot[1])-gap-pivot[2]);}}
 for(let i=0;i<steps;i++){const a=i*2;g.indices.push(a,a+1,a+2,a+1,a+3,a+2);}return {shape:'mesh',at:[0,0,0],role:'ink',color:ink,geometry:finishSculpt(g)};
}
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
