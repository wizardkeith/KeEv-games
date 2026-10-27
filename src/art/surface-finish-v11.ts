import {tableSoftMaterials,tableLookIntent} from './table-look-v11';
/** Authored textile/leather inputs for the customer wardrobe slice. Neutral
 * albedo modulates the existing dye palette; it does not change item identity. */
export type SurfaceFinish='knit'|'linen'|'canvas'|'leather'|'celadon'|'wicker'|'oak-floor'|'stoneware'|'display-linen'|'display-oak';
export const surfaceFinishSpec=(finish:SurfaceFinish)=>({
 baseColor:`/assets/native-v11/${finish}-albedo.png`,normal:`/assets/native-v11/${finish}-normal.png`,orm:`/assets/native-v11/${finish}-orm.png`,
 repeat:['celadon','oak-floor','stoneware','display-linen','display-oak'].includes(finish)?1:finish==='canvas'?5:4,normalScale:finish==='display-oak'?.08:finish==='display-linen'?.10:finish==='stoneware'?.06:finish==='oak-floor'?.06:finish==='wicker'?.12:finish==='celadon'?.06:finish==='knit'?.16:finish==='linen'?.07:finish==='leather'?.16:.14,
 sheen:finish==='display-linen'?(tableSoftMaterials?tableLookIntent.material.linenSheen:.16):finish==='knit'?.18:finish==='linen'?.07:0,sheenRoughness:finish==='knit'?.78:.86,
});
