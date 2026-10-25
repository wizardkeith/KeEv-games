import type {NativePart} from './native-characters';
import type {Geometry} from './geometry';
export function garmentSignature(g:Geometry){const s=JSON.stringify([g.positions.map(v=>Math.round(v*1e9)/1e9),g.normals.map(v=>Math.round(v*1e9)/1e9),g.indices]);let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return (h>>>0).toString(16);}
export interface GarmentUV {version:number;surfaces:Record<string,{signature:string;vertices:number[];indices:number[];uvs:number[]}>}
export function applyGarmentUV(parts:NativePart[],data:GarmentUV){
 if(data.version!==1)throw Error('garment UV master not built');
 for(const p of parts)for(const [i,s]of p.recipe.entries())if(s.finish){
  if(s.shape!=='mesh')throw Error('UV authoring expects a real mesh');const a=data.surfaces[p.id+':'+i];if(!a||a.signature!==garmentSignature(s.geometry))throw Error('stale garment UV master '+p.id+':'+i);
  const g=s.geometry;p.recipe[i]={...s,geometry:{positions:a.vertices.flatMap(n=>g.positions.slice(n*3,n*3+3)),normals:a.vertices.flatMap(n=>g.normals.slice(n*3,n*3+3)),indices:[...a.indices],uvs:[...a.uvs]}};
 }
 return parts;
}
