"""Fresh-process native reopen, editable-method and unchanged-source checks."""
import bpy,json,hashlib,math
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2];A=ROOT/'assets/authoring/anime-lookdev-v5';O=ROOT/'docs/reviews/evidence/anime-lookdev-v5'
source=A/'researched-head-lookdev.blend';bpy.ops.wm.open_mainfile(filepath=str(source))
scene=bpy.context.scene;assert scene.render.engine=='BLENDER_EEVEE'
study=bpy.data.collections['02 Researched head lookdev'];curves=[o for o in study.objects if o.type=='CURVE'and o.data.bevel_mode=='OBJECT']
assert len(curves)==10
assert all(o.data.bevel_object and o.data.taper_object and o.data.taper_radius_mode=='MULTIPLY'for o in curves)
assert all(len(o.data.splines[0].bezier_points)>4 for o in curves)
face=next(o for o in study.objects if 'rounded cheek and narrowing jaw'in o.name)
assert face.type=='MESH'and face.data.uv_layers.active
mod=next(m for m in face.modifiers if m.type=='NORMAL_EDIT');assert mod.target and mod.vertex_group
deps=bpy.context.evaluated_depsgraph_get()
def normals():
 deps.update();e=face.evaluated_get(deps);m=e.to_mesh();result=[n.vector.copy()for n in m.corner_normals];e.to_mesh_clear();return result
controlled=normals();mod.show_viewport=False;plain=normals();mod.show_viewport=True;deps.update()
changes=[(a-b).length for a,b in zip(controlled,plain)];assert max(changes)>.01
paint=[]
for name in ('face-own-blush-uv.png','iris-own-detail-uv.png','hair-own-broad-flow-uv.png'):
 im=bpy.data.images[name];assert im.packed_file and im.size[0]>0;paint.append({'name':name,'size':list(im.size),'packed':True,'sha256':hashlib.sha256((A/'textures'/name).read_bytes()).hexdigest()})
toon_materials=[m for m in bpy.data.materials if m.use_nodes and any(n.bl_idname=='ShaderNodeShaderToRGB'for n in m.node_tree.nodes)]
assert len(toon_materials)>=8
v3hash=hashlib.sha256((ROOT/'assets/authoring/target-model-proof-v3/misaki-display-model-proof.blend').read_bytes()).hexdigest();assert v3hash=='d58bb179624083b30de52e0852bae7025281fd8bc5347a9ed9e95abb4a2583fa'
bpy.data.collections['01 V3 head control'].hide_render=True;study.hide_render=False
scene.camera=bpy.data.objects['Matched inferred reference projection'];scene.render.stamp_note_text='ACTUAL EEVEE / researched-study / neutral / unaccepted head study; no Unity claim'
scene.render.filepath=str(O/'fresh-reopen-neutral-matched.png');bpy.ops.render.render(write_still=True)
report={'nativeSha256':hashlib.sha256(source.read_bytes()).hexdigest(),'blender':bpy.app.version_string,'engine':scene.render.engine,'flatBezierLocks':len(curves),'customProfileWidthDepthRatio':.026/.0032,'taperMode':'MULTIPLY','packedOwnUvMaps':paint,'normalEdit':{'mode':mod.mode,'mix':mod.mix_factor,'changedCornerNormals':sum(x>1e-5 for x in changes),'totalCornerNormals':len(changes),'maxVectorDelta':max(changes)},'lightingToonMaterialCount':len(toon_materials),'v3UnchangedSha256':v3hash,'reopenedAndRendered':True,'portableStatus':'No GLB export. Native EEVEE graph does not automatically transfer to Unity/GLB. Mesh/curve controls, UVs, albedo maps and normals are separately authored data.','visualAcceptance':False,'guiInputTest':'Not run; original app approval timed out, no retry/bypass.'}
(O/'fresh-reopen-verification.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf8',newline='\n')
print('NATIVE_REOPEN_METHOD_CHECKS_PASS '+json.dumps(report))
