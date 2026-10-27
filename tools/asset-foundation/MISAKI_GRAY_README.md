# Misaki grayform R2 — head / neck only

Independent first-grayform review FAILED. This checkpoint changes head, face,
hair, ears and neck only. Clothes/cuffs/apron/skirt/hands/feet are frozen for a
later stage. Overall original style remains unaccepted; no ratio score or
technical check is art acceptance.

Canonical authority, viewed again at actual pixels and head scale:
`docs/codex-v4/reference/Approved_Visual_Target_Misaki.png`,1536×1024,
SHA256 `9f855d2ecfd120bb45c001db3fa9b5a3e3b58b2b3c2a4cf9e7ebfda84f8f7114`.
PlanB initial official consumer-local transfer and its one authorized fresh
retry both failed with `library file transfer failed: download failed`,exit1.
Both prepares returned signed transfers, no workspace_path; neither destination
has ZIP bytes. No further PlanB retry or generic download; side/back remain
inferred. Exact nonsensitive record is in the R2 evidence/reference-access.json.

```sh
blender -b -t 2 --python tools/asset-foundation/build-misaki-gray.py
node tools/asset-foundation/validate-misaki-gray.mjs
blender -b assets/authoring/misaki-grayform-v1/misaki-grayform.blend -t 2 --python tools/asset-foundation/inspect-misaki-gray.py
npm exec vite -- --host 127.0.0.1 --port 4199
node tools/asset-foundation/capture-misaki-gray.cjs
python3 tools/asset-foundation/compare-misaki-gray.py
```

The builder calls `misaki-head-neck-r2.py` before the unchanged body cage code.
Face is one continuous cheek-to-narrowing-jaw mesh with two actual eye apertures,
not circular raised eye patches. Separate upper fold / lower lid surfaces and
convex eyes fit behind the holes; no concentric torus rims or iris textures.
Simple grayscale iris placement is geometry and does not claim final identity.
Broad ear bowls and notched side hair create negative spaces. Bob uses one
unequal lobed cap and7broad curved volumes, removing the3old back paddles and
long flat cheek pieces; tips taper in both width/depth and turn inward.

An actual45mm head offset opens the neck above the frozen collar. The model
is not scaled to preserve the rejected3.24ratio. Whole-body comparisons use the
same raw camera/orthographic bounds and equal pixel crops; body remains the
same size, so the resulting head/neck height change is visible. Evaluated
chin-to-frozen-clothing top is35.18mm; neck vertically overlaps face58.38mm.
Those bounds relations are not full collision or watertight-skin proof.

The `.blend` retains editable quad cages/subdivision. Evaluated face has two
boundary loops of40edges each. GLB is5semantic meshes/10material primitives,
7unchanged neutral roughness1materials,53,480tri/976,156bytes, no textures,
skins or animations. Full authoring scene125,176tri including frozen71,696tri
props; no bulk replication/device/FPS acceptance. No fine strands, weave,
fingers, final facial expression flow, rig or animation.

Blender Z-up/front−Y/own LEFT+X exports glTF Y-up/front+Z/own LEFT+X. Clip stays
own LEFT only. Real game fixture remains one static nonpickable sample at
`[.85,.079,1.35]`,yawπ in clear aisle, alongside untouched gameplay staff/rig.
Ordinary `/` never loads this DEV page. Existing data/saves/actions are not
replaced. Production stock/character integration is outside this checkpoint.

Validator compares all12POSITION/NORMAL/index streams and node TRS of the whole
clothed-body group bytewise to source038740fbd7f6428cc82d5f442646c2d86a4143e3.
All7material definitions,29R4/PaperR2asset-authoring files and the studio camera
/light TS source remain unchanged. Studio HTML label only wraps to avoid the
higher head. FeetY0 and own-left clip are checked. Source inspection is read-only.

R2 evidence goes to `docs/reviews/evidence/misaki-grayform-v1-r2`; rejected v1
raw evidence remains intact. Four views and actual normal/two obliques are real
engine captures, fixed key2.1/fill.65 and actual game lights unchanged. Fresh
Sandbox UI lifecycle and source SHA are checked separately from art. Face/eyes
and back hair can still read generic/helmet-like; judge head/neck before clothes.
No main/PR8/PR retry/merge/publication/player Normal changes.
