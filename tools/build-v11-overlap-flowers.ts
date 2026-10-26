/** C33 one-inner-shoulder correction to C32 depth-bearing three-cluster gray sculpt. Same fixed C27 transform.
 * One high main cluster, lower unequal side clusters, overlapping convex lobed
 * surfaces rather than enlarged planar discs. No textures or camera-facing code. */
import fs from'node:fs';import{createHash}from'node:crypto';import{finishSculpt,sculptSweep}from'../src/art/sculpt-v10';import type{NativeSurface}from'../src/art/native-characters';import type{Geometry}from'../src/art/geometry';import type{V3}from'../src/art/recipes';
const out:NativeSurface[]=[],c=Math.cos(3.8),s=Math.sin(3.8),h:V3=[(c-s)*Math.SQRT1_2,0,(s+c)*Math.SQRT1_2],d:V3=[(c+s)*Math.SQRT1_2,0,(s-c)*Math.SQRT1_2];
const at=(u:number,y:number,z:number):V3=>[h[0]*u+d[0]*z,y,h[2]*u+d[2]*z];
const clusters=[{id:'main-high',u:.005,y:.685,d:-.015,r:.068},{id:'left-low-front',u:-.151,y:.580,d:.054,r:.058},{id:'right-low-back',u:.148,y:.550,d:-.062,r:.053}];
function branch(a:V3,b:V3,r:number){const mid=a.map((v,k)=>v+(b[k]-v)*.56)as V3;out.push({shape:'mesh',at:[0,0,0],geometry:sculptSweep([a,mid,b],[r,r*.84,r*.60],undefined,2,3),color:'#738C54',role:'wood'});}
// Only the inner shoulder of existing left/front lobe6 changes. Its branch,
// root, center, outer shoulder and every other lobe remain fixed.
function innerShoulder(u:number,v:number,dep:number,r:number,id:number):V3{
 if(id!==6)return at(u,v,dep);
 const smooth=(t:number)=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
 const w=smooth((u/r+.95)/.85)*smooth((v/r+.35)/.59);
 return at(u+.055*w,v+.075*w,dep-.020*w);
}
function head(center:V3,r:number,id:number){const g:Geometry&{uvs:number[]}={positions:[],indices:[],normals:[],uvs:[]},profiles=[[-.35,.30],[-.10,.87],[.24,1.02],[.55,.83],[.77,.30]],segments=8,phase=id*.61;
 for(let row=0;row<profiles.length;row++)for(let j=0;j<segments;j++){const a=j*Math.PI*2/segments+phase,scallop=j%2?.86:1.04,rad=r*profiles[row][1]*scallop,tilt=.11*Math.sin(id*.8);const u=rad*Math.cos(a),v=profiles[row][0]*r+.04*r*Math.sin(a*2+id),dep=rad*Math.sin(a)*(.82+.08*Math.sin(id));const point=innerShoulder(u,v+tilt*u,dep,r,id);g.positions.push(...point.map((v,k)=>v+center[k]));g.uvs.push(j/segments,row/4);}
 for(let row=0;row<4;row++)for(let j=0;j<segments;j++){const a=row*segments+j,b=row*segments+(j+1)%segments;g.indices.push(a,b,a+segments,b,b+segments,a+segments);}
 for(const row of[0,4]){const rim=g.positions.length/3;for(let j=0;j<segments;j++){g.positions.push(...g.positions.slice((row*segments+j)*3,(row*segments+j)*3+3));g.uvs.push(j/segments,row/4);}const n=g.positions.length/3;g.positions.push(...innerShoulder(0,profiles[row][0]*r,0,r,id).map((v,k)=>v+center[k]));g.uvs.push(.5,row/4);for(let j=0;j<segments;j++)g.indices.push(...(row===0?[n,rim+(j+1)%segments,rim+j]:[n,rim+j,rim+(j+1)%segments]));}
 finishSculpt(g);out.push({shape:'mesh',at:[0,0,0],geometry:g,color:'#EDE4D1',role:'paper',roughness:.96});
}
const placements=[[-.035,.038,-.030,.99],[.032,.014,-.003,.94],[.004,-.017,.043,1.02],[-.053,-.041,.026,.82],[.047,-.039,.042,.78]];
let id=0;for(const[k,cluster]of clusters.entries()){const base=at(0,.20,0),hub=at(cluster.u,cluster.y-.078,cluster.d);branch(base,hub,.0031);for(const[u,y,z,scale]of placements){const center=at(cluster.u+u*.62,cluster.y+y*.64,cluster.d+z*.74),r=cluster.r*scale;branch(hub,center.map((v,i)=>v+(i===1?-.30*r:0))as V3,.0018);head(center,r,id++);}}
const dir='assets/masters/native-v11/display-quality';fs.writeFileSync(dir+'/flower-spray-c33.json',JSON.stringify(out)+'\n');const triangles=out.reduce((n,p)=>n+(p.shape==='mesh'?p.geometry.indices.length/3:0),0);fs.writeFileSync(dir+'/flower-spray-c33-provenance.json',JSON.stringify({source:'tools/build-v11-overlap-flowers.ts',sourceSHA256:createHash('sha256').update(fs.readFileSync(import.meta.filename)).digest('hex'),scope:'Only same non-inventory C27 flower crown. Fixed normal-view basis is authored into real3D, never billboarded',clusters,primarySurfaces:15,triangles,correction:{previous:'C32',lobe:6,cluster:'left-low-front',only:'inner shoulder',displacementU:.055,displacementY:.075,displacementD:-.020,lowerRimFixed:true,branchRootsUnchanged:true},method:'Three rooted branch systems and overlapping closed rounded-shoulder lobed corollas with depth comparable to radius; one high main /two lower depth-staggered side masses, unequal openings. No texture/material-value work.',limits:'Gray normal480px/two-oblique independent gate open; closedness does not certify appearance'},null,2)+'\n');console.log({parts:out.length,triangles,clusters:clusters.length});
