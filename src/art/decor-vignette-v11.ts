/** Relocate five EXISTING fixed showroom samples into a coherent counter/table
 * vignette. These remain non-authoritative decoration, never player inventory. */
import {nativeProductRecipe} from './native-products';import {nativeSurfaceGeometry} from './native-characters';import {artDirection} from './direction';
interface Sample {id:string;at:[number,number,number];turn:[number,number,number];scale:number}
const bounds=new Map<string,{min:number;height:number}>();
export function fixedSampleBounds(id:string,turn:Sample['turn'],scale:number){const key=id+':'+turn.join(',')+':'+scale;let b=bounds.get(key);if(!b){const ys=nativeProductRecipe(id,'#FFFFFF').flatMap(p=>{const g=nativeSurfaceGeometry(p),out:number[]=[];for(let i=0;i<g.positions.length;i+=3){let [x,y,z]=g.positions.slice(i,i+3);for(let j=0;j<3;j++){const c=Math.cos(turn[j]),s=Math.sin(turn[j]);if(j===0)[y,z]=[y*c-z*s,y*s+z*c];if(j===1)[x,z]=[x*c+z*s,-x*s+z*c];if(j===2)[x,y]=[x*c-y*s,x*s+y*c];}out.push(y*scale);}return out;});b={min:Math.min(...ys),height:Math.max(...ys)-Math.min(...ys)};bounds.set(key,b);}return b;}
export function relocateV11Decoration<T extends Sample>(sample:T):T{
 const placed=(x:number,z:number,surface:number,turn:Sample['turn'],scale:number,level=0)=>{const b=fixedSampleBounds(sample.id,turn,scale);return {...sample,turn,scale,at:[x,surface+artDirection.restingGap-b.min+level*b.height,z] as Sample['at']};};
 if(sample.id==='off.notebook'&&sample.at[0]<-2.80&&sample.at[1]<1.3){const k=Math.round((sample.at[0]+2.85)/.012);return placed(-.53+k*.006,-.40+k*.003,artDirection.displaySurfaceY,[0,Math.PI/2+[-.025,.015,-.01][k],0],.78,k);}
 if(sample.id==='off.card'&&Math.abs(sample.at[0]+2.23)<1e-6&&sample.at[1]<1.4)return placed(1.75,-1.68,1.110,[-1.18,.08,0],.85);
 // Reuse the existing middle-shelf print on the central riser, behind the
 // preserved flowers/books. Mixed high/mid/low forms, no new sample or stock.
 if(sample.id==='off.card'&&Math.abs(sample.at[0]-1.35)<1e-6&&sample.at[1]>1.5&&sample.at[1]<2.0)return placed(-.53,.32,artDirection.displaySurfaceY+.14,[-1.18,-.22,0],.78);
 if(sample.id==='off.tray')return placed(1.72,-1.25,1.110,[0,.04,0],.85);
 return sample;
}
