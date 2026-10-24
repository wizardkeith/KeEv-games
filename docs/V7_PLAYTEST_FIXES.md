# V7 scoped playtest fixes — review handoff

[Draft PR #4](https://github.com/wizardkeith/KeEv-games/pull/4), branch `codex/game-v7-playtest`. Implementation starts at canonical main `c3c706aabae0ff32b56ab7c4b733d0cbea722892`, public V13/V6. Runtime checkpoint **`b323129040b1414f0e60cc3a05090c44cffab1cb`**, `src` tree **`5176ecfa2b54a27f8e6a5011f0ea744a17810aac`**. Later commits contain evidence/documentation only. No merge, Site save, publication or audience change was performed. Parent arranges independent review and local playtest.

## Five scoped results

1. **Stock space/actions:** compact search/cash/filter controls, header arrows, independently scrollable product details and a fixed card footer. Total, buy and place stay visible; placement choices open in the same card above the actions. Search retains a visible placeholder; quantity labels remain accessible on short screens. Global success announcements stay available to assistive technology while same-card status/picker provides visual feedback without covering controls. General/blocking errors remain visible.
2. **Cash:** no-wrap, tabular currency and bounded mobile sizing. A real 18-pencil Sandbox purchase produces the exact reported **JP¥48,200** value; all digits fit at 375px in zh-CN. No QA save injection was needed.
3. **Actual 3D refinement:** smoother/lighter bob ridges and a cleaner fringe opening, warmer hair/sage palette, clearer eye highlights/mouth and restrained head orientation, revised counter inset panels, grouped merchandise and slightly warmer key/cooler fill. Existing articulated hierarchy, character identity, scene/actor budgets, shadows, originals and reusable GLB authoring remain. These are visible incremental changes, **not final target-art acceptance**; face, cloth, furniture richness and lighting still trail the approved image.
4. **Selection:** scroll/snap/restoration now updates horizontal position without replacing an explicit product selection. Focus and explicit rail navigation still choose products. Vase selection, raw `007`, position and panel switching/reload pass.
5. **Staff work:** larger cloth/legible note lines, longer calm arranging/inspection holds, a bounded counting/inspection wrist accent and coherent clip markers. Real purchase projection remains immediate; presentation does not write economy or replay offline sales. Actual Low + Minimal arranging and inspection captures are included; Reduce Motion cancellation remains tested.

## Fresh verification

- **145 tests passed, 0 failures/skips**, TypeScript/Vite build, content validation, deterministic replay and asset-check. Replay: cash 5020, stock 4, net 180, units 6. Existing large-chunk build warning remains.
- **94 protected source/config files** (core, platform, content, narrative, source inputs, package/lock and hosting) byte-identical to base. Complete Git history retained; no economy, catalog, story predicate, schema or Normal save change.
- Three changed-asset generators rerun: **207 asset/public files** byte-identical before/after. All **55 retained public GLBs** validate with 0 errors/warnings, including the 18 current baseline models. No original master was deleted; earlier bytes remain in full history.
- Actual WebGL browser: every desktop drawer **580px**; user-adjusted orbit/zoom/target exactly preserved across five-panel switches/open/close. Native arrows, horizontal wheel, mouse drag and keyboard browsing pass. Keyboard purchase retains buy focus, next Tab reaches place, then same-card shelf actions. Invalid, repeated, delayed and transaction-aborted writes preserve captured intent and snapshot integrity.
- **20 five-locale 320/375 × 420/812 touch buy/place cases**, 44px targets, reduced motion, filter/query/raw drafts/scroll/reload and isolated Normal baseline pass. The final exact runtime also passed a fresh additional recorded run (all 20 cases, no page errors); its result is stored beside the earlier component-matched run.
- **15 final layout cases**: all five locales at 1280×720, 320×420 and 375×812. Fully visible quantity, total, buy and place; exact 48,200 digits fit. This executor reproduced baseline card heights **122.7 / 89px**, improving to **345 / 192px**. Owner-reported measurements **112.73 / 78.95px** came from a separate local setup and are not presented as this executor's identical measurement.
- Genuine prior-v5 QA Sandbox export imported/reloaded with identity, inventory, shelves, ledger/reports, story/economic flags and watermark preserved; further real purchase succeeds; isolated Normal baseline unchanged.
- Actual delivery archive opened and every entry compared with final clean build: **121 runtime files + hosting = 122 files**. Archive SHA-256 **`b5e8847769c7c7c16f0d6a6546643734c639a00de6c0be1be9dd1b8c6bd13942`**, 3,176,879 bytes. Evidence is outside the runtime archive.

## Evidence and attribution

- [Stock before](../evidence/native-v7/browser/stock-before/) / [final five-locale stock screenshots](../evidence/native-v7/browser/stock-after/).
- [Art before](../evidence/native-v7/browser/before/) / [art after, arranging and inspection](../evidence/native-v7/browser/after/). Approved PNG and complete Bible/embedded images were read before art work; comparison uses their actual pixels.
- [25.8-second uncut chronological movement/purchase excerpt](../evidence/native-v7/browser/movement-work-purchase-uncut-25s.webm), [165.12-second original](../evidence/native-v7/browser/movement-work-purchase-full.webm), [uncut stock interaction](../evidence/native-v7/browser/stock-interaction-full.webm), [motion observations](../evidence/native-v7/browser/motion.json).
- [Checks and provenance](../evidence/native-v7/provenance.json), [deployment-ready archive and receipt](../evidence/native-v7/delivery/). Motion was captured at checkpoint `49180eb`; art/motion component hashes match final runtime, but later UI-only refinements mean its whole `src` tree does **not**. Final stock screenshots and exact-candidate UI run use final runtime. No screenshot/video is a mockup, generated replacement or physical-FPS claim.

## Limits and local handoff

Cloud captures use Chromium/ANGLE SwiftShader software rendering. Physical mobile GPU/FPS, Safari, actual virtual keyboard/safe areas, audio, true hidden-tab, native Unity/C#/URP and owner/final-art acceptance remain open. Low render softness in staff captures is intentional quality-mode evidence. Public Site remains V13; no cloud public-proxy retry or bypass was attempted. No local PC/Unity operation occurred.

Owner evidence `libfile_7f2f9cdcea848191b3a4f13efcf23e93` was prepared through Library, but the current supported transfer helper returned **download failed**. No readable local ZIP or screenshot pixels were available; no claim of viewing that report is made. This read-only materialization gap did not block independent local WebGL tests. No new Library output IDs are claimed.

Parent should review this pinned candidate, then run a fresh isolated local Sandbox at the original Site only after an authorized checked release: short 320×420 purchase/place and toast behavior, 375px zh-CN 48,200 cash, vase `007` reload/selection, normal-camera Misaki/counter and calm arranging/counting/inspection. Preserve the existing player profile/Normal save and unsynchronized Unity files.
