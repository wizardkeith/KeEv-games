"""Reopen local study and verify the executed method/source preservation."""
import bpy,bmesh,json,hashlib
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2];ASSET=ROOT/'assets/authoring/head-method-study-v4';OUT=ROOT/'docs/reviews/evidence/head-method-study-v4'
manifest=json.loads((ASSET/'manifest.json').read_text());source=ROOT/manifest['source']
assert hashlib.sha256(source.read_bytes()).hexdigest()==manifest['sourceSha256']
bpy.ops.wm.open_mainfile(filepath=str(source))
surfaces=[o for o in bpy.data.objects if o.type=='SURFACE']
assert len(surfaces)==10
assert all(o.data.splines[0].point_count_u==7 and o.data.splines[0].point_count_v==7 for o in surfaces)
face=bpy.data.objects['New head / free mesh facial sculpt and open sockets'];bm=bmesh.new();bm.from_mesh(face.data)
edges=[e for e in bm.edges if e.is_boundary];unseen={v for e in edges for v in e.verts};loops=0
while unseen:
 loops+=1;stack=[unseen.pop()]
 while stack:
  v=stack.pop()
  for e in v.link_edges:
   if not e.is_boundary:continue
   other=e.other_vert(v)
   if other in unseen:unseen.remove(other);stack.append(other)
bm.free();assert loops==2,loops
assert hashlib.sha256((ROOT/'assets/authoring/target-model-proof-v3/misaki-display-model-proof.blend').read_bytes()).hexdigest()==manifest['v3RollbackSha256']
receipt={'sourceReopened':True,'sourceSha256':manifest['sourceSha256'],'nativeNurbsSurfaces':len(surfaces),'controlGridEach':[7,7],'faceEyeSocketBoundaryLoops':loops,'v3SourceUnchanged':True,'referenceImageProjected':False,'portableExportTested':False,'artAccepted':False,'externalUploadPerformed':False}
(OUT/'local-reopen-verification.json').write_text(json.dumps(receipt,indent=2)+'\n',encoding='utf8',newline='\n')
print(json.dumps(receipt))
