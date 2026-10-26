/** C32 gray-model gate only. No authored tones/textures until independent pass. */
import type{NativeSurface}from'./native-characters';
const requested=import.meta.env?.VITE_V11_GRAY_FORMS;
export const grayFormMode=requested==='old-gray'||requested==='gray'?requested:'control';
export const grayFormColor='#A5A5A5',grayFormRoughness=.801;
export const grayFormIntent={id:'v11.c32.three-cluster-continuous-turn',mode:grayFormMode,scope:'Only existing flower crown +linen; same C27 positions/cup supports/vase/books/furniture,201 lights/camera and192 reflection',material:'One shared plain gray PBR, no albedo/normal/ORM/texture or designed value. Temporary diagnostic material, not production integration',shape:'One high main, two lower depth-staggered overlapping cluster surfaces; support-free raised cloth forms and continuous variable-radius corner into two unequal inward main folds',limits:'Independent normal480px and two-oblique gray gate pending; no authored material work or target acceptance'}as const;
export function grayFormSurfaces(parts:NativeSurface[]):NativeSurface[]{return parts.map(({baseColorTexture:_,finish:__,...p})=>({...p,color:grayFormColor,roughness:grayFormRoughness,role:'fabric'}as NativeSurface));}
