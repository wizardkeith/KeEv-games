"""Reopen R8/R9 native sources and actual R9 GLB; topology and camera rays."""
import bpy,json,hashlib,argparse,sys,math
from pathlib import Path
from collections import Counter
from mathutils import Vector
from mathutils.bvhtree import BVHTree
ROOT=Path(__file__).resolve().parents[2];OUT=ROOT/'docs/reviews/evidence/misaki-grayform-v1-r9'
p=argparse.ArgumentParser();p.add_argument('--baseline',required=True);a=p.parse_args(sys.argv[sys.argv.index('--')+1:])
def components(mesh):
 adj=[set()for _ in mesh.vertices]
 for e in mesh.edges:x,y=e.vertices;adj[x].add(y);adj[y].add(x)
 remaining=set(range(len(adj)));count=0
 while remaining:
  count+=1;todo=[remaining.pop()]
  while todo:
   for n in adj[todo.pop()]:
    if n in remaining:remaining.remove(n);todo.append(n)
 return count
def inspect(path,revision):
 bpy.ops.wm.open_mainfile(filepath=str(path));deps=bpy.context.evaluated_depsgraph_get();bounds={};hair=[];verts=[];faces=[];clip=[];lashes={}
 for o in bpy.data.objects:
  if o.type!='MESH':continue
  e=o.evaluated_get(deps);d=e.to_mesh();d.calc_loop_triangles();vs=[o.matrix_world@v.co for v in d.vertices]
  bounds[o.name]={'min':[min(v[i]for v in vs)for i in range(3)],'max':[max(v[i]for v in vs)for i in range(3)],'triangles':len(d.loop_triangles)}
  if 10<=int(o.name[:2])<17:
   uses=Counter(tuple(sorted(edge))for poly in d.polygons for edge in poly.edge_keys)
   assert all(v==2 for v in uses.values()),o.name+' evaluated closed shell'
   assert all(poly.area>1e-12 for poly in d.polygons),o.name+' degenerate polygon'
   offset=len(verts);verts.extend(vs);faces.extend(tuple(k+offset for k in poly.vertices)for poly in d.polygons)
   native_uses=Counter(tuple(sorted(edge))for poly in o.data.polygons for edge in poly.edge_keys)
   h={'object':o.name,'controlVertices':len(o.data.vertices),'controlQuads':sum(len(poly.vertices)==4 for poly in o.data.polygons),'nativeComponents':components(o.data),'nativeBoundaryEdges':sum(v==1 for v in native_uses.values()),'evaluatedComponents':components(d),'evaluatedClosed':True,'modifiers':[m.type for m in o.modifiers]}
   if revision=='R9'and o.name.startswith('10 /'):
    assert h['nativeComponents']==h['evaluatedComponents']==1
    assert h['nativeBoundaryEdges']==32 and h['controlVertices']==337 and h['controlQuads']==320
    assert h['modifiers']==['SUBSURF','SOLIDIFY']
   hair.append(h)
  if o.name.startswith('17 /'):clip.extend(vs)
  if o.name.startswith('06 / upper lash'):lashes[o.name]=vs
  e.to_mesh_clear()
 tree=BVHTree.FromPolygons(verts,faces);distances=[tree.find_nearest(v)[3]for v in clip];rays={}
 for name,direction in [('front',Vector((0,-1,0))),('threequarter',Vector((math.cos(math.pi/4)*math.sin(1.43),-math.sin(math.pi/4)*math.sin(1.43),math.cos(1.43))))]:
  rays[name]={}
  for label,points in {**lashes,'own-left clip':clip}.items():
   blocked=0
   for v in points:
    hit=tree.ray_cast(v+direction*.8,-direction,.80001)
    if hit[0]is not None and hit[3]<.7999:blocked+=1
   rays[name][label]={'sampledEvaluatedVertices':len(points),'hairBlocked':blocked}
 return {'meshObjects':len(bounds),'triangles':sum(v['triangles']for v in bounds.values()),'bounds':bounds,'hairObjects':hair,'clipDistance':{'samples':len(distances),'min':min(distances),'mean':sum(distances)/len(distances),'max':max(distances),'limit':'Unsigned vertex-to-surface distance; not attachment/collision proof'},'fixedCameraHairRayOcclusion':rays}
prior=inspect(Path(a.baseline),'R8');native=inspect(ROOT/'assets/authoring/misaki-grayform-v1/misaki-grayform.blend','R9')
assert native['meshObjects']==40 and len(native['hairObjects'])==3
bpy.ops.wm.read_factory_settings(use_empty=True);bpy.ops.import_scene.gltf(filepath=str(ROOT/'public/assets/misaki-grayform-v1/misaki-grayform.glb'))
meshes=[];triangles=0
for o in bpy.data.objects:
 if o.type=='MESH':o.data.calc_loop_triangles();triangles+=len(o.data.loop_triangles);meshes.append(o.name)
assert len(meshes)==5 and triangles==native['triangles']
r={'blenderVersion':bpy.app.version_string,'R8Baseline':prior,'nativeReopened':native,'glbReopened':{'meshes':meshes,'triangles':triangles},'sha256':{key:hashlib.sha256((ROOT/path).read_bytes()).hexdigest()for key,path in [('blend','assets/authoring/misaki-grayform-v1/misaki-grayform.blend'),('glb','public/assets/misaki-grayform-v1/misaki-grayform.glb')]},'limits':['Ray tests sample actual camera directions, not final eye/clip pixel acceptance','Continuous topology is not collision/rig or visual acceptance','Side/back inferred; no GUI']}
(OUT/'source-reopen-inspection.json').write_text(json.dumps(r,indent=2)+'\n',encoding='utf8',newline='\n')
print(json.dumps({'nativeMeshes':native['meshObjects'],'triangles':triangles,'raysR8':prior['fixedCameraHairRayOcclusion'],'raysR9':native['fixedCameraHairRayOcclusion'],'clipDistanceR9':native['clipDistance']}))
