"""Canonical-original-only Misaki grayform, not a production rig replacement.
PlanB consumer-local transfer failed before pixels were available. No unseen
side/back sheet is traced; those volumes are explicitly inferred. Blender Z-up,
front -Y, own LEFT +X; glTF Y-up, front +Z, own LEFT +X.
"""
import bpy, math, json, hashlib
from mathutils import Vector
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
SRC=ROOT/'assets/authoring/misaki-grayform-v1';OUT=ROOT/'public/assets/misaki-grayform-v1'
SRC.mkdir(parents=True,exist_ok=True);OUT.mkdir(parents=True,exist_ok=True)
bpy.context.preferences.filepaths.save_version=0
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
def clay(name,value):
 m=bpy.data.materials.new(name);m.diffuse_color=(value,value,value,1);m.use_nodes=True
 p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(value,value,value,1);p.inputs['Roughness'].default_value=1;p.inputs['Specular IOR Level'].default_value=.15
 return m
skin=clay('Gray clay / face and skin',.38);hair=clay('Gray clay / hair mass',.24)
cloth=clay('Gray clay / cardigan',.32);apron=clay('Gray clay / apron',.40);skirt=clay('Gray clay / skirt and shoes',.29)
eye=clay('Gray clay / eye volume',.52);feature=clay('Gray clay / feature placement',.10)
objects=[]
def mesh(name,vs,fs,mat,sub=1,thick=0):
 d=bpy.data.meshes.new(name+' editable quads');d.from_pydata(vs,[],fs);d.update();o=bpy.data.objects.new(name,d);bpy.context.collection.objects.link(o);o.data.materials.append(mat)
 for p in d.polygons:p.use_smooth=True
 bpy.context.view_layer.objects.active=o;o.select_set(True);bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.mesh.normals_make_consistent(inside=False);bpy.ops.object.mode_set(mode='OBJECT');o.select_set(False)
 if sub:m=o.modifiers.new('Editable broad form subdivision','SUBSURF');m.levels=sub;m.render_levels=sub
 if thick:m=o.modifiers.new('Real garment thickness','SOLIDIFY');m.thickness=thick;m.offset=0
 o['stage']='proportion grayform; no final topology/rig acceptance';objects.append(o);return o
def sample(controls,t):
 p=t*(len(controls)-1);i=min(len(controls)-2,int(p));u=p-i
 a,b,c,d=[controls[max(0,min(len(controls)-1,j))]for j in(i-1,i,i+1,i+2)]
 return [((2*b[k])+(-a[k]+c[k])*u+(2*a[k]-5*b[k]+4*c[k]-d[k])*u*u+(-a[k]+3*b[k]-3*c[k]+d[k])*u*u*u)/2 for k in range(len(b))]
def connect(rows,cols,wrap=True):
 return [(i*cols+j,i*cols+(j+1)%cols,(i+1)*cols+(j+1)%cols,(i+1)*cols+j)for i in range(rows-1)for j in range(cols if wrap else cols-1)]
def loft(name,profile,mat,rows=12,cols=24,sub=1,fold=False):
 vs=[]
 for i in range(rows):
  z,rx,ry,cy=sample(profile,i/(rows-1))
  for j in range(cols):
   a=j*math.tau/cols;f=0
   if fold:
    for angle,amp,width in [(-.6,.006,.28),(.45,-.004,.35),(1.9,.005,.44),(-2.2,-.003,.40)]:
     delta=math.atan2(math.sin(a-angle),math.cos(a-angle));f+=amp*math.exp(-(delta/width)**2)*(1-i/(rows-1))
   vs.append((math.sin(a)*(rx+f),cy-math.cos(a)*(ry+f),z+.003*math.sin(a*3+.2)*(1-i/(rows-1))if fold else z))
 fs=connect(rows,cols);fs.extend([tuple(reversed(range(cols))),tuple((rows-1)*cols+j for j in range(cols))])
 return mesh(name,vs,fs,mat,sub)
def tube(name,path,radii,mat,cols=10,sub=1):
 vs=[]
 for i,c in enumerate(path):
  tangent=Vector(path[min(i+1,len(path)-1)])-Vector(path[max(0,i-1)]);tangent.normalize();u=tangent.cross(Vector((0,1,0))).normalized();v=tangent.cross(u).normalized()
  rx,ry=radii[i]if isinstance(radii[i],tuple)else(radii[i],radii[i])
  for j in range(cols):
   a=j*math.tau/cols;vs.append(Vector(c)+u*rx*math.cos(a)+v*ry*math.sin(a))
 fs=connect(len(path),cols);fs.extend([tuple(reversed(range(cols))),tuple((len(path)-1)*cols+j for j in range(cols))]);return mesh(name,vs,fs,mat,sub)

# R5 freezes the full R3 face/eye/ear/neck section and replaces hair only.
frozen_head=(ROOT/'tools/asset-foundation/misaki-head-neck-r3.py').read_text()
exec(compile(frozen_head[:frozen_head.index('# The dominant swept fringe')], 'frozen-R3-face-neck', 'exec'), globals())
exec(compile((ROOT/'tools/asset-foundation/misaki-hair-r5.py').read_text(), 'misaki-hair-r5.py', 'exec'), globals())

# The canonical clip is on her OWN LEFT (+X), never mirrored onto both sides.
for k,(dx,dz,angle)in enumerate([(0,0,-.6),(.015,.014,.6)]):
 cx=.164+dx;cz=1.302+dz;vs=[]
 for side in [-1,1]:
  for i in range(7):
   t=i/6;long=(t-.5)*.044;wide=side*.009*math.sin(math.pi*t);x=cx+long*math.sin(angle)+wide*math.cos(angle);z=cz+long*math.cos(angle)-wide*math.sin(angle);vs.append((x,-.170-.003*math.sin(math.pi*t),z))
 fs=[(i,i+1,i+8,i+7)for i in range(6)];mesh('17 / own LEFT clip leaf '+str(k),vs,fs,apron,1,.002)

# Hair-only revision: preserve R4 clip control geometry, not a new attachment.
frozen_clip=json.loads((ROOT/'tools/asset-foundation/misaki-frozen-clip-r4.json').read_text())['objects']
for o in objects:
 if o.name.startswith('17 /'):
  for v,co in zip(o.data.vertices,frozen_clip[o.name]):v.co=co

# Open an actual neck gap above the unchanged collar; no scaling of the body.
for o in objects:
 if o.name!='02 / visible neck bridge':o.location.z+=head_offset

# Clothed torso and open cardigan. A-pose is independently normalized; it is
# not described as matching the unavailable front/back versus side sheets.
torso=[(.700,.127,.089,0),(.76,.143,.097,0),(.85,.157,.104,0),(.94,.176,.099,0),(.995,.120,.069,0),(1.015,.053,.044,0)]
loft('20 / inner shirt torso',torso,apron,12,28)
vs=[];rows=13;cols=29
for i in range(rows):
 z,rx,ry,cy=sample(torso,i/(rows-1));rx+=.006;ry+=.007
 for j in range(cols):
  a=.30+j/(cols-1)*(math.tau-.60);vs.append((math.sin(a)*rx,cy-math.cos(a)*ry,z))
mesh('21 / open cardigan around shoulders and waist',vs,connect(rows,cols,False),cloth,1,.006)
for side in [-1,1]:
 path=[(side*.120,0,.974),(side*.160,0,.960),(side*.192,-.001,.926),(side*.237,-.002,.853),(side*.285,-.005,.778),(side*.293,-.005,.765)]
 tube('22 / shaped A-pose sleeve '+str(side),path,[.050,.071,.073,.068,.056,.055],cloth,14)
 tube('23 / rolled broad cuff '+str(side),[(side*.276,-.005,.794),(side*.286,-.005,.778),(side*.295,-.005,.762)],[.060,.063,.059],cloth,14)
 tube('24 / continuous forearm wrist and simple hand mass '+str(side),[(side*.277,-.005,.800),(side*.289,-.005,.770),(side*.316,-.007,.721),(side*.350,-.010,.662),(side*.368,-.012,.631),(side*.381,-.016,.612),(side*.395,-.020,.581),(side*.400,-.021,.569)],[.039,.038,.039,.031,.027,(.031,.022),(.028,.019),.008],skin,12)
 tube('26 / thumb mass only '+str(side),[(side*.371,-.029,.613),(side*.360,-.037,.590),(side*.361,-.038,.578)],[.015,.014,.006],skin,10)
loft('30 / broad skirt with unequal turning folds',[(.294,.230,.172,.008),(.330,.231,.173,.008),(.445,.208,.161,.008),(.580,.174,.135,.008),(.700,.145,.106,.005),(.760,.130,.092,0)],skirt,17,32,1,True)
# Apron follows the front of torso/skirt as one broad supported panel.
ap=[(.375,.191,-.174),(.425,.193,-.174),(.55,.174,-.151),(.69,.147,-.117),(.77,.128,-.111),(.87,.115,-.111),(.955,.092,-.100)]
vs=[];rows=17;cols=15
for i in range(rows):
 z,w,y=sample(ap,i/(rows-1))
 for j in range(cols):
  u=j/(cols-1)*2-1;vs.append((w*u,y+.045*u*u-.004*math.cos(u*math.pi/2),z+.003*u*(1-i/(rows-1))))
mesh('31 / continuous apron bib to broad hem',vs,connect(rows,cols,False),apron,1,.004)
# Two broad straps; back is inferred and deliberately has no unverified bow.
for side in [-1,1]:
 tube('32 / apron shoulder strap '+str(side),[(side*.084,-.092,.941),(side*.077,-.080,.994),(side*.073,-.006,1.012),(side*.075,.073,.971),(side*.092,.103,.814)],[.012]*5,apron,6,1)
for side in [-1,1]:
 leg=loft('40 / sock calf '+str(side),[(.050,.034,.036,0),(.11,.038,.038,0),(.225,.043,.041,0),(.337,.039,.038,0)],apron,10,16)
 leg.location.x=side*.080
 # Closed shoe volume, soft rounded toe/heel and actual flat sole support.
 vs=[];cols=16
 for y,rx,top in [(-.140,.008,.028),(-.128,.044,.052),(-.102,.058,.067),(-.042,.059,.081),(.026,.049,.087),(.066,.043,.068),(.077,.008,.039)]:
  for j in range(cols):
   a=j*math.tau/cols;vs.append((side*.080+math.sin(a)*rx,y,top*(.5+.5*math.cos(a))))
 fs=connect(7,cols);fs.extend([tuple(reversed(range(cols))),tuple(6*cols+j for j in range(cols))]);mesh('41 / rounded shoe and sole '+str(side),vs,fs,skirt,1)

# Source retains organized semantic objects and editable subdivision quad cages.
bpy.context.view_layer.update()
source_stats={};deps=bpy.context.evaluated_depsgraph_get();sole=float('inf')
for o in objects:
 e=o.evaluated_get(deps);d=e.to_mesh();sole=min(sole,min((o.matrix_world@v.co).z for v in d.vertices));e.to_mesh_clear()
for o in objects:o.location.z-=sole
bpy.context.view_layer.update();deps=bpy.context.evaluated_depsgraph_get()
for o in objects:
 e=o.evaluated_get(deps);d=e.to_mesh();d.calc_loop_triangles();source_stats[o.name]={'controlVertices':len(o.data.vertices),'controlQuads':sum(len(p.vertices)==4 for p in o.data.polygons),'triangles':len(d.loop_triangles)};e.to_mesh_clear()
bpy.ops.wm.save_as_mainfile(filepath=str(SRC/'misaki-grayform.blend'))
# Five semantic evaluated export groups keep draw cost bounded. The .blend
# above keeps every editable cage and modifier; no destructive source join.
baked=[];groups={};deps=bpy.context.evaluated_depsgraph_get()
for src in objects:
 n=int(src.name[:2]);group='face'if n<3 else'feature-placement'if n<10 else'hair'if n<17 else'own-left-clip'if n<20 else'clothed-body'
 d=bpy.data.meshes.new_from_object(src.evaluated_get(deps),preserve_all_data_layers=True,depsgraph=deps);o=bpy.data.objects.new(src.name+' export',d);bpy.context.collection.objects.link(o);o.matrix_world=src.matrix_world.copy();groups.setdefault(group,[]).append(o)
for name,items in groups.items():
 bpy.ops.object.select_all(action='DESELECT')
 for o in items:o.select_set(True)
 bpy.context.view_layer.objects.active=items[0];bpy.ops.object.join();o=items[0];o.name='misaki-grayform/'+name;o['grayformGroup']=name;baked.append(o)
bpy.ops.object.select_all(action='DESELECT')
for o in baked:o.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(OUT/'misaki-grayform.glb'),export_format='GLB',use_selection=True,export_apply=True,export_extras=True,export_animations=False)
manifest={'id':'misaki-grayform-v1','reference':'canonical Approved_Visual_Target_Misaki.png only','referenceSha256':hashlib.sha256((ROOT/'docs/codex-v4/reference/Approved_Visual_Target_Misaki.png').read_bytes()).hexdigest(),'PlanB':{'library_file_id':'libfile_d1f1a5f43d9c819199f7d57ff7936d6a','expectedSha256':'4c35ad580dfff13001d4970a7bc2b1be5299c944d127abb0fdd329f7dad6e420','materialization':'official helper download failed; no local bytes or new views inspected'},'axes':'Blender Z-up / face -Y / own LEFT +X; glTF Y-up / face +Z / own LEFT +X','pose':'normalized neutral A-pose; hands are coarse masses','intendedHeight':1.442,'headChin':.998,'hairCrown':1.442,'headUnits':1.442/(1.442-.998),'jointsBlender':{'neck':[0,0,1.00],'leftShoulder':[.162,0,.966],'leftElbow':[.289,-.005,.770],'leftWrist':[.368,-.012,.631],'rightShoulder':[-.162,0,.966],'rightElbow':[-.289,-.005,.770],'rightWrist':[-.368,-.012,.631]},'objects':source_stats,'triangles':sum(s['triangles']for s in source_stats.values()),'limitations':['Grayform only, not final facial topology, skin weights, animation or art acceptance','Side/back volumes inferred from canonical original; PlanB comparison pending readable access','Existing gameplay rig/actions/data/saves untouched','No final materials, textures, fine strands, weave or finger topology','Back bow omitted rather than claiming an unseen reference']}
manifest['soleNormalization']=sole;manifest['semanticExportGroups']=list(groups)
for key in ['intendedHeight','headChin','hairCrown','headUnits']:manifest.pop(key,None)
manifest['hairMethod']='independent internal spine and borders for varying curved cross-sections; six flow clumps plus local crown root join; local subdivision1 only, no global fusion or smoothing';manifest['revision']='R5 main sweep and bob internal sections / all R4 non-hair frozen';manifest['headNeckOffset']=head_offset;manifest['bodyFrozenSource']='038740fbd7f6428cc82d5f442646c2d86a4143e3';manifest['jointsBlender']['neck']=[0,.019,1.04]
manifest['PlanB']['materialization']='official helper download failed, and one fresh authorized retry also failed; no local bytes/new views inspected'
(SRC/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n');print(json.dumps({'objects':len(objects),'triangles':manifest['triangles'],'headNeckOffset':head_offset}))
