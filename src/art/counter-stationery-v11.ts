/** Fixed counter work tools from the approved shop reference. One hollow
 * holder with five leaning pencils, never a SKU, owned stock or a reward.
 * All anchors remain on the existing counter wing, outside the handoff space.
 */
import type {NativeSurface,NativeMesh} from './native-characters';
import type {Geometry} from './geometry';
import type {V3} from './recipes';
import {finishSculpt,sculptSweep} from './sculpt-v10';
export function counterStationery():NativeSurface[]{
 const at:V3=[1.00,1.111,-1.73],g:Geometry={positions:[],normals:[],indices:[]},n=12;
 const profile=[[.001,0],[.067,0],[.079,.025],[.085,.185],[.081,.205],[.070,.205],[.068,.035],[.001,.035]];
 for(const[r,y]of profile)for(let i=0;i<n;i++){const a=i/n*Math.PI*2;g.positions.push(r*Math.cos(a),y,r*Math.sin(a));}
 for(let r=0;r<profile.length-1;r++)for(let i=0;i<n;i++){const a=r*n+i,b=r*n+(i+1)%n;g.indices.push(a,a+n,b,b,a+n,b+n);}
 for(const r of[0,profile.length-1]){const c=g.positions.length/3;g.positions.push(0,profile[r][1],0);for(let i=0;i<n;i++)g.indices.push(...(r?[c,r*n+(i+1)%n,r*n+i]:[c,i,(i+1)%n]));}
 const out:NativeSurface[]=[{shape:'mesh',at,geometry:finishSculpt(g),color:'#91A08A',role:'ceramic'}];
 const segment=(a:V3,b:V3,r:number,s:number,color:string,role:NativeMesh['role'])=>out.push({shape:'mesh',at,geometry:sculptSweep([a,b],[r,s],[r,s],1,6),color,role});
 for(let i=0;i<5;i++){
  const a:V3=[Math.cos(i*2.4)*.024,.035,Math.sin(i*2.4)*.024],b:V3=[a[0]+(i-2)*.018,.315+(i%3)*.036,a[2]+((i*2)%5-2)*.017],d=b.map((v,k)=>v-a[k]),len=Math.hypot(...d),tip=(distance:number)=>b.map((v,k)=>v+d[k]/len*distance)as V3;
  segment(a,b,.009,.009,'#CDB395','wood');segment(b,tip(.032),.009,.003,'#C4AC8A','wood');segment(tip(.032),tip(.041),.003,.0003,'#57413D','ink');
 }
 return out;
}
