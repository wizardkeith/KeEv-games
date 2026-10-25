/** Original V10 reusable sculpt primitives. Metres, RH/Y-up. Closed finite
 * surfaces with authored curvature; not imported meshes or image impostors. */
import type {Geometry} from './geometry';import type {V3} from './recipes';
export interface SculptRing {y:number;x:number;z:number;cx?:number;cz?:number}
export function finishSculpt(g:Geometry){
 let volume=0;for(let k=0;k<g.indices.length;k+=3){const [a,b,c]=g.indices.slice(k,k+3).map(i=>i*3);volume+=g.positions[a]*(g.positions[b+1]*g.positions[c+2]-g.positions[b+2]*g.positions[c+1])+g.positions[a+1]*(g.positions[b+2]*g.positions[c]-g.positions[b]*g.positions[c+2])+g.positions[a+2]*(g.positions[b]*g.positions[c+1]-g.positions[b+1]*g.positions[c]);}
 if(volume<0)for(let k=0;k<g.indices.length;k+=3)[g.indices[k+1],g.indices[k+2]]=[g.indices[k+2],g.indices[k+1]];
 g.normals=Array(g.positions.length).fill(0);for(let k=0;k<g.indices.length;k+=3){const ids=g.indices.slice(k,k+3).map(i=>i*3),[a,b,c]=ids,u=[0,1,2].map(j=>g.positions[b+j]-g.positions[a+j]),v=[0,1,2].map(j=>g.positions[c+j]-g.positions[a+j]),n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];for(const i of ids)for(let j=0;j<3;j++)g.normals[i+j]+=n[j];}
 for(let k=0;k<g.normals.length;k+=3){const n=Math.hypot(...g.normals.slice(k,k+3));if(n<1e-12){g.normals[k]=0;g.normals[k+1]=1;g.normals[k+2]=0;}else for(let j=0;j<3;j++)g.normals[k+j]/=n;}return g;
}
const spline=(a:number,b:number,c:number,d:number,t:number)=>.5*((2*b)+(-a+c)*t+(2*a-5*b+4*c-d)*t*t+(-a+3*b-3*c+d)*t*t*t);
export function sculptLoft(controls:SculptRing[],segments=24,fold=0,phase=0){
 const rings:SculptRing[]=[];for(let k=0;k<controls.length-1;k++)for(let s=0;s<2;s++){const t=s/2,r:SculptRing={y:controls[k].y+(controls[k+1].y-controls[k].y)*t,x:0,z:0};for(const key of ['x','z','cx','cz']as const){r[key]=spline(controls[Math.max(0,k-1)][key]??0,controls[k][key]??0,controls[k+1][key]??0,controls[Math.min(controls.length-1,k+2)][key]??0,t);if(key==='x'||key==='z')r[key]=Math.max(.001,r[key]!);}rings.push(r);}rings.push(controls.at(-1)!);
 const g:Geometry={positions:[],normals:[],indices:[]};for(const r of rings)for(let j=0;j<segments;j++){const a=j*Math.PI*2/segments,wave=1+fold*(.72*Math.cos(a*7+phase)+.28*Math.sin(a*11+.4));g.positions.push((r.cx??0)+r.x*Math.cos(a)*wave,r.y,(r.cz??0)+r.z*Math.sin(a)*wave);}
 for(let k=0;k<rings.length-1;k++)for(let j=0;j<segments;j++){const a=k*segments+j,b=k*segments+(j+1)%segments,c=a+segments,d=b+segments;g.indices.push(a,c,b,b,c,d);}
 for(const k of [0,rings.length-1]){const r=rings[k],rim=g.positions.length/3;for(let j=0;j<segments;j++)g.positions.push(...g.positions.slice((k*segments+j)*3,(k*segments+j)*3+3));const n=g.positions.length/3;g.positions.push(r.cx??0,r.y,r.cz??0);for(let j=0;j<segments;j++)g.indices.push(...(k===0?[n,rim+j,rim+(j+1)%segments]:[n,rim+(j+1)%segments,rim+j]));}return finishSculpt(g);
}
const cross=(a:number[],b:number[])=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],normal=(v:number[])=>{const n=Math.hypot(...v);return v.map(x=>x/(n||1));};
export function sculptSweep(points:V3[],widths:number[],depths=widths,steps=16,sides=8){
 const at=(t:number)=>{const p=Math.min(points.length-1-1e-8,Math.max(0,t)*(points.length-1)),i=Math.floor(p),u=p-i;return [0,1,2].map(k=>spline(points[Math.max(0,i-1)][k],points[i][k],points[i+1][k],points[Math.min(points.length-1,i+2)][k],u));};
 const radius=(a:number[],t:number)=>{const p=Math.min(a.length-1-1e-8,t*(a.length-1)),k=Math.floor(p);return a[k]+(a[k+1]-a[k])*(p-k);};
 let previousRight:number[]|undefined;const g:Geometry&{uvs:number[]}={positions:[],normals:[],indices:[],uvs:[]};for(let i=0;i<=steps;i++){const t=i/steps,p=at(t),a=at(Math.max(0,t-.001)),b=at(Math.min(1,t+.001)),axis=normal(b.map((v,k)=>v-a[k])),right=previousRight?normal(previousRight.map((v,k)=>v-axis[k]*previousRight!.reduce((n,x,j)=>n+x*axis[j],0))):normal(cross(Math.abs(axis[1])>.85?[0,0,1]:[0,1,0],axis)),up=cross(axis,right);previousRight=right;for(let j=0;j<sides;j++){const r=j*Math.PI*2/sides;g.positions.push(...p.map((v,k)=>v+right[k]*Math.cos(r)*radius(widths,t)+up[k]*Math.sin(r)*radius(depths,t)));g.uvs.push(j/sides,t);}}
 for(let i=0;i<steps;i++)for(let j=0;j<sides;j++){const a=i*sides+j,b=i*sides+(j+1)%sides,c=a+sides,d=b+sides;g.indices.push(a,b,c,b,d,c);}
 for(const i of [0,steps]){const rim=g.positions.length/3;for(let j=0;j<sides;j++){g.positions.push(...g.positions.slice((i*sides+j)*3,(i*sides+j)*3+3));g.uvs.push(.5,i/steps);}const n=g.positions.length/3;g.positions.push(...at(i/steps));g.uvs.push(.5,i/steps);for(let j=0;j<sides;j++)g.indices.push(...(i===0?[n,rim+(j+1)%sides,rim+j]:[n,rim+j,rim+(j+1)%sides]));}return finishSculpt(g);
}
export function sculptCloth(rows:{y:number;w:number;z:number}[],thickness=.005,fold=.004){
 const cols=20,stride=cols+1,count=rows.length*stride,g:Geometry={positions:[],normals:[],indices:[]};for(let side=0;side<2;side++)for(let r=0;r<rows.length;r++)for(let c=0;c<=cols;c++){const u=c/cols*2-1,p=rows[r];g.positions.push(u*p.w,p.y+(r===0?.014*u**4:0),p.z+.044*u*u+fold*(Math.cos(u*Math.PI*3.5+.25)+.3*Math.sin(u*Math.PI*8))*(1-r/rows.length*.7)+side*thickness);}
 for(let side=0;side<2;side++)for(let r=0;r<rows.length-1;r++)for(let c=0;c<cols;c++){const a=side*count+r*stride+c,b=a+1,d=a+stride,e=d+1;g.indices.push(...(side?[a,b,d,b,e,d]:[a,d,b,b,d,e]));}
 const bridge=(a:number,b:number)=>{const n=g.positions.length/3;for(const i of [a,b,a+count,b+count])g.positions.push(...g.positions.slice(i*3,i*3+3));g.indices.push(n,n+1,n+2,n+1,n+3,n+2);};for(let c=0;c<cols;c++){bridge(c+1,c);bridge((rows.length-1)*stride+c,(rows.length-1)*stride+c+1);}for(let r=0;r<rows.length-1;r++){bridge(r*stride,(r+1)*stride);bridge((r+1)*stride+cols,r*stride+cols);}return finishSculpt(g);
}
/** Standard UV derivative tangent frame, orthonormalized against real normals. */
export function sculptTangents(g:Geometry&{uvs:number[]}){
 const t=Array(g.positions.length).fill(0),b=Array(g.positions.length).fill(0),out:number[]=[];
 for(let k=0;k<g.indices.length;k+=3){const [a,c,d]=g.indices.slice(k,k+3),u1=g.uvs[c*2]-g.uvs[a*2],v1=g.uvs[c*2+1]-g.uvs[a*2+1],u2=g.uvs[d*2]-g.uvs[a*2],v2=g.uvs[d*2+1]-g.uvs[a*2+1],det=u1*v2-u2*v1;if(Math.abs(det)<1e-12)continue;for(let j=0;j<3;j++){const e1=g.positions[c*3+j]-g.positions[a*3+j],e2=g.positions[d*3+j]-g.positions[a*3+j];for(const i of [a,c,d]){t[i*3+j]+=(e1*v2-e2*v1)/det;b[i*3+j]+=(e2*u1-e1*u2)/det;}}}
 for(let i=0;i<g.positions.length;i+=3){const n=g.normals.slice(i,i+3),dot=n.reduce((s,v,j)=>s+v*t[i+j],0);let tangent=t.slice(i,i+3).map((v,j)=>v-n[j]*dot);if(Math.hypot(...tangent)<1e-10)tangent=cross(Math.abs(n[1])<.9?[0,1,0]:[1,0,0],n);tangent=normal(tangent);const bitangent=cross(n,tangent),sign=bitangent.reduce((s,v,j)=>s+v*b[i+j],0)<0?-1:1;out.push(...tangent,sign);}return out;
}
