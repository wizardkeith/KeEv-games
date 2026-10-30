# Local head-method study — visual failure, not adopted

`head-method-study.blend` is an actual editable local head-only scene with a
preserved v3 head control, directly displaced BMesh facial geometry, two open
eye sockets, inset 3D eyeballs/lids, and ten native 7x7 NURBS hair surfaces with
1.5mm thickness and procedural UV brown paint. No reference image is projected
onto the model. No full-body, game or Unity integration occurred.

This is a materially different construction from the prior closed cross-section
hair locks. It executed, but **did not produce an acceptable improvement**. The
first result exposed eyeball seating and floating hair roots. One bounded
construction correction seated the eyeballs and constrained upper surface
controls to a three-dimensional scalp/bob support. The corrected result still
has conspicuous cap/sheet seams, artificial sharp boundaries and inadequate
eye/expression/identity. Thin ends alone do not solve the target style.

Actual same-camera/light and 200px comparison is
`docs/reviews/evidence/head-method-study-v4/local-head-method-comparison.png`.
Normal matched, front and three-quarter renders, the initial draft, local
verification and judgment are retained beside it. The original canonical target
pixels and v3 source are unchanged. `initial-construction-draft.blend` is an
earlier failed construction state, not the latest study.

Available executor skills/tools were reviewed; no dedicated modelling skill or
Blender MCP surfaced. Existing Blender 5.2.3 successfully executed BMesh edits,
native NURBS subdivision/control edits and Cycles renders. SCULPT mode could be
entered, but `bpy.ops.sculpt.brush_stroke.poll()` returned false with
`bpy.context.area` equal to None in background. This does not certify GUI brush
control, and the GUI hold was respected.

There is no evidence of a missing executable, licence or necessary plugin.
The demonstrated authoring workflow is insufficient: it has not solved organic
hair surface joins, reference facial topology/expression or painterly material
control. NURBS controls also do not interpolate every internal point, so putting
controls on a support does not automatically give a seamless fitted hair surface.
That is an unresolved construction/artistic-control problem, not proof that the
Blender CLI fundamentally cannot support better art. A reliable freeform sculpt,
surface-fitting/retopology and painting workflow has not been demonstrated here.
No further parameter variants are being generated from this failed study.

The initial bounded study stayed local. The parent subsequently explicitly
authorized preserving the failed source/evidence on the existing Git branch and
delivering its comparison as a **distinct failed-study Library item**. This
preservation does not adopt it as an asset or replace the retained v3 preview.
The prior synchronized v3 checkpoint is
`af0c9c24390d9649bbd25f8453d09f15e5252ac5`; exact new commit/readback and Library
identity are reported after delivery. No portable export is claimed, since the
visual method was not successful. No new variants, GUI input, installation or
deletion occurred during this checkpoint operation.

After Wix explicitly released GUI ownership, a disposable
`gui-sculpt-capability-test.blend` and `gui-test-before.json` vertex baseline
were prepared. CUA inventory worked, but the exact Blender launcher request
timed out waiting for app approval. Read-only reinspection showed Blender not
running/no windows. No sculpt/paint input or GUI save was performed, and no
alternate launch bypass was attempted. This blocks a real interactive test;
entering SCULPT mode in background is not a substitute. The test copy remains
ready for a later properly approved bounded test. See `GUI_CAPABILITY_TEST.json`
and `CUA_READONLY_ASSESSMENT.md` in the evidence directory.
