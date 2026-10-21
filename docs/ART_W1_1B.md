# W1.1B — focused Living Diorama art candidate

2026-10-22 (Hong Kong). Extends accepted UI v6 / b093c50fa13cfca80c8b10fdfd96e716114a2d7d and the closed W1.1A1 corrections. Actual owner-provided BEFORE screenshots are available and were viewed. Current source candidate AFTER appearance remains pending real WebGL confirmation.

## Evidence and diagnosis

Viewed the three original PNGs (Zen, stock panel, stocked shelf) and MP4 frames at 12s / 18s. The original video is 19.866633s, 1862×1206, recorded at30fps; this is not game FPS. Original PNG copies, extracted frames and hashes are in evidence/art_2026_10_22/before/. The original22MB video remains in its supplied file history; its exact reference/hash is recorded in before-evidence.json.

Observed: similar pale middle values across timber/skin/clothes/walls, weak feet/product contacts, small items/face in the main view. Images alone do not identify a single exposure cause. Source inspection additionally found sRGB hex components passed directly as linear PBR albedo/factors, and actual unsupported gaps beneath fixtures. These are actionable contributors, not a claim that a parameter set is already visually approved.

## A — color interpretation, value separation and existing lights

src/art/materials.ts now defines an explicit IEC sRGB→linear transfer. Authored hex colors remain sRGB; runtime PBR albedo and glTF baseColorFactor receive the same decoded linear triples exactly once. Alpha remains unchanged. Material identity includes an encoding revision, while role IDs, sidedness, alpha policies, roughness, metallic and IOR intent remain intact. The retained historical exports deliberately keep their original interpretation.

Primary standard: Khronos glTF baseColorFactor is a linear multiplier (https://github.com/KhronosGroup/glTF/blob/main/specification/2.0/schema/material.pbrMetallicRoughness.schema.json). Installed Babylon8.32.0 source confirms that glTF factors become Color3 directly; the runtime shader also consumes albedoColor directly. Both adapters are now aligned with the authoring color space. The neutral transfer is engine-independent; no Babylon approximation or extra color texture is required.

src/art/recipes.ts retains cream walls and ivory paper, adds a separate lighter tabletop, slightly deeper honey/walnut structure and restrained alternating floorboard tones. Hair uses its own deeper brown; warm skin, ivory apron and lavender/sage/rose clothes separate the three large character color blocks. Existing paper edges, cloth seams, satin ceramic roughness and corrected mug geometry remain.

src/art/direction.ts records portable intent and Babylon adapter settings. The same hemisphere and directional light remain: a warm window key and more neutral/cool fill, rather than globally increasing exposure. Key direction/intensity, fill/ground tint and color decoding are adjusted together. No tone-map/exposure increase, environment texture, reflection pass or postprocess was added. The scene is still intentionally static day lighting, unrelated to Tokyo's current trading time.

## B — support geometry, resting points and shadow path

The original display legs ran from localy=.14 to.86 with a worldbase=.08; the floor top is.079, leaving a real.141m gap at the feet. The counter body had the same unsupported bottom. The display's existing four rounded posts now reach localy=0 and overlap the tabletop underside; the counter's original body extends down to0 while retaining its old top. No mesh/triangle count is added by these dimension changes. This is a small grounding correction prompted by the contact observation; it does not reopen mugs, tote handles or character topology.

Floor fixtures now rest at.08 (1mm above the.079 floor). Staff/customers retain their X/Z/yaw and fixed distinct standing places, with only a2.5cm vertical adjustment to place shoes at the floor. Existing parcel and plants receive matching small vertical resting adjustments. Back-shelf decorations rest just above the shelf surface. These are existing decorations, not injected sellable stock.

Saleable products use the measured display surface1.0725m plus a1mm clearance. The old generic1.08m anchor and alternating6mm extra offset are removed. The settling animation adds its existing lift to that exact anchor and returns to it. Stock, count, IDs, transaction targets and lifecycle semantics are unchanged.

The existing1024 shadow map remains. normalBias .025→.008, bias .001→.0005, darkness .28→.18; High uses PCF medium, Low returns to PCF low with the original alternate refresh and1.5 hardware scaling. The room's existing dark supports can cast, and a new tabletop wood grouping adds one opaque caster grouping. No screen-space AO, contact decals, added light or extra shadow map was introduced. These renderer values are adapter-specific and may still require visual adjustment for acne/float/softness after an actual render.

## C — curated framing

The existing ArcRotateCamera controls, yaw range±.27rad, beta45–55° (35–45° elevation), no panning and limited zoom remain. Source resize still reserves the actual top/header, footer and desktop/right or narrow/bottom panel viewport. Within that reserved viewport the candidate prefers12% less distance, then fits the existing room/plinth/wall hull with a6% total safe margin and a small numerical guard. A slightly forward focal point balances the footprint against wall height.

For aspect1.6, radius15.8→14.3298545, about9.3% closer after the fit guard. This is a candidate framing result, not a claim of a verified screenshot. Narrow views may need more distance to keep the full hull visible; they are not forced into the same percentage. Once framed, ordinary updates with the same composition preserve player zoom. No free-camera rewrite or fixed panel/world ratio was introduced.

A test projects the hull through actual Babylon RH view/projection matrices in five viewport shapes and231 yaw/beta samples each. This catches clipping/presentation-coordinate errors, but cannot certify mesh occlusion, picking comfort, actual face readability or GPU quality.

## D/E — materials and existing effects

The same semantic PBR roles and separate material policies remain. Correct color interpretation, value separation, physical resting points and key/fill changes are the targeted material improvements. No extra identical role labels, new texture or unverified surface detail is being presented as the result.

Selection, settling, receipt, sample opening, dust, fixed customer local motions and all accepted hide/resume/skip/dedup rules remain. Original effect IDs, duration,12-mesh pool, queue0, Minimal/Reduce Motion, economic projection and cancellation are unchanged. No new intensity tuning is made without a real AFTER recording; the shared correct color interpretation naturally applies to existing colored geometry too. No new weather, steam, bloom, DoF, walk cycle or named character content.

## Versioned assets and preservation

- Current command: node --import tsx tools/art-w1_1b.ts.
-15 current masters under assets/masters/w1_1b/, and15 exact public derivatives under public/assets/w1_1b/.
- assets/authoring/w1_1b/manifest.json includes hashes, semantic PBR values, authored sRGB and linear factors; presentation-intent.json retains lighting/framing/ground/quality intent and native limits.
-15 GLBs total503,056bytes, zero Khronos errors/warnings. This is file size, not observed download size. The runtime still generates meshes from the shared recipes and does not request these GLBs.
- Original W1.1, W1.1A and W1.1A1 outputs remain byte-identical. Exact accepted W1.1A1 geometry/material/recipe/world/exporter/validator source is frozen under assets/authoring/w1_1a1/source_snapshot/ with canonical commit/hash provenance. tools/art-w1_1.ts now imports those historical inputs so its command cannot silently overwrite accepted masters with current colors.
- No external artwork, model, texture, font or licence was introduced. Original project procedural source and reusable engine-neutral exchange geometry remain.

## Tests and resource budget

Original57 named cases retained, plus5 focused cases: IEC transfer/alpha; actual exported factors and parity; real camera projection bounds; actual fixture/actor/product resting gaps; historical assets/source hashes. Existing runtime-vs-GLB parity reads the current manifest; original mug ray tests still compare the accepted historical GLB. Total62 PASS. Current15 GLBs independently import with77 material policies checked; NullEngine is structural/headless evidence, never visual acceptance.

Source inventory (includes disabled crowd/effect pool): empty173→174 material-group meshes; worst-stocked233→234; material identities64→66; registered opaque caster groupings144→146 empty /204→206 stocked. Vertices/triangles unchanged:23,450/27,756 empty;28,394/32,748 worst-stocked. The increase is one split wood grouping and two role/color identities, not new product instances. VFX pool12 and all effect costs unchanged. High PCF filtering adds sampling work; Low preserves the cheap filter. No GPU time/FPS/memory/draw-call result is claimed.

UI v6, five-language174keys, fonts, main/boot, core, storage, time, catalog, schema2, simulationts-w1-2, content IDs, player progress and economic rules remain unchanged. Content validator and normal production build pass; original large-chunk warning remains.

## Actual visual boundary

Supported managed Chrome QA still reports Error: WebGL not supported (recorded in evidence/art_2026_10_22/webgl-errors.json). Its fallback UI loads the existing isolated review progress, cash¥51,400. No player DB, transaction, import/reset or fake stock was used for imagery. Thus: real BEFORE evidence has been viewed; current AFTER source candidate is complete, but AFTER appearance and actual effect rhythm remain pending. No blank canvas, AI image, NullEngine result or recording framerate is offered as a rendered result.

Publish this candidate to the same public Site. Compare the same owner progress, viewport, quality and camera angle in Zen plus one shelf2 operation view; no re-buy/reset needed. Evaluate brightness/detail, support contacts, entire framing and hair/skin/apron first. If practical, one short ordinary interaction recording can later assess existing FX. Native Unity/URP/Android/iOS remain separate adapter/device gates.


Acceptance addendum (2026-10-22): subsequent user AFTER video completed the independent scoped desktop static3D review; W1.1B/v7 accepted. Historical pending wording describes production time only. Correct master total is503,056bytes; assets/manifest were already correct. See current HANDOFF for new Day1 candidate limits.
