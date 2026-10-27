"""Actual saved R8 native source/GLB reopen and bounded geometric inspection."""
import bpy,json,hashlib,argparse,sys,math
from pathlib import Path
from collections import Counter
from mathutils import Vector
from mathutils.bvhtree import BVHTree
ROOT=Path(__file__).resolve().parents[2];OUT=ROOT/'docs/reviews/evidence/misaki-grayform-v1-r8'
p=argparse.ArgumentParser();p.add_argument('--baseline',required=True);args=p.parse_args(sys.argv[sys.argv.index('--')+1:])

def inspect(path):
 bpy.ops.wm.open_mainfile(filepath=str(path));deps=bpy.context.evaluated_depsgraph_get();bounds={};hair=[];vertices=[];faces=[];clip=[];lashes={}
 for o in bpy.data.objects:
  if o.type!='MESH':continue
  e=o.evaluated_get(deps);d=e.to_mesh();d.calc_loop_triangles();vs=[o.matrix_world@v.co for v in d.vertices]
  bounds[o.name]={'min':[min(v[i]for v in vs)for i in range(3)],'max':[max(v[i]for v in vs)for i in range(3)],'triangles':len(d.loop_triangles)}
  if 10<=int(o.name[:2])<17:
   uses=Counter(tuple(sorted(edge))for poly in d.polygons for edge in poly.edge_keys)
   assert all(n==2 for n in uses.values()),o.name+' closed shell'
   assert all(poly.area>1e-12 for poly in d.polygons),o.name+' degenerate polygon'
   offset=len(vertices);vertices.extend(vs);faces.extend([tuple(k+offset for k in poly.vertices)for poly in d.polygons])
   hair.append({'object':o.name,'nativeVertices':len(o.data.vertices),'nativeQuads':sum(len(poly.vertices)==4 for poly in o.data.polygons),'mediumClumps':o.get('mediumClumps'),'evaluatedClosedShell':True,'evaluatedNonDegenerate':True,'modifiers':[m.type for m in o.modifiers]})
   assert len(o.modifiers)==1 and o.modifiers[0].type=='SUBSURF'and o.modifiers[0].levels==1
  if o.name.startswith('17 /'):clip.extend(vs)
  if o.name.startswith('06 / upper lash'):lashes[o.name]=vs
  e.to_mesh_clear()
 tree=BVHTree.FromPolygons(vertices,faces);distances=[tree.find_nearest(v)[3]for v in clip]
 occlusion={}
 for name,direction in [('front',Vector((0,-1,0))),('threequarter',Vector((math.cos(math.pi/4)*math.sin(1.43),-math.sin(math.pi/4)*math.sin(1.43),math.cos(1.43))))]:
  occlusion[name]={}
  for lash,points in lashes.items():
   blocked=0
   for v in points:
    origin=v+direction*.8;hit=tree.ray_cast(origin,-direction,.80001)
    if hit[0]is not None and hit[3]<.7999:blocked+=1
   occlusion[name][lash]={'sampledEvaluatedVertices':len(points),'hairBlocked':blocked}
 return {'meshObjects':len(bounds),'triangles':sum(x['triangles']for x in bounds.values()),'bounds':bounds,'hairGroups':hair,'guideObjects':sum(o.type=='CURVE'for o in bpy.data.objects),'clipDistance':{'samples':len(distances),'min':min(distances),'mean':sum(distances)/len(distances),'max':max(distances),'limit':'Unsigned sampled distance, not attachment/collision certification'},'upperLashHairRayOcclusion':occlusion}

prior=inspect(Path(args.baseline));native=inspect(ROOT/'assets/authoring/misaki-grayform-v1/misaki-grayform.blend')
assert native['meshObjects']==44 and len(native['hairGroups'])==7
assert sum(h['mediumClumps']for h in native['hairGroups'])==14
manifest=json.loads((ROOT/'assets/authoring/misaki-grayform-v1/manifest.json').read_text(encoding='utf8'))
for h in native['hairGroups']:assert manifest['objects'][h['object']]['controlQuads']==h['nativeQuads'],'accurate control cage count'
bpy.ops.wm.read_factory_settings(use_empty=True);bpy.ops.import_scene.gltf(filepath=str(ROOT/'public/assets/misaki-grayform-v1/misaki-grayform.glb'))
imported=[];triangles=0
for o in bpy.data.objects:
 if o.type=='MESH':o.data.calc_loop_triangles();triangles+=len(o.data.loop_triangles);imported.append(o.name)
assert len(imported)==5 and triangles==native['triangles']
result={'blenderVersion':bpy.app.version_string,'R7Baseline':prior,'nativeReopened':native,'glbReopened':{'meshes':imported,'triangles':triangles},'sha256':{key:hashlib.sha256((ROOT/path).read_bytes()).hexdigest()for key,path in [('blend','assets/authoring/misaki-grayform-v1/misaki-grayform.blend'),('glb','public/assets/misaki-grayform-v1/misaki-grayform.glb')]},'limits':['Ray tests sample the actual fixed camera directions but not final eye pixels/visibility acceptance','Independent closed clumps are not a globally welded scalp or certified production topology','Side/back inferred; no GUI, rig or style acceptance']}
(OUT/'source-reopen-inspection.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf8',newline='\n')
print(json.dumps({'nativeMeshes':native['meshObjects'],'triangles':triangles,'mediumClumps':14,'R8LashOcclusion':native['upperLashHairRayOcclusion'],'R7LashOcclusion':prior['upperLashHairRayOcclusion'],'clipDistance':native['clipDistance']}))
