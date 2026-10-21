W1 CORE REVIEW — OBSERVATIONAL REPRODUCTIONS
===========================================

Purpose
-------
These four probes reproduce observations from the supplied W0/W1 baseline.
They are NOT passing acceptance tests: an exit code of zero means that the
script completed, not that the game is correct. Inspect each JSON result.
After fixing a defect, add assertions to the project's normal test suite for
the intended repaired behavior. Do not turn the defective outputs below into
the expected results of passing regression tests.

The script imports the current repository implementation. It uses
fake-indexeddb in its own Node process; it does not read or change a user's
real browser save. It neither modifies source files nor writes result files.

Placement and run instructions
------------------------------
Copy this reviewer_probes directory into the repository root so that it sits
beside package.json, src, and tests. From the repository root run:

  npm ci
  node --import tsx reviewer_probes/core-review.mts

The supplied baseline lockfile already includes tsx and fake-indexeddb.
No Unity, local graphics driver, or live browser is needed for these probes.
Run them in the available cloud development environment if local installation
is unavailable. They do not replace a real browser save/resume walkthrough.

Original observations
---------------------
The original baseline was observed under Node v24.19.0. Financial values below
are internal normalized units: the baseline displays 10 JPY for each unit.
The probe starts at 2026-10-21 10:00 Tokyo time.

1. closed-empty-shop-eleven-days

   Create a normal-mode shop, leave it closed with no stock, and settle eleven
   days. Try to buy one unit of the cheapest item, off.pencil.

   Original output:
   {"probe":"closed-empty-shop-eleven-days","cash":-280,"stock":0,"rent":5280,"buyCheapest":{"accepted":false,"error":"cash"}}

   Required repaired outcome: a player in this condition can use an explicit
   supported gameplay action to obtain sellable stock and resume trading,
   without editing JSON, deleting the save, or using developer tools. The
   recovery should be safe to repeat or retry and must not duplicate grants.

   This observational probe only attempts an ordinary purchase. If the repair
   introduces a separate recovery/consignment command, the original cash error
   here can remain valid: add a separate acceptance test that invokes the new
   recovery action and completes a sale. Do not mistake a negative balance by
   itself for failure once a real recovery path exists.

2. price-remainder-transfer

   Buy/display one notebook and open the shop. Price it at 81, settle ten
   minutes, change its price to 100000, and settle to minute 165. Compare with
   the same shop priced at 100000 throughout.

   Original output:
   {"probe":"price-remainder-transfer","before":{"stock":1,"remainder":592560,"sales":0},"changed":{"cash":104796,"units":1,"sales":100000},"fixedHighPrice":{"cash":4796,"units":0,"sales":0}}

   Required repaired outcome: cheap-price demand must not become a 100000-unit
   sale at the later price. If the narrow repair resets demandRemainder on an
   actual price change and otherwise preserves the baseline rules, both paths
   finish with zero sales, zero units sold, and cash 4796 at minute 165.
   A different approved demand model may have different exact totals; write
   the acceptance assertions against its explicit contract rather than these
   old values. Also test the reverse price change and save/reload boundaries.

3. numeric-string-import

   Start from a valid normal-mode snapshot, replace notebook stock with the
   JSON string "10", and set its numeric bookCost to 400. Validate, import,
   buy one notebook, then reload through the real Saves adapter backed by
   fake-indexeddb.

   Original output:
   {"probe":"numeric-string-import","validationAccepted":true,"stockAfterBuyingOne":"101","stockType":"string","bookCost":440,"cash":4960,"reloadAccepted":true}

   Required repaired outcome: validate rejects the numeric string and import
   rejects it before replacing the saved snapshot. The original saved shop
   remains unchanged (stock 0, cash 5000 with baseline initial values).
   The script catches this expected rejection, prints validationAccepted:false
   and rejectedAt:"import", and continues to probe 4. The precise validation
   error code may differ after the fix. A rejection only after import, while
   attempting buy or reload, is not the intended repair.
   Add acceptance cases for numeric strings, null, booleans, and arrays in
   numeric fields; validate types explicitly rather than coercing them.

4. full-ledger-settle

   Create a valid snapshot with 100000 unique ordinary command IDs. Validate
   it and attempt to settle one minute without adding an ordinary command.

   Original output:
   {"probe":"full-ledger-settle","validation":{"accepted":true,"value":true},"settle":{"accepted":false,"error":"command_limit"}}

   Required repaired outcome: settlement is accepted, watermark advances by
   60000 ms, and commandCount remains 100000 because settlement does not append
   to the ordinary-command ledger. With the unchanged baseline configuration,
   the first closed minute leaves cash 5000 and carries its fractional rent.
   The script prints a compact success summary if settlement is repaired.
   This does not by itself solve the longer-term ordinary-command ledger limit.

Scope and interpretation
------------------------
These probes do not cover the UI error flag that can block automatic resume,
visual quality, narrative, real browser IndexedDB behavior, or C#/WASM/Unity
parity. They deliberately preserve the four original scenarios. A repaired
implementation should be checked with explicit acceptance tests and a real
browser walkthrough as appropriate.

If the implementation deliberately changes the pricing API, item IDs, content
versions, or snapshot schema, adapt the fixture inputs to the new approved
contract and retain a migration/rejection test for old saves. Do not weaken
validation merely to keep these observational probes running.
