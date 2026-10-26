import {grayFormMode,grayFormSurfaces} from './gray-forms-v11';
import flowerC32 from '../../assets/masters/native-v11/display-quality/flower-spray-c33.json';
import linenC32 from '../../assets/masters/native-v11/display-quality/linen-c32.json';
import {designedShape,designedValues} from './form-values-v11';
import flowerC31 from '../../assets/masters/native-v11/display-quality/flower-spray-c31.json';
import linenC31 from '../../assets/masters/native-v11/display-quality/linen-c31.json';
import {brightFlowers,brightLinen} from './bright-masses-v11';
import flowerC29 from '../../assets/masters/native-v11/display-quality/flower-spray-c29.json';
import linenC29 from '../../assets/masters/native-v11/display-quality/linen-c29.json';
import softPetalNormals from '../../assets/masters/native-v11/display-quality/flower-petal-soft-normals.json';
import {tableSoftMaterials,tableLookIntent} from './table-look-v11';
import flowerSpray from '../../assets/masters/native-v11/display-quality/flower-spray.json';
import flowerJug from '../../assets/masters/native-v11/display-quality/flower-jug.json';
import crown from '../../assets/masters/native-v11/display-quality/window-crown.json';
/** C24 standard-quality CENTRAL TABLE slice. Geometry/material assets only;
 * existing mug SKU authority, counts, cost, saves and other displays unchanged.
 * Blender sources are retained beside exact low mesh JSON, not render mockups. */
import mug from '../../assets/masters/native-v11/display-quality/mug.json';
import linen from '../../assets/masters/native-v11/display-quality/linen-rest.json';
import type {NativeSurface} from './native-characters';
export function centralMugRecipe():NativeSurface[]{return structuredClone(mug) as unknown as NativeSurface[];}
export function centralLinenRecipe():NativeSurface[]{if(grayFormMode!=='control')return grayFormSurfaces([structuredClone(grayFormMode==='gray'?linenC32:linenC29)as unknown as NativeSurface]);const p=structuredClone(designedShape?linenC31:brightLinen?linenC29:linen)as unknown as NativeSurface;return [designedValues?{...p,baseColorTexture:'/assets/native-v11/linen-form-values-c31.png'}:p];}

/** Refinish the three EXISTING central decorative lookbooks. Same physical
 * bound mesh and sample count, no new SKU, stock, page or fictional instruction. */
export function centralLookbookRecipe(base:NativeSurface[]):NativeSurface[]{return base.map(p=>p.shape==='mesh'&&p.role==='paper'&&p.roughness===.951?{...p,color:'#FFFFFF',roughness:.96,baseColorTexture:'/assets/native-v11/display-journal-cover.png',geometry:{...p.geometry,uvs:[0,1,1,1,1,0,0,0]}}:p);}

export function windowCrownRecipe():NativeSurface{const g=structuredClone(crown);for(let i=0;i<g.normals.length;i+=3){const length=Math.hypot(...g.normals.slice(i,i+3));for(let k=0;k<3;k++)g.normals[i+k]/=length;}return {shape:'mesh',at:[0,0,0],geometry:g,color:'#FFFFFF',role:'leaf',roughness:.91,baseColorTexture:'/assets/native-v11/window-crown-albedo.png'};}

/** C25: existing central non-stock flower vessel, not the unused high jug. */
export function centralFlowerJugRecipe():NativeSurface[]{return (structuredClone(flowerJug) as unknown as NativeSurface[]).map(p=>{if(p.shape==='mesh')for(let i=0;i<p.geometry.normals.length;i+=3){const length=Math.hypot(...p.geometry.normals.slice(i,i+3));for(let k=0;k<3;k++)p.geometry.normals[i+k]/=length;}return tableSoftMaterials?{...p,roughness:tableLookIntent.material.vesselRoughness}:p;});}

export function centralLegacyFlowerSprayRecipe():NativeSurface[]{const parts=structuredClone(flowerSpray) as unknown as NativeSurface[];if(tableSoftMaterials)for(const patch of softPetalNormals){const p=parts[patch.part];if(p.shape!=='mesh'||p.geometry.normals.length!==patch.normals.length)throw Error('Original petal topology mismatch');p.geometry.normals=[...patch.normals];p.role='paper';p.color='#EDE4D1';p.roughness=.96;}return parts;}

export function centralFlowerSprayRecipe():NativeSurface[]{if(grayFormMode!=='control')return grayFormSurfaces(structuredClone(grayFormMode==='gray'?flowerC32:flowerC29)as unknown as NativeSurface[]);const parts=designedShape?structuredClone(flowerC31)as unknown as NativeSurface[]:brightFlowers?structuredClone(flowerC29)as unknown as NativeSurface[]:centralLegacyFlowerSprayRecipe();return !designedValues?parts:parts.map(p=>{if(p.role!=='paper'||p.shape!=='mesh')return p;const g=p.geometry;if(!g.uvs){const xs=g.positions.filter((_,i)=>i%3===0),lo=Math.min(...xs),width=Math.max(...xs)-lo;g.uvs=Array.from({length:g.positions.length/3},(_,i)=>[(g.positions[i*3]-lo)/(width||1),g.normals[i*3+1]>.0?.08+.24*(1-g.normals[i*3+1]):.88]).flat();}return {...p,color:'#FFFFFF',baseColorTexture:'/assets/native-v11/petal-form-values-c31.png'};});}
