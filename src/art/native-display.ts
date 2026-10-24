/** Curated physical samples, one per visible stock unit (maximum four).
 * Units/metres; no inventory is created by staging. Fixtures are not SKUs. */
export function displaySamples(id:string,stock:number,table:number){
 const count=Math.min(4,Math.max(0,Math.floor(stock)));
 return Array.from({length:count},(_,k)=>{
  const scale=id==='off.pencil'?1.12:id==='off.notebook'?1.02:.94;
  if(id==='off.notebook'||id==='off.card')return {at:[k%2===0?-.32:.29,Math.floor(k/2)*(id==='off.notebook'?.067:.025)*scale+.009,k%2===0?.07:-.08] as [number,number,number],yaw:k%2===0?-.14:.12,scale};
  if(id==='off.pencil')return {at:[-.20+k*.10,.01,-.17+k*.09] as [number,number,number],yaw:-.32+k*.14,scale};
  // A loose triangle plus a paired fourth sample replaces the even scatter.
  const places=[[-.26,.10],[.08,.09],[.37,-.13],[-.28,-.22]];
  return {at:[places[k][0],.009,places[k][1]] as [number,number,number],yaw:[-.18,.14,-.05,.21][k]+table*.035,scale:scale*(k===0?1.04:k===3?.90:1)};
 });
}
