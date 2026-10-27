"""Fixed-seed Blender authoring. Metres; Blender Z-up -> glTF RH Y-up.
Run: blender -b -t 2 --python tools/asset-foundation/build.py
Each component is independently reusable; assembly placements live only in this source.
"""
import bpy, math, random, json, os
from mathutils import Vector, Quaternion
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
rgba=np.ones((size,size,4),dtype=np.float32)
def image_from_array(name,array,file,noncolor=False):
 image=bpy.data.images.new(name,width=size,height=size)
 if noncolor:image.colorspace_settings.name='Non-Color'
 image.pixels.foreach_set(array.ravel());image.filepath_raw=str(SRC/file);image.file_format='PNG';image.save();image.pack();return image

def smooth_noise(cols,rows,seed):
 rng=np.random.default_rng(seed);values=rng.uniform(-1,1,(rows+1,cols+1));x=xx*cols;y=yy*rows
 ix=np.minimum(x.astype(int),cols-1);iy=np.minimum(y.astype(int),rows-1);tx=x-ix;ty=y-iy
 tx=tx*tx*(3-2*tx);ty=ty*ty*(3-2*ty)
 return (values[iy,ix]*(1-tx)+values[iy,ix+1]*tx)*(1-ty)+(values[iy+1,ix]*(1-tx)+values[iy+1,ix+1]*tx)*ty

def board_field(seed):
 # Broad anisotropic fibres and a few unequal/tapered growth paths, not a
 # periodic sine barcode repeated on every plank.
 rng=np.random.default_rng(seed);field=.974+.024*smooth_noise(3,7,seed)+.012*smooth_noise(6,23,seed+1)
 for j in range(11):
  base=rng.uniform(-.08,1.08);bend=rng.uniform(-.16,.16);phase=rng.uniform(0,math.tau)
  center=base+bend*((xx-rng.uniform(.2,.8))**2-.12)+.014*np.sin(xx*rng.uniform(3,8)+phase)
  width=rng.uniform(.003,.011)*(.7+.3*np.cos(xx*5+phase))
  weight=.35+.65*np.exp(-((xx-rng.uniform(.2,.8))/rng.uniform(.25,.7))**2)
  field-=rng.uniform(.015,.037)*np.exp(-((yy-center)/width)**2)*weight
 return np.clip(field,.86,1.025)

grain=board_field(71)
for k in range(3):rgba[:,:,k]=np.clip(grain,0,1)
img=image_from_array('Authored broad natural oak grain',rgba,'oak-grain.png')
wood_colors=[(.55,.29,.105),(.52,.275,.104),(.57,.314,.127),(.54,.288,.117)]
wood_roughness=[.44,.48,.42,.46]
wood=[mat('Honey oak • board '+str(i),color,wood_roughness[i])for i,color in enumerate(wood_colors)]
for i,m in enumerate(wood):
 grain=board_field(71+103*i);nodes=m.node_tree.nodes;tex=nodes.new('ShaderNodeTexImage');tinted=rgba.copy();color=m.diffuse_color[:3]
 for k in range(3):tinted[:,:,k]=np.clip(grain*(1.055*color[k]**(1/2.4)-.055),0,1)
 tex.image=image_from_array(m.name+' natural grain',tinted,'oak-board-'+str(i)+'.png')
 m.node_tree.links.new(tex.outputs['Color'],nodes.get('Principled BSDF').inputs['Base Color'])
 orm=rgba.copy();orm[:,:,0]=1;orm[:,:,1]=np.clip(wood_roughness[i]+.035*smooth_noise(3,7,900+i)+.012*smooth_noise(7,21,1300+i),.37,.56);orm[:,:,2]=0
 ot=nodes.new('ShaderNodeTexImage');ot.image=image_from_array(m.name+' board surface',orm,'oak-orm-'+str(i)+'.png',True)
 split=nodes.new('ShaderNodeSeparateColor');m.node_tree.links.new(ot.outputs['Color'],split.inputs[0]);m.node_tree.links.new(split.outputs['Green'],nodes.get('Principled BSDF').inputs['Roughness'])
endwood=mat('Honey oak • end grain',(.49,.27,.108),.48)
endradius=np.sqrt(((xx-.28)*.8)**2+((yy-.57)*1.15)**2)
endvalue=.96+.025*np.sin(endradius*math.tau*22+.24*np.sin(xx*9))
endrgba=rgba.copy()
for k,c in enumerate(endwood.diffuse_color[:3]):endrgba[:,:,k]=np.clip(endvalue*(1.055*c**(1/2.4)-.055),0,1)
tex=endwood.node_tree.nodes.new('ShaderNodeTexImage');tex.image=image_from_array('Cut oak end grain',endrgba,'oak-end-grain.png')
endwood.node_tree.links.new(tex.outputs['Color'],endwood.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])
cream=mat('Warm ivory glaze',(.86,.816,.687),.27,.24)
celadon=mat('Celadon glaze',(.247,.423,.355),.29,.26)
clothmat=mat('Warm white woven linen',(.66,.64,.59),.89)
# One18cm repeating weave tile; low relief and low colour contrast, plus
# restrained irregular flax surface. The same real material is used in every view.
warp=.5+.5*np.cos(math.tau*64*xx+.12*np.sin(math.tau*3*yy))
weft=.5+.5*np.cos(math.tau*64*yy+.10*np.sin(math.tau*4*xx))
over=np.sin(math.tau*32*xx)*np.sin(math.tau*32*yy)
fibre=.994+.006*(warp+weft-1)+.008*smooth_noise(7,9,181)
linen=rgba.copy()
for k,c in enumerate(clothmat.diffuse_color[:3]):linen[:,:,k]=np.clip(fibre*(1.055*c**(1/2.4)-.055),0,1)
nodes=clothmat.node_tree.nodes;tex=nodes.new('ShaderNodeTexImage');tex.image=image_from_array('Warm flax colour',linen,'linen-color.png');clothmat.node_tree.links.new(tex.outputs['Color'],nodes.get('Principled BSDF').inputs['Base Color'])
orm=rgba.copy();orm[:,:,0]=1;orm[:,:,1]=np.clip(.88+.05*smooth_noise(5,6,183)+.035*(warp-weft)+.02*over,.80,.96);orm[:,:,2]=0
tex=nodes.new('ShaderNodeTexImage');tex.image=image_from_array('Linen roughness',orm,'linen-orm.png',True);split=nodes.new('ShaderNodeSeparateColor');clothmat.node_tree.links.new(tex.outputs['Color'],split.inputs[0]);clothmat.node_tree.links.new(split.outputs['Green'],nodes.get('Principled BSDF').inputs['Roughness'])
height=.00008*(.6*warp+.4*weft)+.000025*over
gx=np.gradient(height,axis=1)*size/.18;gy=np.gradient(height,axis=0)*size/.18
normal=np.stack((-gx,-gy,np.ones_like(gx)),axis=2);normal/=np.linalg.norm(normal,axis=2)[:,:,None]
normalrgba=rgba.copy();normalrgba[:,:,:3]=normal*.5+.5
tex=nodes.new('ShaderNodeTexImage');tex.image=image_from_array('Restrained flax relief',normalrgba,'linen-normal.png',True);normalmap=nodes.new('ShaderNodeNormalMap');normalmap.inputs['Strength'].default_value=.65;clothmat.node_tree.links.new(tex.outputs['Color'],normalmap.inputs['Color']);clothmat.node_tree.links.new(normalmap.outputs[0],nodes.get('Principled BSDF').inputs['Normal'])
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
 uv=o.data.uv_layers.active;long_axis=max(range(3),key=lambda k:dim[k])
 for poly in o.data.polygons:
  normal_axis=max(range(3),key=lambda k:abs(poly.normal[k]));end=normal_axis==long_axis
  transverse=next(k for k in range(3) if k!=long_axis and k!=normal_axis) if not end else (long_axis+1)%3
  second=(long_axis+2)%3 if end else transverse
  for li in poly.loop_indices:
   v=o.data.vertices[o.data.loops[li].vertex_index].co
   uv.data[li].uv=((v[transverse]/dim[transverse]+.5,v[second]/dim[second]+.5) if end else (v[long_axis]/dim[long_axis]+.5,v[second]/dim[second]+.5))
 b=o.modifiers.new('Refined edge radius','BEVEL');b.width=r;b.segments=4
 b.profile=.5
 n=o.modifiers.new('Board face normals','WEIGHTED_NORMAL');n.keep_sharp=True;n.weight=50
 finish(o,name,m)
 if m in wood:
  o.data.materials.append(endwood)
  for poly in o.data.polygons:
   if abs(poly.normal[long_axis])>.9:poly.material_index=1
 return o

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
for i in range(3):bevelbox('Top • separate board '+str(i+1),(0,(i-1)*.347,.874),(1.86,.343,.062),wood[i],.011)
for x in [-.765,.765]:
 for y in [-.382,.382]:
  o=bevelbox('Tapered square post',(x,y,.428),(.102,.102,.856),wood[1],.008)
  for v in o.data.vertices:
   factor=.84+.16*(v.co.z/.856+.5);v.co.x*=factor;v.co.y*=factor
  bevelbox('Foot collar',(x,y,.028),(.090,.090,.056),wood[0],.004)
for y in [-.382,.382]:bevelbox('Housed long apron',(0,y,.776),(1.51,.055,.145),wood[0],.006)
for x in [-.77,.77]:bevelbox('End apron',(x,0,.776),(.055,.764,.145),wood[2],.006)
for i in range(3):bevelbox('Lower shelf board '+str(i),(0,(i-1)*.265,.243),(1.53,.261,.032),wood[(i+1)%4],.006)
for x in [-.76,.76]:bevelbox('Shelf bearer',(x,0,.209),(.058,.81,.044),wood[1],.004)
for x in [-.725,.725]:
 for z in [.742,.800]:
  bpy.ops.mesh.primitive_uv_sphere_add(segments=12,ring_count=6,radius=.006,location=(x,-.411,z));o=bpy.context.object;o.scale=(1,.22,1);finish(o,'Flush oak dowel',endwood)
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
# Seven low arching supports carry a broad, layered crown. Same35 heads and
# same175 petals; branches/leaves are released with the crown, not held tall.
stem_crowns=[(-.205,.020,.385),(-.130,-.015,.410),(-.065,.045,.425),(-.015,0,.415),
             (.020,.055,.420),(.080,-.030,.395),(.190,.015,.370)]
head_band_x=[-.014,.020,-.025,.010,.025]
head_band_y=[-.065,.065,-.015,.035,-.045]
head_band_z=[.368,.430,.405,.390,.415]
for s in range(7):
 center=Vector(stem_crowns[s]);end=center+Vector((0,0,-.016))
 root=Vector((.006*math.sin(s*1.7),.006*math.cos(s*1.9),.21))
 c1=Vector((root.x+.002*math.sin(s),root.y+.002*math.cos(s),.295))
 c2=Vector((end.x*.72,end.y*.72,end.z-.018))
 def main_at(t):return root*(1-t)**3+c1*3*(1-t)**2*t+c2*3*(1-t)*t*t+end*t**3
 main=[main_at(i/16)for i in range(17)];tube('Low arching crown support '+str(s),main,.0018,stemmat)
 for k in range(5):
  # Interleaved front/back/height bands bridge the seven supports instead of
  # hiding five coincident heads at each tip or making seven separate tufts.
  x=center.x+head_band_x[k]+.006*math.sin(s*1.7+k)
  dome=.025*math.sqrt(max(0,1-(x/.25)**2))
  tip=Vector((x,head_band_y[k]+center.y*.2,head_band_z[k]+dome+.007*math.sin(s*1.9+k)))
  branch_root=main_at(.69+k*.06)
  pts=[branch_root.lerp(tip,u)+Vector((0,0,.008*math.sin(math.pi*u)))for u in [i/8 for i in range(9)]]
  tube('Connected short crown branch',pts,.00095,stemmat,6)
  head_index=s*5+k;kind=(head_index*7+head_index//5)%5
  head_scale=1.15*[1.25,1.10,.95,1.20,.82][kind];opening=[1.0,.82,.92,.70,.50][kind]
  tilt=[.12,.48,-.28,.40,-.52][kind]
  rotation=Vector((tilt+.14*math.sin(head_index*1.2),.40*math.cos(head_index*1.7),1)).normalized().to_track_quat('Z','Y')@Quaternion(Vector((0,0,1)),head_index*.73)
  # Same five petals and topology. Elliptic shoulder/cap, unequal opening and
  # cupping replace the pointed, equally open radial star silhouette.
  for j in range(5):
   a=j*math.tau/5+.08*math.sin(head_index*1.3+j);vs=[];fs=[]
   for row in range(7):
    u=row/6;lengthwise=(1-math.cos(math.pi*u))*.5
    w=.0108*head_scale*math.sin(math.pi*u)**.85*(.48+.52*opening)*(1+.09*math.sin(j*2.7+head_index))
    for col in range(5):
     v=(col/4-.5)*2;along=head_scale*(.0015+.017*lengthwise*opening);side=w*v
     lift=head_scale*((.006+.012*(1-opening))*lengthwise**1.4+.0025*v*v*math.sin(math.pi*u)+.0012*math.sin(head_index+j)*lengthwise)
     vs.append(tip+rotation@Vector((along*math.cos(a)-side*math.sin(a),along*math.sin(a)+side*math.cos(a),lift)))
   for row in range(6):
    for col in range(4):index=row*5+col;fs.append((index,index+1,index+6,index+5))
   o=mesh('Rounded unequal ivory petal',vs,fs,petalmat);sol=o.modifiers.new('Petal thickness','SOLIDIFY');sol.thickness=.0007
  bpy.ops.mesh.primitive_uv_sphere_add(segments=8,ring_count=4,radius=.0035*head_scale,location=tip);finish(bpy.context.object,'Pollen heart',heartmat)
 for k in range(2):
  p=main_at(.60+k*.17);a=math.atan2(end.y,end.x)+(-.65 if k==0 else .78);vs=[];fs=[]
  length=[.045,.055][k];width=.010+.0015*(s%2)
  for i in range(13):
   u=i/12;w=width*math.sin(math.pi*u);q=p+Vector((length*u*math.cos(a),length*u*math.sin(a),.016*math.sin(math.pi*u)-(.022+.008*k)*u*u))
   for v in [-1,0,1]:vs.append(q+Vector((-math.sin(a)*w*v,math.cos(a)*w*v,-.006*abs(v)*math.sin(math.pi*u))))
  for i in range(12):
   for j in range(2):index=i*3+j;fs.append((index,index+3,index+4,index+1))
  o=mesh('Low outward crown leaf',vs,fs,green);sol=o.modifiers.new('Leaf body','SOLIDIFY');sol.thickness=.001
components['flowers']=current

current=[]
# A rotated rectangular linen sheet, supported by the tabletop and a rounded
# front edge. Each material column reaches the edge at a different flat-sheet
# position; the free hem therefore falls on a real diagonal, not a strip.
vs=[];fs=[];cloth_uv=[];nx=32;ny=56
angle=math.radians(20);ca=math.cos(angle);sa=math.sin(angle)
cx=.20;cy=-.23;sheet_width=.60;back=.62;front=-.68;edge=-.5075;radius=.0135
pin=.24;arc_length=radius*math.pi/2

def gather_height(x,y):
 distance=y-edge
 g1=.045*math.exp(-((x-.20)/.065)**2);g2=.018*math.exp(-((x-.31)/.055)**2)
 diagonal=.028*math.exp(-((x-(pin-.38*distance))/.070)**2)*math.exp(-((distance-.28)/.30)**2)
 return (g1+g2)*math.exp(-(distance/.17)**2)+diagonal

for j in range(ny+1):
 v=j/ny
 for i in range(nx+1):
  u=i/nx;s=(u-.5)*sheet_width
  t_edge=(edge-cy-s*sa)/ca;x_edge=cx+s*ca-t_edge*sa
  compression=-(x_edge-pin)*.14*math.exp(-((x_edge-pin)/.21)**2)
  edge_lift=gather_height(x_edge+compression,edge)
  if v<.60:
   q=v/.60;t=back+(t_edge-back)*q;y=cy+s*sa+t*ca;x=cx+s*ca-t*sa
   x-=(x-pin)*.14*math.exp(-((x-pin)/.21)**2)*math.exp(-((y-edge)/.15)**2)
   z=.9075+gather_height(x,y)
  elif v<.73:
   q=(v-.60)/.13;a=q*math.pi/2;flat_y=edge-radius*a;t=(flat_y-cy-s*sa)/ca
   x=cx+s*ca-t*sa+compression;y=edge-(radius+edge_lift)*math.sin(a);z=.894+(radius+edge_lift)*math.cos(a)
  else:
   q=(v-.73)/.27;front_y=cy+s*sa+front*ca;hang=edge-front_y-arc_length
   flat_y=edge-arc_length-q*hang;t=(flat_y-cy-s*sa)/ca
   x=cx+s*ca-t*sa+compression*math.exp(-2.3*q)+.025*q*q*(u-.5)
   bulge=.035*q*(1-q)*math.exp(-((u-.62)/.40)**2)
   curl=.010*q**5*(math.exp(-((u-.07)/.15)**2)+.6*math.exp(-((u-.90)/.18)**2))
   y=edge-radius-edge_lift*(1-.30*q)-bulge-curl
   relaxed=q**4*(.020*(2*u-1)**2-.055*math.exp(-((u-.32)/.22)**2)+.025*math.exp(-((u-.85)/.17)**2))
   z=.894-q*hang+relaxed
  vs.append((x,y,z));cloth_uv.append(((s+sheet_width/2)/.18,(t-front)/.18))
for j in range(ny):
 for i in range(nx):index=j*(nx+1)+i;fs.append((index,index+1,index+nx+2,index+nx+1))
o=mesh('Linen sheet • diagonal pull and relaxed unequal hem',vs,fs,clothmat)
uv=o.data.uv_layers.new(name='Unstrained linen weave')
for poly in o.data.polygons:
 for li in poly.loop_indices:uv.data[li].uv=cloth_uv[o.data.loops[li].vertex_index]
so=o.modifiers.new('Actual 2 mm linen thickness','SOLIDIFY');so.thickness=.002;so.offset=0
# The real2mm solidified edge needs no sub-pixel bevel geometry.
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
  bpy.context.view_layer.objects.active=group[0];bpy.ops.object.join();o=group[0];o.name=key;o['component']=key
  if key.endswith('/flowers'):
   for layer in list(o.data.uv_layers):o.data.uv_layers.remove(layer) # untextured, no tangent basis required
  baked.append(o)
 bpy.ops.object.select_all(action='DESELECT')
 for o in baked:o.select_set(True)
 bpy.ops.export_scene.gltf(filepath=str(path),export_format='GLB',use_selection=True,export_apply=True,export_extras=True,export_tangents=True)
 for o in baked:bpy.data.objects.remove(o,do_unlink=True)

# Set component contact origins from evaluated geometry, not raw lathe controls.
contact_normalization={}
for key in ['table','cup','vase']:
 bpy.context.view_layer.update();deps=bpy.context.evaluated_depsgraph_get();lowest=float('inf')
 for o in components[key]:
  evaluated=o.evaluated_get(deps);data=evaluated.to_mesh()
  lowest=min(lowest,min((o.matrix_world@v.co).z for v in data.vertices));evaluated.to_mesh_clear()
 for o in components[key]:o.location.z-=lowest
 contact_normalization[key]=lowest

# Export reusable local-origin components, then the example assembly.
for key,objects in components.items():
 bpy.ops.object.select_all(action='DESELECT')
 for o in objects:o.select_set(True);o['component']='asset-foundation-v1/'+key
 bpy.context.view_layer.objects.active=objects[0]
 export_component(objects,OUT/(key+'.glb'))
# Non-destructive component placements; floor contact stays z=0.
for key,offset in [('cup',(.58,-.14,.905)),('vase',(-.35,.08,.905)),('flowers',(-.35,.08,.905))]:
 for o in components[key]:o.location+=Vector(offset)
export_component([o for group in components.values() for o in group],OUT/'display-set.glb')
bpy.ops.wm.save_as_mainfile(filepath=str(SRC/'display-set.blend'))
receipt={'id':'asset-foundation-v1','units':'metres','base':'78fbae7f519e4c443d5971bb18208e1c4f9de64e','originalTargetSha256':'9f855d2ecfd120bb45c001db3fa9b5a3e3b58b2b3c2a4cf9e7ebfda84f8f7114','revision':'r4-wide-crown-diagonal-drape','contactNormalizationMetres':contact_normalization,'tableTopY':.905,'flowerHeads':35,'petals':175,'flowerClusterHeadCounts':[25,5,5],'relativeHeadScaleFactor':1.15,'stemCrownCenters':stem_crowns,'clothSheetAngleDegrees':20,'headSizeVariants':[1.25,1.10,.95,1.20,.82],'headOpeningVariants':[1.0,.82,.92,.70,.50],'linenBaseLinear':[.66,.64,.59],'components':{k:len(v)for k,v in components.items()},'rebuild':'blender -b -t 2 --python tools/asset-foundation/build.py','limitations':['First component prototype; no art acceptance','Restrained oak grain only; silhouette and medium surfaces first','No character or whole-shop reconstruction']}
(SRC/'manifest.json').write_text(json.dumps(receipt,indent=2)+'\n')
