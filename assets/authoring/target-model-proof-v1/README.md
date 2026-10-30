# Complete character + representative display proof v1

**Unaccepted Blender model study. This is not a game screenshot or an integrated
game asset, and does not establish a match to the approved target.**

`misaki-display-model-proof.blend` is the editable native source. It contains:

- `01 Misaki / coloured editable model`: fresh character meshes, live surface
  subdivision/thickness, editable Bezier details, vertex-painted face/hair,
  posed hands, sage cardigan, ivory blouse, cream waist apron, plum skirt,
  socks and brown shoes. No rejected R10 character geometry is imported.
- `02 Display / reusable authored components`: native copies of the existing
  wooden display, books, cloth, vase, white flowers, cups and paper components.
  Existing source files are preserved. File textures are packed.
- `03 Blender studio / not exported`: floor, three soft area lights and three
  orthographic render cameras. These are modelling presentation conditions.

Authoring occurred through background Blender Python. The meshes/control vertices
are editable in Blender; **interactive GUI sculpting or application control was
not used or certified**. This avoids mouse/focus interference with the owner.

The native character origin is at the feet and the display origin is at the floor.
Separate portable exports in `exports/` remove assembly placement. Scene units
are metres. GLBs contain evaluated meshes, PBR materials, vertex colours and
embedded textures. Ngons are triangulated only in temporary export copies so
tangent space can be explicitly exported; native control meshes stay editable.
No rig, animation, LOD, collision or device-performance claim is made.

`manifest.json` records exact source/export hashes, geometry counts, origins,
reference identity and inherited native sources. Evidence lives in
`docs/reviews/evidence/target-model-proof-v1/`. Camera and output hashes are in
`native-roundtrip-verification.json`; validator output is separate. Reopening
the native source and reimporting GLBs do not overwrite this source.

Run from the repository root, with the already installed Blender and Node:

```powershell
& 'C:\Program Files\Blender Foundation\Blender 5.2\blender.exe' --background --factory-startup --python-exit-code 1 --python tools/target-model-proof/build_scene.py
node tools/target-model-proof/validate_glb.mjs
& 'C:\Program Files\Blender Foundation\Blender 5.2\blender.exe' --background --factory-startup --python-exit-code 1 --python tools/target-model-proof/verify_and_render.py
```

The saved source and exports are authoritative; rebuilding is not required to
open or edit them. `build_scene.py` regenerates this proof's files, so preserve a
commit before rebuilding after manual source edits. The original target pixels
remain unchanged, SHA256
`9f855d2ecfd120bb45c001db3fa9b5a3e3b58b2b3c2a4cf9e7ebfda84f8f7114`.
Unknown side/back details, standing pose, head tilt and studio composition are
inferred. The full shop, target lighting and final likeness are not reproduced.
