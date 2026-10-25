/** Public Chrome DevTools screencast API + installed system FFmpeg. Captures
 * every delivered browser frame continuously; metadata timestamps retain gaps,
 * no cuts/time acceleration and no screenshot-polling substitute. No download,
 * proxy/access change or owner-browser connection. Cloud software-render only. */
const fs=require('fs'),path=require('path'),{spawn}=require('node:child_process');
exports.start=async function(context,page,out){
 const dir=path.join(out,'cdp-frames');fs.mkdirSync(dir,{recursive:true});const cdp=await context.newCDPSession(page),frames=[];let active=true;
 cdp.on('Page.screencastFrame',event=>{if(active){const name=String(frames.length).padStart(6,'0')+'.jpg';fs.writeFileSync(path.join(dir,name),Buffer.from(event.data,'base64'));frames.push({name,timestamp:event.metadata.timestamp,received:Date.now()/1000});}void cdp.send('Page.screencastFrameAck',{sessionId:event.sessionId}).catch(()=>{});});
 await cdp.send('Page.startScreencast',{format:'jpeg',quality:92,maxWidth:1280,maxHeight:900,everyNthFrame:1});
 return {stop:async()=>{await cdp.send('Page.stopScreencast');active=false;await cdp.detach();if(frames.length<2)throw Error('No continuous browser frames recorded');
  const lines=['ffconcat version 1.0'];for(let i=0;i<frames.length;i++){lines.push(`file '${frames[i].name}'`);if(i<frames.length-1)lines.push('duration '+Math.max(.001,(frames[i+1].timestamp??frames[i+1].received)-(frames[i].timestamp??frames[i].received)).toFixed(6));}
  fs.writeFileSync(path.join(dir,'frames.ffconcat'),lines.join('\n')+'\n');fs.writeFileSync(path.join(out,'recording-provenance.json'),JSON.stringify({method:'Public CDP Page.startScreencast, everyNthFrame1; installed /usr/bin/ffmpeg encoder',frames,uncut:true,timeAcceleration:false,encodedFrameCountIsNotPhysicalGPUFPS:true,bundledPlaywrightRecorder:'Unavailable: official FFmpeg helper CDN download returned403; no alternate download attempted'},null,2));
  const result=await new Promise(resolve=>{const p=spawn('/usr/bin/ffmpeg',['-hide_banner','-loglevel','error','-y','-safe','0','-f','concat','-i',path.join(dir,'frames.ffconcat'),'-fps_mode','vfr','-c:v','libvpx-vp9','-crf','32','-b:v','0',path.join(out,'gameplay-uncut.webm')]);let error='';p.stderr.on('data',b=>error+=b);p.on('exit',code=>resolve({code,error}));});if(result.code)throw Error('Local video encoding failed: '+result.error);return frames.length;
 }};
};
