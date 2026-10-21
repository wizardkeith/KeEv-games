// Portable presentation intent for the static Living Diorama candidate.
// Lighting coefficients are Babylon adapter values, not calibrated lux or native URP parity.
export const artDirection={
 id:'living-diorama.w1_1b',
 key:{color:'#FFE5C2',intensity:1.75,direction:[.78,-.82,.22] as const,position:[-8,8,-2] as const},
 fill:{color:'#EDF1FA',ground:'#AA9A8B',intensity:.72},
 shadow:{size:1024,normalBias:.008,bias:.0005,darkness:.18},
 floorY:.079,fixtureBaseY:.08,actorBaseY:.065,
 displaySurfaceY:.08+.94+.105/2,
 restingGap:.001,
 // Existing room/plinth outer extents and top wall edges; deliberately no fictitious roof.
 framingHull:[[-5,-.42,-4],[-5,-.42,4],[5,-.42,-4],[5,-.42,4],[-4.58,3.5,-3.38],[-4.58,3.5,3.38],[4.55,3.5,3.38],[2.6,1.5,-2.45]] as readonly (readonly number[])[],
 target:[.85,.85,-.85] as const,
 cameraMargin:.94,framingGuard:1.001,preferredDistanceScale:.88
} as const;
export function framingProjection(point:readonly number[],alpha:number,beta:number){
 const [tx,ty,tz]=artDirection.target,[x,y,z]=point.map((v,i)=>v-[tx,ty,tz][i]);
 return {x:x*Math.sin(alpha)-z*Math.cos(alpha),y:-x*Math.cos(alpha)*Math.cos(beta)+y*Math.sin(beta)-z*Math.sin(alpha)*Math.cos(beta),depth:x*Math.cos(alpha)*Math.sin(beta)+y*Math.cos(beta)+z*Math.sin(alpha)*Math.sin(beta)};
}
export function curatedRadius(aspect:number,fov=.8){
 if(!Number.isFinite(aspect)||aspect<=0||fov<=0||fov>=Math.PI)throw Error('invalid framing');
 const tangent=Math.tan(fov/2)*artDirection.cameraMargin;let fit=0;
 // Fit the retained yaw/elevation envelope, including before a player rotates.
 for(const alpha of Array.from({length:9},(_,i)=>-Math.PI/4-.27+i*.0675))for(const degrees of [45,47.5,50,52.5,55])for(const p of artDirection.framingHull){
  const q=framingProjection(p,alpha,degrees*Math.PI/180);fit=Math.max(fit,q.depth+Math.abs(q.x)/(tangent*aspect),q.depth+Math.abs(q.y)/tangent);
 }
 const previous=Math.min(26,Math.max(15.8,12/aspect));
 return Math.max(previous*artDirection.preferredDistanceScale,fit*artDirection.framingGuard);
}
