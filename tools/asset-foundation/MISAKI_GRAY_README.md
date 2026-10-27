# Misaki R5 — internal cross-sections, main sweep and crown roots

R4 independent hair identity gate FAILED. R5 retains separate clump surfaces,
but replaces the border-only main fringe with an independent internal spine.
The canonical original portrait was viewed again, with its off-centre sweep
descending toward one eyebrow. Identity/style is still unaccepted.

Authority: `docs/codex-v4/reference/Approved_Visual_Target_Misaki.png`,1536×1024,
SHA256 `9f855d2ecfd120bb45c001db3fa9b5a3e3b58b2b3c2a4cf9e7ebfda84f8f7114`.
PlanB initial transfer and its only authorized fresh retry remain failed and
stopped. No new transfer or new reference pixels; side/back remain inferred.

```sh
blender -b -t 2 --python tools/asset-foundation/build-misaki-gray.py
node tools/asset-foundation/validate-misaki-gray.mjs
blender -b assets/authoring/misaki-grayform-v1/misaki-grayform.blend -t 2 --python tools/asset-foundation/inspect-misaki-gray.py
npm exec vite -- --host 127.0.0.1 --port 4199
node tools/asset-foundation/capture-misaki-gray.cjs
python3 tools/asset-foundation/compare-misaki-gray.py
```

The builder executes the unchanged R3 face/eyes/ear/neck prefix, then
`misaki-hair-r5.py`. R2/R3/R4 authoring modules remain unchanged.
Each clump has cubic or piecewise cubic left/right borders. Six of seven also
have a separately shaped internal Bezier spine: main fringe, temple turn,
three rear flows and the small local root join. The seventh short ear/clip
side retains its border controls. A transverse quadratic section passes
through both borders AND the independent spine, varying its direction,
curvature and depth down the clump. The spine is not a scalar bulge on a
linear chord. Its control cage contains actual middle vertices (u=.5).

The main sweep now descends to the own-right brow side from a shared off-centre
root region. Root collars gather into that small region and overlap locally,
without a floating broad crown plate. Internal side/rear spines restore
outward-then-inward bob volume and unequal lower turns. No global fusion,
voxel remesh, global smoothing, decimation, extra subdivision or fine strands.
Visible overlaps remain separate geometry, not a watertight welded hairstyle.

Every closed two-layer cage remains12×6 vertices per layer, subdivision1.
There are still7 surfaces and7,952 hair triangles, exactly R4's count.
Twenty native hidden Bezier guides and custom control properties remain in
the .blend. Guides document editable controls; they are not live cage drivers.
Edit cage vertices directly or change source controls and regenerate.

All27 POSITION/NORMAL/index streams and node TRS of EVERY non-hair group,
including both clip leaves, match R4 source42d99f7d01515577e46605fa43f635e0708ee3e0.
The frozen clip's local control coordinates are in `misaki-frozen-clip-r4.json`;
it is not moved to disguise contact. Read-only current clip distances remain
sampled unsigned distances, not signed collision/attachment certification.
R3 face/eye/body24streams and R2 profile/ear/neck are separately verified.
All7gray materials and the studio camera/light TS source remain unchanged.
The29accepted props/source files and720original application files are frozen.

Runtime49,368tri /5semantic meshes /10primitives /7gray roughness1materials /
902,132bytes, no images/skins/animations. With71,696tri frozen prop baseline,
the DEV authoring scene stages121,064tri. No replication, LOD, device/FPS or
rig acceptance. FeetY0 and own-left+X clip remain unchanged.

Evidence: `docs/reviews/evidence/misaki-grayform-v1-r5`. Fixed2light studio
front/side/back/three-quarter uses unchanged R4 camera/light. Original/R4/R5
head comparisons only crop/resize/arrange real pixels; canonical portrait keeps
its different three-quarter pose/projection. Actual normal shop height480 and
two obliques use unchanged [.85,.079,1.35],yawπ and nozoom. Existing staff,
rig/actions/data/economy/saves are not replaced; ordinary `/` omits the DEV sample.

Residuals: the dominant fringe remains very broad and its lower edge can still
look cut; the side/back silhouette is too regular and rear mass still reads
heavy. Crown overlap boundaries remain visible at some angles. Do not call this
identity PASS or proceed to clothing, final material, fine strands, rig or
animation. Technical tests/counts are not art acceptance. PlanB/PR retries,
main/PR8 writes, merge, public Site, payments and player Normal changes stay stopped.
