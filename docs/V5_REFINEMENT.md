# Game bounded v5 refinement — review candidate

Started clean at candidate `220a7165d67ecb5214587a305f55603ffc285a7e`, fast-forwarded to verified main `274148b19e53cd33e68e214d41aed05e19d272b3`. Original history, identity and user work were preserved. Application checkpoint: `021e23a` (subsequent commits contain QA/delivery documentation and evidence only). Unmerged branch: `codex/game-v5-refinement`; [draft PR #2](https://github.com/wizardkeith/KeEv-games/pull/2). Main `PROJECT_STATE.md` is the canonical progress entry and carries a minimal pointer to this work.

## Completed gates

1. **Stock UX and focus:** product-level quantity, cost, explicit total, remaining cash and affordability/capacity status; 1/5/10/20 set-value shortcuts; true inventory and display status; clear in-place shelf placement/replacement/movement guidance. Existing draft capture, synchronous busy lock, real command path and retained out-of-stock cards remain. Pending actions use `aria-disabled` while retaining their stable DOM/focus; completed shelf actions return focus to the persistent same-card action. A new action clears old success toast text. Inputs, raw drafts, caret and scroll remain stable. No cart, combined transaction, new mechanics or balance change.
2. **Five-locale written copy:** all existing dictionaries, Day 1 lines and shop guidance audited using zh-HK as semantic baseline. Relaxed written language replaces overly colloquial Hong Kong strings; equivalents clarify context, action, result, operating hours, sales versus profit, purchases versus cost consumed, recovery and persistence failures. Story reading/profit/tutorial predicates and economic flags are unchanged. No extra story days, SKU, people, monetization or fake visitor-to-SKU attribution.
3. **Playable 3D refinement:** continuous asymmetric bob instead of hard overlaid fringe chunks; rounded interpolated sleeves/rolled cuffs, fitted cream blouse, waist apron with curved hem/pocket and a longer plum silhouette. Chestnut/leaf clip/sage/ivory/plum identity, rest pivots, full legs, named sockets, routes, foot planting and bag ownership remain. Warm window key, restrained sky/cool exterior fill and softer original wood grain improve separation. Final original strand colour/normal maps have cylindrical seam/pole UV handling and unit orthogonal tangents in both Web and standard GLB. No extra triangles, generated backdrop, billboard character or mockup. Per-actor triangle budget remains below 12,000.
4. **Integrated verification and handoff:** completed results below. Exact final pushed receipt and Library IDs are supplied externally, avoiding a self-referential hash in this document. The parent coordinates independent acceptance, integration and same-Site publication.

## Newly run evidence

| Check | Result |
| --- | --- |
| `npm test` | **144 passed / 0 failed / 0 skipped**. Includes two meaningful new UV/tangent/embedded-map parity tests; existing foot thresholds and economic expectations were not relaxed. |
| `npm run build` | Passed TypeScript + Vite. Existing large-world-chunk warning retained. |
| `npm run validate` | Zero errors; 10 offerings, 5 locales, 174 base keys each. |
| `npm run replay` | Unchanged cash **5020**, stock **4**, net **180**, sold units **6**. |
| `npm run asset-check` + all current GLBs | Passed; **18 GLBs, zero errors/warnings**. Current character exports total **1,773,228 bytes**, including shared source maps embedded for the two bob characters. |
| Isolated generator rebuild | All **207** tracked asset/public files byte-identical. Original masters/generators remain in history; v5 map masters are separate. |
| Clean `npm ci` / build | Passed in isolated checkout; all **119** runtime files byte-identical to the production-browser build. |
| Preservation / history | **230** protected files match starting candidate; original eleven v11 commits remain ancestors; `git fsck --full` passed. Catalog, layout, economic rules, story logic, transactional storage/schema/namespaces, hosting identity, fonts and older masters retained. |
| Bounded credential scan | No private-key/common token-signature matches. This is not an exhaustive secret/embedded-archive/rights audit. |

Production Chromium WebGL2 / ANGLE Vulkan SwiftShader walkthroughs use isolated Sandbox contexts and actual commands/IndexedDB. Final material-pass recordings and results are in `evidence/native-v5`:

- `browser/`: actual purchases, double activation, restock without shelf loss, replacement/movement, fallback, A entry/browse/service/bag/exit, search/draft repaint without route reset, invalid/insufficient input, retained empty-filter card, real export/import/reload, ten 320/375×812 locale cases, landscape keyboard, Low/Minimal/Reduce Motion. No Normal identity mutation.
- `stock-lifecycle/`: actual Tab-to-buy + Enter retains `buy-off.tray`; next Tab reaches same-item placement; shelf submission returns focus. A real queued writer captures 3 units once despite repeated Enter/click and draft changes. Forced `saves.put` abort leaves the whole snapshot and command ledger unchanged, with recovery UI and no stale success toast. Raw `003`, actual input node, caret and scroll survive repaint. Ten **320/375×420** touch-emulated buy/place locale cases keep 44px targets and 16px inputs. Reload and actual frozen→active preserve Sandbox; Normal remains byte-equivalent.
- `visitor-b/`: fresh **High** real settlement, single bag parent `actor.visitor-b.native.v3.socket-left`, actual handover and exit. No fake spawn, teleport, snapshot edit or economic callback.
- Final event times/durations and SHA-256 are authoritative in each `timeline.json` and `video-metadata.json`. Four uncut original WebM files are retained; optional MP4 deliveries are full-length derivatives.
- `before/` versus `after/`: real matched full-shop/staff camera PNGs at 1440×1000, same real stock and existing camera controls, unchanged framing/exposure; eleven front/45°/back/idle/walk/serve and diagnostic Web/standard-GLB cases. `web-glb-pixel-comparison.json` records close path parity, not target fidelity. `video-review/` contains chronological sampled frames; no claim of physical-device continuous-playback acceptance.

The first render iteration revealed garment intersections; these were corrected. A final material pass removed the smooth-cap reading without exceeding the mesh budget. Actual approved PNG and all three Bible image pixels were inspected; the complete review PDF was read through Library after a signed byte-download transport returned HTTP 403. No unresolved access blocker remains for the implementation.

## Art judgment and limits

Visible continuity/material refinement is supported by actual current pixels. **This is not a claim that the final approved concept has been reached or independently accepted.** The target still has richer organic hair/face detail, fabric drape and scene material/light refinement. See `KeEv_v5_Refinement_Review.pdf` and the full original PNGs. Tests, vertex counts and adapter parity do not establish final art quality.

SwiftShader is software rendering; encoded video FPS and elapsed QA time are not game or physical-phone performance. Physical iOS/Android GPU/FPS, Safari, real virtual keyboards/safe areas, audio and native Unity/C#/URP remain unverified. True hidden-tab visibility transition is not asserted in this headless runtime; frozen→active was tested. Native-language editorial acceptance is separate from this five-locale copy audit. The rig is an articulated rigid hierarchy with no embedded skeletal clips; simulation remains `PORT_REQUIRED_FOR_UNITY`.

## Rebuild and publication-ready delivery

Use the complete feature branch; keep its full Git history and `.openai/hosting.json`. Rebuild original/v5 wood, v5 hair, characters, environment, products and fixture exports with the scripts recorded in `asset-rebuild.json`; then run the listed checks. Browser scripts require the cloud image's Playwright/Chromium/ffmpeg and use no player save. Examples:

```
PLAYWRIGHT_BROWSERS_PATH=/workspace/.playwright NODE_PATH=/opt/codex/cua_node/lib/node_modules node tools/v5-browser-qa.cjs
PLAYWRIGHT_BROWSERS_PATH=/workspace/.playwright NODE_PATH=/opt/codex/cua_node/lib/node_modules node tools/v5-stock-lifecycle-qa.cjs
PLAYWRIGHT_BROWSERS_PATH=/workspace/.playwright NODE_PATH=/opt/codex/cua_node/lib/node_modules node tools/v5-visitor-b-qa.cjs
```

`tools/package-v5.py` packages the committed feature branch plus current main history, complete source manifest, self-contained bundle parts, checked Web ZIP and exact static deployment tar. It reopens CRC/SHA payloads and independently clones every tracked source byte. No credentials, browser sessions, QA save exports, node_modules or unrelated local work are included. Keith does not need to install tools or assemble source files.

Latest user authorization requests checked updates at the **same existing Site**. This executor has Sites tools and prepares the exact source/build checkpoint; the parent coordinates review, integration and publication. No merge, Site save/deployment/access change, player Normal-save mutation or local Unity operation was performed. The existing public Site must not be described as this candidate until the publisher supplies a successful receipt. The publisher must push the exact intended source to the configured Sites source branch, then save/deploy the matching archive while preserving project `appgprj_6ad82a08ed2881918ebcc2dd206a122d`, URL, audience and save compatibility.
