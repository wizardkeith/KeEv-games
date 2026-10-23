# Next Stop, Little Shop — canonical project state

Last updated: **2026-10-24T01:22:21+08:00** (Asia/Hong_Kong).

## Canonical checkpoint and branch state

- Repository: https://github.com/wizardkeith/KeEv-games ; this file on `main` is the sole designated progress entry.
- Verified source/candidate checkpoint: `220a7165d67ecb5214587a305f55603ffc285a7e`. This documentation-only successor preserves that complete source tree. Obtain this checkpoint's exact commit with `git log -1 --format=%H -- PROJECT_STATE.md`; the post-push receipt is recorded in issue #1.
- Remote advertised only `main` at that SHA; 19 commits before this checkpoint. No remote feature branch was advertised. `codex/little-shop-v4` in the historical import evidence describes the previous working branch, not an outstanding remote branch.
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
- [Full candidate inventory](docs/SYNC_CHECKPOINT_INVENTORY.tsv) records every candidate path, mode, Git blob, size and SHA-256. All 691 working files matched their fetched Git blobs. Inventory SHA-256: `6f1a1351747242e48bb3ee9356df0de367004af6e3ad1dec1d0f23ade3d7a2e7`. It is pinned to the pre-documentation candidate, intentionally excludes this checkpoint's three new documentation files; resulting tree has 694 tracked files and 20 commits.
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

## Historical tests versus this run

Tracked `evidence/native-v4/tests.log` records **142 passed / 0 failed**; production build, content validation, deterministic replay and GLB validation evidence are also retained. Replay reports cash 5020, stock 4, net 180, units 6. Browser/render evidence records Chromium WebGL2 / ANGLE SwiftShader and desktop responsive UI checks, with source attribution and videos. These logs were inspected, **not rerun** in this documentation task. No new npm test/build/replay, runtime visual review, physical-device or audio acceptance is claimed. Newly run checks are Git integrity/ancestry/inventory, protected-path comparison, recorded-video hashes, bounded token-signature scan and documentation diff checks.

## Acceptance limits, restrictions and next steps

- Owner art/UX acceptance remains pending. Software-rendered cloud evidence is not physical-phone GPU/FPS/keyboard/audio acceptance. Visitor B lacks its own separate handoff video; rig assets remain articulated rigid hierarchies, not embedded skeletal clips.
- Unity/C#/URP and iOS/Android ports remain pending; active TypeScript simulation is `PORT_REQUIRED_FOR_UNITY`. No full Tokyo seven-day expansion or economy rebalance is authorized here.
- Do not force push, restore an older snapshot over newer work, change code/assets in this task, publish/recreate the Site, change identity/access, or manipulate Normal saves.
- Next: parent independently reads this exact GitHub checkpoint SHA and timestamp and records agreement. Cross-environment agreement is **pending that independent read**, not assumed from this push. Then seek the owner's next explicit development/acceptance task; publication remains separately scoped.
- Library unified handoff `Evana_KeEv_Three_Project_Unified_Handoff_2026-10-24.txt` was read fully. Its empty-repository/unimplemented-v4 statements are stale relative to live main; preserved historical material must not replace the newer candidate.
