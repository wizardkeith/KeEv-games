/** Visible presentation elapsed time, not economic/server/offline time.
 * Consume a slow visible frame in collision-safe <=50ms steps instead of losing
 * all but50ms. Bound stalls to1s; hidden/resume is a fresh baseline, no catch-up. */
export function nativeVisibleSteps(elapsedMilliseconds:number,visible=true){
 if(!Number.isFinite(elapsedMilliseconds)||elapsedMilliseconds<0)throw new RangeError('native elapsed');
 const consumed=visible?Math.min(1000,elapsedMilliseconds):0,count=Math.max(1,Math.ceil(consumed/50));
 return {milliseconds:consumed,droppedMilliseconds:visible?Math.max(0,elapsedMilliseconds-consumed):0,steps:Array(count).fill(consumed/count/1000) as number[]};
}
