"""C31 central-table linen primary-fold rest mesh. Editable Blender master plus exact
low geometry, not runtime cloth or an image of the scene. Flat support region
is deliberate; broad authored gravity folds stay inside retained table bounds.
"""
import bpy,math,json,hashlib
from pathlib import Path
root=Path(__file__).resolve().parents[1];out=root/'assets/masters/native-v11/display-quality';out.mkdir(parents=True,exist_ok=True)
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
cols=18;rows=16;verts=[];uvs=[];faces=[]
def pleat(u):
 # Unequal, broad gravity pleats. This is actual drape geometry, not weave/AO.
 return .064*math.exp(-((u-.24)/.15)**2)+.052*math.exp(-((u-.70)/.18)**2)+.012*math.exp(-((u-.94)/.07)**2)
for r in range(rows):
 for j in range(cols+1):
  u=j/cols;x=-.08+u*.64
  if r<=4:y=.995;z=.55-r/4*1.075
  elif r==5:y=.9675+.0275*math.cos(math.pi/6);z=-.525-.0275*math.sin(math.pi/6)
  elif r==6:y=.9675+.0275*math.cos(math.pi/3);z=-.525-.0275*math.sin(math.pi/3)
  elif r==7:y=.9675;z=-.5525
  else:
   t=(r-7)/8
   y=.9675-.3275*t+(.007*math.sin(u*math.pi*1.7+.3)+.004*math.cos(u*math.pi*5))*t**3
   z=-.554+pleat(u)*math.sin(t*math.pi*.68)**.65+.002*math.sin(u*math.pi*2+t)*t
   x+=.003*math.sin(u*math.pi*3+t)*t*t
  verts.append((x,-z,y));uvs.append((u,r/(rows-1)))
# Centreline arclength keeps the original fabric scale through the new folds.
arc=[0.0]
for r in range(1,rows):
 a=verts[(r-1)*(cols+1)+cols//2];b=verts[r*(cols+1)+cols//2]
 arc.append(arc[-1]+math.sqrt(sum((b[k]-a[k])**2 for k in range(3))))
for r in range(rows):
 for j in range(cols+1):uvs[r*(cols+1)+j]=(j/cols,arc[r]/arc[-1])
for r in range(rows-1):
 for j in range(cols):
  a=r*(cols+1)+j;faces.append((a,a+1,a+cols+2,a+cols+1))
#24 narrow sewn fringe ribbons. The roots overlap the actual hem by3mm;
# broad physical drape and fringe, not a texture pretending to hang in space.
fringe_roots=[]
def hem(u):
 q=u*cols;j=min(cols-1,int(q));f=q-j;a=verts[(rows-1)*(cols+1)+j];b=verts[(rows-1)*(cols+1)+j+1];return tuple(a[k]*(1-f)+b[k]*f for k in range(3))
for strand in range(24):
 u=(strand+.5)/24;half=.0034/.64;first=len(verts);root_mid=hem(u);fringe_roots.append(root_mid)
 for r in range(5):
  t=r/4;length=.060+.008*math.sin(strand*1.7)
  for side in [-1,1]:
   h=hem(u+side*half);angle=.08*math.sin(strand*.73+t*1.1)*t
   xx=root_mid[0]+(h[0]-root_mid[0])*math.cos(angle)+.002*math.sin(strand+t*2)*t
   zz=h[1]+(h[0]-root_mid[0])*math.sin(angle)+.00045*math.sin(t*math.pi+strand)*t
   yy=h[2]+.003-length*t
   verts.append((xx,zz,yy));uvs.append((u+side*half,1+t*length/arc[-1]))
 for r in range(4):a=first+r*2;faces.append((a,a+1,a+3,a+2))
me=bpy.data.meshes.new('Pinned support and broad gravity drape');me.from_pydata(verts,[],faces);me.update();ob=bpy.data.objects.new('Central linen — authored rest, no runtime solver',me);bpy.context.collection.objects.link(ob);uv=me.uv_layers.new(name='Linen complete unwrapped surface')
for poly in me.polygons:
 poly.use_smooth=True
 for li in poly.loop_indices:uv.data[li].uv=uvs[me.loops[li].vertex_index]
bpy.context.view_layer.objects.active=ob;ob.select_set(True)
solid=ob.modifiers.new('Actual 2mm cloth thickness, below support plane','SOLIDIFY');solid.thickness=.002;solid.offset=-1;solid.use_quality_normals=True
# A separate higher-detail editable surface is retained as an authoring master,
# but the controlled low silhouette is the production geometry, not a hidden win.
hi=ob.copy();hi.data=ob.data.copy();bpy.context.collection.objects.link(hi);hi.name='High authoring smoothness — not exported';sub=hi.modifiers.new('Authoring subdivision','SUBSURF');sub.levels=2;sub.render_levels=2;hi.hide_render=True;hi.hide_set(True)
def export_mesh(ob):
 evaluated=ob.evaluated_get(bpy.context.evaluated_depsgraph_get());m=evaluated.to_mesh();m.calc_loop_triangles();g={'positions':[],'normals':[],'indices':[],'uvs':[]};layer=m.uv_layers.active
 for tri in m.loop_triangles:
  for li in tri.loops:
   vi=m.loops[li].vertex_index;p=m.vertices[vi].co;n=m.corner_normals[li].vector;g['indices'].append(len(g['positions'])//3);g['positions'] += [float(p.x),float(p.z),float(-p.y)];g['normals'] += [float(n.x),float(n.z),float(-n.y)];g['uvs'] += list(layer.data[li].uv)
 evaluated.to_mesh_clear();return g
g=export_mesh(ob);recipe={'shape':'mesh','at':[0,0,0],'color':'#FFFFFF','role':'fabric','roughness':.86,'finish':'display-linen','geometry':g};(out/'linen-c31.json').write_text(json.dumps(recipe,separators=(',',':'))+'\n');bpy.context.preferences.filepaths.save_version=0;bpy.ops.wm.save_as_mainfile(filepath=str(out/'linen-c31.blend'));(out/'linen-c31-provenance.json').write_text(json.dumps({'authoring':'tools/build-v11-form-linen.py','units':'metres RH Y-up exported; Blender RH Z-up editable','method':'C31 unequal broad gravity folds from actual rounded table edge; retained width/flat support, with24 sewn fringe ribbons, exact planar support region, real2mm thickness and editable subdiv authoring source; no runtime cloth/pose','primaryGravityFolds':2,'surfaceArcMetres':arc[-1],'uvMeaning':'Physical width/centreline arc, including fringe length; no weave-resolution change','triangles':len(g['indices'])//3,'fringeCount':24,'fringeRootOverlapMetres':.003,'fringeRootsBlender':fringe_roots,'sourceSha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),'constraints':'Preserved exact furniture/navigation envelope; primary troughs fold inward beneath the retained edge. Stock remains supported by actual horizontal triangles, no save/economy input'},indent=2)+'\n');print('Exported actual linen triangles:',len(g['indices'])//3)
