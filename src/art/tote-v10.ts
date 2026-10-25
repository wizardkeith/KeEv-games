/** Cloth tote in one bag-local metre coordinate system. Thickness is centred
 * around Z=0; details attach to the actual front/back triangles, not an assumed
 * plane. This is the existing off.tote SKU, never the checkout prop or stock. */
import type {Geometry} from './geometry';
import type {NativeMesh,NativeSurface} from './native-characters';
import type {V3} from './recipes';
import {sculptCloth,sculptSweep,finishSculpt} from './sculpt-v10';
import {botanicalPrintMaterial} from './shop-v10';
const thickness=.086,columns=20;
const rows=[{y:.012,w:.136,z:0},{y:.09,w:.158,z:0},{y:.22,w:.148,z:0},{y:.302,w:.149,z:0}];
/** Actual XY triangle intersection; throws when an attachment lies off the cloth. */
function surfaceZ(g:Geometry,x:number,y:number,back=false){
 const hits:number[]=[];
 for(let k=0;k<g.indices.length;k+=3){const [a,b,c]=g.indices.slice(k,k+3).map(i=>g.positions.slice(i*3,i*3+3)),det=(b[0]-a[0])*(c[1]-a[1])-(c[0]-a[0])*(b[1]-a[1]);if(Math.abs(det)<1e-12)continue;
  const u=((x-a[0])*(c[1]-a[1])-(c[0]-a[0])*(y-a[1]))/det,v=((b[0]-a[0])*(y-a[1])-(x-a[0])*(b[1]-a[1]))/det;
  if(u>=-1e-8&&v>=-1e-8&&u+v<=1+1e-8)hits.push(a[2]+u*(b[2]-a[2])+v*(c[2]-a[2]));
 }
 if(!hits.length)throw Error('Tote attachment outside actual cloth');return back?Math.max(...hits):Math.min(...hits);
}
/** Clip the actual front triangles to a printed rectangle. Every resulting
 * triangle stays parallel to its supporting cloth facet, preserving the tiny
 * physical print thickness without bridging over/dipping through folds. */
function clothPrint(body:Geometry):NativeMesh{
 const g:Geometry&{uvs:number[]}={positions:[],normals:[],indices:[],uvs:[]},xmin=-.0725,xmax=.0725,ymin=.0815,ymax=.2465;
 const clip=(points:number[][],axis:number,bound:number,sign:number)=>{const out:number[][]=[];for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length],insideA=(a[axis]-bound)*sign>=-1e-12,insideB=(b[axis]-bound)*sign>=-1e-12;if(insideA)out.push(a);if(insideA!==insideB){const t=(bound-a[axis])/(b[axis]-a[axis]);out.push(a.map((v,k)=>v+(b[k]-v)*t));}}return out;};
 const frontVertices=rows.length*(columns+1);
 for(let k=0;k<body.indices.length;k+=3){const ids=body.indices.slice(k,k+3);if(ids.some(i=>i>=frontVertices))continue;
  let polygon=ids.map(i=>[...body.positions.slice(i*3,i*3+3),...body.normals.slice(i*3,i*3+3)]);
  for(const [axis,bound,sign]of [[0,xmin,1],[0,xmax,-1],[1,ymin,1],[1,ymax,-1]])polygon=clip(polygon,axis,bound,sign);
  if(polygon.length<3)continue;const start=g.positions.length/3,n=polygon.length;
  for(let side=0;side<2;side++)for(const p of polygon){g.positions.push(p[0],p[1],p[2]+(side?.00005:-.0006));const len=Math.hypot(...p.slice(3));g.normals.push(...p.slice(3).map(v=>v/len*(side?-1:1)));g.uvs.push(.025+(p[0]-xmin)/(xmax-xmin)*.45,.975-(p[1]-ymin)/(ymax-ymin)*.45);}
  for(let i=1;i<n-1;i++)g.indices.push(start,start+i,start+i+1,start+n,start+n+i+1,start+n+i);
  // The 0.65mm paper layer reaches 0.05mm into its cloth support. Real back
  // and edge triangles bridge the offset; it is not a floating decal plane.
  for(let i=0;i<n;i++){const a=start+i,b=start+(i+1)%n,ids=[a,a+n,b,b+n],edge=g.positions.length/3;for(const j of ids){g.positions.push(...g.positions.slice(j*3,j*3+3));g.uvs.push(...g.uvs.slice(j*2,j*2+2));}const A=g.positions.slice(edge*3,edge*3+3),B=g.positions.slice((edge+1)*3,(edge+1)*3+3),C=g.positions.slice((edge+2)*3,(edge+2)*3+3),u=B.map((v,k)=>v-A[k]),v=C.map((v,k)=>v-A[k]),normal=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],len=Math.hypot(...normal);for(let j=0;j<4;j++)g.normals.push(...normal.map(v=>v/len));g.indices.push(edge,edge+1,edge+2,edge+2,edge+1,edge+3);}

 }
 return {shape:'mesh',at:[0,0,0],color:'#FFFFFF',role:'paper',roughness:botanicalPrintMaterial.roughness,geometry:g};
}
/** Explicit outward skins/edge strips for this thick bag. Shared cloth helper
 * stays untouched for the already reviewed apron; only its row positions are
 * reused. Closed bag front must face -Z and back +Z under normal culling. */
function clothBody(){
 const source=sculptCloth(rows,thickness,.006),stride=columns+1,count=rows.length*stride,g:Geometry={positions:source.positions.slice(0,count*2*3),normals:[],indices:[]};
 for(let side=0;side<2;side++)for(let r=0;r<rows.length-1;r++)for(let c=0;c<columns;c++){const a=side*count+r*stride+c,b=a+1,d=a+stride,e=d+1;g.indices.push(...(side?[a,b,d,b,e,d]:[a,d,b,b,d,e]));}
 const bridge=(a:number,b:number)=>{const n=g.positions.length/3;for(const i of [a,b,a+count,b+count])g.positions.push(...g.positions.slice(i*3,i*3+3));g.indices.push(n,n+2,n+1,n+1,n+2,n+3);};for(let c=0;c<columns;c++){bridge(c+1,c);bridge((rows.length-1)*stride+c,(rows.length-1)*stride+c+1);}for(let r=0;r<rows.length-1;r++){bridge(r*stride,(r+1)*stride);bridge((r+1)*stride+columns,r*stride+columns);}
 for(let i=2;i<g.positions.length;i+=3)g.positions[i]-=thickness/2;return finishSculpt(g);
}
export function buildV10Tote(color:string):NativeSurface[]{
 const cloth=clothBody();
 const body:NativeMesh={shape:'mesh',at:[0,0,0],color,role:'fabric',geometry:{...cloth,uvs:cloth.positions.flatMap((_,i)=>i%3===0?[cloth.positions[i],cloth.positions[i+1]]:[])}};
 const handle=(back:boolean):NativeMesh=>{const left=surfaceZ(cloth,-.095,.281,back),right=surfaceZ(cloth,.095,.281,back),middle=(left+right)/2+(back?.012:-.012),points:V3[]=[[-.095,.281,left],[-.094,.395,middle],[0,.427,middle],[.094,.395,middle],[.095,.281,right]];return {shape:'mesh',at:[0,0,0],color:'#D5C2A4',role:'fabric',geometry:sculptSweep(points,points.map(()=>.012),points.map(()=>.012),12,4)};};
 const seam=(x:number):NativeMesh=>{const points:V3[]=Array.from({length:9},(_,i)=>{const y=.045+i*(.27-.045)/8;return [x,y,surfaceZ(cloth,x,y)-.0005];});return {shape:'mesh',at:[0,0,0],color:'#AE9D86',role:'fabric',geometry:sculptSweep(points,points.map(()=>.0015),points.map(()=>.0015),24,6)};};
 const surfaces=[body,handle(false),handle(true),clothPrint(cloth),seam(-.139),seam(.139)];
 // JSON/interchange masters canonicalize signed zero; keep runtime identical.
 for(const p of surfaces)for(const key of ['positions','normals','uvs']as const){const values=p.geometry[key];if(values)for(let i=0;i<values.length;i++)if(Object.is(values[i],-0))values[i]=0;}return surfaces;
}
