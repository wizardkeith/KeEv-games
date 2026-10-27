# Misaki R9 — continuous control-volume checkpoint, unaccepted

Current canonical sample is R9. R8 failed independent review for radial seams,
petal side boards and a hidden own-left clip. R9 replaces that construction:
one directly editable continuous outer mesh (337 vertices/320 quads) joins a
9x9 crown grid to eight32-column side rings. Deliberately asymmetric row
sections turn outward then inward near the jaw; main/medium surface folds
share vertices. Only two short ear/lower-edge overlaps remain separate.
No sphere primitive, radial crown fan, voxel fusion, decimation or global
fusion/smoothing. Local Subsurf1 plus editable2.8mm Solidify closes the volume.

Object10 retains its legacy name but is now the whole main bob. Six named
vertex groups select crown, main sweep, support, ear opening, outward and
inward controls. Edit actual native vertices/modifiers; there are no guide
curves falsely presented as live drivers. Thirty-seven non-hair source and
evaluated objects,27 non-hair GLB streams/TRS, materials and camera/light TS
remain byte-frozen. Background Python authoring is not a GUI-editing claim.

Actual first-render feedback showed the clip still hidden. A support plane
fitted to its immutable evaluated vertices seated25 nearby control vertices
behind it. The final front/three-quarter renders show the clip, with zero
sampled eye/clip vertices blocked by hair in those directions. Distance/ray
tests do not certify attachment, collision, final pixels or likeness.

**Still unaccepted:** the continuous mass remains too smooth and helmet-like;
root/main/medium turns do not yet reproduce the original loose fluffy bob.
This checkpoint establishes the volume/visible-eye/clip foundation before
further tip refinement; do not treat technical passes as art acceptance.
See `docs/MISAKI_HAIR_R9_2026-10-28_zh-HK.md` and the R9 evidence folder.

```powershell
New-Item -ItemType Directory -Force ../hair-r9/baseline | Out-Null
node -e "const f=require('fs'),c=require('child_process'),b='ea6613cd001f3fe26cd9f4eadd8c972f5e872fea';for(const [p,n]of [['assets/authoring/misaki-grayform-v1/misaki-grayform.blend','misaki-grayform.blend'],['assets/authoring/misaki-grayform-v1/manifest.json','manifest.json'],['public/assets/misaki-grayform-v1/misaki-grayform.glb','misaki-grayform.glb']])f.writeFileSync('../hair-r9/baseline/'+n,c.execFileSync('git',['show',b+':'+p],{maxBuffer:8*1024*1024}));"
& 'C:/Program Files/Blender Foundation/Blender 5.2/blender.exe' --background --factory-startup --python-exit-code 1 --python tools/asset-foundation/misaki-hair-r9.py -- --baseline ../hair-r9/baseline/misaki-grayform.blend --manifest ../hair-r9/baseline/manifest.json
& 'C:/Program Files/Blender Foundation/Blender 5.2/blender.exe' --background --factory-startup --python-exit-code 1 --python tools/asset-foundation/inspect-misaki-r9.py -- --baseline ../hair-r9/baseline/misaki-grayform.blend
$env:QA_OUTPUT='docs/reviews/evidence/misaki-grayform-v1-r9'
node tools/asset-foundation/validate-misaki-gray.mjs
node tools/asset-foundation/check-misaki-r9-scope.cjs
$env:R8_GLB=(Resolve-Path ../hair-r9/baseline/misaki-grayform.glb).Path
# Set CODEX_NODE_MODULES to the existing bundled Playwright directory.
node tools/asset-foundation/capture-misaki-r9.cjs
python tools/asset-foundation/compare-misaki-r9.py
```

## Historical R8 instructions (superseded)

Current canonical sample is R8. R7 failed independent hair/identity review.
All seven unaccepted hair groups10-16 are now reshaped together into14 medium
clumps, with separate dominant endpoints, a clipward supporting sweep, curved
ear frames and unequal jaw-level ends. All37 non-hair native/evaluated objects,
27 non-hair GLB streams/TRS, seven gray materials and frozen studio/game TS
camera/light sources remain unchanged. No individual strands, rig or clothing
work. Side/back remain inferred from the original illustration.

Actual render feedback exposed overly open coverage in the first draft. One
structural correction established overlapping sections, ear-side turns and
fixed-clip support. The optional frozen-head ray envelope adjusted zero cage
vertices; do not claim it fixed penetration. Final ray sampling found zero
hair-blocked upper-lash vertices in front/three-quarter, versus30 on R7's
own-right front lash. This is not final-pixel eye visibility or art acceptance.

**R8 still has conspicuous geometric root joins, large panel-like layers and
an insufficiently natural bob. Clip support remains imperfect.** The final
head/normal-game comparisons are the review checkpoint, not a visual PASS.
See `docs/MISAKI_HAIR_R8_2026-10-28_zh-HK.md` and evidence folder `r8`.
Seven native objects contain14 separate closed control nets; edit their actual
quad vertices and retained Subsurf1. Hidden poly guides are references only.
This was background Python authoring plus headless render feedback, not GUI
dragging, monitor isolation or a Blender/Unity MCP integration demonstration.

```powershell
# In this checkout; use only a task-owned temporary directory.
New-Item -ItemType Directory -Force ../hair-r8/baseline | Out-Null
node -e "const f=require('fs'),c=require('child_process'),b='6e1fd6dcbad834765331b893d5f709953e29244d';for(const [p,n]of [['assets/authoring/misaki-grayform-v1/misaki-grayform.blend','misaki-grayform.blend'],['assets/authoring/misaki-grayform-v1/manifest.json','manifest.json'],['public/assets/misaki-grayform-v1/misaki-grayform.glb','misaki-grayform.glb']])f.writeFileSync('../hair-r8/baseline/'+n,c.execFileSync('git',['show',b+':'+p],{maxBuffer:8*1024*1024}));"
& 'C:/Program Files/Blender Foundation/Blender 5.2/blender.exe' --background --factory-startup --python-exit-code 1 --python tools/asset-foundation/misaki-hair-r8.py -- --baseline ../hair-r8/baseline/misaki-grayform.blend --manifest ../hair-r8/baseline/manifest.json
& 'C:/Program Files/Blender Foundation/Blender 5.2/blender.exe' --background --factory-startup --python-exit-code 1 --python tools/asset-foundation/inspect-misaki-r8.py -- --baseline ../hair-r8/baseline/misaki-grayform.blend
$env:QA_OUTPUT='docs/reviews/evidence/misaki-grayform-v1-r8'
node tools/asset-foundation/validate-misaki-gray.mjs
node tools/asset-foundation/check-misaki-r8-scope.cjs
$env:R7_GLB=(Resolve-Path ../hair-r8/baseline/misaki-grayform.glb).Path
# Set CODEX_NODE_MODULES to the existing bundled Playwright directory.
node tools/asset-foundation/capture-misaki-r8.cjs
# Existing Python with Pillow:
python tools/asset-foundation/compare-misaki-r8.py
```

## Historical R7 instructions (superseded; not the current rebuild)

Current source is R7. Read `docs/MISAKI_HAIR_R7_2026-10-28_zh-HK.md`
and `docs/reviews/evidence/misaki-grayform-v1-r7` for actual same-machine
R6/R7 comparisons. R7 is unaccepted: the broader sweep wraps the forehead,
but still reads as an overly solid curtain; roots and the frozen rear bob
do not yet reproduce the original. Do not proceed to clothes or animation
on the assumption that the hair passed.

`misaki-hair-r7.py` opens the real pinned R6 `.blend`, edits only cages10/11,
retains the other42 native/evaluated cages, and exports the same five groups.
The main is a closed10x11x2 vertex net; support is8x7x2. Native cage vertices,
side walls and one-level Subsurf remain editable. Guide curves are references,
not live drivers. This was authored with explicit vertex coordinates using
background Python and reviewed in an independent headless browser; no GUI
vertex dragging or exclusive display control was performed or demonstrated.

Rebuild from pinned R6, without overwriting any user project:

```powershell
# From the repository, use a task-owned temporary directory outside it.
New-Item -ItemType Directory -Force ../hair-r7/baseline | Out-Null
node -e "const f=require('fs'),c=require('child_process'),b='cec0c83464291d885ae363ff22d2881ba7d08dda';for(const [p,n]of [['assets/authoring/misaki-grayform-v1/misaki-grayform.blend','misaki-grayform.blend'],['assets/authoring/misaki-grayform-v1/manifest.json','manifest.json'],['public/assets/misaki-grayform-v1/misaki-grayform.glb','misaki-grayform.glb']])f.writeFileSync('../hair-r7/baseline/'+n,c.execFileSync('git',['show',b+':'+p],{maxBuffer:8*1024*1024}));"
& 'C:/Program Files/Blender Foundation/Blender 5.2/blender.exe' --background --factory-startup --python-exit-code 1 --python tools/asset-foundation/misaki-hair-r7.py -- --baseline ../hair-r7/baseline/misaki-grayform.blend --manifest ../hair-r7/baseline/manifest.json
& 'C:/Program Files/Blender Foundation/Blender 5.2/blender.exe' --background --factory-startup --python-exit-code 1 --python tools/asset-foundation/inspect-misaki-r7.py
$env:QA_OUTPUT='docs/reviews/evidence/misaki-grayform-v1-r7'
node tools/asset-foundation/validate-misaki-gray.mjs
node tools/asset-foundation/check-misaki-r7-scope.cjs
# Set CODEX_NODE_MODULES to the existing bundled dependency directory.
$env:R6_GLB=(Resolve-Path ../hair-r7/baseline/misaki-grayform.glb).Path
node tools/asset-foundation/capture-misaki-r7.cjs
# Use an existing Python environment with Pillow; no new package is required here.
python tools/asset-foundation/compare-misaki-r7.py
```

The capture script routes the pinned R6 or actual R7 GLB into separate fresh
contexts executing the same frozen camera/light module. Only the on-screen
revision label is set for each capture. It checks loaded hashes, camera/light
equality and fresh Sandbox purchase/display/reload/quality switching. It does
not attach to an existing Chrome profile, Unity or Blender window.
The gray fixture remains at [.85,.079,1.35], yaw pi; the ordinary colored staff
is unchanged. Game-scale differences are small and not an identity PASS.

## Historical R6 record and commands (not the current R7 rebuild)

Running the legacy builder below regenerates R6 and overwrites the current
canonical sample. Use it only intentionally for R6 reproduction; use the
pinned baseline procedure above for R7. Historical counts below describe R6.

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
