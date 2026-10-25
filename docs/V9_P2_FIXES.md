# V9 P2 corrections — independent re-review candidate

Application checkpoint **`cf28233398c8e492994908224cf9e3d4a462064c`**, src tree `8f668f05af7f5711c72afd5b9f9bbee59ea86e17`, same draft [PR #6](https://github.com/wizardkeith/KeEv-games/pull/6). **Not merged/deployed. Release remains on hold pending independent re-review.** Public remains V15. This supersedes the first V9 candidate's motion claims; the [independent rejection](https://github.com/wizardkeith/KeEv-games/blob/c77d153b5ce0cc370a86680f4944f0fc039b58e7/docs/reviews/V9_INDEPENDENT_RELEASE_REVIEW_2026-10-25_zh-HK.md) remains intact on main.

## Greeting uses the actual moving origin and intended guest

`StaffAttention` now receives current staff X/Z and the active greeting guest ID. Distance selection and doorway/customer angles use that origin; an explicit greeting target takes priority over another nearer visitor. Existing shortest-arc3.6rad/s turns and work-entry guard remain. The scene remembers the actual newcomer being greeted and cancels that target if the guest disappears.

The regression uses the review coordinates staff `[2.2,1.4]`, guest `[1.37018,1.78744]`, plus a second closer guest. It verifies the intended guest, correct current-position target and bounded turns. In the new actual WebGL recording, **six settled greeting samples have0° error** against the current guest coordinates; this replaces the earlier36.92° discrepancy. [Actual frame](../evidence/native-v9/p2-fixes/motion/greeting-frame.png), [sample geometry](../evidence/native-v9/p2-fixes/motion/geometry-observations.json).

## Reachable cashier contact, not a cross-air bag interpolation

The ordinary staff work/home point remains `[2.6,-0.65]`. A reserved sale uses a separate staff cashier dock `[3.31,-0.65]`, customer dock `[3.88,-1.22]`, and clear right-aisle approach/exit through X4.0. The checkout dock is held through work/recovery and then returns smoothly. These are presentation coordinates, not new economic positions/mechanics.

The new adapter solves the actual shoulder/elbow/wrist chain using immutable rig lengths. Both palms converge on a meeting point derived from their real world shoulders, with3.6cm separation across the bag handle. No arm length scaling/root teleport is used. The actual prior scene contact acknowledgement is required by the world delivery caller before exchanging owner. The bag keeps its world position at exchange and then follows the recipient's palm offset; the old0.18s interpolation across the gap is removed. The carrying arm stays away from clothing. Existing clip duration, immediate financial commit, bounded reservation, duplicate/epoch/hidden/reload handling and no-guest counter fallback remain.

Re-run the reviewer's same sparse geometry probe with `node --import tsx tools/v9-handoff-measure.ts`. The fuller companion `node --import tsx tools/v9-contact-measure.ts` also checks the whole contact window and first0.20s after transfer. It uses actual scene nodes/rig, in-memory Core and NullEngine; no player DB or economic callback.

| Actual scene quantity | Rejected candidate | Corrected application |
| --- | ---: | ---: |
| Hand socket separation at exchange |1.0055m|0.0360002m|
| Bag displacement over first0.20s after exchange |0.8906m|0.0211988m|
| Bag path over that0.20s |not claimed|0.0212321m|
| Entire contact-window bag path (24 samples) |not claimed|0.0358467m|
| Ownership-switch single-frame movement |not sufficient alone|0.00000006m|

[Full samples](../evidence/native-v9/p2-fixes/checks/contact-measure.json), [same reviewer probe](../evidence/native-v9/p2-fixes/checks/reviewer-probe.json), [actual WebGL handoff frame](../evidence/native-v9/p2-fixes/motion/handoff-frame.png). The real WebGL samples at progress0.625/0.679/0.714 show3.6cm hand separation and the bag handle at the staff palm/within the recipient handle reach. These are scene/software-rendering measurements, not physical-device naturalness acceptance.

Initial calibration caught an aisle obstruction and a guest arm grazing the counter during departure. The final docks/approach were adjusted before the final checks. The expanded real A/B tests now check both visitors' upper/lower arms and hands, staff hands and actual bag geometry against the counter, plus a whole-window6cm contact/12cm path bound. No clearance or original test threshold was relaxed.

## Actual motion and regression

[169.16-second uncut recording](../evidence/native-v9/p2-fixes/motion/full-uncut.webm), [timeline](../evidence/native-v9/p2-fixes/motion/timeline.json), [results](../evidence/native-v9/p2-fixes/motion/results.json). Continuous one-speed30s excerpts: [welcome](../evidence/native-v9/p2-fixes/motion/welcome-continuous.webm), [contact/handoff](../evidence/native-v9/p2-fixes/motion/contact-handoff-continuous.webm), [loss/return](../evidence/native-v9/p2-fixes/motion/loss-return-continuous.webm). Source hashes/offsets are retained; no cuts within excerpts or injected animation clock/receipt. The existing story card was dismissed through its actual control in fresh QA Sandbox to expose the actors.

This run passes actual greeting/walk, true positive settlement, receipt-matched generic visitor transfer/exit, true negative settlement counter fallback, Reduce Motion, closing and isolated Normal preservation. The positive batch is still revenue285−COGS145=140 → **+JPY1,400**; negative3−145=−142 → **−JPY1,420**. They remain **aggregate realized gross margin before overhead**, not per-buyer/net profit. The negative batch has no eligible new recipient; a guest finishing the prior positive departure is not misattributed to it.

- **165 tests,0 failures/skips**, build/content/replay/asset-check pass. New tests include current-origin/two-guest greeting, whole-contact-window bag/palm geometry for actual A/B transfers, withheld contact acknowledgement and8 actual before/after-contact cancellation cases (hidden/reduced/close/replacement). Cancellation keeps roots fixed, clears ownership, resumes without old bags and leaves the confirmed result unchanged. [Tests](../evidence/native-v9/p2-fixes/checks/tests-final.log).
- **139 retained GLBs,0 errors/warnings**;225 asset/public files rebuild byte-identically;247 protected files match V15. Art/geometry, UI, inventory/pricing lists, five locale content, core/platform/save/economic inputs and hosting/package identity are byte-identical to the first reviewed V9 candidate. [Scope](../evidence/native-v9/p2-fixes/checks/scope.json), [rebuild](../evidence/native-v9/p2-fixes/checks/asset-rebuild.json), [preservation](../evidence/native-v9/p2-fixes/checks/preservation.json). Authoring manifest now includes the reusable hand-contact solver and updated motion-source hashes; no original master was deleted.
- The independently accepted60 unchanged five-locale pricing/stock/set cases are attributed to the prior review, not falsely rerun here. No story/shop/set/ability/economy/save-schema expansion.
- Fresh [deployment archive receipt](../evidence/native-v9/p2-fixes/delivery/receipt.json):125 runtime payloads+hosting=126 actual archive entries, all reopened byte-identical to this build.3,690,593bytes; SHA256 **`4d3e846f0b487b02d1685a2fa2480fa43bc780e04c943af9a888c1b635d53606`**. Old candidate archive/provenance remains unchanged as historical evidence; this corrected archive has its own directory.

## High timing and remaining limits

The independent review's **two180s High work-capture timeouts remain failures**, not passes. A single new bounded45s read-only timing diagnosis at1000×760 found no work window and no page error. In44.711wall seconds the animation's visible time advanced only3.4496seconds, from0.6399 to4.0895; it had not reached the initial6visible-second work task. This establishes substantial cloud software-rendering/visible-clock lag in that run. It does **not** fully establish why both earlier180s runs missed their window. We did not change authored pacing, accelerate the clock, repeatedly retry180s or call this a successful High work capture. [Raw diagnosis](../evidence/native-v9/p2-fixes/high-timing/results.json).

Actual corrected motion evidence is Low+Minimal, Chromium WebGL2 ANGLE SwiftShader. Encoded25fps is not measured game/physical GPU FPS. Final target art, physical mobile/Safari/audio/true hidden-tab/native acceptance remain open. The earlier art comparison remains historical, not a new final-art pass. Placement PNG transfer remains unresolved; 本店加乘 is still a handoff-only plan. No Site, local Unity, player Normal, credentials/security settings or computer shutdown action occurred. No denied/pending/uncertain external mutation remains; independent re-review is the release gate.
