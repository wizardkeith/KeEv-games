/** Native v3 original character authoring. Metres; RH +Y up, face -Z.
 * All node translations are LOCAL to the named parent. All surfaces are LOCAL
 * to their node. A rigid articulated hierarchy, deliberately no skin/clip claims.
 */
import {geometry,type Geometry} from './geometry';
import type {MaterialRole} from './materials';
import {nativeMaterialIntent} from './native-materials';
import type {Part,V3} from './recipes';
export type NativeCharacterKind='misaki'|'visitor-a'|'visitor-b';
export interface NativeMesh {shape:'mesh';at:V3;color:string;role:MaterialRole;geometry:Geometry;alpha?:number;roughness?:number;}
export type NativePrimitive=Part&{roughness?:number};
export type NativeSurface=NativePrimitive|NativeMesh;
export interface NativePart {id:string;parent?:string;pivot:V3;recipe:NativeSurface[];}
export const nativeCharacterIdentity={version:'native-characters-v3.1-r2',misaki:{id:'actor.misaki.native.v3',economicBinding:'staff.graybox'},'visitor-a':{id:'actor.visitor-a.native.v3',economicBinding:null},'visitor-b':{id:'actor.visitor-b.native.v3',economicBinding:null}} as const;
const P={skin:'#EAC3A8',skinB:'#E1B99D',blush:'#D99D91',hair:'#604638',hairLight:'#87634C',sage:'#7F9A89',sageDark:'#607B6A',cream:'#F5EBDD',ivory:'#F1E6CF',plum:'#826879',ink:'#57413D',shoe:'#59483F',sole:'#8C7764',terracotta:'#B77F62',blue:'#748F9D',trousers:'#555E61'};
const p=(shape:Part['shape'],size:V3,at:V3,color:string,role:MaterialRole='fabric',extra:Partial<NativePrimitive>={}):NativePrimitive=>({shape,size,at,color,role,...extra});
const round=(size:V3,at:V3,color:string,role:MaterialRole='fabric',radius=.014)=>p('round',size,at,color,role,{radius});
interface Ring {y:number;x:number;z:number;cx?:number;cz?:number;}
/** Smooth indexed loft with a controllable silhouette, cheek/jaw taper and broad
 * authored garment folds. Smooth normals are derived from the actual mesh. */
function loft(rings:Ring[],segments=24,pleat=0,phase=0):Geometry {
 if(rings[0].y>rings[rings.length-1].y)rings=[...rings].reverse();
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
function mesh(rings:Ring[],color:string,role:MaterialRole,at:V3=[0,0,0],pleat=0,phase=0):NativeMesh{return {shape:'mesh',at,color,role,geometry:loft(rings,24,pleat,phase)};}
/** A tapered curved hair lock is a loft around a deliberately authored curve,
 * rather than overlapping spheres. */
function lock(points:Ring[],color=P.hair):NativeMesh{return mesh(points,color,'hair');}
export function nativeSurfaceGeometry(surface:NativeSurface):Geometry {
 if(surface.shape!=='mesh')return geometry(surface);
 return {positions:surface.geometry.positions.map((x,i)=>x+surface.at[i%3]),normals:[...surface.geometry.normals],indices:[...surface.geometry.indices]};
}
export function nativeGrouped(recipe:NativeSurface[]){
 const groups=new Map<string,{role:MaterialRole;materialId:string;color:string;alpha:number;roughness:number;geometry:Geometry}>();
 for(const surface of recipe){const role=surface.role??'paint',alpha=surface.alpha??1,intent=nativeMaterialIntent(surface),key=intent.materialId;let group=groups.get(key);if(!group){group={role,materialId:key,color:surface.color,alpha,roughness:intent.roughness,geometry:{positions:[],normals:[],indices:[]}};groups.set(key,group);}const a=nativeSurfaceGeometry(surface),offset=group.geometry.positions.length/3;group.geometry.positions.push(...a.positions);group.geometry.normals.push(...a.normals);group.geometry.indices.push(...a.indices.map(x=>x+offset));}
 return [...groups.values()];
}
function eyes(kind:NativeCharacterKind):NativePart[]{
 const wider=kind==='visitor-b',skin=kind==='visitor-a'?P.skinB:P.skin,out:NativePart[]=[];
 for(const side of [-1,1]){const x=side*(wider?.085:.079),s=side<0?'left':'right',y=kind==='visitor-a'?.155:.16;
  out.push({id:`eye-${s}`,parent:'head',pivot:[x,y,-.177],recipe:[p('sphere',[.074,.044,.012],[0,0,0],'#F2E8DB','ink'),p('sphere',[.033,.040,.013],[side*-.003,0,-.009],kind==='visitor-a'?'#554332':'#76513C','ink'),p('sphere',[.017,.027,.014],[side*-.003,.001,-.016],'#3F3330','ink'),p('sphere',[.009,.009,.004],[-.008,.010,-.025],'#FFF4DF','ink'),round([.078,.010,.014],[0,.023,-.009],P.ink,'hair',.004)]});
  out.push({id:`eyelid-${s}`,parent:'head',pivot:[x,y+.005,-.201],recipe:[round([.083,.049,.010],[0,0,0],skin,'skin',.015),round([.077,.006,.012],[0,-.004,-.006],P.ink,'hair',.002)]});
  out.push({id:`brow-${s}`,parent:'head',pivot:[x,y+.060,-.165],recipe:[round([.069,.010,.012],[0,0,0],kind==='visitor-a'?'#423D36':P.hair,'hair',.004)]});
 }
 return out;
}
function head(kind:NativeCharacterKind):NativePart[]{
 const misaki=kind==='misaki',a=kind==='visitor-a',skin=a?P.skinB:P.skin,w=a?.174:kind==='visitor-b'?.204:.193;
 const face:NativeSurface[]=[mesh([{y:-.025,x:.067,z:.075,cz:-.004},{y:.025,x:w*.70,z:.122,cz:-.012},{y:.090,x:w*.94,z:.164},{y:.170,x:w,z:.177},{y:.250,x:w*.94,z:.167},{y:.315,x:w*.72,z:.126},{y:.342,x:.045,z:.042}],skin,'skin'),p('sphere',[.029,.039,.029],[0,.114,-.173],skin,'skin'),...[-1,1].flatMap(side=>[p('sphere',[.045,.077,.031],[side*w,.139,.005],skin,'skin'),p('sphere',[.048,.015,.006],[side*.122,.093,-.150],P.blush,'skin')])];
 // Curved upper head silhouette; front hairline is a shaped canopy plus locks.
 const hair=a?'#3F3B35':misaki?P.hair:'#55473F';
 face.push(mesh([{y:.207,x:w*1.03,z:.177,cz:.029},{y:.295,x:w*1.04,z:.176,cz:.019},{y:.361,x:w*.78,z:.133,cz:.012},{y:.384,x:.031,z:.028}],hair,'hair'));
 if(misaki){
  face.push(lock([{y:.310,x:.055,z:.037,cx:-.115,cz:-.132},{y:.240,x:.072,z:.039,cx:-.121,cz:-.145},{y:.153,x:.048,z:.031,cx:-.165,cz:-.093},{y:.077,x:.016,z:.014,cx:-.182,cz:-.039}],hair),lock([{y:.348,x:.069,z:.037,cx:.054,cz:-.127},{y:.292,x:.084,z:.039,cx:.080,cz:-.162},{y:.218,x:.043,z:.029,cx:.154,cz:-.143},{y:.136,x:.010,z:.012,cx:.188,cz:-.095}],hair),lock([{y:.315,x:.047,z:.031,cx:-.020,cz:-.149},{y:.270,x:.038,z:.029,cx:-.039,cz:-.174},{y:.227,x:.005,z:.007,cx:-.060,cz:-.183}],hair));
  face.push(lock([{y:.301,x:.011,z:.005,cx:.078,cz:-.198},{y:.266,x:.016,z:.006,cx:.110,cz:-.198},{y:.232,x:.004,z:.003,cx:.141,cz:-.176}],P.hairLight));
  face.push(p('sphere',[.098,.034,.020],[.201,.234,-.095],P.ivory,'fabric',{turn:[0,-.30,-.46]}));
 }else if(a){
  for(let i=0;i<7;i++){const cx=(i-3)*.047;face.push(lock([{y:.344,x:.039,z:.039,cx,cz:-.105},{y:.291+(i%2)*.017,x:.046,z:.034,cx:cx-.008,cz:-.157},{y:.250+(i%2)*.016,x:.018,z:.018,cx:cx+.012,cz:-.165}],i%3===0?'#51483D':hair));}
 }else{
  face.push(lock([{y:.348,x:.071,z:.036,cx:-.063,cz:-.128},{y:.277,x:.090,z:.040,cx:-.094,cz:-.166},{y:.213,x:.041,z:.029,cx:-.164,cz:-.129},{y:.171,x:.009,z:.010,cx:-.190,cz:-.080}],hair),lock([{y:.321,x:.054,z:.029,cx:.117,cz:-.125},{y:.225,x:.056,z:.035,cx:.171,cz:-.117},{y:.092,x:.046,z:.029,cx:.203,cz:-.014},{y:-.047,x:.027,z:.018,cx:.208,cz:.035},{y:-.085,x:.007,z:.009,cx:.180,cz:.061}],hair));
 }
 const parts:NativePart[]=[{id:'head',parent:'body',pivot:[0,1.250,0],recipe:face},...eyes(kind)];
 // Mouth is independently posed without swapping face/head silhouette.
 parts.push({id:'mouth',parent:'head',pivot:[0,.067,-.157],recipe:[p('torus',[.047,.006,.035],[0,0,0],'#A36D67','ink',{turn:[Math.PI/2,0,0],arc:[Math.PI*.12,Math.PI*.88],segments:16})]});
 for(const side of [-1,1]){const s=side<0?'left':'right';parts.push({id:`hair-secondary-${s}`,parent:'head',pivot:[side*.177,.214,.048],recipe:[lock([{y:.060,x:.040,z:.061},{y:-.030,x:.055,z:.067,cx:side*.012},{y:-.125,x:.037,z:.048,cx:side*.006},{y:-.166,x:.007,z:.012,cx:side*-.008}],hair)]});}
 return parts;
}
function body(kind:NativeCharacterKind):NativeSurface[]{
 const misaki=kind==='misaki',a=kind==='visitor-a',coat=misaki?P.sage:a?P.terracotta:P.blue;
 const torso:NativeSurface[]=[mesh([{y:.640,x:.153,z:.106},{y:.739,x:.167,z:.118},{y:.946,x:.183,z:.120},{y:1.074,x:.207,z:.111},{y:1.132,x:.183,z:.099}],coat,'fabric'),round([.198,.303,.026],[0,.980,-.117],P.cream),p('cylinder',[.10,.103,.10],[0,1.180,0],a?P.skinB:P.skin,'skin',{top:1})];
 // Jacket opening and lapels have actual sloping, broad, folded geometry.
 for(const side of [-1,1]){
  torso.push(mesh([{y:.803,x:.040,z:.018,cx:side*.120,cz:-.128},{y:1.037,x:.064,z:.022,cx:side*.110,cz:-.135},{y:1.126,x:.036,z:.023,cx:side*.073,cz:-.110}],coat,'fabric'),round([.070,.054,.027],[side*.067,1.105,-.126],P.cream,'fabric',.008));
 }
 if(misaki){
  torso.push(mesh([{y:.390,x:.236,z:.175},{y:.427,x:.242,z:.174},{y:.560,x:.211,z:.148},{y:.720,x:.152,z:.109}],P.plum,'fabric',[0,0,0],.085));
  torso.push(mesh([{y:.447,x:.154,z:.014,cz:-.170},{y:.470,x:.173,z:.019,cz:-.170},{y:.635,x:.162,z:.022,cz:-.146},{y:.761,x:.135,z:.019,cz:-.127},{y:.832,x:.127,z:.013,cz:-.127}],P.ivory,'fabric',[0,0,0],.036));
  // Waist band and long thin straps, off-centre shaped pocket and hems.
  torso.push(round([.315,.034,.260],[0,.783,-.006],P.cream,'fabric',.007),round([.307,.018,.026],[0,.456,-.183],P.cream,'fabric',.004),round([.110,.099,.021],[.065,.648,-.181],'#E0D3BA','fabric',.012),round([.109,.015,.023],[.065,.697,-.184],P.cream,'fabric',.004),p('sphere',[.030,.049,.009],[.067,.650,-.195],P.sage,'fabric',{turn:[0,0,-.4]}));
  for(const side of [-1,1])torso.push(round([.024,.335,.020],[side*.118,.996,-.139],P.ivory,'fabric',.005));
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
export function nativeCharacterParts(kind:NativeCharacterKind):NativePart[]{
 const misaki=kind==='misaki',a=kind==='visitor-a',coat=misaki?P.sage:a?P.terracotta:P.blue,skin=a?P.skinB:P.skin;
 const parts:NativePart[]=[{id:'body',pivot:[0,0,0],recipe:body(kind)},...head(kind)];
 for(const side of [-1,1]){const s=side<0?'left':'right',x=side*.222;
  parts.push({id:`arm-${s}`,parent:'body',pivot:[x,1.100,0],recipe:[mesh([{y:-.220,x:.049,z:.049,cx:side*.007},{y:-.165,x:.060,z:.056,cx:side*.008},{y:-.031,x:.069,z:.061},{y:.026,x:.052,z:.052}],coat,'fabric'),round([.112,.045,.111],[side*.006,-.199,0],misaki?'#A8BAA5':a?'#CD9D7D':'#A0B3B8','fabric',.009)]});
  parts.push({id:`forearm-${s}`,parent:`arm-${s}`,pivot:[side*.007,-.220,0],recipe:[mesh([{y:-.168,x:.036,z:.036},{y:-.110,x:.045,z:.043},{y:-.015,x:.047,z:.045}],misaki?skin:coat,misaki?'skin':'fabric')]});
  parts.push({id:`hand-${s}`,parent:`forearm-${s}`,pivot:[0,-.168,0],recipe:[round([.073,.089,.048],[0,-.028,-.004],skin,'skin',.021),p('sphere',[.030,.051,.031],[side*-.036,-.021,-.010],skin,'skin')]});
  parts.push({id:`socket-${s}`,parent:`hand-${s}`,pivot:[0,-.021,-.043],recipe:[]});
  parts.push({id:`leg-${s}`,parent:'body',pivot:[side*.100,.650,0],recipe:[mesh([{y:-.251,x:.055,z:.057},{y:-.112,x:.062,z:.063},{y:0,x:.069,z:.069}],a?P.trousers:skin,a?'fabric':'skin')]});
  parts.push({id:`shin-${s}`,parent:`leg-${s}`,pivot:[0,-.250,0],recipe:[mesh([{y:-.289,x:.045,z:.045},{y:-.230,x:.049,z:.049},{y:0,x:.052,z:.054}],a?P.trousers:P.cream,'fabric')]});
  parts.push({id:`foot-${s}`,parent:`shin-${s}`,pivot:[0,-.300,0],recipe:[p('round',[.124,.081,.209],[0,-.036,-.034],a?'#D8D0BB':P.shoe,a?'fabric':'paint',{radius:.026,...(a?{}:{roughness:.48})}),round([.127,.027,.211],[0,-.0715,-.034],a?'#A89D87':P.sole,'paint',.008),round([.085,.007,.009],[0,-.018,-.137],a?'#B5AA96':'#B49D82','fabric',.003)]});
 }
 return parts;
}
export const nativeRigContract={version:'native-rigid-rig.v3.1-r2',units:'metres',axes:'right-handed; +Y up; face -Z; positive local X pitch moves hanging hands/feet toward -Z',pivotSpace:'local to parent; surfaces local to node; body is actor-local root',soleRestY:.015,rootMotion:'Only route adapter translates actor root; local gesture clips have no root motion',binding:'Misaki remains staff.graybox; visitors have no economic identity or capability',expressions:{eyelids:'eyelid-left/right are closed-lid geometry; disabled at rest; animate scale.y or enable only for blink, iris geometry stays on same face; GLB master has scale Y=.001 at rest because glTF has no visibility property; runtime adapter restores scale=1 then disables until blink',mouth:'independent curved mouth; scale/tilt for smile/focus; no head replacement',brows:'independent stable brow pivots'},attachments:['socket-left','socket-right'],motion:'rigid articulated parts; external flat-floor world-foot anchoring and two-link leg IK; no skeleton, skins or embedded glTF clips',restArms:'shoulder→forearm→hand hangs downward; elbow and wrist local rotations blend on authored rest',restLegs:'hips at y=.65; knees -.25; ankles -.30; actual rest sole .015; NativeFootPlant solves .25/.30m links from immutable world stance anchors and bounded swing targets; apply bodyDrop and local hip/knee/foot quaternions',material:'Existing IEC sRGB→linear PBR semantic material intent; opaque soft fallback; custom lofts use finite smooth normals; no external image/UV/texture dependency'} as const;
