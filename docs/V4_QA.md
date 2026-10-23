# Reproduce the v4 cloud checks

Use the existing checkout; each cloud task is already isolated. Do not create a Git worktree unless explicitly requested. Preserve uncommitted user work.

The app dependencies are pinned by the original lockfile. This cloud image supplies Node 24.19.0, npm 11.9.0, Python 3.12.14, Playwright 1.62.1 through NODE_PATH, Chromium 154.0.8037.57, and system ffmpeg 7.1.5. Playwright/Chromium/ffmpeg are QA tools, not runtime dependencies of the deployed game.

## Production and browser interaction

From the repository root:

```sh
npm ci
npm test
npm run validate
npm run replay
npm run asset-check
npm run build
npm exec vite -- preview --host 0.0.0.0 --port 4173
```

In another cloud command session, reuse the installed system ffmpeg for Playwright's video recorder:

```sh
mkdir -p /workspace/.playwright/ffmpeg-1011
ln -s /usr/bin/ffmpeg /workspace/.playwright/ffmpeg-1011/ffmpeg-linux
QA_QUALITY=low PLAYWRIGHT_BROWSERS_PATH=/workspace/.playwright node tools/v4-browser-qa.cjs
```

If the symlink already exists, verify that it points to the supplied system ffmpeg and omit the `ln` command. This uses an already installed trusted encoder; it does not download an unchecked binary. The ffmpeg-1011 path belongs to the recorded Playwright version.

The script starts a fresh browser context, creates Sandbox through the real UI, buys real inventory, uses true display/settlement commands, and reads IndexedDB only for assertions. It does not invent income, replace personal progress or force actor state. The complete purchase/visit/handoff video is closed and saved before independent UI checks. Saved QA continuation files under `/workspace/qa/` allow `QA_RESUME_UI=1` after diagnosing a UI-harness failure without discarding an already complete gameplay recording. Do not use that option to claim a new full gameplay run.

Low quality is used for the full interaction recording to keep software rendering responsive. High-quality current-game stills and the model comparisons are recorded separately. Reduce Motion is checked as a separate preference, including clearing held props. Responsive 320/375px and landscape keyboard focus checks use desktop emulation, not a physical phone keyboard.

## Web mesh / GLB render comparison

Start Vite development mode on port 5173, then run:

```sh
node tools/v4-render-qa.cjs
```

`tools/v4-mesh-review.html` is a QA-only entry, excluded from the production build. It draws the current native character and its standard-loaded GLB at matching camera, pose and lighting, with front/three-quarter/back, walking/service, normal, flat and no-shadow cases. It does not provide economic or production review hooks.

The scene comparison uses the complete v11 bundle cloned with `--branch main` into a temporary QA checkout. The middle image applies only the saved `orientation-only.patch`; the final scene uses the production build. Framing/light constants and 1440×1000 dimensions remain fixed. The stocked hero reloads an authentic QA checkpoint captured after accepted UI purchases.
