# Misaki R6 — dominant and supporting sweep layout only

R5 independent hair identity gate FAILED despite its lower sweep, fuller
curvature and reduced crown opening. R6 preserves those authoring gains and
changes ONLY the primary fringe10 and underlying temple surface11. It is an
identity candidate, not a style PASS. Rear hair is not refined this checkpoint.

Canonical original was viewed again: `docs/codex-v4/reference/Approved_Visual_Target_Misaki.png`,
1536×1024, SHA256 `9f855d2ecfd120bb45c001db3fa9b5a3e3b58b2b3c2a4cf9e7ebfda84f8f7114`.
PlanB initial and only fresh authorized retry remain failed and stopped; no
new transfer/pixels. Side/back remain inferred.

```sh
blender -b -t 2 --python-exit-code 1 --python tools/asset-foundation/build-misaki-gray.py
node tools/asset-foundation/validate-misaki-gray.mjs
blender -b assets/authoring/misaki-grayform-v1/misaki-grayform.blend -t 2 --python-exit-code 1 --python tools/asset-foundation/inspect-misaki-gray.py
blender -b assets/authoring/misaki-grayform-v1/misaki-grayform.blend -t 2 --python-exit-code 1 --python tools/asset-foundation/check-misaki-r6-scope.py
npm exec vite -- --host 127.0.0.1 --port 4199
node tools/asset-foundation/capture-misaki-gray.cjs
python3 tools/asset-foundation/compare-misaki-gray.py
```

`misaki-hair-r6.py` retains R5's cubic/piecewise cubic borders and independent
internal spine controlling genuine curved transverse sections. Main10 uses a
new two-segment control layout: shoulder, diagonal descending turn and narrow
unequal terminal edge toward the own-right brow. Its shoulder width is about
127–133mm and terminal lateral width33mm. The centre path and end sections
change direction/depth independently; this is not a uniform height/width edit.
The local crest remains shallow and thickness controls remain1.5–10mm.

Surface11 is rearranged from the long outer temple curtain into a shorter
inner supporting sweep. It is about81–91mm wide at the sampled shoulder,
29mm laterally at its terminal. Its terminal centre is about76mm higher and
20mm behind the main terminal in Blender front−Y coordinates. It therefore
recedes and ends separately rather than sharing the old long cut edge.
These are measurements of this candidate, not numeric target specifications.
The off-centre root controls and crown support remain R5's.

All other hair surfaces12–16 are frozen. `check-misaki-r6-scope.py` loads the
pinned R5 .blend from git into temporary memory and compares evaluated vertex
positions/normals, triangle indices and world matrices for each of those five
surfaces. It does not save the loaded baseline or modify the current .blend.
All27 non-hair POSITION/NORMAL/index streams and node TRS, including the clip,
match R5 source1e9680481bc16273b09bd1db39917dc06ba0f276 byte for byte.
R3 face/eye/body24streams and R2 cheek-jaw/nose-forehead/ear-neck remain checked.
All7gray materials, studio camera/light TS,29accepted prop files and720original
application files are unchanged. The own-left+X clip does not move.

Seven closed two-layer12×6cages, subdivision1,20native hidden Bezier guides
and six independent spines remain. No new strands or topology budget.
Guides document controls, not live cage drivers; edit source or cage directly.
No global fusion, voxel remesh, global smoothing or decimation. Root overlap
is not a full watertight weld. Runtime49,368tri /hair7,952 /5meshes /10primitives /
7gray materials /902,132bytes, no images/skins/animations. Frozen props make
121,064tri staged authoring total; no replication/LOD/device acceptance.

Evidence: `docs/reviews/evidence/misaki-grayform-v1-r6`. Fixed front/three-quarter
were inspected against actual original pixels before freezing this candidate.
Final7engine captures include side/back context and normal shop height480 plus
two obliques. Camera/light and all material conditions stay R5's; nozoom.
Original keeps its different pose/projection. Comparisons only crop/scale/
arrange pixels. DEV static sample remains [.85,.079,1.35],yawπ; ordinary `/`,
existing gameplay staff/rig/actions/economy/data/saves remain untouched.

Residuals: the primary is still an overly regular single forelock; the shorter
support can be weak in three-quarter view, and the relationship to the original
loose overlapping fringe remains unaccepted. Frozen rear heaviness/regularity
is not this checkpoint's correction. Review front sweep hierarchy before any
rear refinement, clothes, final materials, fine strands, rig or animation.
Counts/technical checks are not art acceptance. PlanB/PR retries, main/PR8
writes, merge, public Site, payments and player Normal changes stay stopped.
