# Paper / display foundation v1

New representative component set after independent R4 MAIN-SHAPE PASS. Overall
style remains unaccepted. R4's crown/cloth, ceramic forms and material response
are frozen; no original asset or R4 generator is rebuilt by this stage.

The actual canonical target was viewed, including the tiered display and paper
areas: `docs/codex-v4/reference/Approved_Visual_Target_Misaki.png`,1536×1024,
SHA256 `9f855d2ecfd120bb45c001db3fa9b5a3e3b58b2b3c2a4cf9e7ebfda84f8f7114`.
The observed language is an open thin-board riser with a lower shallow tray,
restrained rounded edges, cream page bodies, cover overhangs and short stacks
with different thicknesses. Dimensions here are authored choices, not recovered
measurements from the illustration.

## Rebuild and inspect

```sh
blender -b -t 2 --python tools/asset-foundation/build-paper.py
node tools/asset-foundation/validate-paper.mjs
npm exec vite -- --host 127.0.0.1 --port 4199
node tools/asset-foundation/capture-paper.cjs
```

The generator appends only frozen R4 wood materials from its packed `.blend`.
It writes `assets/authoring/asset-foundation-paper-v1/` and
`public/assets/asset-foundation-paper-v1/`. It does not execute or overwrite the
R4 generator/assets. Editable source preserves individual boards/posts,
continuous curved bindings, overhanging covers, page blocks and paper leaves.
Only evaluated export copies are merged by semantic component.

- `tiered-riser.glb`: open.58m-wide upper platform atY=.260m, two24mm boards,
  four27mm posts and housed bearers;864tri.
- `shallow-tray.glb`: separate hollow tray.46×.27m,12mm floor and9mm rims,
  height.036m;540tri.
- `book-stack.glb`: three closed notebooks,305×225×30mm,285×205×13mm and
  300×215×21mm; actual curved binding shells, cover overhangs, cream cut-page
  bodies and small unequal offsets/yaws;1,224tri.
- `paper-stack.glb`:130×180×20mm cream block plus three.65mm loose leaves;
 432tri.
- `folded-card.glb`:85×118mm card, two connected panels and.8mm thickness;
 36tri.
- `paper-display-set.glb`: those five components at measured local placements;
 3,096tri, five meshes, nine materials,14 material primitives, seven embedded
 images (R4 wood reused). No new texture resolution, joints or tiny page lines
 are added to carry the style.

Units/metres; Blender Z-up exports standard glTF RH Y-up. Each standalone
component has actual transformed minimumY=0. In the assembly the book/card sit
on the riser atY=.260, and the paper block sits on the tray floor atY=.012.
The GLB validator checks these contacts, support/opening footprints, finite
standard assets, the modest triangle budget and all21 frozen R4 files bytewise.
These checks do not certify arbitrary collision, physical performance or art.

## Real game fixture

Open `/tools/asset-foundation/gameplay-paper.html?mode=material` or `?mode=gray`
and choose Sandbox through the real app UI. It imports the unchanged R4 fixture
in the centre, then uses **one** reused R4 table as a test stand in original
display1 at`[-2,.079,-1.5]`; the new set sits at its local tabletopY=.905.
Only the old display1 fixture/decorative triangles are excluded in this DEV
page. The surrounding shop and normal camera stay the real unchanged app.

This is component authoring, not whole-shop assembly or adoption. R4 is adjacent
as baseline; its flower/cloth set is not copied. The validation stand adds6,480
tri; all staged prototype geometry totals71,696tri including R4's62,120. There
is no bulk replication; the frozen flower still needs future LOD strategy.

R4 wood PBR materials are shared in the game scene and duplicate imported wood
materials/textures are disposed. Gray and material both use max8 lights and
environmentIntensity.8; the full recorded lighting/camera conditions are
asserted equal. Material differences are real GLB PBR values, not changed lights.
`studio-paper.html` uses the existing fixed neutral two-light conditions and
R4 table solely for supplementary reading; it cannot substitute for normal480px
and two actual engine obliques.

The new set is decoration, never inventory or a new SKU. Ordinary `/` never
loads this authoring code. Existing UI/data/save schema/transactional lifecycle
remain unchanged. The capture buys/places three existing mugs on untouched
original display3 (slot2), reloads, switches Low→High, and verifies the fresh
context's Normal baseline unchanged. Do not stage player stock on the new
stand or the central R4 authoring table: their production slot-height adoption
is intentionally outside this geometry checkpoint.

No main/PR8 write, PR retry, merge, Site/publication, payments, character work or
player Normal changes. No art acceptance from test counts. Future reference
handoff remains `docs/MISAKI_NEXT_STAGE_REFERENCE_HANDOFF_2026-10-27.md`.
