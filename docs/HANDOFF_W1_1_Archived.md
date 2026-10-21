# W1.1 — Chill / healing shop review candidate

Date: 2026-10-21 (Asia/Hong_Kong). **PARTIAL / art review candidate**, not final Tokyo-slice acceptance. The original Game Bible v0.1, Part II and three original visual references remain the baseline and are retained unchanged. The W1.1 package is retained in source-inputs/w1_1-review.

## Site and preservation

Continue the same project `appgprj_6ad82a08ed2881918ebcc2dd206a122d` at https://next-stop-little-shop-w1.starry-ridge-5482.chatgpt.site. Inspected canonical source was commit `182a7a427d95f609f488a0c626937be294fbd329`, saved Site version 1. Its existing custom access was owner-only (one allowed owner, no other users/groups/external visitors); this task does not modify that policy. The actual new saved version, deployment result and source commit are in the delivery receipt accompanying this checkpoint. No clone or new origin is created.

The original IndexedDB name/store, normal/sandbox keys and meanings are preserved. Schema 2 / simulation ts-w1-2 strictly migrates valid v1; no reset. Identity, mark, cash, inventory, shelf IDs, prices/costs, reports, earned tutorial/reveal flags and timestamps survive. Only old fractional demand resets once because v1 had no price provenance. See MIGRATION_W1_1.md. Damaged/unknown imports reject before replacement. Original browser test saves were backed up outside source, then restored after synthetic scenario testing; no runtime save is packaged.

## What changed

A real 3D art candidate now has an actual window opening, cream walls, warm wood boards, softened counter and open-leg display tables, register, physical price-card holders, small plants, original recognizable geometry for all ten items and a softer generic staff silhouette. Window-direction light and filtered furniture/wall shadows are implemented. Selected display uses a lavender rim. Curated 35–45° camera viewport adapts to available UI space. No image/video/CSS shop substitute, new named character, pet, weather or formal story was added.

Player shop name is the main title; cash is the single main number. Warm ivory panels open on demand, with five short navigation entries and all settings/language/mode/Zen controls reachable. Stock cards show thumbnails, unit/total cost, quantity, cash after purchase, deficit and exact target shelf. Price drafts have apply/cancel. A small keyed DOM patcher retains actual input nodes/focus/selection/scroll during settlements; drafts persist separately per mode in sessionStorage, including across reload. Explicit panel changes start at the panel top. Escape closes the drawer and restores focus to its invoking navigation button.

Shelf world-click, empty-shelf Stock, selectors and product-card actions use one slot. A synchronous pending guard rejects duplicate click intents rather than queueing purchases. Committed sales/sold-out and sample completion generate one feedback event; automatic settlement uses the same delta path. Audio remains opt-in; reduced motion is respected. The free-choice tutorial follows actual inventory/display/open/sale predicates, retains milestones after stock sells out and ends with a clear completion card. Notebook+pencil is an optional test set. Trading status uses Tokyo hours AND the open flag. Selected-day P&L is separated from current cash/inventory/funding and latest parameters.

Price changes reset that item's fractional demand; identical-price no-op retains it. Strict type/safe-integer/range validation covers all numeric snapshot fields, reports, expense/demand remainders and recovery fields. Settlement ignores the ordinary command ledger's ID set/limit and uses its watermark; ordinary command dedup, 100,000-ID ceiling and CAS remain. No IDs are pruned. Form errors do not freeze auto settlement; stale/storage/rollback/long-gap have separate recovery paths.

Free reopening support is explicit and provisional. An empty shop that cannot buy even one cheapest item can receive a separately recorded grant bringing cash to 1,410 units (¥14,100), including its debt, then buy five pencils. Historic P&L is untouched; support is not sales, profit, sale events or unlock credit. Eligibility is rechecked atomically; CAS/dedup prevents repeat or concurrent duplicate grants. Repeated actual loss episodes can qualify again; rent continues. See RECOVERY_W1_1.md for exact rules and risks.

## Actual verification

| Check | Result / evidence |
|---|---|
| Baseline | Original 18 tests PASS; all four review probes reproduced defects before edits. evidence/w1_1/baseline |
| Current core/storage | **30 tests PASS, 0 fail, 0 skipped**: original 18 plus 12 targeted cases. evidence/w1_1/tests.log |
| Migration | Both synthetic v1 mode fixtures preserve fields; malformed imports retain good IDB save. Concurrent different-ID support claims yield one grant. Full ledger still settles, even with an ID collision with an ordinary command. |
| Content | 10 Offerings; five locales ×165 keys; six tiers, Unique separate. Structural PASS; native-language review pending. |
| Original assets | Counter/skinned fixture validation and independent reimport PASS. New 15 GLBs: Khronos zero errors/warnings; all independently reloaded in Babylon NullEngine. This is NOT rendering/native proof. |
| TypeScript / production build | PASS. Existing >500 kB chunk warning retained; threshold not raised. |
| Browser controls / IDB | Supported cloud browser on the actual production build. Full synthetic new-shop→buy5 notebooks→shelf2→price800JPY→open→advance1h→report→restock→reveal→reload PASS. Cash51400, sales4000, COGS2000, salary300, rent200, operating100, net1400 JPY after the first hour. |
| Draft / errors | Normal clock17:32→17:34 retained unsubmitted980JPY and focused price input; reload retained990JPY draft. Cash error at17:34 did not stop clock17:35. Shelf2 assignment left shelf1 unchanged. |
| Recovery UI | Eleven-day zero-stock fixture showed −¥2800 cash, ¥16900 support preview →¥14100. Claim→five pencils→display→open→sale completed; cash¥14250, support shown separately, historical rent retained. |
| Real two-tab CAS | Stale second sandbox tab write rejected with reload/export actions; newer state not overwritten. |
| Responsive | 25 CSS iframe cases:320/375/430/768/1200 × five locales, no horizontal document/control clipping. Final clickable input/button/select/checkbox-label targets ≥44px. Not physical phones. |
| Keyboard | Drawer label corrected; Escape/focus return observed. Identity modal has labels and focus trap. Full assistive-technology audit not performed. |
| WebGL | **BLOCKED: Error: WebGL not supported** in this cloud browser. UI/storage continue. No actual 3D composition/material/shadow/animation/FPS screenshots or passes. |

The command-ID adapter uses crypto.randomUUID when available and cryptographic getRandomValues UUID otherwise, supporting HTTP preview as well as HTTPS. Browser tests did not substitute a different simulation or patch source to bypass an environment restriction. The iframe QA wrapper only changes CSS viewport width; it is kept in tools for reproduction and excluded from deployment. UI-only screenshots are explicitly labelled NOT 3D.

## Measurement and portability

Same local production file-count / gzip9 method: W1 3,648,577 raw /1,377,609 calculated gzip bytes; W1.1 actual counts are in evidence/web-measurements.json and evidence/w1_1/size-comparison.json (approximately3.63MB raw /1.45MB calculated gzip). Not observed network transfer, cold/warm startup or FPS. PBR shaders and expanded font subsets affect the gzip composition; no threshold suppression or destructive compression.

UI-ready and world-ready timestamps are fixed when ready, with world startup null if WebGL fails. Frame samples exclude hidden-tab and interrupted ≥250ms intervals. Auto starts high and reduces resolution/shadow refresh/decorative crowd only after90 visible samples with p75>35ms. No target FPS or device performance claimed; economy remains frame/quality independent.

Reusable source includes stable content/config/locales/contracts/golden fixtures, pure geometry recipes, 15 GLB masters/exports, matching vector thumbnail source, original fonts/audio/rig-test fixture, provenance/licences and hashes. See ART_W1_1.md and assets/authoring/w1_1. Babylon PBR/shadows/camera/input, HTML/CSS, IndexedDB and platform controllers require native adapters. Generic staff is static, not a newly certified skeletal pipeline.

The TypeScript economy remains the sole active core and **PORT_REQUIRED_FOR_UNITY**. The prior14-test C# headless proof remains frozen, not rerun or updated. C# browser WASM remains previously blocked by MSB4216/MSB4027; no new parity claim. Unity/URP/IL2CPP/Android/iOS/physical touch/mobile keyboard and online trusted time/accounts/leaderboards remain NOT TESTED / NOT IMPLEMENTED as applicable. Balance, art and translations remain provisional. No payment, ad or paid recovery was added.

## Delivery / next gate

Source checkpoint retains original inputs, lockfile, tests, synthetic legacy fixtures, asset authoring/masters/licences and evidence. Installed dependencies/build output/caches/credentials/user saves are excluded. Original W0/W1 handoff is archived, not deleted. See CHANGELOG_W1_1.md for cleanup.

Use the playable candidate now. A short3-minute visual checklist is in VISUAL_CHECK_zh-HK.md; it is not a prerequisite for this implementation. Next bounded gate: actual WebGL visual/composition/touch QA and owner experience review, then the single-core decision before large content expansion. No36-item/full seven-beat Tokyo production approval is implied.
