/** Native v3 scene authoring. Metres, right-handed Y-up; material colours are sRGB.
 * Recipes feed the actual world adapter and can be rebuilt without Babylon.
 * The historical W1.1A recipe remains intact for its frozen master exports.
 */
import {roomRecipe,counterRecipe,displayRecipe,palette,type Part,type V3} from './recipes';
import type {MaterialRole} from './materials';

export type NativeEnvironmentPart=Part&{roughness?:number};
const part=(shape:Part['shape'],size:V3,at:V3,color:string,role:MaterialRole='wood',extra:Partial<NativeEnvironmentPart>={}):NativeEnvironmentPart=>({shape,size,at,color,role,...extra});
const round=(size:V3,at:V3,color:string,radius=.025,role:MaterialRole='wood')=>part('round',size,at,color,role,{radius});

export const nativeDoorContract=Object.freeze({
 id:'environment.entry.native-v3',hinge:[2.34,.08,3.20] as V3,
 aperture:{minX:2.34,maxX:3.76,floorY:.08,topY:2.58,wallZ:3.3},
 leafWidth:1.42,openRadians:-1.42,
 // At this angle the leaf lies outside the reserved central threshold corridor.
 crossingOpenRadians:1.30,signPivot:[.80,1.56,-.073] as V3,
});

export function nativeRoomRecipe():NativeEnvironmentPart[]{
 // These five pieces are the frozen full back wall, full-width skirting,
 // decorative solid door panel, old glass, and old handle respectively.
 // Removing only the glass would leave both an opaque wall and opaque panel.
 const removed=new Set([2,7,10,11,12]);
 const old=roomRecipe().filter((_,i)=>!removed.has(i)).map(p=>{
  // Cool, desaturated floor boards separate furniture from the floor without
  // changing material encoding or brightening every surface in the scene.
  if(p.role==='wood'&&p.size[2]===6.45&&p.size[1]===.018)return {...p,color:p.color===palette.floorLight?'#C9B8A4':'#C0AE98',roughness:.83};
  // Retained wall shelves stay deeper and warmer than the new floor.
  if(p.role==='wood'&&p.size[0]===5.2)return {...p,color:'#967255',roughness:.76};
  return p;
 });
 const {minX,maxX,topY}=nativeDoorContract.aperture;
 const wallMin=-4.55,wallMax=4.55,wallTop=3.5;
 return [...old,
  part('box',[minX-wallMin,wallTop,.16],[(wallMin+minX)/2,wallTop/2,3.3],palette.cream,'paint'),
  part('box',[wallMax-maxX,wallTop,.16],[(maxX+wallMax)/2,wallTop/2,3.3],palette.cream,'paint'),
  part('box',[maxX-minX,wallTop-topY,.16],[(minX+maxX)/2,(wallTop+topY)/2,3.3],palette.cream,'paint'),
  part('box',[minX-wallMin,.13,.08],[(wallMin+minX)/2,.16,3.19],palette.edge),
  part('box',[wallMax-maxX,.13,.08],[(maxX+wallMax)/2,.16,3.19],palette.edge),
  // Fixed jambs sit outside the clear opening, rather than shrinking its width.
  round([.13,2.58,.23],[minX-.065,1.29,3.23],palette.wood,.018),
  round([.13,2.58,.23],[maxX+.065,1.29,3.23],palette.wood,.018),
  round([1.68,.13,.23],[3.05,2.645,3.23],palette.wood,.018),
  // The landing shares the interior floor elevation; no floating exit steps.
  round([2.64,.14,1.30],[3.48,.009,3.74],'#B7B4A5',.035),
  round([1.48,.002,.48],[3.05,.080,3.61],'#8C9C8B',.001,'fabric'),
  part('box',[1.42,.006,.28],[3.05,.076,3.25],'#A99A82','metal'),
 ];
}

/** Local to the contract hinge. Negative Y rotation opens toward exterior +Z. */
export function doorLeafRecipe():Part[]{
 const wood='#AC805B',width=nativeDoorContract.leafWidth,height=2.47;
 return [
  round([.065,height,.105],[.0325,height/2,0],wood,.012),
  round([.065,height,.105],[width-.0325,height/2,0],wood,.012),
  round([width,.085,.105],[width/2,height-.0425,0],wood,.012),
  round([width,.085,.105],[width/2,.0425,0],wood,.012),
  round([width-.10,.32,.080],[width/2,.23,0],'#B9946E',.012),
  part('box',[width-.13,height-.43,.025],[width/2,1.40,0],'#C8DDD8','glass',{alpha:.32}),
  round([.025,.26,.035],[width-.17,1.22,-.073],'#867663',.008,'metal'),
  ...[.25,1.20,2.15].map(y=>part('cylinder',[.055,.12,.055],[0,y,0],'#95806A','metal',{top:1})),
 ];
}

/** Parent this lightweight sign to the door at nativeDoorContract.signPivot. */
export function doorSignRecipe():Part[]{return [
 round([.30,.13,.018],[0,-.09,0],'#E5D9BF',.014,'paper'),
 part('box',[.004,.07,.004],[-.10,-.025,0],palette.dark),
 part('box',[.004,.07,.004],[.10,-.025,0],palette.dark),
 part('sphere',[.09,.032,.006],[0,-.09,-.012],palette.sage,'ink'),
 ];}

export interface NativeLeafCluster {pivot:V3;recipe:Part[];}
export interface NativePlantParts {base:Part[];leaves:NativeLeafCluster[];}
export function plantParts(scale=1):NativePlantParts{
 if(!Number.isFinite(scale)||scale<=0)throw new RangeError('positive plant scale');
 const scaled=(p:Part):Part=>({...p,size:p.size.map(v=>v*scale) as V3,at:p.at.map(v=>v*scale) as V3});
 const base:Part[]=[
  part('cylinder',[.34,.33,.34],[0,.165,0],palette.clay,'ceramic',{top:1.18}),
  part('torus',[.395,.027,.395],[0,.325,0],'#C79D80','ceramic'),
  part('cylinder',[.30,.02,.30],[0,.335,0],'#6E5943','paint',{top:1}),
  part('cylinder',[.021,.58,.021],[0,.60,0],'#728065','wood',{top:.72}),
 ].map(scaled);
 const leaves=Array.from({length:7},(_,i)=>{
  const a=i*2.39996,pivot:V3=[Math.sin(a)*.018,.46+i*.062,Math.cos(a)*.018];
  const offset:V3=[Math.sin(a)*.104,.065,Math.cos(a)*.104];
  return {pivot:pivot.map(v=>v*scale) as V3,recipe:[
   part('sphere',[.15,.29,.055],offset,i%2?'#789879':'#9DB48D','leaf',{turn:[.25*Math.cos(a),a,.40*Math.sin(a)]}),
   part('cylinder',[.008,.14,.008],[offset[0]*.47,.027,offset[2]*.47],'#7B8C65','leaf',{top:.5,turn:[.75*Math.cos(a),0,-.75*Math.sin(a)]}),
  ].map(scaled)};
 });
 return {base,leaves};
}

/** Small real-geometry window vignette, rebuilt after the v3 raw-block review.
 * Low rooflines, paired pitched roof planes, ridges, recessed window bays and
 * a small chimney read as architecture rather than exposed tall test boxes.
 * It remains scenery, never a new map or player destination. */
export function exteriorRecipe():Part[]{
 const result:Part[]=[
  round([2.0,.09,6.2],[-5.45,-.015,0],'#BCC6BA',.03),
 ];
 for(const [i,[x,z,w,h,d]] of [[-6.95,-2.08,1.48,1.76,1.28],[-7.22,1.76,1.08,2.05,1.52]].entries()){
  result.push(round([w,h,d],[x,h/2+.03,z],i?'#BAC5BF':'#A8B9B5',.045,'paint'));
  // A two-plane shallow gable is true 3D geometry, including overhanging eaves.
  const roofWidth=w*.61,angle=.20;
  for(const side of [-1,1])result.push(part('round',[roofWidth,.075,d+.18],[x+side*w*.25,h+.03,z],i?'#859C99':'#7E9790','paint',{radius:.014,turn:[0,0,-side*angle]}));
  result.push(round([.09,.075,d+.22],[x,h+.03+Math.sin(angle)*roofWidth*.5,z],'#A5B5AB',.018,'paint'));
  // The visible east facade gets actual inset bays and a lintel. Window panels
  // stay soft/cool, with controlled contrast instead of emissive squares.
  for(const offset of [-.27,.27])result.push(round([.035,.46,.28],[x+w/2+.008,.99+i*.17,z+offset],'#D1DDD4',.012,'glass'));
  result.push(round([.055,.07,.94],[x+w/2+.012,1.28+i*.17,z],'#91A59B',.012,'paint'));
  result.push(round([w+.06,.09,d+.06],[x,.055,z],'#9DAFA3',.018,'paint'));
 }
 result.push(round([.16,.29,.19],[-7.25,2.20,2.11],'#9AADA2',.015,'paint'));
 for(const [x,z,h] of [[-5.55,-1.10,1.90],[-6.02,1.48,2.12]]){
  result.push(part('cylinder',[.13,h,.13],[x,h/2,z],'#899A83','wood',{top:.66}));
  for(let i=0;i<2;i++){
   const a=i*2.3;
   result.push(part('cylinder',[.045,.65,.045],[x+Math.sin(a)*.15,h-.44+i*.10,z+Math.cos(a)*.15],'#899A83','wood',{top:.5,turn:[Math.sin(a)*.65,0,Math.cos(a)*.65]}));
   result.push(part('sphere',[1.04,.64,.88],[x+Math.sin(a)*.31,h-.06+i*.13,z+Math.cos(a)*.26],i?'#A9BEA0':'#BACBAB','leaf'));
  }
 }
 return result;
}

export function nativeCounterRecipe():NativeEnvironmentPart[]{return [...counterRecipe().map((p,i)=>i===0?{...p,color:'#DAB98F',roughness:.57}:i===1?{...p,color:'#B28C67'}:p),
 // Recesses, a bevel beneath the thick top, and restrained drawer construction.
 round([1.79,.024,.80],[0,.847,0],'#8B664B',.009),
 round([1.65,.065,.65],[0,.050,0],'#77583F',.014),
 ...[-.41,.41].flatMap(x=>[
  round([.76,.18,.026],[x,.70,-.393],'#E5D6C1',.012,'paint'),
  round([.14,.018,.026],[x,.70,-.416],'#9B896B',.006,'metal'),
 ]),
 part('box',[1.52,.012,.009],[0,.577,-.409],'#C2AF94'),
 ];}

export function nativeDisplayRecipe():NativeEnvironmentPart[]{return [...displayRecipe().map((p,i)=>i===0?{...p,color:'#DDC29D',roughness:.64}:p.role==='wood'&&p.color===palette.dark?{...p,color:'#806B58'}:p),
 round([1.49,.020,.86],[0,.879,0],'#B89268',.008),
 ...[-.59,.59].flatMap(x=>[-.28,.28].map(z=>round([.095,.028,.095],[x,.014,z],'#7F6652',.008))),
 round([.27,.042,.024],[-.49,.905,-.477],'#F0E5D0',.006,'paper'),
 part('box',[.11,.005,.027],[-.49,.907,-.492],'#A89A7E','ink'),
 ];}
