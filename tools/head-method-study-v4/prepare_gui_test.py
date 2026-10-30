"""Prepare a disposable native GUI test file; never touch the failed study/v3."""
import bpy,json,hashlib
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[2];A=ROOT/'assets/authoring/head-method-study-v4';O=ROOT/'docs/reviews/evidence/head-method-study-v4'
source=A/'head-method-study.blend';expected=hashlib.sha256(source.read_bytes()).hexdigest()
bpy.ops.wm.open_mainfile(filepath=str(source))
bpy.data.collections['01 Preserved v3 head / projection control'].hide_viewport=True
for obj in bpy.data.collections['02 New mesh-socket and NURBS method'].objects:
 if obj.type=='SURFACE'or obj.name.startswith('Hair / sculpted'):obj.hide_set(True)
face=bpy.data.objects['New head / free mesh facial sculpt and open sockets']
bpy.ops.object.select_all(action='DESELECT');face.hide_set(False);face.select_set(True);bpy.context.view_layer.objects.active=face
if face.mode!='OBJECT':bpy.ops.object.mode_set(mode='OBJECT')
for screen in bpy.data.screens:
 for area in screen.areas:
  if area.type=='VIEW_3D':
   space=area.spaces.active;space.region_3d.view_location=Vector((0,0,-.02));space.region_3d.view_distance=.63;space.region_3d.view_rotation=bpy.context.scene.camera.rotation_euler.to_quaternion();space.region_3d.view_perspective='ORTHO';space.shading.type='SOLID';space.shading.color_type='SINGLE';space.show_region_ui=False
bpy.context.preferences.filepaths.save_version=0
dest=A/'gui-sculpt-capability-test.blend';bpy.ops.wm.save_as_mainfile(filepath=str(dest))
record={'object':face.name,'sourceStudySha256':expected,'testFile':dest.relative_to(ROOT).as_posix(),'testBeforeSha256':hashlib.sha256(dest.read_bytes()).hexdigest(),'vertexCoordinates':[[float(c)for c in v.co]for v in face.data.vertices],'artStatus':'Disposable GUI capability test only; no artistic adoption'}
(O/'gui-test-before.json').write_text(json.dumps(record,indent=2)+'\n',encoding='utf8',newline='\n')
assert hashlib.sha256(source.read_bytes()).hexdigest()==expected
print('DISPOSABLE_GUI_TEST_PREPARED '+str(dest))
