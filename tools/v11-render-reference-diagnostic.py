"""Same actual game mesh/camera snapshot, Cycles DIAGNOSTIC ONLY.
No model replacement, gameplay, shader-equivalence or target acceptance claim.
Original UV0/albedo/roughness/normal inputs are retained; lighting uses a bounded
physical window-area+bounce comparison instead of pretending Web IBL is Cycles.
"""
import bpy, json, math, os, hashlib
from pathlib import Path
from mathutils import Vector
import bmesh
root=Path(__file__).resolve().parents[1]
source=Path(os.environ['V11_REFERENCE_SOURCE']);out=source.parent
data=json.loads(source.read_text());probe_only=os.environ.get('V11_REFERENCE_PROBE')=='1';bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
def convert(p):return (p[0],-p[2],p[1])
materials={}
def material(m):
 key=m['name']
 if key in materials:return materials[key]
 mat=bpy.data.materials.new(key);mat.use_nodes=True;n=mat.node_tree.nodes;l=mat.node_tree.links;bs=n.get('Principled BSDF');bs.inputs['Base Color'].default_value=(*m['baseColorLinear'],1);bs.inputs['Roughness'].default_value=m['roughness'];bs.inputs['Metallic'].default_value=m['metallic'];bs.inputs['Coat Weight'].default_value=m['clearcoat'];bs.inputs['Coat Roughness'].default_value=.24
 def texture(record,noncolor=False):
  if not record:return None
  url=record.get('url','');path=root/'public'/url.split('/assets/',1)[-1] if '/assets/' in url else None
  if path:path=root/'public/assets'/url.split('/assets/',1)[-1]
  if not path or not path.is_file():return None
  tex=n.new('ShaderNodeTexImage');tex.image=bpy.data.images.load(str(path),check_existing=True)
  if noncolor:tex.image.colorspace_settings.name='Non-Color'
  uv=n.new('ShaderNodeTexCoord');mapping=n.new('ShaderNodeMapping');mapping.inputs['Scale'].default_value=(*record['scale'],1);mapping.inputs['Location'].default_value=(*record['offset'],0);l.new(uv.outputs['UV'],mapping.inputs['Vector']);l.new(mapping.outputs[0],tex.inputs['Vector']);return tex
 tex=texture(m.get('albedo'))
 if tex:
  mul=n.new('ShaderNodeMixRGB');mul.blend_type='MULTIPLY';mul.inputs[0].default_value=1;mul.inputs[1].default_value=(*m['baseColorLinear'],1);l.new(tex.outputs['Color'],mul.inputs[2]);l.new(mul.outputs[0],bs.inputs['Base Color'])
 orm=texture(m.get('orm'),True)
 if orm:
  sep=n.new('ShaderNodeSeparateColor');l.new(orm.outputs['Color'],sep.inputs[0]);mul=n.new('ShaderNodeMath');mul.operation='MULTIPLY';mul.inputs[1].default_value=m['roughness'];l.new(sep.outputs['Green'],mul.inputs[0]);l.new(mul.outputs[0],bs.inputs['Roughness'])
 normal=texture(m.get('normal'),True)
 if normal:
  nm=n.new('ShaderNodeNormalMap');nm.inputs['Strength'].default_value=m['normal']['level'];l.new(normal.outputs['Color'],nm.inputs['Color']);l.new(nm.outputs[0],bs.inputs['Normal'])
 if m['unlit']:
  emission=n.new('ShaderNodeEmission');emission.inputs['Color'].default_value=(*m['baseColorLinear'],1);l.new(emission.outputs[0],n.get('Material Output').inputs['Surface'])
 if m['alpha']<1:
  # Window glass in the source has alpha-only readability, no refraction.
  trans=n.new('ShaderNodeBsdfTransparent');mix=n.new('ShaderNodeMixShader');mix.inputs[0].default_value=m['alpha'];l.new(trans.outputs[0],mix.inputs[1]);l.new(bs.outputs[0],mix.inputs[2]);l.new(mix.outputs[0],n.get('Material Output').inputs['Surface'])
 materials[key]=mat;return mat
for record in data['meshes']:
 if probe_only and (record['name'].startswith(('actor.','native.door.','fx.','discovery.')) or 'actual-stock-batch' in record['name']):continue
 positions=record['positions'];me=bpy.data.meshes.new(record['name']);me.from_pydata([convert(positions[i:i+3]) for i in range(0,len(positions),3)],[],[record['indices'][i:i+3] for i in range(0,len(record['indices']),3)]);me.update();ob=bpy.data.objects.new(record['name'],me);bpy.context.collection.objects.link(ob);ob.data.materials.append(material(record['material']))
 uv=me.uv_layers.new(name='Actual original UV0')
 if len(record['uvs'])==len(positions)//3*2:
  for poly in me.polygons:
   poly.use_smooth=True
   for li in poly.loop_indices:vi=me.loops[li].vertex_index;uv.data[li].uv=record['uvs'][vi*2:vi*2+2]
 me.normals_split_custom_set_from_vertices([convert(record['normals'][i:i+3]) for i in range(0,len(record['normals']),3)])
 if record['material']['clip'] and not probe_only:
  bm=bmesh.new();bm.from_mesh(me)
  for a,b,c,d in record['material']['clip']:
   normal=Vector(convert([a,b,c]));bmesh.ops.bisect_plane(bm,geom=list(bm.verts)+list(bm.edges)+list(bm.faces),dist=1e-6,plane_co=-d*normal,plane_no=normal,clear_outer=True,clear_inner=False)
  bm.to_mesh(me);bm.free();me.update()
# Match the actual camera's view basis, including the retained viewport.
c=data['camera'];mat=c['view'];mat=[mat[str(i)] for i in range(16)] if isinstance(mat,dict) else mat;right=Vector((mat[0],mat[4],mat[8]));up=Vector((mat[1],mat[5],mat[9]));back=Vector((mat[2],mat[6],mat[10]));position=Vector(convert(c['position']));forward=Vector(convert([-v for v in back]));cam_data=bpy.data.cameras.new('Same actual game camera');cam=bpy.data.objects.new('Same actual game camera',cam_data);bpy.context.collection.objects.link(cam);cam.location=position;cam.rotation_euler=forward.to_track_quat('-Z','Y').to_euler();cam_data.type='PERSP';cam_data.sensor_fit='VERTICAL';cam_data.sensor_height=24;cam_data.lens=12/math.tan(c['fov']/2)
v=c['viewport'];scene=bpy.context.scene;scene.camera=cam;scene.render.resolution_x=round(c['width']*v['width']);scene.render.resolution_y=round(c['height']*v['height']);scene.render.resolution_percentage=100
world=bpy.data.worlds.new('Diagnostic cool window sky');world.use_nodes=True;world.node_tree.nodes['Background'].inputs['Color'].default_value=(.55,.69,.80,1);world.node_tree.nodes['Background'].inputs['Strength'].default_value=.25;scene.world=world
sun_data=bpy.data.lights.new('C23 actual directional sun, independently calibrated','SUN');sun_data.energy=3.70;sun_data.color=(1,.87,.68);sun_data.angle=.10;sun=bpy.data.objects.new('Actual direction key',sun_data);bpy.context.collection.objects.link(sun);sun.rotation_euler=Vector(convert([.80,-.62,.18])).to_track_quat('-Z','Y').to_euler()
area_data=bpy.data.lights.new('Diagnostic broad window aperture','AREA');area_data.energy=100;area_data.shape='RECTANGLE';area_data.size=3.8;area_data.size_y=1.7;area=bpy.data.objects.new('Broad physical window',area_data);bpy.context.collection.objects.link(area);area.location=convert([-4.65,1.84,0]);area.rotation_euler=Vector(convert([1,-.05,0])).to_track_quat('-Z','Y').to_euler()
scene.render.engine='CYCLES';scene.cycles.device='CPU';scene.cycles.samples=int(os.environ.get('V11_REFERENCE_SAMPLES','24'));scene.cycles.use_denoising=False;scene.render.threads_mode='FIXED';scene.render.threads=4;scene.view_settings.view_transform='AgX';scene.view_settings.look='AgX - Medium High Contrast';scene.render.image_settings.file_format='PNG';scene.render.film_transparent=True;scene.world.color=(.8,.75,.65);bpy.context.preferences.filepaths.save_version=0
if probe_only:
 cam.location=convert([.10,1.48,-.10]);cam.rotation_euler=Vector(convert([0,0,-1])).to_track_quat('-Z','Y').to_euler();cam_data.type='PANO';cam_data.panorama_type='EQUIRECTANGULAR';scene.render.resolution_x=256;scene.render.resolution_y=128;scene.render.film_transparent=False;scene.render.image_settings.file_format='OPEN_EXR';scene.render.image_settings.color_depth='32';scene.render.filepath=str(out/'LOCAL-DIFFUSE-radiance.exr');bpy.ops.render.render(write_still=True)
 image=bpy.data.images.load(scene.render.filepath,check_existing=False);pixels=list(image.pixels);samples=[];rotation=cam.rotation_euler.to_matrix();w,h=image.size
 for yy in range(0,h,2):
  for xx in range(0,w,2):
   u=(xx+.5)/w;v=(yy+.5)/h;latitude=(v-.5)*math.pi;phi=(u-.5)*2*math.pi;local=Vector((math.sin(phi)*math.cos(latitude),math.sin(latitude),-math.cos(phi)*math.cos(latitude)));d=rotation@local;colour=pixels[(yy*w+xx)*4:(yy*w+xx)*4+3];samples.append({'direction':[float(d.x),float(d.z),float(-d.y)],'color':colour,'weight':math.cos(latitude)})
 total=sum(s['weight']for s in samples)
 for sample in samples:sample['weight']*=4*math.pi/total
 (out/'LOCAL-DIFFUSE-samples.json').write_text(json.dumps({'sourceSHA256':hashlib.sha256(source.read_bytes()).hexdigest(),'method':'Cycles64sample equirectangular scene-linear radiance, original static geometry/materials with portal clips removed, excludes actors/owned stock/door/FX; original physical window-area/sky diagnostic illumination','position':[.10,1.48,-.10],'sampleCount':len(samples),'maxRadiance':max(max(s['color'])for s in samples),'samples':samples,'limits':'Spatial diffuse approximation, independent radiometric calibration; not direct-shadow replacement, engine-equivalence or target-art acceptance'},separators=(',',':'))+'\n')
 bpy.ops.wm.save_as_mainfile(filepath=str(out/'LOCAL-DIFFUSE-source.blend'));print('Sampled actual static central radiance:',len(samples))
else:
 bpy.ops.wm.save_as_mainfile(filepath=str(out/'DIAGNOSTIC-same-game-scene.blend'));scene.render.filepath=str(out/'DIAGNOSTIC-cycles-bounce.png');bpy.ops.render.render(write_still=True)
 (out/'DIAGNOSTIC-provenance.json').write_text(json.dumps({'sourceSHA256':hashlib.sha256(source.read_bytes()).hexdigest(),'meshes':len(data['meshes']),'camera':c,'type':'Offline Cycles same actual mesh/camera diagnostic, NOT GAMEPLAY','limits':'Independent window-area/world radiance, AgX, normal maps and clip reconstruction; not photometrically identical to Web IBL/ACES/transmission and not evidence of an engine limitation. No particles/UI; output is actual camera viewport only.'},indent=2)+'\n')
