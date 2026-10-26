/** C22 non-authoritative fixed dressing. Authoring only: no state, clock, stock
 * grant, sale or catalogue mutation. Existing 35 showroom samples keep identity. */
import {artDirection} from './direction';
import {fixedSampleBounds} from './decor-vignette-v11';import type {NativeSurface} from './native-characters';import {nativeGrouped,nativeSurfaceGeometry} from './native-characters';import type {V3} from './recipes';
interface Sample {id:string;at:V3;turn:V3;scale:number}
export function curateBackSample<T extends Sample>(sample:T,row:number,group:number,k:number):T{
 if(sample.at[2]<2)return sample; // accepted central/counter C5 samples untouched
 const xs=[[-2.85,-2.23,-3.01,-.98,-1.67,-.25,.18],[-3.04,-2.13,-1.58,-.96,.02,.64,1.35],[-2.95,-2.45,-1.92,-1.35,-.66,.17,.70]],stack=['off.notebook','off.towel','off.cookie'].includes(sample.id),upright=sample.id==='off.card',paired=['off.mug','off.tea'].includes(sample.id),scale=sample.id==='off.notebook'?.88:sample.id==='off.towel'?.72:sample.id==='off.tote'?.70:sample.id==='off.vase'?.92:.82;
 const turn:V3=[upright?-1.18:0,stack?-.12+k*.035:upright?-.18:[-.34,.26][k%2]+row*.08,0],bounds=fixedSampleBounds(sample.id,turn,scale),x=xs[row][group]+(stack?k*.009:paired?k*.27:0),z=2.82+(paired&&k%2?.055:0)+(upright?-.07:0);
 return {...sample,scale,turn,at:[x,[1.0025,1.5225,2.2825][row]+.001-bounds.min+(stack?k*bounds.height:0),z]};
}
const box=(size:V3,at:V3,color:string,role:NativeSurface['role']='paper'):NativeSurface=>({shape:'box',size,at,color,role});
/** Open boxes have wall thickness and a visible cavity, not a dark painted lid. */
function openBox(at:V3,w:number,h:number,d:number):NativeSurface[]{const[x,y,z]=at,t=.013,c='#C3AE89',out:NativeSurface[]=[box([w,t,d],[x,y+t/2,z],c),box([t,h,d],[x-w/2+t/2,y+h/2,z],c),box([t,h,d],[x+w/2-t/2,y+h/2,z],c),box([w-t*2,h,t],[x,y+h/2,z+d/2-t/2],c)];
 // A real hand slot through the front wall separates rim from the lower panel.
 const hole=.13,slot=.025;out.push(box([w-t*2,h-.039,t],[x,y+(h-.039)/2,z-d/2+t/2],c),box([w-t*2,.014,t],[x,y+h-.007,z-d/2+t/2],c));for(const side of[-1,1])out.push(box([(w-t*2-hole)/2,slot,t],[x+side*(hole/2+(w-t*2-hole)/4),y+h-.014-slot/2,z-d/2+t/2],c));return out;
}
export function mixedWorkProps():NativeSurface[]{
 const out:NativeSurface[]=[];
 // Existing low storage replaced by useful open archive baskets, within the
 // actual central lower shelf and window cabinet centre bay. Floor/paths clear.
 out.push(...openBox([.10,.3385,-.06],1.10,.20,.64),...openBox([-2.175,.577,1.10],.46,.16,.51));
 // Three paper work bays break the long shelf into unequal high/low clusters.
 for(const[x,y,w]of[[-2.35,1.0035,.43],[-.43,1.5235,.42],[-.20,2.2835,.35]]){
  out.push(box([w,.018,.29],[x,y+.009,2.86],'#B69A73'),box([.018,.22,.29],[x-w/2+.009,y+.11,2.86],'#B69A73'),box([.018,.22,.29],[x+w/2-.009,y+.11,2.86],'#B69A73'),box([w,.22,.018],[x,y+.11,2.996],'#B69A73'));
  for(let j=0;j<3;j++){const height=.28+j%2*.035;out.push(box([w-.07,height,.012],[x+(j-1)*.014,y+.019+height/2,2.78+j*.055],j===1?'#EDE4D1':'#70897C',j===1?'paper':'fabric'));}
 }
 // A blank index card sits ON the existing three-book central work pile,
 // giving a readable white middle mass without becoming stock or a quest label.
 const bookTop=artDirection.displaySurfaceY+.001+3*fixedSampleBounds('off.notebook',[0,-.10,0],.85).height;out.push(box([.15,.012,.06],[-.49,bookTop+.007,-.35],'#B69A73'),box([.16,.20,.004],[-.49,bookTop+.114,-.35],'#EDE4D1'));
 // Counter correspondence tray by the actual work area, outside handoff bay.
 out.push(...openBox([2.52,1.112,-1.25],.32,.11,.23));
 for(let j=0;j<3;j++){const h=.20+j*.025;out.push(box([.24,h,.008],[2.52,1.126+h/2,-1.31+j*.045],j===1?'#70897C':'#EDE4D1',j===1?'fabric':'paper'));}
 return out;
}
/** Keep C20 flowers/ivy/model core intact. Remove only the retired six closed
 * storage boxes and use a coherent paper/white palette for the mixed assembly. */
export function composeMixedStyling(core:NativeSurface[]):NativeSurface[]{
 const parts=[...core.filter(p=>!(p.role==='paper'&&['#C3AE89','#B69A73'].includes(p.color))),...mixedWorkProps()].map(p=>p.role==='paint'&&['#FFF8E8','#F8EEDD'].includes(p.color)?{...p,color:'#FFF5E5'}:p);
 return nativeGrouped(parts).map(g=>({shape:'mesh',at:[0,0,0],geometry:Object.fromEntries(Object.entries(g.geometry).map(([k,v])=>[k,v.map((n:number)=>n===0?0:n)])) as unknown as ReturnType<typeof nativeSurfaceGeometry>,color:g.color,role:g.role,alpha:g.alpha,roughness:g.roughness,...(g.finish?{finish:g.finish}:{}),...(g.baseColorTexture?{baseColorTexture:g.baseColorTexture}:{})}));
}
