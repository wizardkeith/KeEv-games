import {Ray} from '@babylonjs/core/Culling/ray.core';import {Vector3} from '@babylonjs/core/Maths/math.vector';import {windowTreeSkeletons} from '../src/art/shop-v11';
import test from 'node:test';import assert from 'node:assert/strict';
import {nativeWindowCanopy} from '../src/art/native-styling';
import {nativeSurfaceGeometry} from '../src/art/native-characters';
import {nativeLighting,nativeCameraFrame} from '../src/art/native-view';
import {windowPortalPlanes,windowPortalIntent} from '../src/art/window-portal-v11';
import {buildV11Exterior} from '../src/art/fixtures-v11';
test('rebuilt near tree surfaces stay outside glass through the retained wind range and leave actual visible crowns',()=>{
 const canopy=nativeWindowCanopy(),camera=nativeCameraFrame(1.2),pos:[number,number,number]=[.7+camera.radius*Math.cos(-Math.PI/4)*Math.sin(50*Math.PI/180),1.15+camera.radius*Math.cos(50*Math.PI/180),camera.radius*Math.sin(-Math.PI/4)*Math.sin(50*Math.PI/180)],planes=windowPortalPlanes(pos);let visible=0,total=0;
 for(const p of canopy){assert.equal(p.shape,'mesh');if(p.shape!=='mesh')continue;for(const angle of[-.018,0,.018])for(let i=0;i<p.geometry.positions.length;i+=3){const [x,y,z]=p.geometry.positions.slice(i,i+3),world=[x+p.at[0],y*Math.cos(angle)-z*Math.sin(angle)+p.at[1],y*Math.sin(angle)+z*Math.cos(angle)+p.at[2]];assert.ok(world[0]<-4.60,'no new leaf or branch crosses the real window/glass plane');if(angle===0&&p.role==='leaf'){total++;if(planes.every(q=>q[0]*world[0]+q[1]*world[1]+q[2]*world[2]+q[3]<=0))visible++;}}}
 assert.ok(visible>total*.15,'a canopy outside the camera portal is not a rendered improvement');// C38 intentionally moves more leaves inside the portal; vertex percentages
 // no longer measure an opening. Test actual rays through the accepted gap.
 for(const z of[-.30,.35,1.0])for(const y of[1.43,1.75,2.07]){const origin=Vector3.FromArray(pos),point=new Vector3(-4.47,y,z),ray=new Ray(origin,point.subtract(origin).normalize(),30);for(const p of canopy){const g=nativeSurfaceGeometry(p);for(let i=0;i<g.indices.length;i+=3){const v=g.indices.slice(i,i+3).map(n=>Vector3.FromArray(g.positions.slice(n*3,n*3+3)));assert.equal(!!ray.intersectsTriangle(v[0],v[1],v[2]),false,'actual accepted roof/sky opening ray is obstructed');}}}
});
test('one actual window sunlight direction reaches the shop floor through the aperture from connected near foliage',()=>{
 const d=nativeLighting.key.direction;assert.ok(d[0]>0&&d[1]<0);let area=0,faces=0;
 // Physical projected leaf area, independent of vertex/triangle sampling density.
 // Keep real triangles whose complete sun rays pass the aperture and hit floor.
 for(const p of nativeWindowCanopy().filter(p=>p.role==='leaf')){const g=nativeSurfaceGeometry(p);for(let i=0;i<g.indices.length;i+=3){const v=g.indices.slice(i,i+3).map(n=>g.positions.slice(n*3,n*3+3)),q=v.map(([x,y,z])=>{const t=(windowPortalIntent.apertureX-x)/d[0],wy=y+t*d[1],wz=z+t*d[2],ft=(.079-y)/d[1],fx=x+ft*d[0],fz=z+ft*d[2];return{valid:t>0&&wy>.925&&wy<2.755&&wz>-2.055&&wz<2.055&&fx>-4.4&&fx<4.4&&fz>-3.2&&fz<3.2,x:fx,z:fz};});if(q.every(p=>p.valid)){area+=Math.abs((q[1].x-q[0].x)*(q[2].z-q[0].z)-(q[2].x-q[0].x)*(q[1].z-q[0].z))*.5;faces++;}}}
 assert.ok(area>.03&&faces>=6,'connected near leaves must cast at least .03m2 of actual triangle area through window onto floor; overlap/visual softness not certified');
 const outside=buildV11Exterior();assert.ok(outside.every(p=>{const g=nativeSurfaceGeometry(p);return g.positions.filter((_,i)=>i%3===0).every(x=>x<-5.9);}),'all rebuilt neighbour assets remain outside shop/navigation');
});

test('every rebuilt primary bough starts inside the actual swept trunk, not a detached guessed axis',()=>{
 for(const tree of windowTreeSkeletons()){const trunk=nativeSurfaceGeometry(tree.stem);for(const branch of tree.branches){const g=nativeSurfaceGeometry(branch.stem),center=[0,1,2].map(k=>[0,1,2,3].reduce((n,j)=>n+g.positions[j*3+k],0)/4);assert.ok(Math.hypot(...center.map((v,k)=>v-branch.joint[k]))<1e-8);for(const sign of[-1,1]){const ray=new Ray(Vector3.FromArray(center),new Vector3(sign,0,0),.10),hits=[];for(let i=0;i<trunk.indices.length;i+=3){const v=trunk.indices.slice(i,i+3).map(n=>Vector3.FromArray(trunk.positions.slice(n*3,n*3+3))),h=ray.intersectsTriangle(v[0],v[1],v[2]);if(h&&h.distance>1e-8)hits.push(h.distance);}assert.ok(hits.length&&Math.min(...hits)<.07,'both horizontal directions exit nearby real trunk skin, proving an embedded fork root');}}}
});
