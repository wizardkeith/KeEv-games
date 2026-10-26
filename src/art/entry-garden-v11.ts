/** Stationary entrance courtyard, visible only through the actual door portal.
 * Real geometric branches, leaves and paving; not terrain/gameplay or an image.
 * All geometry lies outside the retained door sweep and customer threshold. */
import {geometry} from './geometry';import {nativeGrouped,type NativeSurface} from './native-characters';import {sculptSweep} from './sculpt-v10';import {floorLeaf} from './floor-leaf-v11';import type {V3} from './recipes';
export const entryGardenIntent={minZ:4.86,units:'metres',kind:'non-interactive clipped exterior geometry',portal:{minX:2.34,maxX:3.76,minY:.08,maxY:2.58,z:3.30},source:'Original authored courtyard; no target pixels used as a backdrop'} as const;
export function entryGardenRecipe():NativeSurface[]{
 const parts:NativeSurface[]=[{shape:'box',size:[6,.06,4.0],at:[1.50,.045,6.9],color:'#D3D2B5',role:'paint'}];
 // Garden path tiles are discrete slabs with joints, not a white door-sized card.
 for(let row=0;row<4;row++)for(let col=0;col<4;col++)parts.push({shape:'round',size:[.65,.018,.51],radius:.008,at:[.90+col*.69+(row%2)*.08,.083,5.25+row*.56],color:(row+col)%2?'#D8D8C1':'#E1DDC3',role:'paint'});
 for(const [index,[x,z,h,r]]of [[2.35,5.55,1.18,.50],[3.65,5.45,.91,.43],[1.32,6.65,.56,.46]].entries()){
  parts.push({shape:'mesh',at:[0,0,0],color:'#A0A27D',role:'wood',geometry:sculptSweep([[x,.079,z],[x-.04,h*.48,z],[x+.05,h*.86,z-.04]],[.026,.020,.008],undefined,5,5)});
  for(let cluster=0;cluster<4;cluster++){
   const angle=cluster*2.4+index,center:V3=[x+Math.cos(angle)*r*.38,h*.55+cluster*.09,z+Math.sin(angle)*r*.38],colour=['#A1B786','#C0CCA0','#8BA371'][(cluster+index)%3];
   // Broad curved blade clusters form a broken silhouette, not flat cards.
   for(let j=0;j<8;j++){
    const a=j*2.399+cluster*.4,at:V3=[center[0]+Math.cos(a)*r*.45,center[1]+Math.sin(a*1.7)*.09,center[2]+Math.sin(a)*r*.45];
    const q=floorLeaf(at,.22+j%3*.035,.13+j%2*.025,a,.65+j%3*.28,colour);parts.push(q);
   }
  }
 }
 return nativeGrouped(parts).map(g=>({shape:'mesh',at:[0,0,0],geometry:g.geometry,color:g.color,role:g.role,roughness:g.roughness,...(g.baseColorTexture?{baseColorTexture:g.baseColorTexture}:{}),...(g.finish?{finish:g.finish}:{})}));
}
/** Negative half-spaces are inside. Camera-facing geometric clipping matches
 * the aperture even during orbit/zoom; it never changes camera state. */
export function entryPortalPlanes(camera:readonly[number,number,number]){
 const p=entryGardenIntent.portal,corners:V3[]=[[p.minX,p.minY,p.z],[p.maxX,p.minY,p.z],[p.maxX,p.maxY,p.z],[p.minX,p.maxY,p.z]],center=[(p.minX+p.maxX)/2,(p.minY+p.maxY)/2,p.z];
 return corners.map((a,i)=>{const b=corners[(i+1)%4],u=a.map((v,k)=>v-camera[k]),v=b.map((v,k)=>v-camera[k]),n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],length=Math.hypot(...n);if(length<1e-10)throw new RangeError('camera lies on door portal edge');const d=-n.reduce((sum,v,k)=>sum+v*camera[k],0),sign=n.reduce((sum,v,k)=>sum+v*center[k],d)>0?-1:1;return [...n,d].map(v=>v*sign/length) as [number,number,number,number];});
}
