import type {SurfaceFinish} from './surface-finish-v11';
/** Native-only surface overrides. Legacy semantic/shared materials are immutable.
 * Shoe leather gets a controlled broad highlight; soles and canvas remain matte.
 */
import {materialRenderState,type MaterialRole} from './materials';
export function nativeMaterialIntent(surface:{role?:MaterialRole;color:string;alpha?:number;roughness?:number;baseColorTexture?:string;finish?:SurfaceFinish}){
 const base=materialRenderState(surface.role??'paint',surface.color,surface.alpha??1),nativeRoughness=surface.role==='skin'?.78:surface.role==='hair'?.63:surface.role==='fabric'?.90:base.roughness,roughness=surface.roughness??nativeRoughness;
 if(!Number.isFinite(roughness)||roughness<0||roughness>1)throw new RangeError('native material roughness');
 const texture=surface.baseColorTexture;if(texture&&!/^\/assets\/native-v11\/[a-z0-9.-]+\.png$/.test(texture))throw new RangeError('local authored texture path');const oak=surface.role==='wood'&&roughness!==.83,peak=Math.max(...base.baseColorLinear),baseColorLinear=oak?base.baseColorLinear.map(v=>v*.40+peak*.60):base.baseColorLinear;return {...base,baseColorLinear,roughness,materialId:(roughness===base.roughness?base.materialId:`${base.materialId}:native-r${roughness}`)+(texture?`:texture:${texture}`:'')+(oak?':v11-oak-neutral-tint':'')+(surface.finish?':finish:'+surface.finish:'')};
}

/** Original authored strand colour and OpenGL tangent normal inputs, shared by Web/GLB. */
export const nativeHairMaterial={roughness:.60,baseColor:'/assets/native-v10/hair-strand-basecolor.png',normal:'/assets/native-v10/hair-strand-normal.png',normalScale:.22} as const;

/** Thin diffuse transmission is a Web PBR extension, not an economy feature.
 * Exported in native extras for a later engine adapter; standard glTF keeps the
 * same opaque PBR fallback. No refraction, screen-space scattering or prepass. */
export const nativeTransmission=(role:MaterialRole)=>role==='skin'?{intensity:.10,color:'#FFE0CD',minimumThickness:.005,maximumThickness:.035}:role==='leaf'?{intensity:.24,color:'#D4E3A2',minimumThickness:.0008,maximumThickness:.002}:undefined;

/** Existing original woven inputs, now unwrapped on sculpted cloth as well as
 * primitive fabric. Web / portable GLB share the physical repeat and strength. */
export const nativeClothMaterial={baseColor:'/assets/native-v10/cloth-weave-basecolor.png',normal:'/assets/native-v10/linen-normal.png',repeat:16,normalScale:.13} as const;

/** Restrained transparent glaze over the unchanged ceramic body colour. The
 * same scalar clear-coat layer is standard KHR_materials_clearcoat in GLB. */
export const nativeGlaze=(role:MaterialRole)=>role==='ceramic'?{intensity:.30,roughness:.24,indexOfRefraction:1.5}:undefined;
