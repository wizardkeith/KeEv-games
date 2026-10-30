# Complete character + display proof v2 — unaccepted

This is an **unaccepted modelling checkpoint**, not target-style approval, a game
screenshot or production integration. Preserved v1 is at checkpoint
`538e6159c1a07bb889a60d7002031644d2792132` and remains in its own directory.

Open `misaki-display-model-proof.blend` for editable native control surfaces,
curves, live subdivision/thickness, vertex colours, packed textures, cameras and
lights. `exports/misaki-model.glb` and `exports/display-group.glb` are portable
evaluated assets with floor/feet origins and assembly placement removed.

V2 changes the complete character rather than preserving rejected proportions:

- Shorter, fuller-cheeked face; enlarged head with shorter exposed neck; soft
  cheek colour, conforming eyelids and iris gradients, smaller catchlights.
- A continuous hair under-volume with individually editable closed clump
  sections, diagonal forehead sweeps, visible own-left clip/ear and unequal
  lower returns. The result is still too regular and solid for the reference.
- Dropped shoulder controls, compressed sleeve/cuff surfaces, blouse placket,
  relaxed overlapping hands, flared skirt with actual pleats and shaped loafers
  with flat welt soles, raised insteps, vamp seams and straps.
- A small restrained woven normal tile is packed in the source and embedded
  in the character GLB; clothing ring surfaces carry continuous seam-aware UVs.

The representative display is retained, not polished. V1 is rerendered under
v2's lights and the same full-character camera for comparison; that script also
compares native display geometry, UVs, material input values and packed images.
The original approved reference remains unchanged. Side/back, pose and studio
composition are inferred; no rig, collision, LOD or mobile performance claim.
Character evaluated density is about 200k triangles and is not an optimized
mobile delivery mesh.

Authoring uses background Blender Python, not GUI sculpting/control. The named
native meshes and their control vertices are directly editable in Blender.
Component controls are separated in `character_body.py`, `character_head.py`
and `character_hair.py`; `build_scene.py` executes them in one authoring context.
Rebuilding regenerates this proof's files, so commit manual `.blend` edits first.

Run from the repository root with the existing tools:

```powershell
& 'C:\Program Files\Blender Foundation\Blender 5.2\blender.exe' --background --factory-startup --python-exit-code 1 --python tools/target-model-proof-v2/build_scene.py
node tools/target-model-proof-v2/validate_glb.mjs
& 'C:\Program Files\Blender Foundation\Blender 5.2\blender.exe' --background --factory-startup --python-exit-code 1 --python tools/target-model-proof-v2/verify_and_render.py
& 'C:\Program Files\Blender Foundation\Blender 5.2\blender.exe' --background --factory-startup --python-exit-code 1 --python tools/target-model-proof-v2/render_v1_control.py
```

Actual comparison PNGs, checks, source/export hashes and sanitized execution logs
are in `docs/reviews/evidence/target-model-proof-v2/`. Technical checks establish
integrity and export consistency, not likeness or artistic acceptance.
