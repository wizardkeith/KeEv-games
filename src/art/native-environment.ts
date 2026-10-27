/** Native v3 scene authoring. Metres, right-handed Y-up; material colours are sRGB.
 * Recipes feed the actual world adapter and can be rebuilt without Babylon.
 * The historical W1.1A recipe remains intact for its frozen master exports.
 */
import {buildV10Room,buildV10Counter,buildV10Display,buildV10Door,buildV10Sign,buildV10Plant,buildV10Exterior} from './shop-v10';
import type {NativeSurface} from './native-characters';
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

export function legacyV9_nativeRoomRecipe():NativeEnvironmentPart[]{
 // These five pieces are the frozen full back wall, full-width skirting,
 // decorative solid door panel, old glass, and old handle respectively.
 // Removing only the glass would leave both an opaque wall and opaque panel.
 const removed=new Set([2,7,10,11,12]);
 const old=roomRecipe().filter((p,i)=>!removed.has(i)&&!(p.size[0]===.045&&p.size[1]===.26&&p.at[0]===1.5)).map(p=>{
  // Cool, desaturated floor boards separate furniture from the floor without
  // changing material encoding or brightening every surface in the scene.
  if(p.role==='wood'&&p.size[2]===6.45&&p.size[1]===.018)return {...p,size:[.545,p.size[1],p.size[2]] as V3,color:p.color===palette.floorLight?'#C2A481':'#B99A76',roughness:.83};
  // Retained wall shelves stay deeper and warmer than the new floor.
  if(p.role==='wood'&&p.size[0]===5.2)return {...p,color:'#967255',roughness:.76};
  if(p.color===palette.cream&&p.size[1]>.65)return {...p,color:'#EBD9BD',role:'paint' as const,roughness:.94};
  if(p.role==='ink'&&p.shape==='sphere')return {...p,shape:'leaf' as const};
  return p;
 });
 const {minX,maxX,topY}=nativeDoorContract.aperture;
 const wallMin=-4.55,wallMax=4.55,wallTop=3.5;
 // Original bounded floor geometry; the v6 material carries staggered joints.
 return [...old,...[-1.65,-.90,-.15].map(x=>round([.70,.28,.025],[x,.35,2.656],'#AC8562',.015)),
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
export function legacyV9_doorLeafRecipe():Part[]{
 const wood='#AC805B',width=nativeDoorContract.leafWidth,height=2.47;
 return [
  round([.065,height,.105],[.0325,height/2,0],wood,.012),
  round([.065,height,.105],[width-.0325,height/2,0],wood,.012),
  round([width,.085,.105],[width/2,height-.0425,0],wood,.012),
  round([width,.085,.105],[width/2,.0425,0],wood,.012),
  round([width-.10,.32,.080],[width/2,.23,0],'#B9946E',.012),
  part('box',[width-.13,height-.43,.025],[width/2,1.40,0],'#C8DDD8','glass',{alpha:.18}),
  round([.025,.26,.035],[width-.17,1.22,-.073],'#867663',.008,'metal'),
  ...[.25,1.20,2.15].map(y=>part('cylinder',[.055,.12,.055],[0,y,0],'#95806A','metal',{top:1})),
 ];
}

/** Parent this lightweight sign to the door at nativeDoorContract.signPivot. */
export function legacyV9_doorSignRecipe():Part[]{return [
 round([.30,.13,.018],[0,-.09,0],'#E5D9BF',.014,'paper'),
 part('box',[.004,.07,.004],[-.10,-.025,0],palette.dark),
 part('box',[.004,.07,.004],[.10,-.025,0],palette.dark),
 part('sphere',[.09,.032,.006],[0,-.09,-.012],palette.sage,'ink'),
 ];}

export interface NativeLeafCluster {pivot:V3;recipe:NativeSurface[];}
export interface NativePlantParts {base:NativeSurface[];leaves:NativeLeafCluster[];}
export function legacyV9_plantParts(scale=1):NativePlantParts{
 if(!Number.isFinite(scale)||scale<=0)throw new RangeError('positive plant scale');
 const scaled=(p:Part):Part=>({...p,size:p.size.map(v=>v*scale) as V3,at:p.at.map(v=>v*scale) as V3});
 const base:Part[]=[
  part('cylinder',[.34,.33,.34],[0,.165,0],palette.clay,'ceramic',{top:1.18}),
  part('torus',[.395,.027,.395],[0,.325,0],'#C79D80','ceramic'),
  part('cylinder',[.30,.02,.30],[0,.335,0],'#6E5943','paint',{top:1}),
  part('cylinder',[.021,.58,.021],[0,.60,0],'#728065','wood',{top:.72}),
 ].map(scaled);
 const leaves=Array.from({length:7},(_,i)=>{
  const a=i*2.39996,pivot:V3=[Math.sin(a)*.09,.44+i*.057,Math.cos(a)*.09];
  const offset:V3=[Math.sin(a)*.155,.055,Math.cos(a)*.155];
  return {pivot:pivot.map(v=>v*scale) as V3,recipe:[
   part('leaf',[.22,.35,.035],offset,i%2?'#789879':'#9DB48D','leaf',{turn:[.25*Math.cos(a),a,.40*Math.sin(a)]}),
   scale<.6?part('sphere',[.085,.070,.085],[offset[0]*.6,.105,offset[2]*.6],'#F2E4C8','leaf'):part('leaf',[.19,.28,.028],[-offset[0]*.85,-.05,-offset[2]*.85],i%2?'#9DB48D':'#789879','leaf',{turn:[-.25*Math.cos(a),a+.8,-.55*Math.sin(a)]}),
   part('leaf',[.17,.24,.028],[Math.sin(a+.9)*.17,-.055,Math.cos(a+.9)*.17],i%2?'#B0BE98':'#6C8C68','leaf',{turn:[.35,a+.9,Math.sin(a+.9)*.55]}),
  ].map(scaled)};
 });
 return {base,leaves};
}

/** Small real-geometry window vignette, rebuilt after the v3 raw-block review.
 * Low rooflines, paired pitched roof planes, ridges, recessed window bays and
 * a small chimney read as architecture rather than exposed tall test boxes.
 * It remains scenery, never a new map or player destination. */
export function legacyV9_exteriorRecipe():Part[]{
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
   const a=i*2.39996;
   result.push(part('cylinder',[.035,.54,.035],[x+Math.sin(a)*.15,h-.40+(i%3)*.10,z+Math.cos(a)*.15],'#899A83','wood',{top:.5,turn:[Math.sin(a)*.65,0,Math.cos(a)*.65]}));
   result.push(part('sphere',[.72+(i%2)*.12,.40+(i%3)*.06,.65],[x+Math.sin(a)*.40,h-.12+(i%3)*.15,z+Math.cos(a)*.34],i%3?'#A9BEA0':'#C0D0AB','leaf'));
  }
 }
 return result;
}

export function legacyV9_nativeCounterRecipe():NativeEnvironmentPart[]{return [...counterRecipe().filter((_,i)=>i<2||i>6).map((p,i)=>i===0?{...p,color:'#D1AF86',roughness:.57}:i===1?{...p,color:'#B28C67'}:p),
 // Recesses, a bevel beneath the thick top, and restrained drawer construction.

 round([1.65,.065,.65],[0,.050,0],'#77583F',.014),
 ...[-.41,.41].flatMap(x=>[
  round([.76,.18,.026],[x,.70,-.393],'#E5D6C1',.012,'paint'),
  round([.14,.018,.026],[x,.70,-.416],'#B59A63',.006,'metal'),
 ]),
 part('box',[1.52,.012,.009],[0,.577,-.409],'#C2AF94'),
 // Inset lower panels and broad warm edging read at the normal shop camera.
 ...[-.41,.41].flatMap(x=>[
  round([.74,.43,.023],[x,.34,-.404],'#C8B69C',.012,'paint'),
  round([.65,.34,.015],[x,.34,-.423],'#EFE4D1',.014,'paint'),
 ]),

 ];}

export function legacyV9_nativeDisplayRecipe(variant=0):NativeEnvironmentPart[]{return [...displayRecipe().map((p,i)=>i===0?{...p,color:'#D0AF85',roughness:.64}:p.role==='wood'&&p.color===palette.dark?{...p,color:'#806B58'}:p),
 round([1.49,.020,.86],[0,.879,0],'#B89268',.008),
 // Existing upright price card retained; spare underside trim budget moves
 // to the visible back cabinet in the room recipe.

 // Narrow woven runners turn over the front edge rather than lying as mats.
 round([.50,.008,.91],[variant===1?-.20:.12,.997,0],variant===2?'#DCE0CD':'#E9DCC3',.003,'fabric'),
 round([.50,.27,.012],[variant===1?-.20:.12,.865,-.472],variant===2?'#DCE0CD':'#E9DCC3',.006,'fabric'),
 round([.50,.016,.017],[variant===1?-.20:.12,.734,-.473],'#C2B49A',.005,'fabric'),
 ];}

// Active V10 assets, preserving structural contracts and named animation roots.
export const nativeRoomRecipe=()=>buildV10Room(nativeDoorContract);
export const nativeCounterRecipe=buildV10Counter,nativeDisplayRecipe=buildV10Display;
export const doorLeafRecipe=()=>buildV10Door(nativeDoorContract.leafWidth),doorSignRecipe=buildV10Sign;
export const plantParts=buildV10Plant,exteriorRecipe=buildV10Exterior;
