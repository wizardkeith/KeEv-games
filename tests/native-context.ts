import {NativeDelivery} from '../src/presentation/native-delivery';
import {guidanceText,nextSandboxOpening} from '../src/ui/shop-guidance';
import {NativeCommitPresentation} from '../src/presentation/native-commits';
import {resolveMotionPolicy} from '../src/presentation/native-motion';
/** VM tests execute real app commit/lifecycle code; only renderer objects stubbed. */
export function nativeContext(){return {pendingMargins:new Map(),activeMargin:undefined,marginNode:{hidden:true},delivery:new NativeDelivery(),returnPending:false,guidanceText,nextSandboxOpening,nativePresentation:new NativeCommitPresentation(),resolveMotionPolicy,pendingCommand:undefined,matchMedia:()=>({matches:false}),nativeActors:{clearProps:()=>{}},routes:{cancelPresentation:()=>{}}};}
