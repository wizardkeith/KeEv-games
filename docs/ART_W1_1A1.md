# W1.1A1 narrow art corrections: mug and material parity

Extends the same Bible and current W1.1A candidate. This source/asset correction does not change product IDs, economy, storage, canon, shader family or engine version. Actual WebGL appearance remains a separate visual gate.

## A1 — closed wall thickness, open cavity, attached handle

The prior rim ended at radius 0.108 m while the outer shell reached 0.1175 m. The corrected rim is a torus with outer diameter 0.235 m, tube diameter 0.019 m, and 12 angular segments matching both cup walls. At the authored wall-top height y=0.235 m, its outer boundary is radius 0.1175 m and inner boundary is radius 0.0985 m, sharing actual boundary vertices with the outer/inner shell. It covers the complete polygonal wall band rather than adding a patch under one reviewer ray. Its central hole remains empty and the inner floor remains visible.

The handle is a capped C-shaped tube in the XY plane, from angle -2.2 to +2.2 radians, centered at [0.155, 0.125, 0] m. It has 28 longitudinal segments and the existing six-sided tube section. This corrects both the old orientation and floating separation. The two ends intersect only the cup wall region; the handle does not enter the cup cavity or cover the cup mouth. The middle handle aperture remains open. The two contacts are shallow overlapping ceramic volumes rather than a fabricated welded-topology claim.

The geometry builder now supports optional torus `segments` and `arc:[start,end]`. Partial arcs receive proper end caps with inverse-scale cap normals; other existing toruses keep their prior default resolution and full sweep.

### Direct geometry evidence

Five new focused tests are in `tests/art-w1_1a1.test.ts`:

1. Both rim boundary loops match the authored wall-top vertices. 108 downward rays sample three positions across the polygonal wall band at 36 angular positions; they meet the rim at or above the wall top. A central ray enters the cavity and first reaches the inner floor at y=0.0335 m. Selected source/actual-GLB ray hits match within 1e-7 m.
2. Horizontal rays at y=0.070 m and y=0.180 m prove upper/lower contact. The body surface x=0.1175 m lies strictly inside handle entry/exit intersections. At each location the first handle interval starts at x≈0.111811517 m, giving ≈0.005688483 m of overlap into the wall before its outer face. All source and actual-GLB intersection distances at those heights agree within 1e-7 m. This checks actual triangle intersections and solid intervals, not overlapping AABBs alone. Handle vertices stay beyond inner radius 0.0985 m; a ray through the handle aperture remains clear.
3. Every handle normal is finite/unit, both cap normals are perpendicular to their actual stretched cap planes, and every retained triangle is nondegenerate with normal-consistent winding.
4. The actual runtime `material()` function is extracted from `src/world.ts`, transpiled and executed with the project Babylon version, then compared with actual independently imported GLB materials (see A2).
5. Published W1.1A master/Web hashes remain unchanged and exact baseline authoring-source hashes are frozen.

These are math, triangle-ray and interchange assertions. They do not establish the visual prominence of the old defects or prove rendered quality.

## A2 — shared sidedness and render identity

`MaterialSpec.doubleSided` is explicit for every role. `glass` is double-sided to preserve readable transparent window/screen surfaces from permitted camera directions. The closed surface roles remain single-sided; the mug has explicitly authored inner walls and does not need a blanket double-sided ceramic workaround.

`materialIdentity` now includes the semantic ID, color, alpha, roughness, metallic, IOR intent, alpha mode and sidedness. `grouped()` uses that key. New neutral `materialRenderState(role,color,alpha)` supplies the exact key and renderer flags: alpha, alphaBlend, backFaceCulling, twoSidedLighting and doubleSided, plus roughness/metallic/indexOfRefraction. The runtime adapter and exporter both use these shared values.

The exporter writes `doubleSided` explicitly for all materials. Actual NullEngine reimport checks all 76 materials across the 15 exports: double-sided glass imports with backFaceCulling=false and twoSidedLighting=true; single-sided roles import with the converse. The targeted test executes the real runtime material factory and compares sidedness, albedo, alpha, roughness, metallic and alpha-blending behavior to each imported material.

IOR remains the previously disclosed limit: runtime applies shared IOR intent, GLB retains it in extras.iorIntent without KHR_materials_ior, and a general importer may use its 1.5 default. This task does not claim IOR appearance parity or add a refraction/material pipeline.

## Version preservation and output budget

The original W1.1 and published W1.1A masters, Web copies, manifests and prior evidence remain unchanged. Before edits, exact W1.1A geometry, recipes, material specs, exporter and validator sources were frozen under `assets/authoring/w1_1a/source_snapshot/`, retaining their original directory paths and canonical commit `8296c3251b0a7bfd43221781ba7241319891f396`. Together with that unchanged checkpoint catalog/contracts/lockfile, they reconstruct the historical exports.

The active command `node --import tsx tools/art-w1_1.ts` now writes only versioned W1.1A1 outputs:

- 15 masters in `assets/masters/w1_1a1/` and manifest `assets/authoring/w1_1a1/manifest.json`.
- Only the three directly affected current Web derivatives (mug, counter, room) in `public/assets/w1_1a1/`. Other master entries have web=null. Historical Web source files remain preserved and need not be copied into a current deployment's runtime payload.
- `evidence/art-w1_1a1-validation.json` and `evidence/art-w1_1a1-independent-import.json`; the latter is produced by `node tools/validate-art-w1_1a1.mjs`.

Current 15 masters total 495,332 bytes; the three new public derivatives total 159,624 bytes (file bytes, not observed transfer), with zero Khronos errors/warnings. All 15 independently reload with finite bounds, correct hashes, and the explicit material-policy checks above. All geometry/source/rights remain original project procedural work with metre units, right-handed axes, Y up and the same documented local pivots. No new external images, models, textures or licence dependency was introduced.

## Verification boundary

Five focused tests and the original eight art tests pass. The root task owns complete original-43/core/storage/presentation regressions, build/deployment, and F1–F3 lifecycle changes. NullEngine is not a real WebGL render. Actual cup appearance, transparency under lighting, camera composition, touch, Unity/URP/native imports and device performance remain NOT TESTED here. The source geometry, material intent and GLBs remain reusable; renderer/platform adapters and visual validation are still required.

## Historical status — 2026-10-22

This accepted source/asset correction is frozen. Its exact geometry/material/recipe/exporter/world sources are now additionally preserved under assets/authoring/w1_1a1/source_snapshot with canonical b093c50fa13cfca80c8b10fdfd96e716114a2d7d provenance. The old exporter uses those frozen inputs. Current rendering/interchange color interpretation is refined separately in docs/ART_W1_1B.md; no mug topology, transparency sidedness, alpha or PBR roughness policy was reopened. The actual-runtime parity regression follows the current export while original geometry ray cases and historical byte checks remain retained.
