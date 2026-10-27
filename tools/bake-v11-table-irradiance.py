"""C30 DIAGNOSTIC: albedo-free vertex diffuse transport on unchanged actual meshes.
Cycles output is direct and indirect separately, not a rendered replacement image.
Owned stock/actors never shadow or contribute bounce to the fixed scene bake.
"""
import bpy,json,os,hashlib,math
from pathlib import Path
from mathutils import Vector
root=Path(__file__).resolve().parents[1];source=Path(os.environ['V11_IRRADIANCE_SOURCE']);out=Path(os.environ['V11_IRRADIANCE_OUT']);out.mkdir(parents=True,exist_ok=True);data=json.loads(source.read_text())
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
def cv(p):return(p[0],-p[2],p[1])
def scope(p):
 x,y,z=p;return float(-1.08<x<1.28 and .78<y<2.7 and -.86<z<.87)
materials={};receivers=[]
for r in data['meshes']:
 name=r['name'];stock='actual-stock-batch' in name
 if name.startswith(('actor.','native.door.','fx.','discovery.')) or r['material']['alpha']<1:continue
 if stock and not name.startswith('display.2.'):continue
 p=r['positions'];norm=r['normals'];me=bpy.data.meshes.new(name);me.from_pydata([cv(p[i:i+3])for i in range(0,len(p),3)],[],[r['indices'][i:i+3]for i in range(0,len(r['indices']),3)]);me.update();ob=bpy.data.objects.new(name,me);bpy.context.collection.objects.link(ob)
 for poly in me.polygons:poly.use_smooth=True
 me.normals_split_custom_set_from_vertices([cv(norm[i:i+3])for i in range(0,len(norm),3)])
 m=r['material'];key=m['name']
 if key not in materials:
  mat=bpy.data.materials.new(key);mat.use_nodes=True;bs=mat.node_tree.nodes.get('Principled BSDF');bs.inputs['Base Color'].default_value=(*m['baseColorLinear'],1);bs.inputs['Roughness'].default_value=m['roughness'];materials[key]=mat
  a=m.get('albedo');path=root/'public/assets'/a['url'].split('/assets/',1)[1]if a and '/assets/' in a['url'] else None
  if path and path.is_file():
   nodes=mat.node_tree.nodes;links=mat.node_tree.links;tex=nodes.new('ShaderNodeTexImage');tex.image=bpy.data.images.load(str(path),check_existing=True);uv=nodes.new('ShaderNodeTexCoord');mapping=nodes.new('ShaderNodeMapping');mapping.inputs['Scale'].default_value=(*a['scale'],1);mapping.inputs['Location'].default_value=(*a['offset'],0);links.new(uv.outputs['UV'],mapping.inputs['Vector']);links.new(mapping.outputs[0],tex.inputs['Vector']);mul=nodes.new('ShaderNodeMixRGB');mul.blend_type='MULTIPLY';mul.inputs[0].default_value=1;mul.inputs[1].default_value=(*m['baseColorLinear'],1);links.new(tex.outputs['Color'],mul.inputs[2]);links.new(mul.outputs[0],bs.inputs['Base Color'])
 ob.data.materials.append(materials[key]);uv=me.uv_layers.new(name='Original UV0')
 if len(r['uvs'])==len(p)//3*2:
  for li,loop in enumerate(me.loops):uv.data[li].uv=r['uvs'][loop.vertex_index*2:loop.vertex_index*2+2]
 if stock:ob.visible_shadow=False;ob.visible_diffuse=False
 weight=[scope(p[i:i+3])for i in range(0,len(p),3)]
 if (name.startswith('display.2.')or name.startswith('room.styling.v9.'))and any(weight):
  a=me.color_attributes.new(name='C30 diffuse irradiance',type='FLOAT_COLOR',domain='POINT');me.color_attributes.active_color=a;receivers.append((ob,r,weight))
world=bpy.data.worlds.new('Cool broad sky');world.use_nodes=True;world.node_tree.nodes['Background'].inputs['Color'].default_value=(.55,.69,.80,1);world.node_tree.nodes['Background'].inputs['Strength'].default_value=.25;bpy.context.scene.world=world
sun=bpy.data.lights.new('Same direction soft key','SUN');sun.energy=2.8;sun.color=(1,.87,.68);sun.angle=.18;so=bpy.data.objects.new(sun.name,sun);bpy.context.collection.objects.link(so);so.rotation_euler=Vector(cv([.8,-.62,.18])).to_track_quat('-Z','Y').to_euler()
a=bpy.data.lights.new('Broad physical window diffuse','AREA');a.energy=180;a.shape='RECTANGLE';a.size=3.8;a.size_y=2;ao=bpy.data.objects.new(a.name,a);bpy.context.collection.objects.link(ao);ao.location=cv([-4.45,2.1,-.2]);ao.rotation_euler=Vector(cv([1,-.16,.04])).to_track_quat('-Z','Y').to_euler()
s=bpy.context.scene;s.render.engine='CYCLES';s.cycles.device='CPU';s.cycles.samples=int(os.environ.get('V11_IRRADIANCE_SAMPLES','32'));s.cycles.use_denoising=False;s.render.threads_mode='FIXED';s.render.threads=4;s.render.bake.target='VERTEX_COLORS';s.cycles.max_bounces=6
records=[]
def fingerprint(arr):
 h=2166136261
 for v in arr:
  # JS Math.round, including negative ties, not Python bankers rounding.
  q=math.floor(v*100000+.5)
  h=((h^(q&0xffffffff))*16777619)&0xffffffff
 return format(h,'08x')
for ob,r,w in receivers:
 bpy.ops.object.select_all(action='DESELECT');ob.select_set(True);bpy.context.view_layer.objects.active=ob;values={}
 for field in ['DIRECT','INDIRECT']:
  bpy.ops.object.bake(type='DIFFUSE',pass_filter={field},target='VERTEX_COLORS');values[field.lower()]=[round(max(0,float(v)),6)for c in ob.data.color_attributes.active_color.data for v in c.color[:3]]
 records.append({'name':r['name'],'vertices':len(w),'positions':fingerprint(r['positions']),'normals':fingerprint(r['normals']),'weight':w,**values});print('BAKED',r['name'],len(w),flush=True)
result={'version':'table-irradiance.c30.diagnostic.v1','sourceSHA256':hashlib.sha256(source.read_bytes()).hexdigest(),'samples':s.cycles.samples,'method':'Cycles CPU per-original-vertex albedo-free direct/indirect diffuse transport; original meshes/normals/UV0, no geometry or specular replacement','limits':'Prototype, independent lighting calibration, fixed static transport; stock and actor shadows require dynamic runtime masking before acceptance; no target acceptance','records':records}
(out/'table-irradiance-c30.json').write_text(json.dumps(result,separators=(',',':'))+'\n');bpy.context.preferences.filepaths.save_version=0;bpy.ops.wm.save_as_mainfile(filepath=str(out/'table-irradiance-c30.blend'));print('DONE',len(records),flush=True)
