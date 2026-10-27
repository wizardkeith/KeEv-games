const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
(async () => {
  const asset = fs.readFileSync(path.join(__dirname, 'smoke.glb'));
  const server = http.createServer((req, res) => {
    res.writeHead(200, {'Content-Type': 'model/gltf-binary'});
    res.end(asset);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/smoke.glb`);
    const body = Buffer.from(await response.arrayBuffer());
    if (!response.ok || !body.equals(asset)) throw new Error('Asset loopback mismatch');
    const report = {node: process.version, httpStatus: response.status, bytes: body.length, magic: body.subarray(0, 4).toString(), localhostOnly: true, passed: true, browserRenderTested: false};
    fs.writeFileSync(path.join(__dirname, 'web-smoke.json'), JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report));
  } finally { await new Promise(resolve => server.close(resolve)); }
})().catch(error => {console.error(error); process.exitCode = 1;});
