/** Fixed browsing anchors, in shop metres. Roots never walk/slide or spawn at origin. */
export const customerPoses=[{x:1.30,y:.09,z:.83,yaw:-2.18},{x:-.58,y:.09,z:-2.40,yaw:1.15}] as const;
export function customerVisible(index:number,trading:boolean,low:boolean){return trading&&(!low||index===0);}
export function browsePose(index:number,time:number,animate:boolean){return {headYaw:animate?Math.sin(time*.00036+index*2)*.045:0,armAngle:animate?Math.sin(time*.00048+index)*.035:0};}
