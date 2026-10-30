"""Read current native architecture and bundled runtime; no art variants/settings saved."""
import bpy,json,hashlib
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2];OUT=ROOT/'docs/reviews/evidence/head-method-study-v4'
v3=ROOT/'assets/authoring/target-model-proof-v3/misaki-display-model-proof.blend'
study=ROOT/'assets/authoring/head-method-study-v4/head-method-study.blend'
report={'blenderVersion':bpy.app.version_string,'blenderBuildHash':bpy.app.build_hash.decode(),
 'background':bpy.app.background,'preferenceProfile':'--factory-startup batch profile; not the GUI users enabled-addon configuration',
 'factoryEnabledAddons':sorted(bpy.context.preferences.addons.keys()),'renderEngineSelectionProbe':{},'files':{}}
for engine in ('CYCLES','BLENDER_EEVEE','BLENDER_EEVEE_NEXT','BLENDER_WORKBENCH'):
 try:bpy.context.scene.render.engine=engine;report['renderEngineSelectionProbe'][engine]='Selectable; this is not a render/GPU certification'
 except Exception as e:report['renderEngineSelectionProbe'][engine]=str(e)
report['nodeTypeRegistered']={n:bool(getattr(bpy.types,n,None))for n in ('ShaderNodeShaderToRGB','ShaderNodeBsdfToon','ShaderNodeValToRGB','ShaderNodeVertexColor')}
vendor=Path(bpy.app.binary_path).parent/('{}.{}'.format(*bpy.app.version[:2]))/'scripts/addons_core'
report['bundledCoreAddons']=sorted(p.name for p in vendor.iterdir()if p.is_dir()and p.name!='__pycache__')if vendor.is_dir()else []
for name,path,collection in [('v3',v3,'01 Misaki / coloured editable model'),('failedHeadStudy',study,'02 New mesh-socket and NURBS method')]:
 original=hashlib.sha256(path.read_bytes()).hexdigest();bpy.ops.wm.open_mainfile(filepath=str(path));col=bpy.data.collections[collection]
 mats={m for obj in col.objects if hasattr(obj.data,'materials')for m in obj.data.materials if m}
 nodes={t:sum(n.bl_idname==t for m in mats if m.use_nodes for n in m.node_tree.nodes)for t in ('ShaderNodeBsdfPrincipled','ShaderNodeShaderToRGB','ShaderNodeBsdfToon','ShaderNodeValToRGB','ShaderNodeVertexColor','ShaderNodeTexImage','ShaderNodeNormalMap')}
 report['files'][name]={'path':path.relative_to(ROOT).as_posix(),'sha256':original,'renderEngine':bpy.context.scene.render.engine,
   'viewTransform':bpy.context.scene.view_settings.view_transform,'look':bpy.context.scene.view_settings.look,
   'objectTypes':{t:sum(o.type==t for o in col.objects)for t in ('MESH','CURVE','SURFACE','ARMATURE')},
   'materials':len(mats),'nodeCounts':nodes,'modifierTypes':sorted({m.type for o in col.objects for m in o.modifiers}),
   'savedSourceUnchanged':hashlib.sha256(path.read_bytes()).hexdigest()==original}
report['interpretation']='Both saved scenes use Cycles/Principled PBR. The failed NURBS hair ColorRamp is UV base-colour paint, not lighting quantization/toon shading. Node availability/engine selection is not shader rendering, portability or anime-style acceptance.'
report['guiStatus']='CUA inventory works; Blender app launch approval timed out, no interactive brush/paint/save test was performed. No retry/install/credentials change.'
(OUT/'implementation-readiness.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf8',newline='\n')
print(json.dumps(report))
