// Expose the already approved, locked esbuild binary for legacy direct-spawn probes.
// No package lifecycle hook, download, global PATH change, or game modification.
const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const repo = path.resolve(__dirname, '../..');
const lock = JSON.parse(fs.readFileSync(path.join(repo, 'package-lock.json'), 'utf8'));
const version = lock.packages['node_modules/esbuild'].version;
assert.equal(version, '0.25.12');
if (process.platform !== 'win32') {
  console.log(JSON.stringify({platform:process.platform, action:'No Windows shim needed'}));
} else {
  const source = require.resolve('@esbuild/win32-x64/esbuild.exe');
  assert.equal(cp.execFileSync(source, ['--version'], {encoding:'utf8'}).trim(), version);
  const destination = path.join(repo, 'node_modules/.bin/esbuild.exe');
  const sha = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  const existed = fs.existsSync(destination);
  if (existed) assert.equal(sha(destination), sha(source), 'Unexpected existing native command; stop');
  else fs.linkSync(source, destination);
  const direct = cp.spawnSync('node_modules/.bin/esbuild', ['--version'], {cwd:repo, encoding:'utf8'});
  assert.equal(direct.status, 0, direct.error?.message || direct.stderr);
  assert.equal(direct.stdout.trim(), version);
  console.log(JSON.stringify({platform:process.platform, version, action:existed?'Verified existing hard link':'Created project-only native hard link', binarySha256:sha(source), directExtensionlessSpawnPassed:true}));
}
