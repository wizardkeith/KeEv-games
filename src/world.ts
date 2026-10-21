import {Engine} from '@babylonjs/core/Engines/engine';
import {Scene} from '@babylonjs/core/scene';
import {Color3, Color4} from '@babylonjs/core/Maths/math.color';
import {Vector3} from '@babylonjs/core/Maths/math.vector';
import {ArcRotateCamera} from '@babylonjs/core/Cameras/arcRotateCamera';
import {HemisphericLight} from '@babylonjs/core/Lights/hemisphericLight';
import {DirectionalLight} from '@babylonjs/core/Lights/directionalLight';
import {MeshBuilder} from '@babylonjs/core/Meshes/meshBuilder';
import {StandardMaterial} from '@babylonjs/core/Materials/standardMaterial';
import {SceneLoader} from '@babylonjs/core/Loading/sceneLoader';
import {TransformNode} from '@babylonjs/core/Meshes/transformNode';
import {AbstractMesh} from '@babylonjs/core/Meshes/abstractMesh';
import '@babylonjs/loaders/glTF/glTFFileLoader';
import '@babylonjs/loaders/glTF/2.0/glTFLoader';
import {catalog, type Snapshot} from './core/contracts';
import layout from './content/layout.json';

export async function createWorld(canvas:HTMLCanvasElement,onSlot:(n:number)=>void){
 const engine=new Engine(canvas,true,{preserveDrawingBuffer:false,stencil:true});const scene=new Scene(engine);scene.useRightHandedSystem=true;scene.clearColor=new Color4(.87,.87,.91,1);
 const camera=new ArcRotateCamera('curated',-Math.PI/4,Math.PI*50/180,17,new Vector3(0,0.8,0),scene);camera.attachControl(canvas,true);camera.lowerBetaLimit=45*Math.PI/180;camera.upperBetaLimit=55*Math.PI/180;camera.lowerAlphaLimit=-Math.PI/4-.30;camera.upperAlphaLimit=-Math.PI/4+.30;camera.lowerRadiusLimit=12;camera.upperRadiusLimit=22;camera.panningSensibility=0;camera.wheelDeltaPercentage=.015;
 new HemisphericLight('soft sky',new Vector3(0,1,0),scene).intensity=.85;const sun=new DirectionalLight('warm light',new Vector3(-.4,-1,.3),scene);sun.diffuse=new Color3(1,.91,.8);sun.intensity=.8;
 const materials=new Map<string,StandardMaterial>();function mat(hex:string){if(materials.has(hex))return materials.get(hex)!;const m=new StandardMaterial(hex,scene);m.diffuseColor=Color3.FromHexString(hex);m.specularColor=new Color3(.06,.06,.06);materials.set(hex,m);return m;}
 function box(name:string,w:number,h:number,d:number,x:number,y:number,z:number,color:string){const m=MeshBuilder.CreateBox(name,{width:w,height:h,depth:d},scene);m.position.set(x,y,z);m.material=mat(color);return m;}
 box('diorama plinth',10,.45,8,0,-.3,0,'#c1bbc9');box('floor',9,.12,6.6,0,0,0,'#c7ab8d');
 // Modular two-wall shell, deliberately open toward the curated camera.
 box('back wall',9,3.5,.16,0,1.75,3.3,'#e4dbce');box('left wall',.16,3.5,6.6,-4.5,1.75,0,'#e8dfd3');
 for(let x=-4;x<4.4;x+=.65)box('floor plank',.022,.013,6.4,x,.067,0,'#b99b7f');
 box('back shelf',6,.14,.6,.4,1.5,2.9,'#8d6f58');box('back shelf',6,.14,.6,.4,2.25,2.9,'#8d6f58');
 for(let i=0;i<12;i++)box('placeholder back stock',.25,.35,.25,-2.3+i*.48,1.75,2.85,['#aea1bc','#d5b78b','#96b0a2'][i%3]);
 box('door frame',1.6,2.7,.2,2.9,1.35,3.14,'#a08a75');box('door glass',1.3,2.4,.21,2.9,1.35,3.12,'#a9c0c2');
 box('window frame',.2,1.65,2.3,-4.35,2,0,'#a08a75');box('window glass',.21,1.35,2,-4.31,2,0,'#b2c7cd');
 box('mat',2,.025,1.1,2.6,.08,2,'#a393aa');box('tutorial sample parcel',.55,.3,.4,-3,.25,1.9,'#b8a5cd');
 const counter=await SceneLoader.ImportMeshAsync(null,'/assets/','counter.glb',scene);counter.meshes[0].position.copyFromFloats(layout.counter.position[0],layout.counter.position[1],layout.counter.position[2]);counter.meshes[0].scaling.copyFromFloats(layout.counter.scale[0],layout.counter.scale[1],layout.counter.scale[2]);
 const displays=layout.displays.map(d=>[d.position[0],d.position[2]]);const products:AbstractMesh[][]=[];
 for(let i=0;i<3;i++){const [x,z]=displays[i];const base=box(`display-${i}`,1.5,.8,.85,x,.48,z,'#ae8c70');base.metadata={slot:i};box(`displaytop-${i}`,1.58,.09,.93,x,.92,z,'#d9c6ae').metadata={slot:i};products[i]=[];for(let k=0;k<6;k++){const p=box(`product-${i}-${k}`,.23,.28,.23,x+(k%3-1)*.4,1.1,z+(Math.floor(k/3)-.5)*.35,'#bda6ce');p.metadata={slot:i};p.setEnabled(false);products[i].push(p);}}
 function person(name:string,color:string,x:number,z:number){const root=new TransformNode(name,scene);const body=MeshBuilder.CreateCapsule(name+'.body',{height:1.0,radius:.19,tessellation:8},scene);body.parent=root;body.position.y=.75;body.material=mat(color);const head=MeshBuilder.CreateSphere(name+'.head',{diameter:.38,segments:8},scene);head.parent=root;head.position.y=1.4;head.material=mat('#e3c4aa');root.position.set(x,.1,z);return root;}
 person('placeholder staff','#9286a5',2.6,-2.3);const customers=[person('generic-1','#94b1a7',1.1,1),person('generic-2','#bca3a6',.3,-2)];
 let state:Snapshot|undefined,quality='auto',zen=false;let frames:number[]=[],last=performance.now();
 
 scene.onPointerPick=(_,pick)=>{const n=pick.pickedMesh?.metadata?.slot;if(typeof n==='number')onSlot(n);};
 const resize=()=>{engine.resize();const narrow=window.innerWidth<720;camera.target.x=zen?0:(narrow?0:.9);camera.target.y=narrow?.1:.9;};window.addEventListener('resize',resize);
 canvas.addEventListener('webglcontextlost',()=>canvas.dispatchEvent(new CustomEvent('world-error')));
 const observer=new ResizeObserver(resize);observer.observe(canvas);
 engine.runRenderLoop(()=>{if(document.hidden)return;const now=performance.now();frames.push(now-last);last=now;if(frames.length>120)frames.shift();for(let i=0;i<customers.length;i++){customers[i].setEnabled(!!state?.open&&(quality!=='low'||i===0));if(state?.open&&!matchMedia('(prefers-reduced-motion: reduce)').matches){const phase=now/7000+i*2;customers[i].position.x=.5+Math.sin(phase)*.7;customers[i].position.z=Math.cos(phase)*1.5;customers[i].rotation.y=phase;}}scene.render();});
 return {update(s:Snapshot){state=s;for(let i=0;i<3;i++){const id=s.shelves[i],item=s.inventory[id],o=catalog.offerings.find(o=>o.id===id);products[i].forEach((p,k)=>{p.setEnabled(!!item&&k<item.stock);if(o)p.material=mat(o.color);});}},quality(q:string){quality=q;engine.setHardwareScalingLevel(q==='low'?Math.max(1,devicePixelRatio):Math.max(1,devicePixelRatio/1.5));},zen(value:boolean){zen=value;resize();},metrics(){return {fps:engine.getFps(),frameSamplesMs:frames,meshes:scene.meshes.length,renderer:engine.getGlInfo(),viewport:[canvas.width,canvas.height]};},dispose(){observer.disconnect();engine.dispose();}};
}
