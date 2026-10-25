import test from 'node:test';import assert from 'node:assert/strict';import {windowPortalPlanes} from '../src/art/window-portal-v11';
test('exterior portal preserves real window rays across allowed orbit angles and rejects cutaway spill',()=>{
 for(const alpha of [-1.055,-.785,-.515])for(const beta of [.785,.873,.960]){
 const camera:[number,number,number]=[.7+10*Math.cos(alpha)*Math.sin(beta),1.15+10*Math.cos(beta),10*Math.sin(alpha)*Math.sin(beta)],planes=windowPortalPlanes(camera);
 for(const [y,z,inside]of [[1.84,0,true],[1,-2,true],[2.7,2,true],[.80,0,false],[2.9,0,false],[1.84,-2.2,false],[1.84,2.2,false]]as const){const point=[-4.47,y,z].map((v,k)=>camera[k]+(v-camera[k])*1.5),distances=planes.map(p=>p.slice(0,3).reduce((n,v,k)=>n+v*point[k],p[3]));assert.equal(distances.every(d=>d<=1e-9),inside);}
 }
});

test('atmospheric geometry fits within the original whole fixed-scene authoring budget',async()=>{
 const a=await import('../src/art/native-environment');const {farSkyRecipe}=await import('../src/art/window-portal-v11');const plant=a.plantParts();const all=[...a.nativeRoomRecipe(),...a.doorLeafRecipe(),...a.doorSignRecipe(),...a.exteriorRecipe(),...a.nativeCounterRecipe(),...a.nativeDisplayRecipe(),...plant.base,...plant.leaves.flatMap(l=>l.recipe),...farSkyRecipe()];assert.ok(all.length<160,'include sky as well as original fixtures; do not move parts outside the budget');
});
