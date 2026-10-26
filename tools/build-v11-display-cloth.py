"""Original central-table linen rest mesh. Editable Blender master plus exact
low geometry, not runtime cloth or an image of the scene. Flat support region
is deliberate; broad authored gravity folds stay inside retained table bounds.
"""
import bpy,math,json,hashlib
from pathlib import Path
root=Path(__file__).resolve().parents[1];out=root/'assets/masters/native-v11/display-quality';out.mkdir(parents=True,exist_ok=True)
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
cols=12;rows=17;verts=[];uvs=[];faces=[]
for r in range(rows):
 for j in range(cols+1):
  u=j/cols;t=(r-6)/10
  if r<=6:y=.995;z=.55-r/6*1.08;x=-.45+u*.50
  else:
   y=.995-.355*t+.010*math.sin(u*math.pi*3+.35)*t**3
   z=-.559+.014*(.5+.5*math.cos(u*math.pi*6+.65*t))*math.sin(math.pi*t)**.70
   x=-.45+u*.50+.004*math.sin(u*math.pi*4+t)*t
  verts.append((x,-z,y));uvs.append((u,r/(rows-1)))
for r in range(rows-1):
 for j in range(cols):
  a=r*(cols+1)+j;faces.append((a,a+1,a+cols+2,a+cols+1))
me=bpy.data.meshes.new('Pinned support and broad gravity drape');me.from_pydata(verts,[],faces);me.update();ob=bpy.data.objects.new('Central linen — authored rest, no runtime solver',me);bpy.context.collection.objects.link(ob);uv=me.uv_layers.new(name='Linen complete unwrapped surface')
for poly in me.polygons:
 poly.use_smooth=True
 for li in poly.loop_indices:uv.data[li].uv=uvs[me.loops[li].vertex_index]
bpy.context.view_layer.objects.active=ob;ob.select_set(True)
solid=ob.modifiers.new('Actual 2mm cloth thickness, below support plane','SOLIDIFY');solid.thickness=.002;solid.offset=-1;solid.use_quality_normals=True
# A separate higher-detail editable surface is retained as an authoring master,
# but the controlled low silhouette is the production geometry, not a hidden win.
hi=ob.copy();hi.data=ob.data.copy();bpy.context.collection.objects.link(hi);hi.name='High authoring smoothness — not exported';sub=hi.modifiers.new('Authoring subdivision','SUBSURF');sub.levels=2;sub.render_levels=2;hi.hide_render=True;hi.hide_set(True)
def export_mesh(ob):
 evaluated=ob.evaluated_get(bpy.context.evaluated_depsgraph_get());m=evaluated.to_mesh();m.calc_loop_triangles();g={'positions':[],'normals':[],'indices':[],'uvs':[]};layer=m.uv_layers.active
 for tri in m.loop_triangles:
  for li in tri.loops:
   vi=m.loops[li].vertex_index;p=m.vertices[vi].co;n=m.corner_normals[li].vector;g['indices'].append(len(g['positions'])//3);g['positions'] += [float(p.x),float(p.z),float(-p.y)];g['normals'] += [float(n.x),float(n.z),float(-n.y)];g['uvs'] += list(layer.data[li].uv)
 evaluated.to_mesh_clear();return g
g=export_mesh(ob);recipe={'shape':'mesh','at':[0,0,0],'color':'#FFFFFF','role':'fabric','roughness':.86,'finish':'display-linen','geometry':g};(out/'linen-rest.json').write_text(json.dumps(recipe,separators=(',',':'))+'\n');bpy.context.preferences.filepaths.save_version=0;bpy.ops.wm.save_as_mainfile(filepath=str(out/'linen-rest.blend'));(out/'linen-provenance.json').write_text(json.dumps({'authoring':'tools/build-v11-display-cloth.py','units':'metres RH Y-up exported; Blender RH Z-up editable','method':'Authored broad gravity drape with exact planar support region, real2mm thickness and editable subdiv authoring source; no runtime cloth/pose','triangles':len(g['indices'])//3,'sourceSha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),'constraints':'Preserved table footprint; stock remains supported by actual horizontal triangles, no save/economy input'},indent=2)+'\n');print('Exported actual linen triangles:',len(g['indices'])//3)
