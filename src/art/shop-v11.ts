/** V11 target slice: original branching botanicals, woven planters, layered
 * window garden and decorative (non-stock) fixture staging. All are real mesh
 * surfaces. Door/counter/table envelopes and economic objects remain in V10. */
import type {NativeSurface,NativeMesh} from './native-characters';
import type {NativePlantParts} from './native-environment';
import {geometry,type Geometry} from './geometry';
import {sculptSweep,sculptLoft,finishSculpt} from './sculpt-v10';
import type {V3} from './recipes';
const M=(g:Geometry,color:string,role:NativeMesh['role']='leaf',at:V3=[0,0,0]):NativeMesh=>({shape:'mesh',at,geometry:g,color,role});
const twig=(points:V3[],r:number,color='#738353')=>M(sculptSweep(points,points.map(()=>r),points.map(()=>r),points.length>12?24:6,4),color,'wood');
function leaf(at:V3,length:number,width:number,angle:number,tilt:number,color:string):NativeMesh{
 const rim:[[number,number],...Array<[number,number]>]=[[0,0],[.80,.23],[.83,.67],[0,1],[-.83,.67],[-.80,.23]],g:Geometry={positions:[],normals:[],indices:[]};
 const rotate=(x:number,y:number,z:number)=>{[y,z]=[y*Math.cos(tilt)-z*Math.sin(tilt),y*Math.sin(tilt)+z*Math.cos(tilt)];return [x*Math.cos(angle)+z*Math.sin(angle)+at[0],y+at[1],-x*Math.sin(angle)+z*Math.cos(angle)+at[2]];};
 for(let side=0;side<2;side++){g.positions.push(...rotate(0,length*.48,length*.13+side*.0015));for(const [u,t]of rim)g.positions.push(...rotate(u*width*.5,t*length,.06*length*Math.sin(t*Math.PI)+side*.0015));for(let j=0;j<6;j++){const a=side*7,b=a+1+j,c=a+1+(j+1)%6;g.indices.push(...(side?[a,b,c]:[a,c,b]));}}
 for(let j=0;j<6;j++){const a=1+j,b=1+(j+1)%6;g.indices.push(a,b,a+7,b,b+7,a+7);}return M(finishSculpt(g),color);
}
function batch(parts:NativeSurface[]):NativeSurface[]{const groups=new Map<string,NativeSurface[]>();for(const p of parts){const key=p.role+':'+p.color;groups.set(key,[...(groups.get(key)??[]),p]);}return [...groups.values()].map(parts=>{const g:Geometry={positions:[],normals:[],indices:[]};for(const p of parts){const a=p.shape==='mesh'?p.geometry:geometry(p),at=p.shape==='mesh'?p.at:[0,0,0],n=g.positions.length/3;g.positions.push(...a.positions.map((v,i)=>v+at[i%3]));g.normals.push(...a.normals);g.indices.push(...a.indices.map(v=>v+n));}return M(g,parts[0].color,parts[0].role??'leaf');});}
function scaled(s:NativeSurface,scale:number):NativeSurface{return s.shape==='mesh'?{...s,at:s.at.map(v=>v*scale) as V3,geometry:{...s.geometry,positions:s.geometry.positions.map(v=>v*scale)}}:{...s,at:s.at.map(v=>v*scale) as V3,size:s.size.map(v=>v*scale) as V3};}
export function buildV11Plant(scale=1):NativePlantParts{
 if(!Number.isFinite(scale)||scale<=0)throw new RangeError('positive plant scale');
 const base:NativeSurface[]=[M(sculptLoft([{y:.012,x:.12,z:.12},{y:.045,x:.136,z:.136},{y:.29,x:.165,z:.165},{y:.33,x:.164,z:.164}],24),'#AA8053','wood')];
 base.push({shape:'cylinder',size:[.258,.30,.258],at:[0,.174,0],top:1,color:'#8C7050',role:'ceramic'});
 for(let ring=0;ring<9;ring++){const y=.026+ring*.034,r=.126+y*.115;const points:V3[]=Array.from({length:25},(_,j)=>{const a=j/24*Math.PI*2;return [Math.cos(a)*r,y+.002*Math.sin(j*Math.PI),Math.sin(a)*r]});base.push(twig(points,.0036,ring%2?'#C9AC7E':'#B39567'));}
 base.push({shape:'cylinder',size:[.299,.012,.299],at:[0,.329,0],top:1,color:'#5C4C34',role:'paint'});
 const leaves=Array.from({length:7},(_,i)=>{const a=i*2.39996,pivot:V3=[Math.cos(a)*.025,.34,Math.sin(a)*.025],recipe:NativeSurface[]=[];const height=.38+i%3*.13;const tip:V3=[Math.cos(a)*(.18+i%2*.08),height,Math.sin(a)*(.18+i%2*.08)];recipe.push(twig([[0,0,0],[tip[0]*.3,height*.6,tip[2]*.3],tip],.0045));
  for(let k=0;k<4;k++){const t=.30+k*.19,pos:V3=[tip[0]*t,height*t,tip[2]*t];recipe.push(leaf(pos,.20+(3-k)*.025,.10+(3-k)*.017,a+(k%2?1.2:-1.2),.8+(i%3)*.28,['#64804D','#8BA665','#A4B877','#758F55'][(i+k)%4]));}
  return {pivot:pivot.map(v=>v*scale) as V3,recipe:batch(recipe.map(s=>({...s,role:'leaf' as const,color:s.role==='wood'?'#64804D':s.color}))).map(s=>scaled(s,scale))};});
 return {base:batch(base).map(s=>scaled(s,scale)),leaves};
}
export function buildV11Garden():NativeSurface[]{
 const out:NativeSurface[]=[];
 for(let i=0;i<4;i++){const x=-5.45-i*.33,z=-2.5+i*1.60,y=1.4+i%2*.22;out.push(twig([[x,.1,z],[x+.13,1.4,z+.12],[x-.06,2.80,z-.05]],.032,'#8B8061'));
  for(let b=0;b<6;b++){const a=b*2.399+i,cy=y+b*.15,cx=x+Math.cos(a)*.28,cz=z+Math.sin(a)*.35;out.push(twig([[x,cy-.4,z],[cx,cy,cz],[cx+Math.cos(a)*.23,cy+.14,cz+Math.sin(a)*.23]],.008,'#8B8061'));
   for(let k=0;k<10;k++)out.push(leaf([cx+Math.cos(k*2.4)*.28,cy+Math.sin(k*2.4)*.11,cz+Math.sin(k*2.4)*.28],.18+k%2*.06,.10+k%3*.025,a+k*.7,.8+k%3*.4,['#A4BA75','#7E9D58','#BAC98B','#90AB69'][k%4]));
  }
 }
 const groups=new Map<string,NativeSurface[]>();for(const part of out){const key=part.role+':'+part.color;groups.set(key,[...(groups.get(key)??[]),part]);}return [...groups.values()].map(parts=>{const g:Geometry={positions:[],normals:[],indices:[]};for(const p of parts){const a=p.shape==='mesh'?p.geometry:geometry(p),at=p.shape==='mesh'?p.at:[0,0,0],n=g.positions.length/3;g.positions.push(...a.positions.map((v,i)=>v+at[i%3]));g.normals.push(...a.normals);g.indices.push(...a.indices.map(v=>v+n));}for(let i=0;i<g.positions.length;i++)g.positions[i]-=[-5.8,2,0][i%3];return M(g,parts[0].color,parts[0].role??'leaf',[-5.8,2,0]);});
}
/** Hanging greenery is fixture decoration, not stock, a collectible or a grant. */
export function buildV11TrailingGreenery():NativeSurface[]{
 const out:NativeSurface[]=[];
 for(const [x,y,z]of [[-3.20,2.78,2.89],[1.40,2.80,2.86],[-4.19,2.82,-1.02]]){
  out.push(M(sculptLoft([{y:0,x:.10,z:.10},{y:.19,x:.13,z:.13},{y:.23,x:.13,z:.13}],12),'#B6A17F','ceramic',[x,y,z]));
  for(let branch=0;branch<3;branch++){const points:V3[]=Array.from({length:6},(_,j)=>[x+(branch-1)*.13+.045*Math.sin(j),y+.18-j*.20,z-.06-.06*j]);out.push(twig(points,.0035));
   for(let k=1;k<6;k++)for(const side of [-1,1])out.push(leaf([points[k][0]+side*.025,points[k][1],points[k][2]],.13,.10,side*(.7+branch*.3),2.35+side*.20,['#738C54','#91A665','#A6B97C'][(k+branch)%3]));
  }
 }
 return batch(out);
}
