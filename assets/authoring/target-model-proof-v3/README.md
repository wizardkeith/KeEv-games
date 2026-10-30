# Whole-character v3 checkpoint — target likeness still fails

This is an editable model study, **not accepted art or a game screenshot**.
The retained v3 combines a three-quarter stance, higher waist/shorter torso,
higher compressed cuffs, pointed folded blouse collars, flat apron ribbons and
distinct skin/knit/linen PBR responses. V2 hair geometry is retained because the
new irregular-lock/crown candidate was visually worse and was rejected.

`misaki-display-model-proof.blend` contains editable named mesh controls,
Bezier details, modifiers, vertex colours and packed cloth textures. Separate
GLBs bake the posed native meshes and remove assembly translation. No rig, LOD,
collision or mobile performance is certified. The roughly 200k-triangle model
is an unoptimized authoring proof.

`rejected-hair-study/failed-irregular-lock-study.blend` is the real editable
failed candidate, preserved before the fallback. It contains the irregular
closed locks and 40mm upper-crown lift that produced a helmet-like crown and
separated thick ends. The failed GLBs were not retained as authoritative
deliverables; the retained native source can be inspected/reexported. Corresponding
actual full/close renders are `rejected-hair-full.png` and
`rejected-hair-close.png` in this phase's evidence directory. The archived hair
module alone is not the full generator for that native study.

Before changing proportions, `pose_study.py` reopened untouched v2 and rendered
only body yaw, counter-turned head and head tilt changes under the same camera
and lights. The final comparison uses that v2 pose control and v3 at the same
stance, so the shoulder/cuff/collar/waist changes can be assessed directly.
The target's exact camera, stance, side/back and hidden geometry remain inferred.

Background Blender Python successfully edits/renders these native structures;
interactive GUI sculpting/control was not used or certified. **This sweep/loft
construction has not reproduced the target's organic hair, expression or fabric
sculpting.** Cycles and export are functioning; the unresolved limitation is the
quality/control of the current authoring method, not missing software or evidence
that the Blender command line cannot support better art. Do not promise that
more parameter variants will achieve the reference. Review the modelling/painting
workflow before extending this same hair construction again.

Installed-tool commands from the repository root:

```powershell
& 'C:\Program Files\Blender Foundation\Blender 5.2\blender.exe' --background --factory-startup --python-exit-code 1 --python tools/target-model-proof-v3/build_scene.py
node tools/target-model-proof-v3/validate_glb.mjs
& 'C:\Program Files\Blender Foundation\Blender 5.2\blender.exe' --background --factory-startup --python-exit-code 1 --python tools/target-model-proof-v3/verify_and_render.py
& 'C:\Program Files\Blender Foundation\Blender 5.2\blender.exe' --background --factory-startup --python-exit-code 1 --python tools/target-model-proof-v3/verify_v2_preservation.py
```

The saved native source is authoritative. A rebuild replaces this phase's latest
proof files; commit any manual native edits before rebuilding. V2 native/export
assets remain unchanged at `fe1025ba2cb1a784df2097780cce97cbb747f019`.
