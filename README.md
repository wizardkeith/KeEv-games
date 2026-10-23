# 下一站・小店物語 / Next Stop, Little Shop — v4 candidate

A playable Web candidate continuing the complete Site v11 / Native 3D v3.1 source history. It keeps the original Bible, ten-product economy, five locales, transactional local saves, independent Normal/Sandbox modes and Site identity.

v4 adds per-product stock quantities and inline shelf placement, corrects CCW front-face handling in the right-handed neutral mesh adapter, improves original character/furniture/wood assets, and refines planted walking, safe turns, browsing and customer bag handoff. See [v4 implementation and rebuild](docs/V4_CANDIDATE_zh-HK.md). The approved art reference and full task remain in [docs/codex-v4](docs/codex-v4/).

## Run

Node 24.19.0 / npm 11.9.0 were used with the unchanged lockfile.

```sh
npm ci
npm test
npm run validate
npm run asset-check
npm run replay
npm run build
npm exec vite -- --host 0.0.0.0
```

`dist/` is the production static build. It requires WebGL2, IndexedDB and ES modules. The deployed game needs no user-side SDK or local development tools. There is no backend or new secret dependency. Saves are browser-local, so different preview origins have independent progress. Test with the explicit Sandbox controls; never modify a player's Normal save to stage visuals.

## Art and QA

Editable procedural sources, lossless texture masters, reusable GLBs and rig/socket contracts are retained. Web and GLB use the same character vertices; original older masters remain in Git history. These are articulated rigid models with external procedural motion and leg IK, not embedded skeletal clips or completed native ports.

[Current evidence](evidence/native-v4/) includes test/build/replay results and actual Chromium WebGL2/SwiftShader screenshots and video. The rendered character fixture compares the Web adapter with the standard GLB loader at identical camera/pose/light. Tests and NullEngine alone are not visual acceptance. Desktop responsive checks are distinct from physical phones; no physical-device FPS or audio acceptance is claimed.

The active simulation remains TypeScript, classified `PORT_REQUIRED_FOR_UNITY`. Original Unity/C#/URP and native-device gates remain pending. Scope stays at the established Day 1 game rather than introducing additional Tokyo story days or rebalancing the economy.

## Publication

Keep `.openai/hosting.json` and the existing public Site. GitHub pushes and candidate build ZIPs do not publish that Site. The cloud environment has no Sites publishing tool; use the original Work/Sites publishing flow for this candidate. No replacement Site or deployment receipt is invented.

The previous README is preserved in [docs/archive/README_v3_1.md](docs/archive/README_v3_1.md); its old WebGL-unavailable observations describe the historical environment.
