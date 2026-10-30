import bpy,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
bpy.ops.wm.open_mainfile(filepath=str(ROOT/'assets/authoring/anime-lookdev-v5/researched-head-lookdev.blend'))
out=[]
for c in bpy.data.collections:
 if c.name.startswith(('01 V3','02 Researched','03 Shared')):
  for o in c.objects:
   out.append({'collection':c.name,'name':o.name,'group':o.get('proof_group'),'type':o.type,'modifiers':[m.type for m in o.modifiers],'bounds':[list(o.matrix_world@__import__('mathutils').Vector(v))for v in o.bound_box]if o.type!='EMPTY'else[]})
(ROOT/'docs/reviews/evidence/anime-lookdev-v5/construction-inspection.json').write_text(json.dumps(out,indent=2)+'\n',encoding='utf8',newline='\n')
print('INSPECTION_WRITTEN')
imports=[]
for label,op in [('OBJ',bpy.ops.wm.obj_import),('FBX',bpy.ops.import_scene.fbx),('GLB/glTF',bpy.ops.import_scene.gltf)]:
 try:imports.append({'format':label,'registeredOperator':op.get_rna_type().identifier,'externalAiModelImported':False})
 except Exception as exc:imports.append({'format':label,'registeredOperator':None,'error':str(exc),'externalAiModelImported':False})
(ROOT/'docs/reviews/evidence/anime-lookdev-v5/import-readiness.json').write_text(json.dumps({'blender':bpy.app.version_string,'operators':imports,'scope':'Read-only operator registration. No external provider/model upload/download, purchase, installation, rigging or topology-quality claim.'},indent=2)+'\n',encoding='utf8',newline='\n')
