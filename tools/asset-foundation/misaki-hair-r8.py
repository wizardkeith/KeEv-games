"""R8 coherent whole-hair volume. Background-only, actual editable quad cages.

Pass --baseline <R7 blend> --manifest <R7 manifest>. All seven unaccepted hair
groups are reshaped together; 37 non-hair objects and their transforms remain
exact. The 14 medium clumps below are not individual strands. Side/back are
inferred from the canonical illustration, not an invented turnaround sheet.
"""
import bpy,math,json,hashlib,argparse,sys
from pathlib import Path
from mathutils import Vector
from mathutils.bvhtree import BVHTree
ROOT=Path(__file__).resolve().parents[2]
p=argparse.ArgumentParser();p.add_argument('--baseline',required=True);p.add_argument('--manifest',required=True)
a=p.parse_args(sys.argv[sys.argv.index('--')+1:]);baseline=Path(a.baseline)
assert hashlib.sha256(baseline.read_bytes()).hexdigest()=='71a6de35f99476a3d155a6912eb5a3eac05a5ddcecf00521928729765e7e8702'
bpy.ops.wm.open_mainfile(filepath=str(baseline));bpy.context.preferences.filepaths.save_version=0
manifest=json.loads(Path(a.manifest).read_text(encoding='utf8'))
objects=[bpy.data.objects[n]for n in manifest['objects']]
hair_objects=[o for o in objects if 10<=int(o.name[:2])<17]

def fingerprint(o,evaluated=False):
 deps=bpy.context.evaluated_depsgraph_get()
 d=bpy.data.meshes.new_from_object(o.evaluated_get(deps),depsgraph=deps)if evaluated else o.data
 data={'vertices':[list(v.co)for v in d.vertices],'faces':[list(p.vertices)for p in d.polygons],
       'matrix':[list(row)for row in o.matrix_world],'materials':[m.name for m in d.materials]}
 h=hashlib.sha256(json.dumps(data,separators=(',',':')).encode()).hexdigest()
 if evaluated:bpy.data.meshes.remove(d)
 return h
frozen={o.name:{'native':fingerprint(o),'evaluated':fingerprint(o,True)}for o in objects if o not in hair_objects}
assert len(frozen)==37

# Each row: hand-drawn centre and transverse half-width vector, in source-local
# metres. Changing section orientation wraps a lock around forehead/temple/bob;
# unequal terminal locations replace the old straight side boards/cut rim.
# Width vectors include their vertical slant. No global skull shell or fusion.
PATCHES={
10:[('dominant outer diagonal',[
 ((.006,.002,1.427),(.020,.001,.001)),
 ((-.017,-.043,1.429),(.028,-.002,.000)),
 ((-.055,-.091,1.408),(.039,-.006,.006)),
 ((-.095,-.122,1.372),(.044,-.009,.013)),
 ((-.131,-.133,1.331),(.042,-.010,.021)),
 ((-.157,-.126,1.287),(.035,-.009,.024)),
 ((-.172,-.110,1.247),(.026,-.006,.019)),
 ((-.171,-.094,1.218),(.017,-.004,.013)),
 ((-.155,-.085,1.204),(.007,-.002,.006)),
 ]),('dominant inner forehead turn',[
 ((.030,-.005,1.427),(.017,.001,.001)),
 ((.024,-.050,1.426),(.022,-.001,.001)),
 ((.005,-.103,1.405),(.030,-.002,.004)),
 ((-.020,-.141,1.372),(.034,-.003,.006)),
 ((-.044,-.158,1.334),(.034,-.002,.008)),
 ((-.061,-.162,1.295),(.029,-.002,.010)),
 ((-.072,-.157,1.263),(.023,-.002,.011)),
 ((-.079,-.149,1.241),(.014,-.002,.008)),
 ((-.087,-.140,1.231),(.006,-.001,.005)),
 ])],
11:[('independent clipward supporting sweep',[
 ((.043,.001,1.425),(.015,.002,-.001)),
 ((.061,-.040,1.427),(.024,.004,-.005)),
 ((.091,-.088,1.408),(.033,.007,-.013)),
 ((.121,-.116,1.379),(.040,.012,-.024)),
 ((.147,-.124,1.348),(.038,.016,-.026)),
 ((.166,-.116,1.316),(.032,.019,-.023)),
 ((.181,-.100,1.288),(.023,.016,-.017)),
 ((.191,-.080,1.265),(.014,.010,-.011)),
 ((.189,-.060,1.252),(.006,.005,-.005)),
 ])],
12:[('front ear frame curl',[
 ((.060,.015,1.422),(.018,.008,-.002)),
 ((.100,-.027,1.413),(.023,.012,-.008)),
 ((.144,-.063,1.382),(.024,.016,-.014)),
 ((.180,-.076,1.341),(.023,.022,-.016)),
 ((.198,-.070,1.292),(.016,.021,-.012)),
 ((.203,-.064,1.238),(.012,.019,-.004)),
 ((.211,-.051,1.183),(.012,.017,.004)),
 ((.207,-.028,1.135),(.010,.013,.009)),
 ((.184,-.010,1.119),(.005,.006,.005)),
 ]),('behind ear loose tip',[
 ((.061,.046,1.421),(.018,.011,-.001)),
 ((.118,.031,1.414),(.022,.018,-.006)),
 ((.179,.021,1.376),(.023,.027,-.011)),
 ((.217,.023,1.320),(.019,.033,-.010)),
 ((.236,.037,1.253),(.014,.032,-.004)),
 ((.241,.055,1.183),(.011,.026,.004)),
 ((.234,.066,1.117),(.010,.020,.010)),
 ((.216,.047,1.072),(.008,.013,.010)),
 ((.191,.024,1.067),(.004,.006,.004)),
 ])],
13:[('rear own-right broad flow',[
 ((.005,.073,1.426),(.021,.002,.001)),
 ((-.024,.124,1.436),(.035,.005,.003)),
 ((-.055,.181,1.409),(.046,.010,.008)),
 ((-.080,.222,1.361),(.050,.013,.008)),
 ((-.094,.239,1.298),(.049,.012,.002)),
 ((-.099,.237,1.224),(.043,.010,-.004)),
 ((-.094,.218,1.151),(.036,.009,-.008)),
 ((-.075,.182,1.087),(.025,.007,-.008)),
 ((-.038,.147,1.057),(.008,.003,-.003)),
 ]),('rear own-left broad turn',[
 ((.037,.080,1.425),(.018,-.002,-.001)),
 ((.055,.132,1.436),(.031,-.004,-.003)),
 ((.075,.189,1.410),(.041,-.007,-.006)),
 ((.098,.229,1.364),(.045,-.011,-.007)),
 ((.117,.247,1.302),(.043,-.013,-.001)),
 ((.126,.244,1.235),(.037,-.013,.005)),
 ((.129,.226,1.166),(.029,-.012,.009)),
 ((.113,.192,1.110),(.019,-.007,.009)),
 ((.078,.162,1.089),(.007,-.002,.004)),
 ])],
14:[('own-right temple into jaw turn',[
 ((-.011,.015,1.424),(.021,-.003,.000)),
 ((-.066,-.013,1.422),(.028,-.009,-.005)),
 ((-.124,-.043,1.389),(.029,-.018,-.011)),
 ((-.174,-.058,1.337),(.025,-.026,-.012)),
 ((-.204,-.058,1.273),(.019,-.029,-.007)),
 ((-.218,-.051,1.201),(.014,-.026,.001)),
 ((-.219,-.035,1.133),(.012,-.020,.009)),
 ((-.208,-.017,1.082),(.010,-.013,.011)),
 ((-.182,-.016,1.062),(.004,-.005,.005)),
 ]),('own-right outer outward curl',[
 ((-.010,.047,1.425),(.018,-.006,.001)),
 ((-.072,.046,1.430),(.024,-.016,-.001)),
 ((-.141,.040,1.402),(.027,-.028,-.006)),
 ((-.199,.045,1.351),(.023,-.038,-.008)),
 ((-.233,.061,1.281),(.017,-.040,-.004)),
 ((-.248,.086,1.201),(.011,-.034,.004)),
 ((-.251,.096,1.123),(.008,-.026,.013)),
 ((-.238,.070,1.065),(.006,-.017,.014)),
 ((-.207,.036,1.050),(.003,-.006,.005)),
 ]),('own-right rear unequal tip',[
 ((-.005,.089,1.425),(.019,-.008,.000)),
 ((-.066,.114,1.434),(.025,-.015,.000)),
 ((-.131,.145,1.410),(.028,-.024,-.003)),
 ((-.185,.169,1.356),(.027,-.031,-.006)),
 ((-.220,.176,1.283),(.021,-.035,-.002)),
 ((-.237,.164,1.205),(.015,-.031,.004)),
 ((-.235,.145,1.137),(.013,-.024,.009)),
 ((-.216,.122,1.089),(.010,-.017,.011)),
 ((-.181,.097,1.081),(.004,-.006,.004)),
 ])],
15:[('own-left outer bob turn',[
 ((.055,.074,1.423),(.017,.008,-.001)),
 ((.108,.094,1.427),(.022,.016,-.003)),
 ((.168,.119,1.398),(.024,.025,-.007)),
 ((.216,.139,1.345),(.021,.031,-.008)),
 ((.243,.147,1.279),(.016,.033,-.003)),
 ((.254,.135,1.210),(.012,.029,.004)),
 ((.249,.110,1.146),(.010,.023,.009)),
 ((.233,.078,1.099),(.008,.015,.012)),
 ((.203,.050,1.094),(.003,.006,.005)),
 ]),('own-left rear tucked end',[
 ((.048,.103,1.423),(.017,.006,-.001)),
 ((.090,.142,1.432),(.023,.010,-.002)),
 ((.139,.187,1.404),(.027,.017,-.004)),
 ((.179,.215,1.351),(.026,.024,-.005)),
 ((.207,.223,1.284),(.021,.028,-.001)),
 ((.220,.210,1.214),(.017,.025,.005)),
 ((.217,.188,1.150),(.014,.019,.009)),
 ((.201,.160,1.106),(.010,.011,.010)),
 ((.172,.133,1.103),(.004,.004,.004)),
 ])],
16:[('parting own-right root fold',[
 ((.012,-.006,1.428),(.018,.000,.002)),
 ((.009,.024,1.434),(.020,.000,.003)),
 ((.008,.059,1.438),(.023,.000,.003)),
 ((.006,.095,1.436),(.025,.000,.001)),
 ((.004,.127,1.426),(.023,.000,-.001)),
 ]),('parting own-left root fold',[
 ((.040,-.005,1.427),(.012,.000,-.002)),
 ((.043,.025,1.433),(.014,.000,-.002)),
 ((.043,.060,1.437),(.016,.000,-.002)),
 ((.041,.095,1.435),(.018,.000,-.001)),
 ((.037,.127,1.425),(.017,.000,.001)),
 ])],
}

# One structural correction after viewing the actual first volume render:
# gaps exposed the skull, some front rows entered it, and the fixed clip lost
# its support. Keep the distinct flow paths but establish overlapping sections,
# an actual-head clearance envelope and explicit jaw-level unequal endpoints.
# This is not a global skull shell: every final point remains a native clump
# control vertex and the fit rays intersect the frozen evaluated face mesh.
PATCHES[11][0][1][4]=((.145,-.103,1.342),(.038,.016,-.026))
PATCHES[11][0][1][5]=((.159,-.092,1.309),(.032,.019,-.023))
PATCHES[11][0][1][6]=((.177,-.065,1.281),(.023,.016,-.017))
PATCHES[11][0][1][7]=((.190,-.038,1.261),(.014,.010,-.011))
PATCHES[11][0][1][8]=((.189,-.014,1.252),(.006,.005,-.005))
for index,co in {4:(.184,-.086,1.292),5:(.181,-.091,1.238),6:(.177,-.087,1.183),7:(.174,-.069,1.123),8:(.182,-.040,1.073)}.items():
 PATCHES[12][0][1][index]=(co,PATCHES[12][0][1][index][1])
endpoints={
 (12,1):((.216,.047,1.040),(.191,.024,1.018)),
 (13,0):((-.075,.182,1.060),(-.038,.147,1.014)),
 (13,1):((.113,.192,1.080),(.078,.162,1.035)),
 (14,0):((-.208,-.017,1.051),(-.182,-.016,1.020)),
 (14,1):((-.238,.070,1.031),(-.207,.036,.997)),
 (14,2):((-.216,.122,1.060),(-.181,.097,1.033)),
 (15,0):((.233,.078,1.067),(.203,.050,1.047)),
 (15,1):((.201,.160,1.066),(.172,.133,1.027)),
}
for (group,index),(penultimate,terminal)in endpoints.items():
 rows=PATCHES[group][index][1]
 rows[-2]=(penultimate,rows[-2][1]);rows[-1]=(terminal,rows[-1][1])
for group,patches in PATCHES.items():
 for index,(label,rows)in enumerate(patches):
  if group in(13,14,15)or(group==12 and index==1):profile=[1.25,1.55,1.80,1.80,1.80,1.70,1.55,1.25,1.0]
  elif group==10:profile=[1.15,1.35,1.50,1.55,1.55,1.45,1.30,1.10,1.0]
  elif group==11:profile=[1.10,1.30,1.45,1.45,1.35,1.25,1.15,1.05,1.0]
  elif group==12:profile=[1.15,1.25,1.30,1.25,1.15,1.05,1.0,1.0,1.0]
  else:profile=[1.15]*len(rows)
  for i,(co,w)in enumerate(rows):rows[i]=(co,tuple(v*profile[i]for v in w))
head=bpy.data.objects['01 / cheek to narrowing jaw and real eye apertures']
deps=bpy.context.evaluated_depsgraph_get();ev=head.evaluated_get(deps);head_data=ev.to_mesh()
inv=hair_objects[0].matrix_world.inverted()
head_tree=BVHTree.FromPolygons([inv@head.matrix_world@v.co for v in head_data.vertices],[tuple(poly.vertices)for poly in head_data.polygons])
ev.to_mesh_clear();head_centre=Vector((0,.015,1.205));fit_count=0;fit_max=0

def patch(rows,label):
 global fit_count,fit_max
 cols=5;R=len(rows);N=R*cols;outer=[];normals=[]
 for i,(co,width)in enumerate(rows):
  c=Vector(co);w=Vector(width)
  tangent=Vector(rows[min(R-1,i+1)][0])-Vector(rows[max(0,i-1)][0])
  n=w.cross(tangent).normalized()
  if n.dot(c-Vector((0,.025,1.205)))<0:n=-n
  for j in range(cols):
   u=j/(cols-1)*2-1
   # Thin, changing curved section; no broad inflated forelock crest.
   bulge=.0015+.003*math.sin(math.pi*i/(R-1))
   point=c+w*u+n*bulge*(1-u*u)
   radial=point-head_centre;distance=radial.length;direction=radial.normalized()
   hit=head_tree.ray_cast(head_centre,direction,1)
   if hit[0]is not None and distance<hit[3]+.009:
    delta=hit[3]+.009-distance;point+=direction*delta;fit_count+=1;fit_max=max(fit_max,delta)
   outer.append(point);normals.append(n)
 vs=list(outer)
 for i,v in enumerate(outer):
  t=(i//cols)/(R-1);vs.append(v-normals[i]*(.0016+.0022*math.sin(math.pi*t)))
 fs=[]
 for layer in range(2):
  for i in range(R-1):
   for j in range(cols-1):
    k=i*cols+j;f=(k,k+1,k+cols+1,k+cols)
    fs.append(tuple(q+layer*N for q in(f if layer==0 else tuple(reversed(f)))))
 for i in range(R-1):
  for j in[0,cols-1]:k=i*cols+j;l=k+cols;fs.append((k,l,l+N,k+N))
 for i in[0,R-1]:
  for j in range(cols-1):k=i*cols+j;fs.append((k,k+N,k+1+N,k+1))
 return vs,fs

layout=[]
for o in hair_objects:
 patches=PATCHES[int(o.name[:2])];vs=[];fs=[];old=o.data
 for label,rows in patches:
  v,f=patch(rows,label);offset=len(vs);vs.extend(v);fs.extend(tuple(k+offset for k in face)for face in f)
 d=bpy.data.meshes.new(o.name+' R8 medium-clump control nets');d.from_pydata(vs,[],fs);d.update()
 for m in old.materials:d.materials.append(m)
 for polygon in d.polygons:polygon.use_smooth=True
 o.data=d;bpy.context.view_layer.objects.active=o
 bpy.ops.object.select_all(action='DESELECT');o.select_set(True);bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.mesh.normals_make_consistent(inside=False);bpy.ops.object.mode_set(mode='OBJECT')
 assert len(o.modifiers)==1 and o.modifiers[0].type=='SUBSURF'and o.modifiers[0].levels==1
 for k in list(o.keys()):
  if k not in ['stage']:del o[k]
 o['authoring']='R8 explicit medium-clump control rows, turning cross-sections and separate endpoints; edit native quad vertices'
 o['mediumClumps']=len(patches);o['gridColumns']=5;o['clumpLabels']=[label for label,_ in patches]
 for child in list(o.children):
  if child.type=='CURVE':bpy.data.objects.remove(child,do_unlink=True)
 for label,rows in patches:
  data=bpy.data.curves.new('R8 reference / '+label,'CURVE');data.dimensions='3D';s=data.splines.new('POLY');s.points.add(len(rows)-1)
  for pt,(co,w)in zip(s.points,rows):pt.co=(*co,1)
  guide=bpy.data.objects.new('GUIDE / R8 / '+label,data);bpy.context.collection.objects.link(guide);guide.parent=o;guide.hide_render=True;guide.hide_viewport=True;guide['role']='reference only; parent native vertices are editable source'
  layout.append({'object':o.name,'clump':label,'rows':rows,'columns':5,'sideBackInferred':int(o.name[:2])>=12})
 bpy.data.meshes.remove(old)
bpy.context.view_layer.update()
for o in objects:
 if o.name in frozen:
  assert fingerprint(o)==frozen[o.name]['native'],o.name+' native changed'
  assert fingerprint(o,True)==frozen[o.name]['evaluated'],o.name+' evaluated changed'
deps=bpy.context.evaluated_depsgraph_get()
for o in objects:
 e=o.evaluated_get(deps);d=e.to_mesh();d.calc_loop_triangles();manifest['objects'][o.name]={'controlVertices':len(o.data.vertices),'controlQuads':sum(len(p.vertices)==4 for p in o.data.polygons),'triangles':len(d.loop_triangles)};e.to_mesh_clear()
manifest['triangles']=sum(x['triangles']for x in manifest['objects'].values())
assert manifest['triangles']<55000
manifest['revision']='R8 coherent whole-hair rearrangement / non-hair frozen / unaccepted review candidate'
manifest['hairMethod']='14 medium clumps in seven editable semantic groups; explicit row centres and transverse vectors; separate unequal endpoints; thin closed shells; local Subsurf1; reference guides are not live drivers'
manifest['sourceBaselineSha256']=hashlib.sha256(baseline.read_bytes()).hexdigest()
manifest['limitations']=[s for s in manifest['limitations']if not s.startswith('R7 is')]+['R8 is a whole-hair review candidate, not visual acceptance; side/back remain inferred']
source=ROOT/'assets/authoring/misaki-grayform-v1'
bpy.ops.object.select_all(action='DESELECT');hair_objects[0].select_set(True);bpy.context.view_layer.objects.active=hair_objects[0]
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
out=ROOT/'docs/reviews/evidence/misaki-grayform-v1-r8';out.mkdir(parents=True,exist_ok=True)
result={'baselineCommit':'6e1fd6dcbad834765331b893d5f709953e29244d','baselineBlendSha256':manifest['sourceBaselineSha256'],'changedHairGroups':[o.name for o in hair_objects],'mediumClumps':len(layout),'frozenNonHairObjects':frozen,'triangles':manifest['triangles'],'blendSha256':hashlib.sha256((source/'misaki-grayform.blend').read_bytes()).hexdigest(),'glbSha256':hashlib.sha256(glb.read_bytes()).hexdigest(),'clumpControlLayout':layout,'actualHeadEnvelopeFit':{'outerControlVerticesAdjusted':fit_count,'maxDisplacement':fit_max,'requestedCageClearance':.009,'limits':'Ray-fitted control envelope, not a full collision guarantee'},'limits':['Side/back inferred','Source/evaluated preservation is not art acceptance','No GUI operation or final rig/topology claim']}
(out/'blender-edit-preservation.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf8',newline='\n')
print(json.dumps({k:v for k,v in result.items()if k not in ['frozenNonHairObjects','clumpControlLayout']}))
