import{sceneOcclusionIntent,occludedHierarchy}from'./scene-occlusion-intent-v11';
/** C44 changes ONLY the AO radius; every C43 light and other AO value stays fixed. */
export const sceneContactIntent={...sceneOcclusionIntent,id:'v11.c44.localized-contact.v1',radius:.20}as const;
export const contactHierarchy={...occludedHierarchy,id:'v11.c44.same-broad-light.v1',mode:import.meta.env?.VITE_V11_SCENE_WINDOW==='contact'?'contact':'control'};
