# W1.1 living-diorama art candidate

The original Bible remains the baseline. This is a warmer, more legible first art candidate for the existing ten-product shop. It is not the final Tokyo slice or an approved production character pipeline.

## Concrete changes

- Real 3D cream shell with an actual side-window opening, inset timber frames, alternating warm floor boards, lower skirting, pendant shades, framed neutral plant studies and a sage entry rug. No backdrop, video or CSS shop substitute.
- Shared geometry builder creates genuinely rounded corners with explicit normals. Counter has inset front panels, softened timber edges, a register, screen and wrapping surface. Open-leg display tables include a lower shelf and physical blank price-card holders.
- All ten Offering IDs have original matching geometry. Notebook has pages, spine and elastic band; pencil has a sharpened tip and eraser; mug has an open-looking inset top and separate loop handle; tote has two handles and a stitched-looking label. Tea tin, biscuit, postcard, folded towel, tray and vase have separate silhouettes.
- Static window-direction sunlight and broad hemispheric fill light cast filtered shadow maps from stock, furniture and people onto the floor. Warm light and matte PBR material intent replace the old uniform flat block palette. No expensive post-processing, particles or dynamic lights were added.
- Generic staff has a soft 3.5-head silhouette, apron, eyes, hair and shoes. Generic decorative customers are enabled only when the open flag and Tokyo trading hours both apply. They are decorative and do not generate transactions. No Misaki, Ren or Momo was introduced.
- Selected shelf has a lavender floor rim. Geometry metadata routes all shelf/product clicks to the same slot callback. Product count follows committed inventory and is capped at four representative objects per display.

## Runtime contract

`createWorld` retains `update(snapshot)`, `quality(value)`, `zen(value)`, `metrics()`, `dispose()`. Added `layout(panelOpen)` and `selected(slot)` for the UI. The world also measures current `.top`, `.bottom` and `.sidebar` bounds and sets its camera viewport to the actual free rectangle on update/resize. Angle remains 35–45 degrees above the floor, yaw limited to ±0.27 radians, zoom bounded around composition. Babylon owns presentation only.

All grouped mesh creation reads the pure `src/art/recipes.ts` and `src/art/geometry.ts`. No active economy, content ID, price, schema or stored layout is owned by the renderer. W0 masters are retained unchanged. The richer counter uses the existing placement and owns a new visual asset ID; the authoritative layout ID remains `layout.graybox.1`.

## Rebuild and interchange

Run `node --import tsx tools/art-w1_1.ts`. It exports and validates:

- 15 glTF 2.0 binary masters in `assets/masters/w1_1/`.
- Corresponding Web derivatives in `public/assets/w1_1/`; these are lossless byte copies, retained for interchange. Web runtime builds directly from the exact same source recipes, so it need not download the GLBs again.
- Full per-asset source, stable ID, unit/axis/pivot, SHA256, size, licence and validation metadata in `assets/authoring/w1_1/manifest.json`.
- Validator results in `evidence/art-w1_1-validation.json`.

Geometry is original project procedural authoring, with no third-party models or copied imagery. All model dimensions are metres, right handed, +Y up, +Z forward. Models have a local floor pivot, except the room where floor is at y=0 and plinth extends below. Materials have explicit colors, roughness 0.88, metalness 0; the side-window glass is alpha blended. No texture files were necessary, so the geometry/recipe source is the master rather than an invented Blender or bitmap source. Generic staff is a static model; the pre-existing rig interoperability fixture is retained separately.

## Performance and diagnostic policy

Mesh parts are grouped per material to reduce draw calls. There are only two lights, one 1024 shadow map and no per-product lights. `low` renders at hardware scaling 1.5, updates its shadow map every second frame, and reduces decorative customers from two to one. `auto` starts at high, measures at least 90 valid visible frame intervals, and lowers quality when p75 exceeds 35 ms. It does not promise a target FPS and does not silently re-upgrade. Explicit quality change resets the sample window.

Hidden-tab intervals reset the sample origin. Gaps ≥250 ms are excluded as interrupted samples. Metrics expose visible sample count, observed intervals, effective quality, renderer and viewport. Startup world-ready timestamp is fixed only after `scene.whenReadyAsync()` completes. No benchmark result is inferred from this implementation.

## Evidence and limits

Khronos GLB structural validation: 15 models, zero errors and zero warnings; see generated evidence. Independent loader results are recorded separately. Root task owns actual WebGL/browser composition QA; structural validation and NullEngine import must not be described as rendered evidence. Unity/URP, native materials, skinning/controllers, Android, iOS, physical touch and device performance remain NOT TESTED. In native engines the shared geometry and numeric material intent are reusable, while camera viewport behavior, Babylon PBR shading, shadow filtering, input, diagnostics and controllers require adapters and visual verification.
