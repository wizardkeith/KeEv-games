/** V10 character remake. New sculpted head/hair/garments/limb/shoe surfaces;
 * compatible named rigid hierarchy and immutable limb lengths for contact IK.
 * Historical builders/masters remain in the canonical repository/history. */
import type {NativeCharacterKind,NativeMesh,NativePart,NativeSurface} from './native-characters';import type {Part,V3} from './recipes';import type {MaterialRole} from './materials';import {sculptLoft,sculptSweep,sculptCloth,finishSculpt} from './sculpt-v10';import {geometry,type Geometry} from './geometry';
const C={skin:'#F2CBB2',skinA:'#DFB799',hair:'#654633',hairA:'#473E35',hairB:'#705240',sage:'#819880',cream:'#F3E8D4',apron:'#EEE0C6',plum:'#795D70',ink:'#59423A',leather:'#59483F',terra:'#B47E62',blue:'#708C99'};
const p=(shape:Part['shape'],size:V3,at:V3,color:string,role:MaterialRole='fabric',extra:Partial<Part>={}):NativeSurface=>({shape,size,at,color,role,...extra});
const mesh=(geometry:Geometry,color:string,role:MaterialRole,roughness?:number):NativeMesh=>({shape:'mesh',at:[0,0,0],geometry,color,role,...(roughness===undefined?{}:{roughness})});
const loft=(r:Parameters<typeof sculptLoft>[0],color:string,role:MaterialRole='fabric',segments=20,fold=0)=>mesh(sculptLoft(r,segments,fold),color,role);
const sweep=(points:V3[],w:number[],d:number[],color:string,role:MaterialRole='fabric',steps=14,sides=8)=>mesh(sculptSweep(points,w,d,steps,sides),color,role,role==='hair'?.60:undefined);
function hairCrown(kind:NativeCharacterKind,color:string){
 const g:Geometry={positions:[],normals:[],indices:[]},cols=44,rows=12,count=(rows+1)*cols,bob=kind!=='visitor-a';
 for(let layer=0;layer<2;layer++){const layerRows=layer?1:rows;for(let i=0;i<=layerRows;i++)for(let j=0;j<cols;j++){const a=j*Math.PI*2/cols,front=Math.max(0,-Math.sin(a)),end=(bob?2.25:1.88)-front*(bob?1.10:.68)+.06*Math.sin(a*3+.7),t=.025+(1-i/layerRows)*end,groove=.003*Math.cos(a*8+1.8*t)*Math.sin(t)**2,r=.232-layer*.008+groove;
  g.positions.push(Math.cos(a)*Math.sin(t)*r,.188+Math.cos(t)*(.222-layer*.008),.025+Math.sin(a)*Math.sin(t)*(.219-layer*.008+groove));}}
 for(let layer=0;layer<2;layer++){const layerRows=layer?1:rows,offset=layer?count:0;for(let i=0;i<layerRows;i++)for(let j=0;j<cols;j++){const a=offset+i*cols+j,b=offset+i*cols+(j+1)%cols,c=a+cols,d=b+cols;g.indices.push(...(layer?[a,b,c,b,d,c]:[a,c,b,b,c,d]));}}
 for(let j=0;j<cols;j++){const next=(j+1)%cols;g.indices.push(j,next,j+count,next,next+count,j+count);const a=rows*cols+j,b=rows*cols+next,c=count+cols+j,d=count+cols+next;g.indices.push(a,c,b,b,c,d);}return mesh(finishSculpt(g),color,'hair',.60);
}
function eyeLayer(w:number,h:number,z:number,color:string):NativeMesh {
 const g:Geometry={positions:[0,0,z-.0015],normals:[],indices:[]},n=24;for(let i=0;i<n;i++){const a=i*Math.PI*2/n;g.positions.push(Math.cos(a)*w/2,Math.sin(a)*h/2,z+.004*(Math.cos(a)**2));}for(let i=0;i<n;i++)g.indices.push(0,1+(i+1)%n,1+i);g.normals=Array(g.positions.length).fill(0);for(let i=0;i<g.normals.length;i+=3)g.normals[i+2]=-1;return mesh(g,color,'ink');
}
function makeHead(kind:NativeCharacterKind):NativePart[]{
 const a=kind==='visitor-a',skin=a?C.skinA:C.skin,hair=a?C.hairA:kind==='visitor-b'?C.hairB:C.hair;
 const face:NativeSurface[]=[loft([{y:-.022,x:.087,z:.068,cz:.014},{y:.015,x:.137,z:.108},{y:.075,x:.192,z:.145,cz:.002},{y:.160,x:.210,z:.160,cz:.004},{y:.255,x:.199,z:.162,cz:.010},{y:.340,x:.152,z:.124,cz:.016},{y:.385,x:.025,z:.025,cz:.025}],skin,'skin',32),hairCrown(kind,hair),p('sphere',[.015,.020,.012],[0,.119,-.159],skin,'skin')];
 for(const side of [-1,1]){face.push(p('sphere',[.058,.086,.045],[side*.197,.145,.006],skin,'skin'),p('sphere',[.042,.050,.020],[side*.218,.145,-.004],a?'#CDA086':'#E6AF98','skin'));}
 if(kind==='misaki'){
  face.push(sweep([[-.025,.396,-.030],[-.063,.341,-.143],[-.115,.262,-.184],[-.178,.161,-.123]],[.008,.039,.033,.001],[.007,.016,.014,.001],hair,'hair',16),sweep([[.004,.398,-.022],[.054,.340,-.159],[.114,.262,-.176],[.179,.174,-.104]],[.007,.036,.027,.001],[.006,.015,.012,.001],hair,'hair',16),sweep([[-.016,.380,-.110],[.018,.320,-.188],[.058,.264,-.192],[.102,.238,-.167]],[.009,.026,.019,.001],[.005,.011,.010,.001],hair,'hair',16));
  face.push(p('sphere',[.066,.020,.015],[.180,.259,-.132],C.cream,'fabric',{turn:[0,-.3,-.5]}),p('sphere',[.045,.018,.012],[.195,.280,-.125],C.cream,'fabric',{turn:[0,-.3,.65]}));
 }else if(a){for(let i=0;i<4;i++){const x=(i-1.5)*.064;face.push(sweep([[x*.5,.365,-.08],[x,.314,-.165],[x-.018,.251+i%2*.018,-.171]],[.015,.040,.001],[.012,.023,.001],hair,'hair',12));}}
 else face.push(sweep([[-.005,.395,-.022],[-.092,.325,-.161],[-.178,.211,-.137],[-.200,.075,-.024]],[.008,.049,.037,.002],[.006,.018,.018,.001],hair,'hair',16),sweep([[.018,.390,-.030],[.124,.305,-.152],[.201,.132,-.074],[.205,.012,.028]],[.006,.042,.039,.002],[.005,.019,.017,.001],hair,'hair',16));
 const parts:NativePart[]=[{id:'head',parent:'body',pivot:[0,1.25,0],recipe:face}];
 for(const side of [-1,1]){const s=side<0?'left':'right',x=side*.080,y=a?.153:.160;
  parts.push({id:'eye-'+s,parent:'head',pivot:[x,y,-.168],recipe:[eyeLayer(.095,.072,0,'#EEE1CB'),eyeLayer(.066,.070,-.006,a?'#6B5236':'#9E7046'),eyeLayer(.030,.052,-.009,'#433329'),{...eyeLayer(.015,.020,-.015,'#FFF8E9'),at:[-.011,.019,0]},{...eyeLayer(.008,.010,-.014,'#D2AE79'),at:[.012,-.018,0]},sweep([[-.045,.010,-.012],[-.020,.034,-.014],[.017,.034,-.012],[.047,.012,-.006]],[.002,.004,.003,.001],[.002,.003,.003,.001],C.ink,'ink',14,6)]});
  parts.push({id:'eyelid-'+s,parent:'head',pivot:[x,y+.004,-.167],recipe:[sweep([[-.037,.002,-.008],[-.014,-.004,-.012],[.015,-.004,-.012],[.037,.003,-.007]],[.001,.0022,.0022,.001],[.001,.0015,.0015,.001],C.ink,'ink',14,6)]});
  parts.push({id:'brow-'+s,parent:'head',pivot:[x,y+.053,-.157],recipe:[sweep([[-.030,0,0],[-.010,.009,-.003],[.013,.008,-.003],[.030,.001,.001]],[.001,.0027,.0024,.001],[.001,.0015,.0015,.001],hair,'ink',10,6)]});
  parts.push({id:'hair-secondary-'+s,parent:'head',pivot:[side*.177,.214,.048],recipe:[sweep([[0,.018,0],[side*.023,-.035,.012],[side*.026,-.105,.010],[side*.006,-.166,-.008]],[.015,.033,.024,.001],[.016,.031,.024,.001],hair,'hair',12)]});
 }
 parts.push({id:'mouth',parent:'head',pivot:[0,.064,-.156],recipe:[sweep([[-.025,.002,-.004],[-.009,-.006,-.008],[.010,-.006,-.008],[.025,.003,-.004]],[.001,.0025,.0025,.001],[.001,.0016,.0016,.001],'#AF7567','ink',14,6)]});return parts;
}
/** Move both sides of a closed garment panel together, preserving thickness.
 * Actual support triangles determine front clearance, not a shader/depth bias. */
function drapeOutside(g:Geometry,supports:NativeSurface[],gap=.018){
 const surfaces=supports.filter((p):p is NativeMesh=>p.shape==='mesh').map(p=>p.geometry),rows=new Map<string,{ids:number[];front:number;x:number;y:number}>();
 for(let i=0;i<g.positions.length;i+=3){const [x,y,z]=g.positions.slice(i,i+3),key=x.toFixed(10)+':'+y.toFixed(10),row=rows.get(key)??{ids:[],front:z,x,y};row.ids.push(i);row.front=Math.min(row.front,z);rows.set(key,row);}
 for(const row of rows.values()){let front=Infinity;for(const body of surfaces)for(let k=0;k<body.indices.length;k+=3){const [a,b,c]=body.indices.slice(k,k+3).map(i=>body.positions.slice(i*3,i*3+3)),det=(b[0]-a[0])*(c[1]-a[1])-(c[0]-a[0])*(b[1]-a[1]);if(Math.abs(det)<1e-12)continue;const u=((row.x-a[0])*(c[1]-a[1])-(c[0]-a[0])*(row.y-a[1]))/det,v=((b[0]-a[0])*(row.y-a[1])-(row.x-a[0])*(b[1]-a[1]))/det;if(u>=-1e-8&&v>=-1e-8&&u+v<=1+1e-8)front=Math.min(front,a[2]+u*(b[2]-a[2])+v*(c[2]-a[2]));}const delta=Math.min(0,front-gap-row.front);if(Number.isFinite(delta))for(const i of row.ids)g.positions[i+2]+=delta;}return finishSculpt(g);
}
function makeBody(kind:NativeCharacterKind):NativeSurface[]{
 const misaki=kind==='misaki',a=kind==='visitor-a',coat=misaki?C.sage:a?C.terra:C.blue,skin=a?C.skinA:C.skin;
 const out:NativeSurface[]=[loft([{y:.64,x:.147,z:.105},{y:.78,x:.151,z:.111},{y:.94,x:.171,z:.115},{y:1.08,x:.182,z:.106},{y:1.12,x:.172,z:.099},{y:1.153,x:.104,z:.065}],coat,'fabric',20,.012),loft([{y:.78,x:.069,z:.011,cz:-.117},{y:1.02,x:.075,z:.013,cz:-.120},{y:1.13,x:.050,z:.012,cz:-.089}],C.cream,'fabric',16),p('cylinder',[.097,.102,.097],[0,1.18,0],skin,'skin',{top:1})];
 for(const side of [-1,1]){out.push(loft([{y:.76,x:.035,z:.012,cx:side*.100,cz:-.115},{y:.86,x:.047,z:.019,cx:side*.104,cz:-.118},{y:1.03,x:.051,z:.021,cx:side*.108,cz:-.126},{y:1.13,x:.030,z:.016,cx:side*.070,cz:-.095}],coat,'fabric',16,.016),sweep([[side*.027,1.155,-.066],[side*.048,1.125,-.112],[side*.064,1.092,-.127]],[.015,.026,.012],[.005,.006,.003],C.cream,'fabric',10,6));}
 if(!a){
  out.push(loft([{y:misaki?.307:.235,x:.262,z:.238},{y:.355,x:.272,z:.246},{y:.47,x:.254,z:.232},{y:.60,x:.207,z:.174},{y:.74,x:.151,z:.109}],misaki?C.plum:C.cream,'fabric',32,.045));
  if(misaki){const apron=mesh(drapeOutside(sculptCloth([{y:.363,w:.180,z:-.253},{y:.405,w:.194,z:-.254},{y:.50,w:.181,z:-.230},{y:.60,w:.160,z:-.187},{y:.70,w:.142,z:-.144},{y:.79,w:.134,z:-.130}],.005,.005),out),C.apron,'fabric',.91);out.push(apron);out.push(mesh(drapeOutside(geometry({shape:'round',size:[.108,.090,.008],at:[.055,.578,-.15],color:'#E5D3B5',role:'fabric',radius:.020}),[apron],.010),'#E5D3B5','fabric'),sweep([[-.145,.785,-.126],[0,.789,-.142],[.145,.785,-.126]],[.008,.010,.008],[.005,.005,.005],C.cream,'fabric',12,6));}
  else out.push(sweep([[-.132,1.113,-.064],[0,1.116,-.142],[.129,1.113,-.064]],[.028,.042,.028],[.018,.020,.018],C.plum,'fabric',16),mesh(sculptCloth([{y:.85,w:.031,z:-.153},{y:1.02,w:.033,z:-.155},{y:1.13,w:.035,z:-.132}],.010,.004),C.plum,'fabric'));
 }else{out.push(loft([{y:.63,x:.150,z:.102},{y:.71,x:.158,z:.110}], '#596368','fabric',20),p('round',[.103,.100,.018],[-.107,.927,-.145],'#A86F56','fabric',{radius:.014}),p('round',[.19,.19,.082],[.211,.72,-.071],'#CDBA96','fabric',{radius:.027}),sweep([[.14,1.10,-.078],[-.02,.92,-.149],[-.15,.75,-.089]],[.012,.012,.012],[.006,.006,.006],'#CDBA96','fabric',12));}
 for(const y of [1.094,1.033,.972,.911])out.push(p('cylinder',[.010,.003,.010],[0,y,-.143],'#AB9370','metal',{turn:[Math.PI/2,0,0],top:1}));return out;
}
export function buildV10Character(kind:NativeCharacterKind):NativePart[]{
 const a=kind==='visitor-a',coat=kind==='misaki'?C.sage:a?C.terra:C.blue,skin=a?C.skinA:C.skin,parts:NativePart[]=[{id:'body',pivot:[0,0,0],recipe:makeBody(kind)},...makeHead(kind)];
 for(const side of [-1,1]){const s=side<0?'left':'right';
  parts.push({id:'arm-'+s,parent:'body',pivot:[side*.222,1.10,0],recipe:[loft([{y:-.220,x:.045,z:.045,cx:side*.007},{y:-.165,x:.058,z:.056,cx:side*.006},{y:-.055,x:.064,z:.058},{y:.005,x:.064,z:.058,cx:-side*.010},{y:.035,x:.052,z:.052,cx:-side*.028},{y:.058,x:.018,z:.022,cx:-side*.055}],coat,'fabric',14,.028),loft([{y:-.227,x:.043,z:.043,cx:side*.007},{y:-.219,x:.058,z:.057,cx:side*.006},{y:-.185,x:.059,z:.058,cx:side*.005},{y:-.177,x:.049,z:.049,cx:side*.006}],coat,'fabric',10,.02)]});
  parts.push({id:'forearm-'+s,parent:'arm-'+s,pivot:[side*.007,-.22,0],recipe:[loft([{y:-.168,x:.033,z:.035},{y:-.10,x:.041,z:.041},{y:.01,x:.044,z:.044}],a?coat:skin,a?'fabric':'skin',16)]});
  parts.push({id:'hand-'+s,parent:'forearm-'+s,pivot:[0,-.168,0],recipe:[p('round',[.069,.084,.045],[0,-.027,-.005],skin,'skin',{radius:.020}),p('sphere',[.028,.048,.028],[-side*.033,-.020,-.010],skin,'skin')]});parts.push({id:'socket-'+s,parent:'hand-'+s,pivot:[0,-.021,-.043],recipe:[]});
  parts.push({id:'leg-'+s,parent:'body',pivot:[side*.10,.65,0],recipe:[loft([{y:-.251,x:.052,z:.055},{y:-.12,x:.060,z:.062},{y:0,x:.068,z:.069}],a?'#596368':skin,a?'fabric':'skin',12)]});
  parts.push({id:'shin-'+s,parent:'leg-'+s,pivot:[0,-.25,0],recipe:[loft([{y:-.289,x:.043,z:.044},{y:-.23,x:.047,z:.048},{y:0,x:.050,z:.052}],a?'#596368':C.cream,'fabric',12,.007)]});
  parts.push({id:'foot-'+s,parent:'shin-'+s,pivot:[0,-.30,0],recipe:[{...loft([{y:-.070,x:.055,z:.089,cz:-.034},{y:-.050,x:.061,z:.103,cz:-.035},{y:-.020,x:.055,z:.089,cz:-.033},{y:.005,x:.037,z:.060,cz:-.014}],a?'#D7CCB6':C.leather,a?'fabric':'paint',16),roughness:a?.94:.48},p('round',[.127,.026,.211],[0,-.072,-.034],a?'#A99A81':'#8C7764','paint',{radius:.009}),sweep([[-.036,-.017,-.124],[0,-.011,-.137],[.036,-.017,-.124]],[.002,.003,.002],[.002,.002,.002],'#C2AC88','fabric',8,6)]});
 }return parts;
}
