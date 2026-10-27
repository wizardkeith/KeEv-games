/** Native v3.1 presentation intent. RH / Y-up, metres and radians.
 * Fit the usable shop, doorway actors and furniture in the UI-safe viewport;
 * decorative outer plinth and distant scenery do not determine camera distance.
 * Coefficients are starting candidates, not calibrated lux or a visual approval.
 */
export type NativeView='shop'|'staff';
type Point=readonly [number,number,number];
function corners(min:Point,max:Point):Point[]{return [min[0],max[0]].flatMap(x=>[min[1],max[1]].flatMap(y=>[min[2],max[2]].map(z=>[x,y,z] as Point)));}
export const nativeViewContract={
 id:'native.view.v3.1',alpha:-Math.PI/4,alphaRange:[-Math.PI/4-.27,-Math.PI/4+.27] as const,
 beta:50*Math.PI/180,betaRange:[45*Math.PI/180,55*Math.PI/180] as const,
 shopTarget:[.70,1.15,0] as Point,staffTarget:[2.55,1.02,-.73] as Point,
 margin:.965,guard:1.002,
 criticalBoxes:[
  {id:'display.1',min:[-3.31,.08,-2.10] as Point,max:[-1,1.70,-.90] as Point},
  {id:'display.2',min:[-.9,.08,-.70] as Point,max:[1.1,1.70,.50] as Point},
  {id:'display.3',min:[-3.31,.08,.50] as Point,max:[-1,1.70,1.70] as Point},
  {id:'counter-and-staff',min:[.46,.08,-2.01] as Point,max:[3.58,1.78,-.35] as Point},
  {id:'doorway',min:[2.21,.08,3.08] as Point,max:[3.89,2.71,3.36] as Point},
  {id:'entry-visitor',min:[2.68,.08,2.55] as Point,max:[4.60,1.67,4.42] as Point},
  {id:'service-visitor',min:[3.00,.08,-1.04] as Point,max:[3.82,1.67,-.25] as Point},
  {id:'window',min:[-4.58,.82,-2.22] as Point,max:[-4.20,2.84,2.22] as Point},
  {id:'back-shelves',min:[-3.45,1.20,2.50] as Point,max:[1.85,2.60,3.17] as Point},
 ] as const,
 staffBox:{min:[1.90,.08,-2.01] as Point,max:[3.35,1.78,-.22] as Point},
 note:'Fit excludes decorative upper wall/plinth only. Preserve user zoom relative to this fit when the safe viewport changes; ordinary draw must not reset camera.',
} as const;
export const nativeShopHull:readonly Point[]=Object.freeze(nativeViewContract.criticalBoxes.flatMap(b=>corners(b.min,b.max)));
const staffHull=corners(nativeViewContract.staffBox.min,nativeViewContract.staffBox.max);
export function nativeProjection(point:Point,target:Point,alpha:number,beta:number){
 const [x,y,z]=point.map((v,i)=>v-target[i]);
 return {x:x*Math.sin(alpha)-z*Math.cos(alpha),y:-x*Math.cos(alpha)*Math.cos(beta)+y*Math.sin(beta)-z*Math.sin(alpha)*Math.cos(beta),depth:x*Math.cos(alpha)*Math.sin(beta)+y*Math.cos(beta)+z*Math.sin(alpha)*Math.sin(beta)};
}
export function nativeCameraFrame(aspect:number,fov=.8,view:NativeView='shop'){
 if(!Number.isFinite(aspect)||aspect<=0||!Number.isFinite(fov)||fov<=0||fov>=Math.PI)throw new RangeError('native camera dimensions');
 const target=view==='staff'?nativeViewContract.staffTarget:nativeViewContract.shopTarget,hull=view==='staff'?staffHull:nativeShopHull;
 const tangent=Math.tan(fov/2)*nativeViewContract.margin;let fit=0;
 for(let i=0;i<=8;i++){const alpha=nativeViewContract.alphaRange[0]+i*(nativeViewContract.alphaRange[1]-nativeViewContract.alphaRange[0])/8;
  for(let j=0;j<=4;j++){const beta=nativeViewContract.betaRange[0]+j*(nativeViewContract.betaRange[1]-nativeViewContract.betaRange[0])/4;
   for(const point of hull){const p=nativeProjection(point,target,alpha,beta);fit=Math.max(fit,p.depth+Math.abs(p.x)/(tangent*aspect),p.depth+Math.abs(p.y)/tangent);}
  }
 }
 const radius=Math.max(view==='staff'?3.8:7.8,fit*nativeViewContract.guard);
 return {view,radius,target,lowerRadiusLimit:Math.max(3.2,radius*.72),upperRadiusLimit:radius*1.65,minZ:.1,maxZ:90};
}
/** A local face fill preserves the authored linear colour and soft surface
 * shading; restrict it to face skin/ink meshes, not all scene materials. */
export const nativeLighting={
 id:'native.light.v11-slice',
 key:{color:'#FFF0D3',intensity:3.70,direction:[.80,-.62,.18] as const,position:[-8,8,-2] as const},
 fill:{color:'#DFE9EF',ground:'#B6A38C',intensity:.27,direction:[.15,.75,-.55] as const},
 faceFill:{color:'#FFF0DC',ground:'#B9B6B0',intensity:.43,direction:[.12,.35,-1] as const,parts:['head','eye-left','eye-right','eyelid-left','eyelid-right','brow-left','brow-right','mouth'] as readonly string[],roles:['skin','ink'] as readonly string[]},
 shadow:{size:2048,normalBias:.010,bias:.0007,darkness:.16,lightSizeUVRatio:.035},
 exteriorFill:{color:'#C8E1EF',ground:'#9CAF8F',intensity:.68},
 // Bounded art-directed bounce proxies; point/spot candela are not directional lux.
 practicals:[{id:'cashier',position:[3.05,2.75,-1.05],direction:[0,-1,0],color:'#FFD5A7',intensity:20.0,angle:1.52},{id:'central',position:[-2.5,3,-.3],direction:[.80,-.62,.18],color:'#FFF0D3',intensity:24.0,angle:1.62}] as const,
 exposure:1,
 note:'C27 existing central bounce proxy now follows window direction; unchanged shadow/global exposure/fill. C23 coherent higher window daylight, restrained global fill, retained service-dock warm focal bounce and cool layered exterior, original room IBL, soft contact-hardening shadows and actual floor AO. ACES exposure1/contrast1.06. No bloom or dynamic reflection. Face fill remains restricted to skin/ink. Actual game render, not metadata or tests, determines visual fidelity.',
} as const;
