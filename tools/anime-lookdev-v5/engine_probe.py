"""Actual EEVEE Shader-to-RGB compatibility render; no model/art acceptance."""
import bpy,math,json,hashlib
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[2];OUT=ROOT/'docs/reviews/evidence/anime-lookdev-v5';A=ROOT/'assets/authoring/anime-lookdev-v5'
OUT.mkdir(parents=True,exist_ok=True);A.mkdir(parents=True,exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
scene=bpy.context.scene;scene.render.engine='BLENDER_EEVEE'
def rgb(h):
 c=[int(h[i:i+2],16)/255 for i in(1,3,5)];return tuple(v/12.92 if v<=.04045 else((v+.055)/1.055)**2.4 for v in c)
toon=bpy.data.materials.new('Actual EEVEE diffuse to RGB / softly transitioned three bands');toon.use_nodes=True
n=toon.node_tree.nodes;n.clear();links=toon.node_tree.links
diff=n.new('ShaderNodeBsdfDiffuse');diff.inputs['Color'].default_value=(1,1,1,1)
convert=n.new('ShaderNodeShaderToRGB');ramp=n.new('ShaderNodeValToRGB');ramp.color_ramp.interpolation='EASE'
stops=[(0,'#AD6E72'),(.30,'#AD6E72'),(.38,'#EAB095'),(.64,'#EAB095'),(.73,'#F7D5B6'),(1,'#F7D5B6')]
for i,(position,h)in enumerate(stops):
 el=ramp.color_ramp.elements[i]if i<2 else ramp.color_ramp.elements.new(position);el.position=position;el.color=(*rgb(h),1)
emission=n.new('ShaderNodeEmission');output=n.new('ShaderNodeOutputMaterial')
links.new(diff.outputs[0],convert.inputs[0]);links.new(convert.outputs['Color'],ramp.inputs['Fac']);links.new(ramp.outputs['Color'],emission.inputs['Color']);links.new(emission.outputs[0],output.inputs['Surface'])
pbr=bpy.data.materials.new('PBR control / same geometry');pbr.use_nodes=True;p=pbr.node_tree.nodes['Principled BSDF'];p.inputs['Base Color'].default_value=(*rgb('#EAB095'),1);p.inputs['Roughness'].default_value=.65;p.inputs['Specular IOR Level'].default_value=.23
for x,m in[(-.60,pbr),(.60,toon)]:
 bpy.ops.mesh.primitive_uv_sphere_add(segments=64,ring_count=32,radius=.48,location=(x,0,0));o=bpy.context.object;o.name='Left PBR control'if x<0 else'Right actual EEVEE toon';o.data.materials.append(m)
 for poly in o.data.polygons:poly.use_smooth=True
world=bpy.data.worlds.new('Probe neutral world');world.use_nodes=True;world.node_tree.nodes['Background'].inputs[0].default_value=(.25,.25,.25,1);world.node_tree.nodes['Background'].inputs[1].default_value=.25;scene.world=world
d=bpy.data.lights.new('Probe key','AREA');d.energy=110;d.size=2;o=bpy.data.objects.new('Probe key',d);scene.collection.objects.link(o);o.location=(-2,-3,3);o.rotation_euler=(Vector((0,0,0))-o.location).to_track_quat('-Z','Y').to_euler()
d=bpy.data.cameras.new('Probe camera');d.type='ORTHO';d.ortho_scale=2.30;o=bpy.data.objects.new('Probe camera',d);scene.collection.objects.link(o);o.location=(0,-4,.30);o.rotation_euler=(-o.location).to_track_quat('-Z','Y').to_euler();scene.camera=o
scene.render.resolution_x=768;scene.render.resolution_y=384;scene.render.resolution_percentage=100;scene.render.image_settings.file_format='PNG'
scene.view_settings.view_transform='Standard';scene.view_settings.look='None';scene.view_settings.exposure=0;scene.view_settings.gamma=1
scene.render.use_stamp=True;scene.render.use_stamp_note=True;scene.render.use_stamp_labels=False;scene.render.stamp_font_size=14
for prop in ['use_stamp_date','use_stamp_time','use_stamp_render_time','use_stamp_frame','use_stamp_frame_range','use_stamp_scene','use_stamp_camera','use_stamp_lens','use_stamp_filename','use_stamp_marker','use_stamp_memory','use_stamp_hostname']:
 if hasattr(scene.render,prop):setattr(scene.render,prop,False)
scene.render.stamp_note_text='COMPATIBILITY PROBE / left PBR, right Shader-to-RGB / not anime art acceptance'
bpy.context.preferences.filepaths.save_version=0
source=A/'eevee-shader-compatibility-probe.blend';bpy.ops.wm.save_as_mainfile(filepath=str(source))
scene.render.filepath=str(OUT/'eevee-toon-compatibility.png');bpy.ops.render.render(write_still=True)
report={'blenderVersion':bpy.app.version_string,'engine':scene.render.engine,'actualImageWritten':True,'nodePath':['Diffuse BSDF','Shader to RGB','ColorRamp with 3 softly transitioned colour bands','Emission','Material Output'],'sourceSha256':hashlib.sha256(source.read_bytes()).hexdigest(),'imageSha256':hashlib.sha256((OUT/'eevee-toon-compatibility.png').read_bytes()).hexdigest(),'limits':['Renderer/node compatibility only, not target likeness','Blender lookdev graph, not arbitrary GLB shader portability','Background API only; no GUI app approval retry or sculpt input']}
(OUT/'eevee-engine-probe.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf8',newline='\n')
print('ACTUAL_EEVEE_SHADER_TO_RGB_RENDER_PASS '+json.dumps(report))
