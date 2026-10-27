/** Real-scale unwrap for original untextured sculpt meshes. Does not move a
 * vertex, change a triangle or replace an authored UV atlas. Vertical cloth
 * lofts wrap around Y; flat cut patterns retain planar grain directions. */
import type {Geometry} from './geometry';
export function unwrapMetres(g:Geometry):Geometry&{uvs:number[]}{
 const lo=[0,1,2].map(k=>g.positions.reduce((n,v,i)=>i%3===k?Math.min(n,v):n,Infinity)),hi=[0,1,2].map(k=>g.positions.reduce((n,v,i)=>i%3===k?Math.max(n,v):n,-Infinity)),size=lo.map((v,k)=>hi[k]-v),count=g.positions.length/3;
 const axes=[0,1,2].map(k=>{let n=0;for(let i=0;i<count;i++){const normal=g.normals.slice(i*3,i*3+3).map(Math.abs);if(normal[k]>=Math.max(...normal))n++;}return n/count;});
 const planar=axes[2]>.72||size[2]<.35*Math.min(size[0],size[1])?2:axes[1]>.72||size[1]<.20*Math.min(size[0],size[2])?1:axes[0]>.72||size[0]<.20*Math.min(size[1],size[2])?0:undefined;
 const uvs:number[]=[],positions=[...g.positions],normals=[...g.normals],indices=[...g.indices],cx=(lo[0]+hi[0])/2,cz=(lo[2]+hi[2])/2;
 for(let i=0;i<count;i++){const [x,y,z]=positions.slice(i*3,i*3+3);uvs.push(...(planar===2?[x,-y]:planar===1?[x,-z]:planar===0?[z,-y]:[Math.atan2(z-cz,x-cx)/(Math.PI*2)+.5,-y]));}
 if(planar===undefined){
  const shifted=new Map<number,number>();
  for(let i=0;i<indices.length;i+=3){const ids=indices.slice(i,i+3),u=ids.map(n=>uvs[n*2]);if(Math.max(...u)-Math.min(...u)>.5)for(let k=0;k<3;k++){const n=ids[k];if(uvs[n*2]<.5){let copy=shifted.get(n);if(copy===undefined){copy=positions.length/3;positions.push(...positions.slice(n*3,n*3+3));normals.push(...normals.slice(n*3,n*3+3));uvs.push(uvs[n*2]+1,uvs[n*2+1]);shifted.set(n,copy);}indices[i+k]=copy;}}}
  const circumference=Math.PI*Math.sqrt((size[0]**2+size[2]**2)/2);for(let i=0;i<uvs.length;i+=2)uvs[i]*=circumference;
  // Closed loft end caps have planar cloth grain; a cylindrical pole has no
  // unique U. Split cap corners instead of stretching threads across a disk.
  const caps=new Map<number,number>();for(let i=0;i<indices.length;i+=3){const ids=indices.slice(i,i+3),ys=ids.map(n=>positions[n*3+1]);if(Math.max(...ys)-Math.min(...ys)<1e-10&&Math.abs(ids.reduce((n,j)=>n+normals[j*3+1],0)/3)>.85)for(let k=0;k<3;k++){const n=ids[k];let copy=caps.get(n);if(copy===undefined){copy=positions.length/3;positions.push(...positions.slice(n*3,n*3+3));normals.push(...normals.slice(n*3,n*3+3));uvs.push(positions[n*3],-positions[n*3+2]);caps.set(n,copy);}indices[i+k]=copy;}}

 }
 return {positions,normals,indices,uvs};
}
