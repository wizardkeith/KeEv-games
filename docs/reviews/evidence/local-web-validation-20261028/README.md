# Local Web validation evidence

See `../../../LOCAL_WEB_VALIDATION_2026-10-28_zh-HK.md`. Logs are sanitized and line endings normalized. The original test suite remains 301/302; the JSON material-factor difference is recorded, not waived. PNGs are byte-exact screenshots from a new headless process and fresh isolated contexts, not desktop captures.

The .cjs/.mjs diagnostic snapshots were executed in the original task layout with a sibling KeEv-games-handoff checkout. runtime-smoke.cjs accepts KEEV_REPO, QA_OUTPUT and CODEX_NODE_MODULES for replay with existing tools; it downloads nothing. Do not run fixed-baseline restoration snapshots against another checkout.
