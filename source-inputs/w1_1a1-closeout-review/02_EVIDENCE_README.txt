W1.1A1 reviewer evidence

Source used: canonical commit 2da2ca394bd2e1c0d3ec65d6e0f712b21a5294c4.
Application sources, source repository and public Site were not modified.

reviewer_probes/art-a1a2.mts
- Actual source geometry and GLB triangle comparisons.
- AST-extracted real runtime material factory against imported materials.
- No rendered appearance or GPU claim.

reviewer_probes/startup-visibility.mts
- Actual extracted boot/run/committed/cancel/resume functions.
- Real Core, Saves and FeedbackProjector with fake IndexedDB.
- Mocked world readiness, event targets, DOM, timers and audio.
- Observational only: exit0 means capture succeeded, not that the startup defect is fixed.

Run from a complete W1.1A1 checkout with original dependencies installed:
node --import tsx /absolute/path/to/reviewer_probes/art-a1a2.mts /absolute/path/to/complete/source
node --import tsx /absolute/path/to/reviewer_probes/startup-visibility.mts /absolute/path/to/complete/source

Do not run against the originally uploaded partial ZIP: it lacks src/tests/tools.
If functions change during a fix, adapt probes to their actual new interface; do not distort production code to satisfy string extraction.

named-tests.json and individual *.direct.log contain the independently observed 55-case result. tests.log is the ordinary npm test run, which reports seven file-level tests in this environment.
asset-rebuild-audit.json records disposable source-copy exporter runs for both historical W1.1A and current W1.1A1, including byte-identical GLB hashes.
archive-inspection.json and archive-canonical-comparison.json describe the damaged received ZIP.
repaired-source-archive.json identifies the separate complete canonical source export.
site-and-browser-review.json separates metadata checks, user-provided deployment receipt, isolated DOM observations and unavailable rendered-3D evidence.

All claims about real WebGL appearance, mobile touch, GPU disposal or FPS remain unverified. No browser screenshots or player saves are included.
