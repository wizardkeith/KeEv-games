import assert from 'node:assert/strict';import{createHash}from'node:crypto';
import{backwallFormMode,backwallNewForms}from'../src/art/backwall-forms-v11';
import{nativeStylingRecipe,nativeWindowCanopy}from'../src/art/native-styling';
import{nativeSurfaceGeometry,nativeGrouped,type NativeSurface}from'../src/art/native-characters';
import{backDisplaySamples}from'../src/art/native-display';import{backDisplayRecipe}from'../src/art/back-display-v10';
import{centralFlowerSprayRecipe,centralLinenRecipe}from'../src/art/display-quality-v11';
import{mixedWorkProps}from'../src/art/mixed-display-v11';import{fixedSampleBounds}from'../src/art/decor-vignette-v11';
import{exteriorRecipe}from'../src/art/native-environment';import{windowPortalPlanes}from'../src/art/window-portal-v11';
const hash=(v:unknown)=>createHash('sha256').update(JSON.stringify(v)).digest('hex'),style=nativeStylingRecipe(),canopy=nativeWindowCanopy(),samples=backDisplaySamples(),counts:Record<string,number>={};
for(const s of samples)counts[s.id]=(counts[s.id]??0)+1;
assert.deepEqual(counts,{'off.notebook':9,'off.card':5,'off.mug':6,'off.tray':1,'off.tea':6,'off.vase':3,'off.tote':1,'off.cookie':2,'off.towel':2});
for(const s of samples.filter(p=>p.at[2]>2)){const b=fixedSampleBounds(s.id,s.turn,s.scale),bottom=s.at[1]+b.min,base=[1.0025,1.5225,2.2825].find(y=>bottom>=y&&bottom<y+.50);assert.ok(base!==undefined);assert.ok(Math.abs((bottom-base-.001)/b.height-Math.round((bottom-base-.001)/b.height))<1e-7,'exact shelf/stack support');}
const triangles=[...style,...canopy].reduce((n,p)=>n+nativeSurfaceGeometry(p).indices.length/3,0),groups=nativeGrouped(style).length;assert.ok(triangles<16000,'original styling+canopy budget, no split/raised cap');assert.ok(groups<=17,'original material cap');
const all=[...style,...canopy,...mixedWorkProps(),...backDisplayRecipe(),...exteriorRecipe()];for(const p of all){const g=nativeSurfaceGeometry(p);assert.ok(g.positions.every(Number.isFinite));assert.ok(g.indices.every(i=>Number.isInteger(i)&&i>=0&&i<g.positions.length/3));}
// Gray is genuinely untextured and scoped; accepted C36 atlas bindings survive.
if(backwallFormMode.includes('gray')){const gray=all.filter(p=>p.color==='#A5A5A5');assert.ok(gray.length>0);assert.ok(gray.every(p=>p.role==='paint'&&p.roughness===.801&&!p.baseColorTexture&&!p.finish));assert.ok(centralLinenRecipe().some(p=>p.baseColorTexture==='/assets/native-v11/linen-form-values-c34.png'));assert.ok(style.some(p=>p.baseColorTexture==='/assets/native-v11/petal-form-values-c34.png'));}
const visibleRoofs=[];for(const alpha of[-1.05539816,-Math.PI/4,-.51539816]){const beta=50*Math.PI/180,r=11.212,c:[number,number,number]=[.7+r*Math.cos(alpha)*Math.sin(beta),1.15+r*Math.cos(beta),r*Math.sin(alpha)*Math.sin(beta)],planes=windowPortalPlanes(c),roofs=exteriorRecipe().filter(p=>p.shape!=='mesh'&&p.turn&&Math.hypot(p.turn[0],p.turn[2])>.2);if(!backwallFormMode.includes('gray')){assert.equal(roofs.length,4);visibleRoofs.push(roofs.map(p=>{const g=nativeSurfaceGeometry(p);for(let i=0;i<g.positions.length;i+=3)if(planes.every(q=>q[0]*g.positions[i]+q[1]*g.positions[i+1]+q[2]*g.positions[i+2]+q[3]<1e-8))return true;return false;}));}}
const locked={centralFlower:hash(centralFlowerSprayRecipe()),centralCloth:hash(centralLinenRecipe()),centralCounterSamples:hash(samples.filter(p=>p.at[2]<2)),centralCounterWorkProps:hash(mixedWorkProps().filter(p=>p.at[2]<2))};
console.log(JSON.stringify({mode:backwallFormMode,newForms:backwallNewForms,triangles,groups,counts,locked,visibleRoofs,samplePositions:samples.filter(p=>p.at[2]>2),limits:'Form-authoring scope only. Numeric support/budget/identity, not visual gate, all intersections or transaction/device acceptance'},null,2));
