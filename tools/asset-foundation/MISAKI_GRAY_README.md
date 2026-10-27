# Misaki R4 — separate flow surfaces for hair only

R3 independent identity gate FAILED: its spherical cages plus 6mm voxel fusion
and twelve global smoothing iterations erased flow and overlap boundaries.
R4 replaces that authoring method. Identity/style remains unaccepted.

Canonical authority is `docs/codex-v4/reference/Approved_Visual_Target_Misaki.png`,
1536×1024, SHA256 `9f855d2ecfd120bb45c001db3fa9b5a3e3b58b2b3c2a4cf9e7ebfda84f8f7114`.
The actual original portrait was viewed at head scale. PlanB initial transfer
and the only authorized fresh retry both failed; transfers remain stopped.
Side/back volume is explicitly inferred, not traced from unseen new views.

```sh
blender -b -t 2 --python tools/asset-foundation/build-misaki-gray.py
node tools/asset-foundation/validate-misaki-gray.mjs
blender -b assets/authoring/misaki-grayform-v1/misaki-grayform.blend -t 2 --python tools/asset-foundation/inspect-misaki-gray.py
npm exec vite -- --host 127.0.0.1 --port 4199
node tools/asset-foundation/capture-misaki-gray.cjs
python3 tools/asset-foundation/compare-misaki-gray.py
```

The builder executes the frozen R3 face/eyes/ear/neck definitions up to its
hair section, then `misaki-hair-r4.py`. R3 and R2 modules stay unchanged.
Six independently shaped, closed, varying-thickness clump surfaces provide
one dominant swept fringe, its temple underlap, the shorter own-left ear side
and three unequal rear flows. A seventh small arched crown underlap supports
local root joins; it is not a full-head spherical shell. Front/back overlaps
and unequal lower tips remain separate geometry. No voxel union, decimation,
global smoothing, extra subdivision level or fine strands are used.

Every clump has left/right cubic or piecewise cubic Bezier controls, a variable
cross-width crest and physical thickness controls of 1.4–10mm. Twelve rows by
six columns per side form a closed two-layer cage, locally subdivided once.
Fourteen hidden native Bezier edge guides and JSON custom properties remain in
the editable .blend. Guides document controls and do not automatically drive
an edited cage; use the source controls to regenerate. Neighboring temple/rear
edges share root controls but retain overlap boundaries. These are sculpt
controls for another shape iteration, not a final watertight coiffure.

The 24 POSITION/NORMAL/index streams and node TRS for face, feature-placement
and clothed-body match R3 source `7b0d20fd91f537a43244a51c64afe64a1b7ec425`
byte for byte. This freezes fuller R3 eyes/shorter corners, R2 cheek/jaw and
nose/forehead/ear/neck, and all body/clothes. All seven gray material definitions
and the studio camera/light TypeScript source are unchanged. The left clip
keeps its rigid leaf shape, attaches to an evaluated clump surface and remains
on the character's own LEFT (+X); unsigned sampled vertex distances are only
preliminary attachment evidence, not collision certification.

Runtime: 49,368tri, including 7,952 hair triangles; 5 semantic meshes,
10 primitives, 7 gray roughness1 materials, 902,128 bytes; no images, skins or
animations. With the frozen 71,696tri prop baseline the authoring scene stages
121,064tri, without replication or claimed device/FPS certification.
The 29 accepted R4/PaperR2 asset/source files stay frozen; feet remain Y0.

Evidence folder: `docs/reviews/evidence/misaki-grayform-v1-r4`. Actual front,
side, back and three-quarter studio captures use the same fixed two lights
and same camera as R3. Original/R3/R4 head panels only crop, resize and arrange
pixels; original remains its different three-quarter pose/projection. Actual
normal shop height480 and two obliques show the static sample at unchanged
[.85,.079,1.35], yawπ. Old gameplay staff/rig/actions are unchanged. Ordinary
`/` does not load this DEV sample. Camera/light settings and loaded GLB hashes
are checked alongside fresh Sandbox UI lifecycle; those are not art tests.

Main residuals to inspect: root joins and some outline turns remain hard or
planar; front and rear layering may still read as broad sheets rather than the
original loose bob. Shape method is now editable per flow, but identity is
not accepted. Do not proceed to fine hair, clothes, materials, rig or animation
before independent review. No PlanB or PR retry, main/PR8 writes, merge,
publication, payments or player Normal changes.
