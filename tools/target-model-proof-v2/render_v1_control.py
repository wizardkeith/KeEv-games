"""Render preserved v1 with v2 lights/camera; never save into either source."""
import bpy,json,hashlib
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'docs/reviews/evidence/target-model-proof-v2'
source=ROOT/'assets/authoring/target-model-proof-v1/misaki-display-model-proof.blend'
original=hashlib.sha256(source.read_bytes()).hexdigest()

def display_fingerprint():
    col=bpy.data.collections['02 Display / reusable authored components']
    root=bpy.data.objects['Display / model origin at floor'].location
    deps=bpy.context.evaluated_depsgraph_get();items=[]
    for obj in col.objects:
        if obj.type not in ('MESH','CURVE'):continue
        e=obj.evaluated_get(deps);m=e.to_mesh();m.calc_loop_triangles()
        materials=[]
        for mat in m.materials:
            data=[]
            for node in mat.node_tree.nodes if mat and mat.use_nodes else []:
                inputs=[]
                for inp in node.inputs:
                    if hasattr(inp,'default_value'):
                        value=inp.default_value
                        if not isinstance(value,(str,int,float,bool)):
                            try:value=list(value)
                            except TypeError:continue
                        inputs.append((inp.name,value))
                image=getattr(node,'image',None)
                imagehash=hashlib.sha256(image.packed_file.data).hexdigest() if image and image.packed_file else None
                data.append((node.bl_idname,inputs,imagehash))
            materials.append(sorted(data,key=lambda x:json.dumps(x)))
        payload={'vertices':[[round(c,6) for c in obj.matrix_world@v.co-Vector(root)]for v in m.vertices],
            'triangles':[(list(t.vertices),t.material_index)for t in m.loop_triangles],
            'smooth':[p.use_smooth for p in m.polygons],
            'uv':[[[round(x,6)for x in uv.uv]for uv in layer.data]for layer in m.uv_layers],
            'materials':materials}
        items.append(hashlib.sha256(json.dumps(payload,sort_keys=True).encode()).hexdigest())
        e.to_mesh_clear()
    return hashlib.sha256(json.dumps(sorted(items)).encode()).hexdigest(),len(items)

bpy.ops.wm.open_mainfile(filepath=str(source));bpy.context.view_layer.update()
old_display,count=display_fingerprint()
bpy.ops.wm.open_mainfile(filepath=str(ROOT/'assets/authoring/target-model-proof-v2/misaki-display-model-proof.blend'));bpy.context.view_layer.update()
new_display,newcount=display_fingerprint()
assert (old_display,count)==(new_display,newcount),('Display changed',old_display,new_display,count,newcount)
bpy.ops.wm.open_mainfile(filepath=str(source))
scene=bpy.context.scene
bpy.data.collections['02 Display / reusable authored components'].hide_render=True
settings=[('Warm large window key',650,2.5),('Gentle neutral fill',100,3.5),('Warm rim and table lift',260,3)]
for name,energy,size in settings:
    bpy.data.lights[name].energy=energy;bpy.data.lights[name].size=size
scene.view_settings.exposure=.10
scene.render.threads_mode='FIXED';scene.render.threads=8
scene.cycles.samples=64;scene.cycles.adaptive_threshold=.035;scene.cycles.seed=0
scene.render.resolution_x=1024;scene.render.resolution_y=1280;scene.render.resolution_percentage=100
scene.camera=bpy.data.objects['Blender model portrait / complete Misaki']
scene.render.stamp_note_text='BLENDER V1 CONTROL / preserved model under v2 lights / unaccepted'
scene.render.filepath=str(OUT/'blender-v1-control-under-v2-light.png')
bpy.ops.render.render(write_still=True)
assert hashlib.sha256(source.read_bytes()).hexdigest()==original
(OUT/'v1-lighting-control.json').write_text(json.dumps({'source':'assets/authoring/target-model-proof-v1/misaki-display-model-proof.blend','sourceSha256':original,'sourceUnchanged':True,'displayPreserved':True,'displayGeometryUvMaterialImageFingerprint':new_display,'displayObjectCount':newcount,'camera':'Same full-character orthographic pose/projection as v2','lights':settings,'exposure':.10,'samples':64,'seed':0,'outputSha256':hashlib.sha256((OUT/'blender-v1-control-under-v2-light.png').read_bytes()).hexdigest()},indent=2)+'\n',encoding='utf8',newline='\n')
print('PRESERVED_V1_LIGHTING_CONTROL_RENDER_PASS')
