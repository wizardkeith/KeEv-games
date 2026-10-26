"""Editable Blender stoneware production source for the central-table quality
slice. Existing mug identity/envelope, real hollow interior and joined handle;
separate non-stock flower jug. No stock/catalogue or state is authored here.
"""
import bpy,math,json,hashlib
from pathlib import Path
from mathutils import Vector
root=Path(__file__).resolve().parents[1];out=root/'assets/masters/native-v11/display-quality';out.mkdir(parents=True,exist_ok=True);bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
def cv(p):return(p[0],-p[2],p[1])
def obj(name,v,f,uv):
 me=bpy.data.meshes.new(name);me.from_pydata([cv(p) for p in v],[],f);me.update();ob=bpy.data.objects.new(name,me);bpy.context.collection.objects.link(ob);layer=me.uv_layers.new(name='Theta and actual height')
 for poly in me.polygons:
  poly.use_smooth=True
  for li in poly.loop_indices:layer.data[li].uv=uv[me.loops[li].vertex_index]
 return ob
spline=lambda a,b,c,d,t:.5*((2*b)+(-a+c)*t+(2*a-5*b+4*c-d)*t*t+(-a+3*b-3*c+d)*t*t*t)
def lathe(name,profile,height):
 n=48;steps=(len(profile)-1)*3;v=[];uv=[];f=[]
 for row in range(steps+1):
  pos=row/steps*(len(profile)-1);k=min(len(profile)-2,int(pos));t=pos-k;rs=[profile[max(0,min(len(profile)-1,i))][0] for i in[k-1,k,k+1,k+2]];r=max(.0005,spline(*rs,t));y=profile[k][1]+(profile[k+1][1]-profile[k][1])*t
  for j in range(n+1):
   a=j/n*math.pi*2;rr=r*(1+.005*math.sin(a*3+y*9)+.002*math.sin(a*7));v.append((rr*math.cos(a),y,rr*math.sin(a)));uv.append((j/n,y/height))
 for row in range(steps):
  for j in range(n):a=row*(n+1)+j;b=a+n+1;f.extend([(a,b,a+1),(a+1,b,b+1)])
 for row,rev in[(0,True),(steps,False)]:
  center=len(v);v.append((0,profile[0 if row==0 else -1][1],0));uv.append((.5,profile[0 if row==0 else -1][1]/height))
  for j in range(n):f.append((center,row*(n+1)+j,row*(n+1)+j+1) if rev else(center,row*(n+1)+j+1,row*(n+1)+j))
 # The native lathe convention uses outward CCW faces, corrected by signed volume.
 volume=sum(Vector(v[a]).dot(Vector(v[b]).cross(Vector(v[c]))) for a,b,c in f)
 if volume<0:f=[(a,c,b)for a,b,c in f]
 return obj(name,v,f,uv)
def handle(name,points,height,r=.014):
 count=24;sides=10;v=[];uv=[];f=[]
 for i in range(count+1):
  pos=i/count*(len(points)-1);k=min(len(points)-2,int(pos));t=pos-k;p=Vector([spline(*[points[max(0,min(len(points)-1,j))][d] for j in[k-1,k,k+1,k+2]],t)for d in range(3)]);eps=.0001
  def at(q):
   pos=q*(len(points)-1);k=min(len(points)-2,int(pos));t=pos-k;return Vector([spline(*[points[max(0,min(len(points)-1,j))][d]for j in[k-1,k,k+1,k+2]],t)for d in range(3)])
  axis=(at(min(1,i/count+eps))-at(max(0,i/count-eps))).normalized();right=Vector((0,0,1));up=axis.cross(right).normalized()
  for j in range(sides):
   a=j/sides*math.pi*2;q=p+right*math.cos(a)*r+up*math.sin(a)*r;v.append(tuple(q));uv.append((.5+j/sides*.1,q.y/height))
 for i in range(count):
  for j in range(sides):a=i*sides+j;b=i*sides+(j+1)%sides;f.extend([(a,b,a+sides),(b,b+sides,a+sides)])
 for i,rev in[(0,True),(count,False)]:
  center=len(v);p=points[0 if i==0 else -1];v.append(p);uv.append((.55,p[1]/height))
  for j in range(sides):a=i*sides+j;b=i*sides+(j+1)%sides;f.append((center,b,a)if rev else(center,a,b))
 volume=sum(Vector(v[a]).dot(Vector(v[b]).cross(Vector(v[c])))for a,b,c in f)
 if volume<0:f=[(a,c,b)for a,b,c in f]
 return obj(name,v,f,uv)
def export(ob,color):
 me=ob.data;me.calc_loop_triangles();g={'positions':[],'normals':[],'uvs':[],'indices':[]}
 for tri in me.loop_triangles:
  for li in tri.loops:
   p=me.vertices[me.loops[li].vertex_index].co;n=me.corner_normals[li].vector;g['indices'].append(len(g['positions'])//3);g['positions'] +=[float(p.x),float(p.z),float(-p.y)];g['normals'] +=[float(n.x),float(n.z),float(-n.y)];g['uvs'] +=list(me.uv_layers.active.data[li].uv)
 return{'shape':'mesh','at':[0,0,0],'role':'ceramic','color':color,'roughness':.70,'finish':'stoneware','geometry':g}
mug=lathe('Hollow mug — rolled lip and exposed foot',[(.001,.006),(.079,.006),(.087,.010),(.088,.018),(.103,.026),(.115,.061),(.119,.150),(.113,.214),(.112,.231),(.108,.238),(.102,.237),(.100,.229),(.102,.210),(.108,.150),(.103,.066),(.086,.035),(.001,.034)],.24);mh=handle('Mug handle with embedded terminals',[(.107,.193,0),(.171,.203,0),(.201,.150,0),(.173,.086,0),(.107,.072,0)],.24)
jug=lathe('Non-stock flower jug — continuous belly and neck',[(.001,.004),(.073,.004),(.099,.018),(.109,.083),(.104,.155),(.074,.225),(.053,.263),(.055,.294),(.061,.303),(.056,.309),(.046,.305),(.045,.265),(.063,.229),(.092,.151),(.096,.083),(.084,.029),(.001,.024)],.31);jh=handle('Flower jug handle, not an extra sellable item',[(.080,.221,0),(.134,.235,0),(.162,.167,0),(.139,.104,0),(.101,.088,0)],.31,.011)
records={'mug':[export(mug,'#FFFFFF'),export(mh,'#FFFFFF')],'jug':[export(jug,'#C5CCB3'),export(jh,'#C5CCB3')]}
for name,parts in records.items():(out/(name+'.json')).write_text(json.dumps(parts,separators=(',',':'))+'\n')
bpy.context.preferences.filepaths.save_version=0;bpy.ops.wm.save_as_mainfile(filepath=str(out/'stoneware.blend'));(out/'vessels-provenance.json').write_text(json.dumps({'source':'tools/build-v11-display-vessels.py','sourceSha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),'units':'metres RH Y-up exported / Blender Z-up master','method':'Editable closed spline-turned hollow vessel shells and swept handle meshes with actual height-aligned UV; original authored stoneware material inputs','scope':'Central table visual-quality slice only; mug remains existing SKU and jug remains fixed non-inventory flower holder','triangles':{k:sum(len(p['geometry']['indices'])//3 for p in v)for k,v in records.items()}},indent=2)+'\n');print('Wrote original central vessel geometry')
