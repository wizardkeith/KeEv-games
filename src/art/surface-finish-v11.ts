/** Authored textile/leather inputs for the customer wardrobe slice. Neutral
 * albedo modulates the existing dye palette; it does not change item identity. */
export type SurfaceFinish='knit'|'linen'|'canvas'|'leather'|'celadon'|'wicker';
export const surfaceFinishSpec=(finish:SurfaceFinish)=>({
 baseColor:`/assets/native-v11/${finish}-albedo.png`,normal:`/assets/native-v11/${finish}-normal.png`,orm:`/assets/native-v11/${finish}-orm.png`,
 repeat:finish==='celadon'?1:finish==='canvas'?5:4,normalScale:finish==='wicker'?.12:finish==='celadon'?.06:finish==='knit'?.16:finish==='linen'?.07:finish==='leather'?.16:.14,
 sheen:finish==='knit'?.18:finish==='linen'?.07:0,sheenRoughness:finish==='knit'?.78:.86,
});
