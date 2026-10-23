import fs from 'node:fs';
import {StaffMotionPlayer,type StaffPlaybackPose} from '../src/presentation/native-staff-player';
import {sampleStaff,type StaffServiceFrame} from '../src/presentation/native-staff';
const delta=(a:StaffPlaybackPose,b:StaffPlaybackPose)=>Math.max(...Object.keys(a.rotations).flatMap(id=>a.rotations[id].map((v,k)=>Math.abs(v-b.rotations[id][k]))));
const warm=(p:StaffMotionPlayer,t:number)=>{for(let n=0;n<Math.round(t*60);n++)p.tick(1/60,undefined,undefined,true);};
function probe(time:number,kind:'sale'|'stock'){
 const p=new StaffMotionPlayer();warm(p,time);const before=p.current,atZero=p.tick(0,{cue:{kind},progress:0},undefined,true);let last=atZero,max=0;
 const fades:number[]=[];for(let n=1;n<=30;n++){const pose=p.tick(1/60,{cue:{kind},progress:n/60/(kind==='sale'?2.8:2)},undefined,true);max=Math.max(max,delta(last,pose));fades.push(pose.propOpacity);last=pose;}
 return {time,kind,previousClip:before.clip,firstFrameJumpRadians:delta(before,atZero),maximum60HzJointDeltaRadians:max,outgoingPropOpacity:fades.slice(0,6),targetClip:last.clip,transitionFinished:!last.transitioning};
}
const before={kind:'source sampler reproduction, not GPU',tidyToSale:{from:sampleStaff(6.8).rotations['arm-right'][0],to:sampleStaff(6.8,{cue:{kind:'sale'},progress:0}).rotations['arm-right'][0],jump:1.12},serviceToIdleAt23:{from:sampleStaff(23,{cue:{kind:'sale'},progress:1}).rotations['arm-right'][0],to:sampleStaff(23).rotations['arm-right'][0],jump:.76}};
const after={kind:'stateful source playback measurements, geometry verified separately; not GPU',frameSeconds:1/60,transitions:[probe(6.8,'sale'),probe(22.8,'stock')],geometryRegression:'tests/v31-staff-blend.test.ts actual indexed hand/forearm vertices + closed garment solids and counter bounds; conditional service yaw full169phases plus recovery'};
fs.mkdirSync('evidence/native-v3_1',{recursive:true});fs.writeFileSync('evidence/native-v3_1/staff-before.json',JSON.stringify(before,null,2)+'\n');fs.writeFileSync('evidence/native-v3_1/staff-after.json',JSON.stringify(after,null,2)+'\n');console.log(JSON.stringify(after));
