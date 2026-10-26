/** C24 standard-quality CENTRAL TABLE slice. Geometry/material assets only;
 * existing mug SKU authority, counts, cost, saves and other displays unchanged.
 * Blender sources are retained beside exact low mesh JSON, not render mockups. */
import mug from '../../assets/masters/native-v11/display-quality/mug.json';
import linen from '../../assets/masters/native-v11/display-quality/linen-rest.json';
import type {NativeSurface} from './native-characters';
export function centralMugRecipe():NativeSurface[]{return structuredClone(mug) as unknown as NativeSurface[];}
export function centralLinenRecipe():NativeSurface[]{return [structuredClone(linen) as unknown as NativeSurface];}
