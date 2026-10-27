/** C39 independently passed material values on the accepted C38 forms.
 * V11 development default. No geometry, inventory, camera, light or shared finish edits. */
import type{NativeSurface}from'./native-characters';
const request=import.meta.env?.VITE_V11_BACKWALL_MATERIAL;
export const backwallMaterialMode=request==='base'||request==='control'?request:'values';
export const backwallMaterialActive=backwallMaterialMode==='values'&&(import.meta.env?.VITE_V11_BACKWALL_FORMS===undefined||import.meta.env?.VITE_V11_BACKWALL_FORMS==='shape');
export type BackwallMaterialScope='none'|'shelf'|'trailing'|'near'|'exterior'|'merch'|'work';
export const backwallShelfAlbedo='/assets/native-v11/display-oak-albedo.png';
export const backwallFarCrownRoughness=.925;
export const backwallFarCrownPalette=['#C3D1BD','#D5DDD0']as const;
export const backwallSkyPalette=['#E8ECDD','#DCE8E4','#CCE0E9','#BFDAE8']as const;
export const backwallMaterialIntent={id:'v11.c39.backwall-window-material',mode:backwallMaterialMode,active:backwallMaterialActive,defaultAdopted:true,geometry:'Exact passed C38/253 positions, normals, UV, counts and camera',scope:'Back-wall shelf planes versus preserved original merchandise coatings, trailing plants, near window foliage, existing exterior and geometric sky only',shelf:{albedo:backwallShelfAlbedo,tint:'#E4CFAB',roughness:.66,tableAO:false},farCrown:{roughness:backwallFarCrownRoughness,thinTransmission:false},limits:'C39 narrow material PASS; V11 development adoption, not whole-target or public release acceptance'}as const;
export function backwallMaterialSurfaces(parts:NativeSurface[],scope:BackwallMaterialScope):NativeSurface[]{
 if(!backwallMaterialActive)return parts;
 return parts.map(p=>{
  if(scope==='shelf'&&p.role==='wood')return{...p,color:'#E4CFAB',roughness:.66,baseColorTexture:backwallShelfAlbedo};
  if(scope==='trailing'){
   const leaf:Record<string,string>={'#738C54':'#78945B','#91A665':'#9FB579','#A6B97C':'#BDCB91'};
   // Middle green is shared with accepted foreground botanicals: retain it
   // rather than split an18th styling material or recolor the foreground.
   if(p.role==='leaf'&&p.color==='#91A665')return p;
   if(p.role==='leaf'&&leaf[p.color])return{...p,color:leaf[p.color],roughness:.82};
   if(p.role==='ceramic'&&p.color==='#B6A17F')return{...p,color:'#C8B88F',roughness:.80};
  }
  if(scope==='near'&&p.role==='leaf'){
   const leaf:Record<string,string>={'#789951':'#668A52','#A4B96B':'#90AE65','#C3CE85':'#BCD28A','#8DA95B':'#7F9F5D'};
   return{...p,color:leaf[p.color]??p.color,roughness:.78};
  }
  if(scope==='exterior'){
   const colors:Record<string,string>={'#7D8D95':'#94A4A4','#969C9D':'#A8B5B0','#879392':'#CBD0BC','#E2D8C2':'#E4DCC8','#CCD6CE':'#D6DDD0','#DDD8C5':'#E6E5D4','#819A9D':'#B3C4C0','#9FB9B0':'#C3D1BD','#B6C8BE':'#D5DDD0','#8F9C90':'#AAB5A4'};
   const color=colors[p.color]??p.color;
   if(p.role==='leaf')return{...p,color,roughness:!p.baseColorTexture&&p.roughness===.91?backwallFarCrownRoughness:.87};
   if(p.role==='paint')return{...p,color,roughness:.90};
   if(p.role==='glass')return{...p,color,roughness:.44};
   if(p.role==='wood')return{...p,color,roughness:.92};
  }
  return p;
 });
}
