# Component foundation v1

Revision2 remains within the same representative set after the first prototype
failed the style gate. It changes the crown grouping, broad cloth folds and
wood proportions/palette, corrects contact origins and aligns gray/material
lighting. No whole-shop expansion and no draft-PR retry.

This is a separate asset-authoring stage based on application
`78fbae7f519e4c443d5971bb18208e1c4f9de64e`. It does not adopt C50 or change
production game sources. The reference is the actual original
`docs/codex-v4/reference/Approved_Visual_Target_Misaki.png` (1536×1024,
SHA256 `9f855d2ecfd120bb45c001db3fa9b5a3e3b58b2b3c2a4cf9e7ebfda84f8f7114`).
The shop scene on its left guides these components. Character work is deferred.

## Rebuild and inspect

```sh
npm ci
blender -b -t 2 --python tools/asset-foundation/build.py
node tools/asset-foundation/validate.mjs
node tools/asset-foundation/contact-check.mjs
npm exec vite -- --host 127.0.0.1 --port 4199
```

Open `/tools/asset-foundation/gameplay.html?mode=material` or `?mode=gray`.
Choose Sandbox using the real initial UI. These DEV-only entries import the
unchanged real game, then insert the example set into the middle display's
existing footprint at `[.1,.079,-.1]` metres. Only the old middle fixture and
central decorative triangles are excluded from this preview. The app's stock
roots, UI, lifecycle and save code remain in use. The set is decorative geometry,
not inventory; do not place sale stock on its central demonstration surface.
Both gray and imported material sets explicitly use maxSimultaneousLights8
and environmentIntensity.8; capture assertions compare the complete recorded
light configuration and normal camera across both modes. Ordinary `/` never
loads the fixture. Nothing is published.

`/tools/asset-foundation/studio.html` and `?gray` provide supplementary fixed
neutral-light readings. They are not substitutes for gameplay evidence.

The capture helper uses local Chromium/Playwright at the environment's existing
`/opt/codex/cua_node/lib/node_modules/playwright`; run
`node tools/asset-foundation/capture.cjs` with the dev server above. Each game
capture uses a fresh browser context and the actual normal game camera. Obliques
set the actual engine camera to normal alpha ±.24 radians, retaining its
beta/radius/target. This explicit authoring camera adjustment is recorded;
normal screenshots use the untouched application camera. The helper buys three existing mugs on a side display,
checks the ledger, reloads Sandbox, switches Low→High and confirms its isolated
Normal baseline was unchanged. It does not access a player's profile. Outputs default to
`docs/reviews/evidence/asset-foundation-v1-r2`; the original v1 evidence remains
unchanged. `QA_OUTPUT` can select another evidence directory.
`python3 tools/asset-foundation/compare.py` builds the labelled480px comparison
only after raw captures exist.

## Reusable files

`public/assets/asset-foundation-v1/` contains independent local-origin metre-scale
`table.glb`, `cup.glb`, `vase.glb`, `flowers.glb`, `cloth.glb` plus the example
`display-set.glb`. Standard glTF PBR materials and embedded images work without
custom shaders or runtime geometry generation. Blender Z-up exports to glTF
right-handed Y-up. The table rests at Y=0 and its top is Y=.905m; all positions are measured after node transforms; the cloth and
assembly placements are authored for that surface. Flowers have their local
stem roots at Y=.21m for insertion inside the vase's approximately .262m evaluated lip. Cloth is a draped
runner, so its local origin is the table origin, rather than its bounding centre.

`assets/authoring/asset-foundation-v1/display-set.blend` retains separately
editable boards, joinery, lathe profiles, thick petals, connected curved stems
and the continuous linen surface. `build.py` reconstructs the geometry and materials from a fixed seed.
Blender export may reorder material buffers between runs, so GLB byte hashes
are recorded for the committed artifacts rather than assumed to reproduce. Only export copies are evaluated and joined, by semantic component;
the original editable objects retain their modifiers. Exported set: 63,592
triangles, five component meshes, 12 material primitives (see validation receipt
for exact values). The same35 heads/175 petals are grouped20/10/5 with overlap and unequal
depth. No triangles were added. This is a prototype; flowers still dominate its
triangle cost and no bulk replication is appropriate before an LOD strategy.

Material textures are restrained generated oak grain carried in actual GLB UVs.
There is no image-generated concept art, billboard flower arrangement, fake
screen-space shading or screenshot repaint. Grayform replaces only the prototype's
materials; the surrounding real shop remains its ordinary reference context.

The contact probe reads actual exported POSITION accessors and full glTF node
TRS/matrices. It gates table feet at0 and cup/vase bottoms at tabletop within
1 micrometre, and verifies cup/vase position/normal/index streams are unchanged
from049dbf3 (only their contact translations changed). It also enforces the
original63,592 set /33,124 flower triangle budget and actual wood ORM presence.
The first v1 gameplay gray/color comparison had different light budgets/IBL
intensities; it is historical evidence, not a strict material A/B control.
