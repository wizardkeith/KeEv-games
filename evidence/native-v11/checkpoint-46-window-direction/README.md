# C46 evidence provenance

Application `875d43351bc0644ef0411d0a7a61ae5d0b7e9343`; C46 is explicit authoring only. Ordinary C45 and public V17 remain unchanged. Whole target art is not accepted.

Raw `contact/daylight-normal-game.png`, both obliques, `stock288/*.png` and `lowrm288/*.png` are actual Chromium154 WebGL2/ANGLE SwiftShader page captures. Composites crop/resize/label these images only. Original target is separately identified in source-identity.json. No generated concept, studio or screen-fixed scene substitute. Natural actor phases vary; normal camera, pointer orbit endpoints and imported stock/cash match.

`media-sha256.json` pins every image/video; `runtime-payload-sha256.json` pins all195 files per build. Actual QA builds288/286 are byte-identical to builds290/291 rebuilt from the pushed application (runtime-parity.json). `source-identity.json` contains actual optical values, caster/RTT observations, source/reference hashes, frame cadence and coverage limits. Raw diagnostic results are gzip-compressed without editing.

`rejected-controls/` contains exploratory failed controls, not immutable final applications. They are excluded from final optical validation. The pre-rebuild test manifest failure is retained and not counted as PASS. All final285 tests passed after source-manifest rebuild; historical C45 source receipt remains anchored to its original application.

Reproduction uses installed project tools and an isolated fresh Sandbox only:

```sh
VITE_V11_SCENE_WINDOW=daylight npm run build
# Serve a frozen dist directory at a local port; ordinary npm run build is the contact control.
QA_OUTPUT=/tmp/c46-look QA_SEED=evidence/native-v11/checkpoint-31/actual-ui-sandbox-seed.json QA_LOOK_URLS=contact=http://127.0.0.1:4553,daylight=http://127.0.0.1:4554 QA_SCENE_WINDOW_MATRIX=1 QA_OCCLUSION_MATRIX=1 QA_OCCLUSION_ID=v11.c44.localized-contact.v1 QA_EXPECT_MODE=combined QA_EXPECT_BRIGHT=combined QA_HUD_COMPOSITE=1 QA_CLEAN_STORY=1 QA_FORM_ORBITS=1 node tools/v11-table-look-qa.cjs
QA_URL=http://127.0.0.1:4554 QA_OUTPUT=/tmp/c46-stock QA_EXPECT_ADOPTED=1 QA_EXPECT_BACKWALL_ADOPTED=1 QA_DAYLIGHT=1 QA_SHADOW_BALANCE=1 QA_SHADOW_MODE=daylight QA_OCCLUSION=1 QA_OCCLUSION_ID=v11.c44.localized-contact.v1 QA_RECORD=1 node tools/v11-table-stock-cycle-qa.cjs
QA_URL=http://127.0.0.1:4554 QA_OUTPUT=/tmp/c46-lowrm QA_EXPECT_BACKWALL_ADOPTED=1 QA_DAYLIGHT=1 QA_OCCLUSION_ID=v11.c44.localized-contact.v1 node tools/v11-adoption-low-qa.cjs
```

QA_CONTEXT hasTouch is browser capability only; no physical touch-device claim. Public-CDP uncut files preserve every delivered source frame but are sparse. Stock310.800s has183 source frames (median1.88s/max7.71s), candidate pointer61.120s has31. They do not certify continuous motion, physical GPU FPS/audio/native, completed GPU frames or supported-WebGL GPU memory release. No fullB/closure/hidden-tab certification. Current stock UI/accounting checks do not certify a complete fresh cashier contact/handoff sequence. No owner Normal/profile, user Chrome, public Site, credentials, Library/LTC retry or shutdown operation.
