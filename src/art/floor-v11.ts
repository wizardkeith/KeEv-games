/** Narrow staggered oak boards, long grain along world X as in the approved
 * shop reference. Real bevels/joints; original walking elevation and thickness.
 * Dimensions are authored interpretation, not a measurement approved by owner. */
import type {NativeMesh} from './native-characters';
import type {V3} from './recipes';
export const oakFloorLayout={rows:36,minX:-4.5225,maxX:4.5225,minZ:-3.225,maxZ:3.225,top:.079,bottom:.061,gap:.0015,bevel:.0015,longAxis:'X',colors:['#C8A87E','#C4A278']} as const;
export function oakFloor():NativeMesh[]{
 const out=oakFloorLayout.colors.map(color=>({shape:'mesh' as const,at:[0,0,0] as V3,color,role:'wood' as const,roughness:.83,finish:'oak-floor' as const,geometry:{positions:[] as number[],normals:[] as number[],indices:[] as number[],uvs:[] as number[]}}));
 const {rows,minX,maxX,minZ,maxZ,top,bottom,gap,bevel}=oakFloorLayout,depth=(maxZ-minZ)/rows;
 for(let row=0;row<rows;row++){
  const joints:number[]=[minX];for(let x=minX+1.15+(row%3)*.57;x<maxX-.25;x+=1.88)joints.push(x);joints.push(maxX);
  for(let board=1;board<joints.length;board++){
   const g=out[(row+board)%2].geometry,x0=joints[board-1]+gap/2,x1=joints[board]-gap/2,z0=minZ+row*depth+gap/2,z1=z0+depth-gap;
   const quad=(points:V3[],normal:V3)=>{const start=g.positions.length/3;for(const p of points){g.positions.push(...p);g.normals.push(...normal);g.uvs.push(p[2]/1.10+row*.071,p[0]/2.20+board*.17);}const u=points[1].map((v,k)=>v-points[0][k]),v=points[2].map((v,k)=>v-points[0][k]),dot=(u[1]*v[2]-u[2]*v[1])*normal[0]+(u[2]*v[0]-u[0]*v[2])*normal[1]+(u[0]*v[1]-u[1]*v[0])*normal[2];g.indices.push(...(dot>0?[0,1,2,0,2,3]:[0,2,1,0,3,2]).map(i=>start+i));};
   const upper:V3[]=[[x0+bevel,top,z0+bevel],[x1-bevel,top,z0+bevel],[x1-bevel,top,z1-bevel],[x0+bevel,top,z1-bevel]],rim:V3[]=[[x0,top-bevel,z0],[x1,top-bevel,z0],[x1,top-bevel,z1],[x0,top-bevel,z1]],lower=rim.map(p=>[p[0],bottom,p[2]] as V3);
   quad(upper,[0,1,0]);quad(lower,[0,-1,0]);
   const normals:V3[]=[[0,0,-1],[1,0,0],[0,0,1],[-1,0,0]];
   for(let side=0;side<4;side++){const next=(side+1)%4,n=normals[side];quad([upper[side],upper[next],rim[next],rim[side]],[n[0]/Math.SQRT2,Math.SQRT1_2,n[2]/Math.SQRT2]);quad([rim[side],rim[next],lower[next],lower[side]],n);}
  }
 }
 return out;
}
