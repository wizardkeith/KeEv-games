# Next Stop, Little Shop — canonical project state

Last updated: **2026-10-24T02:08:47+08:00** (Asia/Hong_Kong).

## Current unmerged work — bounded Game refinement

- Active implementation: [`codex/game-v5-refinement`](https://github.com/wizardkeith/KeEv-games/tree/codex/game-v5-refinement), [draft PR #2](https://github.com/wizardkeith/KeEv-games/pull/2). Source checkpoint and latest evidence are tracked by that branch and `docs/V5_REFINEMENT.md`.
- Status: implementation and cloud QA in progress, addressing stock usability/keyboard focus, natural written copy across five locales and playable 3D visual refinement after the independent v4 review. No feature changes are merged into main.
- The current user task supersedes the earlier documentation-only scope. The latest user authorization requests publication to the **same existing Site** after each checked Game update; the parent coordinates independent review, integration and publication. No Site save/deploy/access/identity change is claimed here. Normal saves, economy, original masters/history and local Unity work remain protected.
- This main update is a documentation pointer only; detailed results and limitations will be supplied with the final pushed branch checkpoint.

## Canonical checkpoint and branch state

- Repository: https://github.com/wizardkeith/KeEv-games ; this file on `main` is the sole designated progress entry.
- Verified source/candidate checkpoint: `220a7165d67ecb5214587a305f55603ffc285a7e`. This documentation-only successor preserves that complete source tree. Obtain this checkpoint's exact commit with `git log -1 --format=%H -- PROJECT_STATE.md`; the post-push receipt is recorded in issue #1.
- At the independent-review handoff start, live `main` was `c6b1254ccc12cea382aaad06120eefa3567d0bd8`; its changes after candidate `220a7165` were documentation only. No remote feature branch was advertised. `codex/little-shop-v4` in the historical import evidence describes the previous working branch, not an outstanding remote branch. This handoff adds review documentation only; the reviewed application source remains pinned to `220a7165`.
- Initial environment checkout was empty/unborn `work`, with no uncommitted files. Fetched live main without reimporting the old bundle. No existing local source was overwritten. No other machine's unpushed work is observable here.
- Previous task `01a1694e-e047-74b3-b410-87b531472084` reported delivery; it is not reachable for continuation through the parent (CloudThreadNotFoundError). Its current execution state is unverified. This task establishes a new documentation handoff, not a new development phase.

## Public Site versus repository candidate

- Public Site: https://next-stop-little-shop-w1.starry-ridge-5482.chatgpt.site
- Identity: `appgprj_6ad82a08ed2881918ebcc2dd206a122d`; preserved `.openai/hosting.json`.
- Sites read in this checkpoint confirmed latest version **11**, public access and the same live URL. Public v11 / Native 3D v3.1 source baseline is `10c070c8121aecfd9e3e1ac9d0db213947416a08` (supplied provenance; not a new deployment).
- GitHub contains a later **unpublished v4 candidate**. No Site save, deployment, identity/access change or browser-save mutation was performed. Existing handoff invitations to publish are not authorization in this documentation task.

## Completed functionality in the candidate

Repository documentation and source retain the Day 1 shop, ten-product economy, five locales, browser-local transactional saves, independent Normal/Sandbox modes and Bible. The v4 candidate adds per-product quantity drafts, inline shelf placement/replacement/movement, stock feedback, RH/CCW adapter correction, original character/furniture/wood revisions, planted walking/turning and browsing/bag-handoff refinements. See `docs/V4_CANDIDATE_zh-HK.md` and `docs/V4_ACCEPTANCE_zh-HK.md`. These are delivered candidate features, not owner acceptance or a public release.

## Newly verified synchronization evidence

- `git fsck --full` passed. All **11** commits through v11 were individually checked with `git merge-base --is-ancestor` against live main: all passed. The baseline has **593** tracked files, and candidate main has **691**. Complete original Git history/source at that exact baseline is present remotely; no single-snapshot substitute was used.
- [Full candidate inventory](docs/SYNC_CHECKPOINT_INVENTORY.tsv) records every candidate path, mode, Git blob, size and SHA-256. All 691 working files matched their fetched Git blobs. Inventory SHA-256: `6f1a1351747242e48bb3ee9356df0de367004af6e3ad1dec1d0f23ade3d7a2e7`. It is pinned to the pre-documentation candidate, intentionally excludes this checkpoint's three new documentation files; the initial synchronization checkpoint had 694 tracked files and 20 commits. The closing receipt adds a documentation-only commit.
- Rechecked `evidence/native-v4/preservation.json`: `src/core`, `src/platform`, `src/content`, `src/narrative`, `source-inputs`, `.openai`, package manifest and lockfile are byte-identical to v11.
- Both videos' SHA-256 values match `evidence/native-v4/browser/video-metadata.json`. This checks file integrity, not fresh viewing or acceptance.
- No standalone tracked credential-scan report was found. Newly scanned all **777 unique reachable historical blobs** for private-key headers and common GitHub/AWS/OpenAI token signatures: zero matches. This bounded scan is not an exhaustive secret, embedded-archive or personal-data audit.
- Read `LICENSE`, third-party notices and handoff provenance. Original procedural assets and font licences are retained; owner-supplied Bible/reference images are direction references, not a new commercial-art redistribution grant. No new assets/reference payloads are uploaded by this checkpoint. No concrete secret or new rights concern was identified in the documentation delta; stop any future public upload if such a concern appears.
- `evidence/native-v4/handoff-import.json` historically records bundle SHA-256 `768bf67a90d8d5f73dc0f483b3f70e336f2cb61a6628a428de1f6e3df8669dd5`, 593 baseline file checks and 25 payload checks. The old Library ZIP was not re-downloaded or reverified here. Thus full original Git history/source presence is verified, but fresh equivalence of every auxiliary ZIP payload is not claimed.

Original eleven commits (oldest first):

```
182a7a427d95f609f488a0c626937be294fbd329
f48dc15030fd89af0fe99e00f890ba204bdc0185
8296c3251b0a7bfd43221781ba7241319891f396
2da2ca394bd2e1c0d3ec65d6e0f712b21a5294c4
6c42daeae2246275bc98553b774fe800c068cc32
b093c50fa13cfca80c8b10fdfd96e716114a2d7d
503ce1dfc22d369cc512084c1a4db9aa2930885c
2686019a76d020543cfa0bca3efa867422add4d5
8eca6d53e13b0d2db457636844b49bf700753c43
3869ef9aefcdc08c0aede158ec5276df89f7cbae
10c070c8121aecfd9e3e1ac9d0db213947416a08
```

## Earlier synchronization-task validation (before independent review)

For the preceding documentation synchronization task only: tracked `evidence/native-v4/tests.log` records **142 passed / 0 failed**; production build, content validation, deterministic replay and GLB validation evidence are also retained. Replay reports cash 5020, stock 4, net 180, units 6. Browser/render evidence records Chromium WebGL2 / ANGLE SwiftShader and desktop responsive UI checks, with source attribution and videos. These logs were inspected, **not rerun** in this documentation task. No new npm test/build/replay, runtime visual review, physical-device or audio acceptance is claimed. Newly run checks are Git integrity/ancestry/inventory, protected-path comparison, recorded-video hashes, bounded token-signature scan and documentation diff checks.

## Acceptance limits, restrictions and next steps

- Independent v4 acceptance verdict: **not accepted**, because of the P1 visual-target gap and P2 keyboard focus loss detailed below. Software-rendered cloud evidence is not physical-phone GPU/FPS/keyboard/audio acceptance. This new review recorded both Visitor A and Visitor B receiving the bag and exiting; the earlier lack of a separate B video is now resolved for this review. Rig assets remain articulated rigid hierarchies, not embedded skeletal clips.
- Unity/C#/URP and iOS/Android ports remain pending; active TypeScript simulation is `PORT_REQUIRED_FOR_UNITY`. No full Tokyo seven-day expansion or economy rebalance is authorized here.
- Do not force push, restore an older snapshot over newer work, change code/assets in this task, publish/recreate the Site, change identity/access, or manipulate Normal saves.
- Next: parent independently reads this exact GitHub checkpoint SHA and timestamp and records agreement. The original pending cross-environment check is now completed for the exact checkpoint identified in the closing receipt below. Then seek the owner's next explicit development/acceptance task; publication remains separately scoped.
- Library unified handoff `Evana_KeEv_Three_Project_Unified_Handoff_2026-10-24.txt` was read fully. Its empty-repository/unimplemented-v4 statements are stale relative to live main; preserved historical material must not replace the newer candidate.

## Closing cross-environment receipt — 2026-10-24T01:32:07+08:00

- Original verified checkpoint timestamp: **2026-10-24T01:22:21+08:00** (Asia/Hong_Kong). Receipt recorded in this documentation update at **2026-10-24T01:32:07+08:00** (Asia/Hong_Kong); the original timestamp is not the time of the later local inspection.
- Parent reports that local executor task `01a169ca-b43d-74e3-882f-f4985f05b00f` independently read remote `main` and SHA-pinned `PROJECT_STATE.md` for all three projects. The parent connector independently confirmed the same values. The agreed checkpoints are:

| Project | Independently matched main SHA | Matched progress timestamp |
| --- | --- | --- |
| KeEv-games | `36caa1dd664b13aa0c51e179d6382021c1eb8483` | `2026-10-24T01:22:21+08:00` |
| KeEv-ledger | `898611d657aa5e6fece25d7768d42b24ea6a382d` | `2026-10-24T01:22:21+08:00` |
| KeEv-website | `ac759aed1716850e67446af81010ca027ba73bbe` | `2026-10-24T01:22:21+08:00` |

- This repository's matched checkpoint is `36caa1dd664b13aa0c51e179d6382021c1eb8483`. The previous pending cross-environment comparison is **complete for those exact commits**. This closing documentation successor will have a different SHA, supplied for final parent readback; it is not falsely described as already independently cross-checked.
- Local connection is now authorized and read-only Git/network access succeeded. These are access observations, distinct from local repository availability, installed toolchains, native Editor access or device acceptance. The local task made no file/settings changes and ran no builds or tests.
- The registered local Game folder is unborn `master`, with no commits or remote, and untracked `outputs/` and `work/`. A separate local-only Unity working tree is also unborn `master`, with no remote: **136 staged additions, 6 unstaged modifications and 18 untracked files**. This unsynchronized Unity work is not a published remote branch and is **not included in Web GitHub main**. Preserve it; never overwrite, reset or import over it. Any future synchronization requires separate inspection and the appropriate explicit task.
- Local live-task listing did not return and was stopped; live task state remains unverified. The local findings are attributed to the parent-provided executor receipt, not a fresh inspection from this cloud checkout. Absolute personal paths are intentionally omitted.
- This closing update changes only `PROJECT_STATE.md`. Documentation diff/whitespace checks and normal remote push/readback are performed; no application code, assets, builds/tests, Site/Wix publication, settings or local Unity work are changed. Prior product, acceptance and release limitations remain in force.
- Next: parent reads back this closing documentation SHA and current update time; future application work follows the owner's explicit task and must preserve unsynchronized local work.


## Independent v4 acceptance review — 2026-10-24T01:54:58+08:00

- The executing reviewer independently read current remote `PROJECT_STATE.md` and `AGENTS.md`, reconciled the documentation-only successors, and reviewed application source **`220a7165d67ecb5214587a305f55603ffc285a7e`**, against v11 baseline `10c070c8121aecfd9e3e1ac9d0db213947416a08`. The original candidate checkout stayed clean and pinned. This documentation handoff starts from current `main` `c6b1254ccc12cea382aaad06120eefa3567d0bd8`, preserving the newer synchronization receipts.
- **Verdict: not accepted as the final approved v4 visual delivery.** Functional, preservation and packaging checks passed. **P1:** Misaki hair/shoulder/sleeve/apron continuity and scene material/lighting refinement still fall visibly short of the approved target; this is a visual-quality finding, not a pixel-identity requirement or a claim that CCW remains broken. **P2:** keyboard Enter on a stock buy button leaves `document.activeElement` at `BODY` after success; the next Tab still reaches the same item's shelf-picker action, so the keyboard flow remains usable but loses visible focus. Exact locations and reproduction are in [the concise review](docs/reviews/V4_INDEPENDENT_ACCEPTANCE_2026-10-24_zh-HK.md).
- The full Bible text and its embedded reference images, approved Misaki PNG, original v4 scope, current candidate/acceptance/QA documents and actual evidence image/video pixels were inspected. No applicable `.agents/skills` directory was present in this checkout/workspace. The review did not start a new product implementation.

### Newly run verification (distinct from the earlier historical logs)

- `npm ci --cache /tmp/keev-review-npm`, `npm test`, `npm run validate`, `npm run replay`, `npm run asset-check`, `npm run build`: passed in an isolated review copy. **142 passed / 0 failed / 0 skipped**; 10 offerings, five locales, replay cash **5020**, stock **4**, net **180**, units **6**. TypeScript/Vite build passed with the existing large-chunk warning. Initial dependency installation using the default home cache failed because that cache was unavailable; a writable temporary cache resolved it without lockfile changes.
- Independently validated all **18** current character/fixture/product GLBs: zero errors/warnings. Re-ran the documented texture, character, environment, product and fixture generators in a separate restored copy: the compared set of **141** asset/public files remained byte-identical; the product master/manifest regeneration was also checked separately. `git fsck --full` and all 11 baseline commit ancestry checks passed. Protected core/platform/content/narrative/source-inputs/hosting/package paths remain byte-identical to v11.
- Fresh Chromium WebGL2 / ANGLE Vulkan **SwiftShader software-rendered** walkthroughs used isolated Sandbox contexts and real buy/display/settlement commands. The existing harness was rerun with its final Normal-identity registration segment excluded; independently written focused probes checked delayed writes, interrupted persistence, focus and browser lifecycle. Quantity capture, double-click deduplication, restocking, replacement/movement, invalid/insufficient inputs, retained out-of-stock cards, export/import/reload, ten 320/375px locale combinations, landscape and reduced viewport keyboard reachability passed. Input DOM/raw text/caret/scroll survived repaint; the separate post-buy button-focus defect is P2 above.
- New A walkthrough: actual bag owner transfer at 60.086 seconds and recipient exit at 84.886 seconds; uncut gameplay recording **88.36 seconds**, 1000×760. New **High Visitor B** walkthrough also received the same bag node at its named socket and exited; uncut recording **442.52 seconds**, 1200×900. These durations/encoded frame rates are not target-device game-FPS evidence. Low/Minimal/Reduce Motion behavior and 11 fresh matched-camera Web/standard-GLB render cases were checked. Both original delivered video hashes also matched their tracked metadata; video review used chronological sampled frames, not a claim of continuous physical-device playback acceptance.
- Delayed IndexedDB write probe: queued original 3-unit purchase, repeated click and subsequently changed drafts still committed exactly the captured 3 units and one command. Forced transaction abort in the isolated QA context left the whole stored snapshot unchanged and showed a storage error. No player's Normal save was used or altered.
- Existing source A/B and Web ZIP artifacts were found and read in this cloud environment after two Library searches returned no matches. New CRC, duplicate-name, size and payload-SHA checks passed. A/B reconstructed a valid self-contained bundle; a clean clone restored the exact reviewed SHA and all **691** manifest/Git-blob/SHA-256 source entries. All **116** delivered `dist` files matched this review's clean build byte-for-byte. The source bundle SHA-256 is `2234d4a07e10c2cde5b05942862362842a0120a72411aefac7e7ac73065419ef`; archive hashes are in the concise review.

### Deliverable, limitations and next step

- Full eight-page user-facing PDF, including target/candidate comparisons and fresh A/B/mobile screenshots: `KeEv_v4_Independent_Acceptance_zh-HK.pdf`, Library reference **`libfile_54a22507d7d48191aa75be8fd4d4bfe2`**. The parent confirms it was delivered to Keith. This reference does not grant public access; no private account paths, browser sessions or save files are committed here.
- Real Chromium lifecycle frozen→active preserved the Sandbox snapshot. **True hidden-tab/resume remains unverified:** this headless runtime kept `visibilityState=visible` even after opening/foregrounding another page, so it did not generate an actual visibility transition. Relevant source/unit/integration tests passed. This is a runtime-verification limit, not an approval denial. Physical-phone GPU/FPS/keyboard/Safari, audio and native Unity/C#/URP acceptance remain unverified; active simulation remains `PORT_REQUIRED_FOR_UNITY`.
- No application source/assets were fixed, no merge/deployment/Site save/access/identity change occurred, and no local Unity work or player Normal save was touched. The public Site remains the previously verified **v11 / Native 3D v3.1**, not this v4 candidate; no fresh Site deployment is claimed.
- This follow-up changes only `PROJECT_STATE.md` and the concise review document. No new app tests were needed for these prose-only changes; `git diff --check`, documentation-only path review, protected-tree comparison, normal non-force push and exact remote SHA readback are the handoff checks. No unmerged product branch or unpushed product changes were created; the documentation commit SHA/clean status are reported externally after push rather than made self-referential here.
- Next: parent independently reads the returned remote documentation SHA and this update timestamp. A future explicitly scoped change should address only the P1 character/material/lighting quality and P2 focus, then repeat same-camera target comparison and real A/B interactions, preserving all passing economy/save/stock-flow fixes. No content expansion, rebalance or publication is authorized by this review.
