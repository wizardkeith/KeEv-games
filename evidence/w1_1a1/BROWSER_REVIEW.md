# W1.1A1 managed browser QA — 2026-10-21 (Hong Kong)

The supported managed preview was freshly rebuilt with `VITE_ART_REVIEW=1` and rechecked. The current W1.1A1 world module failed at Engine construction with `Error: WebGL not supported` (console timestamp 2026-10-21T11:12:47Z). UI displayed the fallback. There is no actual 3D frame, before/after art comparison, dynamic capture, touch or FPS result. Source rays, material flags, validators and NullEngine imports are not visual evidence.

This round used a new isolated `next-stop-little-shop-art-review-w1_1a1` database, still with the compile-only review mode/locale/draft/presentation keys separate from player keys. No player normal/sandbox snapshot was imported, staged or overwritten.

Observed through supported browser controls:
- Named the review shop; bought five notebooks for ¥2,000; selected display 2 and placed stock. The successful notice named display 2. Kept original prices/rules.
- Opened, advanced one hour: five real units sold, zero stock, cash ¥51,400, one aggregate sold-out notice.
- Selected High and disabled Minimal effects before revealing. With WebGL unavailable, the committed completion card appeared directly: Select / Unique / 0 stats. Read-only DOM observation: completionPresent=true, revealingCards=0, skipControls=0. No wait for a nonexistent scene or useless Skip.
- Reloaded and reopened journal: cash ¥51,400/time11:00 remained; completed card retained; notices=0, skip=0. No replay.

F1 deferred hidden/resume races, F2 100ms-frame deadline/normal completion/replacement/Low-Minimal-reduced/skip/context loss, and F3 selection changes while awaiting Saves are covered by the real-source boundary tests with real Saves + fake IndexedDB where relevant. These simulate timing with explicit DOM/timer/audio/renderer mocks, not browser WebGL or real device timing. See presentation-tests.log and test source for exact boundaries.

The last timer-generation guard was source-tested after this UI walkthrough; it does not change the verified no-world static path. A final production build was then made without review flags and checked for absent review database/key/page strings.

Pending visual gate: cup rim/handle in actual light, transparent back-face appearance, visible slow-frame Skip and local feedback, real hidden/resume behavior under a GPU context, touch and device performance. No driver/security/Unity setup was requested or changed.
