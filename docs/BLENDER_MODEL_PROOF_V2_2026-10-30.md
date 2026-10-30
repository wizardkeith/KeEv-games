# Blender whole-character proof v2 — still unaccepted

V2 revises the complete character silhouette and materials, retaining the display
context and v1 rollback. **The approved target's identity/style is not achieved.**
These are real Blender model renders, not game screenshots or painted mockups.

- [Original target / preserved v1 / new v2 under the same model camera and lights](reviews/evidence/target-model-proof-v2/reference-model-comparison-v2.png)
- [Original face pixels / v2 three-quarter / v2 front](reviews/evidence/target-model-proof-v2/reference-face-comparison-v2.png)
- [Complete character](reviews/evidence/target-model-proof-v2/blender-model-character-v2.png)
- [Character + display assembly](reviews/evidence/target-model-proof-v2/blender-model-assembly-v2.png)
- [GLBs reimported and rendered in the same assembly scene](reviews/evidence/target-model-proof-v2/blender-model-glb-roundtrip-v2.png)
- [Editable native source and instructions](../assets/authoring/target-model-proof-v2/README.md)

## What changed

The face is shorter with fuller cheeks, stronger soft blush, thinner eyelid
layers, warm iris gradients and smaller catchlights. The head is enlarged around
the neck pivot and reseated lower to reduce the long exposed neck. The hair has
a continuous under-volume, several closed curved foreground/side clumps,
unequal jaw returns and an actual own-left ear opening. Each clump has editable
cross sections rather than a flat image/card. The own-left leaf clip is retained.

The cardigan has dropped shoulder controls, compressed elbow folds, double
turned cuffs and a quieter knit normal tile. The blouse has surface pleats,
smaller buttons and a sewn placket. Hands now overlap in a relaxed downward
pose. The plum skirt flares with actual unequal pleats. Brown shoes have shaped
toes/instep, flat welt soles, vamp stitches and a strap opening instead of oval
blobs. Cloth images are packed in the source and embedded in the portable GLB;
body/sleeve UVs follow their control rings with an explicit seam.

The first v2 preview revealed detached-looking thick hair clumps and excessive
neck exposure; the next whole-model pass embedded shallower clumps into the
under-volume and reseated/enlarged the head. A later close-up revealed hard
normal-map seams on the shoulders. UVs were changed from per-face projection to
continuous body/sleeve rings and the normal strength was reduced. These were
visual fixes from actual renders, not extra validator assertions or art passes.

The representative display is not polished in this iteration. The preserved v1
source is reopened and rendered with v2's key size/energy, fill/rim energy,
exposure, identical orthographic full-character camera, resolution and samples.
This makes the v1/v2 comparison more useful; the reference's exact lens, pose,
light and material response are still unknown/inferred. No anisotropic scaling,
repainting or facial retouching is applied to the comparison images.

## Explicit remaining mismatches

This still reads as a simplified doll. The hair clumps remain too regular,
solid and board-like, with insufficient layered turning rhythm and natural
crown/root blending. The target's forehead framing, soft cheek/eyelid expression
and fine asymmetry are not reproduced. Ear forms, collar folds, sleeves, fabric
drape, hands and shoes are simplified; adding a knit tile is not equivalent to
the target's knitted garment forms. The target has richer warm value separation
and softer illustrative detail. The representative display is not the full shop.

Side/back detail, standing pose, head tilt and studio presentation are inferred.
The original target SHA256 remains
`9f855d2ecfd120bb45c001db3fa9b5a3e3b58b2b3c2a4cf9e7ebfda84f8f7114`.
No artistic acceptance, rig, signed collision, watertightness, animation or mobile
device/performance certification is claimed. About 200k evaluated character
triangles are a modelling proof, not an optimized mobile character.

## Executed verification and handoff

- [Exact native/export geometry and hash manifest](../assets/authoring/target-model-proof-v2/manifest.json)
- [Native reopen and separate GLB reimport](reviews/evidence/target-model-proof-v2/native-roundtrip-verification.json)
- [Strict glTF validator output](reviews/evidence/target-model-proof-v2/glb-validator.json)
- [Preserved v1 and display geometry/UV/material-input/image comparison](reviews/evidence/target-model-proof-v2/v1-lighting-control.json)
- [Native versus portable render difference metrics](reviews/evidence/target-model-proof-v2/render-comparison-metrics.json)
- [Scoped file hashes and sanitized execution logs](reviews/evidence/target-model-proof-v2/phase-receipt.json)

Commands use installed Blender 5.2.3 LTS in background and the existing locked
Node/glTF validator dependency. Native source and both portable files are opened
in new Blender processes; triangle counts, bounds, colours, texture embedding,
source hash preservation and same-scene export consistency are checked. Strict
validator checks remain zero-error/zero-warning. Optional thumbnail/cache writes
can fail under the execution profile; no security settings are changed. Some
UV-less non-normal-mapped geometry can emit tangent warnings; these are distinct
from actual glTF validator results.

The final character has 199,816 evaluated triangles, one embedded cloth normal
image and 13 vertex-colour primitives; the display has 65,216 triangles and 12
embedded images. Reimported bounds differ by less than 6e-8 metres. Native versus
GLB assembly mean RGB8 differences are 0.0253 / 0.0209 / 0.0228 per channel. The
324 display objects match their v1 geometry/UV/material-input/packed-image
fingerprint. These numbers are integrity evidence, not likeness scores.

The work uses background Python to author native editable meshes, curves,
modifiers and materials. It does not certify GUI sculpting/control. V1 source,
existing game assets, game source, deterministic-material fix, locales, saves
and hosting identity remain untouched. Existing Web/game tests are not rerun for
this separate, unintegrated authoring proof and historical results are not claimed
as new. `internal-first-volume-draft.png` is archival, not the latest model.

This continues the same authorized isolated branch from
`538e6159c1a07bb889a60d7002031644d2792132`; v1 is preserved there. The same Library
preview item is updated with version protection, not duplicated. Normal Git push
and exact remote readback are reported separately. No deletion, GUI input,
Unity/gameplay migration, PR/merge or public deployment is part of this phase.
Next: independent whole-character visual review, then further model work before
integration; technical integrity must not be interpreted as artistic acceptance.
