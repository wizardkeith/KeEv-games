"""Paper/display foundation v1 R2. Group hierarchy only; R4 frozen.
blender -b -t 2 --python tools/asset-foundation/build-paper.py
Metres, Blender Z-up -> standard glTF RH Y-up. No SKU or save changes.
"""
import bpy, math, json, hashlib
from mathutils import Vector
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'public/assets/asset-foundation-paper-v1';SRC=ROOT/'assets/authoring/asset-foundation-paper-v1'
OUT.mkdir(parents=True,exist_ok=True);SRC.mkdir(parents=True,exist_ok=True)
bpy.context.preferences.filepaths.save_version=0
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
R4=ROOT/'assets/authoring/asset-foundation-v1/display-set.blend'
with bpy.data.libraries.load(str(R4),link=False) as (source,target):
 target.materials=[n for n in source.materials if n.startswith('Honey oak •')]
wood=[bpy.data.materials['Honey oak • board '+str(i)]for i in range(4)]
endwood=bpy.data.materials['Honey oak • end grain']
def material(name,color,rough):
 m=bpy.data.materials.new(name);m.use_nodes=True;m.diffuse_color=(*color,1)
 p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*color,1);p.inputs['Roughness'].default_value=rough
 return m
paper=material('Cream uncoated paper',(.74,.71,.64),.92)
pages=material('Warm cut page edges',(.69,.66,.58),.90)
covers=[material('Sage cloth book cover',(.19,.29,.24),.79),material('Dusty rose book cover',(.43,.255,.20),.82),material('Oat linen book cover',(.48,.425,.32),.86)]
components={};current=[];assembly={}
def finish(o,name,m):
 o.name=name;o.data.materials.append(m);current.append(o);return o

def box(name,loc,dim,m,r=.003):
 bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.scale=dim;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 axis=max(range(3),key=lambda k:dim[k]);uv=o.data.uv_layers.active
 for poly in o.data.polygons:
  normal_axis=max(range(3),key=lambda k:abs(poly.normal[k]));end=normal_axis==axis
  transverse=next(k for k in range(3) if k!=axis and k!=normal_axis)if not end else (axis+1)%3
  second=(axis+2)%3 if end else transverse
  for li in poly.loop_indices:
   v=o.data.vertices[o.data.loops[li].vertex_index].co
   uv.data[li].uv=(v[transverse]/dim[transverse]+.5,v[second]/dim[second]+.5)if end else(v[axis]/dim[axis]+.5,v[second]/dim[second]+.5)
 bevel=o.modifiers.new('Soft practical edge','BEVEL');bevel.width=min(r,min(dim)*.40);bevel.segments=2
 normal=o.modifiers.new('Broad face normals','WEIGHTED_NORMAL');normal.keep_sharp=True
 finish(o,name,m)
 if m in wood:
  o.data.materials.append(endwood)
  for p in o.data.polygons:
   if abs(p.normal[axis])>.9:p.material_index=1
 return o

def mesh(name,verts,faces,m,smooth=False):
 d=bpy.data.meshes.new(name);d.from_pydata(verts,[],faces);d.update();o=bpy.data.objects.new(name,d);bpy.context.collection.objects.link(o)
 for p in d.polygons:p.use_smooth=smooth
 return finish(o,name,m)

def move(objects,offset,yaw=0):
 c=math.cos(yaw);s=math.sin(yaw)
 for o in objects:
  x,y,z=o.location;o.location=(x*c-y*s+offset[0],x*s+y*c+offset[1],z+offset[2]);o.rotation_euler.z+=yaw

def book(name,w,d,h,m):
 objects_before=len(current);cover=min(.0025,h*.12);spine=.006
 box(name+' • lower overhanging cover',(0,0,cover/2),(w,d,cover),m,.001)
 box(name+' • cut paper body',(.002,0,h/2),(w-.010,d-.007,h-2*cover),pages,.0013)
 box(name+' • upper overhanging cover',(0,0,h-cover/2),(w,d,cover),m,.001)
 # Continuous rounded binding shell joins the two covers; physical paper inset.
 n=10;profile=[]
 for inner in [False,True]:
  for i in range(n+1):
   a=-math.pi/2+i*math.pi/n;rx=spine-(cover if inner else 0);rz=h/2-(cover if inner else 0)
   profile.append((-w/2+spine-rx*math.cos(a),h/2+rz*math.sin(a)))
 N=len(profile);vs=[(x,y,z)for y in [-d/2+.001,d/2-.001]for x,z in profile];fs=[]
 # Reverse inner arc to form a closed thin U section at each end.
 order=list(range(n+1))+list(reversed(range(n+1,2*n+2)))
 for i in range(len(order)):
  a=order[i];b=order[(i+1)%len(order)];fs.append((a,b,b+N,a+N))
 fs.append(tuple(reversed(order)));fs.append(tuple(x+N for x in order))
 mesh(name+' • rounded binding',vs,fs,m,True)
 return current[objects_before:]

# R2: experimental 43% of R4 table width; height/board thickness remain v1.
# Lower tray/paper move forward and laterally; four reviewed standalone props freeze.
current=[]
for i,y in enumerate([-.01025,.12025]):box('Riser top • separate board '+str(i),(0,y,.248),(.80,.1295,.024),wood[i],.004)
for x in [-.365,.365]:
 for y in [-.065,.155]:box('Riser foot/post',(x,y,.118),(.027,.027,.236),wood[1],.003)
for y in [-.065,.155]:box('Riser housed bearer',(0,y,.220),(.73,.022,.032),wood[0],.0025)
components['tiered-riser']=current

current=[]
box('Tray • continuous bottom',(0,0,.006),(.46,.27,.012),wood[2],.0025)
for y in [-.1305,.1305]:box('Tray • long rim',(0,y,.024),(.46,.009,.024),wood[0],.002)
for x in [-.2255,.2255]:box('Tray • end rim',(x,0,.024),(.009,.252,.024),wood[1],.002)
components['shallow-tray']=current

current=[];level=0
specs=[(.305,.225,.030,1,(0,0),-.018),(.285,.205,.013,2,(.003,-.003),.026),(.300,.215,.021,0,(-.004,.004),-.038)]
for i,(w,d,h,mi,xy,yaw)in enumerate(specs):
 objects=book('Notebook '+str(i+1),w,d,h,covers[mi]);move(objects,(xy[0],xy[1],level),yaw);level+=h
components['book-stack']=current

current=[]
box('Memo block • cream paper mass',(0,0,.010),(.130,.180,.020),pages,.0014)
for i,(x,y,a)in enumerate([(.001,-.001,-.018),(-.002,.001,.026),(.003,-.002,-.040)]):
 o=box('Loose paper leaf '+str(i),(x,y,.020+(i+.5)*.00065),(.133,.183,.00065),paper,.00022);o.rotation_euler.z=a
components['paper-stack']=current

current=[]
# A folded greeting card: two real 0.8mm panels and a softened continuous fold.
w=.085;height=.118;half=.036
profile=[(-half,0),(-.003,height-.002),(0,height),(.003,height-.002),(half,0)]
vs=[(x,y,z)for x in [-w/2,w/2]for y,z in profile];fs=[(i,i+1,i+6,i+5)for i in range(4)]
o=mesh('Folded cream card • real panels',vs,fs,paper,True);thick=o.modifiers.new('Paper thickness','SOLIDIFY');thick.thickness=.0008;thick.offset=0
components['folded-card']=current

# Evaluate contact bases of complete components; retain physical origins for reuse.
contacts={}
for key,objects in components.items():
 bpy.context.view_layer.update();deps=bpy.context.evaluated_depsgraph_get();minimum=float('inf')
 for o in objects:
  e=o.evaluated_get(deps);data=e.to_mesh();minimum=min(minimum,min((o.matrix_world@v.co).z for v in data.vertices));e.to_mesh_clear()
 for o in objects:o.location.z-=minimum;o['component']='paper-foundation-v1/'+key
 contacts[key]=minimum

def export(objects,path):
 bpy.context.view_layer.update();deps=bpy.context.evaluated_depsgraph_get();groups={};baked=[]
 for src in objects:
  d=bpy.data.meshes.new_from_object(src.evaluated_get(deps),preserve_all_data_layers=True,depsgraph=deps);o=bpy.data.objects.new(src.name+' export',d);bpy.context.collection.objects.link(o);o.matrix_world=src.matrix_world.copy();groups.setdefault(src['component'],[]).append(o)
 for key,items in groups.items():
  bpy.ops.object.select_all(action='DESELECT')
  for o in items:o.select_set(True)
  bpy.context.view_layer.objects.active=items[0];bpy.ops.object.join();o=items[0];o.name=key;o['component']=key;baked.append(o)
 bpy.ops.object.select_all(action='DESELECT')
 for o in baked:o.select_set(True)
 bpy.ops.export_scene.gltf(filepath=str(path),export_format='GLB',use_selection=True,export_apply=True,export_extras=True)
 for o in baked:bpy.data.objects.remove(o,do_unlink=True)

for key,objects in components.items():export(objects,OUT/(key+'.glb'))
placements={'tiered-riser':((-.05,.060,0),0),'shallow-tray':((.22,-.230,0),0),
 'book-stack':((-.17,.115,.260),-.035),'paper-stack':((.22,-.250,.012),.018),
 'folded-card':((.22,.105,.260),-.12)}
for key,(position,yaw)in placements.items():move(components[key],position,yaw)
export([o for group in components.values()for o in group],OUT/'paper-display-set.glb')
bpy.ops.wm.save_as_mainfile(filepath=str(SRC/'paper-display-set.blend'))
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
(SRC/'manifest.json').write_text(json.dumps({'id':'paper-foundation-v1','units':'metres','axes':'glTF RH Y-up','reference':'Approved_Visual_Target_Misaki.png','referenceSha256':'9f855d2ecfd120bb45c001db3fa9b5a3e3b58b2b3c2a4cf9e7ebfda84f8f7114','R4FrozenSource':'70746f7269bf4b1ac27e1eed87146532cf413866','R4BlendSha256':sha(R4),'contactNormalization':contacts,'placements':placements,'books':specs,'limits':['Decorative prototype, no inventory grant','R4 main-shape gate passed; overall style not accepted','No new lighting, whole-shop assembly, character or release'],'rebuild':'blender -b -t 2 --python tools/asset-foundation/build-paper.py'},indent=2)+'\n')
