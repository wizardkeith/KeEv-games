"""Original C37 distant foliage volume, cloud Blender only; form gate, no maps.
Five unequal intersecting primary masses + restrained edge lobes, voxel-welded
and decimated under the previous720-triangle crown budget. Native editable source.
"""
import bpy,json,math,hashlib
from pathlib import Path
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
parts=[]
forms=[((-.38,.05,.04),(.58,.35,.45)),((.27,.40,-.10),(.55,.36,.43)),((-.15,.86,.15),(.56,.32,.45)),((.40,.77,.20),(.40,.28,.35)),((-.53,.60,-.18),(.36,.27,.30)),((-.70,.16,.24),(.22,.20,.25)),((.64,.38,-.26),(.24,.21,.23)),((-.30,1.07,.34),(.23,.18,.22)),((.35,.97,.29),(.20,.18,.22))]
for at,scale in forms:
 bpy.ops.mesh.primitive_uv_sphere_add(segments=16,ring_count=10,location=at);o=bpy.context.object;o.scale=scale;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);parts.append(o)
bpy.ops.object.select_all(action='DESELECT')
for o in parts:o.select_set(True)
bpy.context.view_layer.objects.active=parts[0];bpy.ops.object.join();o=bpy.context.object;o.name='C37_distant_canopy_original_form'
# Keep saved/portable coordinates RH +Y-up. Blender is a mesh authoring tool;
# no camera or Z-up to game-axis conversion is implicit here.
bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
m=o.modifiers.new('weld_primary_masses','REMESH');m.mode='VOXEL';m.voxel_size=.065; m.use_smooth_shade=True;bpy.ops.object.modifier_apply(modifier=m.name)
m=o.modifiers.new('primary_soft_contours','SMOOTH');m.factor=.72;m.iterations=3;bpy.ops.object.modifier_apply(modifier=m.name)
for p in o.data.polygons:p.use_smooth=True
o.data.calc_loop_triangles();before=len(o.data.loop_triangles)
m=o.modifiers.new('same_original_crown_budget','DECIMATE');m.ratio=min(1,510/before);bpy.ops.object.modifier_apply(modifier=m.name)
o.data.calc_loop_triangles();assert len(o.data.loop_triangles)<=520,len(o.data.loop_triangles)
root=Path('assets/masters/native-v11/backwall-c37');root.mkdir(parents=True,exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=str(root.resolve()/'distant-canopy.blend'))
g={'positions':[v for p in o.data.vertices for v in p.co],'normals':[v for p in o.data.vertices for v in p.normal],'indices':[i for t in o.data.loop_triangles for i in t.vertices]}
(root/'distant-canopy.json').write_text(json.dumps(g,separators=(',',':'))+'\n')
print(json.dumps({'triangles':len(g['indices'])//3,'vertices':len(o.data.vertices),'source':'original coherent voxel-sculpted branch-supported crown; no external image/mesh','axis':'explicit game RH +Y-up numerical coordinates'}))
