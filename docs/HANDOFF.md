# W0 and W1 handoff

Implemented private graybox candidate for owner review. W0 and W1 are **PARTIAL**, because genuine browser verification and browser-WASM parity are not available. They are not accepted full Tokyo-slice or native gates.

| Gate | Result | Evidence |
|---|---|---|
| Original Bible and scope | PASS | Unchanged DOCX/MD hashes match supplied provenance; full text and three visual references inspected. Originals in source-inputs. |
| C# source candidate and headless | PASS, frozen experiment | netstandard2.1, C# 8; .NET SDK 10.0.402/runtime 10.0.13; 14 tests, zero build warnings/errors. proof/csharp-headless and headless-tests.log. |
| C# browser WASM | BLOCKED | MSB4216 ComputeWasmBuildAssets task host could not connect/run, then MSB4027 disposed MetadataLoadContext. Normal setup plus one DOTNET_ROOT/PATH correction, same result. No repeated SDK experiments. |
| Live Web simulation | PASS in headless tests | Isolated TypeScript PORT_REQUIRED_FOR_UNITY; same golden numeric result. No C# active-source-sharing claim. |
| Economy/save tests | PASS | 18 TypeScript tests, including IDB transaction/CAS with fake-indexeddb, interval splits, duplicate commands, reload, mode separation, rollback, future/old version rejection, price/capacity and conservation. This is not a browser IDB test. |
| Content/localization | PASS structural only | 10 Offerings, five locales, 108 keys each, six tiers and separate Unique tag. Validator output retained. Native-level language review pending. |
| GLB portability proof | PASS structural/headless | Counter and two-bone skinned block, GentleWave clip, normalized weights; Khronos validator zero errors/zero warnings. Independent file import in Babylon NullEngine. Advisory bufferView.target hints retained. |
| Visual browser play | NOT TESTED | Required control-browser skill is missing from managed environment. Did not start an unsupported preview/browser route. No screenshot or fabricated browser pass. |
| Real device/native/Unity/URP | NOT TESTED | No Unity import, mobile installation, IL2CPP, physical touch test or 30/60 FPS claim. |
| Online/live economy | NOT IMPLEMENTED | Local browser save/clock, no trusted time/accounts/shared world/leaderboards. |

## Implemented player loop

True 3D modular shop with floor/walls, reusable imported counter, three interactive displays, one generic staff and decorative generic customers. Curated camera elevation 35–45°, bounded orbit/zoom and pointer/touch input support. Buy one of ten provisional Offering fixtures, hold inventory, assign displays, change price, open/pause, accrue deterministic sales, read Tokyo daily P&L, restock/reprice. Desk test set and deterministic basic zero-stat discovery. Static environment and original quiet cue. Player-defined shop/company/mark. Five externalized localized interfaces, bundled licensed original fonts and web subsets, tabular numerals, responsive CSS and reduced-motion preference. Actual resize/overflow/touch behavior remains unverified.

The loop has no pet, Misaki/Ren, seven-beat story, final 36-item slice, weather, payments, ads, gacha, energy, streak loss, chat or trading. KeEv Games is publisher only. World is prominent and panels can be hidden or Zen mode selected. Data, balance, generic fixture names/art and translations are provisional; no authored cultural/history claims have been invented.

## Measurements

Production artifact measurements are in evidence/web-measurements.json. They are local byte counts and calculated gzip equivalents, not an observed network download. The world module was narrowed from full glTF index import to the required 2.0 loader, reducing the largest module from about 1.90 MB / 468 kB gzip to about 1.45 MB / 353 kB gzip before final edits. Fonts are derived subsets while 38 MB of original masters remain retained. App UI loads before the dynamic 3D module, optional locale fonts load when needed, low-quality mode reduces render resolution and decorative crowd; economy is unchanged. No compression was applied destructively. Vite still reports a >500 kB chunk warning; no artificial threshold suppression.

Actual transferred size, cold/warm startup, frame time, renderer/GPU, browser/version, physical touch/mobile measurements and visual material/skin deformation remain **NOT TESTED**. The optional window.littleShopDiagnostics() function can collect real runtime resource/frame samples on an available browser; no samples are invented here. WASM payload/startup/hosting MIME compatibility are unmeasurable because the WASM build did not complete.

## Reuse and next gate

Content IDs/configuration/locales, normalized numeric contract, golden fixtures, layout data, procedural generation source, GLB geometry/skin/clip, original font/audio files and rights records are retained. They are engine-neutral data or interchange candidates. Active TS economy needs port/replacement; web UI/CSS/input/IndexedDB, Babylon materials/lighting and animation/platform controllers require Unity adapters. The C# proof is frozen, not maintained as a second full economy. Before expanding content, resolve the long-term single-core decision, finish genuine browser walkthrough and save/resume checks, and review owner experience. Then define W2 from evidence. Do not treat this gate as approval for full Tokyo production.

## Cleanup

Removed failed C# bin/obj build products from the source checkpoint; retained diagnostic build logs, tested source, inputs, exact lockfile, manifests, fonts/licences, masters, fixture generators, tests and expected results. Optional Brotli font export failed before creating a final derivative; substituted actual subset TTFs and retained source. No credentials, browser sessions or user runtime saves are in the deliverable. Deployment build output and installed dependencies are reproducible and excluded from source control/archive. No user input files were deleted or modified.
