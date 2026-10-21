// Original W1.1A geometry authoring source. Metres, right handed, Y-up, local floor pivot.
// Engine-neutral recipes feed both runtime meshes and versioned interchange GLBs.
import type {MaterialRole} from './materials';
export type V3 = [number,number,number];
export interface Part {shape:'box'|'round'|'sphere'|'cylinder'|'torus';size:V3;at:V3;color:string;role?:MaterialRole;turn?:V3;radius?:number;top?:number;alpha?:number;open?:boolean;inside?:boolean;segments?:number;arc?:[number,number];}
export const palette={cream:'#F0E6D8',wood:'#B78E67',edge:'#D6B58E',dark:'#735B48',lavender:'#BDA9CC',sage:'#7B9783',ivory:'#FFF7E9',clay:'#C28F73',ink:'#443B3C'};
const p=(shape:Part['shape'],size:V3,at:V3,color:string,extra:Partial<Part>={}):Part=>({shape,size,at,color,role:'paint',...extra});
const round=(size:V3,at:V3,color:string,radius=.035,role:MaterialRole='wood')=>p('round',size,at,color,{radius,role});
export function productRecipe(id:string,color=palette.lavender):Part[]{
 switch(id){
 case 'off.notebook':return [
  round([.34,.012,.45],[0,.006,0],color,.005,'fabric'),round([.34,.012,.45],[0,.056,0],color,.005,'fabric'),
  p('box',[.307,.038,.423],[.007,.031,.002],palette.ivory,{role:'paper'}),
  ...[.021,.031,.041].map(y=>p('box',[.302,.0018,.003],[.008,y,-.211],'#D9D0BF',{role:'paper'})),
  round([.025,.062,.45],[-.158,.031,0],color,.008,'fabric'),
  p('box',[.14,.002,.072],[.020,.063,-.07],palette.ivory,{role:'paper'}),
  p('box',[.010,.003,.438],[.105,.064,0],palette.sage,{role:'fabric'}),
  p('box',[.035,.002,.006],[.02,.065,-.07],palette.dark,{role:'ink'})];
 case 'off.pencil':return [
  p('cylinder',[.042,.43,.042],[0,.026,0],color,{turn:[0,0,Math.PI/2],top:1,role:'paint'}),
  p('cylinder',[.042,.075,.042],[.2525,.026,0],palette.edge,{turn:[0,0,-Math.PI/2],top:0,role:'wood'}),
  p('cylinder',[.010,.022,.010],[.289,.026,0],palette.ink,{turn:[0,0,-Math.PI/2],top:0,role:'ink'}),
  p('cylinder',[.045,.030,.045],[-.230,.026,0],'#D5C4A7',{turn:[0,0,Math.PI/2],top:1,role:'metal'}),
  p('cylinder',[.044,.038,.044],[-.264,.026,0],'#CBA6A5',{turn:[0,0,Math.PI/2],top:1,role:'fabric'})];
 case 'off.mug':return [
  p('cylinder',[.235,.235,.235],[0,.1175,0],color,{top:1,open:true,role:'ceramic'}),
  p('cylinder',[.197,.205,.197],[0,.1325,0],palette.ivory,{top:1,open:true,inside:true,role:'ceramic'}),
  p('cylinder',[.235,.030,.235],[0,.015,0],color,{top:1,role:'ceramic'}),
  p('cylinder',[.195,.003,.195],[0,.032,0],palette.ivory,{top:1,role:'ceramic'}),
  p('torus',[.235,.019,.235],[0,.235,0],palette.ivory,{role:'ceramic',segments:12}),
  p('torus',[.178,.028,.165],[.155,.125,0],color,{turn:[Math.PI/2,0,0],arc:[-2.2,2.2],segments:28,role:'ceramic'})];
 case 'off.tote':return [
  round([.32,.285,.095],[0,.147,0],color,.026,'fabric'),
  p('torus',[.19,.025,.19],[0,.30,-.028],palette.edge,{turn:[Math.PI/2,0,0],role:'fabric'}),
  p('torus',[.19,.025,.19],[0,.30,.028],palette.edge,{turn:[Math.PI/2,0,0],role:'fabric'}),
  p('box',[.13,.085,.004],[0,.15,-.049],palette.ivory,{role:'fabric'}),
  p('box',[.040,.054,.005],[0,.15,-.052],palette.sage,{role:'ink'}),
  ...[-.139,.139].map(x=>p('box',[.003,.225,.003],[x,.15,-.049],'#AE9D86',{role:'fabric'})),
  p('box',[.282,.003,.003],[0,.037,-.049],'#AE9D86',{role:'fabric'})];
 case 'off.tea':return [p('cylinder',[.23,.29,.23],[0,.145,0],color,{top:1,role:'metal'}),p('cylinder',[.25,.025,.25],[0,.30,0],palette.edge,{top:1,role:'metal'}),p('box',[.13,.13,.006],[0,.15,-.116],palette.ivory,{role:'paper'}),p('box',[.04,.07,.008],[0,.15,-.12],palette.sage,{role:'ink'})];
 case 'off.cookie':return [round([.29,.09,.23],[0,.045,0],palette.edge,.018,'paper'),p('cylinder',[.18,.018,.18],[0,.10,0],color,{top:1,role:'paint'}),...[[-.04,-.04],[.04,-.03],[0,.04]].map(([x,z])=>p('sphere',[.023,.01,.023],[x,.113,z],palette.dark,{role:'paint'}))];
 case 'off.card':return [round([.28,.014,.38],[0,.008,0],palette.ivory,.007,'paper'),p('box',[.23,.004,.23],[0,.018,-.025],color,{role:'ink'}),p('sphere',[.10,.005,.10],[-.04,.022,-.045],palette.clay,{role:'ink'}),p('box',[.14,.003,.008],[0,.023,.13],palette.dark,{role:'ink'})];
 case 'off.towel':return [round([.33,.09,.27],[0,.045,0],color,.035,'fabric'),round([.32,.065,.25],[0,.11,0],color,.025,'fabric'),p('box',[.065,.16,.278],[0,.08,0],palette.ivory,{role:'paper'})];
 case 'off.tray':return [round([.38,.025,.29],[0,.016,0],color,.012),...[[-.184,0],[.184,0]].map(([x,z])=>round([.02,.055,.29],[x,.034,z],palette.dark,.009)),...[[-.135],[.135]].map(([z])=>round([.38,.055,.02],[0,.034,z],palette.dark,.009))];
 default:return [p('sphere',[.24,.29,.24],[0,.145,0],color,{role:'ceramic'}),p('cylinder',[.12,.13,.12],[0,.315,0],color,{top:.8,role:'ceramic'}),p('torus',[.11,.018,.11],[0,.385,0],palette.edge,{role:'ceramic'})];
 }
}
export function plantRecipe(scale=1):Part[]{return [p('cylinder',[.34,.33,.34],[0,.165,0],palette.clay,{top:1.2,role:'ceramic'}),p('cylinder',[.30,.02,.30],[0,.335,0],palette.dark,{top:1,role:'paint'}),p('cylinder',[.025,.58,.025],[0,.60,0],palette.dark,{top:1,role:'wood'}),...Array.from({length:7},(_,i)=>{const a=i*2.4;return p('sphere',[.17,.36,.075],[Math.sin(a)*.15,.48+i*.06,Math.cos(a)*.14],i%2?palette.sage:'#94AC85',{turn:[.3*Math.cos(a),a,.5*Math.sin(a)],role:'leaf'});})].map(q=>({...q,size:q.size.map(x=>x*scale) as V3,at:q.at.map(x=>x*scale) as V3}));}
export function displayRecipe():Part[]{return [round([1.58,.105,.95],[0,.94,0],palette.edge,.035),round([1.40,.10,.77],[0,.80,0],palette.wood,.025),round([1.38,.08,.76],[0,.23,0],palette.wood,.02),...[-.59,.59].flatMap(x=>[-.28,.28].map(z=>round([.085,.72,.085],[x,.50,z],palette.dark,.015))),p('cylinder',[.035,.15,.035],[.56,1.07,-.34],palette.dark,{top:1,role:'metal'}),round([.24,.135,.025],[.56,1.18,-.34],palette.ivory,.012,'paper')];}
export function counterRecipe():Part[]{return [round([1.9,.16,.92],[0,.95,0],palette.edge,.045),round([1.73,.74,.72],[0,.51,0],palette.wood,.035),p('box',[1.55,.59,.025],[0,.54,-.375],palette.cream,{role:'paint'}),...[-.65,-.22,.22,.65].map(x=>p('box',[.014,.50,.035],[x,.54,-.40],palette.edge,{role:'wood'})),round([.42,.11,.36],[.42,1.08,0],palette.ink,.025,'metal'),round([.35,.25,.055],[.42,1.24,.08],palette.dark,.02,'paint'),p('box',[.28,.17,.012],[.42,1.25,.045],'#8AADA5',{role:'glass',alpha:.90}),round([.28,.028,.22],[-.40,1.05,0],palette.ivory,.015,'paper')];}
export interface PersonPart {id:'body'|'head'|'arm-left'|'arm-right';pivot:V3;recipe:Part[];}
export function personParts(color:string):PersonPart[]{
 const body:Part[]=[p('cylinder',[.35,.54,.27],[0,.57,0],color,{top:.8,role:'fabric'}),round([.28,.34,.065],[0,.52,-.145],palette.ivory,.025,'fabric'),round([.13,.11,.012],[0,.50,-.183],palette.edge,.01,'fabric'),...[-.105,.105].flatMap(x=>[p('cylinder',[.105,.28,.105],[x,.19,0],palette.dark,{top:1,role:'fabric'}),round([.13,.10,.21],[x,.065,-.035],palette.dark,.04,'fabric')]),...[-.105,.105].map(x=>p('box',[.025,.28,.018],[x,.70,-.14],palette.edge,{role:'fabric'}))];
 const head:Part[]=[p('sphere',[.42,.39,.39],[0,1.07,0],'#E8C8AB',{role:'skin'}),p('sphere',[.44,.24,.40],[0,1.22,.026],palette.dark,{role:'hair'}),...[-.11,0,.11].map((x,i)=>p('sphere',[.16,.13,.115],[x,1.17+(i===1?.015:0),-.155],palette.dark,{turn:[0,0,x*.8],role:'hair'})),...[-.085,.085].flatMap(x=>[p('sphere',[.030,.042,.014],[x,1.066,-.192],palette.ink,{role:'ink'}),p('sphere',[.009,.012,.005],[x-.004,1.078,-.201],palette.ivory,{role:'ink'}),p('sphere',[.052,.017,.008],[x*1.35,1.012,-.181],'#D89E94',{role:'skin'})]),p('sphere',[.043,.012,.014],[0,.990,-.191],'#B67473',{role:'ink'})];
 const arm=(side:-1|1):Part[]=>[p('cylinder',[.10,.31,.10],[side*.22,.69,0],color,{top:1,turn:[0,0,side*-.13],role:'fabric'}),p('sphere',[.095,.105,.09],[side*.24,.50,0],'#E8C8AB',{role:'skin'})];
 return [{id:'body',pivot:[0,0,0],recipe:body},{id:'head',pivot:[0,.88,0],recipe:head},{id:'arm-left',pivot:[-.20,.84,0],recipe:arm(-1)},{id:'arm-right',pivot:[.20,.84,0],recipe:arm(1)}];
}
export function personRecipe(color:string):Part[]{return personParts(color).flatMap(x=>x.recipe);}
export function roomRecipe():Part[]{
 const a:Part[]=[round([10,.36,8],[0,-.24,0],'#D9C5B3',.14),round([9.1,.14,6.7],[0,-.015,0],palette.edge,.04),p('box',[9.1,3.5,.16],[0,1.75,3.3],palette.cream),p('box',[.16,.9,6.6],[-4.5,.45,0],palette.cream),p('box',[.16,.7,6.6],[-4.5,3.15,0],palette.cream),p('box',[.16,1.9,1.8],[-4.5,1.85,2.4],palette.cream),p('box',[.16,1.9,1.8],[-4.5,1.85,-2.4],palette.cream),p('box',[9.05,.13,.08],[0,.16,3.19],palette.edge),p('box',[.08,.13,6.55],[-4.39,.16,0],palette.edge),round([2.15,.028,1.05],[2.45,.08,1.82],palette.sage,.13,'fabric'),round([1.58,2.62,.14],[3.05,1.4,3.16],palette.wood,.045),p('box',[1.31,2.35,.045],[3.05,1.4,3.075],'#BCCAC8',{role:'glass',alpha:.65}),p('sphere',[.065,.065,.09],[2.58,1.35,3.02],palette.dark)];
 for(let x=-4.25;x<4.4;x+=.55)a.push(p('box',[.53,.018,6.45],[x,.07,0],Math.round(x*10)%2? '#CFAD86':'#D6B993',{role:'wood'}));
 // The side window is a real opening, not an opaque painted rectangle.
 for(const z of [-1.52,0,1.52])a.push(p('box',[.12,1.94,.07],[-4.40,1.84,z],palette.wood,{role:'wood'}));
 for(const y of [.88,1.84,2.8])a.push(p('box',[.12,.075,3.1],[-4.40,y,0],palette.wood,{role:'wood'}));
 a.push(p('box',[.035,1.8,2.9],[-4.47,1.84,0],'#D6E5DC',{alpha:.16,role:'glass'}),round([.42,.08,3.3],[-4.22,.86,0],palette.edge,.025));
 for(const y of [1.47,2.23]){a.push(round([5.2,.105,.63],[-.8,y,2.85],palette.wood,.025));for(const x of [-3.1,1.5])a.push(p('box',[.045,.26,.52],[x,y-.17,2.86],palette.dark));}
 a.push(round([2.4,.42,.5],[-.9,.34,2.92],palette.wood,.035));
 // Quiet framing: two neutral botanical prints, no invented canon signs.
 for(const x of [-2.7,-1.7])a.push(round([.62,.70,.06],[x,2.97,3.16],palette.wood,.015),p('box',[.53,.61,.018],[x,2.97,3.12],palette.ivory,{role:'paper'}),p('sphere',[.16,.29,.012],[x,2.98,3.105],palette.sage,{turn:[0,0,-.25],role:'ink'}));
 // Static pendant shades, no dynamic point-light costs.
 for(const x of [-2,1.3])a.push(p('cylinder',[.014,.6,.014],[x,3.12,.6],palette.dark,{top:1}),p('cylinder',[.45,.23,.45],[x,2.75,.6],palette.ivory,{top:.45}),p('sphere',[.19,.07,.19],[x,2.64,.6],'#F8DDA5'));
 return a;
}
