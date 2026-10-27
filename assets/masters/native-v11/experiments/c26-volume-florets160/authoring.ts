/** Original central gypsophila spray: purposeful whole-branch tiers and90 small
 * closed florets, not added generic scatter. The other two bouquets stay exact. */
import fs from 'node:fs';import {createHash} from 'node:crypto';import {sculptSweep,finishSculpt} from '../src/art/sculpt-v10';import {leaf} from '../src/art/shop-v11';import type {NativeSurface} from '../src/art/native-characters';import type {Geometry} from '../src/art/geometry';import type {V3} from '../src/art/recipes';
const out:NativeSurface[]=[],at=(a:V3,b:V3,t:number)=>a.map((v,k)=>v+(b[k]-v)*t)as V3;
const axes:V3[][]=[[[0,.19,0],[-.025,.38,.005],[-.12,.64,-.17]],[[.01,.19,-.01],[.035,.35,-.025],[.23,.55,.10]],[[-.01,.19,.015],[-.02,.34,.035],[-.04,.50,.16]]];
function stem(points:V3[],r:number,steps:number){out.push({shape:'mesh',at:[0,0,0],geometry:sculptSweep(points,points.map(()=>r),points.map(()=>r*.8),steps,3),color:'#738C54',role:'wood'});}
function floret(c:V3,r:number,seed:number){const g:Geometry={positions:[c[0],c[1]+r*.85,c[2],c[0],c[1]-r*.8,c[2]],normals:[],indices:[]};for(let ring=0;ring<2;ring++)for(let j=0;j<3;j++){const a=j/3*Math.PI*2+ring*.35+seed*.7;g.positions.push(c[0]+Math.cos(a)*r*(ring?.83:.96),c[1]+(ring?-.31:.34)*r,c[2]+Math.sin(a)*r*.83);}for(let j=0;j<3;j++){const u=2+j,un=2+(j+1)%3,l=5+j,ln=5+(j+1)%3;g.indices.push(0,u,un,1,ln,l,u,l,un,un,l,ln);}out.push({shape:'mesh',at:[0,0,0],geometry:finishSculpt(g),color:seed%3===0?'#F8EEDD':'#FFF5E5',role:'paint',roughness:.84});}
for(let i=0;i<3;i++)stem(axes[i],.0026,2);
const axisAt=(a:V3[],t:number)=>t<=.5?at(a[0],a[1],t*2):at(a[1],a[2],(t-.5)*2);
const connections=[];
for(let i=0;i<10;i++){
 const axis=axes[i%3],t=.47+Math.floor(i/3)*.15,root=axisAt(axis,t),angle=i*2.39996,spread=.035+(i%3)*.015;
 const fork:V3=[root[0]+Math.cos(angle)*spread,root[1]+.045+(i%2)*.018,root[2]+Math.sin(angle)*spread];stem([root,at(root,fork,.52),fork],.0018,2);
 for(let j=0;j<3;j++){const a=angle+(j-1)*1.2,tip:V3=[fork[0]+Math.cos(a)*(.028+j*.006),fork[1]+.035+(j%2)*.017,fork[2]+Math.sin(a)*(.028+j*.006)];stem([fork,tip],.0011,1);connections.push(tip);for(let k=0;k<3;k++){const delta=[[0,0,0],[.010,.003,0],[-.008,.003,.007],[.002,-.001,-.010]][k],c=tip.map((v,l)=>v+delta[l])as V3;floret(c,.014+(i%3)*.002,j+i*3+k);}}
}
for(let i=0;i<4;i++){const p=axisAt(axes[i%3],.48+i*.045);out.push(leaf(p,.090,.047,i*2.4,.92,'#91A665'));}
// Authored dominant crown: wider asymmetric negative-space groups, supported
// by the enlarged neck. Keep all physical stem/floret connections.
for(const c of connections){c[0]*=1.55;c[1]=c[1]*1.10+.02;c[2]*=1.55;}
for(const p of out)if(p.shape==='mesh'){const center=[0,1,2].map(k=>p.geometry.positions.filter((_,i)=>i%3===k).reduce((a,b)=>a+b,0)/(p.geometry.positions.length/3));p.geometry.positions=p.geometry.positions.map((v,i)=>{const k=i%3,f=k===1?1.10:1.55,shift=k===1?.02:0;return p.role==='paint'?center[k]*f+shift+(v-center[k])*(k===1?1.10:1.15):v*f+shift;});p.geometry=finishSculpt(p.geometry);}
const dir='assets/masters/native-v11/display-quality';fs.writeFileSync(dir+'/flower-spray.json',JSON.stringify(out)+'\n');const triangles=out.reduce((n,p)=>n+(p.shape==='mesh'?p.geometry.indices.length/3:0),0);fs.writeFileSync(dir+'/flower-spray-provenance.json',JSON.stringify({source:'tools/build-v11-display-flowers.ts',sourceSHA256:createHash('sha256').update(fs.readFileSync(import.meta.filename)).digest('hex'),scope:'ONLY existing central non-stock bouquet upper structure; old two arrangements and all inventory unchanged',method:'Three authored branch axes ->10 grouped forks ->30 real three-blossom twig ends ->90 small closed3D blossom volumes; individual petals approximated at normal-game scale,4 leaves. No random frame spawning, sprites, scene image or simulated sale.',triangles,florets:90,stemConnections:connections,units:'metres RH Y-up; Blend master generated from exact JSON separately',limits:'New whole-bouquet silhouette; target-level acceptance pending actual game comparison'},null,2)+'\n');console.log({triangles,parts:out.length});
