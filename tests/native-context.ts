import {NativeShopLife} from '../src/presentation/native-shop-life';
import {saleAccountingText} from '../src/presentation/sale-accounting';
import {catalog} from '../src/core/contracts';
import {NativeDelivery} from '../src/presentation/native-delivery';
import {guidanceText,nextSandboxOpening} from '../src/ui/shop-guidance';
import {NativeCommitPresentation} from '../src/presentation/native-commits';
import {resolveMotionPolicy} from '../src/presentation/native-motion';
/** VM tests execute real app commit/lifecycle code; only renderer objects stubbed. */
export function nativeContext(){return {life:new NativeShopLife(),lifeNode:{hidden:true},saleAccountingText,money:(n:number)=>new Intl.NumberFormat('en',{style:'currency',currency:'JPY',maximumFractionDigits:0}).format(n*catalog.config.yenPerUnit),showMargin:()=>{},marginWatermark:-1,pendingMargins:new Map(),activeMargin:undefined,marginNode:{hidden:true},delivery:new NativeDelivery(),returnPending:false,guidanceText,nextSandboxOpening,nativePresentation:new NativeCommitPresentation(),resolveMotionPolicy,pendingCommand:undefined,matchMedia:()=>({matches:false}),nativeActors:{clearProps:()=>{}},routes:{cancelPresentation:()=>{}}};}
