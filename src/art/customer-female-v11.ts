import garmentUV from '../../assets/masters/native-v11/visitor-b-cloth-uv.json';
import {applyGarmentUV,type GarmentUV} from './garment-uv-v11';
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
function pattern(rows:{y:number;inner:number;outer:number}[],support:NativeMesh,side:number,gap:number,color:string){
 const dense:typeof rows=[];for(let i=0;i<rows.length-1;i++){const a=rows[i],b=rows[i+1],n=Math.ceil(Math.abs(b.y-a.y)/.045);for(let j=0;j<n;j++){const t=j/n;dense.push({y:a.y+(b.y-a.y)*t,inner:a.inner+(b.inner-a.inner)*t,outer:a.outer+(b.outer-a.outer)*t});}}dense.push(rows.at(-1)!);return fittedPattern(dense,support,side,gap,color,4);
}
function clothes(parts:NativePart[]){
 const body=parts.find(p=>p.id==='body')!;
 const torso=fabric(sculptLoft([{y:.74,x:.146,z:.111},{y:.84,x:.157,z:.121},{y:.97,x:.182,z:.137,cz:-.003},{y:1.04,x:.194,z:.133,cz:-.001},{y:1.065,x:.197,z:.130},{y:1.12,x:.186,z:.112},{y:1.17,x:.133,z:.082},{y:1.201,x:.063,z:.052}],24,.018));
 // Directional, restrained waist/collar creases, not a new body silhouette.
 for(let i=0;i<torso.geometry.positions.length;i+=3){const x=torso.geometry.positions[i],y=torso.geometry.positions[i+1],z=torso.geometry.positions[i+2];if(z<0){const waist=Math.max(0,1-Math.abs(y-.805)/.075),collar=Math.max(0,1-Math.abs(y-1.17)/.035);torso.geometry.positions[i+2]-=.005*waist*Math.sin(x*67+(y-.74)*19)+.0016*collar*Math.sin(x*83);}else{const waist=Math.max(0,1-Math.abs(y-.805)/.075);torso.geometry.positions[i+2]+=.0045*waist*Math.sin(x*61+.3);}}finishSculpt(torso.geometry);
 const skirt=fabric(sculptLoft([{y:.224,x:.248,z:.236},{y:.254,x:.258,z:.244},{y:.40,x:.245,z:.235},{y:.55,x:.213,z:.201},{y:.68,x:.158,z:.126},{y:.76,x:.135,z:.098}],32,.058),'#E7DBBF');
 for(let i=0;i<skirt.geometry.positions.length;i+=3){const x=skirt.geometry.positions[i],y=skirt.geometry.positions[i+1],z=skirt.geometry.positions[i+2];skirt.geometry.positions[i+1]+=.004*Math.sin(Math.atan2(z,x)*5+.4)*Math.max(0,Math.min(1,(.45-y)/.22));}finishSculpt(skirt.geometry);
 const neck:NativeMesh={...fabric(sculptLoft([{y:1.19,x:.044,z:.042},{y:1.226,x:.042,z:.040},{y:1.263,x:.046,z:.043}],12),'#F2CBB2'),role:'skin',roughness:.78};
 const blouse=pattern([{y:.76,inner:-.053,outer:.053},{y:.88,inner:-.061,outer:.061},{y:1.02,inner:-.063,outer:.063},{y:1.14,inner:-.041,outer:.041},{y:1.193,inner:-.025,outer:.025}],torso,1,.009,'#F0E3CA');
 const fronts=[-1,1].map(side=>pattern([{y:.75,inner:.052,outer:.140},{y:.85,inner:.056,outer:.150},{y:.98,inner:.058,outer:.175},{y:1.065,inner:.055,outer:.190},{y:1.12,inner:.041,outer:.179},{y:1.17,inner:.025,outer:.123},{y:1.194,inner:.019,outer:.058}],torso,side,.012,'#708C99'));
 const scarf=fabric(sculptSweep([[-.089,1.179,.040],[-.077,1.170,-.056],[0,1.153,-.103],[.078,1.17,-.056],[.091,1.181,.035],[0,1.188,.080],[-.089,1.179,.040]],[.023,.025,.030,.025,.023,.022,.023],[.010,.012,.014,.012,.010,.010,.010],24,6),'#826575');
 const tail=pattern([{y:.945,inner:.055,outer:.089},{y:1.00,inner:.048,outer:.087},{y:1.07,inner:.043,outer:.082},{y:1.135,inner:.035,outer:.071}],torso,1,.020,'#826575');
 const pouch=fabric(sculptLoft([{y:.602,x:.052,z:.023,cx:-.196,cz:.130},{y:.619,x:.074,z:.034,cx:-.196,cz:.130},{y:.728,x:.079,z:.037,cx:-.196,cz:.130},{y:.789,x:.071,z:.031,cx:-.196,cz:.130},{y:.802,x:.058,z:.023,cx:-.196,cz:.130}],16,.013),'#88705A');
 const flap=ribbon([{x:-.196,y:.795},{x:-.196,y:.771},{x:-.196,y:.735},{x:-.196,y:.714}],.105,pouch,.008,'#947C64');
 const strap=ribbon([{x:.112,y:1.17},{x:.094,y:1.10},{x:.05,y:1.015},{x:0,y:.93},{x:-.05,y:.85},{x:-.09,y:.79},{x:-.114,y:.76}],.020,torso,.013,'#947C64');
 const end=fabric(sculptSweep([[-.114,.76,frontZ(-.114,.76,[torso])-.013],[-.132,.77,frontZ(-.132,.77,[torso])-.008],[-.153,.778,-.025],[-.165,.782,.025],[-.162,.787,.078],[-.155,.789,frontZ(-.155,.789,[pouch])-.003]],[.010,.010,.010],[.003,.003,.003],6,4),'#947C64');
 body.recipe=[torso,blouse,neck,...fronts,skirt,scarf,tail,pouch,flap,strap,end];
 for(const side of [-1,1]){
  const p=parts.find(p=>p.id==='arm-'+(side<0?'left':'right'))!;
  p.recipe=[fabric(sculptLoft([{y:-.224,x:.051,z:.048,cx:side*.006},{y:-.18,x:.067,z:.062,cx:side*.007},{y:-.10,x:.078,z:.068},{y:-.025,x:.075,z:.065},{y:.018,x:.061,z:.056,cx:-side*.014},{y:.056,x:.018,z:.023,cx:-side*.055}],16,.035)),fabric(sculptLoft([{y:-.230,x:.044,z:.043,cx:side*.006},{y:-.222,x:.063,z:.058,cx:side*.006},{y:-.195,x:.070,z:.064,cx:side*.006},{y:-.177,x:.053,z:.049,cx:side*.006}],12,.018),'#7C96A1')];
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

