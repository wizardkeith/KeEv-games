/** C27 same-table composition. Pure presentation; no economic/save input.
 * Fixed asset positions and two stable stock groups are shared by Web/native. */
import layout from '../content/layout.json';
import type {NativeSurface} from './native-characters';
import type {V3} from './recipes';
export const centralDisplayOffset=layout.displays[1].position;
export const centralComposition={
 floralAt:[.05+centralDisplayOffset[0],1.1735,.35+centralDisplayOffset[2]] as V3,floralScale:1.1,crownRoll:0,crownYaw:3.8,neckY:.3708,
 books:{x:.58+centralDisplayOffset[0],z:.35+centralDisplayOffset[2],scale:.78,riserHeight:.16},
 stockGroups:{back:5,front:3},
 note:'Same existing vase/books/cloth/cups. Mid-back floral axis; unequal stable5/3 stock clusters and clear central front linen. Not target acceptance.'
} as const;
const back=[[-.72,0],[-.40,.02],[-.72,-.34],[-.40,-.32],[-.65,.34]],front=[[.42,-.34],[.74,-.34],[.72,.01]],order=[['back',0],['front',0],['back',1],['front',1],['back',2],['back',3],['front',2],['back',4]]as const;
export function centralStockSamples(id:string,count:number){return Array.from({length:count},(_,k)=>{
 const[group,j]=order[k],base=(group==='back'?back:front)[j];
 if(['off.notebook','off.card','off.tray','off.towel'].includes(id)){const column=[0,1,1,0,1,0,1,1][k],layer=[0,0,1,1,2,2,3,4][k];return {at:[column?.58:-.65,0,column?-.24:-.17]as V3,yaw:(column?.06:-.07)+[0,.025,-.02,.015,0][layer],scale:.90,stackLayer:layer};}
 if(id==='off.pencil')return {at:[group==='back'?-.65:.72,0,(group==='back'?-.30:-.34)+j*.052]as V3,yaw:group==='back'?-.16:.10,scale:1.12,stackLayer:0};
 const factor=id==='off.vase'?[1,1.02,.94,1.06,.97,.88,1.04,.92][k]:1;
 return {at:[base[0],0,base[1]]as V3,yaw:[-.70,.55,.18,1.35,-1.15,-.35,-.45,.25][k],scale:factor*(id==='off.tote'?.72:.90),stackLayer:0};
});}
export function placeCentralFloral(parts:NativeSurface[],kind:'vessel'|'crown'):NativeSurface[]{return parts.map(p=>{
 if(p.shape!=='mesh')throw new Error('Central composition requires retained actual mesh');const g=structuredClone(p.geometry),s=centralComposition.floralScale,a=centralComposition.crownRoll,c=Math.cos(a),t=Math.sin(a);
 for(let i=0;i<g.positions.length;i+=3){let[x,y,z]=g.positions.slice(i,i+3),[nx,ny,nz]=g.normals.slice(i,i+3);
  if(kind==='vessel'){x=-x;z=-z;nx=-nx;nz=-nz;}else{const cy=Math.cos(centralComposition.crownYaw),sy=Math.sin(centralComposition.crownYaw);[x,z]=[x*cy+z*sy,-x*sy+z*cy];[nx,nz]=[nx*cy+nz*sy,-nx*sy+nz*cy];y-=centralComposition.neckY;[x,y]=[x*c-y*t,x*t+y*c];y+=centralComposition.neckY;[nx,ny]=[nx*c-ny*t,nx*t+ny*c];}
  g.positions[i]=x*s;g.positions[i+1]=y*s;g.positions[i+2]=z*s;g.normals[i]=nx;g.normals[i+1]=ny;g.normals[i+2]=nz;
 }
 return {...p,geometry:g,at:[...centralComposition.floralAt]as V3};
});}
