# Day 1 copy review — creative proposal

The new five-locale catalogue in `src/narrative/day1-copy.ts` is separate from
the accepted 174-key base catalogue. It covers zh-HK, English, Japanese, Thai
and zh-CN, with 52 keys per locale. Existing base copy has not been edited by
this task. The sandbox advance action has its own +15-minute label. Pending
profit wording does not claim that the player has already read a P&L explanation.

Bible §20, §28–29 and Part II P1–P4 fix the cozy tone, Day 1 sequence and
Misaki's service / regulars / cozy role. They do not supply these exact lines;
all Day 1 dialogue here is a new creative proposal. Misaki is kept as the
provided name rather than inventing a canonical Japanese spelling.

The Cantonese version uses brief spoken Hong Kong wording; the other locales
are transcreated as simple, warm, direct sentences. All five catalogues were
read for intent, placeholders and financial wording. This is an implementation
copy review, not independent native-speaker certification.

The character comments on the currently validated selection. Journal wording
uses “here” / “眼前” rather than claiming an earlier choice was permanently
remembered. General browsing is distinct from confirmed sales; no named
customer or specific product sale history is invented. Returning-player text
acknowledges existing sales without calling them a newly observed first sale.

Profit and loss share a current-report amount contract. The accompanying
`asOf`, `reportDate` and `reportCurrent` strings keep the Tokyo timestamp and
interim-report status explicit. A previously read beat is not profit evidence.
The sandbox 5–10 minute target is active interaction guidance; normal play
continues to follow real time.

The formatter returns plain text. UI must HTML-escape the result after
interpolation, including item names and formatted amounts. No raw authored HTML
or recursive interpolation is supported. Missing values become empty text;
callers must provide the exact placeholder sets tested by the catalogue.

Automated tests cover key parity, nonempty text, exact placeholder parity,
safe nonrecursive interpolation, plain-text behavior and the financial/time
contracts. Actual narrow-screen layout and keyboard focus depend on root UI
integration; these tests alone do not certify a rendered view or 3D scene.
