import catalog from '../content/catalog.json';
export {catalog};
export type Mode='normal'|'sandbox';
export interface Item {stock:number;price:number;bookCost:number;demandRemainder:number}
export interface Report {day:string;sales:number;cogs:number;salary:number;rent:number;operating:number;units:number;net:number}
export interface Snapshot {shopId:string;region:string;district:string;archetype:string;specialization:string;layoutId:string;staffRoster:string[];schemaVersion:number;contentVersion:string;simulationVersion:string;mode:Mode;rankingEligible:boolean;worldStateId:string;shopName:string;companyName:string;logo:string;cash:number;purchases:number;watermark:number;lastWallTime:number;revision:number;open:boolean;revealed:boolean;tutorial:number;eventSequence:number;inventory:Record<string,Item>;shelves:string[];commandIds:string[];reports:Report[];breakdown:{id:string;value:number;unit:string}[];salaryRemainder:number;rentRemainder:number;operatingRemainder:number}
export interface Command {id:string;kind:string;itemId?:string;quantity?:number;price?:number;slot?:number;target?:number;text?:string;company?:string;logo?:string}
export const config={...catalog.config,salaryPerHour:catalog.staff.salaryPerHour,discountBp:catalog.supplier.discountBp,setPieces:catalog.set.pieces,setBonusBp:catalog.set.demandBonusBp,offerings:catalog.offerings};
export type Executor=(json:string)=>string;
export class Core {
 constructor(readonly execute:Executor){}
 call(op:string,state?:Snapshot,command?:Command,mode:Mode='normal',time=0):Snapshot {const result=JSON.parse(this.execute(JSON.stringify({op,state,command,config,mode,time})));if(!result.ok)throw new Error(result.error);return result.state;}
 create(mode:Mode,time:number){return this.call('create',undefined,undefined,mode,time);}
 validate(s:Snapshot){return this.call('validate',s);}
 apply(s:Snapshot,c:Command){return this.call('command',s,c);}
}
