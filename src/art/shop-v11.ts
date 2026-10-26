import backwallCanopy from '../../assets/masters/native-v11/backwall-c37/distant-canopy.json';
import {backwallNewForms,backwallFormSurfaces} from './backwall-forms-v11';
import {placeCentralFloral} from './central-composition-v11';
import {centralFlowerJugRecipe,centralFlowerSprayRecipe} from './display-quality-v11';
import {wovenPlanter} from './woven-planter-v11';import {floorLeaf} from './floor-leaf-v11';
/** V11 target slice: original branching botanicals, woven planters, layered
 * window garden and decorative (non-stock) fixture staging. All are real mesh
 * surfaces. Door/counter/table envelopes and economic objects remain in V10. */
import type {NativeSurface,NativeMesh} from './native-characters';
import type {NativePlantParts} from './native-environment';
import {geometry,type Geometry} from './geometry';
import {sculptSweep,sculptLoft,finishSculpt} from './sculpt-v10';
import type {V3} from './recipes';
import {buildV10Styling} from './shop-v10';
import {counterStationery} from './counter-stationery-v11';
const M=(g:Geometry,color:string,role:NativeMesh['role']='leaf',at:V3=[0,0,0]):NativeMesh=>({shape:'mesh',at,geometry:g,color,role});
const twig=(points:V3[],r:number,color='#738353')=>M(sculptSweep(points,points.map(()=>r),points.map(()=>r),points.length>12?24:6,4),color,'wood');
export function leaf(at:V3,length:number,width:number,angle:number,tilt:number,color:string,segments=8):NativeMesh{
 const rim=Array.from({length:segments},(_,j)=>{const a=j/segments*Math.PI*2,t=(1-Math.cos(a))/2;return [Math.sin(a)*(.76+.24*t),t];}),g:Geometry&{uvs:number[]}={positions:[],normals:[],indices:[],uvs:[]};
 const rotate=(x:number,y:number,z:number)=>{[y,z]=[y*Math.cos(tilt)-z*Math.sin(tilt),y*Math.sin(tilt)+z*Math.cos(tilt)];return [x*Math.cos(angle)+z*Math.sin(angle)+at[0],y+at[1],-x*Math.sin(angle)+z*Math.cos(angle)+at[2]];};
 // Two curved fans meet on the same tapered rim. This closed lens keeps the
 // exact eight/twelve-point outer contour while removing an invisible doubled
 // edge strip, spending the saved triangles on flower petals and fuller crowns.
 for(let side=0;side<2;side++){g.positions.push(...rotate(0,length*.48,length*.13+side*.0015));g.uvs.push(.5,.48);for(const [u,t]of rim){g.positions.push(...rotate(u*width*.5,t*length,.06*length*Math.sin(t*Math.PI)+.00075));g.uvs.push(u*.5+.5,t);}for(let j=0;j<segments;j++){const a=side*(segments+1),b=a+1+j,c=a+1+(j+1)%segments;g.indices.push(...(side?[a,b,c]:[a,c,b]));}}
 return {...M(finishSculpt(g),color),baseColorTexture:'/assets/native-v11/broadleaf-albedo.png'};
}
function batch(parts:NativeSurface[]):NativeSurface[]{const groups=new Map<string,NativeSurface[]>();for(const p of parts){const key=p.role+':'+p.color+':'+(p.baseColorTexture??'')+':'+(p.roughness??'')+':'+(p.finish??'');groups.set(key,[...(groups.get(key)??[]),p]);}return [...groups.values()].map(parts=>{const g:Geometry&{uvs:number[]}={positions:[],normals:[],indices:[],uvs:[]};for(const p of parts){const a=p.shape==='mesh'?p.geometry:geometry(p),at=p.shape==='mesh'?p.at:[0,0,0],n=g.positions.length/3;g.positions.push(...a.positions.map((v,i)=>v+at[i%3]));g.normals.push(...a.normals);g.indices.push(...a.indices.map(v=>v+n));g.uvs.push(...((a as Geometry&{uvs?:number[]}).uvs??Array(a.positions.length/3*2).fill(0)));}return {...M(g,parts[0].color,parts[0].role??'leaf'),...(parts[0].roughness!==undefined?{roughness:parts[0].roughness}:{}),...(parts[0].baseColorTexture?{baseColorTexture:parts[0].baseColorTexture}:{}),...(parts[0].finish?{finish:parts[0].finish}:{})};});}
function scaled(s:NativeSurface,scale:number):NativeSurface{return s.shape==='mesh'?{...s,at:s.at.map(v=>v*scale) as V3,geometry:{...s.geometry,positions:s.geometry.positions.map(v=>v*scale)}}:{...s,at:s.at.map(v=>v*scale) as V3,size:s.size.map(v=>v*scale) as V3};}
/** Blade bases are sampled from the actual swept branch rings, rather than
 * placed along an unrelated straight line. Seven external wind pivots remain. */
export function floorPlantBranch(i:number){
 const a=i*2.39996,pivot:V3=[Math.cos(a)*.025,.34,Math.sin(a)*.025],height=.38+i%3*.13,tip:V3=[Math.cos(a)*(.12+i%2*.04),height,Math.sin(a)*(.12+i%2*.04)];
 const stem=twig([[0,-.008,0],[tip[0]*.15,height*.28,tip[2]*.15],[tip[0]*.80,height*.72,tip[2]*.80],tip],.0045),leaves:NativeMesh[]=[];
 for(let k=0;k<4;k++){const ring=k+2,pos:V3=[0,1,2].map(d=>[0,1,2,3].reduce((sum,j)=>sum+stem.geometry.positions[(ring*4+j)*3+d],0)/4)as V3;
  leaves.push(floorLeaf(pos,.20+(3-k)*.025,.10+(3-k)*.017,Math.PI/2-a+(k%2?.68:-.68),.8+(i%3)*.28+(1.5-k)*.04,['#64804D','#8BA665','#A4B877','#758F55'][(i+k)%4]));
 }
 return{pivot,stem,leaves};
}
export function buildV11Plant(scale=1):NativePlantParts{
 if(!Number.isFinite(scale)||scale<=0)throw new RangeError('positive plant scale');
 const base:NativeSurface[]=[...wovenPlanter(scale),{shape:'cylinder',size:[.258,.30,.258],at:[0,.174,0],top:1,color:'#8C7050',role:'ceramic'}];
 base.push({shape:'cylinder',size:[.299,.012,.299],at:[0,.329,0],top:1,color:'#5C4C34',role:'paint'});
 const leaves=Array.from({length:7},(_,i)=>{const branch=floorPlantBranch(i);return {pivot:branch.pivot.map(v=>v*scale)as V3,recipe:batch([branch.stem,...branch.leaves].map(s=>({...s,role:'leaf' as const,color:s.role==='wood'?'#64804D':s.color,baseColorTexture:'/assets/native-v11/broadleaf-albedo.png'}))).map(s=>scaled(s,scale))};});
 return {base:batch(base).map(s=>scaled(s,scale)),leaves};
}
/** C23 near-window deciduous trees. Unequal forked crowns leave a view
 * between their masses; each broad blade grows from a real branch endpoint.
 * This replaces four aligned saplings, not the preserved indoor plants. */
export function windowTreeSkeletons(){
 const trees=[{x:-5.90,z:2.10,base:-1.52,top:2.32,phase:.35},{x:-6.20,z:-.40,base:-1.75,top:1.65,phase:1.8}];
 return trees.map(t=>{
  const stem=twig([[t.x,t.base,t.z],[t.x-.08,-.25,t.z+.07],[t.x+.10,.92,t.z-.03],[t.x-.12,t.top,t.z+.13]],.045,'#8C7959');
  // Read centres of the actual six swept trunk segments. Forks begin inside
  // these real segments, rather than an unrelated straight vertical axis.
  const rings=Array.from({length:7},(_,r)=>[0,1,2].map(k=>[0,1,2,3].reduce((sum,j)=>sum+stem.geometry.positions[(r*4+j)*3+k],0)/4)as V3);
  const axisAt=(height:number):V3=>{let r=rings.findIndex(p=>p[1]>=height);if(r<=0)return rings[0];const lo=rings[r-1],hi=rings[r],u=(height-lo[1])/(hi[1]-lo[1]);return lo.map((v,k)=>v+(hi[k]-v)*u)as V3;};
  const branches=Array.from({length:7},(_,b)=>{const a=b*2.39996+t.phase,h=t.top-.90+(b%3)*.38,reach=.36+(b%2)*.22,joint=axisAt(h-.45),tip:V3=[t.x+Math.cos(a)*reach,h,t.z+Math.sin(a)*reach];return {joint,tip,stem:twig([joint,[joint[0]+(tip[0]-joint[0])*.55,h-.12,joint[2]+(tip[2]-joint[2])*.55],tip],.012,'#8C7959')};});
  return {stem,branches};
 });
}
function oldV11Garden():NativeSurface[]{
 const out:NativeSurface[]=[],root:V3=[-5.8,1.6,0];
 for(const [tree,t]of windowTreeSkeletons().entries()){
  out.push(t.stem);
  for(const [b,branch]of t.branches.entries()){
   const {tip}=branch;out.push(branch.stem);
   for(let pair=0;pair<7;pair++){
    const theta=pair*2.39996+b*.37,r=.08+.22*Math.sqrt((pair+.5)/7),end:V3=[tip[0]+Math.cos(theta)*r,tip[1]+.13*Math.sin(theta*1.7)+.06*(pair%2),tip[2]+Math.sin(theta)*r];
    out.push(M(sculptSweep([tip,end],[.0038,.0018],undefined,1,3),'#8C7959','wood'));
    for(let side=0;side<2;side++){const k=pair*2+side;out.push(leaf(end,.29+(k%3)*.065,.17+(k%2)*.035,theta+(side?.95:-.65),.80+(k%4)*.32,['#789951','#A4B96B','#C3CE85','#8DA95B'][(k+b+tree)%4]));}
   }
  }
 }
 return batch(out).map(p=>p.shape==='mesh'?{...p,at:root,geometry:{...p.geometry,positions:p.geometry.positions.map((v,i)=>v-root[i%3])}}:p);
}
/** Hanging greenery is fixture decoration, not stock, a collectible or a grant. */
function oldV11TrailingGreenery():NativeSurface[]{
 const out:NativeSurface[]=[];
 for(const [x,y,z]of [[-3.20,2.78,2.89],[1.40,2.80,2.86],[-4.19,2.82,-1.02]]){
  out.push(M(sculptLoft([{y:0,x:.10,z:.10},{y:.19,x:.13,z:.13},{y:.23,x:.13,z:.13}],12),'#B6A17F','ceramic',[x,y,z]));
  for(let branch=0;branch<3;branch++){const points:V3[]=Array.from({length:6},(_,j)=>[x+(branch-1)*.13+.045*Math.sin(j),y+.18-j*.20,z-.06-.06*j]);out.push(twig(points,.0035));
   for(let k=1;k<6;k++)for(const side of [-1,1])out.push(leaf([points[k][0]+side*.025,points[k][1],points[k][2]],.13,.10,side*(.7+branch*.3),2.35+side*.20,['#738C54','#91A665','#A6B97C'][(k+branch)%3]));
  }
 }
 return batch(out);
}

/** C37 one coherent window tree: actual forked branches at several depths and
 * heights, broader overlapping curved blades, with a deliberate roof opening.
 * Replaces the old196 individual blades; does not add to the original budget. */
export function buildV11Garden():NativeSurface[]{
 if(!backwallNewForms)return backwallFormSurfaces(oldV11Garden());
 const out:NativeSurface[]=[],root:V3=[-5.8,1.6,0];
 for(const [tree,t]of windowTreeSkeletons().entries()){
  out.push(t.stem);
  const x=tree?-6.20:-5.90,z=tree?-.40:2.10;
  for(let b=0;b<6;b++){
   const h=[-.68,-.12,.48,.99,1.53,2.02][b]-(tree?.32:0),a=b*2.39996+tree*1.4;
   const joint:V3=[x-.04,h-.26,z+.04],tip:V3=[x+Math.cos(a)*(.42+(b%2)*.14),h,z+Math.sin(a)*(.44+(b%2)*.13)];
   // Join to the actual sampled trunk axis at the corresponding height.
   const g=t.stem.geometry,rings=Array.from({length:7},(_,r)=>[0,1,2].map(k=>[0,1,2,3].reduce((sum,j)=>sum+g.positions[(r*4+j)*3+k],0)/4)as V3);
   let hi=rings.findIndex(p=>p[1]>=joint[1]);if(hi<1)hi=1;
   const lo=rings[hi-1],up=rings[hi],u=Math.max(0,Math.min(1,(joint[1]-lo[1])/(up[1]-lo[1])));for(let k=0;k<3;k++)joint[k]=lo[k]+(up[k]-lo[k])*u;
   out.push(twig([joint,[(joint[0]+tip[0])*.5,h-.13,(joint[2]+tip[2])*.5],tip],.014,'#8C7959'));
   // Unequal overlapping groups rather than a row of identically sized crowns.
   for(let k=0;k<7;k++){
    const theta=k*2.39996+a,r=k===0?.02:.13+.045*(k%3),end:V3=[tip[0]+Math.cos(theta)*r,tip[1]+.10*Math.sin(theta)+.045*(k%2),tip[2]+Math.sin(theta)*r];
    out.push(M(sculptSweep([tip,end],[.0038,.0016],undefined,1,3),'#8C7959','wood'));
    out.push(leaf(end,.43+(k%3)*.065,.28+(k%2)*.055,theta+.4,.60+(k%4)*.29,['#789951','#A4B96B','#C3CE85','#8DA95B'][(b+k+tree)%4]));
   }
  }
 }
 return batch(backwallFormSurfaces(out)).map(p=>p.shape==='mesh'?{...p,at:root,geometry:{...p.geometry,positions:p.geometry.positions.map((v,i)=>v-root[i%3])}}:p);
}
/** Shelf pots are physically seated on the upper shelf, not suspended above it.
 * Four unequal trailing stems bridge tiers; the third original pot now sits on
 * the right window ledge. These are fixed plants, never saleable stock. */
export function buildV11TrailingGreenery():NativeSurface[]{
 if(!backwallNewForms)return backwallFormSurfaces(oldV11TrailingGreenery());
 const out:NativeSurface[]=[];
 for(const[x,y,z]of[[-3.12,2.2835,2.88],[1.43,2.2835,2.88]]){
  out.push(M(sculptLoft([{y:0,x:.10,z:.10},{y:.18,x:.145,z:.145},{y:.22,x:.145,z:.145}],12),'#B6A17F','ceramic',[x,y,z]));
  for(let b=0;b<4;b++){
   const side=b%2?1:-1,drop=[.76,1.02,.61,.90][b],points:V3[]=Array.from({length:7},(_,j)=>{const u=j/6;return [x+(b-1.5)*.065+side*.16*Math.sin(u*2.9)+.035*Math.sin(j*1.4),y+.20-u*drop,z-.05-.22*Math.sin(Math.min(1,u*2)*Math.PI*.5)];});
   out.push(twig(points,.004));
   for(let k=0;k<7;k++){const q=points[k],side=k%2?1:-1;out.push(leaf([q[0]+side*.025,q[1],q[2]],.26+(k%3)*.025,.18+(k%2)*.025,side*(.9+b*.18),2.25+side*.24,['#738C54','#91A665','#A6B97C'][(k+b)%3]));}
  }
  for(let k=0;k<5;k++)out.push(leaf([x,y+.18,z],.36,.23,k*2.39996,.65+(k%3)*.4,['#738C54','#91A665','#A6B97C'][k%3]));
 }
 const pivot:V3=[-4.18,.901,1.44];
 out.push(M(sculptLoft([{y:0,x:.11,z:.11},{y:.20,x:.15,z:.15},{y:.235,x:.15,z:.15}],12),'#B6A17F','ceramic',pivot));
 for(let b=0;b<5;b++){
  const a=b*2.39996,tip:V3=[pivot[0]+Math.cos(a)*.17,pivot[1]+.48+(b%3)*.14,pivot[2]+Math.sin(a)*.19],base:V3=[pivot[0],pivot[1]+.19,pivot[2]];
  out.push(twig([base,[base[0],(base[1]+tip[1])*.5,base[2]],tip],.007));
  for(let k=0;k<3;k++){const u=.40+k*.27,point=base.map((v,j)=>v+(tip[j]-v)*u)as V3;out.push(leaf(point,.26+(2-k)*.025,.18,a+(k%2?.7:-.6),.65+k*.20,['#738C54','#91A665','#A6B97C'][(k+b)%3]));}
 }
 return batch(backwallFormSurfaces(out));
}

/** Original non-stock floral arrangements. They replace the retired window
 * flower primitive group and decorate furniture; they never imply inventory. */
export function bouquet():NativeSurface[]{
 const g:Geometry={positions:[],normals:[],indices:[]},profile=[[.001,0],[.075,0],[.10,.05],[.094,.18],[.043,.25],[.043,.28],[.034,.28],[.034,.25],[.083,.18],[.089,.05],[.066,.014],[.001,.014]],n=16;
 for(const [r,y]of profile)for(let j=0;j<n;j++){const a=j/n*Math.PI*2;g.positions.push(r*Math.cos(a),y,r*Math.sin(a));}
 for(let r=0;r<profile.length-1;r++)for(let j=0;j<n;j++){const a=r*n+j,b=r*n+(j+1)%n;g.indices.push(a,a+n,b,b,a+n,b+n);}
 for(const row of [0,profile.length-1]){const center=g.positions.length/3;g.positions.push(0,profile[row][1],0);for(let j=0;j<n;j++)g.indices.push(...(row===0?[center,j,(j+1)%n]:[center,row*n+(j+1)%n,row*n+j]));}
 const out:NativeSurface[]=[M(finishSculpt(g),'#91A08A','ceramic')];
 for(let i=0;i<8;i++){
  // A tiered, branching dome: flower heads sit on actual stem/fork ends,
  // with lower axillary heads and leaf mass rather than pairs floating at tips.
  const a=i*2.39996,r=.075+(i%3)*.038,tip:V3=[Math.cos(a)*r,.625-r*.56+(i%2)*.018,Math.sin(a)*r];
  const axis=(t:number):V3=>[tip[0]*t,.17+(tip[1]-.17)*t,tip[2]*t];
  out.push(M(sculptSweep([axis(0),axis(.5),tip],[.0028,.0028,.0028],[.0028,.0028,.0028],4,4),'#738C54','wood'));
  out.push(leaf(axis(.46),.115,.068,a+.45,.95,'#91A665'));
  // Three closed, rounded buds around each open floret form a branched spray,
  // with empty intervals between sprays rather than a uniform solid sphere.
  for(let k=0;k<3;k++){
   const theta=a+k*Math.PI*2/3,head:V3=[tip[0]+.052*Math.cos(theta),tip[1]-.028+(k%2)*.047,tip[2]+.052*Math.sin(theta)];
   out.push(M(sculptSweep([axis(.83),head],[.0017,.0011],[.0017,.0011],1,3),'#738C54','wood'));
   const bud:Geometry={positions:[0,.021,0,0,-.018,0],normals:[],indices:[]};
   for(let ring=0;ring<2;ring++)for(let j=0;j<5;j++){const t=j/5*Math.PI*2+ring*Math.PI/5;bud.positions.push(Math.cos(t)*.018,ring?-.009:.010,Math.sin(t)*.018);}
   for(let j=0;j<5;j++){const u=2+j,un=2+(j+1)%5,l=7+j,ln=7+(j+1)%5;bud.indices.push(0,u,un,1,ln,l,u,l,un,un,l,ln);}
   for(let j=0;j<bud.positions.length;j++)bud.positions[j]+=head[j%3];
   out.push({...M(finishSculpt(bud),k===1?'#F8EEDD':'#FFF8E8','paint'),roughness:.84});
  }
  const heads:V3[]=[tip,...(i%2===0?[axis(.68)]:[])];
  for(let blossom=0;blossom<heads.length;blossom++){
   const head=heads[blossom];
   const rotate=(x:number,y:number,z:number)=>{const t=.35+Math.sin(i)*.35;return [x+head[0],y*Math.cos(t)-z*Math.sin(t)+head[1],y*Math.sin(t)+z*Math.cos(t)+head[2]];};
   // Five independent closed, curved teardrop petals replace the flat star.
   // Shared tapered rims keep thickness and rounded silhouettes in real 3D.
   for(let petal=0;petal<5;petal++){
    const f:Geometry={positions:[],normals:[],indices:[]},n=5,angle=petal/5*Math.PI*2+i*.31;
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
export function buildV11Styling(centralBouquetScale=.95,qualitySlice=false):NativeSurface[]{
 const base=buildV10Styling().slice(0,14);
 // The six 16mm wall battens have subpixel 3mm bevels at normal play scale.
 // Keep their exact bounds and spend those hidden bevel triangles on the
 // reference's visible counter work tools instead of raising the scene budget.
 for(const[i,x]of[-3.48,-2.48,-1.48,-.48,.52,1.52].entries())base[i+1]=M(geometry({shape:'box',size:[.016,.79,.022],at:[x,.56,3.205],color:'#C4AC8A'}),'#C4AC8A','wood');
 const out=[...base,...buildV11TrailingGreenery(),...counterStationery()];
 for(const [x,y,z,scale]of [[-4.18,.901,-.91,1.1],[-.53,1.0735,-.05,centralBouquetScale],[1.35,1.111,-1.47,.90]]){
  if(qualitySlice&&x===-.53){out.push(...placeCentralFloral(centralFlowerJugRecipe(),'vessel'),...placeCentralFloral(centralFlowerSprayRecipe(),'crown'));continue;}
  for(const part of bouquet()){const p=scaled(part,scale);out.push({...p,at:[p.at[0]+x,p.at[1]+y,p.at[2]+z]});}
 }
 return batch(out);
}

/** C37 far foliage is an original connected sculpt, with a few curved leaves
 * rooted inside its volume. It sits behind the actual near branches/roof planes.
 * Saved Blender source and indexed mesh stay available for native reuse. */
export function backwallDistantCrown(color:string):NativeSurface[]{
 const out:NativeSurface[]=[{...M(backwallCanopy,color),roughness:.91}];
 for(let k=0;k<8;k++){
  const head=([[-.32,-.12,.10],[.38,.46,-.12],[-.10,.98,.15]]as V3[])[k%3],a=k*2.39996;
  out.push(leaf([head[0]+Math.cos(a)*.12,head[1],head[2]+Math.sin(a)*.12],.43+(k%3)*.06,.28+(k%2)*.04,a,.60+(k%4)*.26,color));
 }
 return batch(out);
}
