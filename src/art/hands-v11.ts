/** Original palm and four separate rounded fingers plus curved thumb. Retains
 * the existing wrist/socket transforms and the accepted hand contact envelope. */
import type {NativePart,NativeMesh} from './native-characters';
import {sculptLoft,sculptSweep} from './sculpt-v10';
import type {Geometry} from './geometry';
const skin=(geometry:Geometry):NativeMesh=>({shape:'mesh',at:[0,0,0],color:'#F2CBB2',role:'skin',roughness:.78,geometry});
export function rebuildV11Hands(parts:NativePart[]){
 for(const side of [-1,1]){
  const hand=parts.find(p=>p.id==='hand-'+(side<0?'left':'right'))!;
  const palm=sculptLoft([{y:-.038,x:.026,z:.016,cz:-.005},{y:-.017,x:.032,z:.018,cz:-.004},{y:.010,x:.023,z:.015,cz:-.003}],8);
  hand.recipe=[skin(palm)];
  for(let i=0;i<4;i++){
   const x=(i-1.5)*.014,length=[.059,.067,.064,.054][i];
   hand.recipe.push(skin(sculptLoft([{y:-length,x:.0025,z:.003, cx:x,cz:-.007},{y:-(length+.029)/2,x:.0058,z:.006,cx:x,cz:-.008},{y:-.029,x:.0063,z:.006,cx:x,cz:-.006}],6)));
  }
  hand.recipe.push(skin(sculptSweep([[-side*.021,-.007,-.005],[-side*.032,-.016,-.011],[-side*.039,-.029,-.018],[-side*.038,-.039,-.021]],[.008,.010,.007,.004],[.008,.009,.006,.004],6,4)));
 }
 return parts;
}
