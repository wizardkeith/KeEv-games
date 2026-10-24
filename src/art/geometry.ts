import type {Part,V3} from './recipes';
import {materialIdentity,type MaterialRole} from './materials';
export interface Geometry {positions:number[];normals:number[];indices:number[];}
// Engine-neutral, deterministic low-poly authoring, shared by Web and GLB exporter.
export function geometry(p:Part):Geometry {
 const g:Geometry={positions:[],normals:[],indices:[]};const [w,h,d]=p.size;
 const vertex=(x:number,y:number,z:number,nx:number,ny:number,nz:number)=>{const length=Math.hypot(nx,ny,nz);if(!Number.isFinite(length)||length===0)throw new Error('invalid_normal');const i=g.positions.length/3;g.positions.push(x,y,z);const sign=p.inside?-1:1;g.normals.push(sign*nx/length,sign*ny/length,sign*nz/length);return i;};
 const tri=(a:number,b:number,c:number)=>{const u=[0,1,2].map(i=>g.positions[b*3+i]-g.positions[a*3+i]),v=[0,1,2].map(i=>g.positions[c*3+i]-g.positions[a*3+i]);const cross=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];if(Math.hypot(...cross)<1e-14)return;const dot=cross.reduce((n,x,i)=>n+x*(g.normals[a*3+i]+g.normals[b*3+i]+g.normals[c*3+i]),0);g.indices.push(...(dot>=0?[a,b,c]:[a,c,b]));};
 if(p.shape==='box'||p.shape==='round'){
  const half=[w/2,h/2,d/2],r=p.shape==='round'?Math.min(p.radius??.025,w/2,h/2,d/2):0;
  for(let axis=0;axis<3;axis++)for(const side of [-1,1]){
   const u=(axis+1)%3,v=(axis+2)%3,us=r?[-half[u],-half[u]+r,half[u]-r,half[u]]:[-half[u],half[u]],vs=r?[-half[v],-half[v]+r,half[v]-r,half[v]]:[-half[v],half[v]],ids:number[][]=[];
   for(let i=0;i<us.length;i++){ids[i]=[];for(let j=0;j<vs.length;j++){const point=[0,0,0];point[axis]=side*half[axis];point[u]=us[i];point[v]=vs[j];let normal=[0,0,0];normal[axis]=side;
    if(r){const core=point.map((x,k)=>Math.max(-half[k]+r,Math.min(half[k]-r,x))),off=point.map((x,k)=>x-core[k]),length=Math.hypot(...off);normal=off.map(x=>x/length);for(let k=0;k<3;k++)point[k]=core[k]+normal[k]*r;}
    ids[i][j]=vertex(...point as V3,...normal as V3);
   }}for(let i=0;i<us.length-1;i++)for(let j=0;j<vs.length-1;j++){const [a,b,c,e]=[ids[i][j],ids[i+1][j],ids[i+1][j+1],ids[i][j+1]];tri(a,b,c);tri(a,c,e);}
  }
 }else if(p.shape==='leaf'){
  // Closed curved botanical blade with tapered tips, shared by Web and GLB.
  const rows=8,cols=12;
  for(let i=0;i<=rows;i++){const t=i/rows,s=Math.sin(Math.PI*t),r=w*.5*Math.pow(Math.max(0,s),.80),depth=d*.5*s,bend=d*.55*s*s;
   const dr=i===0||i===rows?0:w*.4*Math.PI*Math.pow(s,-.20)*Math.cos(Math.PI*t),dd=d*.5*Math.PI*Math.cos(Math.PI*t),db=d*1.10*Math.PI*s*Math.cos(Math.PI*t);
   for(let j=0;j<=cols;j++){const a=j*Math.PI*2/cols,c=Math.cos(a),q=Math.sin(a);vertex(c*r,(t-.5)*h,q*depth+bend,...(i===0||i===rows?[0,i===0?-1:1,0]:[h*c*depth,-c*c*dr*depth-q*q*dd*r-q*r*db,h*q*r]) as V3);}
  }
  for(let i=0;i<rows;i++)for(let j=0;j<cols;j++){const a=i*(cols+1)+j,b=a+cols+1;tri(a,b,a+1);tri(a+1,b,b+1);}
 }else if(p.shape==='sphere'){
  const rows=8,cols=12;for(let i=0;i<=rows;i++){const t=i*Math.PI/rows;for(let j=0;j<=cols;j++){const a=j*2*Math.PI/cols,n=[Math.sin(t)*Math.cos(a),Math.cos(t),Math.sin(t)*Math.sin(a)];vertex(n[0]*w/2,n[1]*h/2,n[2]*d/2,n[0]*2/w,n[1]*2/h,n[2]*2/d);}}
  for(let i=0;i<rows;i++)for(let j=0;j<cols;j++){const a=i*(cols+1)+j,b=a+cols+1;tri(a,b,a+1);tri(a+1,b,b+1);}
 }else if(p.shape==='cylinder'){
  const cols=12,top=p.top??1;for(let y=0;y<2;y++)for(let j=0;j<=cols;j++){const a=j*2*Math.PI/cols,c=Math.cos(a),s=Math.sin(a);vertex(c*w/2*(y?top:1),(y-.5)*h,s*d/2*(y?top:1),c*2/w,(1-top)/h,s*2/d);}
  for(let j=0;j<cols;j++){tri(j,j+cols+1,j+1);tri(j+1,j+cols+1,j+cols+2);}
  if(!p.open)for(let y=0;y<2;y++){const c=vertex(0,(y-.5)*h,0,0,y?1:-1,0);const ring=[];for(let j=0;j<=cols;j++){const a=j*2*Math.PI/cols;ring.push(vertex(Math.cos(a)*w/2*(y?top:1),(y-.5)*h,Math.sin(a)*d/2*(y?top:1),0,y?1:-1,0));}for(let j=0;j<cols;j++)tri(c,ring[j],ring[j+1]);}
 }else{
  const cols=p.segments??20,rows=6,r=(w-h)/2,t=h/2,start=p.arc?.[0]??0,sweep=(p.arc?.[1]??2*Math.PI)-start;for(let i=0;i<=cols;i++){const a=start+i*sweep/cols;for(let j=0;j<=rows;j++){const b=j*2*Math.PI/rows,n=[Math.cos(a)*Math.cos(b),Math.sin(b),Math.sin(a)*Math.cos(b)];vertex(Math.cos(a)*(r+t*Math.cos(b)),t*Math.sin(b),Math.sin(a)*(r+t*Math.cos(b))*d/w,n[0],n[1],n[2]*w/d);}}
  for(let i=0;i<cols;i++)for(let j=0;j<rows;j++){const a=i*(rows+1)+j,b=a+rows+1;tri(a,b,a+1);tri(a+1,b,b+1);}
  if(p.arc)for(const end of [0,cols]){const a=start+end*sweep/cols,sign=end===0?-1:1,n:V3=[-Math.sin(a)*sign,0,Math.cos(a)*w/d*sign],center=vertex(Math.cos(a)*r,0,Math.sin(a)*r*d/w,...n),ring:number[]=[];for(let j=0;j<=rows;j++){const old=(end*(rows+1)+j)*3;ring.push(vertex(g.positions[old],g.positions[old+1],g.positions[old+2],...n));}for(let j=0;j<rows;j++)tri(center,ring[j],ring[j+1]);}
 }
 const rotate=(vec:number[],turn:V3)=>{let [x,y,z]=vec;for(let axis=0;axis<3;axis++){const a=turn[axis],c=Math.cos(a),s=Math.sin(a);if(axis===0)[y,z]=[y*c-z*s,y*s+z*c];if(axis===1)[x,z]=[x*c+z*s,-x*s+z*c];if(axis===2)[x,y]=[x*c-y*s,x*s+y*c];}return [x,y,z];};
 for(let i=0;i<g.positions.length;i+=3){const a=rotate(g.positions.slice(i,i+3),p.turn??[0,0,0]),n=rotate(g.normals.slice(i,i+3),p.turn??[0,0,0]);for(let k=0;k<3;k++){g.positions[i+k]=a[k]+p.at[k];g.normals[i+k]=n[k];}}
 return g;
}
export function grouped(recipe:Part[]){
 const groups=new Map<string,{role:MaterialRole;materialId:string;color:string;alpha:number;geometry:Geometry}>();
 for(const p of recipe){const role=p.role??'paint',alpha=p.alpha??1,key=materialIdentity(role,p.color,alpha);let group=groups.get(key);
  if(!group){group={role,materialId:key,color:p.color,alpha,geometry:{positions:[],normals:[],indices:[]}};groups.set(key,group);}
  const a=geometry(p),offset=group.geometry.positions.length/3;group.geometry.positions.push(...a.positions);group.geometry.normals.push(...a.normals);group.geometry.indices.push(...a.indices.map(x=>x+offset));
 }return [...groups.values()];
}
