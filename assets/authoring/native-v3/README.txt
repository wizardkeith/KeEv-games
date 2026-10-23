Next Stop, Little Shop — native character source v3.1

REBUILD
From canonical checkout, with the locked package dependencies:
node --import tsx tools/export-native-characters.ts
node --import tsx --test tests/native-characters.test.ts

SOURCE / REAL RUNTIME
src/art/native-characters.ts authors all three original characters, including
custom lofted face/jaw/cheeks, grouped tapered locks, tailored jacket/lapels,
apron/pleats/skirt, distinctive visitor outfits and personal bags. This is the
actual runtime source. nativeGrouped() uses the same generated positions,
normals, indices and material intent as the GLB exporter.

RIG
25 stable semantic nodes per actor. Local metres, RH, Y up, face -Z.
body -> head / shoulder arm-left,right / hip leg-left,right.
shoulder -> forearm -> hand -> socket.
hip -> shin -> foot. Head contains eyes, closed eyelids, brows, curved mouth,
and two small secondary hair pivots. Recipe coordinates and pivots are LOCAL.
Real rest sole is y=.015. Runtime actorBaseY=.065 puts soles at y=.080,
slightly above floor .079. +X pitch on a downward limb swings it toward -Z.

EXPRESSIONS
Use the same sculpted face for all expressions. eye-left/right carry whites,
iris, upper lid and restrained highlight. eyelid-left/right are closed-lid
geometry, disabled at runtime rest. glTF lacks a visibility field, so exported
masters additionally compress these nodes to Y scale .001 and record extras.
An importer must restore Y scale 1 and use the runtime visibility policy to blink.
Mouth and brows have stable pivots for focus/smile, without replacing a head.

PORTABILITY
Three GLB 2.0 binary masters and public copies, local parent hierarchy, standard
PBR material fallback, shared exact IEC sRGB-to-linear factors. No texture/atlas
or UV dependency. Every vertex/index/node/material is tested against authoring.
These are rigid articulated parts, not skeletal skins or embedded animation clips.
Procedural motion lives in src/presentation/native-motion.ts, native-staff.ts,
native-routes.ts and Babylon-specific native-scene.ts. Future Unity/URP/native
adapters must bind these IDs, blend relative to rest, and calibrate materials.
No claim of iOS/Android/Unity build or real-device performance validation.

VALIDATION BOUNDARY
Khronos glTF validator: zero errors and zero warnings on all three masters.
Tests check finite geometry, unit normals, outward nondegenerate triangles,
distinct custom silhouettes, grounded proportions, deterministic output/source
hashes, full runtime/export parity and actual articulated greeting palm/thumb
vertices outside new torso/apron/skirt at 101 sampled phases.
The greeting hierarchy test uses Babylon NullEngine as matrix mathematics only.
No structural test or GLB import is an actual rendered 3D visual acceptance.
Actual face readability, hair/clothing/light response, normal/mobile camera,
animated elbow/cloth/counter/prop clearance and foot motion remain subject to
real WebGL view and video review in a supported environment.

RIGHTS
Original project procedural geometry/design, existing project primitive
geometry and semantic palette. No external model, image, Grok video, texture,
paid service, new API key or local modelling software dependency.

V3.1 PLANTED LOCOMOTION REVISION
NativeFootPlant in src/presentation/native-feet.ts replaces vertical-only gait
compensation. It stores immutable world ankle/sole targets and foot yaw during
stance; a single swing uses .18m half steps, .045m lift and .28s turn/recenter.
The actual .25/.30m rigid links use external two-link IK quaternions and small
reach-based body drop. No skeleton, skinned mesh or embedded GLB clip is claimed.
Visitor B retains complete authored leg/shin/foot meshes; a fuller A-line skirt
profile encloses actual moving thigh vertices through both steps and turns.
The exported rest hierarchy is unchanged, and the engine-neutral locomotion
source is included in the manifest so another engine can reconnect it.
evidence/native-v3_1/locomotion-before.json replays the old indexed v10 GLB;
locomotion-after.json records shoe centroid horizontal drift and full stride /
turn skirt clearance. These are geometry results, not rendered visual approval.
