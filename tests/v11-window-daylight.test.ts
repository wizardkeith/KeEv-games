import test from 'node:test';import assert from 'node:assert/strict';
import {nativeWindowCanopy} from '../src/art/native-styling';
import {nativeSurfaceGeometry} from '../src/art/native-characters';
import {nativeLighting,nativeCameraFrame} from '../src/art/native-view';
import {windowPortalPlanes,windowPortalIntent} from '../src/art/window-portal-v11';
import {buildV11Exterior} from '../src/art/fixtures-v11';
test('rebuilt near tree surfaces stay outside glass through the retained wind range and leave actual visible crowns',()=>{
 const canopy=nativeWindowCanopy(),camera=nativeCameraFrame(1.2),pos:[number,number,number]=[.7+camera.radius*Math.cos(-Math.PI/4)*Math.sin(50*Math.PI/180),1.15+camera.radius*Math.cos(50*Math.PI/180),camera.radius*Math.sin(-Math.PI/4)*Math.sin(50*Math.PI/180)],planes=windowPortalPlanes(pos);let visible=0,total=0;
 for(const p of canopy){assert.equal(p.shape,'mesh');if(p.shape!=='mesh')continue;for(const angle of[-.018,0,.018])for(let i=0;i<p.geometry.positions.length;i+=3){const [x,y,z]=p.geometry.positions.slice(i,i+3),world=[x+p.at[0],y*Math.cos(angle)-z*Math.sin(angle)+p.at[1],y*Math.sin(angle)+z*Math.cos(angle)+p.at[2]];assert.ok(world[0]<-4.60,'no new leaf or branch crosses the real window/glass plane');if(angle===0&&p.role==='leaf'){total++;if(planes.every(q=>q[0]*world[0]+q[1]*world[1]+q[2]*world[2]+q[3]<=0))visible++;}}}
 assert.ok(visible>total*.15,'a canopy outside the camera portal is not a rendered improvement');assert.ok(visible<total*.85,'retain a broken crown opening for the distant architecture and sky');
});
test('one actual window sunlight direction reaches the shop floor through the aperture from connected near foliage',()=>{
 const d=nativeLighting.key.direction;assert.ok(d[0]>0&&d[1]<0);let admitted=0;
 for(const p of nativeWindowCanopy().filter(p=>p.role==='leaf')){const g=nativeSurfaceGeometry(p);for(let i=0;i<g.positions.length;i+=3){const [x,y,z]=g.positions.slice(i,i+3),t=(windowPortalIntent.apertureX-x)/d[0],wy=y+t*d[1],wz=z+t*d[2],floorT=(.079-y)/d[1],fx=x+floorT*d[0],fz=z+floorT*d[2];if(t>0&&wy>.925&&wy<2.755&&wz>-2.055&&wz<2.055&&fx>-4.4&&fx<4.4&&fz>-3.2&&fz<3.2)admitted++;}}
 assert.ok(admitted>100,'real leaf positions must have a sun ray through the actual aperture onto the interior floor; visual softness still requires rendered review');
 const outside=buildV11Exterior();assert.ok(outside.every(p=>{const g=nativeSurfaceGeometry(p);return g.positions.filter((_,i)=>i%3===0).every(x=>x<-5.9);}),'all rebuilt neighbour assets remain outside shop/navigation');
});
