import {config,type Snapshot} from './contracts';
// Provisional, free W1.1 safety net. Support is financing, never operating profit.
export const recoveryPolicy={version:'w1.1-provisional-1',seedQuantity:5,rentHours:48,tradingHours:10};
export function purchaseCost(cost:number){const n=cost*(10000-Math.max(0,Math.min(config.discountCapBp,config.discountBp))),q=Math.floor(n/10000),r=n%10000;return q+Number(r*2>10000||(r*2===10000&&q%2===1));}
export function recoveryPreview(s:Snapshot){
 const cheapest=config.offerings.reduce((a,b)=>purchaseCost(a.cost)<=purchaseCost(b.cost)?a:b);
 const cost=purchaseCost(cheapest.cost),targetCash=cost*recoveryPolicy.seedQuantity+config.rentPerHour*recoveryPolicy.rentHours+(config.salaryPerHour+config.operatingPerHour)*recoveryPolicy.tradingHours;
 const stock=Object.values(s.inventory).reduce((a,i)=>a+i.stock,0);
 const eligible=stock===0&&s.cash<cost;
 return {eligible,itemId:cheapest.id,quantity:recoveryPolicy.seedQuantity,cost,targetCash,amount:eligible?targetCash-s.cash:0};
}
