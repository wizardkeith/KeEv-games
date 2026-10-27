# Misaki R3 — swept hair masses and fuller eye opening

Independent R2 head/neck identity gate FAILED. R3 remains head/neck only:
body, limbs, continuous cheek/jaw/nose/forehead profiles and ear/neck cages are
preserved. New work is one dominant swept hair volume, a smaller opposite
part at the exposed own-left ear/clip, unequal bob ends and a fuller central
eye opening with shorter corners/thinner upper lid. No final identity PASS.

Canonical original was viewed again at head scale:
`docs/codex-v4/reference/Approved_Visual_Target_Misaki.png`,1536×1024,
SHA256 `9f855d2ecfd120bb45c001db3fa9b5a3e3b58b2b3c2a4cf9e7ebfda84f8f7114`.
PlanB original attempt and one fresh supported retry remain failed/stopped.
No new reference pixels or transfer attempts; side/back are inferred.

```sh
blender -b -t 2 --python tools/asset-foundation/build-misaki-gray.py
node tools/asset-foundation/validate-misaki-gray.mjs
blender -b assets/authoring/misaki-grayform-v1/misaki-grayform.blend -t 2 --python tools/asset-foundation/inspect-misaki-gray.py
npm exec vite -- --host 127.0.0.1 --port 4199
node tools/asset-foundation/capture-misaki-gray.cjs
python3 tools/asset-foundation/compare-misaki-gray.py
```

Builder now calls `misaki-head-neck-r3.py`; R2 authoring module stays unchanged.
The hair source joins three actual volumetric cages (foundation, dominant sweep,
smaller tucked mass) with named vertex groups. A non-destructive voxel union and
broad relaxation blend the roots; a runtime decimation budget keeps hair around
8,000tri. Source cages remain editable. The SAME one subdivision level is used;
no fine strands, higher subdivision level, weave, finger detail or new textures.

Eye aperture half-width42→37mm; upper/lower centre heights31/22→36/27.5mm,
outer tilt4→2.5mm, upper fold width6→3mm and upper lash radius is reduced.
Iris remains simple gray geometry, not a painted identity patch. Real eye holes
remain two evaluated40-edge loops. Face profile/forehead-nose functions, neck
and ear cages/45mm head offset are unchanged fromR2; no3.24ratio optimization.

The own-left leaf outline is rigidly oriented to an actual evaluated hair
surface hit. It is not individually warped to projected depths. Sampled clip
vertex distances are recorded as unsigned distances, not full contact proof.
Blender Z-up/front−Y/own LEFT+X exports glTF Y-up/front+Z/own LEFT+X.

The source .blend retains38semantic objects. Runtime49,414tri/5meshes/
10primitives/7unchanged gray roughness1materials/902,632bytes, zero images,
skins or animations. Frozen props71,696tri give staged authoring total121,110tri;
no bulk replication, device/FPS or rig acceptance. Budget is4,066tri belowR2.

All12body POSITION/NORMAL/index streams and nodeTRS match source038740fbd7f6428cc82d5f442646c2d86a4143e3.
All7gray material definitions,29accepted R4/PaperR2asset files,720original app
files and studio camera/light TS source remain unchanged. FeetY0 and own-left
clip are checked. The two new eye/profile contract checks do not certify art.

New evidence is `docs/reviews/evidence/misaki-grayform-v1-r3`; R2 raw evidence
remains intact. Front/3quarter/side head comparisons use the same model camera
and raw crop; the original portrait is approximately matched at crown/chin
scale and explicitly retains its different pose/projection. Full-body context
and actual normal shop480/two obliques remain primary evidence, no zoom.
Static sample stays `[.85,.079,1.35]`,yawπ alongside old gameplay staff/rig.
Ordinary `/`, data/saves/actions/economy are unchanged; fresh Sandbox UI checks
are separate from art. Main fringe can still be too thick/regular and rear mass
helmet-like; do not claim original-style acceptance or move on to clothes.
No PlanB/PR retry, main/PR8/merge/publication or player Normal writes.
