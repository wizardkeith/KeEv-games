# Native 3D v3 candidate · 2026-10-23

Same public Site: https://next-stop-little-shop-w1.starry-ridge-5482.chatgpt.site
Project: appgprj_6ad82a08ed2881918ebcc2dd206a122d
Opening canonical commit: 8eca6d53e13b0d2db457636844b49bf700753c43 (v9; no later work found).
Actual final source commit, version and deployment IDs are in the delivered `deployment-receipt.json` and `HANDOFF_zh-HK.txt`, both included in the ZIP. A source commit cannot contain its own future deployment receipt.

Implemented candidate

- Three actual runtime models: custom smooth face/jaw/cheeks, eyes/lids/brows/mouth, grouped tapered hair, tailored clothes/folds/sleeves and distinctive personal crossbody bags. Misaki retains staff.graybox; visitors have no economic identity.25 rigid semantic nodes each. Same authoring feeds Babylon and3 GLBs, totalling988,712bytes, Khronos0errors/0warnings. Linear PBR retained; native-only shoe leather roughness=.48.
- Two pooled visitors follow reserved routes through a real doorway and outward-hinged door. Slow turns/start/stop, distance-based alternating legs/feet,5.2/6.6-second browsing and walking exits. Low drains visitorB naturally; closing does not pop both actors away. Headless visits about42–47seconds including waiting/turns; real pacing still needs viewing.
- Misaki breath/blink/look, outward greeting, cloth tidy/note tasks (first at6seconds;16-second cadence), stock count and2.8-second packaging/counter release. Elbow-first lift prevents intermediate counter clipping. Staff now faces the counter service edge from behind it.
- Four pooled props: bag/box/note/cloth. Hand sockets and smoothed owner changes capture held world position before resetting pose. Sale uses Misaki-only generic packaging/counter release plus immediate UI/receipt. Visitors remain browsers; no buyer/SKU attribution, customer-specific bag collection route or economic events from movement are claimed.
- Fixed pots/roots and moving leaf pivots, door sign, cool small exterior tree/building geometry,8-mote pool, furniture edge/drawer/base refinement, tea/notebook/mug finishing. Original A1 mug shell and A2 material policy preserved. No Grok, video textures, weather/new map expansion or new audio dependency.
- Low/Minimal retain native walk/work/service; Reduce Motion freezes continuous motion with committed status. Decorative effects, service and routes are independent. Repeated Minimal setter and decorative reveal deadline cannot cancel service. Existing system Reduce Motion is respected.

Reference and integration

`src/presentation/native-motion.ts` copies the supplied starter unchanged: SHA256215b955ec4b3fc83400a478545882b257fc244247fb16ea630748bbce8547000. Policies, idle/walk samplers, validated receipts and sequencer are genuinely used; queue is one active and one latest pending batch, each at most2cues.

`native-commits.ts` is app-owned, surviving deferred/failed world creation. `main.ts` captures command ID/item/quantity/slot before await. Only successful Saves.command/Saves.settle transitions enter it. Newly recorded accepted IDs establish real buy quantity; display uses the captured changed target. A command that first settles sales retains command and sale cues. Hidden/stale receipts consume revision before skipping visuals. Reload/retry/catchup/import/mode establish a new baseline; app-wide epoch stays monotonic.

`native-routes.ts` authors footprints, reservations, door requests and movement. `native-staff.ts` defines rest-relative clips/markers without timers or storage. `native-scene.ts` binds joints, facial parts, flat sole targets and props. `world.ts` converts milliseconds to seconds once and resolves effective quality. This is rigid articulated motion with foot-height compensation, not full foot IK, skeletal clips or native-platform validation.

Verification

-111 named tests PASS;0fail/skipped/cancelled. Original economic/storage cases retained. New coverage includes main command acceptance despite concurrent sales, captured shelf, duplicate/no-op/abort, hidden/deferred boot no-replay, foreign streams, bounded queues, Low/Minimal/Reduce differences, routes/door sweep/close-reopen, new-rig palm/clothes/counter and prop ownership, foot contact and source/master parity.
-188 v9 protected files byte-identical: core, storage/narrative, old assets/fonts, accepted geometry/material intent and Day1 story UI. Base locale changes only MinimalFXNote in5languages. v9 CTA/profit/greeting regressions pass.
-Production TypeScript/Vite build PASS; content validation PASS (10offerings,5locales,174base keys each); deterministic replay PASS. Large-chunk warning remains; no FPS claim.
-Real managed browser DOM/CSS QA:375×820 and320×820, no body horizontal overflow. Isolated save: buy5tea→display→story-open→legal Sandbox+15m gives displayed net¥260/sold1 at Tokyo10:15; reload retains revision5 and Minimal preference. Five updated notes checked. Low selected in UI only; Auto shown after reload is not an effective GPU tier measurement.
-**3D 視覺待確認**: managed browser reports `Error: WebGL not supported`. No actual before/after images or60–90-second 3D recording. GLB validators, transformed geometry/NullEngine matrices and DOM results are not rendered acceptance. Faces/hair/clothing/light, whole-scene readability, gait/hands/props, Low/mobile presentation and physical-device performance remain unconfirmed.

Superseded tests/policies

Old fixed-root and Low/Minimal native-freeze assertions are replaced by the new route/motion contract. Historical art tests still cover frozen old masters; new25-node models have separate parity/collision checks. Existing F1–F3/boot tests execute real boundaries with new VM bindings. A new test proves repeated settings and discovery deadline do not cancel service. Historical `tools/day1-preservation.ts` remains archived in source; use `tools/native-preservation.ts` for this scope.

Rebuild and portable sources

Retrieve the same Site canonical checkout at the receipt commit. Keep hosting identity; use locked dependencies. Run the three `tools/export-native-*.ts` scripts using `node --import tsx`, then `npm test`, `npm run validate`, `npm run replay` and the supported Sites build helper. Publish without review Vite flags. Authoring/rig/motion contracts, GLBs and environment/product recipe JSON masters are versioned. No Unity/URP/Android/iOS build or device QA is claimed.

Delivery ZIP is a focused v9-based changes/assets/evidence package; unchanged large font/master history remains in canonical Git. The pushed receipt commit is the complete source checkpoint. The ZIP is not a duplicate of every historical resource. After closing it, a normal ZIP reader verifies CRC, exact entries, manifest hashes and complete changed-source coverage. Bytes/SHA256 are reported separately.

Real-3D follow-up

Use the same public URL in a WebGL-capable browser. Preserve normal progress; use the existing independent Sandbox within10–20Tokyo opening hours. Record20–30seconds without camera input, then one full entry/browse/exit (~45seconds). Use legal+15m/+1h for real settlement; capture packaging and successful stock/display. Repeat Low and Minimal separately, system Reduce Motion, close/reopen and hide/return. Check no mass popping, orphan prop or old-sale replay. Add front/three-quarter close views of all3models. Do not reset normal progress or impose fresh-fixture values on an existing Sandbox.

Previous v9 handoff: docs/HANDOFF_Day1_v9_Archived.md.
