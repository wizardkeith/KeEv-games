import {entryGardenRecipe} from '../src/art/entry-garden-v11';
import test from 'node:test';import assert from 'node:assert/strict';import {windowPortalPlanes} from '../src/art/window-portal-v11';
test('exterior portal preserves real window rays across allowed orbit angles and rejects cutaway spill',()=>{
 for(const alpha of [-1.055,-.785,-.515])for(const beta of [.785,.873,.960]){
 const camera:[number,number,number]=[.7+10*Math.cos(alpha)*Math.sin(beta),1.15+10*Math.cos(beta),10*Math.sin(alpha)*Math.sin(beta)],planes=windowPortalPlanes(camera);
 for(const [y,z,inside]of [[1.84,0,true],[1,-2,true],[2.7,2,true],[.80,0,false],[2.9,0,false],[1.84,-2.2,false],[1.84,2.2,false]]as const){const point=[-4.47,y,z].map((v,k)=>camera[k]+(v-camera[k])*1.5),distances=planes.map(p=>p.slice(0,3).reduce((n,v,k)=>n+v*point[k],p[3]));assert.equal(distances.every(d=>d<=1e-9),inside);}
 }
});

test('atmospheric geometry fits within the original whole fixed-scene authoring budget',async()=>{
 const a=await import('../src/art/native-environment');const {farSkyRecipe}=await import('../src/art/window-portal-v11');const plant=a.plantParts();const all=[...a.nativeRoomRecipe(),...a.doorLeafRecipe(),...a.doorSignRecipe(),...a.exteriorRecipe(),...a.nativeCounterRecipe(),...[0,1,2].flatMap(a.nativeDisplayRecipe),...plant.base,...plant.leaves.flatMap(l=>l.recipe),...farSkyRecipe(),...entryGardenRecipe()];assert.ok(all.length<160,'include all three actual furniture variants, sky and entrance; do not move parts outside the budget');
});

test('distant roof planes intersect the actual default window rays and animated crowns keep local tree pivots',async()=>{
 const {exteriorRecipe}=await import('../src/art/native-environment'),{nativeSurfaceGeometry}=await import('../src/art/native-characters');
 const alpha=-Math.PI/4,beta=50*Math.PI/180,radius=9.980211978474616,camera:[number,number,number]=[.7+radius*Math.cos(alpha)*Math.sin(beta),1.15+radius*Math.cos(beta),radius*Math.sin(alpha)*Math.sin(beta)],planes=windowPortalPlanes(camera),exterior=exteriorRecipe();
 const visible=(positions:number[])=>{for(let i=0;i<positions.length;i+=3)if(planes.every(p=>p[0]*positions[i]+p[1]*positions[i+1]+p[2]*positions[i+2]+p[3]<1e-8))return true;return false;};
 const roofs=exterior.filter(p=>p.shape!=='mesh'&&p.turn&&Math.hypot(p.turn[0],p.turn[2])>.2);assert.equal(roofs.length,4);for(const roof of roofs)assert.ok(visible(nativeSurfaceGeometry(roof).positions),'roof is not merely present outside window rays');
 const crowns=exterior.filter(p=>p.role==='leaf');assert.equal(crowns.length,2);for(const crown of crowns){assert.equal(crown.shape,'mesh');if(crown.shape!=='mesh')continue;assert.ok(crown.at[0]<-8&&crown.at[1]===-1,'wind rotates around a local tree, not the shop origin');assert.ok(crown.geometry.positions.every(v=>Math.abs(v)<1.5),'local crown extent bounds wind leverage');assert.ok(visible(nativeSurfaceGeometry(crown).positions),'distant foliage intersects actual window rays');}
});
