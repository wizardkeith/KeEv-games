import {nativeProductRecipe as productRecipe} from './art/native-products';
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
import {palette,type Part} from './art/recipes';
import {materialRenderState,linearColor,type MaterialRole} from './art/materials';
import {artDirection,curatedRadius} from './art/direction';
import {FeedbackClock,motionAllowed,vfx} from './presentation/config';
import type {Feedback} from './presentation/feedback';
import {NativeCustomerRoutes} from './presentation/native-routes';
import {createNativeActors} from './presentation/native-scene';
import {NativeCommitPresentation} from './presentation/native-commits';
import {resolveMotionPolicy} from './presentation/native-motion';
import {nativeGrouped,type NativeSurface} from './art/native-characters';
import {nativeRoomRecipe,nativeCounterRecipe,nativeDisplayRecipe,doorLeafRecipe,doorSignRecipe,plantParts,exteriorRecipe} from './art/native-environment';
import {Day1GestureClock} from './presentation/day1';
import {counterFocusRecipe} from './art/day1-focus';

export async function createWorld(canvas:HTMLCanvasElement,onSlot:(n:number)=>void,onFeedbackEnd:()=>void=()=>{},nativePresentation=new NativeCommitPresentation()){
 const engine=new Engine(canvas,true,{preserveDrawingBuffer:false,stencil:true,adaptToDeviceRatio:false});
 const scene=new Scene(engine);scene.useRightHandedSystem=true;scene.clearColor=Color4.FromHexString('#F4EFE8FF');
 const camera=new ArcRotateCamera('curated.40deg',-Math.PI/4,50*Math.PI/180,18,new Vector3(0,1,0),scene);
 camera.attachControl(canvas,true);camera.lowerBetaLimit=45*Math.PI/180;camera.upperBetaLimit=55*Math.PI/180;camera.lowerAlphaLimit=-Math.PI/4-.27;camera.upperAlphaLimit=-Math.PI/4+.27;camera.lowerRadiusLimit=13;camera.upperRadiusLimit=26;camera.panningSensibility=0;camera.wheelDeltaPercentage=.012;camera.minZ=.1;camera.maxZ=90;
 const sky=new HemisphericLight('soft cream sky',new Vector3(0,1,0),scene);sky.intensity=artDirection.fill.intensity;sky.diffuse=Color3.FromArray(linearColor(artDirection.fill.color));sky.groundColor=Color3.FromArray(linearColor(artDirection.fill.ground));
 const sun=new DirectionalLight('static window sunlight',Vector3.FromArray([...artDirection.key.direction]),scene);sun.position.set(...artDirection.key.position);sun.diffuse=Color3.FromArray(linearColor(artDirection.key.color));sun.intensity=artDirection.key.intensity;sun.shadowMinZ=.1;sun.shadowMaxZ=35;
 const shadow=new ShadowGenerator(artDirection.shadow.size,sun);shadow.usePercentageCloserFiltering=true;shadow.filteringQuality=ShadowGenerator.QUALITY_MEDIUM;shadow.bias=artDirection.shadow.bias;shadow.normalBias=artDirection.shadow.normalBias;shadow.darkness=artDirection.shadow.darkness;
 const materials=new Map<string,PBRMaterial>();
 function material(hex:string,alpha=1,role:MaterialRole='paint',roughness?:number,identity?:string){const spec=materialRenderState(role,hex,alpha),key=identity??spec.materialId;let m=materials.get(key);if(!m){m=new PBRMaterial(key,scene);m.albedoColor=Color3.FromArray(spec.baseColorLinear);m.roughness=roughness??spec.roughness;m.metallic=spec.metallic;m.indexOfRefraction=spec.indexOfRefraction;m.environmentIntensity=.5;m.alpha=spec.alpha;m.transparencyMode=spec.alphaBlend?PBRMaterial.PBRMATERIAL_ALPHABLEND:PBRMaterial.PBRMATERIAL_OPAQUE;m.backFaceCulling=spec.backFaceCulling;m.twoSidedLighting=spec.twoSidedLighting;materials.set(key,m);}return m;}
 function model(name:string,recipe:NativeSurface[],parent?:TransformNode,slot?:number,cast=true){const root=new TransformNode(name,scene);if(parent)root.parent=parent;for(const [i,g] of nativeGrouped(recipe).entries()){const mesh=new Mesh(`${name}.material${i}`,scene);const data=new VertexData();data.positions=g.geometry.positions;data.normals=g.geometry.normals;data.indices=g.geometry.indices;data.applyToMesh(mesh);mesh.material=material(g.color,g.alpha,g.role,g.roughness,g.materialId);mesh.parent=root;mesh.receiveShadows=true;mesh.isPickable=slot!==undefined;mesh.metadata={materialRole:g.role,authoredColor:g.color,...(slot!==undefined?{slot}:{})};if(cast&&g.alpha===1)shadow.addShadowCaster(mesh);}return root;}
 // All surfaces are actual geometry with reusable authoring recipes; no backdrop illusion.
 model('room.modular',nativeRoomRecipe(),undefined,undefined,false);
 const roomMeshes=scene.meshes.filter(m=>m.name.startsWith('room.'));for(const m of roomMeshes){m.receiveShadows=true;const material=m.material as PBRMaterial;if(material.alpha===1&&[palette.wood,palette.cream,palette.dark].includes(m.metadata?.authoredColor))shadow.addShadowCaster(m);}
 const counter=model('fixture.shop-counter.w1_1',nativeCounterRecipe());counter.position.set(...layoutData.counter.position as [number,number,number]);
 const focus=model('day1.counter.welcome-card',counterFocusRecipe());focus.position.set(2.55,1.111,-1.76);
 for(const mesh of focus.getChildMeshes()){const m=mesh.material as PBRMaterial;m.emissiveColor=Color3.FromArray(linearColor('#DAB57B')).scale(.035);}
 const leafNodes:TransformNode[]=[];
 function plant(name:string,x:number,y:number,z:number,scale:number){const data=plantParts(scale),base=model(name,data.base);base.position.set(x,y,z);for(const [i,leaf] of data.leaves.entries()){const node=model(`${name}.leaf.${i}`,leaf.recipe,base);node.position.set(...leaf.pivot);leafNodes.push(node);}}
 plant('counter.plant',2.0,1.111,-1.45,.38);
 for(const [i,[x,z,scale]] of [[-3.9,2.6,1.15],[-4.05,-1.6,.9],[1.2,2.95,.52]].entries())plant(`plant.original.${i}`,x,scale===.52?1.5235:artDirection.fixtureBaseY,z,scale);
 const exteriorData=exteriorRecipe(),exterior=model('native.window.exterior',exteriorData.filter(p=>p.role!=='leaf'),undefined,undefined,false);
 for(const [i,p] of exteriorData.filter(p=>p.role==='leaf').entries()){const node=model(`native.window.foliage.${i}`,[{...p,at:[0,0,0]}],exterior,undefined,false);node.position.set(...p.at);leafNodes.push(node);}
 const door=model('native.door.leaf',doorLeafRecipe());door.position.set(2.34,.08,3.20);
 const sign=model('native.door.sign',doorSignRecipe(),door);sign.position.set(.80,1.56,-.073);
 for(let row=0;row<2;row++)for(let i=0;i<8;i++){const item=catalog.offerings[(i+row*3)%catalog.offerings.length];const stock=model(`back.display.${row}.${item.id}`,productRecipe(item.id,item.color));stock.position.set(-2.95+i*.55,1.47+.105/2+row*.76+artDirection.restingGap,2.84);stock.scaling.setAll(.85);}
 const highlights:Mesh[]=[],productRoots:TransformNode[]=[];const shelfContents:string[]=[];
 for(let i=0;i<3;i++){
  const d=layoutData.displays[i];const display=model(d.id,nativeDisplayRecipe(),undefined,i);display.position.set(d.position[0],artDirection.fixtureBaseY,d.position[2]);
  const rim=model(`${d.id}.selected`,[{shape:'round',size:[1.68,.035,1.05],at:[0,.10,0],color:'#B59AC8',radius:.016,alpha:.62}],undefined,i,false);rim.position.set(d.position[0],0,d.position[2]);for(const mesh of rim.getChildMeshes()){highlights.push(mesh as Mesh);mesh.setEnabled(false);}
  const products=new TransformNode(`${d.id}.products`,scene);products.position.set(d.position[0],artDirection.displaySurfaceY+artDirection.restingGap,d.position[2]);productRoots.push(products);
 }
 const nativeActors=createNativeActors(scene,(name,parts,parent)=>model(name,parts,parent));
 const routes=new NativeCustomerRoutes();let previousArrival=false;
 const parcel=model('discovery.graybox-sample',[
  {shape:'round',size:[.52,.30,.38],at:[0,.15,0],color:'#C8B3D4',radius:.035},
  {shape:'box',size:[.045,.31,.385],at:[0,.15,0],color:'#F6E5C1'},
  {shape:'box',size:[.525,.315,.035],at:[0,.15,0],color:'#F6E5C1'}]);parcel.position.set(-3.2,artDirection.fixtureBaseY,2.35);
 // Finite feedback meshes, shared materials; never spawned by repeated transactions.
 const receipt=model('fx.local.receipt',[{shape:'round',size:[.16,.025,.12],at:[0,0,0],color:vfx.stock.color,role:'paper',radius:.012}],undefined,undefined,false);receipt.setEnabled(false);
 const receiptMaterials={sale:material(vfx.sale.color,1,'paper'),stock:material(vfx.stock.color,1,'paper'),support:material(vfx.support.color,1,'paper')};
 const revealProxy=new TransformNode('fx.sample.proxy',scene);revealProxy.position.copyFrom(parcel.position);
 model('fx.sample.box',[{shape:'round',size:[.52,.25,.38],at:[0,.14,0],color:'#C8B3D4',radius:.025,role:'paper'}],revealProxy,undefined,false);
 const revealLid=model('fx.sample.lid',[{shape:'round',size:[.54,.055,.40],at:[0,.0,-.2],color:'#E9D8E9',radius:.02,role:'paper'}],revealProxy,undefined,false);revealLid.position.set(0,.29,.2);
 const localLight=model('fx.sample.local-light',[{shape:'sphere',size:[.18,.07,.14],at:[0,.27,0],color:'#E7D9EB',role:'paint'}],revealProxy,undefined,false);
 for(const mesh of localLight.getChildMeshes()){const m=mesh.material as PBRMaterial;m.emissiveColor=Color3.FromHexString('#9C7BA9').scale(.22);}
 revealProxy.setEnabled(false);
 const dustRoot=new TransformNode('fx.window.dust.pool',scene),dust:TransformNode[]=[];
 for(let i=0;i<vfx.dust.capacity;i++){const mote=model(`fx.dust.${i}`,[{shape:'box',size:[vfx.dust.size,vfx.dust.size,.002],at:[0,0,0],color:'#F9EACD',alpha:vfx.dust.maxOpacity,role:'paper'}],dustRoot,undefined,false);for(const m of mote.getChildMeshes()){m.receiveShadows=false;(m as Mesh).billboardMode=Mesh.BILLBOARDMODE_ALL;}dust.push(mote);}
 const clock=new FeedbackClock(),gestureClock=new Day1GestureClock();let minimalFX=false,ambientTime=0,selectionTime:number=vfx.selection.duration;
 let state:Snapshot|undefined,quality='auto',effectiveQuality='high',zen=false,panelOpen=false,selectedSlot=-1,disposed=false;
 let frames:number[]=[],last:number|undefined,visibleSamples=0,qualityCheckedAt=0;let readyAt=0,composition='';
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const setQuality=(q:string)=>{effectiveQuality=q;engine.setHardwareScalingLevel(q==='low'?1.5:1);shadow.getShadowMap()!.refreshRate=q==='low'?2:1;shadow.filteringQuality=q==='low'?ShadowGenerator.QUALITY_LOW:ShadowGenerator.QUALITY_MEDIUM;document.documentElement.dataset.renderQuality=q;};
 setQuality('high');
 const resize=()=>{
  if(disposed)return;engine.resize();const w=canvas.clientWidth,h=canvas.clientHeight,narrow=w<720;
  const panel=document.querySelector<HTMLElement>('.sidebar');const rect=panel?.getBoundingClientRect();const visible=panelOpen||!!(rect&&rect.height>0);
  const header=document.querySelector<HTMLElement>('.top')?.getBoundingClientRect();const footer=document.querySelector<HTMLElement>('.dock')?.getBoundingClientRect();
  const top=zen?20:Math.min(header?.bottom??110,h*.24)+10;let bottom=zen?20:Math.max(85,h-(footer?.top??h-85));let right=0;
  if(visible&&rect&&!zen){if(narrow)bottom=Math.max(bottom,h-rect.top+8);else right=Math.min(w*.46,w-rect.left+12);}
  const vw=Math.max(120,w-right),vh=Math.max(80,h-top-bottom);camera.viewport=new Viewport(0,bottom/h,vw/w,vh/h);
  const signature=[w,h,top,bottom,right].join(':');if(signature===composition)return;composition=signature;
  const aspect=vw/vh;camera.radius=curatedRadius(aspect,camera.fov);camera.target.set(...artDirection.target);camera.lowerRadiusLimit=Math.max(10,camera.radius-3);camera.upperRadiusLimit=camera.radius+4;
 };
 scene.onPointerPick=(_,pick)=>{const n=pick.pickedMesh?.metadata?.slot;if(typeof n==='number')onSlot(n);};
 const contextLost=()=>canvas.dispatchEvent(new CustomEvent('world-error'));
 canvas.addEventListener('webglcontextlost',contextLost);window.addEventListener('resize',resize);const observer=new ResizeObserver(resize);observer.observe(canvas);
 function finishFeedback(){const reveal=clock.active?.kind==='reveal';clock.cancel();gestureClock.cancel();nativePresentation.cancel();nativeActors.clearProps();routes.cancelPresentation();if(reveal)onFeedbackEnd();}
 function advanceFeedback(dt:number){if(disposed||document.hidden){finishFeedback();return;}const reveal=clock.active?.kind==='reveal';if(reduced.matches){gestureClock.cancel();nativePresentation.cancel();nativeActors.clearProps();}if(!motionAllowed({low:effectiveQuality==='low',minimal:minimalFX,reduced:reduced.matches})){clock.cancel();if(reveal)onFeedbackEnd();return;}clock.step(dt);if(reveal&&!clock.active)onFeedbackEnd();}
 const visibility=()=>{last=undefined;if(document.hidden)finishFeedback();};document.addEventListener('visibilitychange',visibility);
 resize();await scene.whenReadyAsync();readyAt=performance.now();
 engine.runRenderLoop(()=>{
  if(disposed||document.hidden){last=undefined;return;}
  const now=performance.now(),dt=last===undefined?0:Math.max(0,Math.min(vfx.policy.maxDt,now-last));if(last!==undefined){const sample=now-last;if(sample>0&&sample<250){frames.push(sample);visibleSamples++;if(frames.length>180)frames.shift();}}last=now;
  if(quality==='auto'&&frames.length>=90&&now-qualityCheckedAt>3000){const sorted=[...frames].sort((a,b)=>a-b);const p75=sorted[Math.floor(sorted.length*.75)];if(p75>35&&effectiveQuality!=='low')setQuality('low');qualityCheckedAt=now;}
  const policy={low:effectiveQuality==='low',minimal:minimalFX,reduced:reduced.matches},animate=motionAllowed(policy);
  advanceFeedback(dt);selectionTime=animate?Math.min(vfx.selection.duration,selectionTime+dt):vfx.selection.duration;
  const nativePolicy=resolveMotionPolicy({quality:effectiveQuality==='low'?'low':'high',minimalFx:minimalFX,reduceMotion:reduced.matches,visible:!document.hidden});
  gestureClock.step(dt,policy,document.hidden);
  const hour=state?new Date(state.watermark+9*3600000).getUTCHours():0;const trading=!!state?.open&&hour>=config.openHour&&hour<config.closeHour;
  // Milliseconds enter the engine-neutral motion clock exactly once as seconds.
  const seconds=dt/1000,routeFrame=routes.tick(seconds,{open:trading,visible:true,reduceMotion:reduced.matches,capacity:nativePolicy.customerCapacity});
  const arrival=routeFrame.actors.some(a=>a.enabled&&a.state==='entering');if(arrival&&!previousArrival&&!nativePresentation.current)gestureClock.start('greet',policy);previousArrival=arrival;
  const service=nativePresentation.tick(seconds,nativePolicy),greet=gestureClock.active;
  nativeActors.frame(seconds,nativePolicy,routeFrame,service,greet?.kind==='greet'?greet.elapsed/greet.duration:undefined);
  door.rotation.y=routeFrame.doorAngle;sign.rotation.z=nativePolicy.decorativeMotion?Math.sin(ambientTime/1000*1.4)*.024*Math.abs(routeFrame.doorAngle):0;
  leafNodes.forEach((leaf,i)=>{leaf.rotation.z=nativePolicy.decorativeMotion?Math.sin(ambientTime/1000*.43+i*1.7)*.025:0;leaf.rotation.x=nativePolicy.decorativeMotion?Math.sin(ambientTime/1000*.31+i*.8)*.012:0;});
  exterior.setEnabled(true);
  highlights.forEach((m,i)=>{m.visibility=i===selectedSlot?(.62+.18*(1-selectionTime/vfx.selection.duration)):0;});
  productRoots.forEach(r=>r.position.y=artDirection.displaySurfaceY+artDirection.restingGap);if(service?.cue.kind==='display'&&nativePolicy.decorativeMotion)productRoots[service.cue.slot].position.y+=.025*Math.sin(service.progress*Math.PI)**2;receipt.setEnabled(false);revealProxy.setEnabled(false);
  const fx=clock.active;if(fx){const p=fx.elapsed/fx.duration;if(fx.kind==='display'){productRoots[fx.slot].position.y=artDirection.displaySurfaceY+artDirection.restingGap+vfx.display.lift*(1-p)*(1-p);}else if(fx.kind==='reveal'){revealProxy.setEnabled(true);revealLid.rotation.x=-Math.sin(Math.min(1,p*2)*Math.PI/2)*1.12;localLight.scaling.setAll(.75+.25*Math.sin(p*Math.PI));}else{receipt.setEnabled(true);receipt.position.set(2.2,1.16+.08*p,-1.5);for(const m of receipt.getChildMeshes()){m.material=receiptMaterials[fx.kind];m.visibility=Math.sin(p*Math.PI)*.7;}}}
  ambientTime=(ambientTime+dt)%120000;dustRoot.setEnabled(nativePolicy.decorativeMotion);if(nativePolicy.decorativeMotion){dust.forEach((m,i)=>{const phase=((ambientTime/vfx.dust.lifetime)+i/vfx.dust.capacity)%1;m.position.set(-4.0+(i%3)*.34+phase*.14,.7+phase*1.6,-.75+(i%4)*.39);for(const mesh of m.getChildMeshes())mesh.visibility=Math.sin(phase*Math.PI)*.8;});}
  scene.render();
 });
 return {
  baseline(){nativeActors.clearProps();routes.reset();previousArrival=false;},
  update(s:Snapshot){state=s;parcel.setEnabled(!s.revealed);for(let i=0;i<3;i++){const id=s.shelves[i],item=s.inventory[id],o=catalog.offerings.find(o=>o.id===id),count=Math.min(4,item?.stock??0);const key=`${id}:${count}`;if(shelfContents[i]===key)continue;shelfContents[i]=key;for(const child of [...productRoots[i].getChildren()]){if(child instanceof TransformNode)for(const mesh of child.getChildMeshes())shadow.removeShadowCaster(mesh);child.dispose(false);}if(!o)continue;for(let k=0;k<count;k++){const object=model(`${layoutData.displays[i].id}.${id}.${k}`,productRecipe(id,o.color),productRoots[i],i);object.position.set((k%2-.5)*.60,0,(Math.floor(k/2)-.5)*.38);object.rotation.y=[-.07,.04,.025,-.045][k];object.scaling.setAll(id==='off.pencil'?1.05:.82);}}resize();},
  quality(q:string){if(quality===q)return;quality=q;frames=[];last=undefined;setQuality(q==='low'?'low':'high');},
  zen(value:boolean){zen=value;resize();},layout(value:boolean){panelOpen=value;resize();},
  selected(slot:number){if(selectedSlot!==slot){selectedSlot=slot;selectionTime=0;}highlights.forEach((m,i)=>m.setEnabled(i===slot));},
  minimal(value:boolean){if(minimalFX===value)return;minimalFX=value;if(value){const reveal=clock.active?.kind==='reveal';clock.cancel();if(reveal)onFeedbackEnd();}},
  feedback(event:Feedback){const reveal=clock.active?.kind==='reveal';clock.cancel();if(reveal)onFeedbackEnd();if(disposed||document.hidden)return false;const policy={low:effectiveQuality==='low',minimal:minimalFX,reduced:reduced.matches};clock.start(event.kind,event.slot,policy);return !!clock.active;},
  gesture(kind:'greet'){if(disposed)return false;return gestureClock.start(kind,{low:effectiveQuality==='low',minimal:minimalFX,reduced:reduced.matches},document.hidden);},
  skip(){finishFeedback();},
  skipReveal(){if(clock.active?.kind==='reveal'){clock.cancel();onFeedbackEnd();}},
  metrics(){return {presentationActor:nativeActors.staff.root.metadata,nativeMotion:nativeActors.metrics(),nativeService:nativePresentation.metrics(),gesture:gestureClock.active?.kind??null,artDirection:artDirection.id,readyAtMs:readyAt,quality,effectiveQuality,adaptivePolicy:'auto drops transient FX/dust, resolution and crowd after 90 visible samples with p75 >35ms; economy unchanged',minimalFX,reducedMotion:reduced.matches,feedback:clock.active?.kind??null,materials:scene.materials.length,dustCapacity:vfx.dust.capacity,customerRoots:nativeActors.visitors.map(c=>({position:c.root.position.asArray(),enabled:c.root.isEnabled()})),selectedSlot,visibleSamples,frameSamplesMs:[...frames],fps:frames.length?1000/(frames.reduce((a,b)=>a+b,0)/frames.length):null,meshes:scene.meshes.length,activeMeshes:scene.getActiveMeshes().length,renderer:engine.getGlInfo(),viewport:[canvas.width,canvas.height],cameraViewport:camera.viewport};},
  dispose(){finishFeedback();disposed=true;routes.dispose();nativeActors.dispose();clock.dispose();observer.disconnect();window.removeEventListener('resize',resize);document.removeEventListener('visibilitychange',visibility);canvas.removeEventListener('webglcontextlost',contextLost);engine.stopRenderLoop();scene.dispose();engine.dispose();}
 };
}
