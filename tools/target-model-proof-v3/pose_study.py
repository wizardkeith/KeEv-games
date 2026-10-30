"""V2 geometry/materials under a three-quarter body stance; no source overwrite."""
import bpy,json,hashlib
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'docs/reviews/evidence/target-model-proof-v3';OUT.mkdir(parents=True,exist_ok=True)
source=ROOT/'assets/authoring/target-model-proof-v2/misaki-display-model-proof.blend'
original=hashlib.sha256(source.read_bytes()).hexdigest()
bpy.ops.wm.open_mainfile(filepath=str(source))
body=bpy.data.objects['Misaki / model origin at feet'];head=bpy.data.objects['Head pose / inferred small tilt']
body.rotation_euler.z=-.26;head.rotation_euler.z=.21;head.rotation_euler.y=-.17
scene=bpy.context.scene
bpy.data.collections['02 Display / reusable authored components'].hide_render=True
scene.camera=bpy.data.objects['Blender model portrait / complete Misaki']
scene.render.resolution_x=1024;scene.render.resolution_y=1280;scene.render.resolution_percentage=100
scene.render.threads_mode='FIXED';scene.render.threads=8
scene.cycles.samples=64;scene.cycles.seed=0;scene.cycles.adaptive_threshold=.035
scene.render.stamp_note_text='BLENDER POSE STUDY / unchanged v2 geometry-materials / three-quarter body'
scene.render.filepath=str(OUT/'v2-pose-only-three-quarter.png');bpy.ops.render.render(write_still=True)
receipt={'source':'assets/authoring/target-model-proof-v2/misaki-display-model-proof.blend','sourceSha256':original,
 'geometryAndMaterialsUnchanged':True,'bodyRotationRadians':list(body.rotation_euler),'headRotationRadians':list(head.rotation_euler),
 'headScale':list(head.scale),'headLocation':list(head.location),'camera':scene.camera.name,
 'cameraLocation':list(scene.camera.location),'cameraRotationRadians':list(scene.camera.rotation_euler),
 'inferred':'Reference camera/pose are unknown; body yaw about 30deg relative to camera and counter-turned tilted head are inferred.',
 'renderSha256':hashlib.sha256((OUT/'v2-pose-only-three-quarter.png').read_bytes()).hexdigest()}
assert hashlib.sha256(source.read_bytes()).hexdigest()==original
(OUT/'pose-study.json').write_text(json.dumps(receipt,indent=2)+'\n',encoding='utf8',newline='\n')
print('POSE_ONLY_RENDER_PASS')
