import test from 'node:test';
import assert from 'node:assert/strict';
import {StaffMotionPlayer} from '../src/presentation/native-staff-player';

test('visible staff work arrives within ten seconds initially and after genuine service, with fresh transitions',()=>{
 const player=new StaffMotionPlayer();let first:number|undefined;
 for(let n=0;n<600;n++){const pose=player.tick(1/60,undefined,undefined,true);if(pose.prop.visible){first=(n+1)/60;break;}}
 assert.ok(first!==undefined&&first<=10,'a short shop visit includes visible work');
 for(let n=0;n<=120;n++)player.tick(1/60,{cue:{kind:'stock'},progress:n/120},undefined,true);
 let after:number|undefined;
 for(let n=0;n<600;n++){const pose=player.tick(1/60,undefined,undefined,true);if(pose.clip.includes('tidy')||pose.clip.includes('check-note')){if(pose.prop.visible){after=(n+1)/60;break;}}}
 assert.ok(after!==undefined&&after<=10,'service does not impose a long empty idle gap');
 player.cancel();const resume=player.tick(1/60,undefined,undefined,true);assert.equal(resume.prop.visible,false,'cancelled work is discarded, not replayed on return');
});
