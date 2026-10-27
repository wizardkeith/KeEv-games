"""Read-only evaluated mesh check: only hair controls10/11 may change in R6.
Run with the current saved .blend loaded. Baseline comes from the pinned git blob.
"""
import bpy,hashlib,json,struct,subprocess,tempfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
SOURCE='1e9680481bc16273b09bd1db39917dc06ba0f276'
REL='assets/authoring/misaki-grayform-v1/misaki-grayform.blend'
OUT=ROOT/'docs/reviews/evidence/misaki-grayform-v1-r6'
def signature(o):
 deps=bpy.context.evaluated_depsgraph_get();e=o.evaluated_get(deps);d=e.to_mesh();d.calc_loop_triangles();h=hashlib.sha256()
 for row in o.matrix_world:
  h.update(struct.pack('<4f',*row))
 for v in d.vertices:
  h.update(struct.pack('<3f',*v.co));h.update(struct.pack('<3f',*v.normal))
 for triangle in d.loop_triangles:h.update(struct.pack('<3I',*triangle.vertices))
 result={'sha256':h.hexdigest(),'evaluatedVertices':len(d.vertices),'triangles':len(d.loop_triangles)}
 e.to_mesh_clear();return result
names=sorted(o.name for o in bpy.data.objects if o.type=='MESH'and o.name[:2]in['12','13','14','15','16'])
assert len(names)==5
current={name:signature(bpy.data.objects[name])for name in names}
blob=subprocess.check_output(['git','show',SOURCE+':'+REL],cwd=ROOT)
with tempfile.TemporaryDirectory(prefix='misaki-r6-scope-')as folder:
 path=Path(folder)/'pinned-r5.blend';path.write_bytes(blob)
 with bpy.data.libraries.load(str(path),link=False)as(data_from,data_to):
  assert all(name in data_from.objects for name in names)
  data_to.objects=names.copy()
 collection=bpy.data.collections.new('Temporary pinned R5 scope baseline');bpy.context.scene.collection.children.link(collection)
 for o in data_to.objects:collection.objects.link(o)
 bpy.context.view_layer.update()
 baseline={name:signature(o)for name,o in zip(names,data_to.objects)}
 for name in names:assert current[name]==baseline[name],name+' must remain identical to R5'
 result={'baselineSource':SOURCE,'baselineBlendSha256':hashlib.sha256(blob).hexdigest(),'currentBlendSha256':hashlib.sha256((ROOT/REL).read_bytes()).hexdigest(),'frozenObjects':names,'evaluatedPositionNormalTrianglesAndWorldMatrixIdentical':True,'baseline':baseline,'current':current,'limits':'Checks five frozen hair surfaces only; non-hair streams/TRS separately validated. Not art/collision/rig certification.'}
 OUT.mkdir(parents=True,exist_ok=True);(OUT/'scope-preservation.json').write_text(json.dumps(result,indent=2)+'\n');print(result)
