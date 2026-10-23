/** Native-only surface overrides. Legacy semantic/shared materials are immutable.
 * Shoe leather gets a controlled broad highlight; soles and canvas remain matte.
 */
import {materialRenderState,type MaterialRole} from './materials';
export function nativeMaterialIntent(surface:{role?:MaterialRole;color:string;alpha?:number;roughness?:number}){
 const base=materialRenderState(surface.role??'paint',surface.color,surface.alpha??1),roughness=surface.roughness??base.roughness;
 if(!Number.isFinite(roughness)||roughness<0||roughness>1)throw new RangeError('native material roughness');
 return {...base,roughness,materialId:surface.roughness===undefined?base.materialId:`${base.materialId}:native-r${roughness}`};
}
