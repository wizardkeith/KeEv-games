import {RawTexture} from '@babylonjs/core/Materials/Textures/rawTexture';
import {surfaceFinishSpec,type SurfaceFinish} from './art/surface-finish-v11';
import {installExperimentalStaticGI} from './art/static-gi-experiment-v11';
import {windowPortalPlanes,farSkyColors,farSkyRecipe} from './art/window-portal-v11';
import {Plane} from '@babylonjs/core/Maths/math.plane';
import {floorContactBake,floorContactUV} from './art/floor-bake-v11';
import {stagedProducts} from './art/staged-products-v11';
import {ImageProcessingConfiguration} from '@babylonjs/core/Materials/imageProcessingConfiguration';
import {backDisplayRecipe} from './art/back-display-v10';
import {NativeShopLife,shopLifeText} from './presentation/native-shop-life';
import {locale} from './ui/copy';
import {botanicalPrintMaterial} from './art/shop-v10';
import {nativeVisibleSteps} from './presentation/native-visible-clock';
import type {SaleMarginPayload} from './presentation/sale-accounting';
import {roomProbeContract,roomProbeData} from './art/native-room-probe';
import {RawCubeTexture} from '@babylonjs/core/Materials/Textures/rawCubeTexture';
import {SphericalHarmonics,SphericalPolynomial} from '@babylonjs/core/Maths/sphericalPolynomial';
import '@babylonjs/core/Materials/Textures/baseTexture.polynomial';
import {nativeStylingRecipe,nativeWindowCanopy} from './art/native-styling';
import {nativeHairMaterial,nativeClothMaterial,nativeGlaze,nativeMaterialIntent,nativeTransmission} from './art/native-materials';
import {Texture} from '@babylonjs/core/Materials/Textures/texture';
import {displaySamples} from './art/native-display';
import {Material} from '@babylonjs/core/Materials/material';
import {nativeCameraFrame,nativeLighting,type NativeView} from './art/native-view';
import {NativeDelivery,type DeliveryFrame} from './presentation/native-delivery';
import {nativeProductRecipe as productRecipe} from './art/native-products';
import {Engine} from '@babylonjs/core/Engines/engine';
import {Scene} from '@babylonjs/core/scene';
import {Color3,Color4} from '@babylonjs/core/Maths/math.color';
import {Vector3,Matrix} from '@babylonjs/core/Maths/math.vector';
import {Viewport} from '@babylonjs/core/Maths/math.viewport';
import {ArcRotateCamera} from '@babylonjs/core/Cameras/arcRotateCamera';
import {HemisphericLight} from '@babylonjs/core/Lights/hemisphericLight';
import {Light} from '@babylonjs/core/Lights/light';
import {SpotLight} from '@babylonjs/core/Lights/spotLight';
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
import {artDirection} from './art/direction';
import {FeedbackClock,motionAllowed,vfx} from './presentation/config';
import type {Feedback} from './presentation/feedback';
import {NativeCustomerRoutes,type RouteFrame} from './presentation/native-routes';
import {createNativeActors} from './presentation/native-scene';
import {NativeCommitPresentation} from './presentation/native-commits';
import {resolveMotionPolicy} from './presentation/native-motion';
import {nativeGrouped,type NativeSurface} from './art/native-characters';
import {nativeRoomRecipe,nativeCounterRecipe,nativeDisplayRecipe,doorLeafRecipe,doorSignRecipe,plantParts,exteriorRecipe} from './art/native-environment';
import {Day1GestureClock} from './presentation/day1';
import {counterFocusRecipe} from './art/day1-focus';

export async function createWorld(canvas:HTMLCanvasElement,onSlot:(n:number)=>void,onFeedbackEnd:()=>void=()=>{},nativePresentation=new NativeCommitPresentation()){
 const engine=new Engine(canvas,true,{preserveDrawingBuffer:false,stencil:true,adaptToDeviceRatio:false});
 const scene=new Scene(engine);scene.useRightHandedSystem=true;scene.clearColor=Color4.FromHexString('#F4EFE8FF');scene.imageProcessingConfiguration.toneMappingEnabled=true;scene.imageProcessingConfiguration.toneMappingType=ImageProcessingConfiguration.TONEMAPPING_ACES;scene.imageProcessingConfiguration.exposure=nativeLighting.exposure;scene.imageProcessingConfiguration.contrast=1.06;
 const camera=new ArcRotateCamera('curated.40deg',-Math.PI/4,50*Math.PI/180,18,new Vector3(0,1,0),scene);
 camera.attachControl(canvas,true);camera.lowerBetaLimit=45*Math.PI/180;camera.upperBetaLimit=55*Math.PI/180;camera.lowerAlphaLimit=-Math.PI/4-.27;camera.upperAlphaLimit=-Math.PI/4+.27;camera.lowerRadiusLimit=13;camera.upperRadiusLimit=26;camera.panningSensibility=0;camera.wheelDeltaPercentage=.012;camera.minZ=.1;camera.maxZ=90;
 const sky=new HemisphericLight('soft cream sky',new Vector3(0,1,0),scene);sky.intensity=nativeLighting.fill.intensity;sky.diffuse=Color3.FromArray(linearColor(nativeLighting.fill.color));sky.groundColor=Color3.FromArray(linearColor(nativeLighting.fill.ground));
 const sun=new DirectionalLight('static window sunlight',Vector3.FromArray([...nativeLighting.key.direction]),scene);sun.position.set(...nativeLighting.key.position);sun.diffuse=Color3.FromArray(linearColor(nativeLighting.key.color));sun.intensity=nativeLighting.key.intensity;sun.shadowMinZ=.1;sun.shadowMaxZ=35;
 const shadow=new ShadowGenerator(nativeLighting.shadow.size,sun);shadow.useContactHardeningShadow=true;shadow.contactHardeningLightSizeUVRatio=nativeLighting.shadow.lightSizeUVRatio;shadow.filteringQuality=ShadowGenerator.QUALITY_MEDIUM;shadow.bias=nativeLighting.shadow.bias;shadow.normalBias=nativeLighting.shadow.normalBias;shadow.darkness=nativeLighting.shadow.darkness;
 const probeData=roomProbeData(),probe=new RawCubeTexture(scene,probeData.faces,roomProbeContract.size,Engine.TEXTUREFORMAT_RGB,Engine.TEXTURETYPE_UNSIGNED_BYTE,true,false,Texture.TRILINEAR_SAMPLINGMODE);probe.name=roomProbeContract.id;probe.gammaSpace=false;
 const harmonics=new SphericalHarmonics();for(const s of probeData.samples)harmonics.addLight(Vector3.FromArray(s.direction),Color3.FromArray(s.color),s.weight);harmonics.convertIncidentRadianceToIrradiance();harmonics.convertIrradianceToLambertianRadiance();probe.sphericalPolynomial=SphericalPolynomial.FromHarmonics(harmonics);scene.environmentTexture=probe;
 const botanicalAtlas=new Texture(botanicalPrintMaterial.path,scene,false,false);botanicalAtlas.gammaSpace=true;botanicalAtlas.name='native.v10.botanical.print';
 const contactMap=new Texture(floorContactBake.path,scene,false,false);contactMap.gammaSpace=false;contactMap.coordinatesIndex=1;contactMap.wrapU=Texture.CLAMP_ADDRESSMODE;contactMap.wrapV=Texture.CLAMP_ADDRESSMODE;
 const materials=new Map<string,PBRMaterial>();const woodGrain=new Texture('/assets/native-v11/honey-oak-albedo.png',scene);woodGrain.name='native.v5.wood-grain';woodGrain.gammaSpace=true;woodGrain.wrapU=Texture.WRAP_ADDRESSMODE;woodGrain.wrapV=Texture.WRAP_ADDRESSMODE;
 const floorMap=new Texture('/assets/native-v10/floor-colour.png',scene);floorMap.name='native.v6.floor';floorMap.gammaSpace=true;floorMap.uScale=1/1.10;floorMap.vScale=1/2.20;floorMap.uOffset=4.525/1.10;
 const clothMap=new Texture(nativeClothMaterial.baseColor,scene,false,false);clothMap.name='native.v6.cloth';clothMap.gammaSpace=true;clothMap.uScale=nativeClothMaterial.repeat;clothMap.vScale=nativeClothMaterial.repeat;
 const hairColour=new Texture(nativeHairMaterial.baseColor,scene,false,false);hairColour.gammaSpace=true;hairColour.name='native.v5.hair.colour';const hairNormal=new Texture(nativeHairMaterial.normal,scene,false,false);hairNormal.gammaSpace=false;hairNormal.level=nativeHairMaterial.normalScale;hairNormal.name='native.v5.hair.normal';
 const timberNormal=new Texture('/assets/native-v10/timber-normal.png',scene);timberNormal.name='native.v9.timber.normal';timberNormal.gammaSpace=false;timberNormal.level=.20;
 const plasterNormal=new Texture('/assets/native-v10/plaster-normal.png',scene);plasterNormal.name='native.v9.plaster.normal';plasterNormal.gammaSpace=false;plasterNormal.level=.15;
 const linenNormal=new Texture(nativeClothMaterial.normal,scene,false,false);linenNormal.name='native.v9.linen.normal';linenNormal.gammaSpace=false;linenNormal.level=nativeClothMaterial.normalScale;linenNormal.uScale=nativeClothMaterial.repeat;linenNormal.vScale=nativeClothMaterial.repeat;
 // Development-only UV inspection. Never enabled in production bundles.
 let fabricChecker:Texture|undefined;
 if(import.meta.env.DEV&&new URLSearchParams(location.search).has('fabric-check')){const size=128,data=new Uint8Array(size*size*4);for(let y=0;y<size;y++)for(let x=0;x<size;x++){const c=x%32<2?[192,65,85]:y%32<2?[65,91,192]:(Math.floor(x/32)+Math.floor(y/32))%2?[220,216,205]:[116,128,134];data.set([...c,255],(y*size+x)*4);}fabricChecker=RawTexture.CreateRGBATexture(data,size,size,scene,true,false,Texture.NEAREST_SAMPLINGMODE);fabricChecker.wrapU=Texture.WRAP_ADDRESSMODE;fabricChecker.wrapV=Texture.WRAP_ADDRESSMODE;fabricChecker.uScale=5;fabricChecker.vScale=5;fabricChecker.gammaSpace=true;Object.assign(window,{littleShopFabricChecker:{cellMetres:.05,red:'U seam/grid',blue:'V seam/grid',source:'DEV diagnostic only; not release art'}});}
 const finishTextureCache=new Map<string,Texture>();
 const finishTexture=(path:string,repeat:number,kind:'albedo'|'normal'|'orm',level=1)=>{let t=finishTextureCache.get(path);if(!t){t=new Texture(path,scene,false,false);t.gammaSpace=kind==='albedo';t.wrapU=Texture.WRAP_ADDRESSMODE;t.wrapV=Texture.WRAP_ADDRESSMODE;t.uScale=repeat;t.vScale=repeat;t.level=level;finishTextureCache.set(path,t);}return t;};
 function material(hex:string,alpha=1,role:MaterialRole='paint',roughness?:number,identity?:string,baseColorTexture?:string,finish?:SurfaceFinish){const spec=identity?nativeMaterialIntent({role,color:hex,alpha,roughness}):materialRenderState(role,hex,alpha),key=identity??spec.materialId;let m=materials.get(key);if(!m){m=new PBRMaterial(key,scene);m.albedoColor=Color3.FromArray(spec.baseColorLinear);m.roughness=roughness??spec.roughness;m.metallic=spec.metallic;m.indexOfRefraction=spec.indexOfRefraction;m.environmentIntensity=.8;const glaze=identity?nativeGlaze(role):undefined;if(glaze){m.clearCoat.isEnabled=true;m.clearCoat.intensity=glaze.intensity;m.clearCoat.roughness=glaze.roughness;m.clearCoat.indexOfRefraction=glaze.indexOfRefraction;}const transmission=identity?nativeTransmission(role):undefined;if(transmission){m.subSurface.isTranslucencyEnabled=true;m.subSurface.translucencyIntensity=transmission.intensity;m.subSurface.translucencyColor=Color3.FromArray(linearColor(transmission.color));m.subSurface.minimumThickness=transmission.minimumThickness;m.subSurface.maximumThickness=transmission.maximumThickness;}if(role==='paper'&&roughness===botanicalPrintMaterial.roughness)m.albedoTexture=botanicalAtlas;if(hex==='#F8DDA5')m.emissiveColor=Color3.FromArray(spec.baseColorLinear).scale(.25);m.alpha=spec.alpha;m.transparencyMode=spec.alphaBlend?PBRMaterial.PBRMATERIAL_ALPHABLEND:PBRMaterial.PBRMATERIAL_OPAQUE;if(role==='wood')m.albedoTexture=scene.getTextureByName(['#C2A481','#B99A76','#C49666','#B88B5C'].includes(hex)?'native.v6.floor':'native.v5.wood-grain');if(role==='wood')m.bumpTexture=scene.getTextureByName('native.v9.timber.normal');if(role==='paint'&&hex==='#EBD9BD')m.bumpTexture=scene.getTextureByName('native.v9.plaster.normal');if(role==='fabric'){m.albedoTexture=scene.getTextureByName('native.v6.cloth');m.bumpTexture=scene.getTextureByName('native.v9.linen.normal');if(identity){m.invertNormalMapX=false;m.invertNormalMapY=true;}}if(roughness!==undefined&&role==='hair'&&roughness===nativeHairMaterial.roughness){m.albedoTexture=hairColour;m.bumpTexture=hairNormal;m.invertNormalMapX=false;m.invertNormalMapY=true;}if(finish){const f=surfaceFinishSpec(finish);m.albedoTexture=finishTexture(f.baseColor,f.repeat,'albedo');m.bumpTexture=finishTexture(f.normal,f.repeat,'normal',f.normalScale);m.metallicTexture=finishTexture(f.orm,f.repeat,'orm');m.useRoughnessFromMetallicTextureGreen=true;m.useMetallnessFromMetallicTextureBlue=true;m.useAmbientOcclusionFromMetallicTextureRed=false;m.invertNormalMapX=false;m.invertNormalMapY=true;if(f.sheen){m.sheen.isEnabled=true;m.sheen.intensity=f.sheen;m.sheen.color=Color3.FromArray(spec.baseColorLinear);m.sheen.roughness=f.sheenRoughness;}}if(finish&&fabricChecker){m.albedoTexture=fabricChecker;m.albedoColor=Color3.White();m.bumpTexture=null;m.metallicTexture=null;m.sheen.isEnabled=false;m.roughness=.85;}if(baseColorTexture){const t=new Texture(baseColorTexture,scene,false,false);t.gammaSpace=true;t.wrapU=Texture.CLAMP_ADDRESSMODE;t.wrapV=Texture.CLAMP_ADDRESSMODE;m.albedoTexture=t;}if(role==='wood'&&roughness===.83){m.ambientTexture=contactMap;m.useAmbientInGrayScale=true;m.ambientTextureStrength=floorContactBake.strength;m.ambientTextureImpactOnAnalyticalLights=floorContactBake.analyticalImpact;}m.backFaceCulling=spec.backFaceCulling;m.twoSidedLighting=spec.twoSidedLighting;materials.set(key,m);}return m;}
 function model(name:string,recipe:NativeSurface[],parent?:TransformNode,slot?:number,cast=true){const root=new TransformNode(name,scene);if(parent)root.parent=parent;for(const [i,g] of nativeGrouped(recipe).entries()){const mesh=new Mesh(`${name}.material${i}`,scene);const data=new VertexData();data.positions=g.geometry.positions;data.normals=g.geometry.normals;data.indices=g.geometry.indices;data.uvs=g.geometry.uvs??null;data.tangents=g.geometry.tangents??null;if(g.role==='wood'&&g.roughness===.83)data.uvs2=floorContactUV(g.geometry.positions);data.applyToMesh(mesh);mesh.sideOrientation=Material.CounterClockWiseSideOrientation;mesh.material=material(g.color,g.alpha,g.role,g.roughness,g.materialId,g.baseColorTexture,g.finish);mesh.parent=root;mesh.receiveShadows=true;mesh.isPickable=slot!==undefined;mesh.metadata={materialRole:g.role,authoredColor:g.color,...(slot!==undefined?{slot}:{})};if(cast&&g.alpha===1)shadow.addShadowCaster(mesh);}return root;}
 // All surfaces are actual geometry with reusable authoring recipes; no backdrop illusion.
 model('room.modular',nativeRoomRecipe(),undefined,undefined,false);
 const roomMeshes=scene.meshes.filter(m=>m.name.startsWith('room.'));for(const m of roomMeshes){m.receiveShadows=true;const material=m.material as PBRMaterial;if(material.alpha===1&&(m.metadata?.materialRole==='paint'||m.metadata?.materialRole==='wood'&&!['#C2A481','#B99A76','#C49666','#B88B5C'].includes(m.metadata?.authoredColor)))shadow.addShadowCaster(m);}
 model('room.styling.v9',nativeStylingRecipe());
 const counter=model('fixture.shop-counter.w1_1',nativeCounterRecipe());counter.position.set(...layoutData.counter.position as [number,number,number]);
 const focus=model('day1.counter.welcome-card',counterFocusRecipe());focus.position.set(2.55,1.111,-1.76);
 for(const mesh of focus.getChildMeshes()){const m=mesh.material as PBRMaterial;m.emissiveColor=Color3.FromArray(linearColor('#DAB57B')).scale(.035);}
 const leafNodes:TransformNode[]=[];
 function plant(name:string,x:number,y:number,z:number,scale:number){const data=plantParts(scale),base=model(name,data.base);base.position.set(x,y,z);for(const [i,leaf] of data.leaves.entries()){const node=model(`${name}.leaf.${i}`,leaf.recipe,base);node.position.set(...leaf.pivot);leafNodes.push(node);}}
 // Counter flowers are original static fixture dressing in buildV11Styling.
 for(const [i,[x,z,scale]] of [[-3.9,2.6,1.15],[-3.95,-2.7,1.4],[1.2,2.95,.52],[4.10,2.50,1.45]].entries())plant(`plant.original.${i}`,x,scale===.52?1.5235:artDirection.fixtureBaseY,z,scale);
 const exteriorData=[...exteriorRecipe(),...nativeWindowCanopy(),...farSkyRecipe()],exterior=model('native.window.exterior',exteriorData.filter(p=>p.role!=='leaf'),undefined,undefined,false);
 for(const [i,p] of exteriorData.filter(p=>p.role==='leaf').entries()){const node=model(`native.window.foliage.${i}`,[{...p,at:[0,0,0]}],exterior,undefined,true);node.position.set(...p.at);leafNodes.push(node);}
 const exteriorFill=new HemisphericLight('cool exterior sky',new Vector3(-1,.8,0),scene);exteriorFill.diffuse=Color3.FromArray(linearColor(nativeLighting.exteriorFill.color));exteriorFill.groundColor=Color3.FromArray(linearColor(nativeLighting.exteriorFill.ground));exteriorFill.intensity=nativeLighting.exteriorFill.intensity;exteriorFill.includedOnlyMeshes=exterior.getChildMeshes();
 // A geometric portal gives the outside vignette a real distant sky layer
 // without showing an oversized sky card beyond the open cutaway silhouette.
 const portalPlanes=Array.from({length:4},()=>new Plane(0,0,0,0)),portalMaterials=new Map<PBRMaterial,PBRMaterial>();
 for(const mesh of exterior.getChildMeshes()){const original=mesh.material as PBRMaterial;let clipped=portalMaterials.get(original);if(!clipped){clipped=original.clone('window.portal.'+original.name)!;[clipped.clipPlane,clipped.clipPlane2,clipped.clipPlane3,clipped.clipPlane4]=portalPlanes;portalMaterials.set(original,clipped);}mesh.material=clipped;if((farSkyColors as readonly string[]).includes(mesh.metadata?.authoredColor))clipped.unlit=true;}
 scene.onBeforeCameraRenderObservable.add(()=>{const p=camera.position,planes=windowPortalPlanes([p.x,p.y,p.z]);for(let i=0;i<4;i++){portalPlanes[i].normal.copyFromFloats(planes[i][0],planes[i][1],planes[i][2]);portalPlanes[i].d=planes[i][3];}});
 const door=model('native.door.leaf',doorLeafRecipe());door.position.set(2.34,.08,3.20);
 const sign=model('native.door.sign',doorSignRecipe(),door);sign.position.set(.80,1.56,-.073);
 model('back.display.curated.v10',backDisplayRecipe());
 const highlights:Mesh[]=[],productRoots:TransformNode[]=[];const shelfContents:string[]=[];
 for(let i=0;i<3;i++){
  const d=layoutData.displays[i];const display=model(d.id,nativeDisplayRecipe(i),undefined,i);display.position.set(d.position[0],artDirection.fixtureBaseY,d.position[2]);
  const rim=model(`${d.id}.selected`,[{shape:'round',size:[1.98,.035,1.20],at:[0,.10,0],color:'#B59AC8',radius:.016,alpha:.62}],undefined,i,false);rim.position.set(d.position[0],0,d.position[2]);for(const mesh of rim.getChildMeshes()){highlights.push(mesh as Mesh);mesh.setEnabled(false);}
  const products=new TransformNode(`${d.id}.products`,scene);products.position.set(d.position[0],artDirection.displaySurfaceY+artDirection.restingGap,d.position[2]);productRoots.push(products);
 }
 const nativeActors=createNativeActors(scene,(name,parts,parent)=>model(name,parts,parent));
 const routes=new NativeCustomerRoutes(),delivery=new NativeDelivery();let previousArrival=false;let currentRoutes:ReturnType<NativeCustomerRoutes['tick']>|undefined;
 const faceFill=new HemisphericLight('soft local face fill',Vector3.FromArray([...nativeLighting.faceFill.direction]),scene);faceFill.intensity=nativeLighting.faceFill.intensity;faceFill.diffuse=Color3.FromArray(linearColor(nativeLighting.faceFill.color));faceFill.groundColor=Color3.FromArray(linearColor(nativeLighting.faceFill.ground));faceFill.includedOnlyMeshes=scene.meshes.filter(m=>nativeLighting.faceFill.parts.some(p=>m.name.includes('.'+p+'.material'))&&nativeLighting.faceFill.roles.includes(m.metadata?.materialRole));
 const practicalLights=nativeLighting.practicals.map(spec=>{const light=new SpotLight('native.practical.'+spec.id,Vector3.FromArray([...spec.position]),new Vector3(0,-1,0),spec.angle,2,scene);light.diffuse=Color3.FromArray(linearColor(spec.color));light.intensityMode=Light.INTENSITYMODE_LUMINOUSINTENSITY;light.intensity=spec.intensity;light.range=5;light.excludedMeshes=exterior.getChildMeshes();return light;});
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
 // One reusable DOM annotation outside app repaint; keyed only by confirmed
 // receipt revision. It labels an aggregate, never an invented individual sale.
 const life=new NativeShopLife(),lifeNode=document.createElement('div');lifeNode.className='shop-life-bubble';lifeNode.hidden=true;lifeNode.setAttribute('aria-live','off');document.body.append(lifeNode);
 const marginNode=document.createElement('div');marginNode.className='sale-margin';marginNode.hidden=true;marginNode.setAttribute('role','status');marginNode.setAttribute('aria-live','polite');
 const marginLabel=document.createElement('span'),marginValue=document.createElement('strong'),marginNote=document.createElement('small');marginNode.append(marginLabel,marginValue,marginNote);document.body.append(marginNode);
 const pendingMargins=new Map<number,{payload:SaleMarginPayload;age:number}>();let activeMargin:{payload:SaleMarginPayload;age:number}|undefined;let marginWatermark=-1;
 function showMargin(payload:SaleMarginPayload){activeMargin={payload,age:0};marginLabel.textContent=payload.label;marginValue.textContent=payload.signed;marginNote.textContent=payload.note;marginNode.title=payload.detail;marginNode.dataset.tone=payload.grossMargin<0?'loss':payload.grossMargin>0?'profit':'neutral';marginNode.dataset.revision=String(payload.revision);}
 const clock=new FeedbackClock(),gestureClock=new Day1GestureClock();let minimalFX=false,ambientTime=0,selectionTime:number=vfx.selection.duration;
 let state:Snapshot|undefined,quality='auto',effectiveQuality='high',zen=false,panelOpen=false,selectedSlot=-1,disposed=false;
 let frames:number[]=[],last:number|undefined,visibleSamples=0,qualityCheckedAt=0;let readyAt=0,composition='',viewMode:NativeView='shop',lastFitRadius=0;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const setQuality=(q:string)=>{effectiveQuality=q;practicalLights.forEach((l,i)=>l.setEnabled(q!=='low'||i===0));shadow.getShadowMap()!.resize(q==='low'?1024:nativeLighting.shadow.size);engine.setHardwareScalingLevel(q==='low'?1.5:1);shadow.getShadowMap()!.refreshRate=q==='low'?2:1;shadow.usePercentageCloserFiltering=q==='low';shadow.useContactHardeningShadow=q!=='low';shadow.filteringQuality=q==='low'?ShadowGenerator.QUALITY_LOW:ShadowGenerator.QUALITY_MEDIUM;document.documentElement.dataset.renderQuality=q;};
 setQuality('high');
 const resize=()=>{
  if(disposed)return;engine.resize();const w=canvas.clientWidth,h=canvas.clientHeight,narrow=w<720;
  // Overlay UI never participates in the world viewport. Only a real canvas
  // resize or an explicit camera-view choice may refit the composition.
  const top=zen?0:narrow?Math.min(112,h*.20):Math.min(88,h*.13);
  const bottom=zen?0:narrow?Math.min(92,h*.20):Math.min(104,h*.15);
  const right=0;
  const vw=Math.max(120,w-right),vh=Math.max(80,h-top-bottom);camera.viewport=new Viewport(0,bottom/h,vw/w,vh/h);
  const signature=[w,h,viewMode,zen].join(':');if(signature===composition)return;composition=signature;
  const fit=nativeCameraFrame(vw/vh,camera.fov,viewMode),zoom=lastFitRadius?camera.radius/lastFitRadius:1;camera.lowerRadiusLimit=fit.lowerRadiusLimit;camera.upperRadiusLimit=fit.upperRadiusLimit;camera.radius=Math.max(fit.lowerRadiusLimit,Math.min(fit.upperRadiusLimit,fit.radius*zoom));camera.target.set(...fit.target);lastFitRadius=fit.radius;
 };
 scene.onPointerPick=(_,pick)=>{const n=pick.pickedMesh?.metadata?.slot;if(typeof n==='number')onSlot(n);};
 const contextLost=()=>canvas.dispatchEvent(new CustomEvent('world-error'));
 canvas.addEventListener('webglcontextlost',contextLost);window.addEventListener('resize',resize);const observer=new ResizeObserver(resize);observer.observe(canvas);
 function finishFeedback(){life.cancel();lifeNode.hidden=true;pendingMargins.clear();activeMargin=undefined;marginNode.hidden=true;const reveal=clock.active?.kind==='reveal';clock.cancel();gestureClock.cancel();nativePresentation.cancel();nativeActors.clearProps();delivery.cancel(routes);if(reveal)onFeedbackEnd();}
 function advanceFeedback(dt:number){if(disposed||document.hidden){finishFeedback();return;}const reveal=clock.active?.kind==='reveal';if(reduced.matches){gestureClock.cancel();nativePresentation.cancel();nativeActors.clearProps();}if(!motionAllowed({low:effectiveQuality==='low',minimal:minimalFX,reduced:reduced.matches})){clock.cancel();if(reveal)onFeedbackEnd();return;}clock.step(dt);if(reveal&&!clock.active)onFeedbackEnd();}
 const visibility=()=>{last=undefined;if(document.hidden)finishFeedback();};document.addEventListener('visibilitychange',visibility);
 resize();await scene.whenReadyAsync();if(import.meta.env.VITE_STATIC_GI==='1'){await installExperimentalStaticGI(scene);await scene.whenReadyAsync();}const clothDiagnostic=import.meta.env.VITE_V11_CLOTH_DIAGNOSTIC;if(clothDiagnostic==='control'||clothDiagnostic==='neutral'){const {installClothDiagnostic}=await import('./art/cloth-diagnostic-v11');installClothDiagnostic(scene,clothDiagnostic);await scene.whenReadyAsync();}readyAt=performance.now();
 let nativeTiming={steps:0,wallMs:0,consumedMs:0,droppedMs:0};
 engine.runRenderLoop(()=>{
  if(disposed||document.hidden){last=undefined;return;}
  const now=performance.now(),elapsed=last===undefined?0:Math.max(0,now-last),dt=Math.min(vfx.policy.maxDt,elapsed);if(last!==undefined){const sample=now-last;if(sample>0&&sample<250){frames.push(sample);visibleSamples++;if(frames.length>180)frames.shift();}}last=now;
  if(quality==='auto'&&frames.length>=90&&now-qualityCheckedAt>3000){const sorted=[...frames].sort((a,b)=>a-b);const p75=sorted[Math.floor(sorted.length*.75)];if(p75>35&&effectiveQuality!=='low')setQuality('low');qualityCheckedAt=now;}
  const nativeElapsed=nativeVisibleSteps(elapsed);nativeTiming.steps=nativeElapsed.steps.length;nativeTiming.wallMs+=elapsed;nativeTiming.consumedMs+=nativeElapsed.milliseconds;nativeTiming.droppedMs+=nativeElapsed.droppedMilliseconds;
  const policy={low:effectiveQuality==='low',minimal:minimalFX,reduced:reduced.matches},animate=motionAllowed(policy);
  selectionTime=animate?Math.min(vfx.selection.duration,selectionTime+nativeElapsed.milliseconds):vfx.selection.duration;
  const nativePolicy=resolveMotionPolicy({quality:effectiveQuality==='low'?'low':'high',minimalFx:minimalFX,reduceMotion:reduced.matches,visible:!document.hidden});
  const hour=state?new Date(state.watermark+9*3600000).getUTCHours():0;const trading=!!state?.open&&hour>=config.openHour&&hour<config.closeHour;
  // One render may contain several bounded physics/pose steps. Low render FPS
  // must not stretch a14-second approach into minutes or erase release markers.
  let service:DeliveryFrame|undefined,routeFrame:RouteFrame=routes.tick(0,{open:trading,visible:true,reduceMotion:reduced.matches,capacity:nativePolicy.customerCapacity});
  for(const seconds of nativeElapsed.steps){
   advanceFeedback(seconds*1000);gestureClock.step(seconds*1000,policy,document.hidden);
   routeFrame=routes.tick(seconds,{open:trading,visible:true,reduceMotion:reduced.matches,capacity:nativePolicy.customerCapacity,staff:nativeActors.staffPosition(),serviceStaffReady:nativeActors.workReady()});
  const arrival=routeFrame.actors.some(a=>a.enabled&&a.state==='entering');if(arrival&&!previousArrival&&!nativePresentation.current)gestureClock.start('greet',policy);previousArrival=arrival;
   service=delivery.tick(seconds,nativePresentation,routes,nativePolicy,nativeActors.workReady(),nativeActors.handoffReady());const greet=gestureClock.active;routeFrame=routes.tick(0,{open:trading,visible:true,reduceMotion:reduced.matches,capacity:nativePolicy.customerCapacity,staff:nativeActors.staffPosition(),serviceStaffReady:nativeActors.workReady()});
   nativeActors.frame(seconds,nativePolicy,routeFrame,service,greet?.kind==='greet'?greet.elapsed/greet.duration:undefined,!!nativePresentation.current);
   const lifeMotion=nativeActors.metrics();life.tick(seconds,routeFrame,{target:lifeMotion.greetingTargetId,kind:lifeMotion.greetingKind,elapsed:lifeMotion.localGreeting},nativePolicy.nativeMotion&&trading&&!panelOpen&&!document.querySelector('#day1-story')&&!clock.active&&!nativePresentation.current&&!activeMargin&&pendingMargins.size===0,productRoots.some(root=>root.getChildren().length>0));
   if(service?.cue.kind==='sale'&&service.progress>=.72){const item=pendingMargins.get(service.receiptRevision);if(item){showMargin(item.payload);pendingMargins.delete(service.receiptRevision);}}
  }
  currentRoutes=routeFrame;
  door.rotation.y=routeFrame.doorAngle;sign.rotation.z=nativePolicy.decorativeMotion?Math.sin(ambientTime/1000*1.4)*.024*Math.abs(routeFrame.doorAngle):0;
  leafNodes.forEach((leaf,i)=>{leaf.rotation.z=nativePolicy.decorativeMotion?Math.sin(ambientTime/1000*.43+i*1.7)*.025:0;leaf.rotation.x=nativePolicy.decorativeMotion?Math.sin(ambientTime/1000*.31+i*.8)*.012:0;});
  exterior.setEnabled(true);
  highlights.forEach((m,i)=>{m.visibility=i===selectedSlot?(.62+.18*(1-selectionTime/vfx.selection.duration)):0;});
  productRoots.forEach(r=>r.position.y=artDirection.displaySurfaceY+artDirection.restingGap);if(service?.cue.kind==='display'&&nativePolicy.decorativeMotion)productRoots[service.cue.slot].position.y+=.025*Math.sin(service.progress*Math.PI)**2;receipt.setEnabled(false);revealProxy.setEnabled(false);
  const fx=clock.active;if(fx){const p=fx.elapsed/fx.duration;if(fx.kind==='display'){productRoots[fx.slot].position.y=artDirection.displaySurfaceY+artDirection.restingGap+vfx.display.lift*(1-p)*(1-p);}else if(fx.kind==='reveal'){revealProxy.setEnabled(true);revealLid.rotation.x=-Math.sin(Math.min(1,p*2)*Math.PI/2)*1.12;localLight.scaling.setAll(.75+.25*Math.sin(p*Math.PI));}else{receipt.setEnabled(true);receipt.position.set(2.2,1.16+.08*p,-1.5);for(const m of receipt.getChildMeshes()){m.material=receiptMaterials[fx.kind];m.visibility=Math.sin(p*Math.PI)*.7;}}}
  ambientTime=(ambientTime+nativeElapsed.milliseconds)%120000;dustRoot.setEnabled(nativePolicy.decorativeMotion);if(nativePolicy.decorativeMotion){dust.forEach((m,i)=>{const phase=((ambientTime/vfx.dust.lifetime)+i/vfx.dust.capacity)%1;m.position.set(-4.0+(i%3)*.34+phase*.14,.7+phase*1.6,-.75+(i%4)*.39);for(const mesh of m.getChildMeshes())mesh.visibility=Math.sin(phase*Math.PI)*.8;});}
  for(const [revision,item]of pendingMargins){item.age+=nativeElapsed.milliseconds;if(item.age>40000)pendingMargins.delete(revision);}
  if(activeMargin){activeMargin.age+=nativeElapsed.milliseconds;marginNode.hidden=false;const rect=canvas.getBoundingClientRect(),point=Vector3.Project(new Vector3(nativeActors.staff.root.position.x,1.90,nativeActors.staff.root.position.z),Matrix.Identity(),scene.getTransformMatrix(),camera.viewport.toGlobal(engine.getRenderWidth(),engine.getRenderHeight()));
   const width=Math.min(240,rect.width-24),x=point.x*rect.width/engine.getRenderWidth(),y=point.y*rect.height/engine.getRenderHeight();marginNode.style.width=width+'px';marginNode.style.left=Math.max(width/2+8,Math.min(rect.width-width/2-8,x))+rect.left+'px';marginNode.style.top=Math.max(Math.max(170,(document.querySelector('.top')?.getBoundingClientRect().bottom??120)+marginNode.offsetHeight+8),Math.min(rect.height-110,y-8-(reduced.matches?0:Math.min(14,activeMargin.age/300))))+rect.top+'px';marginNode.hidden=panelOpen||activeMargin.age>4400;if(activeMargin.age>4400)activeMargin=undefined;
  }else marginNode.hidden=true;
  const bubble=life.metrics().bubble;lifeNode.hidden=!trading||reduced.matches||!bubble||panelOpen||!!activeMargin||!!nativePresentation.current;
  if(bubble&&!lifeNode.hidden){const actor=bubble.actor==='staff'?nativeActors.staff:nativeActors.visitors[bubble.actor==='visitor-a'?0:1],rect=canvas.getBoundingClientRect(),point=Vector3.Project(actor.root.position.add(new Vector3(0,1.68,0)),Matrix.Identity(),scene.getTransformMatrix(),camera.viewport.toGlobal(engine.getRenderWidth(),engine.getRenderHeight())),width=Math.min(220,rect.width-32),x=point.x*rect.width/engine.getRenderWidth(),y=point.y*rect.height/engine.getRenderHeight();lifeNode.textContent=shopLifeText(locale,bubble);lifeNode.dataset.speaker=bubble.actor;lifeNode.dataset.kind=bubble.kind;lifeNode.style.width=width+'px';lifeNode.style.left=(rect.left+Math.max(width/2+12,Math.min(rect.width-width/2-12,x)))+'px';lifeNode.style.top=(rect.top+Math.max(150,Math.min(rect.height-145,y-lifeNode.offsetHeight-18)))+'px';}

  scene.render();
 });
 return {
  saleMargin(payload:SaleMarginPayload){if(disposed||document.hidden||payload.revision<=marginWatermark)return;marginWatermark=payload.revision;pendingMargins.set(payload.revision,{payload:{...payload},age:0});while(pendingMargins.size>2)pendingMargins.delete(pendingMargins.keys().next().value!);if(reduced.matches){showMargin(payload);pendingMargins.delete(payload.revision);}},
  baseline(){life.cancel();lifeNode.hidden=true;marginWatermark=-1;pendingMargins.clear();activeMargin=undefined;marginNode.hidden=true;nativeActors.clearProps();delivery.cancel(routes);routes.reset();previousArrival=false;},
  update(s:Snapshot){state=s;parcel.setEnabled(!s.revealed);for(let i=0;i<3;i++){const id=s.shelves[i],item=s.inventory[id],o=catalog.offerings.find(o=>o.id===id),count=Math.min(8,item?.stock??0);const key=`${id}:${count}`;if(shelfContents[i]===key)continue;shelfContents[i]=key;for(const child of [...productRoots[i].getChildren()]){if(child instanceof TransformNode)for(const mesh of child.getChildMeshes())shadow.removeShadowCaster(mesh);child.dispose(false);}if(!o)continue;if(count>0)model(`${layoutData.displays[i].id}.${id}.actual-stock-batch`,stagedProducts(id,o.color,count,i),productRoots[i],i);}resize();},
  view(value:NativeView){if(viewMode===value)return;viewMode=value;lastFitRadius=0;composition='';resize();},
  quality(q:string){if(quality===q)return;quality=q;frames=[];last=undefined;setQuality(q==='low'?'low':'high');},
  zen(value:boolean){zen=value;resize();},layout(value:boolean){panelOpen=value;resize();},
  selected(slot:number){if(selectedSlot!==slot){selectedSlot=slot;selectionTime=0;}highlights.forEach((m,i)=>m.setEnabled(i===slot));},
  minimal(value:boolean){if(minimalFX===value)return;minimalFX=value;if(value){const reveal=clock.active?.kind==='reveal';clock.cancel();if(reveal)onFeedbackEnd();}},
  feedback(event:Feedback){const reveal=clock.active?.kind==='reveal';clock.cancel();if(reveal)onFeedbackEnd();if(disposed||document.hidden)return false;const policy={low:effectiveQuality==='low',minimal:minimalFX,reduced:reduced.matches};clock.start(event.kind,event.slot,policy);return !!clock.active;},
  gesture(kind:'greet'){if(disposed)return false;return gestureClock.start(kind,{low:effectiveQuality==='low',minimal:minimalFX,reduced:reduced.matches},document.hidden);},
  skip(){finishFeedback();},
  skipReveal(){if(clock.active?.kind==='reveal'){clock.cancel();onFeedbackEnd();}},
  metrics(){return {clothDiagnostic:scene.metadata?.clothDiagnostic??null,presentationActor:nativeActors.staff.root.metadata,nativeMotion:nativeActors.metrics(),nativeTiming:{...nativeTiming},staticGIExperiment:scene.metadata?.staticGIExperiment??null,practicalLights:practicalLights.map(l=>({id:l.name,enabled:l.isEnabled(),intensity:l.intensity,position:l.position.asArray()})),shopLife:life.metrics(),nativeService:nativePresentation.metrics(),serviceFrame:nativePresentation.current,customers:currentRoutes?.actors,gesture:gestureClock.active?.kind??null,artDirection:nativeLighting.id,cameraView:viewMode,readyAtMs:readyAt,quality,effectiveQuality,adaptivePolicy:'auto drops transient FX/dust, resolution and crowd after 90 visible samples with p75 >35ms; economy unchanged',minimalFX,reducedMotion:reduced.matches,feedback:clock.active?.kind??null,saleMargin:activeMargin?.payload??null,pendingSaleMargins:pendingMargins.size,materials:scene.materials.length,dustCapacity:vfx.dust.capacity,customerRoots:nativeActors.visitors.map(c=>({position:c.root.position.asArray(),enabled:c.root.isEnabled()})),selectedSlot,visibleSamples,frameSamplesMs:[...frames],fps:frames.length?1000/(frames.reduce((a,b)=>a+b,0)/frames.length):null,meshes:scene.meshes.length,activeMeshes:scene.getActiveMeshes().length,renderer:engine.getGlInfo(),viewport:[canvas.width,canvas.height],cameraViewport:camera.viewport,cameraInertia:[camera.inertialAlphaOffset,camera.inertialBetaOffset,camera.inertialRadiusOffset],cameraPose:{alpha:camera.alpha,beta:camera.beta,radius:camera.radius,target:camera.target.asArray()}};},
  dispose(){finishFeedback();lifeNode.remove();marginNode.remove();disposed=true;routes.dispose();nativeActors.dispose();clock.dispose();observer.disconnect();window.removeEventListener('resize',resize);document.removeEventListener('visibilitychange',visibility);canvas.removeEventListener('webglcontextlost',contextLost);engine.stopRenderLoop();scene.dispose();engine.dispose();}
 };
}
