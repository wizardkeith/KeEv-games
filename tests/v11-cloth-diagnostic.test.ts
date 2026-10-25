import test from 'node:test';import assert from 'node:assert/strict';
import {NullEngine} from '@babylonjs/core/Engines/nullEngine';import {Scene} from '@babylonjs/core/scene';import {Mesh} from '@babylonjs/core/Meshes/mesh';import {VertexData} from '@babylonjs/core/Meshes/mesh.vertexData';import {VertexBuffer} from '@babylonjs/core/Buffers/buffer';import {TransformNode} from '@babylonjs/core/Meshes/transformNode';import {PBRMaterial} from '@babylonjs/core/Materials/PBR/pbrMaterial';import {HemisphericLight} from '@babylonjs/core/Lights/hemisphericLight';import {Vector3} from '@babylonjs/core/Maths/math.vector';
import {nativeCharacterParts,nativeGrouped} from '../src/art/native-characters';import {installClothDiagnostic} from '../src/art/cloth-diagnostic-v11';
test('renderer isolation keeps actual garment vertices/normals/UVs/indices, parent transforms and noncloth lights unchanged',()=>{
 const engine=new NullEngine(),scene=new Scene(engine);scene.useRightHandedSystem=true;try{
  for(let i=0;i<4;i++)new HemisphericLight('existing'+i,Vector3.Up(),scene);
  const root=new TransformNode('actual natural browse transform',scene);root.position.set(-.65,.065,1.1);root.rotation.y=Math.PI/2;
  const meshes=nativeGrouped(nativeCharacterParts('visitor-b').find(p=>p.id==='body')!.recipe).map((g,i)=>{const m=new Mesh('actor.visitor-b.native.v3.body.material'+i,scene),v=new VertexData();v.positions=g.geometry.positions;v.normals=g.geometry.normals;v.indices=g.geometry.indices;v.uvs=g.geometry.uvs;v.applyToMesh(m);m.material=new PBRMaterial(m.name,scene);m.parent=root;m.metadata={materialRole:g.role};return m;});
  const fixture=new Mesh('fixture.fabric',scene);fixture.material=new PBRMaterial('original fixture',scene);fixture.metadata={materialRole:'fabric'};
  const read=(m:Mesh)=>({p:Array.from(m.getVerticesData(VertexBuffer.PositionKind)!),n:Array.from(m.getVerticesData(VertexBuffer.NormalKind)!),uv:Array.from(m.getVerticesData(VertexBuffer.UVKind)!),i:Array.from(m.getIndices()!),matrix:m.computeWorldMatrix(true).asArray().slice(),parent:m.parent});
  const before=meshes.map(read),original=meshes.map(m=>m.material);installClothDiagnostic(scene,'control');assert.deepEqual(meshes.map(m=>m.material),original);
  installClothDiagnostic(scene,'neutral');assert.deepEqual(meshes.map(read),before);
  for(const[i,m]of meshes.entries())if(m.metadata.materialRole==='fabric'){assert.equal(m.material!.getClassName(),'StandardMaterial');assert.equal(m.lightSources.length,1);assert.equal(m.lightSources[0].name,'DIAGNOSTIC ONLY single diffuse direction');}else{assert.equal(m.material,original[i]);assert.equal(m.lightSources.length,4);}
  assert.equal(fixture.material.name,'original fixture');assert.equal(fixture.lightSources.length,4);assert.equal(scene.metadata.clothDiagnostic.geometryUnchanged,true);
 }finally{scene.dispose();engine.dispose();}
});
