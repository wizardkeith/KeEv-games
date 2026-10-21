// Original W1.1 geometry authoring source. Metres, right handed, Y-up, local floor pivot.
// No engine types: the same recipes feed Babylon geometry and interchange GLB exports.
export type V3 = [number,number,number];
export interface Part { shape:'box'|'round'|'sphere'|'cylinder'|'torus'; size:V3; at:V3; color:string; turn?:V3; radius?:number; top?:number; alpha?:number; }
export const palette={cream:'#F0E6D8',wood:'#B78E67',edge:'#D6B58E',dark:'#735B48',lavender:'#BDA9CC',sage:'#7B9783',ivory:'#FFF7E9',clay:'#C28F73',ink:'#443B3C'};
const p=(shape:Part['shape'],size:V3,at:V3,color:string,extra:Partial<Part>={}):Part=>({shape,size,at,color,...extra});
const round=(size:V3,at:V3,color:string,radius=.035)=>p('round',size,at,color,{radius});
export function productRecipe(id:string,color=palette.lavender):Part[]{
 switch(id){
 case 'off.notebook':return [round([.33,.055,.44],[0,.03,0],color,.016),p('box',[.285,.028,.405],[.01,.034,.004],palette.ivory),p('box',[.025,.064,.44],[-.152,.034,0],palette.dark),p('box',[.15,.003,.08],[.025,.065,-.07],palette.ivory),p('box',[.015,.004,.43],[.09,.067,0],palette.sage)];
 case 'off.pencil':return [p('cylinder',[.036,.45,.036],[0,.035,0],color,{turn:[0,0,Math.PI/2],top:1}),p('cylinder',[.036,.065,.036],[.257,.035,0],palette.edge,{turn:[0,0,-Math.PI/2],top:0}),p('cylinder',[.012,.028,.012],[.30,.035,0],palette.ink,{turn:[0,0,-Math.PI/2],top:0}),p('cylinder',[.039,.045,.039],[-.247,.035,0],'#CCA7AA',{turn:[0,0,Math.PI/2],top:1})];
 case 'off.mug':return [p('cylinder',[.22,.23,.22],[0,.115,0],color,{top:1}),p('cylinder',[.174,.006,.174],[0,.233,0],palette.dark,{top:1}),p('torus',[.205,.026,.205],[0,.235,0],palette.ivory),p('torus',[.145,.028,.145],[.137,.125,0],color,{turn:[0,0,Math.PI/2]})];
 case 'off.tote':return [round([.32,.29,.09],[0,.145,0],color,.026),p('torus',[.20,.022,.20],[0,.30,-.023],palette.edge,{turn:[Math.PI/2,0,0]}),p('torus',[.20,.022,.20],[0,.30,.023],palette.edge,{turn:[Math.PI/2,0,0]}),p('box',[.12,.085,.005],[0,.15,-.048],palette.ivory),p('box',[.045,.06,.007],[0,.15,-.052],palette.sage)];
 case 'off.tea':return [p('cylinder',[.23,.29,.23],[0,.145,0],color,{top:1}),p('cylinder',[.25,.025,.25],[0,.30,0],palette.edge,{top:1}),p('box',[.13,.13,.006],[0,.15,-.116],palette.ivory),p('box',[.04,.07,.008],[0,.15,-.12],palette.sage)];
 case 'off.cookie':return [round([.29,.09,.23],[0,.045,0],palette.edge,.018),p('cylinder',[.18,.018,.18],[0,.10,0],color,{top:1}),...[[-.04,-.04],[.04,-.03],[0,.04]].map(([x,z])=>p('sphere',[.023,.01,.023],[x,.113,z],palette.dark))];
 case 'off.card':return [round([.28,.014,.38],[0,.008,0],palette.ivory,.007),p('box',[.23,.004,.23],[0,.018,-.025],color),p('sphere',[.10,.005,.10],[-.04,.022,-.045],palette.clay),p('box',[.14,.003,.008],[0,.023,.13],palette.dark)];
 case 'off.towel':return [round([.33,.09,.27],[0,.045,0],color,.035),round([.32,.065,.25],[0,.11,0],color,.025),p('box',[.065,.16,.278],[0,.08,0],palette.ivory)];
 case 'off.tray':return [round([.38,.025,.29],[0,.016,0],color,.012),...[[-.184,0],[.184,0]].map(([x,z])=>round([.02,.055,.29],[x,.034,z],palette.dark,.009)),...[[-.135],[.135]].map(([z])=>round([.38,.055,.02],[0,.034,z],palette.dark,.009))];
 default:return [p('sphere',[.24,.29,.24],[0,.145,0],color),p('cylinder',[.12,.13,.12],[0,.315,0],color,{top:.8}),p('torus',[.11,.018,.11],[0,.385,0],palette.edge)];
 }
}
export function plantRecipe(scale=1):Part[]{return [p('cylinder',[.34,.33,.34],[0,.165,0],palette.clay,{top:1.2}),p('cylinder',[.30,.02,.30],[0,.335,0],palette.dark,{top:1}),p('cylinder',[.025,.58,.025],[0,.60,0],palette.dark,{top:1}),...Array.from({length:7},(_,i)=>{const a=i*2.4;return p('sphere',[.17,.36,.075],[Math.sin(a)*.15,.48+i*.06,Math.cos(a)*.14],i%2?palette.sage:'#94AC85',{turn:[.3*Math.cos(a),a,.5*Math.sin(a)]});})].map(q=>({...q,size:q.size.map(x=>x*scale) as V3,at:q.at.map(x=>x*scale) as V3}));}
export function displayRecipe():Part[]{return [round([1.58,.105,.95],[0,.94,0],palette.edge,.035),round([1.40,.10,.77],[0,.80,0],palette.wood,.025),round([1.38,.08,.76],[0,.23,0],palette.wood,.02),...[-.59,.59].flatMap(x=>[-.28,.28].map(z=>round([.085,.72,.085],[x,.50,z],palette.dark,.015))),p('cylinder',[.035,.15,.035],[.56,1.07,-.34],palette.dark,{top:1}),round([.24,.135,.025],[.56,1.18,-.34],palette.ivory,.012)];}
export function counterRecipe():Part[]{return [round([1.9,.16,.92],[0,.95,0],palette.edge,.045),round([1.73,.74,.72],[0,.51,0],palette.wood,.035),p('box',[1.55,.59,.025],[0,.54,-.375],palette.cream),...[-.65,-.22,.22,.65].map(x=>p('box',[.014,.50,.035],[x,.54,-.40],palette.edge)),round([.42,.11,.36],[.42,1.08,0],palette.ink,.025),round([.35,.25,.055],[.42,1.24,.08],palette.dark,.02),p('box',[.28,.17,.012],[.42,1.25,.045],'#8AADA5'),round([.28,.028,.22],[-.40,1.05,0],palette.ivory,.015)];}
export function personRecipe(color:string):Part[]{return [p('cylinder',[.35,.54,.27],[0,.57,0],color,{top:.8}),round([.28,.34,.065],[0,.52,-.145],palette.ivory,.025),...[-.105,.105].flatMap(x=>[p('cylinder',[.105,.28,.105],[x,.19,0],palette.dark,{top:1}),round([.13,.10,.21],[x,.065,-.035],palette.dark,.04)]),p('sphere',[.42,.39,.39],[0,1.07,0],'#E8C8AB'),p('sphere',[.44,.26,.41],[0,1.22,.018],palette.dark),p('sphere',[.36,.11,.12],[0,1.17,-.165],palette.dark),...[-.085,.085].map(x=>p('sphere',[.023,.036,.012],[x,1.066,-.193],palette.ink)),p('sphere',[.055,.024,.014],[0,.991,-.192],'#B67473'),...[-.22,.22].map(x=>p('cylinder',[.10,.39,.10],[x,.65,0],color,{top:1,turn:[0,0,x>0?-.12:.12]}))];}
export function roomRecipe():Part[]{
 const a:Part[]=[round([10,.36,8],[0,-.24,0],'#D9C5B3',.14),round([9.1,.14,6.7],[0,-.015,0],palette.edge,.04),p('box',[9.1,3.5,.16],[0,1.75,3.3],palette.cream),p('box',[.16,.9,6.6],[-4.5,.45,0],palette.cream),p('box',[.16,.7,6.6],[-4.5,3.15,0],palette.cream),p('box',[.16,1.9,1.8],[-4.5,1.85,2.4],palette.cream),p('box',[.16,1.9,1.8],[-4.5,1.85,-2.4],palette.cream),p('box',[9.05,.13,.08],[0,.16,3.19],palette.edge),p('box',[.08,.13,6.55],[-4.39,.16,0],palette.edge),round([2.15,.028,1.05],[2.45,.08,1.82],palette.sage,.13),round([1.58,2.62,.14],[3.05,1.4,3.16],palette.wood,.045),p('box',[1.31,2.35,.045],[3.05,1.4,3.075],'#BCCAC8'),p('sphere',[.065,.065,.09],[2.58,1.35,3.02],palette.dark)];
 for(let x=-4.25;x<4.4;x+=.55)a.push(p('box',[.53,.018,6.45],[x,.07,0],Math.round(x*10)%2? '#CFAD86':'#D6B993'));
 // The side window is a real opening, not an opaque painted rectangle.
 for(const z of [-1.52,0,1.52])a.push(p('box',[.12,1.94,.07],[-4.40,1.84,z],palette.wood));
 for(const y of [.88,1.84,2.8])a.push(p('box',[.12,.075,3.1],[-4.40,y,0],palette.wood));
 a.push(p('box',[.035,1.8,2.9],[-4.47,1.84,0],'#D6E5DC',{alpha:.16}),round([.42,.08,3.3],[-4.22,.86,0],palette.edge,.025));
 for(const y of [1.47,2.23]){a.push(round([5.2,.105,.63],[-.8,y,2.85],palette.wood,.025));for(const x of [-3.1,1.5])a.push(p('box',[.045,.26,.52],[x,y-.17,2.86],palette.dark));}
 a.push(round([2.4,.42,.5],[-.9,.34,2.92],palette.wood,.035));
 // Quiet framing: two neutral botanical prints, no invented canon signs.
 for(const x of [-2.7,-1.7])a.push(round([.62,.70,.06],[x,2.97,3.16],palette.wood,.015),p('box',[.53,.61,.018],[x,2.97,3.12],palette.ivory),p('sphere',[.16,.29,.012],[x,2.98,3.105],palette.sage,{turn:[0,0,-.25]}));
 // Static pendant shades, no dynamic point-light costs.
 for(const x of [-2,1.3])a.push(p('cylinder',[.014,.6,.014],[x,3.12,.6],palette.dark,{top:1}),p('cylinder',[.45,.23,.45],[x,2.75,.6],palette.ivory,{top:.45}),p('sphere',[.19,.07,.19],[x,2.64,.6],'#F8DDA5'));
 return a;
}
