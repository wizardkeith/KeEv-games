/** Native-only surface overrides. Legacy semantic/shared materials are immutable.
 * Shoe leather gets a controlled broad highlight; soles and canvas remain matte.
 */
import {materialRenderState,type MaterialRole} from './materials';
export function nativeMaterialIntent(surface:{role?:MaterialRole;color:string;alpha?:number;roughness?:number}){
 const base=materialRenderState(surface.role??'paint',surface.color,surface.alpha??1),nativeRoughness=surface.role==='skin'?.78:surface.role==='hair'?.63:surface.role==='fabric'?.90:base.roughness,roughness=surface.roughness??nativeRoughness;
 if(!Number.isFinite(roughness)||roughness<0||roughness>1)throw new RangeError('native material roughness');
 return {...base,roughness,materialId:roughness===base.roughness?base.materialId:`${base.materialId}:native-r${roughness}`};
}
