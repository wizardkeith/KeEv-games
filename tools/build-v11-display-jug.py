"""C25 bounded central flower-jug production mesh, not a new product.
Full editable source; actual hollow shell and a reachable attached handle.
Keep the prior high jug authoring experiment unchanged and fit the original
combined styling triangle budget rather than increasing/splitting its cap.
"""
import bpy,math,json,hashlib
from pathlib import Path
from mathutils import Vector
root=Path(__file__).resolve().parents[1];out=root/'assets/masters/native-v11/display-quality'
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
def mesh(name,v,faces,uv):
 m=bpy.data.meshes.new(name);m.from_pydata([(x,-z,y) for x,y,z in v],[],faces);m.update();o=bpy.data.objects.new(name,m);bpy.context.collection.objects.link(o);layer=m.uv_layers.new(name='Actual vessel height and circumference')
 for f in m.polygons:
  f.use_smooth=True
  for li in f.loop_indices:layer.data[li].uv=uv[m.loops[li].vertex_index]
 return o
profile=[(.001,0),(.085,0),(.105,.024),(.112,.105),(.098,.19),(.057,.258),(.057,.304),(.048,.309),(.046,.265),(.085,.184),(.098,.08),(.083,.020),(.001,.020)]
n=16;v=[];uv=[];f=[]
for r,y in profile:
 for j in range(n+1):
  a=j/n*math.pi*2;rr=r*(1+.006*math.sin(a*3+y*9));v.append((rr*math.cos(a),y,rr*math.sin(a)));uv.append((j/n,y/.309))
for row in range(len(profile)-1):
 for j in range(n):a=row*(n+1)+j;b=a+n+1;f.extend([(a,b,a+1),(a+1,b,b+1)])
for row,reverse in [(0,True),(len(profile)-1,False)]:
 c=len(v);v.append((0,profile[row][1],0));uv.append((.5,profile[row][1]/.309))
 for j in range(n):f.append((c,row*(n+1)+j,row*(n+1)+j+1) if reverse else(c,row*(n+1)+j+1,row*(n+1)+j))
body=mesh('Central hollow flower jug — broad belly, narrow open neck, continuous foot',v,f,uv)
# Smooth cubic handle, embedded upper/lower terminals in the ACTUAL body.
points=[Vector(p) for p in [(.080,.221,0),(.156,.259,0),(.176,.090,0),(.101,.088,0)]]
def at(t):return points[0]*(1-t)**3+points[1]*3*t*(1-t)**2+points[2]*3*t*t*(1-t)+points[3]*t**3
v=[];uv=[];f=[];steps=6;sides=6;radius=.011
for i in range(steps+1):
 t=i/steps;p=at(t);axis=(at(min(1,t+.0001))-at(max(0,t-.0001))).normalized();right=Vector((0,0,1));up=axis.cross(right).normalized()
 for j in range(sides):
  a=j/sides*math.pi*2;q=p+right*math.cos(a)*radius+up*math.sin(a)*radius;v.append(tuple(q));uv.append((.5+j/sides*.1,q.y/.309))
for i in range(steps):
 for j in range(sides):a=i*sides+j;b=i*sides+(j+1)%sides;f.extend([(a,b,a+sides),(b,b+sides,a+sides)])
for i,rev in [(0,True),(steps,False)]:
 c=len(v);p=at(i/steps);v.append(tuple(p));uv.append((.55,p.y/.309))
 for j in range(sides):a=i*sides+j;b=i*sides+(j+1)%sides;f.append((c,b,a) if rev else(c,a,b))
handle=mesh('Single original handle — embedded terminals, not floating accessory',v,f,uv)
def export(o):
 m=o.data;m.calc_loop_triangles();g={'positions':[],'normals':[],'uvs':[],'indices':[]}
 for tri in m.loop_triangles:
  for li in tri.loops:
   p=m.vertices[m.loops[li].vertex_index].co;n=m.corner_normals[li].vector;g['indices'].append(len(g['positions'])//3);g['positions'] += [float(p.x),float(p.z),float(-p.y)];g['normals'] += [float(n.x),float(n.z),float(-n.y)];g['uvs'] += list(m.uv_layers.active.data[li].uv)
 return {'shape':'mesh','at':[0,0,0],'role':'ceramic','color':'#C5CCB3','roughness':.70,'finish':'stoneware','geometry':g}
parts=[export(body),export(handle)];(out/'flower-jug.json').write_text(json.dumps(parts,separators=(',',':'))+'\n');bpy.context.preferences.filepaths.save_version=0;bpy.ops.wm.save_as_mainfile(filepath=str(out/'flower-jug.blend'));(out/'flower-jug-provenance.json').write_text(json.dumps({'source':'tools/build-v11-display-jug.py','sourceSHA256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),'units':'metres RH Y-up export / editable Blender RH Z-up','scope':'ONLY replace existing central non-stock flowerholder, same support and arrangement; original high jug remains separate unused experiment','triangles':[len(p['geometry']['indices'])//3 for p in parts],'handleTerminalCenters':[[.080,.221,0],[.101,.088,0]],'handleRadius':radius,'geometry':'13 authored radial profile rings,16 sectors, real closed cavity/foot; cubic swept attached handle, no painted fake vessel','limits':'Actual game comparison pending; no target acceptance'},indent=2)+'\n');print('Flower jug triangles:',sum(len(p['geometry']['indices'])//3 for p in parts))
