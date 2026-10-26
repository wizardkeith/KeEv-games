/** C37 form-only authoring gate. No player setting or default adoption.
 * The accepted C36 table/cashier, lighting, routes and actual stock stay intact. */
import type {NativeSurface} from './native-characters';
import {fixedSampleBounds} from './decor-vignette-v11';
import type {V3} from './recipes';
const requested=import.meta.env?.VITE_V11_BACKWALL_FORMS;
export const backwallFormMode=requested==='shape'||requested==='gray'||requested==='old-gray'?requested:'control';
export const backwallNewForms=backwallFormMode==='shape'||backwallFormMode==='gray';
export const backwallGray=backwallFormMode==='gray'||backwallFormMode==='old-gray';
export const backwallFormIntent={id:'v11.c37.backwall-window-form',mode:backwallFormMode,defaultAdopted:false,scope:'Only fixed back-wall showroom dressing and right-window exterior; C36 table/cashier/camera/lights/routes unchanged',grayColor:'#A5A5A5',limits:'Form gate only; no new material standard, target acceptance, economic authority or public adoption'}as const;
/** One genuinely untextured PBR gray, scoped BEFORE batching. No shared global
 * wood/leaf override that would recolor the accepted central table or cashier. */
export function backwallFormSurfaces(parts:NativeSurface[]):NativeSurface[]{
 if(!backwallGray)return parts;
 return parts.map(({baseColorTexture:_,finish:__,...p})=>({...p,color:'#A5A5A5',role:'paint',roughness:.801,alpha:1}));
}
interface Sample{id:string;at:V3;turn:V3;scale:number}
export function backwallSample<T extends Sample>(old:T,row:number,group:number,k:number):T{
 if(!backwallNewForms||old.at[2]<2)return old;
 const xs=[[-2.85,-2.23,-2.94,-.98,-1.27,-2.00,.40],[-2.93,-1.88,-2.27,-1.08,.60,-.24,1.35],[-2.64,-2.08,-.88,-1.18,.85,.36,-.25]];
 const stack=['off.notebook','off.towel','off.cookie'].includes(old.id),paired=['off.mug','off.tea'].includes(old.id),card=old.id==='off.card';
 const scale=old.id==='off.vase'?1.02:old.id==='off.tote'?.78:old.scale;
 const turn:V3=[card?-1.22:0,card?[.14,-.16,.22][row]:stack?-.12+k*.035:[-.38,.23][k%2]+row*.10,0];
 const bounds=fixedSampleBounds(old.id,turn,scale);
 return {...old,turn,scale,at:[xs[row][group]+(stack?k*.009:paired?k*.255:0),[1.0025,1.5225,2.2825][row]+.001-bounds.min+(stack?k*bounds.height:0),2.82+(paired&&k%2?.055:0)+(card?-.065:0)]};
}
/** The three EXISTING paper work bays acquire distinct tall/low silhouettes.
 * Central/counter paperwork is deliberately handled outside this transform. */
export const backwallBays=[{x:-.20,y:1.0035,w:.48,heights:[.30,.37,.34],turn:-.13},{x:-2.18,y:1.5235,w:.42,heights:[.40,.32,.46],turn:.15},{x:-1.48,y:2.2835,w:.36,heights:[.34,.46,.39],turn:-.18}]as const;
