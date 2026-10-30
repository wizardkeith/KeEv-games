# Grok candidate local audit and bounded head study

**Original Grok trial retained as the user-selected foundation. Geometry refinement FAIL; conservative material fallback remains unaccepted.**

- [Target / original / optional head-material comparison](reviews/evidence/grok-head-refinement-v1/grok-original-vs-material-fallback.png)
- [Rejected geometry attempt, with original/restored controls](reviews/evidence/grok-head-refinement-v1/rejected-head-geometry-comparison.png)
- [Material-study front / three-quarter / profile](reviews/evidence/grok-head-refinement-v1/material-fallback-view-sheet.png)
- [Original sources, editable studies and limitations](../assets/authoring/grok-head-refinement-v1/README.md)
- [Fresh-process reopen and unchanged anchors](reviews/evidence/grok-head-refinement-v1/fallback-reopen-verification.json)

User first provided `Misaki_3D_Trial.zip`, then identified Downloads after the Windows Library helper failed to install it. Exactly `C:\Users\wizar\Downloads\Misaki_3D_Trial.zip` matched the supplied 1,618,564-byte ZIP and SHA256 `b279ddaadb5aa7d7632286e50eb6c4da9bf41029bafc5c0b3bf6bbdc202252f2`. No broad Downloads inspection or alternate Library download occurred. The original ZIP/native/GLB remain unchanged. Only allowed model/image/readme files were safely extracted; bundled code was not executed. Background opening explicitly disabled auto-execution and online access.

Actual local source checks: 4,484 vertices, 8,608 triangles, 17 materials, 17 bones, 80 disconnected parts, 48 boundary edges; no native image textures/actions/shape keys/drivers/linked resources. There is a UVMap, but 65.799% of UV triangles are degenerate, with extensive primitive overlaps. It is not a ready unique painting atlas. Two original bone probes in memory moved 159 lower-arm and 200 lower-leg vertices at 30 degrees; pose was restored and source not saved. This proves basic skinning response only. The provided GLB imports, but validator gives 0 errors / 1 skinned-node hierarchy warning / 17 unused-UV infos. Full audit and original-colour/untextured proof images are under `source-audit/`.

The user judged the Grok candidate better but still short of Japanese-anime style. Compared against the actual canonical reference, it is a more coherent simple foundation than our failed v5. Its head shape, mitten hands, helmet hair and rigid clothing still do not match the target; the user preference is not final visual approval.

One focused study directly reshaped the seven original bang cages, adjusted the original cap/side return, thinned existing lash islands, introduced ivory sclera and own iris colour painting, and used face-only loop-colour / EEVEE coloured shadows / masked normals. It added no new hair sheets. Actual renders exposed root/cap intersections and protruding white eye shells; **this geometry attempt was rejected, not adopted**. Do not continue that failed cage parameter cycle.

The conservative fallback restores **all 4,484 original vertex coordinates and all polygon indices exactly**, plus original eye/lash material assignments. Only optional face/hair colour and iris-detail lookdev remain. All deform-bone weights, 2,766 non-head vertices' material/UV assignments and evaluated body positions/normals match the original. Fresh-process reopen renders the neutral three-quarter view at exact RGB8 equality in this run. This is a technical consistency result, not a likeness pass. The material fallback has softer colour and iris detail, but no new hairstyle or overall Japanese-anime acceptance is claimed.

Original and study use identical cameras/lights/distance per before/after view, with neutral and warm three-quarter evidence and a 200px proxy. The canonical target camera and unseen side/back design are inferred. These are actual Blender renders, not gameplay captures. Native Shader-to-RGB materials are EEVEE lookdev; arbitrary GLB/Unity shader portability is not claimed. No new fallback GLB is presented as accepted art.

Commands actually executed used installed Blender 5.2.3:

```text
blender --background --factory-startup --disable-autoexec --offline-mode --python-exit-code 1 --python audit_candidate.py
node (existing gltf-validator, original GLB)
python tools/grok-head-refinement-v1/paint_iris.py
blender --background --factory-startup --disable-autoexec --offline-mode --python-exit-code 1 --python tools/grok-head-refinement-v1/build_refinement.py
blender --background --factory-startup --disable-autoexec --offline-mode --python-exit-code 1 --python tools/grok-head-refinement-v1/retain_material_fallback.py
blender --background --factory-startup --disable-autoexec --offline-mode --python-exit-code 1 --python tools/grok-head-refinement-v1/verify_fallback.py
python tools/grok-head-refinement-v1/make_review.py
```

The first audit ran from the isolated review folder; its own source is copied with repository-relative input/output paths for reproducibility. No user-archive script was invoked. Optional Blender extension-cache writes were denied under the offline sandbox, but native load/render/import succeeded; no setting was relaxed. A console-only Unicode print failure after extraction was reconciled by reading the already-written audit, not re-extracting. No game tests are newly claimed for this separate asset review.

All source/evidence remains in the existing isolated branch; exact normal push/readback is reported externally. Original v3/v5 rollback, game logic/locales/player saves/main/Site remain unchanged. No GUI retry/input, addon install, service upload/purchase, merge, PR or public deployment. No files deleted or user processes closed.
