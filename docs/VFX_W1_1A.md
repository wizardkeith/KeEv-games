# W1.1A presentation implementation and budgets

All presentation is downstream of committed Saves results; it has no core command, inventory, money, time or schema authority. `FeedbackProjector` reads actual eventSequence, purchases, recovery.total, shelf and revealed transitions. Loading/importing/reloading/mode changes are baselines. Repeated revisions and duplicate commands do not create feedback. At most 64 recent IDs are retained; the scene owns one major transient and no queue. If a single live transaction includes both a sale and another change, it aggregates real sale units once and prioritizes reveal, support, sale, restock, display in that order; it never invents a coin or a customer sale.

| ID | Trigger | Bound / appearance | Static / Low / reduced |
|---|---|---|---|
| fx.shelf.selection.v1 | selected slot changes | 180ms quiet lavender rim to steady selection | steady immediately |
| fx.display.settle.v1 | committed changed shelf | 200ms settling, max 0.025m lift | immediate final position |
| fx.sale.receipt.v1 | actual eventSequence increases | one 700ms sage counter receipt + aggregate text | result text only |
| fx.stock.receipt.v1 | successful purchase amount increases | one 600ms warm paper receipt + stock text | result text only |
| fx.support.receipt.v1 | recovery.total increases | one 700ms lavender receipt + support text | result text only |
| fx.sample.open.v1 | successful reveal false→true | 1100ms local proxy lid/opening and soft emissive centre; completion card is already committed, skip cancels only presentation | immediate completion |
| fx.window.dust.v1 | visible High only | pool 8, 12s phase lifetime, effective 8/12 per second, max alpha .13, 0.018m; localized x near window, y .7–2.3 | disabled |

The sample proxy is independent of the real parcel, which hides as soon as the saved state is revealed. It does not alter the save or wait for an animation callback. Its light is a small self-emissive mesh, not a whole-scene glow or dynamic light. The completed journal card remains available after skipping, mode changes or reloading. This is the existing zero-stat tutorial sample, not a newly invented canon object.

One render callback owns dust, semantic head/arm pivots, selection and major FX. Delta time clamps to 50ms. Hidden pages cancel transients, pause ambient time and reset the previous-frame timestamp, so returning cannot accumulate a long step. Low / Minimal / Reduce Motion cancel the active scene feedback and disable dust/local character motions. Scene disposal cancels the clock, stops the loop, removes owned observers/listeners, and disposes the scene/engine. There is one UI-only 1100ms card timer, cleared on skip, hide/mode/load or replacement, plus the existing notification timer; neither updates 3D or economy.

The Minimal effects preference uses `shop.presentation.v1` only. It is not a Snapshot field and cannot affect portable economy saves. Sound stays opt-in and uses the original retained `sale.wav` at .12 playback volume. There is no new audio, steam, bloom, DoF, refraction pass, dynamic reflection, weather, or character gait. Customers stand in fixed, distinct clear positions; only local head/arm pivots move slightly in full presentation mode. Staff remains still. Characters are generic rather than named cast.

## Resource accounting

- Additional FX pool: 12 meshes total (8 dust, 1 shared receipt, 3 sample proxy). One major transient, zero queue. No new lights, shadow casters, render targets, dynamic textures or texture bytes. Disabled meshes remain allocated in a finite pool.
- `scene-budget.json` counts authored material groups and indices from the actual recipe functions, including disabled crowd/FX. It is a source inventory, not active draw calls, GPU allocation or measured FPS. Old empty/max-stocked: 123/171 meshes and 35 material identities. New empty/max-stocked: 173/233 meshes and 64 material identities; max-stocked 28,378 vertices and 32,736 triangles. The increase includes material separation, product details and semantic actor parts, not just VFX.
- Low stops dust, major transients and local actor motion before dropping to one decorative customer, 1.5 hardware scaling and alternate shadow refresh. Auto uses the existing measured visible p75 >35ms after 90 samples threshold to choose Low. No FPS result exists while WebGL cannot start.
- Exact local production bytes/gzip-9 and the W1.1 baseline are recorded under evidence/w1_1a. Retained old/new GLBs are included in site files for interchange but are not additional runtime scene requests; the world builds from shared recipes.

Engine-neutral IDs, durations, colors, cap and policy are exported to `assets/authoring/w1_1a/vfx.json`. Unity/native needs clock/pool/input/audio/URP adapters, physical-device testing and separate visual approval. C# experiment remains frozen, PORT_REQUIRED_FOR_UNITY; no native implementation or compatibility claim is made.

Capability references (implementation uses installed Babylon 8.32.0 APIs): https://doc.babylonjs.com/features/featuresDeepDive/particles/ and https://doc.babylonjs.com/features/featuresDeepDive/mesh/glowLayer/ . This candidate deliberately uses finite geometry pools and local emissive material without a GlowLayer pass.
