/** Curated physical samples, one per visible stock unit (maximum eight).
 * Units/metres; no inventory is created by staging. Fixtures are not SKUs. */
export function displaySamples(id:string,stock:number,table:number){
 const count=Math.min(8,Math.max(0,Math.floor(stock)));
 return Array.from({length:count},(_,k)=>{
  if(count>4){const scale=id==='off.pencil'?1.12:id==='off.notebook'?1.02:id==='off.tote'?.72:.94;
   if(['off.notebook','off.card','off.tray','off.towel'].includes(id))return {at:[k%2?-.31:.31,Math.floor(k/4)*(id==='off.notebook'?.067:id==='off.tray'?.070:id==='off.towel'?.160:.025)*scale+.009,Math.floor(k%4/2)?-.22:.22] as [number,number,number],yaw:k%2?-.10:.08,scale};
   if(id==='off.pencil')return {at:[-.37+(k%4)*.16,.01,-.14+Math.floor(k/4)*.25] as [number,number,number],yaw:-.25+k%4*.09,scale};
   return {at:[-.54+(k%4)*.35,.009,-.20+Math.floor(k/4)*.40] as [number,number,number],yaw:[-.18,.15,-.22,.08][k%4]+table*.035,scale};
  }
  const scale=id==='off.pencil'?1.12:id==='off.notebook'?1.02:.94;
  if(id==='off.notebook'||id==='off.card')return {at:[k%2===0?-.32:.29,Math.floor(k/2)*(id==='off.notebook'?.067:.025)*scale+.009,k%2===0?.07:-.08] as [number,number,number],yaw:k%2===0?-.14:.12,scale};
  if(id==='off.pencil')return {at:[-.20+k*.10,.01,-.17+k*.09] as [number,number,number],yaw:-.32+k*.14,scale};
  // A loose triangle plus a paired fourth sample replaces the even scatter.
  const places=[[-.26,.10],[.08,.09],[.37,-.13],[-.28,-.22]];
  return {at:[places[k][0],.009,places[k][1]] as [number,number,number],yaw:[-.18,.14,-.05,.21][k]+table*.035,scale:scale*(k===0?1.04:k===3?.90:1)};
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
 return rows.flatMap((groups,row)=>groups.flatMap(([id,x,count])=>Array.from({length:count},(_,k)=>{const stack=['off.notebook','off.towel','off.cookie'].includes(id),upright=id==='off.card';return {id,at:[x+(stack?k*.012:(k-(count-1)/2)*.18),[1.0025,1.5225,2.2825][row]+.004+(stack?k*(id==='off.notebook'?.055:id==='off.cookie'?.11:.15):0)+(upright?.17:0),2.84+(k%2?-.035:.02)] as [number,number,number],turn:[upright?-1.18:0,(row-1)*.08+(k-.5)*.13,0] as [number,number,number],scale:id==='off.notebook'?.90:.85};})));
}
