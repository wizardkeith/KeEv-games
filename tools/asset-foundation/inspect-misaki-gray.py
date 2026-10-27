"""Read-only evaluated source inspection; run with the saved .blend loaded."""
import bpy,json
from mathutils.bvhtree import BVHTree
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'docs/reviews/evidence/misaki-grayform-v1-r6';OUT.mkdir(parents=True,exist_ok=True)
deps=bpy.context.evaluated_depsgraph_get();bounds={}
for o in bpy.data.objects:
 if o.type!='MESH':continue
 e=o.evaluated_get(deps);d=e.to_mesh();positions=[o.matrix_world@v.co for v in d.vertices]
 bounds[o.name]={'min':[min(v[k]for v in positions)for k in range(3)],'max':[max(v[k]for v in positions)for k in range(3)]};e.to_mesh_clear()
face=bpy.data.objects['01 / cheek to narrowing jaw and real eye apertures'];e=face.evaluated_get(deps);d=e.to_mesh();uses={}
for polygon in d.polygons:
 for key in polygon.edge_keys:uses[tuple(sorted(key))]=uses.get(tuple(sorted(key)),0)+1
adj={}
for edge,count in uses.items():
 if count==1:
  a,b=edge;adj.setdefault(a,set()).add(b);adj.setdefault(b,set()).add(a)
assert all(len(neighbors)==2 for neighbors in adj.values())
remaining=set(adj);rings=[]
while remaining:
 todo=[remaining.pop()];seen=set(todo)
 while todo:
  for n in adj[todo.pop()]:
   if n not in seen:seen.add(n);remaining.discard(n);todo.append(n)
 rings.append(len(seen))
assert len(rings)==2,'two genuine evaluated eye apertures'
e.to_mesh_clear()
neck=bounds['02 / visible neck bridge'];chin=bounds[face.name]['min'][2]
body=[b for name,b in bounds.items()if int(name[:2])>=20];bodytop=max(b['max'][2]for b in body)
assert neck['max'][2]>chin and neck['min'][2]<bodytop,'neck overlaps head and enters frozen collar envelope'
hair_parts=[o for o in bpy.data.objects if o.type=='MESH'and 10<=int(o.name[:2])<17];assert len(hair_parts)==7
vertices=[];polygons=[];authoring=[]
for hair in hair_parts:
 assert all(m.type=='SUBSURF'and m.levels==1 for m in hair.modifiers),'hair uses only local subdivision1; no remesh/global smoothing'
 e=hair.evaluated_get(deps);d=e.to_mesh();offset=len(vertices);vertices.extend([hair.matrix_world@v.co for v in d.vertices]);polygons.extend([[offset+k for k in p.vertices]for p in d.polygons]);e.to_mesh_clear();authoring.append({'name':hair.name,'modifiers':[m.type for m in hair.modifiers],'thicknessControls':list(hair['thicknessControls']),'independentSpine':bool(hair.get('spineBezier'))})
tree=BVHTree.FromPolygons(vertices,polygons);distances=[]
for o in bpy.data.objects:
 if not o.name.startswith('17 /'):continue
 e=o.evaluated_get(deps);d=e.to_mesh()
 for v in d.vertices:distances.append(tree.find_nearest(o.matrix_world@v.co)[3])
 e.to_mesh_clear()
attachment={'sampledEvaluatedClipVertices':len(distances),'minDistance':min(distances),'meanDistance':sum(distances)/len(distances),'maxDistance':max(distances),'limits':'Unsigned sampled vertex-to-hair distance, not collision/attachment certification.'}
main=bpy.data.objects['10 / primary swept fringe'];sections=[]
for i in range(2,10):
 l=main.data.vertices[i*6].co;r=main.data.vertices[i*6+5].co;middle=main.data.vertices[i*6+3].co
 delta=middle-(l+r)*.5;sections.append({'sourceRow':i,'centreMinusBorderChord':list(delta),'distance':delta.length})
front_layout={}
for name in ['10 / primary swept fringe','11 / underlapping temple turn']:
 o=bpy.data.objects[name];rows=[]
 for i in [0,4,7,11]:
  points=[o.matrix_world@o.data.vertices[i*6+j].co for j in [0,3,5]]
  rows.append({'sourceRow':i,'leftCentreRightBlenderWorld':[list(p)for p in points],'lateralWidth':abs(points[2].x-points[0].x),'borderDistance':(points[2]-points[0]).length})
 front_layout[name]=rows
result={'boundsBlenderZUp':bounds,'evaluatedFaceEyeBoundaryLoops':rings,'neckHeadVerticalOverlap':neck['max'][2]-chin,'chinToFrozenClothesTop':chin-bodytop,'clipAttachment':attachment,'hairAuthoring':authoring,'frontSweepLayout':front_layout,'mainClumpInternalSections':sections,'nativeBezierGuides':sum(o.type=='CURVE'and o.name.startswith('GUIDE /')for o in bpy.data.objects),'noGlobalHairFusionOrSmoothing':True,'limits':'Vertical/bounds relationships do not prove watertight skin, collisions or art acceptance; side/back inferred.'}
(OUT/'source-inspection.json').write_text(json.dumps(result,indent=2)+'\n');print({k:v for k,v in result.items()if k!='boundsBlenderZUp'})
