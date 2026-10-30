from pathlib import Path
import bpy,json,hashlib
from mathutils import Vector
R=Path(__file__).resolve().parents[2];A=R/'assets/authoring/grok-head-refinement-v1';O=R/'docs/reviews/evidence/grok-head-refinement-v1';source=A/'grok-head-material-fallback.blend';sha=hashlib.sha256(source.read_bytes()).hexdigest()
assert not bpy.app.online_access and not bpy.context.preferences.filepaths.use_scripts_auto_execute
bpy.ops.wm.open_mainfile(filepath=str(source),load_ui=False,use_scripts=False);o=bpy.data.objects['Misaki'];c=bpy.data.objects['Original candidate / same studio control'];m=o.data;old=c.data
assert len(m.vertices)==len(old.vertices)==4484
assert all(tuple(a.co)==tuple(b.co)for a,b in zip(m.vertices,old.vertices))and all(tuple(a.vertices)==tuple(b.vertices)for a,b in zip(m.polygons,old.polygons))
arm=bpy.data.objects['Misaki_Rig'];bones={b.name for b in arm.data.bones};body=[]
def weights(obj,v):return [(obj.vertex_groups[g.group].name,g.weight)for g in v.groups if obj.vertex_groups[g.group].name in bones]
for v,original in zip(m.vertices,old.vertices):
 assert weights(o,v)==weights(c,original)
 if not any(c.vertex_groups[g.group].name=='head'and g.weight>.01 for g in original.groups):body.append(v.index)
body=set(body);body_polys=[p for p in m.polygons if p.vertices[0]in body]
for p in body_polys:
 q=old.polygons[p.index];assert m.materials[p.material_index]==old.materials[q.material_index]
 for li in p.loop_indices:assert tuple(m.uv_layers.active.data[li].uv)==tuple(old.uv_layers.active.data[li].uv)
def evaluated(obj):
 bpy.context.view_layer.update();e=obj.evaluated_get(bpy.context.evaluated_depsgraph_get());d=e.to_mesh();p=[v.co.copy()for v in d.vertices];n=[x.vector.copy()for x in d.corner_normals];e.to_mesh_clear();return p,n
new_pos,new_n=evaluated(o);old_pos,old_n=evaluated(c);position_delta=max((new_pos[i]-old_pos[i]).length for i in body);normal_delta=max((new_n[li]-old_n[li]).length for p in body_polys for li in p.loop_indices);assert position_delta==0 and normal_delta<1e-6
old.calc_loop_triangles();uv=old.uv_layers.active;degenerate=0
for t in old.loop_triangles:
 a,b,d=[uv.data[li].uv for li in t.loops];area=abs((b.x-a.x)*(d.y-a.y)-(b.y-a.y)*(d.x-a.x))/2
 if area<1e-12:degenerate+=1
images=[{'name':im.name,'packed':bool(im.packed_file),'size':list(im.size)}for im in bpy.data.images if im.type!='RENDER_RESULT'];assert len(images)==1 and images[0]['packed']
scene=bpy.context.scene;c.hide_render=True;o.hide_render=False;scene.camera=bpy.data.objects['Shared three-quarter'];scene.render.stamp_note_text='ACTUAL BLENDER / original geometry + head material fallback / neutral / three-quarter / unaccepted';scene.render.filepath=str(O/'fallback-fresh-reopen-three-quarter.png');bpy.ops.render.render(write_still=True)
report={'nativeSha256':sha,'freshProcessReopen':True,'all4484OriginalVertexCoordinatesExact':True,'allPolygonIndicesExact':True,'allDeformBoneWeightsExact':True,'bodyVertexCount':len(body),'bodyMaterialAndUvAssignmentsExact':True,'bodyEvaluatedPositionDelta':position_delta,'bodyEvaluatedNormalDelta':normal_delta,'armatureBones':len(arm.data.bones),'actions':len(bpy.data.actions),'ownIrisImages':images,'originalUvDegenerateTriangles':degenerate,'originalTriangles':len(old.loop_triangles),'originalUvDegenerateFraction':degenerate/len(old.loop_triangles),'onlineAccess':bpy.app.online_access,'autoExecutionDisabled':not bpy.context.preferences.filepaths.use_scripts_auto_execute,'originalBlendSha256':hashlib.sha256((A/'original/Misaki_trial.blend').read_bytes()).hexdigest(),'originalGlbSha256':hashlib.sha256((A/'original/Misaki_trial.glb').read_bytes()).hexdigest(),'artStatus':'Unaccepted conservative material fallback; head geometry attempt rejected, original foundation retained.'}
assert hashlib.sha256(source.read_bytes()).hexdigest()==sha
(O/'fallback-reopen-verification.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf8',newline='\n');print('FALLBACK_REOPEN_AND_ANCHOR_CHECKS_PASS '+json.dumps(report))
