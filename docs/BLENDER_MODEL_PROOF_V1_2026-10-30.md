# Blender complete-character + display proof v1

**Art status: unaccepted; target likeness is still inadequate.** This checkpoint
proves a complete editable, coloured 3D model and representative display can be
authored, rendered, reopened and exported locally. It does not prove the desired
style has been achieved, or authorize integration or engine migration.

## Review the actual pixels

- [Whole character, representative display and original target crop](reviews/evidence/target-model-proof-v1/reference-model-comparison-v1.png)
- [Original face crop beside native Blender front and three-quarter views](reviews/evidence/target-model-proof-v1/reference-face-comparison-v1.png)
- [Native Blender assembly render](reviews/evidence/target-model-proof-v1/blender-model-assembly-v1.png)
- [Native Blender full character](reviews/evidence/target-model-proof-v1/blender-model-character-v1.png)
- [Native Blender face detail](reviews/evidence/target-model-proof-v1/blender-model-face-v1.png)
- [GLBs reimported into the same Blender presentation scene](reviews/evidence/target-model-proof-v1/blender-model-glb-roundtrip-v1.png)

These are actual Blender Cycles CPU renders, not game screenshots. Comparison
boards only crop and resize original reference/render pixels and add labels.
They do not repaint or enhance the model. The canonical reference SHA256 remains
`9f855d2ecfd120bb45c001db3fa9b5a3e3b58b2b3c2a4cf9e7ebfda84f8f7114`.

The proof has a fresh rounded face, chestnut eyes, cocoa bob, own-left ivory
leaf clip, sage cardigan, ivory blouse, cream **waist** apron, plum skirt,
clasped hands, socks and brown shoes. The display includes a wooden table and
riser, books, linen cloth, celadon vase, white flowers, cups and paper components.
Existing display/paper native sources are appended as editable copies and remain
unchanged. Rejected R10 character geometry is not reused or overwritten.

## Visual assessment and limitations

The colour families and complete outfit are represented, and the display is
readable in a real 3D assembly. The model **still looks like a simplified doll**.
Hair reads as broad solid panels rather than the reference's layered, turning
bob. The forehead/sweep, cheek and eye expression, ear visibility, sleeves,
hands, garment folds and shoe form need substantial refinement. Materials and
light are smoother and paler than the target. Adding detail alone will not fix
these proportion and surface-flow differences.

This is a representative display, not the entire shop. Studio composition and
lighting differ from the reference; side/back details, head tilt and standing
pose are inferred. No rig, animation, collision, native mobile build, gameplay,
device performance, or artistic acceptance is certified. Do not integrate this
proof into the production character or interpret technical checks as art approval.

Authoring used background Blender Python to create editable native meshes,
curves, modifiers and vertex colours. This confirms command-line authoring and
export, **not interactive GUI sculpting/control**. No mouse, keyboard focus or
existing user project was controlled. No Unity plugin or software was installed.

## Source and reproducible checks

- [Editable native source and usage notes](../assets/authoring/target-model-proof-v1/README.md)
- [Source/export hashes and geometry manifest](../assets/authoring/target-model-proof-v1/manifest.json)
- [Build script](../tools/target-model-proof/build_scene.py)
- [Native reopen/render/GLB reimport verification](../tools/target-model-proof/verify_and_render.py)
- [GLB validator runner](../tools/target-model-proof/validate_glb.mjs)
- [Comparison compositor](../tools/target-model-proof/make_review.py)
- [Native and portable validation receipt](reviews/evidence/target-model-proof-v1/native-roundtrip-verification.json)
- [Khronos glTF validator result](reviews/evidence/target-model-proof-v1/glb-validator.json)
- [Native/portable image difference metrics](reviews/evidence/target-model-proof-v1/render-comparison-metrics.json)

Installed Blender 5.2.3 LTS executed `--background --factory-startup
--python-exit-code 1 --python ...` on KeiTHxMC. The native source is reopened in
a new process, evaluated bounds/triangles are compared to the manifest, textures
are checked as packed, then each GLB is independently imported and checked before
rendering in the same assembly presentation. The source file hash is unchanged
by these verification renders. Portable shading can differ because glTF does
not reproduce all Blender shader features, including skin subsurface scattering.

The first full portrait exposed a neck/head gap after face shortening; actual
render feedback led to reseating the head and verifying overlapping Z extents.
Shoe soles were placed at ground level. These limited checks are not signed
collision or watertightness certification.

The first display export produced a tangent-space portability warning. Export
copies now triangulate ngons and explicitly include tangents. The editable
native source is unaffected; strict zero-error/zero-warning checks remain.

Blender still logged tangent calculation warnings for some UV-less meshes that
do not use normal maps, and an unused-colour warning in mixed-material export.
The actual GLB has six coloured primitives, required normal-map tangent data,
and passes the separate validator plus native/portable render comparison.
Optional thumbnail and extension-cache writes also failed under the execution
profile; source/export/render writes succeeded. No permission settings changed.

This separate authoring checkpoint changes no existing game asset or source,
save, locale, deterministic-material implementation or hosting identity. Existing
Web tests were not rerun for an unintegrated authoring-only proof; no historical
304-test result is claimed as new verification. The previous R10 rollback stays
at `5e741db98ec14dcb7576e45bce3b1848fad85874`.

## Archival drafts and handoff

`blender-model-assembly-draft.png` is the unusable first camera/hierarchy draft
with the head out of frame; `initial-build-hierarchy-error.json` records that
earlier build. `blender-model-assembly-initial-complete.png` predates subsequent
whole-model corrections. They are archival evidence, **not the current proof**.
No files or unrelated user processes were deleted in this phase.

Next step is an independent whole-image art review of the current proof against
the original pixels. Continue modelling before gameplay integration or any Unity
mobile migration. The same existing isolated branch is used for normal Git sync;
it is separate from main and the public Site.
