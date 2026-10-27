# C48 actual-game source-contribution evidence

Application: `8091d04ba67256d9f19e69363efeacfa219b8452`. No default adoption, merge or publication. Ordinary no-flag remains C45. Overall approved-target fidelity is unaccepted.

`*-normal-game.png` are unretouched actual Chromium/SwiftShader WebGL screenshots from source-pinned builds308–315; corresponding `*-raw-result.json.gz` contain actual UI Sandbox import, camera/economy, rendering diagnostics, errors and isolated Normal preservation assertions. No player save, credentials or browser session included. All QA data are synthetic.

Derived images only scale/crop/arrange the raw screenshots and add labels: `source-contribution-normal480.png`, `target-composite-balance-normal480.png`, `receiver-controls-annotated.png`. Magenta receiver annotations are never game content. The original target appears only in the explicitly labelled target panel; its left shop portion is cropped from the canonical approved PNG.

`source-identity.json` pins application, exact modes/actual light energies, receivers, corrected projection, RGB samples, nonfocal ROI and limits. `final-builds.json` and `runtime-payload-sha256.json` pin all195 files per build. `media-sha256.json` covers the images. `receiver-depth-readback.json` retains actual hard-shadow HALF_FLOAT texels and comparison; `shader-provenance.json` pins the Babylon8.32 equations. These are specific software-WebGL/CPU evidence, not physical GPU/FPS or universal frame completion.

`invalid-early-marker/` preserves two excluded early diagnostic overlays: initial GL-to-DOM viewport conversion misplaced points by16px. Their marker/pixel conclusions are invalid; final source and final308–315 evidence use corrected projection. Do not treat them as final controls.

Reproduce from the application source with `npm test`, `npm run validate`, `npm run replay`, `npm run asset-check`, `npm run build`. Authoring variants require `VITE_V11_SCENE_WINDOW=reach` plus `VITE_V11_SOURCE_SEPARATION=key|base|composite|balance`; default is off. Auxiliary key-only flags: `VITE_V11_SOURCE_FILTER=hard`, `VITE_V11_SOURCE_LEAF_SHADOW=two-sided`, `VITE_V11_SOURCE_DEPTH=on`. See `final-builds.json` and source/Vite guards for exact variant configuration. QA uses the existing `tools/v11-table-look-qa.cjs` actual UI import flow; `QA_SOURCE_SEPARATION=1 QA_REDUCED_MOTION=1` asserts the selected High/Reduce Motion diagnostic and actual identity, with `QA_SOURCE_DEPTH=1` for depth readback.

Tests295/build/validate/replay/assets,146GLB,305protected,512rebuild and317preserved raw files passed. No new stock-cycle/Low/full motion/hidden-tab/device/audio/native acceptance. See [the human report](../../../docs/V11_C48_SOURCE_CONTRIBUTIONS_2026-10-27_zh-HK.md) for controls, interpretation and honest whole-frame tradeoffs.
