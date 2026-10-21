# W1.1A supported browser review — 2026-10-21

The managed Sites preview was rechecked this round. The fresh built world module failed at Engine construction with `Error: WebGL not supported`. No real 3D frame, before/after 3D comparison or dynamic video was obtained. NullEngine reimport, mathematical tests and DOM screenshots are not rendered proof.

The first non-mutating preview load read the previously selected sandbox. All subsequent interactive review used a compile-only `VITE_ART_REVIEW=1` build with the separate IndexedDB `next-stop-little-shop-art-review-w1_1a`, separate draft/mode/locale/presentation preference keys. Neither player slot was imported over or staged for screenshots. The final production build omits review database/key strings and the local QA page.

Observed on an independent QA fixture:
- Named the shop, bought five notebooks, selected display 2, placed stock and opened the shop.
- Advanced one hour: five actual units sold, stock zero, cash ¥51,400; one aggregate sold-out notification.
- Revealed sample: committed completion card immediately showed Select / Unique / 0 stats and a transient skip control. Reload preserved the completed state/cash, without replaying a sale or opening notification. Skip cancellation is additionally covered in the presentation-clock test; actual 3D skip appearance remains unverified.
- Restocked five notebooks; typed uncommitted JPY 1,230 on display 2. After the existing 6.5-second notification expired, the input still held 1230, remained focused, and the drawer retained scrollTop 268.
- Selected shelf 2, committed JPY 1,230, advanced one hour: three actual units sold, cash ¥52,490. Report: revenue ¥7,690, COGS ¥3,200, salary ¥600, rent ¥400, operating ¥200, net ¥3,290; two notebooks remained with ¥800 book cost. Purchase cash remained distinct from COGS.
- Low quality and Minimal effects could be selected; the checkbox remained checked after reload, and the economic save revision stayed 6 for preference-only operations. Low itself retains existing session-only behavior.
- Switched the QA sandbox (revision 9) to its separate new normal slot (revision 0), then back. Sandbox identity, cash ¥52,490 and revision 9 were retained; no sale/reveal replay appeared.
- Five locales × 320/375/430/1200 CSS widths (780px high) all had no horizontal document overflow and drawers stayed within the width. Five original SVG icons present; navigation target minimum 58×54 CSS px on 320, 74×58.390625 on desktop. Exact observed rows: dom-layout.json.

`ui-only-th-320.jpg` is a UI-only screenshot, explicitly showing the WebGL limitation and a CSS iframe. It is neither a device screenshot nor 3D evidence. All browser interaction used the supported managed preview; no driver/browser/security changes or alternate rendering path was attempted.

Pending: actual world light/normal appearance, silhouettes/occlusion, local FX legibility, OS Reduce Motion transitions, full dynamic skip/mode/visibility behavior, phone touch and frame times. Unit/source coverage of these policies is reported separately.
