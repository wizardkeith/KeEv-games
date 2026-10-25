/** Physical inventory samples batched per shelf, using actual stock only. The
 * presentation cap is eight; simulation demand/service/stock rules do not read
 * this module. No decorative goods masquerade as player-owned inventory. */
import {nativeProductRecipe} from './native-products';
import {nativeSurfaceGeometry,type NativeSurface} from './native-characters';
import {displaySamples} from './native-display';
export function stagedProducts(id:string,color:string,count:number,table:number):NativeSurface[]{
 const recipe=nativeProductRecipe(id,color),ys=recipe.flatMap(p=>nativeSurfaceGeometry(p).positions.filter((_,i)=>i%3===1)),minY=Math.min(...ys),height=Math.max(...ys)-minY,flat=['off.notebook','off.card','off.tray','off.towel'].includes(id);
 return displaySamples(id,count,table).flatMap((sample,k)=>recipe.map(part=>{
  const g=nativeSurfaceGeometry(part),c=Math.cos(sample.yaw),s=Math.sin(sample.yaw);
  const stacked=table===1?flat:count>4?flat:['off.notebook','off.card'].includes(id);const stack=stacked?Math.floor(k/(table===1?2:count>4?4:2))*height*sample.scale:0,tier=sample.at[2]>(table===1?.20:.15)?.14:0;
  for(let i=0;i<g.positions.length;i+=3){const [x,y,z]=g.positions.slice(i,i+3),[nx,ny,nz]=g.normals.slice(i,i+3);g.positions[i]=(x*c+z*s)*sample.scale+sample.at[0];g.positions[i+1]=(y-minY)*sample.scale+stack+tier;g.positions[i+2]=(-x*s+z*c)*sample.scale+sample.at[2];g.normals[i]=nx*c+nz*s;g.normals[i+1]=ny;g.normals[i+2]=-nx*s+nz*c;}
  return {...part,shape:'mesh' as const,role:part.role??'paint',geometry:g,at:[0,0,0] as [number,number,number]};
 }));
}
