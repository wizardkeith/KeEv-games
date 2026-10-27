const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const repo = path.resolve(__dirname, '../KeEv-games-handoff');
const npmLock = JSON.parse(fs.readFileSync(path.join(repo, 'package-lock.json'), 'utf8'));
const locked = new Set(Object.entries(npmLock.packages).filter(([p]) => p).map(([p, v]) => p.slice(p.lastIndexOf('node_modules/') + 13) + '@' + v.version));
const installed = new Map();
const pnpm = path.join(repo, 'node_modules/.pnpm');
const roots = fs.readdirSync(pnpm, {withFileTypes:true}).filter(item => item.isDirectory() && item.name !== 'node_modules').map(item => path.join(pnpm,item.name,'node_modules'));
roots.push(path.join(repo,'node_modules'));
for (const base of roots) {
  if (!fs.existsSync(base)) continue;
  for (const pkg of fs.readdirSync(base, {withFileTypes:true})) {
    if (!pkg.isDirectory()) continue;
    const dirs = pkg.name.startsWith('@') ? fs.readdirSync(path.join(base, pkg.name), {withFileTypes:true}).filter(d => d.isDirectory()).map(d => path.join(base, pkg.name, d.name)) : [path.join(base, pkg.name)];
    for (const dir of dirs) {
      const manifest = path.join(dir, 'package.json');
      if (!fs.existsSync(manifest)) continue;
      const json = JSON.parse(fs.readFileSync(manifest, 'utf8'));
      const key = json.name + '@' + json.version;
      assert(locked.has(key), 'Installed package not in original npm lock: ' + key);
      const lifecycle = Object.fromEntries(Object.entries(json.scripts || {}).filter(([s]) => ['preinstall','install','postinstall'].includes(s)));
      installed.set(key, {name:json.name, version:json.version, lifecycle, publishedSourcePrepareNotRun:json.scripts?.prepare || null});
    }
  }
}
assert(installed.size >= 25, 'Missing locked packages');
const scripted = [...installed.values()].filter(p => Object.keys(p.lifecycle).length);
assert.deepEqual(scripted.map(p => p.name), ['esbuild']);
assert.equal(scripted[0].version, '0.25.12');
assert.deepEqual(scripted[0].lifecycle, {postinstall:'node install.js'});
assert(installed.has('@esbuild/win32-x64@0.25.12'));
const esbuildScript = fs.existsSync(path.join(repo,'node_modules/esbuild/install.js')) ? path.join(repo,'node_modules/esbuild/install.js') : path.join(pnpm, 'esbuild@0.25.12/node_modules/esbuild/install.js');
const report = {originalNpmLockPackages:Object.keys(npmLock.packages).length, installedCount:installed.size, allInstalledVersionsInOriginalNpmLock:true, installed:[...installed.values()].sort((a,b) => a.name.localeCompare(b.name)), onlyInstalledLifecycle:'esbuild@0.25.12 postinstall: node install.js', esbuildInstallScriptSha256:crypto.createHash('sha256').update(fs.readFileSync(esbuildScript)).digest('hex'), registryHosts:[...new Set(Object.values(npmLock.packages).filter(v => v.resolved).map(v => new URL(v.resolved).hostname))], passed:true};
fs.writeFileSync(path.join(__dirname, 'dependency-audit.json'), JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({installedCount:report.installedCount,scripted,allInstalledVersionsInOriginalNpmLock:true,passed:true}));
