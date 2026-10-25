/** Original fixed shop styling, not inventory grants or new catalogue entries.
 * Real indexed recipe geometry; metres/RH/Y-up. No sale/quest authority.
 * Fixed vignettes live outside customer corridors and interactive tabletop stock.
 */
import type {Part,V3} from './recipes';
const p=(shape:Part['shape'],size:V3,at:V3,color:string,role:Part['role']='wood',extra:Partial<Part>={}):Part=>({shape,size,at,color,role,...extra});
export function nativeStylingRecipe():Part[]{
 const out:Part[]=[];
 // Quiet wall panelling and cap rails give the large wall a material hierarchy.
 for(const x of [-3.48,-2.48,-1.48,-.48,.52,1.52])out.push(p('box',[.018,.79,.025],[x,.56,3.205],'#C7AF92'));
 out.push(p('round',[6.10,.055,.055],[-.73,.97,3.185],'#CDB395','wood',{radius:.008}));
 // The existing window gets wood-lined reveals, a soft blind and a linen pull.
 out.push(p('round',[.24,.11,3.40],[-4.32,2.88,0],'#AE825D','wood',{radius:.018}),p('round',[.018,.145,3.12],[-4.28,2.76,0],'#D9C9A7','fabric',{radius:.006}));
 // Fixed display storage is furniture dressing, deliberately not product models.
 for(const [x,z]of [[-2,-1.5],[.1,-.1],[-2,1.1]])for(let k=0;k<2;k++){
  out.push(p('round',[.45,.22,.54],[x-.29+k*.55,.46,z+.04],k?'#B59771':'#BDA789','paper',{radius:.018}),p('box',[.38,.016,.012],[x-.29+k*.55,.51,z-.237],'#E4D6B9','paper'));
 }
 // Window ledge: an original ceramic vase with airy stems, not a collectible.
 out.push(p('sphere',[.22,.27,.22],[-4.18,1.02,-.91],'#8C9F90','ceramic'),p('cylinder',[.105,.13,.105],[-4.18,1.20,-.91],'#8C9F90','ceramic',{top:.8}));
 for(let i=0;i<5;i++){
  const z=-.91+(i-2)*.075,y=1.37+i%3*.055;
  out.push(p('cylinder',[.009,.31,.009],[-4.18,y-.11,z],'#8A9270','wood',{top:.5,turn:[(i-2)*.14,0,.15]}),p('sphere',[.072,.052,.072],[-4.20,y+.06,z],'#F0E4C7','leaf'));
 }
 // Trailing ivy at the existing upper shelf, anchored on the shelf surface.
 out.push(p('cylinder',[.25,.23,.25],[1.48,2.40,2.86],'#C7AB85','ceramic',{top:1.15}));
 for(let i=0;i<12;i++){
  const y=2.44-i*.056,x=1.48+Math.sin(i*.64)*.11,z=2.60+Math.cos(i*.64)*.035;
  out.push(p('leaf',[.15,.21,.027],[x,y,z],i%3?'#79936A':'#A4B183','leaf',{turn:[.12,Math.sin(i)*.7,Math.sin(i*.7)*.6]}));
 }
 return out;
}
/** Airy branching canopy outside the existing window, never new terrain. */
export function nativeWindowCanopy():Part[]{
 const out:Part[]=[];
 for(let i=0;i<26;i++){
  const a=i*2.39996,y=1.48+(i%5)*.15,z=Math.cos(a)*1.27,x=-5.51+Math.sin(a)*.38;
  out.push(p('leaf',[.31+(i%3)*.07,.45,.065],[x,y,z],['#91AA76','#BBC794','#A5BA85'][i%3],'leaf',{turn:[.4*Math.sin(a),a,Math.sin(a)*1.1]}));
 }
 return out;
}
