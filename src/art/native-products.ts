import {productRecipe,type Part} from './recipes';
/** Small native-v3 finishing pass. IDs, selection, quantities and A1 mug walls
 * are unchanged. The wrapper adds geometry, never authoritative shelf objects. */
export function legacyV9ProductRecipe(id:string,color:string):Part[]{
 const base=productRecipe(id,color);
 if(id==='off.mug')return [...base,
  {shape:'torus',size:[.239,.008,.239],at:[0,.053,0],color:'#D8C5A9',role:'ceramic'},
  {shape:'cylinder',size:[.155,.008,.155],at:[0,.004,0],color:'#CBB99E',top:1,role:'ceramic'},
 ];
 if(id==='off.tea')return [...base,
  {shape:'torus',size:[.252,.008,.252],at:[0,.308,0],color:'#D8C4A1',role:'metal'},
  {shape:'sphere',size:[.027,.052,.005],at:[-.024,.158,-.122],turn:[0,0,-.35],color:'#8B9F81',role:'ink'},
  {shape:'sphere',size:[.022,.043,.005],at:[.016,.145,-.122],turn:[0,0,.45],color:'#A5B291',role:'ink'},
  {shape:'box',size:[.08,.003,.004],at:[0,.106,-.122],color:'#AD9679',role:'ink'},
 ];
 if(id==='off.notebook')return [...base,
  {shape:'round',size:[.346,.066,.060],at:[0,.033,.11],color:'#D8C8AB',role:'paper',radius:.004},
  {shape:'box',size:[.075,.002,.005],at:[-.035,.067,.11],color:'#9B8B71',role:'ink'},
  {shape:'box',size:[.043,.002,.003],at:[-.048,.067,.12],color:'#B5A185',role:'ink'},
 ];
 return base;
}

export {buildV10Product as nativeProductRecipe} from './products-v10';
