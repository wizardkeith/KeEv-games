/** Target slice furniture/architecture reconstruction. Same action heights and
 * station pivots; wider display joinery, counter wing and real widened window
 * aperture. Route clearance envelopes are updated with the physical fixtures. */
import {buildV10Counter,buildV10Display,buildV10Room,buildV10Exterior} from './shop-v10';
import type {NativeSurface,NativeMesh} from './native-characters';
import {nativeGrouped,nativeSurfaceGeometry} from './native-characters';
import type {V3,Part} from './recipes';
import {geometry} from './geometry';
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
 out.push({...board([1.40,.045,.48],[0,1.110,.20],'#CCA77A','wood',.012),roughness:.64});
 for(const x of [-.56,.56])out.push(board([.055,.095,.38],[x,1.040,.20],'#AD8355','wood',.008));
 // Retain the original runner and sign as actual fixture surfaces; exclude its
 // retired top/legs/shelf by their existing authoring positions.
 const retained=buildV10Display(variant).slice(9);out.push(...retained.map(p=>p.role==='fabric'?zScale(p,0,1.10/.95):p));
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
 for(const z of [-2.1,-.7,.7,2.1])out.push(board([.12,1.94,.065],[-4.40,1.84,z],'#9E7854','wood',.014));return out;
}
/** The oblique play camera looks down through the window. Lowering the distant
 * courtyard brings real neighbour windows/roofs into view instead of exposing
 * their blank lower walls. This vignette has no paths, shops or gameplay. */
export function buildV11Exterior():NativeSurface[]{return buildV10Exterior().map(p=>({...p,at:[p.at[0],p.at[1]-.90,p.at[2]] as V3}));}
