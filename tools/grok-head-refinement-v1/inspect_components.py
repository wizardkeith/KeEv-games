from pathlib import Path
from collections import Counter
import bpy,json
R=Path(__file__).resolve().parents[2]
bpy.ops.wm.open_mainfile(filepath=str(R/'assets/authoring/grok-head-refinement-v1/original/Misaki_trial.blend'),load_ui=False,use_scripts=False)
o=bpy.data.objects['Misaki'];m=o.data;adj=[set()for v in m.vertices]
for e in m.edges:a,b=e.vertices;adj[a].add(b);adj[b].add(a)
seen=set();parts=[]
for start in range(len(adj)):
 if start in seen:continue
 stack=[start];seen.add(start);ids=[]
 while stack:
  q=stack.pop();ids.append(q)
  for n in adj[q]:
   if n not in seen:seen.add(n);stack.append(n)
 s=set(ids);polys=[p for p in m.polygons if p.vertices[0]in s];coords=[m.vertices[i].co for i in ids];mats=Counter(m.materials[p.material_index].name for p in polys)
 if max(v.z for v in coords)>1.10:
  parts.append({'id':len(parts),'vertexIds':ids,'vertexCount':len(ids),'materials':dict(mats),'min':[min(v[k]for v in coords)for k in range(3)],'max':[max(v[k]for v in coords)for k in range(3)],'centre':[sum(v[k]for v in coords)/len(coords)for k in range(3)]})
(R/'docs/reviews/evidence/grok-head-refinement-v1/source-audit/head-components.json').write_text(json.dumps(parts,indent=2)+'\n',encoding='utf8',newline='\n')
print(json.dumps([{k:v for k,v in p.items()if k!='vertexIds'}for p in parts]))
