/** Bounded C28 material/light A/B. Compile-time modes, never a player option.
 * Default is the current candidate only; final pixels decide whether it stays.
 * C27 composition/positions/counts are independent and immutable in this slice. */
const requested=import.meta.env?.VITE_V11_TABLE_LOOK;
export const tableLookMode: 'control'|'material'|'lighting'|'combined'=requested==='control'||requested==='material'||requested==='lighting'?requested:'combined';
export const tableSoftMaterials=tableLookMode==='material'||tableLookMode==='combined';
export const tableContactLighting=tableLookMode==='lighting'||tableLookMode==='combined';
export const tableLookIntent={id:'v11.c28.central-material-contact',mode:tableLookMode,composition:'C27 positions, size, stock groups and actual world-space support unchanged',material:{vesselRoughness:.56,coatIntensity:.22,coatRoughness:.38,petals:'Existing closed vertices/indices; softly bent two-sided normals and existing warm-white matte paper batch, no new batch or petals',linenSheen:.24},contact:{size:1024,shadowMinZ:.2,shadowMaxZ:5,normalBias:.0003,bias:.00005,lightSizeUVRatio:.065,darkness:.12,light:'existing central practical, position/direction/intensity unchanged; no LTC, added light or shadow image',low:'existing central light disabled; contact target not rendered'},limits:'Bounded actual-game A/B candidate, not original-target acceptance or physical GPU performance'}as const;
