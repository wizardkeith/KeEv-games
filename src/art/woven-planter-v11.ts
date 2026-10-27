/** Original hollow woven cover: shaped wall, twelve physical stakes and three
 * broad woven bands. Actual fine crossing fibres use original PBR maps.
 * Body groundY0 fixes the old13mm visual float; soil/branch pivots stay fixed. */
import type {NativeSurface,NativeMesh} from './native-characters';import type {Geometry} from './geometry';import type {V3} from './recipes';import {finishSculpt,sculptSweep} from './sculpt-v10';
const tone='#D4BA8C';
export function wovenPlanter(scale=1):NativeSurface[]{
 const profile=[[.001,0],[.118,0],[.135,.045],[.155,.13],[.166,.245],[.166,.315],[.168,.330],[.168,.335],[.160,.338],[.154,.333],[.155,.33],[.157,.245],[.147,.13],[.127,.045],[.112,.018],[.001,.018]],g:Geometry&{uvs:number[]}={positions:[],normals:[],indices:[],uvs:[]},n=24,rows=(profile.length-1)*2,uScale=2*Math.round(16*scale)/32;
 for(let row=0;row<=rows;row++){const p=row/2,i=Math.min(profile.length-2,Math.floor(p)),t=p-i,ps=[i-1,i,i+1,i+2].map(i=>profile[Math.max(0,Math.min(profile.length-1,i))]),r=Math.max(.001,((2*ps[1][0])+(-ps[0][0]+ps[2][0])*t+(2*ps[0][0]-5*ps[1][0]+4*ps[2][0]-ps[3][0])*t*t+(-ps[0][0]+3*ps[1][0]-3*ps[2][0]+ps[3][0])*t*t*t)/2),y=ps[1][1]+(ps[2][1]-ps[1][1])*t;
  for(let j=0;j<=n;j++){const a=j/n*Math.PI*2;g.positions.push(r*Math.cos(a),y,r*Math.sin(a));g.uvs.push(j/n*uScale,y*3*scale);}}
 for(let row=0;row<rows;row++)for(let j=0;j<n;j++){const a=row*(n+1)+j,b=a+n+1;g.indices.push(a,b,a+1,a+1,b,b+1);}
 for(const row of[0,rows]){const c=g.positions.length/3;g.positions.push(0,row===0?0:.018,0);g.uvs.push(.5,row===0?0:.018*3*scale);for(let j=0;j<n;j++)g.indices.push(...(row===0?[c,j,j+1]:[c,row*(n+1)+j+1,row*(n+1)+j]));}
 const out:NativeSurface[]=[{shape:'mesh',at:[0,0,0],geometry:finishSculpt(g),color:tone,role:'fabric',finish:'wicker',roughness:.89}];
 const strand=(points:V3[],r:number,color:string,steps:number)=>{const a=sculptSweep(points,points.map(()=>r),points.map(()=>r),steps,4);out.push({shape:'mesh',at:[0,0,0],geometry:a,color,role:'fabric',roughness:.89,finish:'wicker'});};
 // Physical warps follow the cover taper; broad geometry reads at play scale.
 for(let i=0;i<12;i++){const a=i/12*Math.PI*2;strand([[Math.cos(a)*.125,.016,Math.sin(a)*.125],[Math.cos(a)*.153,.13,Math.sin(a)*.153],[Math.cos(a)*.166,.246,Math.sin(a)*.166],[Math.cos(a)*.164,.326,Math.sin(a)*.164]],.0024,tone,3);}
 for(const[y,r]of[[.018,.125],[.163,.163],[.335,.166]]){const points:V3[]=Array.from({length:17},(_,j)=>[Math.cos(j/16*Math.PI*2)*r,y,Math.sin(j/16*Math.PI*2)*r]);strand(points,.0035,'#C3A878',16);}
 return out;
}
