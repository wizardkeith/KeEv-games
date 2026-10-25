import {unwrapMetres} from './metre-uv-v11';
import {rebuildV11Female} from './customer-female-v11';
import {rebuildV11Male} from './customer-male-v11';
import {rebuildV11Misaki} from './character-v11';
/** Native v3 original character authoring. Metres; RH +Y up, face -Z.
 * All node translations are LOCAL to the named parent. All surfaces are LOCAL
 * to their node. A rigid articulated hierarchy, deliberately no skin/clip claims.
 */
import {sculptTangents} from './sculpt-v10';
import {buildV10Character} from './characters-v10';
import {geometry,type Geometry} from './geometry';
import type {MaterialRole} from './materials';
import {nativeMaterialIntent} from './native-materials';
import type {Part,V3} from './recipes';
export type NativeCharacterKind='misaki'|'visitor-a'|'visitor-b';
export interface NativeMesh {shape:'mesh';at:V3;color:string;role:MaterialRole;geometry:Geometry&{uvs?:number[]};alpha?:number;roughness?:number;baseColorTexture?:string;}
export type NativePrimitive=Part&{roughness?:number;baseColorTexture?:string};
export type NativeSurface=NativePrimitive|NativeMesh;
export interface NativePart {id:string;parent?:string;pivot:V3;recipe:NativeSurface[];}
export const nativeCharacterIdentity={version:'native-characters-v11-target-slice-r1',misaki:{id:'actor.misaki.native.v3',economicBinding:'staff.graybox'},'visitor-a':{id:'actor.visitor-a.native.v3',economicBinding:null},'visitor-b':{id:'actor.visitor-b.native.v3',economicBinding:null}} as const;
const P={skin:'#F0C9B0',skinB:'#E1B99D',blush:'#D99D91',hair:'#654735',hairLight:'#87634C',sage:'#89A189',sageDark:'#607B6A',cream:'#F5EBDD',ivory:'#F1E6CF',plum:'#785A70',ink:'#57413D',shoe:'#59483F',sole:'#8C7764',terracotta:'#B77F62',blue:'#748F9D',trousers:'#555E61'};
const p=(shape:Part['shape'],size:V3,at:V3,color:string,role:MaterialRole='fabric',extra:Partial<NativePrimitive>={}):NativePrimitive=>({shape,size,at,color,role,...extra});
const round=(size:V3,at:V3,color:string,role:MaterialRole='fabric',radius=.014)=>p('round',size,at,color,role,{radius});
interface Ring {y:number;x:number;z:number;cx?:number;cz?:number;}
/** Smooth indexed loft with a controllable silhouette, cheek/jaw taper and broad
 * authored garment folds. Smooth normals are derived from the actual mesh. */
function loft(rings:Ring[],segments=24,pleat=0,phase=0):Geometry {
 if(rings[0].y>rings[rings.length-1].y)rings=[...rings].reverse();
 const controls=rings;
 rings=[];
 for(let i=0;i<controls.length-1;i++)for(let step=0;step<2;step++){
  const t=step/2,a=controls[Math.max(0,i-1)],b=controls[i],c=controls[i+1],d=controls[Math.min(controls.length-1,i+2)],r:Ring={y:b.y+(c.y-b.y)*t,x:0,z:0};
  for(const k of ['x','z','cx','cz'] as const){const v0=a[k]??0,v1=b[k]??0,v2=c[k]??0,v3=d[k]??0,m1=(v2-v0)*.5,m2=(v3-v1)*.5;r[k]=(2*t*t*t-3*t*t+1)*v1+(t*t*t-2*t*t+t)*m1+(-2*t*t*t+3*t*t)*v2+(t*t*t-t*t)*m2;if(k==='x'||k==='z')r[k]=Math.max(.001,r[k]!);}
  rings.push(r);
 }
 rings.push(controls[controls.length-1]);
 const g:Geometry={positions:[],normals:[],indices:[]};
 for(const r of rings)for(let j=0;j<segments;j++){const a=j*Math.PI*2/segments,fold=1+pleat*Math.cos(a*6+phase);g.positions.push((r.cx??0)+Math.cos(a)*r.x*fold,r.y,(r.cz??0)+Math.sin(a)*r.z*fold);}
 const tri=(a:number,b:number,c:number)=>{g.indices.push(a,b,c);};
 for(let i=0;i<rings.length-1;i++)for(let j=0;j<segments;j++){const a=i*segments+j,b=i*segments+(j+1)%segments,c=(i+1)*segments+j,d=(i+1)*segments+(j+1)%segments;tri(a,c,b);tri(b,c,d);}
 for(const end of [0,rings.length-1]){const r=rings[end],center=g.positions.length/3;g.positions.push(r.cx??0,r.y,r.cz??0);const cap=g.positions.length/3;for(let j=0;j<segments;j++)g.positions.push(...g.positions.slice((end*segments+j)*3,(end*segments+j)*3+3));for(let j=0;j<segments;j++){const a=cap+j,b=cap+(j+1)%segments;if(end===0)tri(center,a,b);else tri(center,b,a);}}
 g.normals=Array(g.positions.length).fill(0);
 for(let i=0;i<g.indices.length;i+=3){const [a,b,c]=g.indices.slice(i,i+3).map(x=>x*3),u=[0,1,2].map(k=>g.positions[b+k]-g.positions[a+k]),v=[0,1,2].map(k=>g.positions[c+k]-g.positions[a+k]),n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];for(const q of [a,b,c])for(let k=0;k<3;k++)g.normals[q+k]+=n[k];}
 for(let i=0;i<g.normals.length;i+=3){const l=Math.hypot(...g.normals.slice(i,i+3));if(!l)throw Error('native loft zero normal');for(let k=0;k<3;k++)g.normals[i+k]/=l;}
 return g;
}
function mesh(rings:Ring[],color:string,role:MaterialRole,at:V3=[0,0,0],pleat=0,phase=0,segments=16):NativeMesh{return {shape:'mesh',at,color,role,geometry:loft(rings,segments,pleat,phase)};}
/** A tapered curved hair lock is a loft around a deliberately authored curve,
 * rather than overlapping spheres. */
function lock(points:Ring[],color=P.hair):NativeMesh{return mesh(points,color,'hair');}
/** Continuous bob shell with an open face, a shaped nape and real 8mm edge
 * thickness. Both Web and GLB use these vertices; no camera-facing hair cards. */
function smoothNormals(g:Geometry):Geometry {
 g.normals=Array(g.positions.length).fill(0);
 for(let i=0;i<g.indices.length;i+=3){const ids=g.indices.slice(i,i+3).map(n=>n*3),[a,b,c]=ids,u=[0,1,2].map(k=>g.positions[b+k]-g.positions[a+k]),v=[0,1,2].map(k=>g.positions[c+k]-g.positions[a+k]),n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];for(const q of ids)for(let k=0;k<3;k++)g.normals[q+k]+=n[k];}
 for(let i=0;i<g.normals.length;i+=3){const n=Math.hypot(...g.normals.slice(i,i+3));for(let k=0;k<3;k++)g.normals[i+k]/=n||1;}
 return g;
}
/** Closed sculpted shell: the fringe is the same surface as the crown, with
 * broad flowing ridges, an asymmetric part and a softly scalloped bob edge. */
function bob(width:number,color:string):NativeMesh {
 const g:Geometry={positions:[],normals:[],indices:[]},segments=48,outerRows=14,innerRows=1,outerCount=(outerRows+1)*segments;
 // The hidden inner lining needs only two longitudinal spans. This keeps the
 // original per-actor budget while spending vertices on the visible silhouette.
 for(let layer=0;layer<2;layer++){const rows=layer?innerRows:outerRows;
  for(let i=0;i<=rows;i++)for(let j=0;j<segments;j++){
   const a=j*Math.PI*2/segments,front=Math.max(0,Math.min(1,(-Math.sin(a)+.05)/.76)),sweep=.20*Math.cos(a)*front;
   const sweptBang=.23*Math.exp((Math.cos(a-4.28)-1)/.045)*front;
   const end=sweptBang+2.48-front*(1.24+.22*Math.cos(a+.65))+sweep*.45+.045*Math.sin(a*5)*(1-front*.8),t=.025+(1-i/rows)*end;
   const strand=(layer?0:.008)*Math.cos(a*9+t*1.8+.45*Math.sin(a))*Math.sin(t)**2,edge=layer*.009;
   const profile=t<1.6?Math.sin(t):Math.sin(1.6)-.24*(t-1.6);
   g.positions.push(Math.cos(a)*profile*(width*1.07-edge+strand),.18+Math.cos(t)*(.21+Math.max(0,t-1.6)*.045-edge),.024+Math.sin(a)*profile*(.219-edge+strand));
  }
 }
 for(let layer=0;layer<2;layer++){const rows=layer?innerRows:outerRows,offset=layer?outerCount:0;
  for(let i=0;i<rows;i++)for(let j=0;j<segments;j++){const a=offset+i*segments+j,b=offset+i*segments+(j+1)%segments,c=a+segments,d=b+segments;g.indices.push(...(layer?[a,b,c,b,d,c]:[a,c,b,b,c,d]));}
 }
 const rim=g.positions.length/3;for(let j=0;j<segments;j++){g.positions.push(...g.positions.slice(j*3,j*3+3),...g.positions.slice((j+outerCount)*3,(j+outerCount)*3+3));}for(let j=0;j<segments;j++){const a=rim+j*2,b=rim+(j+1)%segments*2;g.indices.push(a,b,a+1,b,b+1,a+1);}
 for(let layer=0;layer<2;layer++){const center=g.positions.length/3,offset=layer?outerCount+innerRows*segments:outerRows*segments;g.positions.push(0,.391-layer*.009,.028);for(let j=0;j<segments;j++){const a=offset+j,b=offset+(j+1)%segments;g.indices.push(...(layer?[center,a,b]:[center,b,a]));}}
 return {shape:'mesh',at:[0,0,0],color,role:'hair',geometry:smoothNormals(g),roughness:.60};
}
/** Thin closed fabric panel follows the front of the dress; the rounded hem
 * and subtle broad folds are geometry, with no oval end caps or rigid slab. */
function apron():NativeMesh {
 const g:Geometry={positions:[],normals:[],indices:[]},columns=16;
 const rows=[{y:.365,w:.180,z:-.253},{y:.395,w:.192,z:-.251},{y:.490,w:.184,z:-.233},{y:.590,w:.166,z:-.191},{y:.690,w:.145,z:-.142},{y:.783,w:.133,z:-.134}];
 for(let side=0;side<2;side++)for(let r=0;r<rows.length;r++)for(let c=0;c<=columns;c++){
  const u=c/columns*2-1,p=rows[r],fold=.0035*Math.cos(u*Math.PI*3)*(r<4?1:.25);
  g.positions.push(u*p.w,p.y+(r===0?.016*Math.pow(u,4):0),p.z+.045*u*u+fold+side*.006);
 }
 const stride=columns+1,count=rows.length*stride;
 for(let side=0;side<2;side++)for(let r=0;r<rows.length-1;r++)for(let c=0;c<columns;c++){const a=side*count+r*stride+c,b=a+1,d=a+stride,e=d+1;g.indices.push(...(side?[a,b,d,b,e,d]:[a,d,b,b,d,e]));}
 const bridge=(a:number,b:number)=>g.indices.push(a,b,a+count,b,b+count,a+count);
 for(let c=0;c<columns;c++){bridge(c+1,c);bridge((rows.length-1)*stride+c,(rows.length-1)*stride+c+1);}
 for(let r=0;r<rows.length-1;r++){bridge(r*stride,(r+1)*stride);bridge((r+1)*stride+columns,r*stride+columns);}
 return {shape:'mesh',at:[0,0,0],role:'fabric',color:P.ivory,roughness:.91,geometry:smoothNormals(g)};
}
export function nativeSurfaceGeometry(surface:NativeSurface):Geometry & {uvs?:number[]} {
 if(surface.shape!=='mesh'){const g=geometry(surface),uvs:number[]=[];for(let i=0;i<g.positions.length;i+=3){const [x,y,z]=g.positions.slice(i,i+3),[nx,ny,nz]=g.normals.slice(i,i+3).map(Math.abs);uvs.push(...(ny>=nx&&ny>=nz?[x,z]:nx>=nz?[z,y]:[x,y]));}return {...g,uvs};}
 const authoredUV=surface.geometry.uvs;const g={positions:surface.geometry.positions.map((x,i)=>x+surface.at[i%3]),normals:[...surface.geometry.normals],indices:[...surface.geometry.indices],uvs:authoredUV?[...authoredUV]:[] as number[]};
 if(surface.role==='hair'&&surface.roughness===.60){
  if(!authoredUV)for(let i=0;i<g.positions.length;i+=3)g.uvs.push(Math.atan2(g.positions[i+2]-.028,g.positions[i])/(Math.PI*2)+.5,(g.positions[i+1]+.06)/.46);
  // Split wrap-crossing triangles without changing any rendered positions or
  // topology. Both Web and standard glTF receive these same seam vertices.
  const shifted=new Map<number,number>();
  for(let i=0;i<g.indices.length;i+=3){const ids=g.indices.slice(i,i+3),u=ids.map(n=>g.uvs[n*2]);if(Math.max(...u)-Math.min(...u)>.5)for(let k=0;k<3;k++){const n=ids[k];if(g.uvs[n*2]<.5){let copy=shifted.get(n);if(copy===undefined){copy=g.positions.length/3;g.positions.push(...g.positions.slice(n*3,n*3+3));g.normals.push(...g.normals.slice(n*3,n*3+3));g.uvs.push(g.uvs[n*2]+1,g.uvs[n*2+1]);shifted.set(n,copy);}g.indices[i+k]=copy;}}}
  // A cylindrical pole has no unique u. Give each cap triangle its own pole
  // corner at the adjacent strand mean, rather than stretching a wrap seam.
  if(!authoredUV)for(let i=0;i<g.indices.length;i+=3)for(let k=0;k<3;k++){const n=g.indices[i+k];if(Math.hypot(g.positions[n*3],g.positions[n*3+2]-.028)<1e-10){const a=g.indices[i+(k+1)%3],b=g.indices[i+(k+2)%3],copy=g.positions.length/3;g.positions.push(...g.positions.slice(n*3,n*3+3));g.normals.push(...g.normals.slice(n*3,n*3+3));g.uvs.push((g.uvs[a*2]+g.uvs[b*2])/2,g.uvs[n*2+1]);g.indices[i+k]=copy;}}
 }
 if(!authoredUV&&surface.role==='fabric')return unwrapMetres(g);
 return {...g,...(!g.uvs.length?{uvs:undefined}:{})};
}
export function nativeGrouped(recipe:NativeSurface[]){
 const groups=new Map<string,{role:MaterialRole;materialId:string;color:string;alpha:number;roughness:number;baseColorTexture?:string;geometry:Geometry & {uvs:number[];tangents?:number[]}} >();
 for(const surface of recipe){const role=surface.role??'paint',alpha=surface.alpha??1,intent=nativeMaterialIntent(surface),key=intent.materialId;let group=groups.get(key);if(!group){group={role,materialId:key,color:surface.color,alpha,roughness:intent.roughness,...(surface.baseColorTexture?{baseColorTexture:surface.baseColorTexture}:{}),geometry:{positions:[],normals:[],indices:[],uvs:[]}};groups.set(key,group);}const a=nativeSurfaceGeometry(surface),offset=group.geometry.positions.length/3;group.geometry.positions.push(...a.positions);group.geometry.normals.push(...a.normals);group.geometry.indices.push(...a.indices.map(x=>x+offset));group.geometry.uvs!.push(...(a.uvs??Array(a.positions.length/3*2).fill(0)));}
 for(const g of groups.values())if(g.role==='fabric'||g.role==='hair'&&g.roughness===.60)g.geometry.tangents=sculptTangents(g.geometry);
 return [...groups.values()];
}
function eyes(kind:NativeCharacterKind):NativePart[]{
 const wider=kind==='visitor-b',skin=kind==='visitor-a'?P.skinB:P.skin,out:NativePart[]=[];
 for(const side of [-1,1]){const x=side*(wider?.083:.074),s=side<0?'left':'right',y=kind==='visitor-a'?.155:.16;
  out.push({id:`eye-${s}`,parent:'head',pivot:[x,y,-.171],recipe:[p('sphere',[.086,.086,.006],[0,0,0],'#F2E8DB','ink'),p('sphere',[.060,.076,.008],[side*-.003,0,-.007],kind==='visitor-a'?'#554332':'#92633D','ink'),p('sphere',[.031,.049,.008],[side*-.003,.004,-.012],'#3F3330','ink'),p('sphere',[.016,.018,.004],[-.009,.015,-.020],'#FFF4DF','ink'),p('torus',[.083,.0045,.060],[0,0,-.013],P.ink,'hair',{turn:[Math.PI/2,0,0],arc:[Math.PI*1.05,Math.PI*1.95],segments:8})].map(surface=>surface.shape==='sphere'?{...surface,turn:[0,-side*.28,0] as V3}:surface)});
  out.push({id:`eyelid-${s}`,parent:'head',pivot:[x,y+.005,-.169],recipe:[p('torus',[.074,.004,.018],[0,0,0],P.ink,'ink',{turn:[Math.PI/2,-side*.28,0],arc:[Math.PI*.12,Math.PI*.88],segments:10})]});
  out.push({id:`brow-${s}`,parent:'head',pivot:[x,y+.047,-.165],recipe:[p('torus',[.063,.0035,.021],[0,0,0],kind==='visitor-a'?'#423D36':P.hair,'hair',{turn:[Math.PI/2,0,0],arc:[Math.PI*1.12,Math.PI*1.88],segments:6})]});
 }
 return out;
}
function head(kind:NativeCharacterKind):NativePart[]{
 const misaki=kind==='misaki',a=kind==='visitor-a',skin=a?P.skinB:P.skin,w=a?.174:kind==='visitor-b'?.204:.193;
 const face:NativeSurface[]=[mesh([{y:-.025,x:.078,z:.075,cz:-.004},{y:.025,x:w*.76,z:.122,cz:-.012},{y:.090,x:w*.94,z:.164},{y:.170,x:w,z:.177},{y:.250,x:w*.94,z:.167},{y:.315,x:w*.72,z:.126},{y:.342,x:.045,z:.042}],skin,'skin'),p('sphere',[.018,.025,.016],[0,.114,-.173],skin,'skin'),...[-1,1].flatMap(side=>[p('sphere',[.045,.077,.031],[side*w,.139,.005],skin,'skin'),p('sphere',[.035,.012,.004],[side*.122,.093,-.150],P.blush,'skin')])];
 // Curved upper head silhouette; front hairline is a shaped canopy plus locks.
 const hair=a?'#3F3B35':misaki?P.hair:'#55473F';
 face.push(a?mesh([{y:.207,x:w*1.03,z:.198,cz:.020},{y:.295,x:w*1.04,z:.192,cz:.012},{y:.361,x:w*.78,z:.133,cz:.012},{y:.384,x:.031,z:.028}],hair,'hair'):bob(w,hair));
 if(misaki){
  face.push(p('sphere',[.069,.024,.013],[.195,.250,-.110],P.ivory,'fabric',{turn:[0,-.30,-.55]}),p('sphere',[.048,.022,.012],[.209,.272,-.105],P.ivory,'fabric',{turn:[0,-.30,.75]}));
  // Two tapered temple sweeps emerge inside the same crown, with the same
  // material/UV intent. Reallocate tiny button triangles to these visible locks.
  face.push({...lock([{y:.340,x:.036,z:.019,cx:-.05,cz:-.114},{y:.290,x:.035,z:.014,cx:-.073,cz:-.16},{y:.235,x:.028,z:.011,cx:-.112,cz:-.178},{y:.190,x:.004,z:.005,cx:-.155,cz:-.133}],hair),roughness:.60},
   {...lock([{y:.340,x:.025,z:.019,cx:.05,cz:-.115},{y:.285,x:.027,z:.014,cx:.10,cz:-.153},{y:.225,x:.019,z:.010,cx:.163,cz:-.112},{y:.175,x:.003,z:.005,cx:.194,cz:-.055}],hair),roughness:.60});
 }else if(a){
  for(let i=0;i<7;i++){const cx=(i-3)*.047;face.push(lock([{y:.344,x:.039,z:.039,cx,cz:-.105},{y:.291+(i%2)*.017,x:.046,z:.034,cx:cx-.008,cz:-.157},{y:.250+(i%2)*.016,x:.018,z:.018,cx:cx+.012,cz:-.165}],i%3===0?'#51483D':hair));}
 }else{
  face.push(lock([{y:.348,x:.071,z:.036,cx:-.063,cz:-.128},{y:.277,x:.090,z:.040,cx:-.094,cz:-.166},{y:.213,x:.041,z:.029,cx:-.164,cz:-.129},{y:.171,x:.009,z:.010,cx:-.190,cz:-.080}],hair),lock([{y:.321,x:.054,z:.029,cx:.117,cz:-.125},{y:.225,x:.056,z:.035,cx:.171,cz:-.117},{y:.092,x:.046,z:.029,cx:.203,cz:-.014},{y:-.047,x:.027,z:.018,cx:.208,cz:.035},{y:-.085,x:.007,z:.009,cx:.180,cz:.061}],hair));
 }
 const parts:NativePart[]=[{id:'head',parent:'body',pivot:[0,1.250,0],recipe:face},...eyes(kind)];
 // Mouth is independently posed without swapping face/head silhouette.
 parts.push({id:'mouth',parent:'head',pivot:[0,.067,-.157],recipe:[p('torus',[.051,.007,.035],[0,0,0],'#A36D67','ink',{turn:[Math.PI/2,0,0],arc:[Math.PI*.12,Math.PI*.88],segments:16})]});
 for(const side of [-1,1]){const s=side<0?'left':'right';parts.push({id:`hair-secondary-${s}`,parent:'head',pivot:[side*.177,.214,.048],recipe:[lock([{y:.020,x:.022,z:.044},{y:-.070,x:.036,z:.046,cx:side*.012},{y:-.139,x:.026,z:.035,cx:side*.006},{y:-.170,x:.005,z:.008,cx:side*-.008}],hair)]});}
 // A little more face volume keeps the original identities legible at the
 // normal 40-degree camera, while preserving every articulation and rest pivot.
 for(const part of parts){if(part.parent==='head')part.pivot=part.pivot.map(v=>v*1.055) as V3;part.recipe=part.recipe.map(surface=>surface.shape==='mesh'?{...surface,at:surface.at.map(v=>v*1.055) as V3,geometry:{...surface.geometry,positions:surface.geometry.positions.map(v=>v*1.055)}}:{...surface,size:surface.size.map(v=>v*1.055) as V3,at:surface.at.map(v=>v*1.055) as V3});}
 return parts;
}
function body(kind:NativeCharacterKind):NativeSurface[]{
 const misaki=kind==='misaki',a=kind==='visitor-a',coat=misaki?P.sage:a?P.terracotta:P.blue;
 const torso:NativeSurface[]=[mesh([{y:.640,x:.153,z:.106},{y:.739,x:.167,z:.118},{y:.946,x:.183,z:.120},{y:1.065,x:.204,z:.112},{y:1.112,x:.190,z:.103},{y:1.155,x:.130,z:.080},{y:1.178,x:.064,z:.065}],coat,'fabric',[0,0,0],.016,.4),mesh([{y:.790,x:.075,z:.018,cz:-.123},{y:.960,x:.081,z:.020,cz:-.127},{y:1.105,x:.076,z:.016,cz:-.112},{y:1.153,x:.047,z:.012,cz:-.072}],P.cream,'fabric'),p('cylinder',[.10,.103,.10],[0,1.180,0],a?P.skinB:P.skin,'skin',{top:1})];
 // The upper layer is a continuous cardigan. A fitted blouse sits just in
 // front, under the waist apron; no disconnected lapels or rectangular straps.
 if(!misaki)for(const side of [-1,1]){
  torso.push(mesh([{y:.803,x:.040,z:.018,cx:side*.120,cz:-.128},{y:1.037,x:.064,z:.022,cx:side*.110,cz:-.135},{y:1.126,x:.036,z:.023,cx:side*.073,cz:-.110}],coat,'fabric'),round([.070,.054,.027],[side*.067,1.105,-.126],P.cream,'fabric',.008));
 }
 if(misaki){
  for(const side of [-1,1])torso.push(mesh([{y:1.086,x:.021,z:.006,cx:side*.058,cz:-.135},{y:1.121,x:.033,z:.010,cx:side*.047,cz:-.121},{y:1.158,x:.025,z:.010,cx:side*.035,cz:-.088},{y:1.172,x:.008,z:.006,cx:side*.032,cz:-.071}],P.cream,'fabric',[0,0,0],0,0,4));
  torso.push(mesh([{y:.305,x:.267,z:.234},{y:.350,x:.274,z:.242},{y:.490,x:.252,z:.222},{y:.620,x:.194,z:.153},{y:.750,x:.152,z:.109}],P.plum,'fabric',[0,0,0],.035));
  torso.push(apron());
  for(const y of [1.104,1.045,.986,.927,.868])torso.push(p('cylinder',[.012,.004,.012],[0,y,-.150],'#B3A181','metal',{turn:[Math.PI/2,0,0],top:1}));
  // Thin continuous waistband; rounded pocket follows the apron front.
  torso.push(mesh([{y:.768,x:.151,z:.116},{y:.779,x:.154,z:.119},{y:.796,x:.151,z:.116}],P.cream,'fabric'),round([.103,.084,.009],[.058,.579,-.205],'#E4D6BD','fabric',.017),round([.100,.006,.010],[.058,.621,-.187],P.cream,'fabric',.003));
 }else if(a){
  torso.push(mesh([{y:.624,x:.156,z:.103},{y:.702,x:.165,z:.110}],P.trousers,'fabric'),round([.110,.106,.020],[-.114,.923,-.145],'#AA7055','fabric',.009),round([.102,.017,.023],[-.114,.974,-.147],'#D0A088','fabric',.004));
  torso.push(p('round',[.027,.590,.026],[.050,.967,-.156],'#C8B595','fabric',{radius:.004,turn:[0,0,.52]}),round([.212,.203,.087],[.212,.711,-.076],'#D6C5A3','fabric',.022),round([.212,.026,.091],[.212,.810,-.076],'#B3A180','fabric',.007));
 }else{
  // Fuller A-line profile is checked against all actual thigh vertices through
  // planted walking, stop/recenter and turns. Both full legs remain authored.
  torso.push(mesh([{y:.225,x:.245,z:.230},{y:.270,x:.255,z:.240},{y:.484,x:.235,z:.230},{y:.600,x:.202,z:.200},{y:.722,x:.153,z:.109}],P.cream,'fabric',[0,0,0],.065),round([.25,.073,.272],[0,1.123,-.014],P.plum,'fabric',.018),round([.073,.234,.031],[.098,1.013,-.139],P.plum,'fabric',.012));
  torso.push(p('round',[.022,.555,.025],[-.050,.936,-.167],'#88725F','fabric',{radius:.004,turn:[0,0,-.52]}),round([.175,.201,.091],[-.219,.683,-.064],'#8C7661','fabric',.021),round([.177,.038,.095],[-.219,.773,-.064],'#6F5E51','fabric',.012));
 }
 return torso;
}
export function legacyV9CharacterParts(kind:NativeCharacterKind):NativePart[]{
 const misaki=kind==='misaki',a=kind==='visitor-a',coat=misaki?P.sage:a?P.terracotta:P.blue,skin=a?P.skinB:P.skin;
 const parts:NativePart[]=[{id:'body',pivot:[0,0,0],recipe:body(kind)},...head(kind)];
 for(const side of [-1,1]){const s=side<0?'left':'right',x=side*.222;
  parts.push({id:`arm-${s}`,parent:'body',pivot:[x,1.100,0],recipe:[mesh([{y:-.220,x:.048,z:.048,cx:side*.007},{y:-.177,x:.058,z:.057,cx:side*.008},{y:-.060,x:.066,z:.060},{y:.020,x:.064,z:.060,cx:side*-.012},{y:.057,x:.040,z:.041,cx:side*-.032},{y:.065,x:.008,z:.012,cx:side*-.044}],coat,'fabric',[0,0,0],.025,.7),mesh([{y:-.225,x:.045,z:.045,cx:side*.006},{y:-.217,x:.058,z:.058,cx:side*.006},{y:-.188,x:.060,z:.059,cx:side*.006},{y:-.177,x:.052,z:.052,cx:side*.006}],misaki?'#8FA38E':a?'#BE8B6D':'#829BA5','fabric')]});
  parts.push({id:`forearm-${s}`,parent:`arm-${s}`,pivot:[side*.007,-.220,0],recipe:[mesh([{y:-.168,x:.036,z:.036},{y:-.110,x:.045,z:.043},{y:.012,x:.047,z:.045}],misaki?skin:coat,misaki?'skin':'fabric')]});
  parts.push({id:`hand-${s}`,parent:`forearm-${s}`,pivot:[0,-.168,0],recipe:[round([.073,.089,.048],[0,-.028,-.004],skin,'skin',.021),p('sphere',[.030,.051,.031],[side*-.036,-.021,-.010],skin,'skin')]});
  parts.push({id:`socket-${s}`,parent:`hand-${s}`,pivot:[0,-.021,-.043],recipe:[]});
  parts.push({id:`leg-${s}`,parent:'body',pivot:[side*.100,.650,0],recipe:[mesh([{y:-.251,x:.055,z:.057},{y:-.112,x:.062,z:.063},{y:0,x:.069,z:.069}],a?P.trousers:skin,a?'fabric':'skin')]});
  parts.push({id:`shin-${s}`,parent:`leg-${s}`,pivot:[0,-.250,0],recipe:[mesh([{y:-.289,x:.045,z:.045},{y:-.230,x:.049,z:.049},{y:0,x:.052,z:.054}],a?P.trousers:P.cream,'fabric')]});
  parts.push({id:`foot-${s}`,parent:`shin-${s}`,pivot:[0,-.300,0],recipe:[a?p('round',[.124,.081,.209],[0,-.036,-.034],'#D8D0BB','fabric',{radius:.026}):{...mesh([{y:-.075,x:.053,z:.090,cz:-.034},{y:-.060,x:.064,z:.106,cz:-.034},{y:-.025,x:.059,z:.097,cz:-.031},{y:.005,x:.041,z:.066,cz:-.015}],P.shoe,'paint',[0,0,0],0,0,8),roughness:.48},round([.127,.027,.211],[0,-.0715,-.034],a?'#A89D87':P.sole,'paint',.008),round([.085,.007,.009],[0,-.018,-.137],a?'#B5AA96':'#B49D82','fabric',.003)]});
 }
 return parts;
}
export const nativeRigContract={version:'native-rigid-rig.v4-v3-compatible',units:'metres',axes:'right-handed; +Y up; face -Z; positive local X pitch moves hanging hands/feet toward -Z',pivotSpace:'local to parent; surfaces local to node; body is actor-local root',soleRestY:.015,rootMotion:'Only route adapter translates actor root; local gesture clips have no root motion',binding:'Misaki remains staff.graybox; visitors have no economic identity or capability',expressions:{eyelids:'eyelid-left/right are thin curved closed-lid strokes without opaque face patches; disabled at rest; animate scale.y or enable only for blink, iris geometry stays on same face; GLB master has scale Y=.001 at rest because glTF has no visibility property; runtime adapter restores scale=1 then disables until blink',mouth:'independent curved mouth; scale/tilt for smile/focus; no head replacement',brows:'independent stable brow pivots'},attachments:['socket-left','socket-right'],motion:'rigid articulated parts; external flat-floor world-foot anchoring and two-link leg IK; no skeleton, skins or embedded glTF clips',restArms:'shoulder→forearm→hand hangs downward; elbow and wrist local rotations blend on authored rest',restLegs:'hips at y=.65; knees -.25; ankles -.30; actual rest sole .015; NativeFootPlant solves .25/.30m links from immutable world stance anchors and bounded swing targets; apply bodyDrop and local hip/knee/foot quaternions',material:'Existing IEC sRGB→linear PBR semantic material intent; opaque soft fallback; custom lofts use finite smooth normals; shared native bob UVs and original strand colour/normal inputs; no external image dependency'} as const;

/** Active V10 remake; old builder retained for historical/native comparison. */
export const nativeCharacterParts=(kind:NativeCharacterKind)=>kind==='misaki'?rebuildV11Misaki(buildV10Character(kind)):kind==='visitor-a'?rebuildV11Male(buildV10Character(kind)):rebuildV11Female(buildV10Character(kind));
