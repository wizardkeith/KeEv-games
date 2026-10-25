/** Original analytic room-light probe; no photographed/reflected reference image.
 * Broad cool window, cream ceiling and warm timber bounce. Six linear RGB faces
 * and their incident radiance directions are reusable in a native IBL adapter.
 * A soft approximate room probe, not ray-traced reflections or baked sales FX.
 */
export const roomProbeContract={id:'native.v9.room-probe',size:16,intensity:.8,encoding:'linear RGB unsigned-byte',faces:['+X','-X','+Y','-Y','+Z','-Z'],source:'src/art/native-room-probe.ts'} as const;
export function roomProbeData(size=roomProbeContract.size){
 const samples:{direction:number[];color:number[];weight:number}[]=[],faces:Uint8Array[]=[];
 for(let face=0;face<6;face++){
  const data=new Uint8Array(size*size*3);
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
   const u=2*(x+.5)/size-1,v=2*(y+.5)/size-1,raw=[[1,-v,-u],[-1,-v,u],[u,1,v],[u,-1,-v],[u,-v,1],[-u,-v,-1]][face],length=Math.hypot(...raw),d=raw.map(n=>n/length);
   const sky=Math.max(0,d[1]),floor=Math.max(0,-d[1]),window=Math.max(0,-d[0])**14*Math.exp(-(((d[1]-.16)/.56)**4));
   const color=[.18+sky*.22+floor*.10+window*.40,.15+sky*.22+floor*.065+window*.44,.12+sky*.21+floor*.035+window*.48];
   for(let k=0;k<3;k++)data[(y*size+x)*3+k]=Math.round(Math.min(1,color[k])*255);
   samples.push({direction:d,color:color.map(c=>Math.round(Math.min(1,c)*255)/255),weight:4/(size*size*(1+u*u+v*v)**1.5)});
  }
  faces.push(data);
 }
 const sum=samples.reduce((a,s)=>a+s.weight,0);for(const s of samples)s.weight*=4*Math.PI/sum;
 return {faces,samples};
}
