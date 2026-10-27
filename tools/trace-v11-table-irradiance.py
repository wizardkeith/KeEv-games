"""C30 bounded CPU ray diagnostic: exact receiver vertices, deterministic broad
window/sun visibility + one diffuse bounce. No mesh subdivision or image bake.
Static BVH excludes owned stock, actors, hinged door and FX; dynamic masking pending.
"""
import bpy,json,os,math,hashlib
from pathlib import Path
from mathutils import Vector
from mathutils.bvhtree import BVHTree
source=Path(os.environ['V11_IRRADIANCE_SOURCE']);out=Path(os.environ['V11_IRRADIANCE_OUT']);out.mkdir(parents=True,exist_ok=True);data=json.loads(source.read_text());receivers=json.load(open(os.environ['V11_IRRADIANCE_TEMPLATE']))
vertices=[];polys=[];colors=[]
for r in data['meshes']:
 if r['name'].startswith(('actor.','native.door.','fx.','discovery.'))or'actual-stock-batch'in r['name']or r['material']['alpha']<1:continue
 base=len(vertices);vertices.extend([r['positions'][i:i+3]for i in range(0,len(r['positions']),3)]);polys.extend([tuple(base+j for j in r['indices'][i:i+3])for i in range(0,len(r['indices']),3)]);colors.extend([Vector(r['material']['baseColorLinear'])]*(len(r['indices'])//3))
bvh=BVHTree.FromPolygons(vertices,polys,all_triangles=True,epsilon=0);lookup={r['name']:r for r in data['meshes']};sun=Vector((-.8,.62,-.18)).normalized();axis=sun.cross(Vector((0,1,0))).normalized();axis2=sun.cross(axis).normalized();sunrays=[(sun+axis*(math.cos(i*2.399963)*math.sqrt((i+.5)/16)*.14)+axis2*(math.sin(i*2.399963)*math.sqrt((i+.5)/16)*.14)).normalized()for i in range(16)]
window=[Vector((-4.45,1.1+(y+.5)*2/4,-2.1+(x+.5)*3.8/4))for x in range(4)for y in range(4)]
def visible(o,d,dist=100):return bvh.ray_cast(o,d,dist)[0]is None
def direct(p,n):
 o=p+n*.002;v=Vector((0,0,0))
 for d in sunrays:
  cos=max(0,n.dot(d))
  if cos>0 and visible(o,d):v+=Vector((1,.87,.68))*(float(os.environ.get('V11_SUN_IRRADIANCE','2.8'))*cos/(16*math.pi))
 for w in window:
  delta=w-o;dist=delta.length;d=delta/dist;cos=max(0,n.dot(d));areaCos=max(0,-d.x)
  if cos>0 and visible(o,d,max(0,dist-.01)):v+=Vector((.90,.95,1))*(float(os.environ.get('V11_WINDOW_POWER','180'))*cos*areaCos/(math.pi*math.pi*dist*dist*16))
 return v
# Cosine hemisphere quadrature; fixed equal-area directions, no random salt.
hem=[(math.sqrt((i+.5)/32)*math.cos(i*2.399963),math.sqrt((i+.5)/32)*math.sin(i*2.399963),math.sqrt(1-(i+.5)/32))for i in range(32)]
cache={}
for r in receivers['records']:
 g=lookup[r['name']];directValues=[];bounceValues=[]
 for i in range(r['vertices']):
  if not r['weight'][i]:directValues.extend((0,0,0));bounceValues.extend((0,0,0));continue
  p=Vector(g['positions'][i*3:i*3+3]);n=Vector(g['normals'][i*3:i*3+3]).normalized();key=tuple(round(v,5)for v in (*p,*n))
  if key not in cache:
   d=direct(p,n);axis=n.cross(Vector((0,1,0)))if abs(n.y)<.95 else n.cross(Vector((1,0,0)));axis.normalize();axis2=n.cross(axis);bounce=Vector((0,0,0));o=p+n*.002
   for x,y,z in hem:
    ray=axis*x+axis2*y+n*z;hit,hn,poly,dist=bvh.ray_cast(o,ray,12)
    if hit is None:bounce+=Vector((.32,.40,.48))*float(os.environ.get('V11_SKY_SCALE','1'))/32
    else:
     if hn.dot(ray)>0:hn=-hn
     # One actual diffuse bounce with secondary visibility, not ambient fake AO.
     incoming=direct(hit+hn*.002,hn)+Vector((.10,.12,.14));c=colors[poly];bounce+=Vector((c.x*incoming.x,c.y*incoming.y,c.z*incoming.z))/32
   cache[key]=(list(d),list(bounce))
  dv,bv=cache[key];directValues.extend(round(v,6)for v in dv);bounceValues.extend(round(v,6)for v in bv)
 r['direct']=directValues;r['indirect']=bounceValues;print('TRACED',r['name'],r['vertices'],flush=True)
receivers['calibration']={'windowPower':float(os.environ.get('V11_WINDOW_POWER','180')),'sunIrradiance':float(os.environ.get('V11_SUN_IRRADIANCE','2.8')),'skyScale':float(os.environ.get('V11_SKY_SCALE','1'))};receivers.update(method='Deterministic CPU BVH, original vertex normals, 16 broad-sun +16 window-area +32 cosine-hemisphere one-bounce samples, 2mm normal-offset self-intersection guard; no render image/geometry edit',limits='Authoring prototype, independent radiometry and one-bounce approximation; original material average for bounce, no texture-frequency bounce. Owned stock/actor dynamic shadow masking pending, no target acceptance',sourceSHA256=hashlib.sha256(source.read_bytes()).hexdigest());(out/'table-irradiance-c30.json').write_text(json.dumps(receivers,separators=(',',':'))+'\n');print('DONE',len(cache),flush=True)
