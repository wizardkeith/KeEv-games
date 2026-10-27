/** Pure renderer support from the ACTUAL display meshes. No stock, price,
 * clock or save is read. Broad wood/cloth surfaces exclude paper price signs
 * and metal poles; support is cached per immutable fixture variant. */
import {buildV11Display} from './fixtures-v11';import {nativeSurfaceGeometry} from './native-characters';import {artDirection} from './direction';
type Point=readonly[number,number];type PlaneTriangle={a:Point;b:Point;c:Point;y:number;det:number};
const cache=new Map<number,PlaneTriangle[]>(),base=artDirection.displaySurfaceY-artDirection.fixtureBaseY;
function planes(table:number){let list=cache.get(table);if(list)return list;list=[];
 for(const p of buildV11Display(table))if(p.role==='wood'||p.role==='fabric'){const g=nativeSurfaceGeometry(p);for(let i=0;i<g.indices.length;i+=3){const v=g.indices.slice(i,i+3).map(n=>g.positions.slice(n*3,n*3+3)),y=v[0][1];if(y<base-1e-8||v.some(p=>Math.abs(p[1]-y)>1e-8))continue;const[a,b,c]=v.map(p=>[p[0],p[2]]as Point),det=(b[0]-a[0])*(c[1]-a[1])-(c[0]-a[0])*(b[1]-a[1]);if(Math.abs(det)>1e-9)list.push({a,b,c,y,det});}}
 cache.set(table,list);return list;
}
export function actualDisplaySupport(table:number,footprint:Point[]){let top=-Infinity;
 for(const[x,z]of footprint)for(const{a,b,c,y,det}of planes(table)){const u=((x-a[0])*(c[1]-a[1])-(c[0]-a[0])*(z-a[1]))/det,v=((b[0]-a[0])*(z-a[1])-(x-a[0])*(b[1]-a[1]))/det;if(u>=-1e-9&&v>=-1e-9&&u+v<=1+1e-9)top=Math.max(top,y);}
 if(!Number.isFinite(top))throw new RangeError('Stock geometry has no actual display support');return top-base;
}
