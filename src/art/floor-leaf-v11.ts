/** Rebuilt floor-plant blade: continuous longitudinal curvature instead of
 * two fans meeting at a raised centre. Existing attachment/length/width/colour
 * and global garden/canopy blades remain untouched. Closed3D,14-point outline. */
import type {NativeMesh} from './native-characters';import type {V3} from './recipes';import type {Geometry} from './geometry';import {finishSculpt} from './sculpt-v10';
export function floorLeaf(at:V3,length:number,width:number,angle:number,tilt:number,color:string):NativeMesh{
 const rows=6,cols=2,stride=cols+1,layer=(rows+1)*stride,g:Geometry&{uvs:number[]}={positions:[],normals:[],indices:[],uvs:[]};
 const turn=(x:number,y:number,z:number)=>{[y,z]=[y*Math.cos(tilt)-z*Math.sin(tilt),y*Math.sin(tilt)+z*Math.cos(tilt)];return[x*Math.cos(angle)+z*Math.sin(angle)+at[0],y+at[1],-x*Math.sin(angle)+z*Math.cos(angle)+at[2]];};
 for(let side=0;side<2;side++)for(let r=0;r<=rows;r++)for(let c=0;c<=cols;c++){const t=r/rows,u=c/cols*2-1,outline=Math.max(.002,2*Math.sqrt(t*(1-t))*(.76+.24*t)),x=u*width*.5*outline,y=length*(t-.018*Math.sin(t*Math.PI)),z=(.085*length+.015*width*(1-u*u))*Math.sin(t*Math.PI)+(side?1:-1)*.00075;g.positions.push(...turn(x,y,z));g.uvs.push(.5+u*outline*.5,t);}
 for(let side=0;side<2;side++)for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const a=side*layer+r*stride+c,b=a+1,d=a+stride,e=d+1;g.indices.push(...(side?[a,b,d,b,e,d]:[a,d,b,b,d,e]));}
 const edge=(a:number,b:number)=>g.indices.push(a,a+layer,b,b,a+layer,b+layer);
 for(let c=0;c<cols;c++){edge(c+1,c);edge(rows*stride+c,rows*stride+c+1);}for(let r=0;r<rows;r++){edge(r*stride,(r+1)*stride);edge((r+1)*stride+cols,r*stride+cols);}
 return{shape:'mesh',at:[0,0,0],geometry:finishSculpt(g),color,role:'leaf',baseColorTexture:'/assets/native-v11/broadleaf-albedo.png'};
}
