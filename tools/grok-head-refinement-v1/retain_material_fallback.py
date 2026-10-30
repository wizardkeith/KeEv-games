"""Reject worse hair/sclera geometry edits. Retain original geometry exactly."""
from pathlib import Path
import bpy,json,hashlib,zipfile
R=Path(__file__).resolve().parents[2];A=R/'assets/authoring/grok-head-refinement-v1';O=R/'docs/reviews/evidence/grok-head-refinement-v1'
failed=A/'rejected-head-geometry.blend';archive=A/'rejected-geometry-evidence.zip';assert not archive.exists()
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED)as z:
 for p in [failed,A/'manifest.json',*O.glob('after-*.png')]:z.write(p,p.name)
bpy.ops.wm.open_mainfile(filepath=str(failed),load_ui=False,use_scripts=False);o=bpy.data.objects['Misaki'];m=o.data;control=bpy.data.objects['Original candidate / same studio control'];original=control.data
assert len(m.vertices)==len(original.vertices)
for a,b in zip(m.vertices,original.vertices):a.co=b.co
for a,b in zip(m.uv_layers.active.data,original.uv_layers.active.data):a.uv=b.uv
for p,base in zip(m.polygons,original.polygons):
 name=original.materials[base.material_index].name
 if name=='M_Eye':p.material_index=list(m.materials).index(bpy.data.materials['M_Eye'])
# Only original iris islands receive their own non-overlapping per-eye UVs.
adj=[set()for v in m.vertices]
for e in m.edges:a,b=e.vertices;adj[a].add(b);adj[b].add(a)
seen=set()
for start in range(len(adj)):
 if start in seen:continue
 todo=[start];seen.add(start);ids=[]
 while todo:
  q=todo.pop();ids.append(q)
  for v in adj[q]:
   if v not in seen:seen.add(v);todo.append(v)
 indices=set(ids);polys=[p for p in m.polygons if p.vertices[0]in indices]
 if original.materials[original.polygons[polys[0].index].material_index].name=='M_Iris':
  xs=[m.vertices[i].co.x for i in ids];zs=[m.vertices[i].co.z for i in ids]
  for p in polys:
   for li in p.loop_indices:
    v=m.vertices[m.loops[li].vertex_index].co;m.uv_layers.active.data[li].uv=((v.x-min(xs))/(max(xs)-min(xs)),(v.z-min(zs))/(max(zs)-min(zs)))
assert all(tuple(a.co)==tuple(b.co)for a,b in zip(m.vertices,original.vertices))
assert all(tuple(a.vertices)==tuple(b.vertices)for a,b in zip(m.polygons,original.polygons))
m.update();scene=bpy.context.scene;key=bpy.data.lights['Shared neutral broad key'];fill=bpy.data.lights['Shared soft fill'];control.hide_render=True;o.hide_render=False;scene.camera=bpy.data.objects['Shared three-quarter'];key.color=(1,1,1);fill.color=(1,1,1);bpy.context.preferences.filepaths.save_version=0;out=A/'grok-head-material-fallback.blend';bpy.ops.wm.save_as_mainfile(filepath=str(out))
for mood,view in [('neutral','front'),('neutral','three-quarter'),('neutral','profile'),('neutral','full'),('warm','three-quarter')]:
 key.color=(1,1,1)if mood=='neutral'else(1,.88,.76);fill.color=(1,1,1)if mood=='neutral'else(.92,.96,1);scene.camera=bpy.data.objects['Shared '+view]if view!='full'else bpy.data.objects['Shared full'];scene.render.stamp_note_text='ACTUAL BLENDER / original geometry + head material fallback / '+mood+' / '+view+' / unaccepted';scene.render.filepath=str(O/('fallback-'+mood+'-'+view+'.png'));bpy.ops.render.render(write_still=True)
native=hashlib.sha256(out.read_bytes()).hexdigest();report={'source':out.relative_to(R).as_posix(),'nativeSha256':native,'allOriginalVertexCoordinatesExact':True,'allOriginalPolygonVertexIndicesExact':True,'failedGeometryStudyRetained':failed.name,'failedEvidenceArchiveSha256':hashlib.sha256(archive.read_bytes()).hexdigest(),'adoptedHairOrScleraGeometryChanges':False,'changes':['Only head/face own cheek loop colour and EEVEE coloured shadow response','Own iris albedo UV detail on original iris islands','Subtle original-brown hair loop colour, original geometry and sclera/lash materials retained','Masked head normal control; no body geometry/material/weights/UV changes'],'artStatus':'Unaccepted conservative material fallback. Original candidate is preferred over failed geometric study; compare actual pixels before deciding on this fallback.','portability':'Native Shader-to-RGB graph only, no new portable toon export claim.'}
(A/'fallback-manifest.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf8',newline='\n');print('ORIGINAL_GEOMETRY_RESTORED_MATERIAL_FALLBACK '+json.dumps(report))
