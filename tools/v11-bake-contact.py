"""Cycles contact-occlusion texture from ACTUAL static game meshes. This texture
is mapped onto the existing playable 3D floor, not a scene-replacement image.
No dynamic actor, inventory, sale, door state or player data is baked.
"""
import bpy,json,os,hashlib,math
from pathlib import Path
root=Path(__file__).resolve().parents[1]
source=Path(os.environ.get('V11_BAKE_SCENE','/workspace/qa/v11-slice/bake/actual-static-scene.json'))
out=Path(os.environ.get('V11_BAKE_OUT',str(root/'assets/masters/native-v11')));out.mkdir(parents=True,exist_ok=True)
data=json.loads(source.read_text());bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
def mesh(name,positions,indices):
 me=bpy.data.meshes.new(name);me.from_pydata([positions[i:i+3] for i in range(0,len(positions),3)],[],[indices[i:i+3] for i in range(0,len(indices),3)]);me.update();ob=bpy.data.objects.new(name,me);bpy.context.collection.objects.link(ob);return ob
for m in data['meshes']:mesh(m['name'],m['positions'],m['indices'])
floor=mesh('Actual floor receive plane Y079',[-4.55,.079,-3.3,-4.55,.079,3.3,4.55,.079,3.3,4.55,.079,-3.3],[0,1,2,0,2,3])
uv=floor.data.uv_layers.new(name='Actual world-XZ floor UV2')
for p in floor.data.polygons:
 for li in p.loop_indices:
  v=floor.data.vertices[floor.data.loops[li].vertex_index].co;uv.data[li].uv=((v.x+4.55)/9.1,(v.z+3.3)/6.6)
mat=bpy.data.materials.new('Original physical contact AO - not an illustration');mat.use_nodes=True;floor.data.materials.append(mat);nodes=mat.node_tree.nodes;nodes.clear();output=nodes.new('ShaderNodeOutputMaterial');emission=nodes.new('ShaderNodeEmission');ao=nodes.new('ShaderNodeAmbientOcclusion');ao.inputs['Distance'].default_value=.65;ao.samples=64;mat.node_tree.links.new(ao.outputs['Color'],emission.inputs['Color']);mat.node_tree.links.new(emission.outputs[0],output.inputs['Surface'])
image=bpy.data.images.new('shop-floor-contact',width=1024,height=1024,alpha=False);image.colorspace_settings.name='Non-Color';tex=nodes.new('ShaderNodeTexImage');tex.image=image;nodes.active=tex
scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.device='CPU';scene.cycles.samples=32;scene.render.threads_mode='FIXED';scene.render.threads=4;scene.render.bake.margin=4;scene.view_settings.view_transform='Raw';scene.view_settings.exposure=0;scene.view_settings.gamma=1
bpy.ops.object.select_all(action='DESELECT');floor.select_set(True);bpy.context.view_layer.objects.active=floor
bpy.ops.object.bake(type='EMIT');image.filepath_raw=str(out/'shop-floor-contact.png');image.file_format='PNG';image.save()
scene['scope']='Static geometry contact occlusion only; dynamic runtime objects excluded';bpy.context.preferences.filepaths.save_version=0;bpy.ops.wm.save_as_mainfile(filepath=str(out/'shop-contact-bake.blend'))
(out/'shop-contact-provenance.json').write_text(json.dumps({'source':'tools/v11-bake-contact.py + tools/v11-export-bake-scene.ts','method':'Blender Cycles CPU Ambient Occlusion node, distance0.65m; actual static geometry, floorUV2 worldXZ; texture not a scene screenshot','inputSha256':hashlib.sha256(source.read_bytes()).hexdigest(),'pngSha256':hashlib.sha256((out/'shop-floor-contact.png').read_bytes()).hexdigest(),'staticMeshes':len(data['meshes']),'dynamicObjectsIncluded':False,'resolution':[1024,1024]},indent=2)+'\n')
print('Actual-geometry contact texture baked:',out/'shop-floor-contact.png')
