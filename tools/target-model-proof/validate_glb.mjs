import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import validator from 'gltf-validator';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const asset=path.join(root,'assets/authoring/target-model-proof-v1');
const manifest=JSON.parse(fs.readFileSync(path.join(asset,'manifest.json')));
const reports={};
for(const [name,entry] of Object.entries(manifest.exports)){
 const bytes=fs.readFileSync(path.join(root,entry.file));
 const result=await validator.validateBytes(new Uint8Array(bytes),{uri:path.basename(entry.file)});
 const json=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)).toString());
 const primitives=json.meshes.flatMap(m=>m.primitives);
 const coloured=primitives.filter(p=>p.attributes.COLOR_0!==undefined);
 const images=(json.images??[]).map(im=>({mimeType:im.mimeType,embedded:im.bufferView!==undefined,external:im.uri!==undefined}));
 if(result.issues.numErrors||result.issues.numWarnings)throw Error(name+': '+JSON.stringify(result.issues));
 if(name==='Misaki'&&coloured.length<2)throw Error('Missing face/hair vertex colours');
 if(images.some(im=>im.external))throw Error('External image dependency');
 const report={sha256:crypto.createHash('sha256').update(bytes).digest('hex'),
   bytes:bytes.length,validatorVersion:validator.version(),issues:result.issues,
   primitives:primitives.length,colouredPrimitives:coloured.length,
   vertexColourAccessors:coloured.map(p=>json.accessors[p.attributes.COLOR_0]),
   materials:json.materials.map(m=>({name:m.name,pbr:m.pbrMetallicRoughness})),images};
 if(report.sha256!==entry.sha256)throw Error('Manifest hash mismatch');
 reports[name]=report;
 console.log(`${name}: ${bytes.length} bytes; zero errors/warnings; ${coloured.length} vertex-colour primitives; ${images.length} embedded images`);
}
fs.writeFileSync(path.join(root,'docs/reviews/evidence/target-model-proof-v1/glb-validator.json'),JSON.stringify(reports,null,2)+'\n');
