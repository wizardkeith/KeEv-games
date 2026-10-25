import type {NativeSurface} from './native-characters';
/** Four geometric half-spaces through the real window edges and camera.
 * Only distant exterior materials are portal-clipped; the shop remains full3D.
 * This prevents a distant sky/house from appearing beyond a cutaway wall. */
type V=readonly [number,number,number];
export function windowPortalPlanes(camera:V){
 const corners:V[]=[[-4.47,.925,-2.055],[-4.47,.925,2.055],[-4.47,2.755,2.055],[-4.47,2.755,-2.055]],center:V=[-4.47,1.84,0];
 return corners.map((a,i)=>{const b=corners[(i+1)%4],u=a.map((v,k)=>v-camera[k]),v=b.map((v,k)=>v-camera[k]),n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],length=Math.hypot(...n);if(length<1e-10)throw new RangeError('camera lies on window edge');const d=-n.reduce((sum,v,k)=>sum+v*camera[k],0),sign=n.reduce((sum,v,k)=>sum+v*center[k],d)>0?-1:1;return [...n,d].map(v=>v*sign/length) as [number,number,number,number];});
}
export const windowPortalIntent={apertureX:-4.47,minY:.925,maxY:2.755,minZ:-2.055,maxZ:2.055,method:'Actual mesh sky/houses through geometric window portal; no reference or rendered image is used as a background. Recreate clipping for native camera adapter.'} as const;
export const farSkyColors=['#DCE6DA','#D0E1E3','#C4DDEA','#B9D9EB'] as const;

/** Procedural atmospheric geometry, separate from bounded house architecture. */
export function farSkyRecipe():NativeSurface[]{return farSkyColors.map((color,i)=>({shape:'box',size:[.02,5,22],at:[-13,-11.5+i*5,0],color,role:'paint'}));}
