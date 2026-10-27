"""R9 continuous low-resolution bob: quad crown grid joined to side rings.
No UV sphere, radial crown fan, voxel fusion, decimation or global smoothing.
Only two ear/lower-edge overlaps remain separate. All non-hair is frozen.
Pass --baseline <R8 blend> --manifest <R8 manifest> after --.
"""
import bpy,math,json,hashlib,argparse,sys,numpy as np
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[2]
p=argparse.ArgumentParser();p.add_argument('--baseline',required=True);p.add_argument('--manifest',required=True)
a=p.parse_args(sys.argv[sys.argv.index('--')+1:]);base=Path(a.baseline)
assert hashlib.sha256(base.read_bytes()).hexdigest()=='5cd7463fd7a83f13a13612569ab671e17fc8723b973133eb6ec9a84c47b080e4'
bpy.ops.wm.open_mainfile(filepath=str(base));bpy.context.preferences.filepaths.save_version=0
manifest=json.loads(Path(a.manifest).read_text(encoding='utf8'))
original_objects=[bpy.data.objects[n]for n in manifest['objects']]
hair_objects=[o for o in original_objects if 10<=int(o.name[:2])<17]
def fingerprint(o,evaluated=False):
 deps=bpy.context.evaluated_depsgraph_get();d=bpy.data.meshes.new_from_object(o.evaluated_get(deps),depsgraph=deps)if evaluated else o.data
 v={'positions':[list(v.co)for v in d.vertices],'faces':[list(p.vertices)for p in d.polygons],'matrix':[list(r)for r in o.matrix_world],'materials':[m.name for m in d.materials]}
 h=hashlib.sha256(json.dumps(v,separators=(',',':')).encode()).hexdigest()
 if evaluated:bpy.data.meshes.remove(d)
 return h
frozen={o.name:{'native':fingerprint(o),'evaluated':fingerprint(o,True)}for o in original_objects if o not in hair_objects}
assert len(frozen)==37
for o in hair_objects:
 for ch in list(o.children):
  if ch.type=='CURVE':bpy.data.objects.remove(ch,do_unlink=True)

# Angular lower outline: a swept front, ear notch on own LEFT, asymmetric jaw
# edge and inferred back. Angles run from face -Y toward own-left +X.
EDGE=[(-math.pi,1.020),(-2.60,1.004),(-2.20,.998),(-1.80,1.012),(-1.50,1.038),(-1.20,1.077),(-.95,1.132),(-.75,1.194),(-.50,1.229),(-.25,1.239),(0,1.246),(.25,1.277),(.50,1.300),(.75,1.286),(1.00,1.257),(1.25,1.231),(1.50,1.211),(1.70,1.111),(2.00,1.025),(2.40,1.006),(math.pi,1.020)]
# Direct row controls: (x radius, back y radius, front y radius, vertical phase).
# Width peaks before the jaw and then turns inward. These deliberately unequal
# non-spherical sections replace the R8 separate petal strips.
ROWS=[(.105,.100,.100,0),(.160,.150,.140,.12),(.210,.190,.172,.24),(.238,.220,.184,.40),(.252,.235,.182,.57),(.258,.229,.175,.74),(.250,.210,.167,.88),(.233,.185,.158,.96),(.208,.160,.148,1)]
def wrap(x):return (x+math.pi)%(2*math.pi)-math.pi
def gaussian(x,c,w):return math.exp(-(wrap(x-c)/w)**2)
def edge_height(theta):
 for (x,a),(y,b)in zip(EDGE,EDGE[1:]):
  if x<=theta<=y:return a+(b-a)*(theta-x)/(y-x)
 return EDGE[-1][1]

vs=[];faces=[];N=9
for j in range(N):
 v=j/(N-1)*2-1
 for i in range(N):
  u=i/(N-1)*2-1
  x=.025+.105*u*math.sqrt(1-v*v*.5);y=.025+.100*v*math.sqrt(1-u*u*.5)
  z=1.420+.022*(1-u*u)*(1-v*v)+.004*u-.003*v
  # A shallow offset part is sculpted into this shared quad surface. It is not
  # a gap or a set of disconnected roots converging on a common vertex.
  z-=.006*math.exp(-((x-(.035+.010*v))/.024)**2)*(1-.25*abs(v))
  vs.append(Vector((x,y,z)))
for j in range(N-1):
 for i in range(N-1):k=j*N+i;faces.append((k,k+1,k+1+N,k+N))
boundary=[k for k in range(N*N)if k//N in(0,N-1)or k%N in(0,N-1)]
boundary.sort(key=lambda k:math.atan2(vs[k].x-.025,-(vs[k].y-.025)))
angles=[math.atan2(vs[k].x-.025,-(vs[k].y-.025))for k in boundary]
assert len(boundary)==32
previous=boundary;semantic={'crown':list(range(N*N)),'front':[],'support':[],'ear':[],'outward':[],'inward':[]}
for row,(rx,ry,front_y,t)in enumerate(ROWS[1:],1):
 ring=[]
 for column,theta in enumerate(angles):
  front=max(0,math.cos(theta))**3
  sweep=-.19*math.sin(math.pi*t)*gaussian(theta,-.12,.85)-.07*t*gaussian(theta,0,.85)
  angle=theta+sweep
  end=edge_height(theta)
  top=vs[boundary[column]].z
  z=top+(end-top)*t
  # Medium turns share vertices with the main volume. Their shallow changing
  # ridges are sculpted sections, not more repeated detached strips.
  relief=(.018*gaussian(angle,-.35-.38*t,.36)+.012*gaussian(angle,.73+.20*t,.27)
          +.017*gaussian(angle,-1.9+.18*t,.34)+.014*gaussian(angle,2.18-.18*t,.43)
          -.008*gaussian(angle,-1.13,.23)-.007*gaussian(angle,2.88,.30))*math.sin(math.pi*t)
  x=.025*(1-t)-.009*t+(rx+relief)*math.sin(angle)
  yradius=ry*(1-front)+front_y*front
  y=.025+(yradius+relief)*(-math.cos(angle))
  # Fixed own-left clip support, sculpted behind its immutable geometry. The
  # adjacent rear bob stays full; only this front temple turn is seated inward.
  seat=gaussian(theta,1.02,.33)*math.exp(-((z-1.310)/.065)**2)
  x-=.049*seat;y+=.007*seat
  # Unequal broad lower turns, not serrated individual strand tips.
  if abs(theta)>1.5:z+=.007*math.sin(theta*3+.5)*t**7
  k=len(vs);ring.append(k);vs.append(Vector((x,y,z)))
  if abs(theta)<.8:semantic['front'].append(k)
  if .55<theta<1.35:semantic['support'].append(k)
  if 1.2<theta<1.9:semantic['ear'].append(k)
  if row in(4,5):semantic['outward'].append(k)
  if row in(7,8):semantic['inward'].append(k)
 for j in range(32):k=(j+1)%32;faces.append((previous[j],ring[j],ring[k],previous[k]))
 previous=ring

# Actual first-render feedback: most clip vertices were hidden. Fit a support
# plane to the immutable evaluated clip, then seat the nearby continuous cage
# behind it, with smooth falloff. This edits the real surface; no mask, camera
# change, clip movement or visibility-only material trick is involved.
clip_points=[];deps=bpy.context.evaluated_depsgraph_get()
to_local=bpy.data.objects['10 / primary swept fringe'].matrix_world.inverted()
for o in original_objects:
 if o.name.startswith('17 /'):
  e=o.evaluated_get(deps);d=e.to_mesh();clip_points.extend([to_local@o.matrix_world@v.co for v in d.vertices]);e.to_mesh_clear()
matrix=np.array([[p.x,p.z,1]for p in clip_points]);ys=np.array([p.y for p in clip_points]);coeff=np.linalg.lstsq(matrix,ys,rcond=None)[0]
seated=0;max_seat=0
for v in vs:
 if v.y>.05:continue
 dx=max(0,.10-v.x,v.x-.22)/.045;dz=max(0,1.25-v.z,v.z-1.38)/.04
 weight=math.exp(-(dx**2+dz**2)*3)
 if v.x<.055 or v.z<1.21 or v.z>1.43:continue
 plane_y=float(coeff[0]*v.x+coeff[1]*v.z+coeff[2])+.007
 if v.y<plane_y:
  change=(plane_y-v.y)*weight;v.y+=change
  if change>1e-6:seated+=1;max_seat=max(max_seat,change)

def replace(o,vertices,polygons,label,solidify=False):
 old=o.data;d=bpy.data.meshes.new(label);d.from_pydata(vertices,[],polygons);d.update()
 for mat in old.materials:d.materials.append(mat)
 for poly in d.polygons:poly.use_smooth=True
 o.data=d;bpy.context.view_layer.objects.active=o;bpy.ops.object.select_all(action='DESELECT');o.select_set(True)
 bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.mesh.normals_make_consistent(inside=False);bpy.ops.object.mode_set(mode='OBJECT')
 for mod in list(o.modifiers):o.modifiers.remove(mod)
 sub=o.modifiers.new('Editable local surface subdivision','SUBSURF');sub.levels=1;sub.render_levels=1
 if solidify:
  thick=o.modifiers.new('Editable continuous bob thickness','SOLIDIFY');thick.thickness=.0028;thick.offset=-1;thick.use_rim=True
 for k in list(o.keys()):
  if k!='stage':del o[k]
 o['authoring']=label
 bpy.data.meshes.remove(old)
main=bpy.data.objects['10 / primary swept fringe'];replace(main,vs,faces,'R9 continuous quad crown and non-spherical bob volume',True)
crease=main.data.attributes.new('crease_edge','FLOAT','EDGE')
fold_columns={min(range(32),key=lambda j:abs(wrap(angles[j]-target)))for target in[-.55,-1.85,2.2]}
for edge in main.data.edges:
 x,y=edge.vertices
 if x>=81 and y>=81 and(x-81)%32==(y-81)%32 and(x-81)%32 in fold_columns:
  crease.data[edge.index].value=.16
for label,indices in semantic.items():
 group=main.vertex_groups.new(name='R9 / '+label);group.add(indices,1,'REPLACE')
main['continuousOuterComponents']=1;main['topGrid']=[9,9];main['perimeterColumns']=32;main['sideRingRows']=8

# Only two broad ear/lower-edge overlaps. They do not form a crown shell.
OVERLAPS={
'12 / shorter swept own-left ear side':[
 ((.220,.041,1.238),(.012,.019,-.006)),((.235,.043,1.208),(.015,.024,-.005)),((.246,.050,1.166),(.015,.028,.001)),((.248,.051,1.121),(.014,.027,.009)),((.238,.034,1.081),(.012,.023,.013)),((.217,.009,1.054),(.008,.015,.010)),((.196,-.005,1.058),(.003,.006,.003))],
'14 / fuller rear own-right flow':[
 ((-.235,.037,1.188),(.013,-.025,-.004)),((-.251,.041,1.153),(.015,-.030,.000)),((-.266,.046,1.110),(.016,-.031,.006)),((-.268,.039,1.071),(.014,-.026,.012)),((-.253,.020,1.038),(.011,-.020,.014)),((-.230,-.001,1.021),(.007,-.012,.010)),((-.208,-.016,1.027),(.003,-.004,.003))],
}
def overlap(rows):
 C=5;R=len(rows);K=R*C;outer=[];normals=[]
 for i,(co,w)in enumerate(rows):
  c=Vector(co);width=Vector(w)*.75;dt=Vector(rows[min(R-1,i+1)][0])-Vector(rows[max(0,i-1)][0]);n=width.cross(dt).normalized()
  if n.dot(c-Vector((0,.025,1.20)))<0:n=-n
  for j in range(C):u=j/(C-1)*2-1;outer.append(c+width*u+n*.003*(1-u*u));normals.append(n)
 verts=outer+[v-n*.0025 for v,n in zip(outer,normals)];fs=[]
 for layer in range(2):
  for i in range(R-1):
   for j in range(C-1):k=i*C+j;f=(k,k+1,k+C+1,k+C);fs.append(tuple(q+layer*K for q in(f if layer==0 else tuple(reversed(f)))))
 for i in range(R-1):
  for j in[0,C-1]:k=i*C+j;l=k+C;fs.append((k,l,l+K,k+K))
 for i in[0,R-1]:
  for j in range(C-1):k=i*C+j;fs.append((k,k+K,k+1+K,k+1))
 return verts,fs
keep={main.name,*OVERLAPS}
for o in hair_objects:
 if o.name not in keep:bpy.data.objects.remove(o,do_unlink=True)
for name,rows in OVERLAPS.items():
 v,f=overlap(rows);replace(bpy.data.objects[name],v,f,'R9 broad ear or lower-edge overlap only')
objects=[bpy.data.objects[name]for name in manifest['objects']if name in bpy.data.objects]
bpy.context.view_layer.update()
for o in objects:
 if o.name in frozen:
  assert fingerprint(o)==frozen[o.name]['native'],o.name+' native changed'
  assert fingerprint(o,True)==frozen[o.name]['evaluated'],o.name+' evaluated changed'
deps=bpy.context.evaluated_depsgraph_get();stats={}
for o in objects:
 e=o.evaluated_get(deps);d=e.to_mesh();d.calc_loop_triangles();stats[o.name]={'controlVertices':len(o.data.vertices),'controlQuads':sum(len(poly.vertices)==4 for poly in o.data.polygons),'triangles':len(d.loop_triangles)};e.to_mesh_clear()
manifest['objects']=stats;manifest['triangles']=sum(s['triangles']for s in stats.values());assert manifest['triangles']<55000
manifest['revision']='R9 continuous low-resolution crown-to-bob control volume plus two lower overlaps / unaccepted candidate'
manifest['hairMethod']='Single continuous 9x9 quad crown grid joined to eight 32-column side rings; asymmetric non-spherical rows, shared medium surface turns, outward/inward jaw contour; local Subsurf1 and editable Solidify2.8mm; two broad ear/lower overlaps only; actual fixed-clip support plane'
manifest['sourceBaselineSha256']=hashlib.sha256(base.read_bytes()).hexdigest()
manifest['limitations']=[s for s in manifest['limitations']if not s.startswith(('R7 is','R8 is'))]+['R9 is an unaccepted whole-hair review candidate; side/back remain inferred']
source=ROOT/'assets/authoring/misaki-grayform-v1'
bpy.ops.object.select_all(action='DESELECT');main.select_set(True);bpy.context.view_layer.objects.active=main
bpy.ops.wm.save_as_mainfile(filepath=str(source/'misaki-grayform.blend'))
(source/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf8',newline='\n')
groups={};baked=[]
for src in objects:
 n=int(src.name[:2]);group='face'if n<3 else'feature-placement'if n<10 else'hair'if n<17 else'own-left-clip'if n<20 else'clothed-body'
 d=bpy.data.meshes.new_from_object(src.evaluated_get(deps),preserve_all_data_layers=True,depsgraph=deps)
 o=bpy.data.objects.new(src.name+' export',d);bpy.context.collection.objects.link(o);o.matrix_world=src.matrix_world.copy();groups.setdefault(group,[]).append(o)
for name,items in groups.items():
 bpy.ops.object.select_all(action='DESELECT')
 for o in items:o.select_set(True)
 bpy.context.view_layer.objects.active=items[0];bpy.ops.object.join();o=items[0];o.name='misaki-grayform/'+name;o['grayformGroup']=name;baked.append(o)
bpy.ops.object.select_all(action='DESELECT')
for o in baked:o.select_set(True)
glb=ROOT/'public/assets/misaki-grayform-v1/misaki-grayform.glb'
bpy.ops.export_scene.gltf(filepath=str(glb),export_format='GLB',use_selection=True,export_apply=True,export_extras=True,export_animations=False)
out=ROOT/'docs/reviews/evidence/misaki-grayform-v1-r9';out.mkdir(parents=True,exist_ok=True)
r={'baselineCommit':'ea6613cd001f3fe26cd9f4eadd8c972f5e872fea','baselineBlendSha256':manifest['sourceBaselineSha256'],'frozenNonHairObjects':frozen,'nativeMeshObjects':len(objects),'hairObjects':3,'continuousVolumeControlVertices':len(vs),'continuousVolumeControlQuads':len(faces),'crownGrid':[9,9],'sideRings':[8,32],'separateLowerOverlaps':2,'edgeHeightAnchors':EDGE,'sectionRowControls':ROWS,'clipSupportPlane':{'yFromX_Z_1':coeff.tolist(),'cageVerticesAdjusted':seated,'maxYAdjustment':max_seat,'supportOffset':.007},'nativeMainControlPositions':[list(v)for v in vs],'triangles':manifest['triangles'],'blendSha256':hashlib.sha256((source/'misaki-grayform.blend').read_bytes()).hexdigest(),'glbSha256':hashlib.sha256(glb.read_bytes()).hexdigest(),'limits':['Side/back inferred','Not art acceptance or collision/rig certification','No GUI, sphere primitive, voxel fusion or global smoothing']}
(out/'blender-edit-preservation.json').write_text(json.dumps(r,indent=2)+'\n',encoding='utf8',newline='\n')
print(json.dumps({k:v for k,v in r.items()if k not in ['frozenNonHairObjects','edgeHeightAnchors','sectionRowControls','nativeMainControlPositions']}))
