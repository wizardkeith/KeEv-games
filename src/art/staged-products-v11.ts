/** Physical inventory samples batched per shelf, using actual stock only. The
 * presentation cap is eight; simulation demand/service/stock rules do not read
 * this module. No decorative goods masquerade as player-owned inventory. */
import {nativeProductRecipe} from './native-products';
import {nativeSurfaceGeometry,type NativeSurface} from './native-characters';
import {displaySamples} from './native-display';import {actualDisplaySupport} from './display-support-v11';
export function stagedProducts(id:string,color:string,count:number,table:number):NativeSurface[]{
 const recipe=nativeProductRecipe(id,color),points=recipe.flatMap(p=>{const g=nativeSurfaceGeometry(p);return Array.from({length:g.positions.length/3},(_,i)=>g.positions.slice(i*3,i*3+3));}),ys=points.map(p=>p[1]),minY=Math.min(...ys),height=Math.max(...ys)-minY,foot=points.filter(p=>Math.abs(p[1]-minY)<1e-8),flat=['off.notebook','off.card','off.tray','off.towel'].includes(id);
 return displaySamples(id,count,table).flatMap((sample,k)=>{
  const c=Math.cos(sample.yaw),s=Math.sin(sample.yaw),support=actualDisplaySupport(table,foot.map(([x,,z])=>[(x*c+z*s)*sample.scale+sample.at[0],(-x*s+z*c)*sample.scale+sample.at[2]])),stacked=table===1?flat:count>4?flat:['off.notebook','off.card'].includes(id),stack=stacked?Math.floor(k/(table===1?2:count>4?4:2))*height*sample.scale:0;
  return recipe.map(part=>{const g=nativeSurfaceGeometry(part);
   for(let i=0;i<g.positions.length;i+=3){const[x,y,z]=g.positions.slice(i,i+3),[nx,ny,nz]=g.normals.slice(i,i+3);g.positions[i]=(x*c+z*s)*sample.scale+sample.at[0];g.positions[i+1]=(y-minY)*sample.scale+stack+support;g.positions[i+2]=(-x*s+z*c)*sample.scale+sample.at[2];g.normals[i]=nx*c+nz*s;g.normals[i+1]=ny;g.normals[i+2]=-nx*s+nz*c;}
   return {...part,shape:'mesh' as const,role:part.role??'paint',geometry:g,at:[0,0,0]as[number,number,number]};
  });
 });
}
