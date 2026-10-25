/** Target slice furniture/architecture reconstruction. Same action heights and
 * station pivots; wider display joinery, counter wing and real widened window
 * aperture. Route clearance envelopes are updated with the physical fixtures. */
import {buildV10Counter,buildV10Display,buildV10Room,buildV10Exterior} from './shop-v10';
import type {NativeSurface,NativeMesh} from './native-characters';
import {nativeGrouped,nativeSurfaceGeometry} from './native-characters';
import type {V3,Part} from './recipes';
import {geometry,type Geometry} from './geometry';
import {sculptSweep,finishSculpt} from './sculpt-v10';
import {leaf as foliageBlade} from './shop-v11';
const board=(size:V3,at:V3,color:string,role:Part['role']='wood',radius=.015):NativeMesh=>{
 const g=geometry({shape:'round',size,at,color,role,radius}),uvs:number[]=[],long=size.indexOf(Math.max(...size));
 for(let i=0;i<g.positions.length;i+=3){const normal=g.normals.slice(i,i+3).map(Math.abs),face=normal.indexOf(Math.max(...normal)),axes=[0,1,2].filter(k=>k!==face),v=axes.includes(long)?long:axes[1],u=axes.find(k=>k!==v)!;uvs.push(g.positions[i+u],g.positions[i+v]);}
 return {shape:'mesh',at:[0,0,0],color,role:role??'wood',geometry:{...g,uvs}};
};
export function buildV11Display(variant=0):NativeSurface[]{
 // Rebuilt squared, tapered-looking joinery replaces the spindly turned legs.
 // Top Y=.9925 and all economic sample anchors remain exactly unchanged.
 const out:NativeSurface[]=[{...board([1.90,.105,1.10],[0,.94,0],'#CCA77A','wood',.025),roughness:.64},board([1.73,.105,.94],[0,.835,0],'#A98155'),board([1.71,.065,.88],[0,.225,0],'#B08C60')];
 for(const x of [-.75,.75])for(const z of [-.36,.36])out.push(board([.095,.89,.095],[x,.445,z],'#997247','wood',.012));
 for(const x of [-.75,.75])out.push(board([.075,.15,.82],[x,.765,0],'#AD8355'));
 for(const z of [-.36,.36])out.push(board([1.49,.13,.065],[0,.765,z],'#AD8355'));
 // A real two-legged presentation riser adds height hierarchy without adding
 // sellable goods. Actual owned samples on its back row use the same .14m top.
 out.push({...board([variant===1?1.65:1.40,.045,variant===1?.30:.48],[0,1.110,variant===1?.36:.20],'#CCA77A','wood',.012),roughness:.64});
 for(const x of [-.56,.56])out.push(board([.055,.095,variant===1?.24:.38],[x,1.040,variant===1?.36:.20],'#AD8355','wood',.008));
 // Retain the original runner and sign as actual fixture surfaces; exclude its
 // retired top/legs/shelf by their existing authoring positions.
 const retained=buildV10Display(variant).slice(9);out.push(...retained.map(p=>{if(variant===1&&(p.role==='metal'||p.role==='paper')){const g=nativeSurfaceGeometry(p);for(let i=0;i<g.positions.length;i+=3){g.positions[i]-=.66;g.positions[i+2]-=.15;}if(g.uvs===undefined)delete g.uvs;return {...p,shape:'mesh' as const,role:p.role,geometry:g,at:[0,0,0] as V3};}return p.role==='fabric'?zScale(p,0,1.10/.95):p;}));
 return out;
}
export function buildV11Counter():NativeSurface[]{
 const parts:NativeSurface[]=[...buildV10Counter(),board([.86,.16,.92],[-1.35,.95,0],'#C9A77D','wood',.025),board([.80,.78,.72],[-1.35,.435,0],'#B38D65'),board([.81,.065,.65],[-1.35,.05,0],'#7A5B42'),board([.71,.18,.028],[-1.35,.70,-.378],'#E7DAC4','paint'),board([.71,.42,.028],[-1.35,.35,-.378],'#D1BEA0','paint'),board([.61,.33,.010],[-1.35,.35,-.397],'#EFE4D1','paint'),...[.70,.35].map(y=>({shape:'sphere' as const,size:[.042,.042,.038] as V3,at:[-1.35,y,-.411] as V3,color:'#B49A66',role:'metal' as const}))];return nativeGrouped(parts).map(g=>({shape:'mesh',geometry:g.geometry,at:[0,0,0],color:g.color,role:g.role,alpha:g.alpha,roughness:g.roughness}));
}
function extent(p:NativeSurface){const g=nativeSurfaceGeometry(p),min=[0,1,2].map(k=>Math.min(...g.positions.filter((_,i)=>i%3===k))),max=[0,1,2].map(k=>Math.max(...g.positions.filter((_,i)=>i%3===k)));return {min,max,size:max.map((v,i)=>v-min[i]),center:max.map((v,i)=>(v+min[i])/2)};}
function zScale(p:NativeSurface,center:number,scale:number,move=0):NativeMesh{const g=nativeSurfaceGeometry(p);for(let i=0;i<g.positions.length;i+=3){g.positions[i+2]=center+(g.positions[i+2]-center)*scale+move;g.normals[i+2]/=scale;const l=Math.hypot(...g.normals.slice(i,i+3));for(let k=0;k<3;k++)g.normals[i+k]/=l;}if(g.uvs===undefined)delete g.uvs;return {...p,shape:'mesh',role:p.role??'wood',geometry:g,at:[0,0,0]};}
export function buildV11Room(door:Parameters<typeof buildV10Room>[0]):NativeSurface[]{
 const out:NativeSurface[]=[];
 for(const original of buildV10Room(door)){const p=original.roughness===.83?{...original,color:original.color==='#C2A481'?'#C49666':'#B88B5C'}:original;const b=extent(p),near=(v:number,t:number)=>Math.abs(v-t)<.002;
  if(near(b.center[0],-4.5)&&near(b.size[1],1.9)&&near(b.size[2],1.8)){out.push(zScale(p,b.center[2],1.2/1.8,Math.sign(b.center[2])*.30));continue;}
  if(near(b.center[0],-4.4)&&near(b.size[1],1.94)&&near(b.size[2],.065))continue;
  if(near(b.center[0],-4.4)&&near(b.size[2],3.1)){out.push(zScale(p,0,4.2/3.1));continue;}
  if(p.role==='glass'&&near(b.center[0],-4.47)){out.push(zScale(p,0,4.1/2.9));continue;}
  if(near(b.center[0],-4.22)&&near(b.size[2],3.3)){out.push(zScale(p,0,4.4/3.3));continue;}
  if(near(b.center[0],-4.32)&&near(b.size[2],3.40)){out.push(zScale(p,0,4.5/3.4));continue;}
  out.push(p);
 }
 const mullions=[-2.1,-.7,.7,2.1].map(z=>board([.12,1.94,.065],[-4.40,1.84,z],'#9E7854','wood',.014));out.push(...nativeGrouped(mullions).map(g=>({shape:'mesh' as const,geometry:g.geometry,at:[0,0,0] as V3,color:g.color,role:g.role,roughness:g.roughness})));return out;
}
/** Atmospheric neighbour vignette, framed through the real window portal.
 * Lower distant eaves expose pitched roof silhouettes instead of blank walls;
 * pale layered crowns sit behind the retained detailed near-window canopy. */
function distantTree(x:number,z:number,color:string):NativeSurface[]{
 const parts:NativeSurface[]=[];
 for(let k=0;k<3;k++){
  const a=k*2.399,at:V3=[x+Math.cos(a)*.32,-1.12+k*.29,z+Math.sin(a)*.35];
  const g=geometry({shape:'sphere',size:[1.16,.94,1.05],at:[0,0,0],color,role:'leaf'});
  for(let j=0;j<g.positions.length;j+=3){const [px,py,pz]=g.positions.slice(j,j+3),phi=Math.atan2(pz,px),lobes=1+.085*Math.sin(phi*5+py*4+k)+.035*Math.cos(phi*9-py*7);g.positions[j]*=lobes;g.positions[j+2]*=lobes;}
  // Recompute normals for the actual lobed crown, not the old sphere normals.
  parts.push({shape:'mesh',at,color,role:'leaf',geometry:finishSculpt(g),roughness:.91});
  // Real broad blades break each distant crown edge; same pale material keeps
  // this distance LOD batched, while near-window leaves retain their paint map.
  for(let j=0;j<18;j++){
   const yy=1-2*(j+.5)/18,phi=j*2.39996+k*.7,rr=Math.sqrt(1-yy*yy),v:V3=[Math.sin(phi)*rr,yy,Math.cos(phi)*rr];
   const q=foliageBlade([at[0]+v[0]*.49,at[1]+v[1]*.38,at[2]+v[2]*.44],.19+(j%3)*.022,.13,phi,Math.acos(yy),color,6);
   delete q.baseColorTexture;parts.push({...q,roughness:.91});
  }
  const end:V3=[at[0],at[1]-.12,at[2]];
  parts.push({shape:'mesh',at:[0,0,0],color:'#A7AE95',role:'wood',geometry:sculptSweep([[x,-2.8,z],[x,-1.8,z],end],[.036,.025,.009],undefined,4,5)});
 }
 return nativeGrouped(parts).map(g=>{const at:V3=[x,-1,z];return {shape:'mesh',at,geometry:{...g.geometry,positions:g.geometry.positions.map((v,i)=>v-at[i%3])},color:g.color,role:g.role,roughness:g.roughness};});
}
export function buildV11Exterior():NativeSurface[]{
 const old=buildV10Exterior(),out:NativeSurface[]=[];
 const houses=[{x:-7.15,z:-1.05,w:1.5,h:1.8,d:1.3,drop:1.60},{x:-7.8,z:1.75,w:1.2,h:2.1,d:1.5,drop:2.30}];
 const gables:NativeSurface[]=[];
 // Original two houses/four window bays/ground; proper pitched roofs now run
 // toward the viewer, so their triangular end silhouettes read through glass.
 for(let i=0;i<15;i++){
  const p=old[i],house=i<8?0:1,h=houses[house],delta:V3=i===0?[0,-.90,0]:house?[-.50,-h.drop,-.05]:[-.15,-h.drop,1.05];
  const roof=p.shape!=='mesh'&&p.turn?.[2],rise=h.d*.32*Math.sin(.64),eave=h.h-h.drop-rise;
  if(roof){const side=Math.sign(p.turn![2]);out.push({...p,at:[h.x,h.h-h.drop,h.z+side*h.d*.25],size:[h.w+.20,.065,h.d*.64],turn:[side*.64,0,0],color:house?'#AFBCC4':'#9DAEB4'});continue;}
  const q={...p,at:p.at.map((v,k)=>v+delta[k]) as V3,...(p.role==='paint'&&i!==0?{color:house?'#D7DFD2':'#C7D3C5'}:{})};
  if(i===1||i===8){const g=nativeSurfaceGeometry(q);for(let j=1;j<g.positions.length;j+=3)g.positions[j]=-h.drop+(g.positions[j]+h.drop)*(h.h-rise)/h.h;out.push({shape:'mesh',at:[0,0,0],geometry:g,color:q.color,role:q.role??'paint'});
   for(const side of [-1,1]){
    const x=h.x+side*h.w*.5,half=h.d*.5,g:Geometry={positions:[],normals:[],indices:[0,1,2,3,5,4,0,3,1,1,3,4,1,4,2,2,4,5,2,5,0,0,5,3]};
    for(const depth of [0,-side*.025])g.positions.push(x+depth,eave,h.z-half,x+depth,eave,h.z+half,x+depth,h.h-h.drop+rise-.02,h.z);
    gables.push({shape:'mesh',at:[0,0,0],geometry:finishSculpt(g),color:q.color,role:'paint'});
   }
  }else out.push(q);
 }
 out.push(...nativeGrouped(gables).map(g=>({shape:'mesh' as const,at:[0,0,0] as V3,geometry:g.geometry,color:g.color,role:g.role,roughness:g.roughness})));
 out.push(...distantTree(-8.90,1.20,'#C2CEAA'),...distantTree(-9.35,4.60,'#D0DAB8'));
 return out;
}
