import {NativeCommitPresentation} from '../src/presentation/native-commits';
import {resolveMotionPolicy} from '../src/presentation/native-motion';
/** VM tests execute real app commit/lifecycle code; only renderer objects stubbed. */
export function nativeContext(){return {nativePresentation:new NativeCommitPresentation(),resolveMotionPolicy,pendingCommand:undefined,matchMedia:()=>({matches:false}),nativeActors:{clearProps:()=>{}},routes:{cancelPresentation:()=>{}}};}
