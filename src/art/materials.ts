// Engine-neutral W1.1A material intent. IDs are stable across Web/GLB/native adapters.
export const materialRoles=['wood','paper','fabric','ceramic','glass','metal','skin','hair','leaf','paint','ink'] as const;
export type MaterialRole=typeof materialRoles[number];
export interface MaterialSpec {id:string;roughness:number;metallic:number;ior:number;alphaMode:'OPAQUE'|'BLEND';doubleSided:boolean;note:string;}
const specifications:Record<MaterialRole,MaterialSpec>={
 wood:{id:'mat.warm-wood.v1',roughness:.73,metallic:0,ior:1.5,alphaMode:'OPAQUE',doubleSided:false,note:'Matte timber; recipe geometry and alternating shades supply restrained grain/edge cues.'},
 paper:{id:'mat.soft-paper.v1',roughness:.96,metallic:0,ior:1.45,alphaMode:'OPAQUE',doubleSided:false,note:'Soft off-white paper and page edges; no unbounded glare.'},
 fabric:{id:'mat.woven-fabric.v1',roughness:.94,metallic:0,ior:1.45,alphaMode:'OPAQUE',doubleSided:false,note:'Matte woven intent; seams/folds are geometry, no generated texture.'},
 ceramic:{id:'mat.satin-ceramic.v1',roughness:.34,metallic:0,ior:1.5,alphaMode:'OPAQUE',doubleSided:false,note:'Restricted satin highlight; not mirror glass.'},
 glass:{id:'mat.quiet-glass.v1',roughness:.18,metallic:0,ior:1.45,alphaMode:'BLEND',doubleSided:true,note:'Alpha-blended readable outline. No refraction or dynamic reflection dependency.'},
 metal:{id:'mat.brushed-metal.v1',roughness:.41,metallic:.65,ior:1.5,alphaMode:'OPAQUE',doubleSided:false,note:'Small-area brushed-metal accents only.'},
 skin:{id:'mat.soft-skin.v1',roughness:.83,metallic:0,ior:1.4,alphaMode:'OPAQUE',doubleSided:false,note:'Soft simple skin intent; not a completed toon shader or subsurface pipeline.'},
 hair:{id:'mat.matte-hair.v1',roughness:.79,metallic:0,ior:1.5,alphaMode:'OPAQUE',doubleSided:false,note:'Soft sculpted hair silhouette with restrained highlight.'},
 leaf:{id:'mat.sage-leaf.v1',roughness:.81,metallic:0,ior:1.45,alphaMode:'OPAQUE',doubleSided:false,note:'Matte leaf; no costly translucency renderer.'},
 paint:{id:'mat.soft-paint.v1',roughness:.84,metallic:0,ior:1.5,alphaMode:'OPAQUE',doubleSided:false,note:'Calm painted surfaces and packaging.'},
 ink:{id:'mat.printed-ink.v1',roughness:.90,metallic:0,ior:1.45,alphaMode:'OPAQUE',doubleSided:false,note:'Printed marks and tiny facial features.'}
};
export function materialSpec(role:MaterialRole='paint'):Readonly<MaterialSpec>{return specifications[role];}
export function materialIdentity(role:MaterialRole,color:string,alpha=1){const s=materialSpec(role);return `${s.id}:${color.toUpperCase()}:${alpha}:r${s.roughness}:m${s.metallic}:ior${s.ior}:${s.alphaMode}:ds${Number(s.doubleSided)}:linear-srgb-v2`;}
// Hex palettes are authored in sRGB; PBR factors use linear-light RGB in both engines.
// IEC 61966-2-1 transfer, without engine-specific approximate gamma or renderer state.
export function linearColor(hex:string):[number,number,number]{
 if(!/^#[0-9a-f]{6}$/i.test(hex))throw Error('invalid authored sRGB color');
 return [1,3,5].map(i=>{const c=parseInt(hex.slice(i,i+2),16)/255;return c<=.04045?c/12.92:Math.pow((c+.055)/1.055,2.4);}) as [number,number,number];
}
// Shared neutral adapter contract: renderer/exporter map these explicit values.
export function materialRenderState(role:MaterialRole,color:string,alpha=1){
 const s=materialSpec(role);return {materialId:materialIdentity(role,color,alpha),baseColorLinear:linearColor(color),colorEncoding:'linear-from-authored-srgb',roughness:s.roughness,metallic:s.metallic,indexOfRefraction:s.ior,alpha,alphaBlend:s.alphaMode==='BLEND'||alpha<1,doubleSided:s.doubleSided,backFaceCulling:!s.doubleSided,twoSidedLighting:s.doubleSided};
}
