"""Fixed-seed Blender authoring. Metres; Blender Z-up -> glTF RH Y-up.
Run: blender -b -t 2 --python tools/asset-foundation/build.py
Each component is independently reusable; assembly placements live only in this source.
"""
import bpy, math, random, json, os
from mathutils import Vector
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'public/assets/asset-foundation-v1'; SRC=ROOT/'assets/authoring/asset-foundation-v1'
OUT.mkdir(parents=True,exist_ok=True);SRC.mkdir(parents=True,exist_ok=True)
bpy.context.preferences.filepaths.save_version=0
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
random.seed(71)

def mat(name,color,rough=.5,coat=0):
 m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True
 p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*color,1);p.inputs['Roughness'].default_value=rough;p.inputs['Coat Weight'].default_value=coat;p.inputs['Coat Roughness'].default_value=.25
 return m
# Authored restrained longitudinal grain, carried by glTF image/UVs (no shader trick).
import numpy as np
size=512
xx,yy=np.meshgrid(np.arange(size)/size,np.arange(size)/size)
wave=yy*83+.55*np.sin(xx*9)+.22*np.sin(xx*27+yy*9)
grain=.964+.018*np.sin(wave*math.tau)+.008*np.sin(wave*math.tau*2.3)
grain-=.018*np.exp(-((np.sin((yy+.014*np.sin(xx*7))*math.pi*13))/.14)**2)
rng=np.random.default_rng(71);grain+=rng.normal(0,.002,(size,size))
rgba=np.ones((size,size,4),dtype=np.float32)
for k in range(3):rgba[:,:,k]=np.clip(grain,0,1)
img=bpy.data.images.new('Authored fine oak grain',width=size,height=size);img.pixels.foreach_set(rgba.ravel());img.filepath_raw=str(SRC/'oak-grain.png');img.file_format='PNG';img.save();img.pack()
wood=[mat('Honey oak • board '+str(i),(.49+i*.016,.266+i*.013,.105+i*.008),.43)for i in range(4)]
for m in wood:
 nodes=m.node_tree.nodes;tex=nodes.new('ShaderNodeTexImage');tinted=rgba.copy();color=m.diffuse_color[:3]
 for k in range(3):tinted[:,:,k]=np.clip(grain*(1.055*color[k]**(1/2.4)-.055),0,1)
 image=bpy.data.images.new(m.name+' grain',width=size,height=size);image.pixels.foreach_set(tinted.ravel());image.filepath_raw=str(SRC/('oak-board-'+str(wood.index(m))+'.png'));image.file_format='PNG';image.save();image.pack();tex.image=image;m.node_tree.links.new(tex.outputs['Color'],nodes.get('Principled BSDF').inputs['Base Color'])
endwood=mat('Honey oak • end grain',(.40,.211,.080),.50)
cream=mat('Warm ivory glaze',(.86,.816,.687),.27,.24)
celadon=mat('Celadon glaze',(.247,.423,.355),.29,.26)
clothmat=mat('Warm white woven linen',(.89,.858,.772),.91)
green=mat('Soft sage leaves',(.19,.29,.105),.65)
stemmat=mat('Fine olive stems',(.22,.28,.105),.71)
petalmat=mat('Warm white petals',(.94,.91,.81),.59)
heartmat=mat('Muted pollen',(.61,.43,.15),.73)
components={}
current=[]
def finish(o,name,m):
 o.name=name;o.data.materials.append(m);current.append(o);return o

def bevelbox(name,loc,dim,m,r=.009):
 bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.scale=dim;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 uv=o.data.uv_layers.active
 for poly in o.data.polygons:
  for li in poly.loop_indices:
   v=o.data.vertices[o.data.loops[li].vertex_index].co;axis=1 if abs(poly.normal.z)>.5 else 2
   uv.data[li].uv=(v.x/dim[0]+.5,v[axis]/dim[axis]+.5)
 b=o.modifiers.new('Refined edge radius','BEVEL');b.width=r;b.segments=4
 b.profile=.5
 n=o.modifiers.new('Board face normals','WEIGHTED_NORMAL');n.keep_sharp=True;n.weight=50
 return finish(o,name,m)

def mesh(name,verts,faces,m):
 d=bpy.data.meshes.new(name);d.from_pydata(verts,[],faces);d.update();o=bpy.data.objects.new(name,d);bpy.context.collection.objects.link(o)
 for p in d.polygons:p.use_smooth=True
 return finish(o,name,m)

def tube(name,pts,r,m,sides=8):
 vs=[];fs=[]
 for i,pt in enumerate(pts):
  tangent=Vector(pts[min(i+1,len(pts)-1)])-Vector(pts[max(0,i-1)]);tangent.normalize();v=tangent.cross(Vector((0,0,1)))
  if v.length<.01:v=tangent.cross(Vector((1,0,0)))
  v.normalize();w=tangent.cross(v).normalized()
  rad=r*(1-.35*i/(len(pts)-1))
  for j in range(sides):vs.append(Vector(pt)+rad*(v*math.cos(j*math.tau/sides)+w*math.sin(j*math.tau/sides)))
 for i in range(len(pts)-1):
  for j in range(sides):a=i*sides+j;b=i*sides+(j+1)%sides;fs.append((a,b,b+sides,a+sides))
 fs.append(tuple(reversed(range(sides))));fs.append(tuple((len(pts)-1)*sides+j for j in range(sides)))
 return mesh(name,vs,fs,m)

def lathe(name,profile,m):
 # Closed cross-section runs exterior -> rounded rim -> interior -> inner floor.
 vs=[];fs=[];N=48
 for r,z in profile:
  for j in range(N):a=j*math.tau/N;vs.append((r*math.cos(a),r*math.sin(a),z))
 for i in range(len(profile)-1):
  for j in range(N):a=i*N+j;b=i*N+(j+1)%N;fs.append((a,b,b+N,a+N))
 o=mesh(name,vs,fs,m);sub=o.modifiers.new('Continuous wheel thrown profile','SUBSURF');sub.levels=1;sub.render_levels=1
 return o

# Joinery: three actual tabletop boards, four tapered posts, housed aprons and shelf boards.
current=[]
for i in range(3):bevelbox('Top • separate board '+str(i+1),(0,(i-1)*.293,.879),(1.86,.289,.052),wood[i],.012)
for x in [-.765,.765]:
 for y in [-.305,.305]:
  o=bevelbox('Tapered square post',(x,y,.437),(.087,.087,.838),wood[1],.008)
  for v in o.data.vertices:
   factor=.77+.23*(v.co.z/.838+.5);v.co.x*=factor;v.co.y*=factor
  bevelbox('Foot collar',(x,y,.045),(.075,.075,.055),endwood,.004)
for y in [-.31,.31]:bevelbox('Housed long apron',(0,y,.788),(1.51,.045,.13),wood[0],.006)
for x in [-.77,.77]:bevelbox('End apron',(x,0,.788),(.045,.61,.13),wood[2],.006)
for i in range(3):bevelbox('Lower shelf board '+str(i),(0,(i-1)*.205,.243),(1.53,.201,.032),wood[(i+1)%4],.006)
for x in [-.76,.76]:bevelbox('Shelf bearer',(x,0,.209),(.048,.65,.044),endwood,.004)
# Small visible housed end joints / wooden pegs, actual geometry.
for x in [-.725,.725]:
 for z in [.768,.815]:
  bpy.ops.mesh.primitive_uv_sphere_add(segments=12,ring_count=6,radius=.006,location=(x,-.336,z));o=bpy.context.object;o.scale=(1,.22,1);finish(o,'Flush oak dowel',endwood)
components['table']=current

current=[]
lathe('Ivory cup • continuous interior and rolled rim',[(0,.006),(.045,.006),(.057,.009),(.063,.022),(.068,.048),(.069,.105),(.071,.134),(.070,.140),(.066,.143),(.062,.140),(.062,.132),(.060,.102),(.059,.047),(.052,.021),(.043,.018),(0,.018)],cream)
pts=[]
for i in range(33):a=-math.pi*.56+i/32*math.pi*1.12;pts.append((-.068-.054*math.cos(a),0,.077+.048*math.sin(a)))
tube('Cup • joined oval pulled handle',pts,.0095,cream,12)
components['cup']=current
current=[]
lathe('Celadon vase • hollow wheel profile',[(0,.004),(.058,.004),(.078,.011),(.101,.038),(.113,.081),(.108,.126),(.088,.162),(.055,.189),(.046,.213),(.046,.25),(.050,.258),(.049,.264),(.044,.267),(.039,.264),(.038,.256),(.039,.214),(.047,.192),(.080,.157),(.097,.123),(.101,.082),(.090,.045),(.066,.024),(0,.024)],celadon)
components['vase']=current

current=[]
# Physically connected branching flower cluster. Each branch starts on a parent stem.
for s in range(7):
 angle=s*2.399;R=.10+(.025*(s%3));height=.43+.045*(s%4)
 main=[(R*math.cos(angle)*(t**1.5),R*math.sin(angle)*(t**1.5),.21+height*t)for t in [i/16 for i in range(17)]]
 tube('Arching main stem '+str(s),main,.0026,stemmat)
 for k in range(5):
  t=.48+k*.105;root=Vector((R*math.cos(angle)*t**1.5,R*math.sin(angle)*t**1.5,.21+height*t));a=angle+k*1.6
  tip=root+Vector((.085*math.cos(a),.085*math.sin(a),.065+.015*(k%2)))
  pts=[root.lerp(tip,u)+Vector((0,0,.018*math.sin(math.pi*u)))for u in [i/8 for i in range(9)]]
  tube('Connected flower branch',pts,.00135,stemmat,6)
  # Five cupped petals have curved surfaces and thickness, not billboard planes.
  for j in range(5):
   a=j*math.tau/5;vs=[];fs=[]
   for row in range(7):
    u=row/6;w=.0085*math.sin(math.pi*u)**.7
    for col in range(5):
     v=(col/4-.5)*2;along=.003+.017*u;side=w*v
     vs.append(tip+Vector((along*math.cos(a)-side*math.sin(a),along*math.sin(a)+side*math.cos(a),.007*u*u+.003*v*v)))
   for row in range(6):
    for col in range(4):n=row*5+col;fs.append((n,n+1,n+6,n+5))
   o=mesh('Cupped ivory petal',vs,fs,petalmat);sol=o.modifiers.new('Petal thickness','SOLIDIFY');sol.thickness=.0007
  bpy.ops.mesh.primitive_uv_sphere_add(segments=8,ring_count=4,radius=.0035,location=tip);finish(bpy.context.object,'Pollen heart',heartmat)
 # Branching pointed leaves, curved broad medium surfaces.
 for k in range(2):
  t=.42+k*.18;p=Vector(main[round(t*16)]);a=angle+k*2;vs=[];fs=[]
  for i in range(13):
   u=i/12;w=.020*math.sin(math.pi*u);q=p+Vector((.10*u*math.cos(a),.10*u*math.sin(a),.025*math.sin(math.pi*u)))
   for v in [-1,0,1]:vs.append(q+Vector((-math.sin(a)*w*v,math.cos(a)*w*v,-.007*abs(v)*math.sin(math.pi*u))))
  for i in range(12):
   for j in range(2):n=i*3+j;fs.append((n,n+3,n+4,n+1))
  o=mesh('Connected lance leaf',vs,fs,green);sol=o.modifiers.new('Leaf body','SOLIDIFY');sol.thickness=.001
components['flowers']=current

current=[]
# A continuous thick runner: broad top ripples turn over the front edge and gather under gravity.
vs=[];fs=[];nx=32;ny=56
for j in range(ny+1):
 t=j/ny
 if t<.60:
  q=t/.60;y=.37-.777*q;z=.913
 elif t<.73:
  q=(t-.60)/.13;a=q*math.pi/2;y=-.407-.05*math.sin(a);z=.874+.039*math.cos(a)
 else:
  q=(t-.73)/.27;y=-.457-.018*math.sin(q*math.pi);z=.874-.375*q
 for i in range(nx+1):
  u=i/nx;x=(u-.5)*.53+.25
  fold=math.sin(u*math.pi*5+.4)+.32*math.sin(u*math.pi*9)
  if t<.6:dz=.0038*fold*(.4+.6*t/.6);dy=0
  else:dz=.003*fold;dy=.014*fold*min(1,(t-.6)/.23)
  hem=(.004*math.cos(u*math.pi*4))*max(0,(t-.95)/.05)
  vs.append((x,y+dy,z+dz+hem))
for j in range(ny):
 for i in range(nx):n=j*(nx+1)+i;fs.append((n,n+1,n+nx+2,n+nx+1))
o=mesh('Linen runner • continuous weighted fall',vs,fs,clothmat);so=o.modifiers.new('Actual 2 mm linen thickness','SOLIDIFY');so.thickness=.002;so.offset=0
be=o.modifiers.new('Soft hem edge','BEVEL');be.width=.0007;be.segments=2
components['cloth']=current

# Bake copies into one mesh per semantic component for reusable draw cost.
# Editable boards, profiles and petals remain separate in the .blend source.
def export_component(objects,path):
 bpy.context.view_layer.update();deps=bpy.context.evaluated_depsgraph_get();groups={};baked=[]
 for src in objects:
  data=bpy.data.meshes.new_from_object(src.evaluated_get(deps),preserve_all_data_layers=True,depsgraph=deps)
  o=bpy.data.objects.new(src.name+' export',data);bpy.context.collection.objects.link(o);o.matrix_world=src.matrix_world.copy()
  groups.setdefault(src['component'],[]).append(o)
 for key,group in groups.items():
  bpy.ops.object.select_all(action='DESELECT')
  for o in group:o.select_set(True)
  bpy.context.view_layer.objects.active=group[0];bpy.ops.object.join();o=group[0];o.name=key;o['component']=key;baked.append(o)
 bpy.ops.object.select_all(action='DESELECT')
 for o in baked:o.select_set(True)
 bpy.ops.export_scene.gltf(filepath=str(path),export_format='GLB',use_selection=True,export_apply=True,export_extras=True)
 for o in baked:bpy.data.objects.remove(o,do_unlink=True)

# Export reusable local-origin components, then the example assembly.
for key,objects in components.items():
 bpy.ops.object.select_all(action='DESELECT')
 for o in objects:o.select_set(True);o['component']='asset-foundation-v1/'+key
 bpy.context.view_layer.objects.active=objects[0]
 export_component(objects,OUT/(key+'.glb'))
# Non-destructive component placements; floor contact stays z=0.
for key,offset in [('cup',(.58,-.14,.908)),('vase',(-.35,.08,.908)),('flowers',(-.35,.08,.908))]:
 for o in components[key]:o.location+=Vector(offset)
export_component([o for group in components.values() for o in group],OUT/'display-set.glb')
bpy.ops.wm.save_as_mainfile(filepath=str(SRC/'display-set.blend'))
receipt={'id':'asset-foundation-v1','units':'metres','base':'78fbae7f519e4c443d5971bb18208e1c4f9de64e','originalTargetSha256':'9f855d2ecfd120bb45c001db3fa9b5a3e3b58b2b3c2a4cf9e7ebfda84f8f7114','components':{k:len(v)for k,v in components.items()},'rebuild':'blender -b -t 2 --python tools/asset-foundation/build.py','limitations':['First component prototype; no art acceptance','Restrained oak grain only; silhouette and medium surfaces first','No character or whole-shop reconstruction']}
(SRC/'manifest.json').write_text(json.dumps(receipt,indent=2)+'\n')
