/** Same original60 florets/300 closed petals. Only normals change; no mesh,
 * silhouette, placement, density, texture, stock or camera alteration. */
import fs from 'node:fs';import {createHash} from 'node:crypto';
const dir='assets/masters/native-v11/display-quality',raw=fs.readFileSync(dir+'/flower-spray.json'),parts=JSON.parse(raw.toString())as {role:string;geometry:{positions:number[];normals:number[];indices:number[]}}[],patches:{part:number;normals:number[]}[]=[];
const dot=(a:number[],b:number[])=>a.reduce((s,v,k)=>s+v*b[k],0),unit=(v:number[])=>{const n=Math.hypot(...v);if(n<1e-12)throw Error('degenerate petal normal');return v.map(x=>x/n);};
for(const[part,p]of parts.entries())if(p.role==='paint'){
 const g=p.geometry,normals=[...g.normals];if(g.positions.length!==180||g.indices.length!==60)throw Error('original five closed tetrahedral petals required');
 for(let petal=0;petal<5;petal++){
  const start=petal*36,points=Array.from({length:12},(_,i)=>g.positions.slice(start+i*3,start+i*3+3)),unique=[...new Map(points.map(v=>[v.map(x=>x.toFixed(9)).join(','),v])).values()];if(unique.length!==4)throw Error('original tetrahedron changed');
  const center=[0,1,2].map(k=>unique.reduce((s,p)=>s+p[k],0)/4),a=g.normals.slice(start,start+3),b=g.normals.slice(start+9,start+12),plane=unit(a.map((v,k)=>v+b[k]));
  for(let i=0;i<12;i++){const face=g.normals.slice(start+Math.floor(i/3)*9,start+Math.floor(i/3)*9+3),sign=dot(face,plane)>=0?1:-1,r=points[i].map((v,k)=>v-center[k]),height=dot(r,plane),tangent=r.map((v,k)=>v-plane[k]*height),len=Math.hypot(...tangent),n=unit(plane.map((v,k)=>v*sign+(len?tangent[k]/len:0)*.15));for(let k=0;k<3;k++)normals[start+i*3+k]=n[k];}
 }
 patches.push({part,normals});
}
if(patches.length!==60)throw Error('existing60florets only');const bytes=JSON.stringify(patches)+'\n';fs.writeFileSync(dir+'/flower-petal-soft-normals.json',bytes);fs.writeFileSync(dir+'/flower-petal-soft-normals-provenance.json',JSON.stringify({source:'tools/build-v11-petal-normals.ts',sourceSHA256:createHash('sha256').update(fs.readFileSync(import.meta.filename)).digest('hex'),original:dir+'/flower-spray.json',originalSHA256:createHash('sha256').update(raw).digest('hex'),outputSHA256:createHash('sha256').update(bytes).digest('hex'),method:'Per original tetrahedral petal, preserve every position/index. Average the two upper face normals into a petal plane; signed top/bottom normals bend15% toward the perimeter. No extra petals, vertices, geometry, albedo or alpha. Original hard-normal JSON/Blend retained.',florets:60,petals:300,positionsAndIndicesUnchanged:true,limits:'Shading-normal candidate; actual normal-game comparison required, not a curvature/target acceptance claim'},null,2)+'\n');console.log({florets:patches.length,petals:300,bytes:bytes.length});
