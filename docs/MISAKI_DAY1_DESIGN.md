# Misaki · Day 1 visual proposal

Bible §20 supplies Small Moments / soft branching; §28 supplies soft anime-toon 3D chibi and stylized PBR; §29 / Part II P3 supplies **Misaki: service / regulars / cozy**. Hair, clothing, expressions and gestures below are original proposals for this candidate, not previously fixed Bible details. This is an individual character candidate, not final Tokyo Slice character certification.

## Readable identity

Misaki has an asymmetric chestnut bob, a low tied side knot and a small ivory leaf clip; a muted sage cardigan frames an ivory long apron with a stitched leaf pocket; a plum flared skirt, ivory socks and dark slip-on shoes give the lower silhouette a different proportion from the existing generic staff. Geometry is independently authored rather than a generic recolor. The leaf pocket quietly connects service to caring for everyday objects. It introduces no logo or merchandise entitlement.

Head height is 0.40m; top is 1.48m, shoe underside 0.015m: standing height 1.465m, about 3.66 heads. Positioning on the existing actorBaseY 0.065 gives shoe underside 0.080m, 0.001m above the room floor. The actor faces local -Z for the existing world yaw adapter. No root translation is animated.

Calm has large open eyes, tiny catchlights and a resting mouth. Smile has separately authored curved eye lids and a soft curved mouth, with unchanged facial proportions. Hair/skin/apron/cardigan separate by value and material role. Facial marks are opaque geometry, avoiding alpha sorting or billboard dependencies. These are simple soft-PBR materials, not a claim that a final cel shader is complete.

## Motion and binding

Presentation ID: `actor.misaki.day1.v1`; economic binding: `staff.graybox`. Existing wages, roster, abilities and simulation stay unchanged. It is not a completed named staff hiring/stat system.

`misakiParts('calm'|'smile')` returns the existing `PersonPart[]` contract, including body/head/left-arm/right-arm pivots. Runtime builds body and arms once and toggles the two head variants. `misakiPose('greet'|'sale', normalizedProgress)` returns head tilt and arm rotations, returning to exact neutral at either end. Greeting is a restrained right-hand lift; sale is a small appreciative nod. Neither sample writes state or triggers a transaction. The owner clock cancels on hide, skip, import, mode switch, reduced/minimal motion and world presentation invalidation. Low uses a static expression/pose as the adapter specifies. There are no animation queues, walk cycles, pathfinding or named-customer sale identity.

## Editable source and interchange

- Editable geometry/color recipe: `src/art/misaki.ts`.
- Shared analytic geometry and material intent: existing `src/art/geometry.ts`, `src/art/materials.ts`.
- Rebuild: `node --import tsx tools/export-misaki.ts`.
- Two versioned GLB masters and byte-identical public copies: `assets/masters/day1/`, `public/assets/day1/`.
- Manifest, source hashes, palette, dimensions, pivots and validation: `assets/authoring/day1/manifest.json`.

GLBs preserve four named rigid part pivots. There are no skins, skeletons or embedded animation clips: the procedure is the motion source. These are transferable scene assets, not a tested Unity/URP adapter or Android/iOS implementation. Every source/model is project-original procedural work; no external textures, likenesses, imagery, voice or model licenses were introduced. Prior W1.1 / W1.1A / W1.1A1 / W1.1B assets are retained untouched.

## Visual acceptance boundary

Structural validation, actual vertex/normal/material parity and native model import do not prove normal-view expression readability or GPU appearance. Check calm/smile, greeting/sale, normal full-shop view, drawer view, current world yaw/zoom envelope and Low/Minimal/Reduce Motion using actual rendered game footage. Existing accepted W1.1B static art remains accepted. New Misaki appearance, occlusion behind the counter, close-view expression, actual GPU cost and native materials remain pending until real frames are reviewed.
