# Blender v3 — garment/stance checkpoint; new hair study rejected

**Overall target likeness still fails.** V3 retains the useful stance, waist,
cuff and collar changes. The new hair construction was judged visually worse
than v2 and was not adopted; the retained proof uses v2 hair geometry. This
checkpoint does not establish that background procedural modelling can deliver
the approved art style.

- [Target / unchanged v2 with matched pose / retained v3](reviews/evidence/target-model-proof-v3/reference-model-comparison-v3.png)
- [Target face / retained v3 three-quarter / front](reviews/evidence/target-model-proof-v3/reference-face-comparison-v3.png)
- [Whole character](reviews/evidence/target-model-proof-v3/blender-model-character-v3.png)
- [Complete representative display context](reviews/evidence/target-model-proof-v3/blender-model-assembly-v3.png)
- [Rejected hair study — actual close render](reviews/evidence/target-model-proof-v3/rejected-hair-close.png)
- [Rejected hair study — actual full render](reviews/evidence/target-model-proof-v3/rejected-hair-full.png)
- [Editable retained and rejected native sources](../assets/authoring/target-model-proof-v3/README.md)

All pictures are real Blender Cycles renders. Only labelled crops/resizing are
used for comparisons. The original reference remains byte-identical, SHA256
`9f855d2ecfd120bb45c001db3fa9b5a3e3b58b2b3c2a4cf9e7ebfda84f8f7114`.

## Pose first, then garment structure/material changes

The first [pose control](reviews/evidence/target-model-proof-v3/v2-pose-only-three-quarter.png)
uses v2 geometry/materials and changes only body yaw (-0.26 radians), relative
head yaw (+0.21 radians), and head tilt (-0.17 radians). Under the existing full
camera this gives approximately a 30-degree body view with a more frontal face.
The source is not saved over; [pose-study.json](reviews/evidence/target-model-proof-v3/pose-study.json)
records source hash and transforms. This stance is inferred from the original,
not a certified reconstruction of its camera/pose.

That control still showed an overlong torso, low cuffs and rounded toy collars.
V3 raises the waist by 50mm and compresses the blouse/cardigan below the chest;
skirt/apron control surfaces extend to the higher waist. Sleeve ends are raised
50mm with actual crest/trough controls and folded cuff geometry. The blouse
collars retain pointed planar corners with a submillimetre bevel, without the
Catmull-Clark rounding that erased the earlier tips. Hanging waist ties use
thin ribbon surfaces rather than round rope-like tubes.

Skin, knit, blouse, apron, skirt and hair have separately assigned roughness
and specular response. This avoids one shared smooth finish, but
does not reproduce the target's painted/knitted detail or natural fabric drape.
Lights and camera remain fixed relative to the v2 pose control.

A cloth-sheen trial looked valid in Cycles but washed out the garment colours
after GLB reimport, despite a zero-error/zero-warning validator result. Its actual
render and metrics are retained as `rejected-sheen-roundtrip.png` and
`rejected-sheen-metrics.json`. Sheen is disabled in the retained native/export
pair. This is an observed shading roundtrip constraint of this configuration,
not an installation or licensing blocker; colours must be checked in real output.

## Hair study failure and authoring limitation

The attempted new hair study used individually authored unequal side/back paths,
embedded root backs, irregular tapered endpoints, deeper overlapping sections
and an upper-crown lift. Actual close renders revealed a helmet-like crown and
several separated, thick dangling ends. It looked less natural than v2 and did
not reproduce the swept parting and layered bob. It was explicitly rejected.
The native failed study and its actual render evidence remain available;
the final v3 hair geometry is restored from v2, with no new-hair improvement claim.

Cycles renders successfully, native meshes/control vertices remain editable, and
the exports reopen. **There is no demonstrated renderer/software/licensing
blocker. The current sweep/loft construction method has failed to produce the
required sculptural/artistic result.** This is not evidence that Blender CLI
fundamentally cannot do it; it is a limit of the authoring approach demonstrated
here. Background Python can edit vertices, but these results do not prove the
ability to reproduce the original's organic hair, facial identity and cloth
forms. Interactive sculpting/texture painting has not been exercised under the
current GUI hold. More polygons or repeated parameter variants should not be
presented as a reliable path to acceptance. The authoring workflow needs review.

Remaining gaps include the restored v2 hair's rigid clumps and crown seams,
simplified eye/cheek expression, artificial garment folds, hands/ear/shoe forms,
skin/fabric response and exact pose. Side/back/hidden details are inferred. The
display is representative, not the full shop. No artistic acceptance, rig,
animation, signed collision or mobile-device performance is claimed.

## Integrity, preservation and sync

- [Native/export identities](../assets/authoring/target-model-proof-v3/manifest.json)
- [Native reopen and independent GLB reimport](reviews/evidence/target-model-proof-v3/native-roundtrip-verification.json)
- [Strict glTF validator output](reviews/evidence/target-model-proof-v3/glb-validator.json)
- [V2 source and 324-object display preservation](reviews/evidence/target-model-proof-v3/v2-preservation.json)
- [Native/portable render differences](reviews/evidence/target-model-proof-v3/render-comparison-metrics.json)
- [Scoped hashes and sanitized command logs](reviews/evidence/target-model-proof-v3/phase-receipt.json)

The installed Blender 5.2.3 LTS and existing locked validator are used. Actual
native reopen, independent imports, bounds/triangle counts, packed/embedded
textures, vertex colours, strict zero-error/zero-warning GLBs and same-scene
render consistency are checked. These are integrity checks, not likeness scores.
The retained character has 202,752 triangles, one embedded cloth image and 13
vertex-colour primitives; the unchanged display has 65,216 triangles and 12
embedded images. Final native/portable mean RGB8 difference is
0.0245 / 0.0192 / 0.0214 per channel after disabling the failed sheen trial.
Optional thumbnail/cache failures and tangent warnings on non-normal-mapped
UV-less geometry are distinct from actual GLB validation results.

The phase starts from `fe1025ba2cb1a784df2097780cce97cbb747f019`. V2 source and
exports, existing game code/assets, deterministic fix, locales, saves and public
Site identity are preserved. No historical Web test result is claimed as new.
Only background modelling/rendering is used: no GUI input, Unity/gameplay work,
installation, auth/security changes, PR retry, merge, deletion or public release.
Native/render evidence is synchronized on the same isolated branch; exact
commit/readback and Library version are reported externally.
