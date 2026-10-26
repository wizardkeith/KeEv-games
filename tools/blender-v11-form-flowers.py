"""Editable C31 low flower master with exact UVs/normals and packed original
object-space value atlas. Supplemental authoring file, never gameplay evidence.
"""
import bpy,json
from pathlib import Path
r=Path(__file__).resolve().parents[1];d=r/'assets/masters/native-v11/display-quality';parts=json.loads((d/'flower-spray-c31.json').read_text());bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False);materials={}
for i,p in enumerate(parts):
 g=p['geometry'];cv=lambda a:(a[0],-a[2],a[1]);v=[cv(g['positions'][k:k+3])for k in range(0,len(g['positions']),3)];f=[g['indices'][k:k+3]for k in range(0,len(g['indices']),3)];m=bpy.data.meshes.new('Exact C31 production surface');m.from_pydata(v,[],f);m.update();o=bpy.data.objects.new(f"{i:03d} — {p['role']} C31",m);bpy.context.collection.objects.link(o)
 for q in m.polygons:q.use_smooth=True
 m.normals_split_custom_set_from_vertices([cv(g['normals'][k:k+3])for k in range(0,len(g['normals']),3)])
 if g.get('uvs'):
  uv=m.uv_layers.new(name='Actual upper/underside form UV')
  for li,l in enumerate(m.loops):uv.data[li].uv=g['uvs'][l.vertex_index*2:l.vertex_index*2+2]
 c=p['color']
 if c not in materials:
  mat=bpy.data.materials.new(c);mat.use_nodes=True;bs=mat.node_tree.nodes.get('Principled BSDF');bs.inputs['Base Color'].default_value=tuple(int(c[j:j+2],16)/255 for j in [1,3,5])+(1,);bs.inputs['Roughness'].default_value=.96
  if p['role']=='paper':
   tex=mat.node_tree.nodes.new('ShaderNodeTexImage');tex.image=bpy.data.images.load(str(r/'assets/masters/native-v11/petal-form-values-c31.png'),check_existing=True);tex.image.pack();mat.node_tree.links.new(tex.outputs['Color'],bs.inputs['Base Color'])
  materials[c]=mat
 m.materials.append(materials[c]);o['source']='tools/build-v11-form-flowers.ts';o['scope']='Same C27 non-stock floral transform; no SKU or billboarding'
bpy.context.preferences.filepaths.save_version=0;bpy.ops.wm.save_as_mainfile(filepath=str(d/'flower-spray-c31.blend'))
