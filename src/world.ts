import {Engine} from '@babylonjs/core/Engines/engine';
import {Scene} from '@babylonjs/core/scene';
import {Color3,Color4} from '@babylonjs/core/Maths/math.color';
import {Vector3} from '@babylonjs/core/Maths/math.vector';
import {Viewport} from '@babylonjs/core/Maths/math.viewport';
import {ArcRotateCamera} from '@babylonjs/core/Cameras/arcRotateCamera';
import {HemisphericLight} from '@babylonjs/core/Lights/hemisphericLight';
import {DirectionalLight} from '@babylonjs/core/Lights/directionalLight';
import {ShadowGenerator} from '@babylonjs/core/Lights/Shadows/shadowGenerator';
import '@babylonjs/core/Lights/Shadows/shadowGeneratorSceneComponent';
import {PBRMaterial} from '@babylonjs/core/Materials/PBR/pbrMaterial';
import {Mesh} from '@babylonjs/core/Meshes/mesh';
import {VertexData} from '@babylonjs/core/Meshes/mesh.vertexData';
import {TransformNode} from '@babylonjs/core/Meshes/transformNode';
import {catalog,config,type Snapshot} from './core/contracts';
import layoutData from './content/layout.json';
import {palette,roomRecipe,displayRecipe,counterRecipe,personRecipe,productRecipe,plantRecipe,type Part} from './art/recipes';
import {grouped} from './art/geometry';

export async function createWorld(canvas:HTMLCanvasElement,onSlot:(n:number)=>void){
 const engine=new Engine(canvas,true,{preserveDrawingBuffer:false,stencil:true,adaptToDeviceRatio:false});
 const scene=new Scene(engine);scene.useRightHandedSystem=true;scene.clearColor=Color4.FromHexString('#F4EFE8FF');
 const camera=new ArcRotateCamera('curated.40deg',-Math.PI/4,50*Math.PI/180,18,new Vector3(0,1,0),scene);
 camera.attachControl(canvas,true);camera.lowerBetaLimit=45*Math.PI/180;camera.upperBetaLimit=55*Math.PI/180;camera.lowerAlphaLimit=-Math.PI/4-.27;camera.upperAlphaLimit=-Math.PI/4+.27;camera.lowerRadiusLimit=13;camera.upperRadiusLimit=26;camera.panningSensibility=0;camera.wheelDeltaPercentage=.012;camera.minZ=.1;camera.maxZ=90;
 const sky=new HemisphericLight('soft cream sky',new Vector3(0,1,0),scene);sky.intensity=.85;sky.diffuse=Color3.FromHexString('#FFF4E4');sky.groundColor=Color3.FromHexString('#B8A79C');
 const sun=new DirectionalLight('static window sunlight',new Vector3(.85,-.5,.12),scene);sun.position.set(-8,5,-2);sun.diffuse=Color3.FromHexString('#FFE1B0');sun.intensity=2.4;sun.shadowMinZ=.1;sun.shadowMaxZ=35;
 const shadow=new ShadowGenerator(1024,sun);shadow.usePercentageCloserFiltering=true;shadow.filteringQuality=ShadowGenerator.QUALITY_LOW;shadow.bias=.001;shadow.normalBias=.025;shadow.darkness=.22;
 const materials=new Map<string,PBRMaterial>();
 function material(hex:string,alpha=1){const key=hex+alpha;let m=materials.get(key);if(!m){m=new PBRMaterial(key,scene);m.albedoColor=Color3.FromHexString(hex);m.roughness=.88;m.metallic=0;m.environmentIntensity=.5;m.alpha=alpha;materials.set(key,m);}return m;}
 function model(name:string,recipe:Part[],parent?:TransformNode,slot?:number,cast=true){const root=new TransformNode(name,scene);if(parent)root.parent=parent;for(const [i,g] of grouped(recipe).entries()){const mesh=new Mesh(`${name}.material${i}`,scene);const data=new VertexData();data.positions=g.geometry.positions;data.normals=g.geometry.normals;data.indices=g.geometry.indices;data.applyToMesh(mesh);mesh.material=material(g.color,g.alpha);mesh.parent=root;mesh.receiveShadows=true;mesh.isPickable=slot!==undefined;if(slot!==undefined)mesh.metadata={slot};if(cast&&g.alpha===1)shadow.addShadowCaster(mesh);}return root;}
 // All surfaces are actual geometry with reusable authoring recipes; no backdrop illusion.
 model('room.modular',roomRecipe(),undefined,undefined,false);
 const roomMeshes=scene.meshes.filter(m=>m.name.startsWith('room.'));for(const m of roomMeshes){m.receiveShadows=true;const material=m.material as PBRMaterial;if(material.alpha===1&&[palette.wood,palette.cream].some(c=>material.albedoColor.equals(Color3.FromHexString(c))))shadow.addShadowCaster(m);}
 const counter=model('fixture.shop-counter.w1_1',counterRecipe());counter.position.set(...layoutData.counter.position as [number,number,number]);
 const registerPlant=model('counter.plant',plantRecipe(.38));registerPlant.position.set(2.0,1.12,-1.45);
 for(const [x,z,scale] of [[-3.9,2.6,1.15],[-4.05,-1.6,.9],[1.2,2.95,.52]]){const plant=model('plant.original',plantRecipe(scale));plant.position.set(x,scale===.52?1.52:.09,z);}
 for(let row=0;row<2;row++)for(let i=0;i<8;i++){const item=catalog.offerings[(i+row*3)%catalog.offerings.length];const stock=model(`back.display.${row}.${item.id}`,productRecipe(item.id,item.color));stock.position.set(-2.95+i*.55,1.53+row*.76,2.84);stock.scaling.setAll(.85);}
 const highlights:Mesh[]=[],productRoots:TransformNode[]=[];const shelfContents:string[]=[];
 for(let i=0;i<3;i++){
  const d=layoutData.displays[i];const display=model(d.id,displayRecipe(),undefined,i);display.position.set(d.position[0],.08,d.position[2]);
  const rim=model(`${d.id}.selected`,[{shape:'round',size:[1.68,.035,1.05],at:[0,.10,0],color:'#B59AC8',radius:.016}],undefined,i,false);rim.position.set(d.position[0],0,d.position[2]);for(const mesh of rim.getChildMeshes()){highlights.push(mesh as Mesh);mesh.setEnabled(false);}
  const products=new TransformNode(`${d.id}.products`,scene);products.position.set(d.position[0],1.08,d.position[2]);productRoots.push(products);
 }
 const staff=model('staff.graybox.generic',personRecipe('#9E8CAA'));staff.position.set(2.6,.09,-2.45);staff.rotation.y=-.35;
 const customers=[model('customer.decorative.1',personRecipe('#8DA597')),model('customer.decorative.2',personRecipe('#BA9FA2'))];
 const parcel=model('discovery.graybox-sample',[
  {shape:'round',size:[.52,.30,.38],at:[0,.15,0],color:'#C8B3D4',radius:.035},
  {shape:'box',size:[.045,.31,.385],at:[0,.15,0],color:'#F6E5C1'},
  {shape:'box',size:[.525,.315,.035],at:[0,.15,0],color:'#F6E5C1'}]);parcel.position.set(-3.2,.09,2.35);
 let state:Snapshot|undefined,quality='auto',effectiveQuality='high',zen=false,panelOpen=false,selectedSlot=-1,disposed=false;
 let frames:number[]=[],last:number|undefined,visibleSamples=0,qualityCheckedAt=0;let readyAt=0,composition='';
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const setQuality=(q:string)=>{effectiveQuality=q;engine.setHardwareScalingLevel(q==='low'?1.5:1);shadow.getShadowMap()!.refreshRate=q==='low'?2:1;document.documentElement.dataset.renderQuality=q;};
 setQuality('high');
 const resize=()=>{
  if(disposed)return;engine.resize();const w=canvas.clientWidth,h=canvas.clientHeight,narrow=w<720;
  const panel=document.querySelector<HTMLElement>('.sidebar');const rect=panel?.getBoundingClientRect();const visible=panelOpen||!!(rect&&rect.height>0);
  const header=document.querySelector<HTMLElement>('.top')?.getBoundingClientRect();const footer=document.querySelector<HTMLElement>('.dock')?.getBoundingClientRect();
  const top=zen?20:Math.min(header?.bottom??110,h*.24)+10;let bottom=zen?20:Math.max(85,h-(footer?.top??h-85));let right=0;
  if(visible&&rect&&!zen){if(narrow)bottom=Math.max(bottom,h-rect.top+8);else right=Math.min(w*.46,w-rect.left+12);}
  const vw=Math.max(120,w-right),vh=Math.max(80,h-top-bottom);camera.viewport=new Viewport(0,bottom/h,vw/w,vh/h);
  const signature=[w,h,top,bottom,right].join(':');if(signature===composition)return;composition=signature;
  const aspect=vw/vh;camera.radius=Math.min(26,Math.max(15.8,12/aspect));camera.target.set(0,1.0,0);camera.lowerRadiusLimit=Math.max(12,camera.radius-3);camera.upperRadiusLimit=camera.radius+4;
 };
 scene.onPointerPick=(_,pick)=>{const n=pick.pickedMesh?.metadata?.slot;if(typeof n==='number'){selectedSlot=n;highlights.forEach((m,i)=>m.setEnabled(i===n));onSlot(n);}};
 const contextLost=()=>canvas.dispatchEvent(new CustomEvent('world-error'));
 canvas.addEventListener('webglcontextlost',contextLost);window.addEventListener('resize',resize);const observer=new ResizeObserver(resize);observer.observe(canvas);
 const visibility=()=>{last=undefined;};document.addEventListener('visibilitychange',visibility);
 resize();await scene.whenReadyAsync();readyAt=performance.now();
 engine.runRenderLoop(()=>{
  if(disposed||document.hidden){last=undefined;return;}
  const now=performance.now();if(last!==undefined){const dt=now-last;if(dt>0&&dt<250){frames.push(dt);visibleSamples++;if(frames.length>180)frames.shift();}}last=now;
  if(quality==='auto'&&frames.length>=90&&now-qualityCheckedAt>3000){const sorted=[...frames].sort((a,b)=>a-b);const p75=sorted[Math.floor(sorted.length*.75)];if(p75>35&&effectiveQuality!=='low')setQuality('low');qualityCheckedAt=now;}
  const hour=state?new Date(state.watermark+9*3600000).getUTCHours():0;const trading=!!state?.open&&hour>=config.openHour&&hour<config.closeHour;
  customers.forEach((c,i)=>{c.setEnabled(trading&&(effectiveQuality!=='low'||i===0));if(trading&&!reduced.matches){const phase=now/9000+i*2.6;c.position.set(.55+Math.sin(phase)*.65,.09,Math.cos(phase)*1.35);c.rotation.y=phase+.5;}});
  scene.render();
 });
 return {
  update(s:Snapshot){state=s;parcel.setEnabled(!s.revealed);for(let i=0;i<3;i++){const id=s.shelves[i],item=s.inventory[id],o=catalog.offerings.find(o=>o.id===id),count=Math.min(4,item?.stock??0);const key=`${id}:${count}`;if(shelfContents[i]===key)continue;shelfContents[i]=key;for(const child of [...productRoots[i].getChildren()]){if(child instanceof TransformNode)for(const mesh of child.getChildMeshes())shadow.removeShadowCaster(mesh);child.dispose(false);}if(!o)continue;for(let k=0;k<count;k++){const object=model(`${layoutData.displays[i].id}.${id}.${k}`,productRecipe(id,o.color),productRoots[i],i);object.position.set((k%2-.5)*.60,0,(Math.floor(k/2)-.5)*.38);object.scaling.setAll(id==='off.pencil'?1.05:.82);}}resize();},
  quality(q:string){quality=q;frames=[];last=undefined;setQuality(q==='low'?'low':'high');},
  zen(value:boolean){zen=value;resize();},layout(value:boolean){panelOpen=value;resize();},
  selected(slot:number){selectedSlot=slot;highlights.forEach((m,i)=>m.setEnabled(i===slot));},
  metrics(){return {readyAtMs:readyAt,quality,effectiveQuality,adaptivePolicy:'auto lowers resolution and decorative crowd after 90 visible samples with p75 >35ms; no economy change',selectedSlot,visibleSamples,frameSamplesMs:[...frames],fps:frames.length?1000/(frames.reduce((a,b)=>a+b,0)/frames.length):null,meshes:scene.meshes.length,activeMeshes:scene.getActiveMeshes().length,renderer:engine.getGlInfo(),viewport:[canvas.width,canvas.height],cameraViewport:camera.viewport};},
  dispose(){disposed=true;observer.disconnect();window.removeEventListener('resize',resize);document.removeEventListener('visibilitychange',visibility);canvas.removeEventListener('webglcontextlost',contextLost);scene.dispose();engine.dispose();}
 };
}
