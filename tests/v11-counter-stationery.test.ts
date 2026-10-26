import test from 'node:test';import assert from 'node:assert/strict';
import {Ray} from '@babylonjs/core/Culling/ray.core';import {Vector3} from '@babylonjs/core/Maths/math.vector';
import {counterStationery} from '../src/art/counter-stationery-v11';import {nativeSurfaceGeometry} from '../src/art/native-characters';
test('reference counter work tools rest on the existing wing, with a hollow holder and clear handoff space',()=>{
 const parts=counterStationery(),pot=nativeSurfaceGeometry(parts[0]);assert.equal(parts.length,16,'one fixed holder and five three-part pencils; no product instance/stock API');
 assert.ok(Math.abs(Math.min(...pot.positions.filter((_,i)=>i%3===1))-1.111)<1e-12);
 assert.ok(Math.abs(Math.max(...pot.positions.filter((_,i)=>i%3===1))-1.24425)<1e-12,'hand-scale13.325cm holder');
 const ray=new Ray(new Vector3(1,1.111+.24,-1.73),new Vector3(0,-1,0),.3),hits:number[]=[];
 for(let i=0;i<pot.indices.length;i+=3){const a=pot.indices.slice(i,i+3).map(n=>Vector3.FromArray(pot.positions,n*3)),hit=ray.intersectsTriangle(a[0],a[1],a[2]);if(hit)hits.push(hit.distance);}
 assert.ok(Math.abs(Math.min(...hits)-.21725)<1e-9,'open top reaches real inner base, no opaque rim cap');
 for(const p of parts){const g=nativeSurfaceGeometry(p);for(let i=0;i<g.positions.length;i+=3){const[x,y,z]=g.positions.slice(i,i+3);assert.ok(x>.88&&x<1.12&&z>-1.85&&z<-1.60&&y>=1.111-1e-12&&y<1.56,'outside actual cashier contact and accepted tabletop sample area');}}
});
