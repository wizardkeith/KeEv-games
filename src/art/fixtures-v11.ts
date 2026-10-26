import {backwallDistantCrown} from './shop-v11';
import {backwallNewForms,backwallFormSurfaces} from './backwall-forms-v11';
import {grayFormMode,grayBatchColor,grayBatchRoughness} from './gray-forms-v11';
import {centralLinenRecipe,windowCrownRecipe} from './display-quality-v11';
/** Target slice furniture/architecture reconstruction. Same action heights and
 * station pivots; wider display joinery, counter wing and real widened window
 * aperture. Route clearance envelopes are updated with the physical fixtures. */
import {counterStationery} from './counter-stationery-v11';
import {oakFloor} from './floor-v11';
import {buildV10Counter,buildV10Display,buildV10Room,printPanel} from './shop-v10';
import type {NativeSurface,NativeMesh} from './native-characters';
import {nativeGrouped,nativeSurfaceGeometry} from './native-characters';
import type {V3,Part} from './recipes';
import {geometry,type Geometry} from './geometry';
import {sculptSweep,sculptLoft,finishSculpt} from './sculpt-v10';
const board=(size:V3,at:V3,color:string,role:Part['role']='wood',radius=.015):NativeMesh=>{
 const g=geometry({shape:'round',size,at,color,role,radius}),uvs:number[]=[],long=size.indexOf(Math.max(...size));
 for(let i=0;i<g.positions.length;i+=3){const normal=g.normals.slice(i,i+3).map(Math.abs),face=normal.indexOf(Math.max(...normal)),axes=[0,1,2].filter(k=>k!==face),v=axes.includes(long)?long:axes[1],u=axes.find(k=>k!==v)!;uvs.push(g.positions[i+u],g.positions[i+v]);}
 return {shape:'mesh',at:[0,0,0],color,role:role??'wood',geometry:{...g,uvs}};
};
/** Compile indexed fixture meshes by actual PBR identity, preserving geometry,
 * UV, finish and texture metadata. This is the same batching as the Web adapter;
 * added cabinet detail does not become one draw call per physical board. */
const compileFixture=(parts:NativeSurface[]):NativeSurface[]=>nativeGrouped(parts).map(g=>({shape:'mesh',at:[0,0,0],geometry:Object.fromEntries(Object.entries(g.geometry).map(([k,v])=>[k,v.map((n:number)=>n===0?0:n)])) as unknown as NativeMesh['geometry'],color:g.color,role:g.role,alpha:g.alpha,roughness:g.roughness,...(g.finish?{finish:g.finish}:{}),...(g.baseColorTexture?{baseColorTexture:g.baseColorTexture}:{})}));
function paperCorner(variant:number):NativeSurface[]{
 if(variant===1)return []; // Existing central books, flower spray and print stay.
 const out:NativeSurface[]=[];
 // Fixed blank journals/lookbook, not additional owned stock or product IDs.
 for(let k=0;k<3;k++){
  const x=-.65+k*.012,z=-.23+k*.008,y=1.004+k*.030;
  out.push(board([.35,.023,.27],[x,y,z],'#E7DDC8','paper',.004),board([.362,.004,.278],[x,y+.014,z],['#8C9B85','#B99C7C','#70897C'][k],'fabric',.002));
 }
 // A physical wooden print rest breaks the rectangle into a high paper mass.
 out.push(board([.34,.023,.24],[-.64,1.144,.36],'#B38D65','wood',.008));
 for(const x of [-.76,-.52])out.push({...board([.016,.25,.024],[x,1.26,.405],'#B38D65','wood',.004)});
 out.push({...board([.29,.31,.009],[-.64,1.29,.36],'#F4EBD8','paper',.002)});
 out.push(printPanel([-.64,1.29,.354],.263,.285,variant===2?1:0));
 return out;
}
export function buildV11Display(variant=0):NativeSurface[]{
 // All retain the actual 1.90 x1.10 tabletop, .9925m surface and navigation
 // envelope. Different lower silhouettes replace three identical trestles.
 const out:NativeSurface[]=[{...board([1.90,.105,1.10],[0,.94,0],'#CCA77A','wood',.025),roughness:.64},board([1.73,.105,.94],[0,.835,0],'#A98155','wood',0),board([1.71,.065,.88],[0,.225,0],'#B08C60')];
 for(const x of [-.75,.75])for(const z of [-.36,.36])out.push(board([.095,.89,.095],[x,.445,z],'#997247','wood',.012));
 for(const x of [-.75,.75])out.push(board([.075,.15,.82],[x,.765,0],'#AD8355','wood',0));
 for(const z of [-.36,.36])out.push(board([1.49,.13,.065],[0,.765,z],'#AD8355'));
 if(variant===0){
  // Open paper-store trestle with two lower archival boxes and a diagonal brace.
  out.push(board([.065,.52,.055],[0,.48,.36],'#AD8355'));
  for(const x of [-.42,.35])out.push(board([.60,.26,.63],[x,.388,.02],'#C8B38F','paper',.016),board([.16,.055,.008],[x,.43,-.30],'#EEE4D0','paper',.003));
 }else if(variant===1){
  // Two shallow drawers above an open shelf: a distinct central work table.
  for(const x of [-.41,.41])out.push(board([.77,.19,.72],[x,.704,0],'#AD8355'),board([.72,.155,.025],[x,.71,-.378],'#D1B58C','wood',.008),board([.115,.016,.024],[x,.71,-.402],'#B39A64','metal',.006));
 }else{
  // Window-side low cabinet, with an open centre bay and framed cream ends.
  for(const x of [-.77,.77])out.push(board([.075,.48,.76],[x,.50,0],'#B08C60'));
  for(const x of [-.54,.54])out.push(board([.38,.43,.025],[x,.50,-.385],'#D9C8A8','paint',.009),board([.29,.33,.010],[x,.50,-.402],'#EFE4D1','paint',.006),board([.045,.014,.025],[x,.61,-.416],'#B39A64','metal',.004));
  out.push(board([.49,.032,.73],[0,.48,.01],'#B08C60'));
 }
 // Broader window-side furniture grows ONLY toward the wall. Customer-side
 // edges, action height and central-table access stay fixed; matching blockers
 // below are asymmetric around the original selection/stock root.
 if(variant!==1)for(let i=0;i<out.length;i++){
  const p=out[i],g=nativeSurfaceGeometry(p),factor=2.25/1.90;
  for(let j=0;j<g.positions.length;j+=3){g.positions[j]=.95+(g.positions[j]-.95)*factor;g.normals[j]/=factor;const length=Math.hypot(...g.normals.slice(j,j+3));for(let k=0;k<3;k++)g.normals[j+k]/=length;}
  out[i]={...p,shape:'mesh',at:[0,0,0],role:p.role??'wood',geometry:g};
 }
 // Three DISCONNECTED platforms create a high/mid/low group, instead of a
 // continuous bar separating all goods into a uniform row. The left corner is
 // fixed non-inventory dressing, actual stock stays to its right.
 for(const [x,w,z,d,h]of [[-.64,.52,.36,.30,.14],[.05,.40,.35,.30,[.09,.10,.12][variant]],[.58,.40,.35,.30,[.14,.16,.20][variant]]]){
  out.push({...board([w,.032,d],[x,.9925+h-.016,z],'#CCA77A','wood',.008),roughness:.64});
  for(const side of [-1,1])out.push(board([.035,h-.032,d-.035],[x+side*(w/2-.035),.9925+(h-.032)/2,z],'#AD8355','wood',.005));
 }
 const retained=buildV10Display(variant).slice(9).filter(p=>variant!==1||p.role!=='fabric');
 if(variant===1)out.push(...centralLinenRecipe());
 out.push(...retained.map(p=>{if(p.role==='metal'||p.role==='paper'){const g=nativeSurfaceGeometry(p);for(let i=0;i<g.positions.length;i+=3){g.positions[i]-=1.24;g.positions[i+2]-=.15;}if(g.uvs===undefined)delete g.uvs;return {...p,shape:'mesh' as const,role:p.role,geometry:g,at:[0,0,0] as V3};}return p.role==='fabric'?zScale(p,0,1.10/.95):p;}),...paperCorner(variant));
 // Fixed work tools on the newly rebuilt left extension fill a mixed display
 // mass without pretending these are player-owned sellable units.
 if(variant===0)for(const p of counterStationery()){
  const g=nativeSurfaceGeometry(p);for(let j=0;j<g.positions.length;j+=3){g.positions[j]+=-1.07-1.00;g.positions[j+1]+=.9925-1.111;g.positions[j+2]+=-.12+1.73;}out.push({...p,shape:'mesh',at:[0,0,0],role:p.role??'wood',geometry:g});
 }
 if(variant===2){
  out.push(board([.30,.025,.32],[-1.07,1.005,-.14],'#AD8355','wood',.008));
  for(let k=0;k<3;k++){
   const x=-1.15+k*.08,y=1.018,z=-.14,h=.20+k%2*.06,n=12,g:Geometry={positions:[],normals:[],indices:[]},rings=[[.028,0],[.028,h],[.021,h],[.021,.008],[.028,0]];
   for(const[r,dy]of rings)for(let j=0;j<n;j++){const a=j/n*Math.PI*2;g.positions.push(x+r*Math.cos(a),y+dy,z+r*Math.sin(a));}
   for(let row=0;row<rings.length-1;row++)for(let j=0;j<n;j++){const a=row*n+j,b=row*n+(j+1)%n;g.indices.push(a,b,a+n,b,b+n,a+n);}
   out.push({shape:'mesh',at:[0,0,0],geometry:finishSculpt(g),color:'#E7DDC8',role:'paper'});
  }
 }
 return compileFixture(out.map(p=>grayFormMode!=='control'&&p.role==='wood'&&p.color===grayBatchColor&&p.roughness===grayBatchRoughness?p:variant===1&&p.role==='wood'&&p.roughness===.64?{...p,color:'#FFFFFF',finish:'display-oak'}:p.role==='wood'&&p.roughness!==.64?{...p,color:'#AD8355'}:p));
}
export const counterV11Envelope={minX:.48,maxX:3.55,minZ:-1.96,maxZ:-1.04,surfaceY:1.111};
export function buildV11Counter():NativeSurface[]{
 // Retain register and handoff side exactly; remake the left storage wing as
 // a broader foreground cabinet. No actor root, hand length or surface moves.
 const parts:NativeSurface[]=[...buildV10Counter().slice(0,-1),board([1.20,.16,.92],[-1.52,.95,0],'#C9A77D','wood',.025),board([1.14,.78,.72],[-1.52,.435,0],'#B38D65'),board([1.15,.065,.65],[-1.52,.05,0],'#7A5B42')];
 for(const x of [-1.80,-1.24])parts.push(board([.49,.18,.028],[x,.70,-.378],'#E7DAC4','paint'),board([.49,.42,.028],[x,.35,-.378],'#D1BEA0','paint'),board([.40,.33,.010],[x,.35,-.397],'#EFE4D1','paint'),board([.11,.018,.030],[x,.70,-.413],'#B49A66','metal',.006));
 // Work clipboard and discrete pages, not a featureless paper slab. Decorative
 // marks are strokes, never a fake readable instruction or interactive quest.
 parts.push(board([.26,.011,.32],[-.40,1.037,.02],'#AD8355','wood',.008),board([.228,.003,.283],[-.40,1.045,.02],'#F0E6D3','paper',.003),board([.12,.014,.035],[-.40,1.054,.15],'#B49A66','metal',.005));
 for(let i=0;i<5;i++)parts.push(board([.14-i%2*.035,.001,.002],[-.408,1.047,-.06+i*.029],'#B7AA90','paper',.0002));
 // Small real service bell on the foreground register corner. Decorative,
 // not an audio/action/transaction trigger; clear of the existing handoff dock.
 parts.push({shape:'mesh',at:[.68,1.031,-.28],color:'#B49A66',role:'metal',geometry:sculptLoft([{y:0,x:.073,z:.073},{y:.008,x:.078,z:.078},{y:.055,x:.049,z:.049},{y:.078,x:.018,z:.018}],16)});
 parts.push({shape:'sphere',size:[.033,.019,.033],at:[.68,1.118,-.28],color:'#B49A66',role:'metal'});
 return compileFixture(parts);
}
function extent(p:NativeSurface){const g=nativeSurfaceGeometry(p),min=[0,1,2].map(k=>Math.min(...g.positions.filter((_,i)=>i%3===k))),max=[0,1,2].map(k=>Math.max(...g.positions.filter((_,i)=>i%3===k)));return {min,max,size:max.map((v,i)=>v-min[i]),center:max.map((v,i)=>(v+min[i])/2)};}
function zScale(p:NativeSurface,center:number,scale:number,move=0):NativeMesh{const g=nativeSurfaceGeometry(p);for(let i=0;i<g.positions.length;i+=3){g.positions[i+2]=center+(g.positions[i+2]-center)*scale+move;g.normals[i+2]/=scale;const l=Math.hypot(...g.normals.slice(i,i+3));for(let k=0;k<3;k++)g.normals[i+k]/=l;}if(g.uvs===undefined)delete g.uvs;return {...p,shape:'mesh',role:p.role??'wood',geometry:g,at:[0,0,0]};}
export function buildV11Room(door:Parameters<typeof buildV10Room>[0]):NativeSurface[]{
 const out:NativeSurface[]=[];
 for(const original of buildV10Room(door)){if(original.role==='wood'&&original.roughness===.83)continue;const p=original;const b=extent(p),near=(v:number,t:number)=>Math.abs(v-t)<.002;
  if(p.role==='wood'&&near(b.center[0],-.8)&&near(b.center[2],2.85)&&near(b.size[0],5.2)&&near(b.size[1],.105)){out.push(...backwallFormSurfaces([{...p,color:'#B18D63'}]));continue;}
  if(near(b.center[0],-4.5)&&near(b.size[1],1.9)&&near(b.size[2],1.8)){out.push(zScale(p,b.center[2],1.2/1.8,Math.sign(b.center[2])*.30));continue;}
  if(near(b.center[0],-4.4)&&near(b.size[1],1.94)&&near(b.size[2],.065))continue;
  if(near(b.center[0],-4.4)&&near(b.size[2],3.1)){out.push(zScale(p,0,4.2/3.1));continue;}
  if(p.role==='glass'&&near(b.center[0],-4.47)){out.push(zScale(p,0,4.1/2.9));continue;}
  if(near(b.center[0],-4.22)&&near(b.size[2],3.3)){out.push(zScale(p,0,4.4/3.3));continue;}
  if(near(b.center[0],-4.32)&&near(b.size[2],3.40)){out.push(zScale(p,0,4.5/3.4));continue;}
  out.push(p);
 }
 out.push(...oakFloor());
 const mullions=[-2.1,-.7,.7,2.1].map(z=>board([.12,1.94,.065],[-4.40,1.84,z],'#9E7854','wood',.014));out.push(...nativeGrouped(mullions).map(g=>({shape:'mesh' as const,geometry:g.geometry,at:[0,0,0] as V3,color:g.color,role:g.role,roughness:g.roughness})));return compileFixture(out);
}
/** C23 low neighbour architecture and distant tree masses. Their actual
 * depths and roof planes remain visible through the geometric window portal;
 * colours describe atmospheric distance, not a photographed backdrop. */
function distantTree(x:number,z:number,color:string):NativeSurface[]{
 const out:NativeSurface[]=[],pivot:V3=[x,-1.90,z];
 out.push(...(backwallNewForms?backwallDistantCrown(color):[windowCrownRecipe()]).map(p=>({...p,at:pivot})));
 // Retain the C23 branch roots/ends and layer positions. New continuous foliage
 // is a real connected mesh, replacing only the three crude crown spheres.
 for(const[dx,y,dz]of[[-.32,-.82,.10],[.38,-.24,-.12],[-.10,.28,.15]])out.push({shape:'mesh',at:[0,0,0],color:'#8F9C90',role:'wood',geometry:sculptSweep([[x,-3.65,z],[x,-2.32,z],[x+dx,y-1.2,z+dz]],[.041,.028,.009],undefined,4,5)});

 return nativeGrouped(out).map(g=>({shape:'mesh',at:pivot,geometry:{...g.geometry,positions:g.geometry.positions.map((v,i)=>v-pivot[i%3])},color:g.color,role:g.role,roughness:g.roughness,...(g.baseColorTexture?{baseColorTexture:g.baseColorTexture}:{})}));
}
export const windowNeighbourIntent={kind:'non-interactive original exterior',houseCount:2,roofPlanes:4,minX:-12.5,maxX:-5.9,units:'metres'} as const;
export function buildV11Exterior():NativeSurface[]{
 const walls:NativeSurface[]=[],roofs:NativeSurface[]=[],details:NativeSurface[]=[];
 const houses=backwallNewForms?[{x:-8.25,z:-.55,w:1.48,d:1.62,bottom:-4.60,eave:-1.92,rise:.68,color:'#E2D8C2',roof:'#7D8D95'},{x:-10.40,z:3.62,w:1.78,d:1.94,bottom:-4.45,eave:-2.44,rise:.72,color:'#CCD6CE',roof:'#969C9D'}]:[{x:-8.50,z:-.15,w:1.28,d:1.52,bottom:-4.60,eave:-2.20,rise:.60,color:'#E2D8C2',roof:'#7D8D95'},{x:-10.15,z:3.75,w:1.58,d:1.82,bottom:-4.45,eave:-2.10,rise:.65,color:'#CCD6CE',roof:'#969C9D'}];
 for(const h of houses){
  walls.push(board([h.w,h.eave-h.bottom,h.d],[h.x,(h.eave+h.bottom)/2,h.z],h.color,'paint',.015));
  // Pitched roof slabs meet at a real ridge; slope length follows rise/run.
  const angle=Math.atan2(h.rise,h.d*.5),slope=Math.hypot(h.rise,h.d*.5)+.15;
  for(const side of [-1,1])roofs.push({shape:'round',size:[h.w+.24,.055,slope],radius:.006,at:[h.x,h.eave+h.rise*.5,h.z+side*h.d*.25],turn:[side*angle,0,0],color:h.roof,role:'paint'});
  const g:Geometry={positions:[],normals:[],indices:[]};
  for(const side of [-1,1]){const n=g.positions.length/3,x=h.x+side*h.w*.5;g.positions.push(x,h.eave,h.z-h.d*.5,x,h.eave,h.z+h.d*.5,x,h.eave+h.rise,h.z);g.indices.push(...(side>0?[n,n+1,n+2]:[n,n+2,n+1]));}
  walls.push({shape:'mesh',at:[0,0,0],geometry:finishSculpt(g),color:h.color,role:'paint'});
  details.push(board([h.w+.32,.065,.075],[h.x,h.eave+h.rise+.025,h.z],'#879392','paint',.012));
  // Upper-floor window recesses and lintels establish facade scale in actual3D.
  for(const z of [h.z-h.d*.27,h.z+h.d*.27]){
   const x=h.x+h.w*.5+.012,y=h.eave-.57;
   details.push(board([.024,.66,.39],[x,y,z],'#819A9D','glass',.003));
   for(const dz of [-.215,.215])details.push(board([.055,.74,.035],[x+.016,y,z+dz],'#DDD8C5','paint',.004));
   for(const dy of [-.35,.35])details.push(board([.055,.04,.46],[x+.016,y+dy,z],'#DDD8C5','paint',.004));
   details.push(board([.06,.62,.028],[x+.020,y,z],'#DDD8C5','paint',.003));
  }
 }
 // Compile facade detail by material while keeping four actual roof records
 // available for ray/portal tests and native reuse.
 const grouped=(p:NativeSurface[])=>nativeGrouped(p).map(g=>({shape:'mesh' as const,at:[0,0,0] as V3,geometry:g.geometry,color:g.color,role:g.role,roughness:g.roughness}));
 return backwallFormSurfaces([...grouped(walls),...roofs,...details.filter(p=>p.role==='glass'),...grouped(details.filter(p=>p.role!=='glass')),...distantTree(backwallNewForms?-11.25:-10.15,backwallNewForms?-.65:.55,'#9FB9B0'),...distantTree(backwallNewForms?-11.75:-10.95,backwallNewForms?4.45:3.80,'#B6C8BE')]);
}
