# W1.1A geometry and material refinement

This is an implemented art candidate extending the unchanged original Bible and W1.1 scope. Source math, asset structure and independent loading have been tested; actual lighting appearance still needs a supported WebGL render. No final Tokyo visual gate, native compatibility or device frame-rate result is claimed here.

## Geometry lighting corrections

`src/art/geometry.ts` now normalizes every authored normal. Ellipsoids use the inverse-transpose normal of the nonuniform radius scale, rather than reusing a unit-sphere direction. Tapered elliptical cylinders account for both section radii and vertical taper in their side normals. The elliptical torus applies the inverse depth scale to the tube normal. Existing Euler rotation transforms positions and these corrected unit normals consistently.

Triangle winding is checked against its vertex-normal sum and reversed when necessary; zero-area pole, apex or collapsed corner triangles are omitted. Open/inward cylinder surfaces support a genuinely empty mug cavity without closing the cup mouth with a dark disk. Inside normals and corresponding triangle winding point into that cavity.

Eight targeted tests in `tests/art-w1_1a.test.ts` cover analytic surface tangents (ellipsoid, tapered ellipse and stretched torus), rotated tangent orthogonality, finite/unit normals and positive winding across all product geometry, hollow-cup cap absence, semantic batching, pivot flattening and previous master preservation. These would detect the original nonuniform-normal problem; passing glTF validation alone would not.

## Material identity shared with presentation

`src/art/materials.ts` defines stable semantic IDs and engine-neutral parameters. Each Part can specify a role; unspecified existing inline scene Parts default to `paint`. `grouped()` returns `role`, `materialId`, `color`, `alpha` and `geometry`. Batching keys include role + color + alpha; a wood object and ceramic object with the same color cannot be merged accidentally.

| Role | Stable ID | Roughness | Metallic |
|---|---|---:|---:|
| wood | mat.warm-wood.v1 | 0.73 | 0 |
| paper | mat.soft-paper.v1 | 0.96 | 0 |
| fabric | mat.woven-fabric.v1 | 0.94 | 0 |
| ceramic | mat.satin-ceramic.v1 | 0.34 | 0 |
| glass | mat.quiet-glass.v1 | 0.18 | 0 |
| metal | mat.brushed-metal.v1 | 0.41 | 0.65 |
| skin | mat.soft-skin.v1 | 0.83 | 0 |
| hair | mat.matte-hair.v1 | 0.79 | 0 |
| leaf | mat.sage-leaf.v1 | 0.81 | 0 |
| paint | mat.soft-paint.v1 | 0.84 | 0 |
| ink | mat.printed-ink.v1 | 0.90 | 0 |

Runtime adapters and GLB export read the same numeric material specification. GLB material names preserve combined identity, and extras preserve role, semantic specification ID and IOR intent. Base color, alpha, roughness and metallic are authored in standard glTF PBR fields. IOR is descriptive adapter intent in extras, rather than an unsupported claim of a refraction extension. Glass is simple alpha blending; it requires no dynamic reflections, refraction render pass, texture download or custom shader.

## Refined original models

The ten Offering IDs are unchanged. The notebook now has separate covers, visible paper thickness and page-edge lines, a cloth spine, paper label and elastic band. Pencil proportions include a wood taper, short graphite point, small metal ferrule and eraser. The empty ceramic mug has an actual open outer/inner shell, inner floor, finite rim thickness and separate handle. The tote has fabric handles, side/base seams and printed label. Paper, fabric, ceramic and metal roles are also assigned to the other existing products and relevant furniture.

Generic characters retain their anonymous status. Separate eyes, restrained highlights, cheeks, a small mouth, layered hair fringe, apron straps/pocket and visible hands improve the friendly silhouette. This does not introduce Misaki, Ren, Momo or any story background. No steam or hot-content implication is added.

`personRecipe(color)` remains a flattened static recipe. Optional `personParts(color)` returns body/head/arm-left/arm-right with explicit pivots. The recipes still use model-global coordinates: a runtime pivot adapter must subtract that pivot from each Part.at, then place its semantic node at the pivot. These are authoring pivots for limited local presentation motion, not a production skeleton/skin or complete walking-animation pipeline. The static GLB deliberately makes no rig/clip claim.

## Versioned sources and assets

The active exporter command remains `node --import tsx tools/art-w1_1.ts`, now producing only the W1.1A paths:

- `assets/masters/w1_1a/`: 15 original refined GLBs.
- `public/assets/w1_1a/`: corresponding lossless Web interchange copies.
- `assets/authoring/w1_1a/manifest.json`: IDs, hashes, per-material specs, source files, units, axes, origins and native limits.
- `evidence/art-w1_1a-validation.json`: current Khronos structural results.
- `evidence/art-w1_1a-independent-import.json`: current Babylon NullEngine reload results.

Previous W1.1 masters, Web copies, manifest and evidence remain unchanged. Its three original geometry/recipe/export sources are additionally frozen under `assets/authoring/w1_1/source_snapshot/`, with canonical checkpoint provenance. Current geometry continues to use metres, right-handed axes, +Y up and +Z forward. Product pivots are at their local floor; the room floor is y=0 and its plinth extends below.

No new third-party artwork, textures, models or fonts were introduced. The project owns the original procedural geometry and recipes. Runtime continues to build from the shared recipe source; the retained GLBs are reusable interchange assets, rather than duplicate required scene downloads.

## Verification and limits

The 15 W1.1A GLBs total 491,144 bytes. Khronos validation: zero errors and zero warnings. Independent Babylon NullEngine reimport: all 15 loaded with finite bounds and semantic material names. Eight targeted math/material/preservation tests pass. These are source/structural/headless results, with no rendered-lighting implication. The root task records the complete core/storage/content/build/browser results and scene/VFX changes separately.

Unity/URP imports, native material matching, platform controllers, Android/iOS builds, physical touch, device frame time and real visual appearance remain NOT TESTED here. GLBs, numeric material intent, semantic pivots and recipes are reusable; Babylon shading, shadow filtering, presentation lifecycles and platform input need native adapters and actual visual validation.
