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
 shopTarget:[.50,1,.30] as Point,staffTarget:[2.55,1.02,-.73] as Point,
 margin:.965,guard:1.002,
 criticalBoxes:[
  {id:'display.1',min:[-2.85,.08,-2.05] as Point,max:[-1.15,1.34,-.95] as Point},
  {id:'display.2',min:[-.75,.08,-.65] as Point,max:[.95,1.34,.45] as Point},
  {id:'display.3',min:[-2.85,.08,.55] as Point,max:[-1.15,1.34,1.65] as Point},
  {id:'counter-and-staff',min:[1.62,.08,-2.01] as Point,max:[3.58,1.67,-.35] as Point},
  {id:'doorway',min:[2.21,.08,3.08] as Point,max:[3.89,2.71,3.36] as Point},
  {id:'entry-visitor',min:[2.68,.08,2.55] as Point,max:[4.60,1.67,4.42] as Point},
  {id:'service-visitor',min:[3.00,.08,-1.04] as Point,max:[3.82,1.67,-.25] as Point},
  {id:'window',min:[-4.58,.82,-1.65] as Point,max:[-4.20,2.84,1.65] as Point},
  {id:'back-shelves',min:[-3.45,1.20,2.50] as Point,max:[1.85,2.60,3.17] as Point},
 ] as const,
 staffBox:{min:[1.90,.08,-2.01] as Point,max:[3.35,1.72,-.22] as Point},
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
 id:'native.light.v9',
 key:{color:'#FFE0B7',intensity:2.65,direction:[.78,-.71,.32] as const,position:[-8,8,-2] as const},
 fill:{color:'#DFE9EF',ground:'#B6A38C',intensity:.42},
 faceFill:{color:'#FFF0DC',ground:'#B9B6B0',intensity:.43,direction:[.12,.35,-1] as const,parts:['head','eye-left','eye-right','eyelid-left','eyelid-right','brow-left','brow-right','mouth'] as readonly string[],roles:['skin','ink'] as readonly string[]},
 shadow:{size:2048,normalBias:.0035,bias:.0005,darkness:.16},
 exteriorFill:{color:'#C3DCE4',ground:'#839D99',intensity:.42},
 exposure:1,
 note:'V9 analytic original room IBL plus stronger directional window light; exposure stays 1. Standard PBR fallback. No tone-map/exposure boost, bloom or dynamic reflection. Face fill includes only face skin/ink meshes; hair/cloth retain key/fill volume. Warm window key, restrained cool sky and a separate cool exterior fill; assess actual WebGL evidence for visual acceptance.',
} as const;
