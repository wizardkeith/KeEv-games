import test from 'node:test';import assert from 'node:assert/strict';import {backDisplaySamples,displaySamples} from '../src/art/native-display';import {backDisplayRecipe} from '../src/art/back-display-v10';import {fixedSampleBounds} from '../src/art/decor-vignette-v11';import {nativeSurfaceGeometry,nativeGrouped} from '../src/art/native-characters';import {nativeStylingRecipe,nativeWindowCanopy} from '../src/art/native-styling';import {mixedWorkProps} from '../src/art/mixed-display-v11';import {nativeLighting} from '../src/art/native-view';import {catalog} from '../src/core/contracts';
test('fixed 35-sample back composition retains exact identities, physical shelf/stack contact and authored celadon response',()=>{
 const s=backDisplaySamples();assert.equal(s.length,35);const count:Record<string,number>={};for(const p of s)count[p.id]=(count[p.id]??0)+1;assert.deepEqual(count,{'off.notebook':9,'off.card':5,'off.mug':6,'off.tray':1,'off.tea':6,'off.vase':3,'off.tote':1,'off.cookie':2,'off.towel':2});
 for(const p of s.filter(p=>p.at[2]>2)){
  const b=fixedSampleBounds(p.id,p.turn,p.scale),bottom=p.at[1]+b.min,base=[1.0025,1.5225,2.2825].find(y=>bottom>=y&&bottom<y+.50)!;assert.ok(base!==undefined);
  const layers=(bottom-base-.001)/b.height;assert.ok(Math.abs(layers-Math.round(layers))<1e-8,'sits on exact shelf plus real stock-independent stack height');
 }
 const v=backDisplayRecipe().filter(p=>p.finish==='celadon');assert.equal(v.length,3,'assembly no longer drops the existing vessel material/UV/ORM binding');assert.ok(v.every(p=>p.roughness===.42&&p.role==='ceramic'));
});
test('mixed work props are bounded fixed geometry with open baskets, stay out of the threshold and retain original scene budgets',()=>{
 const props=mixedWorkProps(),all=[...nativeStylingRecipe(),...nativeWindowCanopy()];assert.ok(props.length>10);assert.ok(all.reduce((n,p)=>n+nativeSurfaceGeometry(p).indices.length/3,0)<16000);assert.ok(nativeGrouped(nativeStylingRecipe()).length<18);
 for(const p of props){const g=nativeSurfaceGeometry(p);assert.ok(g.positions.every(Number.isFinite));for(let i=0;i<g.positions.length;i+=3){const[x,y,z]=g.positions.slice(i,i+3);assert.ok(!(x>2.34&&x<3.76&&y>.1&&y<2.5&&z>3&&z<3.6));}}
 assert.equal(catalog.offerings.length,10);assert.ok(!catalog.offerings.some(o=>/basket|work|bell|folder/.test(o.id)));
 // The existing small shelf plant at[1.2,1.5235,2.95] retains its clear pot bay.
 for(const p of props){const g=nativeSurfaceGeometry(p);for(let i=0;i<g.positions.length;i+=3){const[x,y,z]=g.positions.slice(i,i+3);assert.ok(!(Math.abs(x-1.2)<.10&&y>1.5235&&y<1.70&&Math.abs(z-2.95)<.10),'no paperwork through the retained planter');}}
});
test('asymmetric paper stacks preserve two physical piles and stable prefixes while focal light remains inside the actual service bay',()=>{
 const p=displaySamples('off.notebook',8,1);assert.equal(p.filter(p=>p.at[0]===-.65).length,3);assert.equal(p.filter(p=>p.at[0]===.58).length,5);
 for(const x of[-.65,.58])assert.deepEqual(p.filter(p=>p.at[0]===x).map(p=>p.stackLayer),Array.from({length:p.filter(p=>p.at[0]===x).length},(_,i)=>i));
 const cashier=nativeLighting.practicals[0],dx=3.31-cashier.position[0],dz=-.65-cashier.position[2],dy=cashier.position[1]-1.35;assert.ok(Math.atan2(Math.hypot(dx,dz),dy)<cashier.angle*.5,'actual staff/customer dock is inside warm focal cone, not outside its falloff');
});
