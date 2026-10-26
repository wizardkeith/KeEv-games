"""C24 original continuous distant crown. Editable metaball source, low real
mesh and UV, no billboard, scene image or extra runtime leaf population.
Preserves C23 tree pivots and approximate spatial envelope, changes asset method.
"""
import bpy,math,json,hashlib
from pathlib import Path
root=Path(__file__).resolve().parents[1];out=root/'assets/masters/native-v11/display-quality';out.mkdir(parents=True,exist_ok=True);bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
mb=bpy.data.metaballs.new('Continuous asymmetrical branch crown field');mb.resolution=.065;mb.render_resolution=.045;mb.threshold=.62;ob=bpy.data.objects.new('Crown editable growth masses',mb);bpy.context.collection.objects.link(ob)
for x,y,z,rx,ry,rz in [(.02,.30,.08,.78,.90,.70),(-.35,-.05,.10,.66,.55,.60),(.35,.25,-.10,.60,.50,.60),(-.12,.85,.16,.50,.47,.50),(-.55,.40,-.12,.42,.35,.44),(.58,.60,.18,.42,.38,.40),(.12,.05,.50,.42,.40,.35),(-.28,.60,.55,.38,.40,.34),(.15,.80,-.38,.39,.35,.35)]:
 e=mb.elements.new();e.type='ELLIPSOID';e.co=(x,-z,y);e.radius=1;e.size_x=rx;e.size_y=rz;e.size_z=ry;e.stiffness=2
bpy.context.view_layer.objects.active=ob;ob.select_set(True);source=ob.copy();source.data=ob.data.copy();bpy.context.collection.objects.link(source);source.name='Retained editable metaball authoring';source.hide_render=True;source.hide_set(True);bpy.ops.object.convert(target='MESH');ob=bpy.context.object;ob.name='Continuous foliage low mesh'
# Fit the established local crown space, not a larger game/navigation envelope.
coords=[v.co.copy()for v in ob.data.vertices];bounds=[(min(v[k]for v in coords),max(v[k]for v in coords))for k in range(3)];target=[(-1.04,1.02),(-.90,.85),(-.69,1.39)]
for v in ob.data.vertices:
 for k in range(3):v.co[k]=target[k][0]+(v.co[k]-bounds[k][0])/(bounds[k][1]-bounds[k][0])*(target[k][1]-target[k][0])
for p in ob.data.polygons:p.use_smooth=True
triangles=sum(len(p.vertices)-2 for p in ob.data.polygons);dec=ob.modifiers.new('Controlled game LOD, not separate primitive balls','DECIMATE');dec.ratio=min(1,720/triangles);dec.use_collapse_triangulate=True;bpy.ops.object.modifier_apply(modifier=dec.name);me=ob.data;uv=me.uv_layers.new(name='Continuous crown angular UV')
for p in me.polygons:
 p.use_smooth=True
 vals=[]
 for li in p.loop_indices:
  v=me.vertices[me.loops[li].vertex_index].co;xx=v.x/1.04;yy=(v.z-.35)/1.04;zz=-v.y/.90;u=(math.atan2(zz,xx)/(2*math.pi)+1)%1;v2=math.asin(max(-1,min(1,yy)))/math.pi+.5;vals.append([li,u,v2])
 seam=max(x[1]for x in vals)-min(x[1]for x in vals)>.5
 for li,u,v2 in vals:uv.data[li].uv=(u+(1 if seam and u<.5 else 0),v2)
me.calc_loop_triangles();g={'positions':[],'normals':[],'uvs':[],'indices':[]}
for tri in me.loop_triangles:
 for li in tri.loops:
  p=me.vertices[me.loops[li].vertex_index].co;n=me.corner_normals[li].vector;g['indices'].append(len(g['positions'])//3);g['positions'] +=[float(p.x),float(p.z),float(-p.y)];g['normals'] +=[float(n.x),float(n.z),float(-n.y)];g['uvs'] +=list(uv.data[li].uv)
(out/'window-crown.json').write_text(json.dumps(g,separators=(',',':'))+'\n');bpy.context.preferences.filepaths.save_version=0;bpy.ops.wm.save_as_mainfile(filepath=str(out/'window-crown.blend'));(out/'crown-provenance.json').write_text(json.dumps({'source':'tools/build-v11-window-crown.py','sha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),'method':'Continuous union field with unequal branch masses ->720tri game LOD, authored UV and actual smooth normals; no reference pixels replace geometry','triangles':len(g['indices'])//3,'space':'RH Y-up metres relative to retained C23 tree pivot; Blender Z-up editable source','limits':'New original mesh+separate2D surface painting; no claim of individual geometric leaves or final target fidelity'},indent=2)+'\n');print('Continuous crown triangles',len(g['indices'])//3)
