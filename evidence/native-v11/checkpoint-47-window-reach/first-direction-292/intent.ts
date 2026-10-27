import type{WindowLightConfig}from'./scene-window-light-v11';import{daylightHierarchy}from'./scene-daylight-intent-v11';
/** C47 direction-only control. Rotate around the actual aperture centre at the
 * same91.901m distance; source candela, cone, fill and all shading remain C46. */
const distance=Math.hypot(...daylightHierarchy.position.map((v,i)=>v-daylightHierarchy.target[i])),slope=.30,azimuth=-.22,norm=Math.hypot(1,slope,azimuth);
export const windowReachHierarchy:WindowLightConfig={...daylightHierarchy,id:'v11.c47.window-direction-reach.v1',mode:import.meta.env?.VITE_V11_SCENE_WINDOW==='reach'?'reach':'control',position:daylightHierarchy.target.map((v,i)=>v-distance*[1,-slope,azimuth][i]/norm)as[number,number,number],limits:'C47 rotates only the C46 light direction/elevation around the unchanged window target at fixed source distance. All candela/cone/range/fill/exposure/softness/AO/assets/reflection unchanged. Explicit authoring comparison, no default or target acceptance.'};
