/** Independent editable short-hair sculpt and sewn visitor clothing. Existing
 * articulation, hand sockets, foot rest and transactional transfer bag retained. */
import sculpt from '../../assets/masters/native-v11/visitor-a-head.json';
import type {NativeMesh,NativePart,NativeSurface} from './native-characters';
import type {Geometry} from './geometry';
import {sculptLoft,sculptSweep,finishSculpt} from './sculpt-v10';
import {createV11Portrait} from './portrait-v11';
import {frontZ,fittedPattern} from './garments-v11';
import {rebuildV11Hands} from './hands-v11';
import {rebuildV11Shoes} from './shoes-v11';
const source=sculpt as (NativeMesh&{authoringName:string})[];
const portrait=createV11Portrait(source[0].geometry,'/assets/native-v11/visitor-a-skin.png',undefined,'#4F3729');
const fabric=(geometry:Geometry,color='#B47E62'):NativeMesh=>({shape:'mesh',at:[0,0,0],geometry,color,role:'fabric',roughness:.90});
function collar(side:number):NativeMesh{
 const points=[[.022,1.202,-.055],[.055,1.192,-.073],[.080,1.157,-.114],[.056,1.135,-.134],[.025,1.169,-.094]],g:Geometry={positions:[],normals:[],indices:[]};
 for(let layer=0;layer<2;layer++)for(const [x,y,z]of points)g.positions.push(side*x,y,z+layer*.003);
 for(let j=1;j<4;j++)g.indices.push(0,j,j+1,5,5+j+1,5+j);
 for(let j=0;j<5;j++){const n=g.positions.length/3;for(const k of [j,(j+1)%5,j+5,(j+1)%5+5])g.positions.push(...g.positions.slice(k*3,k*3+3));g.indices.push(n,n+1,n+2,n+1,n+3,n+2);}
 return fabric(finishSculpt(g),'#C48C70');
}
/** Thick narrow ribbon mounted on actual support triangles, including the
 * diagonal strap. Both layers move together; no depth bias or floating bar. */
function ribbon(rows:{x:number;y:number}[],width:number,support:NativeMesh,gap:number,color:string):NativeMesh{
 const g:Geometry={positions:[],normals:[],indices:[]},count=rows.length*2;
 for(let layer=0;layer<2;layer++)for(const {x,y}of rows)for(const dx of [-width/2,width/2]){const z=frontZ(x+dx,y,[support]);if(!Number.isFinite(z))throw Error('visitor ribbon outside support');g.positions.push(x+dx,y,z-gap+layer*.003);}
 for(let layer=0;layer<2;layer++)for(let i=0;i<rows.length-1;i++){const a=layer*count+i*2;g.indices.push(...(layer?[a,a+1,a+2,a+1,a+3,a+2]:[a,a+2,a+1,a+1,a+2,a+3]));}
 const edge=(a:number,b:number)=>{const n=g.positions.length/3;for(const k of [a,b,a+count,b+count])g.positions.push(...g.positions.slice(k*3,k*3+3));g.indices.push(n,n+1,n+2,n+1,n+3,n+2);};
 edge(1,0);edge(count-2,count-1);for(let i=0;i<rows.length-1;i++){edge(i*2,(i+1)*2);edge((i+1)*2+1,i*2+1);}return fabric(finishSculpt(g),color);
}
function clothes(parts:NativePart[]){
 const body=parts.find(p=>p.id==='body')!,old=body.recipe;
 const torso=fabric(sculptLoft([{y:.68,x:.144,z:.106},{y:.79,x:.156,z:.116},{y:.95,x:.183,z:.134,cz:-.003},{y:1.07,x:.199,z:.127,cz:-.003},{y:1.125,x:.188,z:.109},{y:1.173,x:.132,z:.082},{y:1.201,x:.063,z:.052}],20,.014));
 const placket=ribbon([{x:0,y:.71},{x:0,y:.85},{x:0,y:1.0},{x:0,y:1.13},{x:0,y:1.19}],.018,torso,.004,'#BF876A');
 const neck:NativeMesh={...fabric(sculptLoft([{y:1.19,x:.044,z:.042},{y:1.226,x:.042,z:.040},{y:1.263,x:.046,z:.043}],12),'#DFB799'),role:'skin',roughness:.78};
 const insert=fittedPattern([{y:1.15,inner:-.025,outer:.025},{y:1.185,inner:-.025,outer:.025},{y:1.195,inner:-.019,outer:.019}],torso,1,.005,'#E7D6BB');
 const pouch=fabric(sculptLoft([{y:.619,x:.066,z:.025,cx:.208,cz:-.090},{y:.633,x:.086,z:.038,cx:.208,cz:-.090},{y:.746,x:.090,z:.040,cx:.208,cz:-.090},{y:.812,x:.080,z:.035,cx:.208,cz:-.090},{y:.830,x:.068,z:.024,cx:.208,cz:-.090}],16,.012),'#B19A76');
 const flap=ribbon([{x:.208,y:.819},{x:.208,y:.797},{x:.208,y:.765},{x:.208,y:.744}],.125,pouch,.004,'#BEAA86');
 const strap=ribbon([{x:-.112,y:1.17},{x:-.094,y:1.10},{x:-.05,y:1.015},{x:0,y:.93},{x:.05,y:.85},{x:.09,y:.78},{x:.114,y:.75}],.024,torso,.010,'#BEAA86');
 const strapEnd=fabric(sculptSweep([[.114,.75,frontZ(.114,.75,[torso])-.010],[.132,.78,-.111],[.147,.810,frontZ(.147,.810,[pouch])-.003]],[.012,.012,.012],[.003,.003,.003],6,4),'#BEAA86');
 const pocket=fittedPattern([{y:.91,inner:.078,outer:.143},{y:.945,inner:.077,outer:.146},{y:.985,inner:.076,outer:.142}],torso,-1,.004,'#AC745A');
 body.recipe=[torso,insert,neck,placket,collar(-1),collar(1),pocket,old[7],pouch,flap,strap,strapEnd];
 for(let i=0;i<4;i++){const y=1.12-i*.10;body.recipe.push({...old[11+i],at:[0,y,frontZ(0,y,[torso])-.009]});}
 for(const side of [-1,1]){const s=side<0?'left':'right';
  parts.find(p=>p.id==='arm-'+s)!.recipe=[fabric(sculptLoft([{y:-.222,x:.047,z:.045,cx:side*.007},{y:-.18,x:.063,z:.059,cx:side*.007},{y:-.10,x:.074,z:.066},{y:-.025,x:.074,z:.064},{y:.018,x:.060,z:.055,cx:-side*.014},{y:.055,x:.018,z:.023,cx:-side*.055}],16,.027))];
  parts.find(p=>p.id==='forearm-'+s)!.recipe=[fabric(sculptLoft([{y:-.168,x:.029,z:.030},{y:-.15,x:.041,z:.040},{y:-.10,x:.046,z:.044},{y:-.02,x:.049,z:.046},{y:.014,x:.047,z:.045}],14,.026)),fabric(sculptLoft([{y:-.17,x:.030,z:.030},{y:-.164,x:.043,z:.041},{y:-.139,x:.044,z:.042},{y:-.132,x:.038,z:.038}],12,.012),'#C18B6F')];
 }
 rebuildV11Hands(parts);rebuildV11Shoes(parts);
 for(const p of parts){if(p.id.startsWith('hand-'))p.recipe=p.recipe.map(s=>({...s,color:'#DFB799'}));if(p.id.startsWith('foot-'))p.recipe=p.recipe.map((s,i)=>({...s,color:i===0?'#D7CCB6':i===1?'#A99A81':'#E3D8C2',role:i===0?'fabric':s.role??'paint',roughness:i===0?.94:s.roughness}));}
}
let cached:NativePart[]|undefined;
export function rebuildV11Male(parts:NativePart[]):NativePart[]{
 if(cached)return cached;
 parts.find(p=>p.id==='head')!.recipe=source.filter(s=>!s.authoringName.startsWith('Male temple'));
 for(const side of [-1,1]){const name=side<0?'left':'right',hair=parts.find(p=>p.id==='hair-secondary-'+name)!,s=source.find(s=>s.authoringName==='Male temple '+side)!;hair.recipe=[{...s,geometry:{...s.geometry,positions:s.geometry.positions.map((v,i)=>v-hair.pivot[i%3])}}];
  const eye=parts.find(p=>p.id==='eye-'+name)!;eye.pivot=[side*.083,.156,0];eye.recipe=portrait.eye(eye.pivot);
  const lid=parts.find(p=>p.id==='eyelid-'+name)!;lid.pivot=[...eye.pivot];lid.recipe=[portrait.stroke([[-.052,.001,0],[-.018,-.009,0],[.021,-.008,0],[.052,.004,0]],lid.pivot)];
  const brow=parts.find(p=>p.id==='brow-'+name)!;brow.pivot=[side*.084,.221,0];brow.recipe=[portrait.pigment([[-.035,-.002,0],[-.012,.005,0],[.015,.004,0],[.035,-.003,0]],brow.pivot,.0025)];
 }
 const mouth=parts.find(p=>p.id==='mouth')!;mouth.pivot=[0,.057,0];mouth.recipe=[{...portrait.stroke([[-.023,.002,0],[-.008,-.003,0],[.008,-.003,0],[.023,.002,0]],mouth.pivot,.0012),color:'#9E6657'}];
 clothes(parts);cached=parts;return parts;
}
