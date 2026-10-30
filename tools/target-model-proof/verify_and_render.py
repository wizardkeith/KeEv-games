"""Reopen the authored scene, render real native views, and reimport both GLBs.

No GUI, downloads or modifications to the saved authoring source are involved.
"""
import bpy, json, hashlib, math, sys
from pathlib import Path
from mathutils import Vector

ROOT=Path(__file__).resolve().parents[2]
ASSET=ROOT/'assets/authoring/target-model-proof-v1'
OUT=ROOT/'docs/reviews/evidence/target-model-proof-v1'
manifest=json.loads((ASSET/'manifest.json').read_text())
source=ROOT/manifest['source']
assert hashlib.sha256(source.read_bytes()).hexdigest()==manifest['blendSha256']
bpy.ops.wm.open_mainfile(filepath=str(source))
scene=bpy.context.scene
character=bpy.data.collections['01 Misaki / coloured editable model']
display=bpy.data.collections['02 Display / reusable authored components']
assert not any(o.library for o in bpy.data.objects)
assert all(im.packed_file for im in bpy.data.images if im.source=='FILE' and im.has_data)
scene.render.threads_mode='FIXED';scene.render.threads=8
scene.cycles.samples=64;scene.cycles.adaptive_threshold=.035;scene.cycles.seed=0

def evaluated_stats(objects, offset):
    deps=bpy.context.evaluated_depsgraph_get()
    lo=[1e9]*3;hi=[-1e9]*3;triangles=0;coloured=0
    for obj in objects:
        if obj.type not in ('MESH','CURVE'):continue
        evaluated=obj.evaluated_get(deps);mesh=evaluated.to_mesh()
        mesh.calc_loop_triangles();triangles+=len(mesh.loop_triangles)
        coloured+=bool(mesh.color_attributes)
        for v in mesh.vertices:
            p=obj.matrix_world@v.co-Vector(offset)
            for k in range(3):lo[k]=min(lo[k],p[k]);hi[k]=max(hi[k],p[k])
        evaluated.to_mesh_clear()
    return dict(triangles=triangles,min=lo,max=hi,vertexColouredMeshes=coloured)

report={'sourceSha256':manifest['blendSha256'], 'sourceReopened':True,
        'noLinkedLibraries':True,'fileImagesPacked':True,'native':{},'roundtrip':{},'renders':{}}
for name,col in [('Misaki',character),('Display',display)]:
    stats=evaluated_stats(col.objects,manifest['assemblyPlacements'][name])
    expected=manifest['exports'][name]
    assert stats['triangles']==expected['triangles'],(name,stats,expected)
    assert max(abs(stats[key][k]-expected[key][k]) for key in ('min','max') for k in range(3))<2e-5
    report['native'][name]=stats

# Regression checks for issues found in the actual first portrait. These bounds
# only establish overlap/placement; they are not a collision or topology claim.
face=evaluated_stats([bpy.data.objects['Misaki / rounded cheek and narrowing jaw']],(0,0,0))
neck=evaluated_stats([bpy.data.objects['Visible neck']],(0,0,0))
overlap=neck['max'][2]-face['min'][2]
assert overlap>0,('Visible head/neck gap',overlap)
assert abs(report['native']['Misaki']['min'][2])<.002
report['placementChecks']={'neckHeadZBoundsOverlapMetres':overlap,
    'modelLowestPointMetres':report['native']['Misaki']['min'][2],
    'limits':'Bounds overlap does not certify signed collision, watertightness or visual acceptance.'}

def render(key,camera,width,height):
    scene.camera=camera;scene.render.resolution_x=width;scene.render.resolution_y=height
    scene.render.resolution_percentage=100;scene.render.filepath=str(OUT/(key+'.png'))
    bpy.ops.render.render(write_still=True)
    report['renders'][key]={'camera':camera.name,'dimensions':[width,height],
       'cameraLocation':list(camera.location),'cameraRotationRadians':list(camera.rotation_euler),
       'sha256':hashlib.sha256((OUT/(key+'.png')).read_bytes()).hexdigest(),
       'engine':'Cycles CPU','samples':64,'seed':0,'viewTransform':scene.view_settings.view_transform,
       'exposure':scene.view_settings.exposure}

threequarter=bpy.data.objects[manifest['cameras']['face']].copy();threequarter.data=threequarter.data.copy()
scene.collection.objects.link(threequarter);threequarter.name='Validation / 35 degree three-quarter face'
threequarter.location=(1.43,-3.3,1.64)
threequarter.rotation_euler=(Vector((-.88,-.01,1.325))-threequarter.location).to_track_quat('-Z','Y').to_euler()
if '--detail-only' in sys.argv:
    # Source/export bytes are unchanged; recapture only the corrected yaw.
    previous=json.loads((OUT/'native-roundtrip-verification.json').read_text())
    assert previous['sourceSha256']==report['sourceSha256']
    display.hide_render=True
    render('blender-model-face-v1',threequarter,900,900)
    previous['renders'].update(report['renders'])
    (OUT/'native-roundtrip-verification.json').write_text(json.dumps(previous,indent=2)+'\n',encoding='utf8',newline='\n')
    print('THREE_QUARTER_RECAPTURE_PASS')
    sys.exit(0)

assembly=bpy.data.objects[manifest['cameras']['assembly']]
render('blender-model-assembly-v1',assembly,1200,800)
display.hide_render=True
render('blender-model-character-v1',bpy.data.objects[manifest['cameras']['character']],1024,1280)
render('blender-model-face-v1',threequarter,900,900)
front=bpy.data.objects[manifest['cameras']['face']].copy();front.data=front.data.copy()
scene.collection.objects.link(front);front.name='Validation / front face'
front.location=(-.88,-4.5,1.48)
front.rotation_euler=(Vector((-.88,0,1.36))-front.location).to_track_quat('-Z','Y').to_euler()
render('blender-model-front-v1',front,900,900)
display.hide_render=False;character.hide_render=True;display.hide_render=True
for name in ('Misaki','Display'):
    path=ROOT/manifest['exports'][name]['file']
    assert hashlib.sha256(path.read_bytes()).hexdigest()==manifest['exports'][name]['sha256']
    old=set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=str(path))
    imported=[o for o in bpy.data.objects if o not in old]
    bpy.context.view_layer.update()
    stats=evaluated_stats(imported,(0,0,0));expected=report['native'][name]
    error=max(abs(stats[key][k]-expected[key][k]) for key in ('min','max') for k in range(3))
    assert stats['triangles']==expected['triangles'],(name,stats,expected)
    assert error<2e-5,(name,error)
    if name=='Misaki':assert stats['vertexColouredMeshes']>=2,stats
    stats['maxBoundsErrorMetres']=error;stats['fileSha256']=manifest['exports'][name]['sha256']
    report['roundtrip'][name]=stats
    for o in imported:
        if o.parent not in imported:o.location+=Vector(manifest['assemblyPlacements'][name])
bpy.context.view_layer.update()
render('blender-model-glb-roundtrip-v1',assembly,1200,800)
(OUT/'native-roundtrip-verification.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf8',newline='\n')
assert hashlib.sha256(source.read_bytes()).hexdigest()==report['sourceSha256']
print('NATIVE_REOPEN_AND_GLB_ROUNDTRIP_PASS '+json.dumps(report['roundtrip']))
