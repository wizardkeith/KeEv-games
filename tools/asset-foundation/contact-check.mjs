/** Read actual GLB FLOAT positions through full glTF node transforms.
 * Contact gates check exported assets, not Blender control points or shadows. */
import {execFileSync} from 'node:child_process';import fs from 'node:fs';import assert from 'node:assert/strict';import crypto from 'node:crypto';
import {Matrix,Quaternion,Vector3} from '@babylonjs/core/Maths/math.vector.js';
const out=process.env.QA_OUTPUT||'docs/reviews/evidence/asset-foundation-v1-r2';fs.mkdirSync(out,{recursive:true});
function inspect(path){const bytes=fs.readFileSync(path),jsonLength=bytes.readUInt32LE(12),g=JSON.parse(bytes.subarray(20,20+jsonLength)),bin=bytes.subarray(28+jsonLength),bounds={};
 function visit(index,parent){const n=g.nodes[index],local=n.matrix?Matrix.FromArray(n.matrix):Matrix.Compose(Vector3.FromArray(n.scale??[1,1,1]),Quaternion.FromArray(n.rotation??[0,0,0,1]),Vector3.FromArray(n.translation??[0,0,0])),world=local.multiply(parent);
  if(n.mesh!==undefined){const key=n.extras?.component?.split('/').at(-1)??n.name,b=bounds[key]??={min:[Infinity,Infinity,Infinity],max:[-Infinity,-Infinity,-Infinity],triangles:0};
   for(const p of g.meshes[n.mesh].primitives){const a=g.accessors[p.attributes.POSITION],v=g.bufferViews[a.bufferView];assert.equal(a.componentType,5126);const start=(v.byteOffset??0)+(a.byteOffset??0),stride=v.byteStride??12;
    for(let i=0;i<a.count;i++){const q=Vector3.TransformCoordinates(new Vector3(...[0,1,2].map(k=>bin.readFloatLE(start+i*stride+k*4))),world).asArray();for(let k=0;k<3;k++){b.min[k]=Math.min(b.min[k],q[k]);b.max[k]=Math.max(b.max[k],q[k]);}}
    b.triangles+=g.accessors[p.indices].count/3;
   }
  }for(const child of n.children??[])visit(child,world);
 }
 for(const root of g.scenes[g.scene??0].nodes)visit(root,Matrix.Identity());return {sha256:crypto.createHash('sha256').update(bytes).digest('hex'),bounds,materials:g.materials.map(m=>({name:m.name,roughnessTexture:!!m.pbrMetallicRoughness?.metallicRoughnessTexture}))};
}
const set=inspect('public/assets/asset-foundation-v1/display-set.glb'),standalone={};
for(const key of ['table','cup','vase']){standalone[key]=inspect('public/assets/asset-foundation-v1/'+key+'.glb');assert.ok(Math.abs(standalone[key].bounds[key].min[1])<1e-6,key+' local origin contacts ground');}
const tableTop=set.bounds.table.max[1],contact={feet:set.bounds.table.min[1],cupBottom:set.bounds.cup.min[1],vaseBottom:set.bounds.vase.min[1],tableTop,cupGap:set.bounds.cup.min[1]-tableTop,vaseGap:set.bounds.vase.min[1]-tableTop};
assert.ok(Math.abs(contact.feet)<1e-6);assert.ok(Math.abs(contact.cupGap)<1e-6);assert.ok(Math.abs(contact.vaseGap)<1e-6);assert.equal(set.bounds.flowers.triangles,33124);assert.equal(Object.values(set.bounds).reduce((n,x)=>n+x.triangles,0),63592);
assert.ok(set.materials.filter(m=>m.name.includes('board')).every(m=>m.roughnessTexture));
function geometryFingerprint(bytes){const n=bytes.readUInt32LE(12),g=JSON.parse(bytes.subarray(20,20+n)),bin=bytes.subarray(28+n),h=crypto.createHash('sha256'),components={5121:1,5123:2,5125:4,5126:4},widths={SCALAR:1,VEC2:2,VEC3:3,VEC4:4};for(const m of g.meshes)for(const p of m.primitives)for(const index of [p.attributes.POSITION,p.attributes.NORMAL,p.indices]){const a=g.accessors[index],v=g.bufferViews[a.bufferView],width=components[a.componentType]*widths[a.type],stride=v.byteStride??width,start=(v.byteOffset??0)+(a.byteOffset??0);h.update(JSON.stringify({count:a.count,type:a.type,componentType:a.componentType}));for(let i=0;i<a.count;i++)h.update(bin.subarray(start+i*stride,start+i*stride+width));}return h.digest('hex');}
const preservedCeramics={};for(const key of ['cup','vase']){const old=execFileSync('git',['show','049dbf31d53436070bcdecadd0ca695ad91ff230:public/assets/asset-foundation-v1/'+key+'.glb'],{maxBuffer:10*1024*1024}),current=fs.readFileSync('public/assets/asset-foundation-v1/'+key+'.glb');const before=geometryFingerprint(old),after=geometryFingerprint(current);assert.equal(after,before,key+' curve/interior geometry retained exactly; only node contact translation changes');preservedCeramics[key]={geometrySha256:after,positionsNormalsIndicesUnchanged:true};}
const previewFloor=.079;const result={preservedCeramics,method:'Actual exported GLB positions transformed through standard node TRS/matrices; metre units. No shadow-based inference.',contact,gameplay:{previewRootY:previewFloor,floorY:previewFloor,feetY:previewFloor+contact.feet,cupBottomY:previewFloor+contact.cupBottom,tableTopY:previewFloor+tableTop},standalone,set,budget:{flowerTriangles:33124,setTriangles:63592,heads:35,petals:175,addedTriangles:0}};
fs.writeFileSync(out+'/contact-and-budget.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({contact,budget:result.budget},null,2));
