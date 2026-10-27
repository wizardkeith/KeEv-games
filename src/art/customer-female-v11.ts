import coatRest from '../../assets/masters/native-v11/coat-rest/coat-rest-retopo.json';
import garmentUV from '../../assets/masters/native-v11/visitor-b-cloth-uv.json';
import {applyGarmentUV,garmentSignature,type GarmentUV} from './garment-uv-v11';
/** Original low gathered hair and blue jacket / scarf / full cream skirt.
 * Same named rigid rig and rest joints; real shapes, never image billboards. */
import sculpt from '../../assets/masters/native-v11/visitor-b-head.json';
import type {NativeMesh,NativePart} from './native-characters';
import type {Geometry} from './geometry';
import {sculptLoft,sculptSweep,finishSculpt} from './sculpt-v10';
import {createV11Portrait} from './portrait-v11';
import {frontZ,fittedPattern} from './garments-v11';
import {rebuildV11Hands} from './hands-v11';
import {rebuildV11Shoes} from './shoes-v11';
const source=sculpt as (NativeMesh&{authoringName:string})[];
const portrait=createV11Portrait(source[0].geometry,'/assets/native-v11/misaki-skin.png');
const fabric=(geometry:Geometry,color='#708C99'):NativeMesh=>({shape:'mesh',at:[0,0,0],geometry,color,role:'fabric',roughness:.90});
function ribbon(rows:{x:number;y:number}[],width:number,support:NativeMesh,gap:number,color:string):NativeMesh{
 const dense:{y:number;inner:number;outer:number}[]=[];
 for(let i=0;i<rows.length-1;i++){const a=rows[i],b=rows[i+1],n=Math.ceil(Math.abs(b.y-a.y)/.025);for(let j=0;j<n;j++){const t=j/n,x=a.x+(b.x-a.x)*t;dense.push({y:a.y+(b.y-a.y)*t,inner:x-width/2,outer:x+width/2});}}
 const end=rows.at(-1)!;dense.push({y:end.y,inner:end.x-width/2,outer:end.x+width/2});return fittedPattern(dense,support,1,gap,color,width>.05?6:2);
}
function sectionX(support:NativeMesh,y:number){
 const g=support.geometry,xs:number[]=[];
 for(let i=0;i<g.indices.length;i+=3){const ids=g.indices.slice(i,i+3);for(let j=0;j<3;j++){const a=ids[j]*3,b=ids[(j+1)%3]*3,ya=g.positions[a+1],yb=g.positions[b+1];if(Math.abs(yb-ya)<1e-12){if(Math.abs(y-ya)<1e-9)xs.push(g.positions[a],g.positions[b]);}else if((ya-y)*(yb-y)<=0){const t=(y-ya)/(yb-ya);xs.push(g.positions[a]+(g.positions[b]-g.positions[a])*t);}}}
 if(!xs.length)throw Error('garment row outside actual support height');return [Math.min(...xs)+.004,Math.max(...xs)-.004];
}
function rolledCuff(side:number):NativeMesh{
 const profile=[[-.175,.053],[-.194,.073],[-.210,.055],[-.224,.065],[-.236,.045],[-.236,.037],[-.175,.044],[-.175,.053]],n=12,g:Geometry={positions:[],normals:[],indices:[]};
 for(const [y,r]of profile)for(let j=0;j<n;j++){const a=j/n*Math.PI*2;g.positions.push(side*.006+Math.cos(a)*r,y,Math.sin(a)*r*.94);}
 for(let k=0;k<profile.length-1;k++)for(let j=0;j<n;j++){const a=k*n+j,b=k*n+(j+1)%n;g.indices.push(a,a+n,b,b,a+n,b+n);}
 return fabric(finishSculpt(g),'#7C96A1');
}
function pattern(rows:{y:number;inner:number;outer:number}[],support:NativeMesh,side:number,gap:number,color:string,cols=4){
 const dense:typeof rows=[];for(let i=0;i<rows.length-1;i++){const a=rows[i],b=rows[i+1],n=Math.ceil(Math.abs(b.y-a.y)/.045);for(let j=0;j<n;j++){const t=j/n;dense.push({y:a.y+(b.y-a.y)*t,inner:a.inner+(b.inner-a.inner)*t,outer:a.outer+(b.outer-a.outer)*t});}}dense.push(rows.at(-1)!);const fitted=dense.map(row=>{const [lo,hi]=sectionX(support,row.y),clamp=(x:number)=>Math.max(lo,Math.min(hi,x)),inner=clamp(side*row.inner)/side,outer=clamp(side*row.outer)/side;if(Math.abs(outer-inner)<.005)throw Error('tailored panel collapsed at actual support');return {...row,inner,outer};});return fittedPattern(fitted,support,side,gap,color,cols);
}
/** Fit a real closed scarf panel to the BACK support, not the front chest.
 * Reflecting both winding and normals twice preserves outward CCW surfaces. */
function mirrorCloth(s:NativeMesh):NativeMesh{
 const g=s.geometry;return {...s,at:[s.at[0],s.at[1],-s.at[2]],geometry:{...g,positions:g.positions.map((v,i)=>i%3===2?-v:v),normals:g.normals.map((v,i)=>i%3===2?-v:v),indices:g.indices.flatMap((_,i)=>i%3===0?[g.indices[i],g.indices[i+2],g.indices[i+1]]:[])}};
}
function clothes(parts:NativePart[]){
 const body=parts.find(p=>p.id==='body')!;
 const torso=fabric(sculptLoft([{y:.74,x:.146,z:.111},{y:.84,x:.157,z:.121},{y:.97,x:.182,z:.137,cz:-.003},{y:1.04,x:.194,z:.133,cz:-.001},{y:1.065,x:.197,z:.130},{y:1.12,x:.186,z:.112},{y:1.17,x:.133,z:.082},{y:1.201,x:.063,z:.052}],24,.018));
 // Mid-scale cloth construction, not textile noise: paired tension ridges
 // below the chest, a gravity gather at the waist and an uneven full skirt.
 // Accepted neck/shoulder rings, rig lengths, hands and work contacts stay put.
 const ridge=(d:number,w:number)=>{const q=d/w;return (1-q*q)*Math.exp(-q*q*.5);};
 const ease=(v:number)=>{const t=Math.max(0,Math.min(1,v));return t*t*(3-2*t);};
 for(let i=0;i<torso.geometry.positions.length;i+=3){
  const x=torso.geometry.positions[i],y=torso.geometry.positions[i+1],z=torso.geometry.positions[i+2],mask=ease((.99-y)/.10)*ease((y-.735)/.045);
  const crease=z>0?.011*ridge(y-(.825+.22*x),.045)+.007*ridge(y-(.918-.18*x),.037):.010*ridge(y-(.772+.85*Math.abs(x-.015)),.044);
  const radial=crease*mask,r=Math.hypot(x,z)||1;torso.geometry.positions[i]+=x/r*radial;torso.geometry.positions[i+2]+=z/r*radial;
  if(z<0)torso.geometry.positions[i+2]-=.0016*Math.max(0,1-Math.abs(y-1.17)/.035)*Math.sin(x*83);
 }
 finishSculpt(torso.geometry);
 // Actual offline-authored cloth rest, retopologized to the same 720 triangles.
 // Upper accepted controls stay exact; front layers fit this resulting surface.
 if(coatRest.sourceSignature!==garmentSignature(torso.geometry)||coatRest.positions.length!==torso.geometry.positions.length||JSON.stringify(coatRest.indices)!==JSON.stringify(torso.geometry.indices))throw Error('stale authored coat rest');
 torso.geometry=finishSculpt({positions:[...coatRest.positions],normals:[],indices:[...coatRest.indices]});
 const skirt=fabric(sculptLoft([{y:.224,x:.248,z:.236},{y:.254,x:.258,z:.244},{y:.40,x:.245,z:.235},{y:.55,x:.213,z:.201},{y:.68,x:.158,z:.126},{y:.76,x:.135,z:.098}],32,0),'#E7DBBF');
 for(let i=0;i<skirt.geometry.positions.length;i+=3){
  const x=skirt.geometry.positions[i],y=skirt.geometry.positions[i+1],z=skirt.geometry.positions[i+2],a=Math.atan2(z,x),fall=ease((.72-y)/.42),r=Math.hypot(x,z)||1;
  const centres=[-.25,1.05,2.40,3.68,4.90],depths=[.025,.032,.024,.029,.027];let gather=0;for(let k=0;k<centres.length;k++){const centre=centres[k]+.12*(1-fall)*Math.sin(centres[k]),d=Math.atan2(Math.sin(a-centre),Math.cos(a-centre));gather+=depths[k]*Math.exp(-.5*(d/(.30+(k%2)*.025))**2)*fall;}
  skirt.geometry.positions[i]+=x/r*gather;skirt.geometry.positions[i+2]+=z/r*gather;
  skirt.geometry.positions[i+1]+=.004*Math.sin(a*5+.4)*Math.max(0,Math.min(1,(.45-y)/.22));
 }
 finishSculpt(skirt.geometry);
 const neck:NativeMesh={...fabric(sculptLoft([{y:1.19,x:.044,z:.042},{y:1.226,x:.042,z:.040},{y:1.263,x:.046,z:.043}],12),'#F2CBB2'),role:'skin',roughness:.78};
 const blouse=pattern([{y:.76,inner:-.053,outer:.053},{y:.88,inner:-.061,outer:.061},{y:1.02,inner:-.063,outer:.063},{y:1.14,inner:-.041,outer:.041},{y:1.193,inner:-.025,outer:.025}],torso,1,.010,'#F0E3CA');
 const fronts=[-1,1].map(side=>pattern([{y:.75,inner:.052,outer:.140},{y:.85,inner:.056,outer:.150},{y:.98,inner:.058,outer:.175},{y:1.065,inner:.055,outer:.190},{y:1.12,inner:.041,outer:.179},{y:1.17,inner:.025,outer:.123},{y:1.194,inner:.019,outer:.058}],torso,side,.016,'#708C99'));
 const scarf=fabric(sculptSweep([[-.089,1.179,.040],[-.077,1.170,-.056],[0,1.153,-.103],[.078,1.17,-.056],[.091,1.181,.035],[0,1.188,.080],[-.089,1.179,.040]],[.023,.025,.030,.025,.023,.022,.023],[.010,.012,.014,.012,.010,.010,.010],24,6),'#826575');
 const tail=mirrorCloth(pattern([{y:.94,inner:-.050,outer:.050},{y:.985,inner:-.064,outer:.064},{y:1.07,inner:-.087,outer:.087},{y:1.146,inner:-.088,outer:.088},{y:1.176,inner:-.054,outer:.054}],mirrorCloth(torso),1,.010,'#826575',6));
 // Two broad resting bends in the preserved wide back scarf, not noise.
 for(let i=0;i<tail.geometry.positions.length;i+=3){const x=tail.geometry.positions[i],y=tail.geometry.positions[i+1],t=Math.max(0,Math.min(1,(y-.94)/.236)),hang=Math.sin(Math.PI*t);tail.geometry.positions[i+2]+=Math.max(0,.006*hang*(1+.45*Math.cos(Math.PI*x/.075+.5*t))+.002*Math.sin(Math.PI*x/.09+1.2)*hang);}
 finishSculpt(tail.geometry);
 const pouch=fabric(sculptLoft([{y:.602,x:.052,z:.023,cx:-.196,cz:.130},{y:.619,x:.074,z:.034,cx:-.196,cz:.130},{y:.728,x:.079,z:.037,cx:-.196,cz:.130},{y:.789,x:.071,z:.031,cx:-.196,cz:.130},{y:.802,x:.058,z:.023,cx:-.196,cz:.130}],16,.013),'#88705A');
 const flap=ribbon([{x:-.196,y:.795},{x:-.196,y:.771},{x:-.196,y:.735},{x:-.196,y:.714}],.105,pouch,.008,'#947C64');
 const strap=ribbon([{x:.112,y:1.17},{x:.094,y:1.10},{x:.05,y:1.015},{x:0,y:.93},{x:-.05,y:.85},{x:-.09,y:.79},{x:-.114,y:.76}],.020,torso,.013,'#947C64');
 const end=fabric(sculptSweep([[-.114,.76,frontZ(-.114,.76,[torso])-.013],[-.132,.77,frontZ(-.132,.77,[torso])-.008],[-.153,.778,-.025],[-.165,.782,.025],[-.162,.787,.078],[-.155,.789,frontZ(-.155,.789,[pouch])-.003]],[.010,.010,.010],[.003,.003,.003],6,4),'#947C64');
 body.recipe=[torso,blouse,neck,...fronts,skirt,scarf,tail,pouch,flap,strap,end];
 for(const side of [-1,1]){
  const p=parts.find(p=>p.id==='arm-'+(side<0?'left':'right'))!;
  p.recipe=[fabric(sculptLoft([{y:-.224,x:.051,z:.048,cx:side*.006},{y:-.18,x:.067,z:.062,cx:side*.007},{y:-.10,x:.078,z:.068},{y:-.025,x:.075,z:.065},{y:.018,x:.061,z:.056,cx:-side*.014},{y:.056,x:.018,z:.023,cx:-side*.055}],16,.035)),rolledCuff(side)];
  const sleeve=p.recipe[0] as NativeMesh;
  for(let i=0;i<sleeve.geometry.positions.length;i+=3){
   const x=sleeve.geometry.positions[i],y=sleeve.geometry.positions[i+1],z=sleeve.geometry.positions[i+2],a=Math.atan2(z,x),r=Math.hypot(x,z)||1;
   const bunch=.007*ridge(y-(-.171+.025*Math.cos(a+side*.4)),.026)*ease((-.08-y)/.06)*ease((y+.224)/.035);
   sleeve.geometry.positions[i]+=x/r*bunch;sleeve.geometry.positions[i+2]+=z/r*bunch;
  }
  finishSculpt(sleeve.geometry);
  // Taper only hidden cloth inside the hollow roll, avoiding layer poke-through.
  for(let i=0;i<sleeve.geometry.positions.length;i+=3){const y=sleeve.geometry.positions[i+1];if(y>-.18)continue;const x=sleeve.geometry.positions[i]-side*.006,z=sleeve.geometry.positions[i+2],r=Math.hypot(x,z),limit=.034+Math.max(0,Math.min(1,(y+.224)/.044))*.007;if(r>limit){sleeve.geometry.positions[i]=side*.006+x/r*limit;sleeve.geometry.positions[i+2]=z/r*limit;}}
  finishSculpt(sleeve.geometry);
 }
 rebuildV11Hands(parts);rebuildV11Shoes(parts);
 for(const part of parts)part.recipe=part.recipe.map(s=>s.role==='fabric'&&!part.id.startsWith('shin-')?{...s,finish:['#708C99','#7C96A1','#826575'].includes(s.color)?'knit':['#88705A','#947C64'].includes(s.color)?'canvas':'linen'}:part.id.startsWith('foot-')&&s.color==='#59483F'?{...s,finish:'leather'}:s);
}
export function buildV11FemaleRaw(parts:NativePart[]):NativePart[]{
 parts.find(p=>p.id==='head')!.recipe=source.filter(s=>!s.authoringName.startsWith('Female temple'));
 for(const side of [-1,1]){const name=side<0?'left':'right',hair=parts.find(p=>p.id==='hair-secondary-'+name)!,s=source.find(s=>s.authoringName==='Female temple '+side)!;hair.recipe=[{...s,geometry:{...s.geometry,positions:s.geometry.positions.map((v,i)=>v-hair.pivot[i%3])}}];
  const eye=parts.find(p=>p.id==='eye-'+name)!;eye.pivot=[side*.083,.160,0];eye.recipe=portrait.eye(eye.pivot);
  const lid=parts.find(p=>p.id==='eyelid-'+name)!;lid.pivot=[...eye.pivot];lid.recipe=[portrait.stroke([[-.052,.001,0],[-.018,-.009,0],[.021,-.008,0],[.052,.004,0]],lid.pivot)];
  const brow=parts.find(p=>p.id==='brow-'+name)!;brow.pivot=[side*.084,.225,0];brow.recipe=[portrait.pigment([[-.034,-.002,0],[-.010,.007,0],[.017,.005,0],[.034,-.003,0]],brow.pivot,.0019)];
 }
 const mouth=parts.find(p=>p.id==='mouth')!;mouth.pivot=[0,.055,0];mouth.recipe=[{...portrait.stroke([[-.023,.003,0],[-.008,-.005,0],[.008,-.005,0],[.023,.003,0]],mouth.pivot,.0013),color:'#B46D60'}];
 clothes(parts);return parts;
}
let cached:NativePart[]|undefined;
export function rebuildV11Female(parts:NativePart[]):NativePart[]{return cached??=applyGarmentUV(buildV11FemaleRaw(parts),garmentUV as GarmentUV);}
