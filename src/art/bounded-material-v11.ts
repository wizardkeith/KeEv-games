import acceptedValues from '../../assets/authoring/native-v11/bounded-values-c34.json';
/** C34: approved221 flower/C32cloth geometry, existing original material roles.
 * C35 narrow material gate passed. This accepted bounded standard is the development default; overall target remains unaccepted. */
import type{NativeSurface}from'./native-characters';import{nativeSurfaceGeometry}from'./native-characters';
const request=import.meta.env?.VITE_V11_BOUNDED_MATERIAL;
const legacyExperiment=(import.meta.env?.VITE_V11_GRAY_FORMS??'control')!=='control'||(import.meta.env?.VITE_V11_FORM_VALUES??'control')!=='control';
export const boundedMaterialMode=request==='control'||request==='base'?request:request==='values'?'values':legacyExperiment?'control':'values';
export const boundedMaterialActive=boundedMaterialMode!=='control',boundedMaterialValues=boundedMaterialMode==='values';
export const flowerValueAtlas='/assets/native-v11/petal-form-values-c34.png';
export const boundedMaterialIntent={id:'v11.c34.locked-gray-materials',mode:boundedMaterialMode,geometry:'C33 visible crown retained; C36 two lower trunks fit vase neck, exact C32cloth/C35atlases/C27composition/192reflection',atlases:{flower:{url:flowerValueAtlas,sha256:acceptedValues.files['petal-form-values-c34.png'].sha256},cloth:{url:'/assets/native-v11/linen-form-values-c34.png',sha256:acceptedValues.files['linen-form-values-c34.png'].sha256}},values:'Original shared flower/paper material and linen finish, existing object-UV atlas pipeline; no painted inventory/contact shadows or screen-space substitute',acceptance:'C35 narrow material gate independently passed; adopted development default, overall target art remains unaccepted'}as const;
export function flowerValueSurface(p:NativeSurface,index=0):NativeSurface{
 if(!boundedMaterialValues||p.role!=='paper'||p.shape!=='mesh')return p;
 return{...p,baseColorTexture:flowerValueAtlas,geometry:{...p.geometry,uvs:p.geometry.uvs!.map((v,i)=>i%2?v:.02+Math.min(2,Math.floor(index/11))*.28+v*.24)}};
}
/** Reuse the original EDE4D1/.96 batch, not an18th material. Any pre-existing
 * matching noncentral surface samples a white reserved texel, preserving tone. */
export function bindExistingFlowerAtlas(parts:NativeSurface[]):NativeSurface[]{
 if(!boundedMaterialValues)return parts;
 return parts.map(p=>{if(p.role!=='paper'||p.color!=='#EDE4D1'||(p.roughness??.96)!==.96||!!p.baseColorTexture)return p;
 const g=nativeSurfaceGeometry(p);return{...p,shape:'mesh',at:[0,0,0],geometry:{...g,uvs:Array.from({length:g.positions.length/3},()=>[.95,.5]).flat()},baseColorTexture:flowerValueAtlas}as NativeSurface;});
}
