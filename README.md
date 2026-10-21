# Day1 candidate (2026-10-22)

Misaki, The First Light story and separate reading progress are implemented. The same public Site and economic saves remain in use. See docs/HANDOFF.md for actual results and new3D visual limits. Rebuild character: node --import tsx tools/export-misaki.ts.

# 下一站・小店物語 / Next Stop, Little Shop

W1.1B focused 3D art candidate (2026-10-22), extending accepted UI v6 and W1.1A1 closeout by KeEv Games. The player names their own business. This checkpoint improves the ten-item management loop and preserves the original Bible. It stops before full Tokyo content production.

## Run and verify

Node 24.19.0 was used. Runtime and development dependencies are exact in package.json and package-lock.json.

```bash
npm ci
npm test
npm run validate
npm run asset-check
npm run replay
npm run build
```

`dist/` is the static deployment directory. Serve it through an ordinary HTTPS static host with WebGL2, IndexedDB and ES modules. There is no server or paid service dependency. No user-side SDK or native environment is needed to play the deployed Site. The game uses local browser storage, not cloud accounts.

Procedural source and lossless masters are retained in `tools/assets.mjs` and `assets/masters/`. `npm run assets` regenerates the GLBs and WAV. Fonts are already supplied: rebuilding the game does not download fonts. To regenerate derived font subsets, run `python tools/fonts.py` with Python 3.12 and fonttools 4.61.1; original downloaded TTF masters and OFL licences remain intact. The derivative TTFs avoid an unavailable optional Brotli encoder. The source master is not overwritten by web optimization.

## First play

1. Enter a shop name and optional company/brand and mark.
2. Choose sandbox test clock for a prompt demonstration; it has its own save and cannot enter rankings.
3. Buy a few items you like, select a display, and place them there. Notebook + pencil on two shelves optionally activates the test desk set. Apply/cancel prices from Shop.
4. Open the shop, then advance an hour. Read the report: stock purchases affect cash/inventory; only sold inventory is expensed. Wages, rent and operating costs are distinct.
5. Restock, change prices, try the desk test set and reveal the zero-stat paper sample after a first sale. No payment or random loot exists.

Real time uses Tokyo 10:00–20:00 provisional business hours, with one real day = one game day. The static visual world does not follow day/night yet. Sandbox clock advances only through explicit controls. The original normal save is preserved when switching modes. Prototype saves are not promised to migrate to production accounts. Export/import is in Settings. Unknown save versions are rejected without replacing good data.

## Evidence and limitations

Read docs/HANDOFF.md and docs/CONTRACT.md. `evidence/` contains actual test/build/validator output. The active simulation is `src/core/simulation.ts`, classified **PORT_REQUIRED_FOR_UNITY**. C# headless proof passed, but the browser-WASM build failed with an MSBuild task-host error after one correction. `proof/csharp-headless/` is frozen evidence, not a second maintained economy and not active Web source. Its fourteen tests can be rerun with .NET 10.0.402:

```bash
cd proof/csharp-headless
dotnet run --project adapters/Headless -c Release -- test
```

Browser DOM/IndexedDB walkthrough and CSS viewport checks are recorded in docs/HANDOFF.md, evidence/ui_2026_10_22/ and preserved evidence/w1_1a1/. Owner-provided v6 PNGs and video frames have been viewed as real 3D BEFORE evidence. The supported cloud browser still reports WebGL not supported, so the current candidate AFTER appearance, FPS and physical-device/native testing remain unverified. GLB validation / NullEngine import is structural evidence only. This is an art review candidate, not a commercial launch.

## Source and compatibility

Snapshot schema 2 / simulation ts-w1-2 migrates valid v1 data without resetting saves. Read docs/MIGRATION_W1_1.md and docs/RECOVERY_W1_1.md. W1.1A1 preserves W1.1A art, W1.1 economy and saves. Additional art source: src/art/, src/ui/thumbnails.ts; 15 original reusable GLB masters and Web copies; see docs/ART_W1_1A1.md and docs/VFX_W1_1A.md. Current interchange command: `node --import tsx tools/art-w1_1b.ts`; independent import: `node tools/validate-art-w1_1b.mjs`. The original W1.1A1 exporter now explicitly imports its frozen source snapshot, preserving historical outputs. Native Unity/URP and Android/iOS adapters remain pending.

For safe local visual review, build with `VITE_ART_REVIEW=1 npm run build`; it uses a separate QA database and mode/draft/locale/presentation keys. Never overwrite an existing sandbox to stage screenshots. Rebuild with ordinary `npm run build` before packaging production. The review switch is compile-only; production has no review query hook. See docs/W1_1A_Visual_Check_zh-HK.md for the three optional follow-up views.

Source corrections remain closed after the accepted startup visibility fix. A separately authorised 2026-10-22 UI-only pass refines stock/journal hierarchy and five-language player copy. A subsequent authorised 3D-only pass adjusts color interpretation, palette, grounding, existing shadows and curated framing. Economy remains frozen; candidate AFTER visual confirmation is still pending. See docs/ART_W1_1B.md. Delivery ZIP creation/closed-reader source verification is implemented in tools/checkpoint.py; see the current handoff and its actual publication receipt.
