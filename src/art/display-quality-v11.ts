import crown from '../../assets/masters/native-v11/display-quality/window-crown.json';
/** C24 standard-quality CENTRAL TABLE slice. Geometry/material assets only;
 * existing mug SKU authority, counts, cost, saves and other displays unchanged.
 * Blender sources are retained beside exact low mesh JSON, not render mockups. */
import mug from '../../assets/masters/native-v11/display-quality/mug.json';
import linen from '../../assets/masters/native-v11/display-quality/linen-rest.json';
import type {NativeSurface} from './native-characters';
export function centralMugRecipe():NativeSurface[]{return structuredClone(mug) as unknown as NativeSurface[];}
export function centralLinenRecipe():NativeSurface[]{return [structuredClone(linen) as unknown as NativeSurface];}

/** Refinish the three EXISTING central decorative lookbooks. Same physical
 * bound mesh and sample count, no new SKU, stock, page or fictional instruction. */
export function centralLookbookRecipe(base:NativeSurface[]):NativeSurface[]{return base.map(p=>p.shape==='mesh'&&p.role==='paper'&&p.roughness===.951?{...p,color:'#FFFFFF',roughness:.96,baseColorTexture:'/assets/native-v11/display-journal-cover.png',geometry:{...p.geometry,uvs:[0,1,1,1,1,0,0,0]}}:p);}

export function windowCrownRecipe():NativeSurface{const g=structuredClone(crown);for(let i=0;i<g.normals.length;i+=3){const length=Math.hypot(...g.normals.slice(i,i+3));for(let k=0;k<3;k++)g.normals[i+k]/=length;}return {shape:'mesh',at:[0,0,0],geometry:g,color:'#FFFFFF',role:'leaf',roughness:.91,baseColorTexture:'/assets/native-v11/window-crown-albedo.png'};}
