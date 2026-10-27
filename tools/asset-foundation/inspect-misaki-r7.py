"""Reopen native R7 and its actual GLB independently; no source writes."""
import bpy,json,hashlib
from pathlib import Path
from collections import Counter
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'docs/reviews/evidence/misaki-grayform-v1-r7'
bpy.ops.wm.open_mainfile(filepath=str(ROOT/'assets/authoring/misaki-grayform-v1/misaki-grayform.blend'))
deps=bpy.context.evaluated_depsgraph_get();rows={};bounds={}
for o in bpy.data.objects:
 if o.type!='MESH':continue
 e=o.evaluated_get(deps);d=e.to_mesh();d.calc_loop_triangles();world=[o.matrix_world@v.co for v in d.vertices]
 bounds[o.name]={'min':[min(v[i]for v in world)for i in range(3)],'max':[max(v[i]for v in world)for i in range(3)],'triangles':len(d.loop_triangles)}
 if o.name.startswith(('10 /','11 /')):
  uses=Counter(tuple(sorted(edge))for p in d.polygons for edge in p.edge_keys)
  assert all(v==2 for v in uses.values()),o.name+' closed evaluated shell'
  assert all(p.area>1e-12 for p in d.polygons),'degenerate face'
  assert len(o.modifiers)==1 and o.modifiers[0].type=='SUBSURF'and o.modifiers[0].levels==1
  cols=o['gridColumns'];R=o['gridRows']
  rows[o.name]={'controlVertices':len(o.data.vertices),'grid':[R,cols],'localRim':[list(o.data.vertices[(R-1)*cols+j].co)for j in range(cols)],'worldRim':[list(o.matrix_world@o.data.vertices[(R-1)*cols+j].co)for j in range(cols)],'evaluatedClosedShell':True,'evaluatedNonDegenerate':True}
 e.to_mesh_clear()
assert len(rows)==2
native={'sha256':hashlib.sha256((ROOT/'assets/authoring/misaki-grayform-v1/misaki-grayform.blend').read_bytes()).hexdigest(),'meshObjects':len(bounds),'curveGuides':sum(o.type=='CURVE'for o in bpy.data.objects),'triangles':sum(b['triangles']for b in bounds.values()),'bounds':bounds,'editedCages':rows}
assert native['meshObjects']==44
# Separate empty file ensures the exporter/importer result is not confused with
# the native editable scene. Import is diagnostic only; no save follows it.
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(ROOT/'public/assets/misaki-grayform-v1/misaki-grayform.glb'))
imported=[];triangles=0
for o in bpy.data.objects:
 if o.type=='MESH':
  o.data.calc_loop_triangles();triangles+=len(o.data.loop_triangles);imported.append(o.name)
assert len(imported)==5 and triangles==native['triangles']
result={'blenderVersion':bpy.app.version_string,'nativeReopened':native,'glbReopened':{'sha256':hashlib.sha256((ROOT/'public/assets/misaki-grayform-v1/misaki-grayform.glb').read_bytes()).hexdigest(),'meshes':imported,'triangles':triangles},'limits':['Closed evaluated hair shells do not certify hair-head separation, production topology, rig or visual likeness','Side/back are inferred from canonical original only']}
(OUT/'source-reopen-inspection.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf8')
print(json.dumps({'nativeMeshes':len(bounds),'triangles':triangles,'importedGlbMeshes':len(imported),'reopenedBoth':True}))
