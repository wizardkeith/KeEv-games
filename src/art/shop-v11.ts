/** V11 target slice: original branching botanicals, woven planters, layered
 * window garden and decorative (non-stock) fixture staging. All are real mesh
 * surfaces. Door/counter/table envelopes and economic objects remain in V10. */
import type {NativeSurface,NativeMesh} from './native-characters';
import type {NativePlantParts} from './native-environment';
import {geometry,type Geometry} from './geometry';
import {sculptSweep,sculptLoft,finishSculpt} from './sculpt-v10';
import type {V3} from './recipes';
import {buildV10Styling} from './shop-v10';
const M=(g:Geometry,color:string,role:NativeMesh['role']='leaf',at:V3=[0,0,0]):NativeMesh=>({shape:'mesh',at,geometry:g,color,role});
const twig=(points:V3[],r:number,color='#738353')=>M(sculptSweep(points,points.map(()=>r),points.map(()=>r),points.length>12?24:6,4),color,'wood');
function leaf(at:V3,length:number,width:number,angle:number,tilt:number,color:string,segments=8):NativeMesh{
 const rim=Array.from({length:segments},(_,j)=>{const a=j/segments*Math.PI*2,t=(1-Math.cos(a))/2;return [Math.sin(a)*(.76+.24*t),t];}),g:Geometry&{uvs:number[]}={positions:[],normals:[],indices:[],uvs:[]};
 const rotate=(x:number,y:number,z:number)=>{[y,z]=[y*Math.cos(tilt)-z*Math.sin(tilt),y*Math.sin(tilt)+z*Math.cos(tilt)];return [x*Math.cos(angle)+z*Math.sin(angle)+at[0],y+at[1],-x*Math.sin(angle)+z*Math.cos(angle)+at[2]];};
 // Two curved fans meet on the same tapered rim. This closed lens keeps the
 // exact eight/twelve-point outer contour while removing an invisible doubled
 // edge strip, spending the saved triangles on flower petals and fuller crowns.
 for(let side=0;side<2;side++){g.positions.push(...rotate(0,length*.48,length*.13+side*.0015));g.uvs.push(.5,.48);for(const [u,t]of rim){g.positions.push(...rotate(u*width*.5,t*length,.06*length*Math.sin(t*Math.PI)+.00075));g.uvs.push(u*.5+.5,t);}for(let j=0;j<segments;j++){const a=side*(segments+1),b=a+1+j,c=a+1+(j+1)%segments;g.indices.push(...(side?[a,b,c]:[a,c,b]));}}
 return {...M(finishSculpt(g),color),baseColorTexture:'/assets/native-v11/broadleaf-albedo.png'};
}
function batch(parts:NativeSurface[]):NativeSurface[]{const groups=new Map<string,NativeSurface[]>();for(const p of parts){const key=p.role+':'+p.color+':'+(p.baseColorTexture??'')+':'+(p.roughness??'');groups.set(key,[...(groups.get(key)??[]),p]);}return [...groups.values()].map(parts=>{const g:Geometry&{uvs:number[]}={positions:[],normals:[],indices:[],uvs:[]};for(const p of parts){const a=p.shape==='mesh'?p.geometry:geometry(p),at=p.shape==='mesh'?p.at:[0,0,0],n=g.positions.length/3;g.positions.push(...a.positions.map((v,i)=>v+at[i%3]));g.normals.push(...a.normals);g.indices.push(...a.indices.map(v=>v+n));g.uvs.push(...((a as Geometry&{uvs?:number[]}).uvs??Array(a.positions.length/3*2).fill(0)));}return {...M(g,parts[0].color,parts[0].role??'leaf'),...(parts[0].roughness!==undefined?{roughness:parts[0].roughness}:{}),...(parts[0].baseColorTexture?{baseColorTexture:parts[0].baseColorTexture}:{})};});}
function scaled(s:NativeSurface,scale:number):NativeSurface{return s.shape==='mesh'?{...s,at:s.at.map(v=>v*scale) as V3,geometry:{...s.geometry,positions:s.geometry.positions.map(v=>v*scale)}}:{...s,at:s.at.map(v=>v*scale) as V3,size:s.size.map(v=>v*scale) as V3};}
export function buildV11Plant(scale=1):NativePlantParts{
 if(!Number.isFinite(scale)||scale<=0)throw new RangeError('positive plant scale');
 const base:NativeSurface[]=[M(sculptLoft([{y:.012,x:.12,z:.12},{y:.045,x:.136,z:.136},{y:.29,x:.165,z:.165},{y:.33,x:.164,z:.164}],24),'#B39567','wood')];
 base.push({shape:'cylinder',size:[.258,.30,.258],at:[0,.174,0],top:1,color:'#8C7050',role:'ceramic'});
 for(let ring=0;ring<9;ring++){const y=.026+ring*.034,r=.126+y*.115;const points:V3[]=Array.from({length:25},(_,j)=>{const a=j/24*Math.PI*2;return [Math.cos(a)*r,y+.002*Math.sin(j*Math.PI),Math.sin(a)*r]});base.push(twig(points,.0036,ring%2?'#C9AC7E':'#B39567'));}
 base.push({shape:'cylinder',size:[.299,.012,.299],at:[0,.329,0],top:1,color:'#5C4C34',role:'paint'});
 const leaves=Array.from({length:7},(_,i)=>{const a=i*2.39996,pivot:V3=[Math.cos(a)*.025,.34,Math.sin(a)*.025],recipe:NativeSurface[]=[];const height=.38+i%3*.13;const tip:V3=[Math.cos(a)*(.18+i%2*.08),height,Math.sin(a)*(.18+i%2*.08)];recipe.push(twig([[0,0,0],[tip[0]*.3,height*.6,tip[2]*.3],tip],.0045));
  for(let k=0;k<4;k++){const t=.30+k*.19,pos:V3=[tip[0]*t,height*t,tip[2]*t];recipe.push(leaf(pos,.20+(3-k)*.025,.10+(3-k)*.017,a+(k%2?1.2:-1.2),.8+(i%3)*.28,['#64804D','#8BA665','#A4B877','#758F55'][(i+k)%4],12));}
  return {pivot:pivot.map(v=>v*scale) as V3,recipe:batch(recipe.map(s=>({...s,role:'leaf' as const,color:s.role==='wood'?'#64804D':s.color,baseColorTexture:'/assets/native-v11/broadleaf-albedo.png'}))).map(s=>scaled(s,scale))};});
 return {base:batch(base).map(s=>scaled(s,scale)),leaves};
}
export function buildV11Garden():NativeSurface[]{
 const out:NativeSurface[]=[];
 for(let i=0;i<4;i++){const x=-5.45-i*.33,z=-2.5+i*1.60,y=1.10+i%2*.14;out.push(twig([[x,.1,z],[x+.13,1.4,z+.12],[x-.06,2.80,z-.05]],.032,'#8B8061'));
  for(let b=0;b<6;b++){const a=b*2.399+i,cy=y+b*.15,cx=x+Math.cos(a)*.28,cz=z+Math.sin(a)*.35;out.push(twig([[x,cy-.4,z],[cx,cy,cz],[cx+Math.cos(a)*.23,cy+.14,cz+Math.sin(a)*.23]],.008,'#8B8061'));
   for(let k=0;k<9;k++)out.push(leaf([cx+Math.cos(k*2.4)*.28,cy+Math.sin(k*2.4)*.11,cz+Math.sin(k*2.4)*.28],.30+k%2*.07,.17+k%3*.03,a+k*.7,.8+k%3*.4,['#A4BA75','#7E9D58','#BAC98B','#90AB69'][k%4]));
  }
 }
 const groups=new Map<string,NativeSurface[]>();for(const part of out){const key=part.role+':'+part.color+':'+(part.baseColorTexture??'');groups.set(key,[...(groups.get(key)??[]),part]);}return [...groups.values()].map(parts=>{const g:Geometry&{uvs:number[]}={positions:[],normals:[],indices:[],uvs:[]};for(const p of parts){const a=p.shape==='mesh'?p.geometry:geometry(p),at=p.shape==='mesh'?p.at:[0,0,0],n=g.positions.length/3;g.positions.push(...a.positions.map((v,i)=>v+at[i%3]));g.normals.push(...a.normals);g.indices.push(...a.indices.map(v=>v+n));g.uvs.push(...((a as Geometry&{uvs?:number[]}).uvs??Array(a.positions.length/3*2).fill(0)));}for(let i=0;i<g.positions.length;i++)g.positions[i]-=[-5.8,2,0][i%3];return {...M(g,parts[0].color,parts[0].role??'leaf',[-5.8,2,0]),...(parts[0].baseColorTexture?{baseColorTexture:parts[0].baseColorTexture}:{})};});
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

/** Original non-stock floral arrangements. They replace the retired window
 * flower primitive group and decorate furniture; they never imply inventory. */
function bouquet():NativeSurface[]{
 const g:Geometry={positions:[],normals:[],indices:[]},profile=[[.001,0],[.075,0],[.10,.05],[.094,.18],[.043,.25],[.043,.28],[.034,.28],[.034,.25],[.083,.18],[.089,.05],[.066,.014],[.001,.014]],n=18;
 for(const [r,y]of profile)for(let j=0;j<n;j++){const a=j/n*Math.PI*2;g.positions.push(r*Math.cos(a),y,r*Math.sin(a));}
 for(let r=0;r<profile.length-1;r++)for(let j=0;j<n;j++){const a=r*n+j,b=r*n+(j+1)%n;g.indices.push(a,a+n,b,b,a+n,b+n);}
 for(const row of [0,profile.length-1]){const center=g.positions.length/3;g.positions.push(0,profile[row][1],0);for(let j=0;j<n;j++)g.indices.push(...(row===0?[center,j,(j+1)%n]:[center,row*n+(j+1)%n,row*n+j]));}
 const out:NativeSurface[]=[M(finishSculpt(g),'#91A08A','ceramic')];
 for(let i=0;i<8;i++){
  const a=i*2.39996,r=.08+(i%3)*.046,tip:V3=[Math.cos(a)*r,.42+(i%4)*.055,Math.sin(a)*r];
  out.push(M(sculptSweep([[0,.17,0],[tip[0]*.4,.32,tip[2]*.4],tip],[.0028,.0028,.0028],[.0028,.0028,.0028],4,4),'#738C54','wood'));
  if(i%3===0)out.push(leaf([tip[0]*.5,.32,tip[2]*.5],.13,.055,a,.9,'#91A665'));
  for(let blossom=0;blossom<2;blossom++){
   const rotate=(x:number,y:number,z:number)=>{const t=.35+Math.sin(i)*.35;return [x+tip[0]+.024*Math.cos(blossom*2.4+i*.71),y*Math.cos(t)-z*Math.sin(t)+tip[1]+.013*(blossom-.5),y*Math.sin(t)+z*Math.cos(t)+tip[2]+.024*Math.sin(blossom*2.4+i*.71)];};
   // Five independent closed, curved teardrop petals replace the flat star.
   // Shared tapered rims keep thickness and rounded silhouettes in real 3D.
   for(let petal=0;petal<5;petal++){
    const f:Geometry={positions:[],normals:[],indices:[]},n=8,angle=petal/5*Math.PI*2+i*.31;
    const place=(x:number,y:number,z:number)=>rotate(x*Math.cos(angle)+z*Math.sin(angle),y,-x*Math.sin(angle)+z*Math.cos(angle));
    for(let side=0;side<2;side++){
     f.positions.push(...place(0,.004-side*.002,.023));
     for(let j=0;j<n;j++){const a=j/n*Math.PI*2,t=(1-Math.cos(a))/2;f.positions.push(...place(Math.sin(a)*.014*(.65+.35*t),-.001+.007*t*t,.003+.040*t));}
     for(let j=0;j<n;j++){const a=side*(n+1),b=a+1+j,c=a+1+(j+1)%n;f.indices.push(...(side?[a,b,c]:[a,c,b]));}
    }
    out.push({...M(finishSculpt(f),'#FFF5E5','paint'),roughness:.84});
   }
   const c:Geometry={positions:[[.007,.002,0],[0,.002,.007],[-.007,.002,0],[0,.002,-.007],[0,.008,0],[0,-.002,0]].flatMap(p=>rotate(...p as V3)),normals:[],indices:[]};for(let j=0;j<4;j++)c.indices.push(4,j,(j+1)%4,5,(j+1)%4,j);out.push({...M(finishSculpt(c),'#C8AD69','paint'),roughness:.84});
  }
 }
 return out;
}
export function buildV11Styling():NativeSurface[]{
 const out=[...buildV10Styling().slice(0,14),...buildV11TrailingGreenery()];
 for(const [x,y,z,scale]of [[-4.18,.901,-.91,1.1],[-.53,1.0735,-.05,.95],[1.35,1.111,-1.47,.90]])for(const part of bouquet()){
  const p=scaled(part,scale);out.push({...p,at:[p.at[0]+x,p.at[1]+y,p.at[2]+z]});
 }
 return batch(out);
}
