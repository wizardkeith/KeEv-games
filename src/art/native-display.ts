import {centralStockSamples} from './central-composition-v11';
import {curateBackSample} from './mixed-display-v11';
import {relocateV11Decoration} from './decor-vignette-v11';
/** Curated physical samples, one per visible stock unit (maximum eight).
 * Units/metres; no inventory is created by staging. Fixtures are not SKUs. */
/** The existing handmade-vase stock uses two loose height groups. This is a
 * deterministic visual size variation, as already used for four-sample staging,
 * never a new product, tier, economic effect or additional owned unit. */
function vaseStockSample(k:number,table:number){
 const factor=[1.00,1.02,.94,1.06,.97,.88,1.04,.92][k],yaw=[-.24,.18,-.11,.25,-.30,.08,-.19,.22][k];
 const x=k<6?[-.03,.31,.65][k%3]:[.05,.58][k-6],z=k<6?[-.34,-.03][Math.floor(k/3)]:.36;
 return {at:[x,0,z] as [number,number,number],yaw,scale:factor*(table===1?.90:.94),stackLayer:0};
}
export function displaySamples(id:string,stock:number,table:number){
 const count=Math.min(8,Math.max(0,Math.floor(stock)));
 if(table===1)return centralStockSamples(id,count);
 if(id==='off.vase')return Array.from({length:count},(_,k)=>vaseStockSample(k,table));

 return Array.from({length:count},(_,k)=>{
  const flat=['off.notebook','off.card','off.tray','off.towel'].includes(id),scale=id==='off.tote'?.72:id==='off.notebook'?.90:id==='off.pencil'?1.12:.90;
  if(id==='off.pencil'){const upper=k>=4,j=k%4;return {at:[upper?.58:.10,0,upper?.26+j*.045:-.34+j*.06] as [number,number,number],yaw:(upper?.10:-.16)+(j-1.5)*.006,scale,stackLayer:0};}
  if(id==='off.tote')return {at:[k%2?.58:.10,0,[-.37,-.14,.09,.36][Math.floor(k/2)]] as [number,number,number],yaw:k%2?.025:-.025,scale,stackLayer:0};
  if(flat){const asymmetric=id==='off.notebook'||id==='off.card',column=asymmetric?[0,1,1,0,1,0,1,1][k]:k%2,layer=asymmetric?[0,0,1,1,2,2,3,4][k]:Math.floor(k/2);return {at:[column?.55:.10,0,column?-.18:-.23] as [number,number,number],yaw:(column?.06:-.07)+[0,.025,-.02,.015][layer%4],scale,stackLayer:layer};}
  return {at:[k<3?[-.02,.31,.66][k]:k<6?[0,.33,.64][k-3]:[.05,.58][k-6],0,k<3?[-.35,-.32,-.34][k]:k<6?[-.015,.015,.035][k-3]:.36] as [number,number,number],yaw:[-.23,.28,-.18,.12,-.30,.20,-.05,.31][k],scale,stackLayer:0};
 });
}

/** Fixed, non-authoritative back-shelf showroom samples, as in the retained
 * original scene. Grouped by material/height, rather than a repeated SKU grid.
 * These are decorative fixture samples, never purchasable stock or grants. */
export function backDisplaySamples(){
 const rows=[
  [['off.notebook',-2.85,3],['off.card',-2.23,1],['off.mug',-1.63,2],['off.tray',-.98,1],['off.tea',-.29,2],['off.vase',.45,1],['off.card',1.18,1]],
  [['off.mug',-2.86,2],['off.tea',-2.18,2],['off.card',-1.47,1],['off.notebook',-.77,3],['off.tote',.04,1],['off.vase',.72,1],['off.card',1.35,1]],
  [['off.vase',-2.92,1],['off.notebook',-2.38,3],['off.card',-1.69,1],['off.tea',-.99,2],['off.cookie',-.31,2],['off.towel',.40,2],['off.mug',1.19,2]],
 ] as const;
 return rows.flatMap((groups,row)=>groups.flatMap(([id,x,count],group)=>Array.from({length:count},(_,k)=>{const stack=['off.notebook','off.towel','off.cookie'].includes(id),upright=id==='off.card';return curateBackSample(relocateV11Decoration({id,at:[x+(stack?k*.012:(k-(count-1)/2)*.18),[1.0025,1.5225,2.2825][row]+.004+(stack?k*(id==='off.notebook'?.055:id==='off.cookie'?.11:.15):0)+(upright?.17:0),2.84+(k%2?-.035:.02)] as [number,number,number],turn:[upright?-1.18:0,(row-1)*.08+(k-.5)*.13,0] as [number,number,number],scale:id==='off.notebook'?.90:.85}),row,group,k);}))); 
}
