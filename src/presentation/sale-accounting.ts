import type {Snapshot} from '../core/contracts';
export interface SaleAccounting {revision:number;units:number;revenue:number;cost:number;grossMargin:number;}
/** Actual persisted report delta, including accumulated/weighted cost basis.
 * Purchases, support and overhead are not sale revenue/cost. No price estimate,
 * fictional buyer association or write is performed here. */
export function saleAccounting(before:Snapshot,after:Snapshot):SaleAccounting|undefined {
 const units=after.eventSequence-before.eventSequence;
 if(before.mode!==after.mode||before.shopId!==after.shopId||after.revision<=before.revision||units<=0)return;
 const sum=(s:Snapshot,key:'sales'|'cogs')=>s.reports.reduce((n,r)=>n+r[key],0),revenue=sum(after,'sales')-sum(before,'sales'),cost=sum(after,'cogs')-sum(before,'cogs');
 if(![units,revenue,cost].every(Number.isSafeInteger)||revenue<0||cost<0)return;
 return Object.freeze({revision:after.revision,units,revenue,cost,grossMargin:revenue-cost});
}
const copy={
 'zh-HK':{label:'本次結算毛利 · {n}件',note:'未扣人工、租金等費用',detail:'已售收入減實際已售商品成本；這是本次結算合計，不代表單一顧客的交易。'},
 en:{label:'Settlement gross margin · {n} units',note:'Before wages, rent and other overhead',detail:'Actual sale revenue minus actual cost of goods sold. This is the settlement total, not one customer’s purchase.'},
 'zh-CN':{label:'本次结算毛利 · {n}件',note:'未扣人工、租金等费用',detail:'已售收入减实际已售商品成本；这是本次结算合计，不代表单一顾客的交易。'},
 ja:{label:'今回の精算の売上総利益 · {n}点',note:'人件費・家賃などの経費を引く前',detail:'実際の売上から実際の売上原価を引いた精算の合計です。特定のお客様の購入額ではありません。'},
 th:{label:'กำไรขั้นต้นรอบนี้ · {n} ชิ้น',note:'ยังไม่หักค่าแรง ค่าเช่า และค่าใช้จ่ายอื่น',detail:'รายรับจริงจากการขายหักต้นทุนจริงของสินค้าที่ขาย เป็นยอดรวมรอบนี้ ไม่ใช่ยอดซื้อของลูกค้าคนใดคนหนึ่ง'}
} as const;
export function saleAccountingText(locale:string,units:number){const c=copy[locale as keyof typeof copy]??copy.en;return {...c,label:c.label.replace('{n}',String(units))};}
export interface SaleMarginPayload extends SaleAccounting {label:string;note:string;detail:string;signed:string;}
