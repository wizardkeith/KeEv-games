export interface PresentationPreferences {minimalFX:boolean}
export const presentationKey='shop.presentation.v1';
export function readPreferences(key=presentationKey):PresentationPreferences {try{const p=JSON.parse(localStorage.getItem(key)||'{}');return {minimalFX:p.minimalFX===true};}catch{return {minimalFX:false};}}
export function savePreferences(p:PresentationPreferences,key=presentationKey){try{localStorage.setItem(key,JSON.stringify(p));}catch{/* Presentation preference only; no simulation write. */}}
