# v6 independent incremental-release review

2026-10-24T16:21:45+08:00 (Asia/Hong_Kong). **Conditional pass for safe incremental playtest publication; not final reference-art or physical/native acceptance.** Parent coordinates release. No application fix, PR change, merge or deployment was performed by this review.

- Reviewed candidate: `4b0a211491799f88a2f4c0c099fdc0db84361260` ([draft PR #3](https://github.com/wizardkeith/KeEv-games/pull/3)). Runtime: `2e31c7fb0fdaf4b17cb7a415f5368fbe6af3b43c`; identical `src` tree `06973abf4511a56e0ff9bf03204778e5dde4ea83`.
- Current main/AGENTS read at `73d17a01f684c8bef273abf96a1d45f73ffc50ae`. Authoritative Library brief `libfile_397003d030608191bb01f12a5a8b2652`: all 81 native-text lines read, no missing continuation. Earlier complete Bible/reference review reused after verifying unchanged Bible/docx/extract/approved PNG blobs; actual target and current before/after pixels inspected again. No absent original 10.8-second brief video is claimed watched.

## Independent results

| Check | Result |
| --- | --- |
| `npm ci`; pinned `npm test` | 145 passed / 0 failed / 0 skipped; about 7.61 seconds |
| `npm run build`, `validate`, `replay`, `asset-check` | Passed; existing large-chunk warning. 10 offerings/five locales; cash 5020, stock 4, net 180, units 6 |
| Current GLB validators | 18 files, zero errors/warnings |
| All documented asset generators | 212 tracked asset/public files byte-identical after regeneration |
| Actual deployment tar vs receipt/clean build | 122 unique file payloads: 121 runtime + hosting, all hashes/bytes equal; no saves, browser sessions or evidence in archive |
| Frozen source paths | core/platform/content/story predicates/source-inputs/package/hosting unchanged from v12 |
| Actual production browser UI run | Five desktop drawers all 580px; exact camera alpha/beta/radius/target retained after real drag/wheel and panel open/switch/close |
| Stock transactions and navigation | Keyboard Enter retains same-card context and shelf placement; immutable delayed/repeated intent and aborted IndexedDB atomicity pass; raw drafts/rail position survive ordinary repaint/reopen |
| Narrow layouts/locales | Twenty 320/375 × 420/812 five-locale touch-emulated buy/place cases; no horizontal document overflow; full-width mobile card and 44px targets; Reduce Motion/query/filter/reload checks pass |
| Separate final-code controls run | Previous/next, horizontal wheel delta, mouse drag and native 375px touch-emulated swipe pass |
| Real previous-v5 QA save | Created/exported through genuine v5 UI, imported into v6, reloaded, then bought/placed further stock; cash/inventory/shelves/reports/tutorial/watermark/ledger/identity preserved. No player's Normal save used |

Deployment archive SHA-256: `c546faa106e7554ace7d5294fd74fbce14986d4cb95d2041d6c0133075d1679c`. Unlike the previous review's unavailable archive, these actual committed tar bytes were opened and compared here.

## Nonblocking finding — P3 selected-state restoration

At 1440×1000, new Sandbox → Stock → focus rail and End → focus final `off.vase` quantity and enter `007` → reload → Stock → Report → Stock. Before reload both persisted selection and `aria-current` are vase. Scroll restoration changes persisted selection to `off.tray`; the next repaint/reopen changes `aria-current` to tray. In two independent reproductions, the horizontal position stayed **2723**, the vase draft stayed **007**, and actual vase purchase/placement commands remained correct.

Cause: [src/main.ts:121–128](https://github.com/wizardkeith/KeEv-games/blob/4b0a211491799f88a2f4c0c099fdc0db84361260/src/main.ts#L121) treats every scroll as a selection change and uses nearest leading-card offset. At the final desktop snap position, the preceding partial card has the closest offset; restoring scroll overwrites the saved explicit selection. Preserve explicit restored selection or distinguish navigation/restoration from genuine browsing in a later scoped fix. This is incomplete selection/ARIA retention, not an economic, data-loss or navigation blocker for the incremental release.

## Actual visual evidence and limits

- [High rail + shop](https://github.com/wizardkeith/KeEv-games/blob/4b0a211491799f88a2f4c0c099fdc0db84361260/evidence/native-v6/art/after/rail-shop.png), [High character close](https://github.com/wizardkeith/KeEv-games/blob/4b0a211491799f88a2f4c0c099fdc0db84361260/evidence/native-v6/art/after/character-close.png), [High panorama](https://github.com/wizardkeith/KeEv-games/blob/4b0a211491799f88a2f4c0c099fdc0db84361260/evidence/native-v6/art/after/panorama.png).
- [30-second motion excerpt](https://github.com/wizardkeith/KeEv-games/blob/4b0a211491799f88a2f4c0c099fdc0db84361260/evidence/native-v6/motion/movement-work-purchase-30s.webm) and retained full original inspected through chronological actual decoded frames. It shows customer movement/looking and staff purchase-response activity in Low + Minimal FX, not final High target fidelity.
- All 16 listed artifact sizes/hashes verified. All 749 decoded excerpt frames matched the contiguous original-video window at the declared start time, supporting the no-internal-cut/lossless-excerpt provenance; this is integrity evidence, not visual acceptance. Art/world/presentation trees at capture component checkpoint `259ee66ec2f5fdf4fb240558af64b819fc227503` match final runtime; later UI preference/card-step work is correctly distinguished. No unsupported whole-src capture identity claim.
- Relative to prior actual images: face/eyes/collar, restrained hair surface, shoes, cabinet detail and grouped merchandise improve incrementally. The selected target still has richer organic hair/face, fabric drape, shop detail and lighting/material finish. No test count or mesh budget is used to call that complete.
- Physical GPU/FPS/Safari/real mobile keyboard/safe area/audio/true hidden-tab/native Unity/C#/URP remain unverified. SwiftShader, desktop emulation and encoded video rate are not physical acceptance. Short layouts keep primary actions reachable via each card's internal vertical scroll; this remains a practical UX tradeoff to assess on real devices.

The UI/camera and safe compatibility gates support a checked same-Site incremental release. Keep the P3 selection correction and remaining art/device gates explicit; do not withhold a safe playtest solely because final target art is unfinished. No new Library output or local brief materialization is claimed. Canonical progress was updated separately on main, with normal non-force push/readback and no PR head/metadata mutation.
