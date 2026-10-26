"""Cycles short-range contact from actual static table recipes; no drawn shadow.
Four disconnected real top-board heights -> four independent world-XZ UV2 bands.
Original layout, all geometry, stock count and albedo remain authoritative.
"""
import bpy,json,hashlib
from pathlib import Path
root=Path(__file__).resolve().parents[1];out=root/'assets/masters/native-v11/c29-contact';source=out/'actual-central-static.json';data=json.loads(source.read_text());spec=data['atlas'];bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
def mesh(name,positions,indices):
 m=bpy.data.meshes.new(name);m.from_pydata([positions[i:i+3]for i in range(0,len(positions),3)],[],[indices[i:i+3]for i in range(0,len(indices),3)]);m.update();o=bpy.data.objects.new(name,m);bpy.context.collection.objects.link(o);return o
for m in data['meshes']:mesh(m['name'],m['positions'],m['indices'])
mat=bpy.data.materials.new('Actual static short-distance AO, no lighting illustration');mat.use_nodes=True;nodes=mat.node_tree.nodes;nodes.clear();output=nodes.new('ShaderNodeOutputMaterial');emission=nodes.new('ShaderNodeEmission');ao=nodes.new('ShaderNodeAmbientOcclusion');ao.inputs['Distance'].default_value=spec['distance'];ao.samples=32;mat.node_tree.links.new(ao.outputs['Color'],emission.inputs['Color']);mat.node_tree.links.new(emission.outputs[0],output.inputs['Surface'])
w,h=spec['size'];image=bpy.data.images.new('actual-central-contact-UV2',width=w,height=h,alpha=False);image.colorspace_settings.name='Non-Color';image.generated_color=(1,1,1,1);tex=nodes.new('ShaderNodeTexImage');tex.image=image;nodes.active=tex
scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.device='CPU';scene.cycles.samples=8;scene.cycles.seed=0;scene.render.threads_mode='FIXED';scene.render.threads=4;scene.render.bake.margin=3;scene.render.bake.use_clear=False;scene.view_settings.view_transform='Raw';scene.view_settings.exposure=0;scene.view_settings.gamma=1
planes=[];x=spec['width']/2;z=spec['depth']/2
for band,y in enumerate(spec['heights']):
 o=mesh('Actual top level '+str(band),[-x,y+.0003,-z,x,y+.0003,-z,x,y+.0003,z,-x,y+.0003,z],[0,2,1,0,3,2]);uv=o.data.uv_layers.new(name='Actual localXZ level '+str(band))
 for p in o.data.polygons:
  for li in p.loop_indices:
   v=o.data.vertices[o.data.loops[li].vertex_index].co;uv.data[li].uv=(v.x/spec['width']+.5,(v.z/spec['depth']+.5+band)/4)
 o.data.materials.append(mat);o.hide_render=True;planes.append(o)
for i,o in enumerate(planes):
 bpy.ops.object.select_all(action='DESELECT');o.hide_render=False;o.select_set(True);bpy.context.view_layer.objects.active=o;bpy.ops.object.bake(type='EMIT');o.hide_render=True;print('Baked actual top height',i,flush=True)
image.filepath_raw=str(out/'central-contact-atlas.png');image.file_format='PNG';image.save();(root/'public/assets/native-v11/central-contact-c29.png').write_bytes((out/'central-contact-atlas.png').read_bytes());bpy.context.preferences.filepaths.save_version=0;bpy.ops.wm.save_as_mainfile(filepath=str(out/'actual-central-contact.blend'))
(out/'provenance.json').write_text(json.dumps({'source':'tools/export-v11-table-contact.ts + tools/bake-v11-bright-contact.py','bakeSourceSHA256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),'inputSHA256':hashlib.sha256(source.read_bytes()).hexdigest(),'pngSHA256':hashlib.sha256((out/'central-contact-atlas.png').read_bytes()).hexdigest(),'method':'CyclesCPU AO node distance0.12m/samples32,8bake samples, no direct lighting, four512x512top planes at actual fixed board heights +0.3mm; localXZ secondary UV, linear non-colour PNG','topHeightsMetres':spec['heights'],'woodAndDressingMeshes':len(data['meshes']),'dynamicObjectsIncluded':False,'ownedStockIncluded':False,'scope':spec['scope'],'limits':'Static local ambient visibility approximation, not dynamic sale/stock shadows or GI; actual game comparison required'},indent=2)+'\n')
