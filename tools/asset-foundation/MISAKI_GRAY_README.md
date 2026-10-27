# Misaki proportion grayform v1

Editable actual 3D, canonical-original-only checkpoint. User-supplied PlanB
Library preparation succeeded, but the current official consumer-local transfer
helper returned `download failed`; no local ZIP bytes or new reference pixels
were available. The Library metadata read could not render the ZIP. No raw-URL
fallback, imagined sheet tracing or full-pack regeneration request was used.

Canonical authority is `docs/codex-v4/reference/Approved_Visual_Target_Misaki.png`,
1536×1024, SHA256
`9f855d2ecfd120bb45c001db3fa9b5a3e3b58b2b3c2a4cf9e7ebfda84f8f7114`.
PlanB ID/expected SHA and contradictory-view rules remain in
`docs/MISAKI_NEXT_STAGE_REFERENCE_HANDOFF_2026-10-27.md`. Its unseen side/back
images were not used. This candidate's side/back volumes are author inference.

```sh
blender -b -t 2 --python tools/asset-foundation/build-misaki-gray.py
node tools/asset-foundation/validate-misaki-gray.mjs
npm exec vite -- --host 127.0.0.1 --port 4199
node tools/asset-foundation/capture-misaki-gray.cjs
python3 tools/asset-foundation/compare-misaki-gray.py
```

The `.blend` keeps42 semantic editable objects with quad cages and subdivision.
Five evaluated export groups limit the GLB to10material primitives,7neutral
gray PBR materials, no textures, no skin, no animations;47,576tri/868,528bytes.
No target-image projection, video planes, generated concepts or texture tricks.
Floor-normalized GLB height1.44225m; source evaluated crown/chin give3.24268head
units, hair width.46267m, lowest hair.048999m below chin. These are author
proportions, not precise recovered measurements from an illustrated pose.

Blender Z-up/front−Y/own LEFT+X exports glTF Y-up/front+Z/own LEFT+X. The two
clip leaves are on +X only. The normal game fixture rotates the static sampleπ;
it is not a replacement for the production rig's −Z facing convention.

Continuous soft face/jaw/nose surface, broad bob cap/locks, open cardigan,
continuous apron panel, skirt, arm/wrist loops, simple hand/foot masses are
geometry. Hands have no fine fingers, hair no fine strands, cloth no weave.
The face has editable ring flow and separate eye/lid placement geometry, not
final eye-opening topology, expression loops, skin weights or rig certification.
Source garment overlaps/collisions still need dedicated work before animation.
Back bow is omitted instead of claiming unseen reference support.

`studio-misaki-gray.html` shows front/side/back/three-quarter under fixed neutral
key2.1/fill.65. Front/side/back are orthographic; three-quarter retains the same
orthographic scale with a small elevated angle. No per-view light tuning.
`gameplay-misaki-gray.html` imports the frozen R4/paperR2 fixture and actual app,
then adds one non-pickable static grayform at `[.85,.079,1.35]` in a clear aisle.
The old gameplay staff, rig/actions/data/saves and normal camera remain intact.
The ordinary `/` entry never imports this DEV authoring sample. It is not stock,
a new NPC or an economic capability. Staged authoring total119,272tri includes
the frozen71,696tri props; no bulk replication or device/FPS acceptance.

Capture uses fresh Sandbox UI buy3mugs/untouched display3slot2/reload/Low→High,
checks Normal baseline unchanged and actual loaded asset SHA, prior camera and
full lighting identity. Seven actual images and raw diagnostics are separate
from art acceptance. R4/PaperR2's29asset/authoring files are byte-frozen.

This is a grayform candidate, not style PASS. Face/eye/nose softness and broad
hair mass remain too doll-like/hard; cardigan/apron gravity and side/back are
provisional. Resolve readable PlanB access and judge these forms before final
material, rig, animation or fine topology. No main/PR8/PR retry/merge/publication
or player Normal changes are authorized by this stage.
