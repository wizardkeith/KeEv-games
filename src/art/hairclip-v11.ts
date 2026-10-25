/** Original cream leaf hair pin, mounted against actual hair triangles. Kept
 * separate from the painted skin/eyes and uses real closed thickness. */
import type {NativeMesh} from './native-characters';
import type {Geometry} from './geometry';
import {finishSculpt} from './sculpt-v10';
export function leafHairclip(supports:NativeMesh[]):NativeMesh{
 const zAt=(x:number,y:number)=>{let front=Infinity;for(const p of supports){const g=p.geometry;for(let k=0;k<g.indices.length;k+=3){const [a,b,c]=g.indices.slice(k,k+3).map(n=>g.positions.slice(n*3,n*3+3)),det=(b[0]-a[0])*(c[1]-a[1])-(c[0]-a[0])*(b[1]-a[1]);if(Math.abs(det)<1e-12)continue;const u=((x-a[0])*(c[1]-a[1])-(c[0]-a[0])*(y-a[1]))/det,v=((b[0]-a[0])*(y-a[1])-(x-a[0])*(b[1]-a[1]))/det;if(u>=-1e-8&&v>=-1e-8&&u+v<=1+1e-8)front=Math.min(front,a[2]+u*(b[2]-a[2])+v*(c[2]-a[2]));}}if(!Number.isFinite(front))throw Error('hair pin has no actual hair support');return front;};
 const g:Geometry={positions:[],normals:[],indices:[]},x0=.179,y0=.292,z0=zAt(x0,y0),dx=(zAt(x0+.001,y0)-zAt(x0-.001,y0))/.002,dy=(zAt(x0,y0+.001)-zAt(x0,y0-.001))/.002;const plane=(x:number,y:number)=>z0+dx*(x-x0)+dy*(y-y0);
 for(const angle of [-.63,.60]){const start=g.positions.length/3,n=12;
  for(let side=0;side<2;side++){g.positions.push(x0,y0,z0-.0012+side*.00125);for(let j=0;j<n;j++){const a=j/n*Math.PI*2,u=Math.cos(a)*.011,v=Math.sin(a)*.022,x=x0+u*Math.cos(angle)-v*Math.sin(angle),y=y0+u*Math.sin(angle)+v*Math.cos(angle);g.positions.push(x,y,plane(x,y)-.0012+side*.00125);}}
  for(let side=0;side<2;side++)for(let j=0;j<n;j++){const a=start+side*(n+1),b=a+1+j,c=a+1+(j+1)%n;g.indices.push(...(side?[a,b,c]:[a,c,b]));}
  for(let j=0;j<n;j++){const a=start+1+j,b=start+1+(j+1)%n;const offset=g.positions.length/3;for(const id of [a,b,a+n+1,b+n+1])g.positions.push(...g.positions.slice(id*3,id*3+3));g.indices.push(offset,offset+1,offset+2,offset+1,offset+3,offset+2);}
 }
 return {shape:'mesh',at:[0,0,0],geometry:finishSculpt(g),color:'#F1E2C7',role:'fabric',roughness:.72};
}
