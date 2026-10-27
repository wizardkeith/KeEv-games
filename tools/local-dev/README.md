# Local Web development setup

This keeps the original `package.json` and npm `package-lock.json`. The pnpm
lockfile was imported from that existing lock; the installed package versions
were checked against it. Use the existing bundled pnpm 11.25.0, not a global
installation. Project-local policy permits only `esbuild@0.25.12` postinstall;
unknown lifecycle scripts fail, and `pnpm run` cannot auto-install dependencies.

In PowerShell, using the already installed Node on PATH:

```powershell
$pnpmEntry = Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules\pnpm\bin\pnpm.mjs'
node $pnpmEntry install --frozen-lockfile --ignore-scripts
node $pnpmEntry rebuild esbuild
node tools/local-dev/setup-windows-dev.cjs
node $pnpmEntry run test
node $pnpmEntry run validate
node $pnpmEntry run replay
node $pnpmEntry run asset-check
node $pnpmEntry run build
```

The hoisted layout matches existing npm-era probes that import transitive
esbuild. The Windows helper hard-links the already installed, version-checked
native esbuild binary into this project's ignored `.bin` directory so existing
extensionless direct-spawn probes work. It downloads nothing and changes no
global PATH. On other platforms it does nothing. Rerun the helper if a later
dependency reinstall removes that ignored link.

Keep `node_modules` and `.pnpm-store` for ongoing local development; both are
ignored. Do not commit or synchronize them as source. Keep both lockfiles in
sync if a future task explicitly authorizes a dependency update.

The repository's LF attributes preserve canonical source receipt bytes on
Windows. Original binary/PDF rules remain. Existing shallow clones also need
the source commits used by preservation tests. If `git rev-parse
--is-shallow-repository` returns `true`, obtain that same branch's history with
`git fetch --unshallow --filter=blob:none origin codex/asset-foundation-v1`.
Historical blob reads may then use the existing authorized Git connection.
Do not reset or overwrite another checkout to apply these steps.

Current validation: **304/304** (the original 302 assertions retained plus two
canonical-color regression checks), build/type checks and isolated headless
runtime passed. A fixed shared sRGB8 table resolves the Visitor A JSON 1-ULP
mismatch while preserving every master/public asset byte and strict hashes.
See `docs/DETERMINISTIC_SRGB8_2026-10-28_zh-HK.md`. Linux A/B is not yet run.
The auth/push hold, GUI hold, Web-first scope and unaccepted R6 art status remain.
