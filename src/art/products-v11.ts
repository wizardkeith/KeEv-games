/** V11 ceramic forms: continuous spline-turned hollow bodies and sculpted
 * handles. Existing SKU envelopes, axes, stock count and ownership unchanged. */
import {buildV10Product} from './products-v10';
import {buildV11Pencil} from './pencil-v11';
import {sculptSweep,finishSculpt} from './sculpt-v10';
import type {NativeSurface,NativeMesh} from './native-characters';
import type {Geometry} from './geometry';
type P=[number,number];
function pottery(profile:P[],color:string):NativeMesh{
 const rows=(profile.length-1)*4,n=48,g:Geometry&{uvs:number[]}={positions:[],normals:[],indices:[],uvs:[]};
 for(let row=0;row<=rows;row++){const pos=row/rows*(profile.length-1),i=Math.min(profile.length-2,Math.floor(pos)),t=pos-i;const p=[i-1,i,i+1,i+2].map(i=>profile[Math.max(0,Math.min(profile.length-1,i))]);const r=Math.max(.0005,((2*p[1][0])+(-p[0][0]+p[2][0])*t+(2*p[0][0]-5*p[1][0]+4*p[2][0]-p[3][0])*t*t+(-p[0][0]+3*p[1][0]-3*p[2][0]+p[3][0])*t*t*t)/2),y=p[1][1]+(p[2][1]-p[1][1])*t;
  for(let j=0;j<=n;j++){const a=j/n*Math.PI*2,variation=1+.003*Math.cos(a*3+y*12);g.positions.push(Math.cos(a)*r*variation,y,Math.sin(a)*r*variation);g.uvs.push(j/n,row/rows);}
 }
 for(let row=0;row<rows;row++)for(let j=0;j<n;j++){const a=row*(n+1)+j,b=a+n+1;g.indices.push(a,b,a+1,a+1,b,b+1);}
 for(const row of [0,rows]){const center=g.positions.length/3;g.positions.push(0,profile[row===0?0:profile.length-1][1],0);g.uvs.push(.5,.5);for(let j=0;j<n;j++)g.indices.push(...(row===0?[center,j,j+1]:[center,row*(n+1)+j+1,row*(n+1)+j]));}
 return {shape:'mesh',at:[0,0,0],geometry:finishSculpt(g),color,role:'ceramic',roughness:.31};
}
export function buildV11Product(id:string,color:string):NativeSurface[]{
 if(id==='off.pencil')return buildV11Pencil(color);
 if(id==='off.mug')return [pottery([[.001,.007],[.074,.007],[.100,.018],[.114,.055],[.120,.160],[.116,.221],[.111,.235],[.105,.235],[.104,.220],[.108,.160],[.102,.065],[.084,.030],[.001,.030]],'#D8DDC7'),{shape:'mesh',at:[0,0,0],role:'ceramic',color:'#D8DDC7',roughness:.31,geometry:sculptSweep([[.108,.193,0],[.177,.202,0],[.202,.149,0],[.177,.086,0],[.107,.073,0]],[.015,.014,.014,.014,.015],[.015,.014,.014,.014,.015],24,10)}];
 if(id==='off.vase')return [pottery([[.001,.006],[.080,.006],[.118,.031],[.135,.110],[.128,.205],[.082,.271],[.045,.308],[.049,.366],[.055,.384],[.049,.393],[.041,.386],[.039,.305],[.072,.271],[.116,.202],[.122,.110],[.102,.041],[.068,.027],[.001,.027]],'#819788')];
 return buildV10Product(id,id==='off.notebook'?'#91A18C':color);
}
