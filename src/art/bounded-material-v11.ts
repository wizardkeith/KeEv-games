/** C34: approved221 flower/C32cloth geometry, existing original material roles.
 * Authoring-only comparison; ordinary builds retain201 until visual review. */
import type{NativeSurface}from'./native-characters';import{nativeSurfaceGeometry}from'./native-characters';
const request=import.meta.env?.VITE_V11_BOUNDED_MATERIAL;
export const boundedMaterialMode=request==='base'||request==='values'?request:'control';
export const boundedMaterialActive=boundedMaterialMode!=='control',boundedMaterialValues=boundedMaterialMode==='values';
export const flowerValueAtlas='/assets/native-v11/petal-form-values-c34.png';
export const boundedMaterialIntent={id:'v11.c34.locked-gray-materials',mode:boundedMaterialMode,geometry:'Exact C33flower/C32cloth positions/normals/indices; accepted C27composition/192reflection',values:'Original shared flower/paper material and linen finish, existing object-UV atlas pipeline; no painted inventory/contact shadows or screen-space substitute',acceptance:'Bounded material gate pending; not target acceptance'}as const;
export function flowerValueSurface(p:NativeSurface):NativeSurface{
 if(!boundedMaterialValues||p.role!=='paper'||p.shape!=='mesh')return p;
 return{...p,baseColorTexture:flowerValueAtlas,geometry:{...p.geometry,uvs:p.geometry.uvs!.map((v,i)=>i%2?v:.02+v*.76)}};
}
/** Reuse the original EDE4D1/.96 batch, not an18th material. Any pre-existing
 * matching noncentral surface samples a white reserved texel, preserving tone. */
export function bindExistingFlowerAtlas(parts:NativeSurface[]):NativeSurface[]{
 if(!boundedMaterialValues)return parts;
 return parts.map(p=>{if(p.role!=='paper'||p.color!=='#EDE4D1'||(p.roughness??.96)!==.96||!!p.baseColorTexture)return p;
 const g=nativeSurfaceGeometry(p);return{...p,shape:'mesh',at:[0,0,0],geometry:{...g,uvs:Array.from({length:g.positions.length/3},()=>[.95,.5]).flat()},baseColorTexture:flowerValueAtlas}as NativeSurface;});
}
