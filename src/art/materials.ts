// Engine-neutral W1.1A material intent. IDs are stable across Web/GLB/native adapters.
export const materialRoles=['wood','paper','fabric','ceramic','glass','metal','skin','hair','leaf','paint','ink'] as const;
export type MaterialRole=typeof materialRoles[number];
export interface MaterialSpec {id:string;roughness:number;metallic:number;ior:number;alphaMode:'OPAQUE'|'BLEND';note:string;}
const specifications:Record<MaterialRole,MaterialSpec>={
 wood:{id:'mat.warm-wood.v1',roughness:.73,metallic:0,ior:1.5,alphaMode:'OPAQUE',note:'Matte timber; recipe geometry and alternating shades supply restrained grain/edge cues.'},
 paper:{id:'mat.soft-paper.v1',roughness:.96,metallic:0,ior:1.45,alphaMode:'OPAQUE',note:'Soft off-white paper and page edges; no unbounded glare.'},
 fabric:{id:'mat.woven-fabric.v1',roughness:.94,metallic:0,ior:1.45,alphaMode:'OPAQUE',note:'Matte woven intent; seams/folds are geometry, no generated texture.'},
 ceramic:{id:'mat.satin-ceramic.v1',roughness:.34,metallic:0,ior:1.5,alphaMode:'OPAQUE',note:'Restricted satin highlight; not mirror glass.'},
 glass:{id:'mat.quiet-glass.v1',roughness:.18,metallic:0,ior:1.45,alphaMode:'BLEND',note:'Alpha-blended readable outline. No refraction or dynamic reflection dependency.'},
 metal:{id:'mat.brushed-metal.v1',roughness:.41,metallic:.65,ior:1.5,alphaMode:'OPAQUE',note:'Small-area brushed-metal accents only.'},
 skin:{id:'mat.soft-skin.v1',roughness:.83,metallic:0,ior:1.4,alphaMode:'OPAQUE',note:'Soft simple skin intent; not a completed toon shader or subsurface pipeline.'},
 hair:{id:'mat.matte-hair.v1',roughness:.79,metallic:0,ior:1.5,alphaMode:'OPAQUE',note:'Soft sculpted hair silhouette with restrained highlight.'},
 leaf:{id:'mat.sage-leaf.v1',roughness:.81,metallic:0,ior:1.45,alphaMode:'OPAQUE',note:'Matte leaf; no costly translucency renderer.'},
 paint:{id:'mat.soft-paint.v1',roughness:.84,metallic:0,ior:1.5,alphaMode:'OPAQUE',note:'Calm painted surfaces and packaging.'},
 ink:{id:'mat.printed-ink.v1',roughness:.90,metallic:0,ior:1.45,alphaMode:'OPAQUE',note:'Printed marks and tiny facial features.'}
};
export function materialSpec(role:MaterialRole='paint'):Readonly<MaterialSpec>{return specifications[role];}
export function materialIdentity(role:MaterialRole,color:string,alpha=1){return `${materialSpec(role).id}:${color.toUpperCase()}:${alpha}`;}
