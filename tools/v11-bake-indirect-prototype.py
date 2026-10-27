"""Experimental actual-geometry indirect irradiance bake, not integrated.
Geometry/base factors are actual authoring inputs; textured reflectance and a
shared full-shop UV atlas are not implemented in this prototype. No dynamic
inventory, actors, sales or player data. Never present this PNG as gameplay.
"""
import bpy,json,os,hashlib,math
from pathlib import Path
root=Path(__file__).resolve().parents[1]
source=Path(os.environ.get('V11_BAKE_SCENE','/workspace/qa/v11-slice/light-bake/actual-static-scene.json'))
out=Path(os.environ.get('V11_BAKE_OUT','/workspace/qa/v11-slice/light-bake/output'));out.mkdir(parents=True,exist_ok=True)
data=json.loads(source.read_text());bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
def mesh(name,positions,indices):
 me=bpy.data.meshes.new(name);me.from_pydata([positions[i:i+3] for i in range(0,len(positions),3)],[],[indices[i:i+3] for i in range(0,len(indices),3)]);me.update();ob=bpy.data.objects.new(name,me);bpy.context.collection.objects.link(ob);return ob
for m in data['meshes']:
 ob=mesh(m['name'],m['positions'],m['indices']);mat=bpy.data.materials.new(m['name']+' actual base');mat.diffuse_color=(*m['material']['baseColorLinear'],1);mat.use_nodes=True;bsdf=mat.node_tree.nodes.get('Principled BSDF');bsdf.inputs['Base Color'].default_value=mat.diffuse_color;bsdf.inputs['Roughness'].default_value=m['material']['roughness'];ob.data.materials.append(mat)
from mathutils import Vector
sun=bpy.data.lights.new('Actual runtime window key','SUN');sun.energy=data['lighting']['key']['intensity'];sun.color=(1,.82,.61);sun.angle=.10;ob=bpy.data.objects.new('Actual key',sun);bpy.context.collection.objects.link(ob);ob.rotation_euler=Vector(data['lighting']['key']['direction']).to_track_quat('-Z','Y').to_euler()
world=bpy.data.worlds.new('Original cool sky radiance');world.use_nodes=True;world.node_tree.nodes['Background'].inputs['Color'].default_value=(.62,.76,.90,1);world.node_tree.nodes['Background'].inputs['Strength'].default_value=.20;bpy.context.scene.world=world
floor=mesh('Actual floor receive plane Y079',[-4.55,.079,-3.3,-4.55,.079,3.3,4.55,.079,3.3,4.55,.079,-3.3],[0,1,2,0,2,3])
uv=floor.data.uv_layers.new(name='Actual world-XZ floor UV2')
for p in floor.data.polygons:
 for li in p.loop_indices:
  v=floor.data.vertices[floor.data.loops[li].vertex_index].co;uv.data[li].uv=((v.x+4.55)/9.1,(v.z+3.3)/6.6)
mat=bpy.data.materials.new('Actual diffuse indirect irradiance');mat.use_nodes=True;floor.data.materials.append(mat);nodes=mat.node_tree.nodes;bsdf=nodes.get('Principled BSDF');bsdf.inputs['Base Color'].default_value=(.5,.5,.5,1)
image=bpy.data.images.new('shop-floor-indirect',width=1024,height=1024,alpha=False);image.colorspace_settings.name='Non-Color';tex=nodes.new('ShaderNodeTexImage');tex.image=image;nodes.active=tex
scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.device='CPU';scene.cycles.samples=64;scene.render.threads_mode='FIXED';scene.render.threads=4;scene.render.bake.margin=4;scene.view_settings.view_transform='Raw';scene.view_settings.exposure=0;scene.view_settings.gamma=1
bpy.ops.object.select_all(action='DESELECT');floor.select_set(True);bpy.context.view_layer.objects.active=floor
scene.render.bake.use_pass_direct=False;scene.render.bake.use_pass_indirect=True;scene.render.bake.use_pass_color=False
bpy.ops.object.bake(type='DIFFUSE');image.filepath_raw=str(out/'shop-floor-indirect.png');image.file_format='PNG';image.save()
scene['scope']='Experimental static indirect diffuse irradiance only; actual geometry/base factors, no texture reflectance yet; not integrated';bpy.context.preferences.filepaths.save_version=0;bpy.ops.wm.save_as_mainfile(filepath=str(out/'shop-indirect-bake.blend'))
(out/'shop-indirect-provenance.json').write_text(json.dumps({'source':'tools/v11-bake-indirect-prototype.py + tools/v11-export-light-bake.ts','method':'Experimental Cycles CPU DIFFUSE bake, indirect only; direct and colour passes disabled;64samples. Actual static geometry and linear material base factors, no source textures yet. Not integrated, not a gameplay image.','inputSha256':hashlib.sha256(source.read_bytes()).hexdigest(),'pngSha256':hashlib.sha256((out/'shop-floor-indirect.png').read_bytes()).hexdigest(),'staticMeshes':len(data['meshes']),'dynamicObjectsIncluded':False,'resolution':[1024,1024]},indent=2)+'\n')
print('Experimental indirect irradiance (NOT gameplay/integrated):',out/'shop-floor-indirect.png')
