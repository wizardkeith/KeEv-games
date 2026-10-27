"""Experimental real mesh/textured diffuse indirect GI atlas. NOT integrated.
Standard playable geometry remains authoritative. UV splits preserve original
source positions/normals/UV0 and indices per triangle. No dynamic game data.
"""
import bpy,json,math,os,hashlib
from pathlib import Path
from mathutils import Vector
root=Path(__file__).resolve().parents[1];source=Path(os.environ.get('V11_STATIC_BAKE_SOURCE','/workspace/qa/v11-slice/static-lightmap/inputs.json'));out=source.parent;out.mkdir(exist_ok=True);data=json.loads(source.read_text());bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
image=bpy.data.images.new('Actual static indirect diffuse colour',width=2048,height=2048,alpha=False);image.colorspace_settings.name='sRGB';objects=[]
for record in data['meshes']:
 g=record['geometry'];at=record['at'];me=bpy.data.meshes.new(record['name']);me.from_pydata([tuple(g['positions'][i+k]+at[k] for k in range(3)) for i in range(0,len(g['positions']),3)],[],[g['indices'][i:i+3] for i in range(0,len(g['indices']),3)]);me.update();ob=bpy.data.objects.new(record['name'],me);bpy.context.collection.objects.link(ob)
 original=me.uv_layers.new(name='Original UV0');atlas=me.uv_layers.new(name='Indirect atlas UV')
 for poly in me.polygons:
  poly.use_smooth=True
  for li in poly.loop_indices:
   i=me.loops[li].vertex_index;original.data[li].uv=g['uvs'][i*2:i*2+2]
 me.normals_split_custom_set_from_vertices([g['normals'][i:i+3] for i in range(0,len(g['normals']),3)])
 mat=bpy.data.materials.new(record['name']+' material');mat.use_nodes=True;ob.data.materials.append(mat);nodes=mat.node_tree.nodes;bsdf=nodes.get('Principled BSDF');m=record['material'];bsdf.inputs['Base Color'].default_value=(*m['baseColorLinear'],1);bsdf.inputs['Roughness'].default_value=m['roughness'];bsdf.inputs['Metallic'].default_value=m['metallic']
 if m.get('texture'):
  tex=nodes.new('ShaderNodeTexImage');tex.image=bpy.data.images.load(str(root/'public'/m['texture'].lstrip('/')),check_existing=True);uv=nodes.new('ShaderNodeUVMap');uv.uv_map='Original UV0';mapping=nodes.new('ShaderNodeMapping');mapping.inputs['Scale'].default_value=(*m['textureScale'],1);mapping.inputs['Location'].default_value=(*m['textureOffset'],0);mat.node_tree.links.new(uv.outputs[0],mapping.inputs['Vector']);mat.node_tree.links.new(mapping.outputs[0],tex.inputs['Vector']);mul=nodes.new('ShaderNodeMixRGB');mul.blend_type='MULTIPLY';mul.inputs[0].default_value=1;mul.inputs[1].default_value=(*m['baseColorLinear'],1);mat.node_tree.links.new(tex.outputs['Color'],mul.inputs[2]);mat.node_tree.links.new(mul.outputs[0],bsdf.inputs['Base Color'])
 target=nodes.new('ShaderNodeTexImage');target.image=image;nodes.active=target;me.uv_layers.active_index=1;objects.append((ob,record))
for ob,r in objects:ob.select_set(True)
bpy.context.view_layer.objects.active=objects[0][0];bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.uv.smart_project(angle_limit=math.radians(66),island_margin=.002,area_weight=.5);bpy.ops.uv.pack_islands(rotate=True,margin=.002);bpy.ops.object.mode_set(mode='OBJECT')
world=bpy.data.worlds.new('Cool ambient prototype');world.use_nodes=True;world.node_tree.nodes['Background'].inputs['Color'].default_value=(.62,.76,.90,1);world.node_tree.nodes['Background'].inputs['Strength'].default_value=.45;bpy.context.scene.world=world
sun=bpy.data.lights.new('Actual key direction - prototype irradiance calibration','SUN');sun.energy=data['lighting']['key']['intensity'];sun.color=(1,.82,.61);sun.angle=.10;ob=bpy.data.objects.new('Window key',sun);bpy.context.collection.objects.link(ob);ob.rotation_euler=Vector(data['lighting']['key']['direction']).to_track_quat('-Z','Y').to_euler()
scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.device='CPU';scene.cycles.samples=32;scene.render.threads_mode='FIXED';scene.render.threads=4;scene.render.bake.margin=4;scene.render.bake.use_pass_direct=False;scene.render.bake.use_pass_indirect=True;scene.render.bake.use_pass_color=True;scene.view_settings.view_transform='Standard';scene.view_settings.exposure=0;scene.view_settings.gamma=1
bpy.ops.object.bake(type='DIFFUSE');image.filepath_raw=str(out/'static-indirect-prototype.png');image.file_format='PNG';image.save()
result={}
for ob,r in objects:
 me=ob.data;g=r['geometry'];uv=me.uv_layers['Indirect atlas UV'];lookup={};a={'positions':[],'normals':[],'uvs':[],'uvs2':[],'indices':[]}
 for poly in me.polygons:
  for li in poly.loop_indices:
   vi=me.loops[li].vertex_index;u,v=uv.data[li].uv;key=(vi,round(u,8),round(v,8))
   if key not in lookup:
    lookup[key]=len(a['positions'])//3;a['positions']+=g['positions'][vi*3:vi*3+3];a['normals']+=g['normals'][vi*3:vi*3+3];a['uvs']+=g['uvs'][vi*2:vi*2+2];a['uvs2'] += [float(u),float(v)]
   a['indices'].append(lookup[key])
 result[r['name']]=a
(out/'static-indirect-geometry.json').write_text(json.dumps(result,separators=(',',':'))+'\n');bpy.context.preferences.filepaths.save_version=0;bpy.ops.wm.save_as_mainfile(filepath=str(out/'static-indirect-prototype.blend'))
(out/'provenance.json').write_text(json.dumps({'status':'experimental not integrated, not gameplay image','sourceSha256':hashlib.sha256(source.read_bytes()).hexdigest(),'method':'Cycles CPU32sample DIFFUSE, indirect + colour, direct disabled; actual static mesh geometry and original material albedo textures; no dynamic inventory/actors/door/save data','meshes':len(objects),'resolution':[2048,2048],'limitations':'Roughness/metallic/base texture supported; Web room IBL, normal maps/translucency and wind not identical; native atlas integration and actual-game validation pending'},indent=2)+'\n')
print('Experimental atlas complete:',out)
