import fs from 'node:fs';
import * as now from '../src/art/recipes';import {grouped as groupsNow} from '../src/art/geometry';
import * as old from '../assets/authoring/w1_1/source_snapshot/src/art/recipes';import {grouped as groupsOld} from '../assets/authoring/w1_1/source_snapshot/src/art/geometry';
import {catalog} from '../src/core/contracts';
// Source inventory of exactly the authored geometry calls, NOT draw calls/FPS.
function inventory(r:any,group:any,newArt:boolean,stocked:boolean){let meshes=0,vertices=0,triangles=0;const materials=new Set<string>();
 const add=(parts:any[])=>{for(const g of group(parts)){meshes++;vertices+=g.geometry.positions.length/3;triangles+=g.geometry.indices.length/3;materials.add((g.materialId??'paint')+g.color+g.alpha);}};
 add(r.roomRecipe());add(r.counterRecipe());for(const scale of [.38,1.15,.9,.52])add(r.plantRecipe(scale));
 for(let row=0;row<2;row++)for(let i=0;i<8;i++){const o=catalog.offerings[(i+row*3)%catalog.offerings.length];add(r.productRecipe(o.id,o.color));}
 for(let i=0;i<3;i++){add(r.displayRecipe());add([{shape:'round',size:[1.68,.035,1.05],at:[0,.10,0],color:'#B59AC8',radius:.016,alpha:newArt?.62:1}]);}
 for(const color of ['#9E8CAA','#8DA597','#BA9FA2']){if(newArt)for(const p of r.personParts(color))add(p.recipe);else add(r.personRecipe(color));}
 add([{shape:'round',size:[.52,.30,.38],at:[0,.15,0],color:'#C8B3D4',radius:.035},{shape:'box',size:[.045,.31,.385],at:[0,.15,0],color:'#F6E5C1'},{shape:'box',size:[.525,.315,.035],at:[0,.15,0],color:'#F6E5C1'}]);
 if(newArt){add([{shape:'round',size:[.16,.025,.12],at:[0,0,0],color:'#C3AF8E',role:'paper',radius:.012}]);add([{shape:'round',size:[.52,.25,.38],at:[0,.14,0],color:'#C8B3D4',role:'paper',radius:.025}]);add([{shape:'round',size:[.54,.055,.40],at:[0,0,-.2],color:'#E9D8E9',role:'paper',radius:.02}]);add([{shape:'sphere',size:[.18,.07,.14],at:[0,.27,0],color:'#E7D9EB',role:'paint'}]);for(let i=0;i<8;i++)add([{shape:'box',size:[.018,.018,.002],at:[0,0,0],color:'#F9EACD',alpha:.13,role:'paper'}]);}
 if(newArt)for(const color of ['#98AC99','#B59AC8'])materials.add('mat.soft-paper.v1'+color+'1');
 const costs=catalog.offerings.map(o=>({id:o.id,color:o.color,groups:group(r.productRecipe(o.id,o.color)).length})).sort((a,b)=>b.groups-a.groups);
 if(stocked)for(const o of costs.slice(0,3))for(let i=0;i<4;i++)add(r.productRecipe(o.id,o.color));
 return {meshes,materialIdentities:materials.size,vertices,triangles,stockedTop3:stocked?costs.slice(0,3).map(o=>o.id):[],method:'count authored material groups/vertices/indices, including disabled pool/crowd. Not renderer measurements; excludes GPU passes and runtime material clones.'};
}
const result={baselineCommit:'f48dc15030fd89af0fe99e00f890ba204bdc0185',before:{empty:inventory(old,groupsOld,false,false),worstStocked:inventory(old,groupsOld,false,true)},after:{empty:inventory(now,groupsNow,true,false),worstStocked:inventory(now,groupsNow,true,true)},vfxBudget:{poolMeshes:12,dust:8,receipt:1,revealProxy:3,maxConcurrentMajor:1,queue:0,newLights:0,renderTargets:0,shadowCasters:0,textures:0,dynamicTextures:0,extraTextureBytes:0},notMeasured:['draw calls','GPU memory','actual frame time','FPS','physical device','visible appearance']};
fs.writeFileSync('evidence/w1_1a/scene-budget.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
