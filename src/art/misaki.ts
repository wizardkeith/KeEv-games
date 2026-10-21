// Day 1 original visual proposal. Bible fixes service / regulars / cozy, not this appearance.
// Engine-neutral metres, RH +Y up, character faces -Z. No skeletal rig is claimed.
import type {Part,PersonPart,V3} from './recipes';
import type {MaterialRole} from './materials';

export type MisakiExpression='calm'|'smile';
export const misakiIdentity={id:'actor.misaki.day1.v1',economicBinding:'staff.graybox',name:'Misaki',version:1,role:'service / regulars / cozy',appearance:'original Day 1 proposal; not a prescribed Bible character sheet',floor:.015,height:1.48,headHeight:.4} as const;
export const misakiPalette={hair:'#57443D',hairLight:'#725447',skin:'#E7BA9D',cheek:'#D7978F',ink:'#433B40',iris:'#756651',cardigan:'#688879',cuff:'#91AA98',apron:'#F1E5CF',seam:'#C9B89D',skirt:'#84708B',shoe:'#5C5050',pin:'#C6AF77',cream:'#FFF6E8'} as const;
const p=(shape:Part['shape'],size:V3,at:V3,color:string,role:MaterialRole,extra:Partial<Part>={}):Part=>({shape,size,at,color,role,...extra});
const round=(size:V3,at:V3,color:string,radius=.02,role:MaterialRole='fabric')=>p('round',size,at,color,role,{radius});

/** Anatomical roots have exactly the existing PersonPart contract; recipes use actor coordinates. */
export function misakiParts(expression:MisakiExpression='calm'):PersonPart[]{
 const c=misakiPalette;
 const body:Part[]=[
  // Longer silhouette, flared skirt and separate cardigan/apron layers distinguish the generic model.
  p('cylinder',[.43,.40,.31],[0,.62,0],c.skirt,'fabric',{top:.77}),
  p('cylinder',[.39,.34,.29],[0,.93,0],c.cardigan,'fabric',{top:.88}),
  ...[-1,1].map(s=>round([.09,.31,.032],[s*.12,.94,-.139],c.cuff,.013)),
  round([.25,.44,.052],[0,.73,-.166],c.apron,.025),
  round([.19,.19,.049],[0,.975,-.163],c.apron,.022),
  ...[-1,1].map(s=>round([.029,.25,.024],[s*.092,1.01,-.162],c.apron,.01)),
  round([.15,.12,.025],[0,.70,-.202],c.seam,.016),
  round([.137,.098,.009],[0,.708,-.219],c.apron,.011),
  // Single stitched leaf pocket mark; no raster/brand texture dependency.
  p('sphere',[.032,.055,.010],[.018,.721,-.226],c.cardigan,'fabric',{turn:[0,0,-.45]}),
  ...[-1,1].map(s=>round([.015,.32,.012],[s*.101,.70,-.196],c.seam,.006)),
  ...[-1,1].flatMap(s=>[
   p('cylinder',[.095,.32,.095],[s*.105,.27,0],c.cream,'fabric'),
   round([.14,.09,.23],[s*.105,.06,-.035],c.shoe,.036),
   round([.13,.022,.22],[s*.105,.027,-.035],c.ink,.009),
   round([.10,.022,.06],[s*.105,.105,-.070],c.seam,.009)
  ]),
  p('cylinder',[.105,.095,.095],[0,1.105,-.005],c.skin,'skin'),
  // Soft turned collar, small cardigan buttons and waist tie.
  ...[-1,1].map(s=>round([.10,.043,.033],[s*.056,1.082,-.128],c.cream,.012,'fabric')),
  ...[.91,1.01].map(y=>p('sphere',[.018,.018,.012],[.137,y,-.154],c.pin,'paint')),
  round([.38,.038,.045],[0,.83,.15],c.apron,.012)
 ];
 const head:Part[]=[
  p('sphere',[.40,.40,.35],[0,1.24,-.025],c.skin,'skin'),
  // Rounded bob back, two sculpted cheek-length panels and a low side knot.
  p('sphere',[.44,.40,.28],[0,1.25,.085],c.hair,'hair'),
  p('sphere',[.44,.21,.39],[0,1.375,.025],c.hair,'hair'),
  ...[-1,1].map(s=>p('sphere',[.125,.31,.25],[s*.185,1.255,.005],c.hair,'hair',{turn:[0,0,s*.08]})),
  p('sphere',[.18,.19,.17],[.238,1.19,.08],c.hair,'hair'),
  p('torus',[.115,.016,.105],[.255,1.18,.035],c.apron,'fabric',{turn:[Math.PI/2,0,-.3],segments:12}),
  ...[-.12,-.025,.075].map((x,i)=>p('sphere',[.14,.15+(i===0?.025:0),.075],[x,1.38-(i===0?.015:0),-.158],i===2?c.hairLight:c.hair,'hair',{turn:[0,0,-.33]})),
  // Ivory leaf clip is readable in the silhouette near the left temple.
  p('sphere',[.036,.092,.024],[-.192,1.383,-.127],c.pin,'paint',{turn:[0,0,-.45]}),
  p('sphere',[.034,.071,.024],[-.224,1.369,-.125],c.cream,'paint',{turn:[0,0,.55]}),
  ...[-1,1].map(s=>p('sphere',[.055,.085,.06],[s*.201,1.222,-.025],c.skin,'skin')),
  ...[-1,1].flatMap(s=>[
   // Calm open eyes / smiling crescent lids are separately authored geometry.
   ...(expression==='calm'?[
    p('sphere',[.043,.060,.012],[s*.079,1.251,-.194],c.ink,'ink'),
    p('sphere',[.027,.042,.008],[s*.079,1.245,-.202],c.iris,'ink'),
    p('sphere',[.013,.017,.006],[s*.079-.008,1.263,-.208],c.cream,'ink')
   ]:[
    p('torus',[.065,.009,.052],[s*.079,1.238,-.201],c.ink,'ink',{turn:[-Math.PI/2,0,0],arc:[.22,Math.PI-.22],segments:12})
   ]),
   p('sphere',[.055,.012,.010],[s*.078,1.307,-.195],c.hair,'hair',{turn:[0,0,s*.08]}),
   p('sphere',[.066,.025,.010],[s*.115,1.195,-.201],c.cheek,'skin')
  ]),
  p('sphere',[.028,.028,.023],[0,1.224,-.202],c.skin,'skin'),
  expression==='smile'
   ?p('torus',[.065,.010,.046],[0,1.180,-.194],c.ink,'ink',{turn:[-Math.PI/2,0,0],arc:[Math.PI+.2,2*Math.PI-.2],segments:12})
   :p('sphere',[.038,.010,.008],[0,1.172,-.193],c.cheek,'ink')
 ];
 const arm=(s:-1|1):Part[]=>[
  p('cylinder',[.13,.29,.13],[s*.24,.95,0],c.cardigan,'fabric',{top:1.02,turn:[0,0,s*-.16]}),
  p('cylinder',[.135,.052,.135],[s*.263,.817,0],c.cuff,'fabric',{turn:[0,0,s*-.16]}),
  p('sphere',[.10,.12,.095],[s*.27,.75,-.006],c.skin,'skin'),
  p('sphere',[.043,.060,.042],[s*.233,.755,-.035],c.skin,'skin')
 ];
 return [{id:'body',pivot:[0,0,0],recipe:body},{id:'head',pivot:[0,1.08,0],recipe:head},{id:'arm-left',pivot:[-.21,1.08,0],recipe:arm(-1)},{id:'arm-right',pivot:[.21,1.08,0],recipe:arm(1)}];
}

export type MisakiGesture='greet'|'sale';
/** Pure normalized clip sample. Owner cancels on hide / skip / mode / import / epoch changes. */
export function misakiPose(gesture:MisakiGesture,progress:number){
 const neutral={headTilt:0,armLeft:0,armRight:0};
 if(!Number.isFinite(progress)||progress<=0||progress>=1)return neutral;
 const envelope=Math.sin(Math.PI*progress);
 return {headTilt:(gesture==='sale'?.10:.045)*envelope,armLeft:gesture==='sale'?.08*envelope:0,armRight:gesture==='greet'?-.55*envelope*(.88+.12*Math.sin(progress*Math.PI*4)):-.08*envelope};
}
