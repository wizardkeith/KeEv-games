"""Read-only software review plus a task-owned in-memory geometry probe."""
import bpy,bmesh,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'docs/reviews/evidence/head-method-study-v4';OUT.mkdir(parents=True,exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.mesh.primitive_uv_sphere_add(segments=16,ring_count=8)
o=bpy.context.object;bm=bmesh.new();bm.from_mesh(o.data);bm.verts.ensure_lookup_table();bm.verts[0].co.x+=.01;bm.to_mesh(o.data);bm.free()
result={'blenderVersion':bpy.app.version_string,'background':bpy.app.background,'guiArea':str(bpy.context.area),'bmeshVertexEditExecuted':True}
try:
 result['sculptModeTogglePoll']=bpy.ops.sculpt.sculptmode_toggle.poll()
 bpy.ops.sculpt.sculptmode_toggle()
 result['sculptModeEntered']=o.mode
 result['interactiveBrushStrokePoll']=bpy.ops.sculpt.brush_stroke.poll()
 bpy.ops.object.mode_set(mode='OBJECT')
except Exception as e:result['sculptOperatorResult']=str(e)
bpy.ops.surface.primitive_nurbs_surface_surface_add()
s=bpy.context.object;sp=s.data.splines[0]
result['nativeNurbsInitial']={'type':s.type,'u':sp.point_count_u,'v':sp.point_count_v,'points':len(sp.points)}
bpy.ops.object.mode_set(mode='EDIT');bpy.ops.curve.select_all(action='SELECT');bpy.ops.curve.subdivide(number_cuts=1);bpy.ops.object.mode_set(mode='OBJECT')
sp=s.data.splines[0]
result['nativeNurbsAfterSubdivision']={'u':sp.point_count_u,'v':sp.point_count_v,'points':len(sp.points)}
sp.points[0].co.z+=.05;s.modifiers.new('Thin actual surface','SOLIDIFY').thickness=.0015
bpy.context.view_layer.update();evaluated=s.evaluated_get(bpy.context.evaluated_depsgraph_get());m=evaluated.to_mesh();m.calc_loop_triangles()
result['nurbsControlEditEvaluatedTriangles']=len(m.loop_triangles);evaluated.to_mesh_clear()
result['modelingSkillsFound']=[];result['dedicatedBlenderMcpFound']=False
result['scope']='In-memory task probe only, no GUI input, no user file/project modified or external upload'
(OUT/'existing-tools-probe.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf8',newline='\n')
print(json.dumps(result))
