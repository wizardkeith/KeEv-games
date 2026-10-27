"""Editable original C25 spray master from exact production low mesh JSON.
No beauty render or target substitution; individual branches/florets retained.
"""
import bpy,json
from pathlib import Path
r=Path(__file__).resolve().parents[1];d=r/'assets/masters/native-v11/display-quality';parts=json.loads((d/'flower-spray.json').read_text());bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False);materials={}
for i,p in enumerate(parts):
 g=p['geometry'];v=[(g['positions'][k],-g['positions'][k+2],g['positions'][k+1]) for k in range(0,len(g['positions']),3)];f=[g['indices'][k:k+3] for k in range(0,len(g['indices']),3)];m=bpy.data.meshes.new('Actual low surface');m.from_pydata(v,[],f);m.update();o=bpy.data.objects.new(f"{i:03d} — {p['role']} original spray",m);bpy.context.collection.objects.link(o)
 for q in m.polygons:q.use_smooth=True
 c=p['color']
 if c not in materials:
  mat=bpy.data.materials.new(c);mat.diffuse_color=tuple(int(c[j:j+2],16)/255 for j in [1,3,5])+(1,);materials[c]=mat
 m.materials.append(materials[c]);o['original_source']='tools/build-v11-display-flowers.ts';o['units']='metres;RH Z-up Blend /Y-up production'
bpy.context.preferences.filepaths.save_version=0;bpy.ops.wm.save_as_mainfile(filepath=str(d/'flower-spray.blend'))
