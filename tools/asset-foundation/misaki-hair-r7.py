"""R7: edit the real R6 source into a forehead curtain, not a closed leaf.

Background Blender only. Pass --baseline <R6 .blend> --manifest <R6 manifest>
after --. The hand-authored rows below are actual editable quad cage vertices;
no skull sphere, voxel remesh, texture shading or global smoothing is used.
Only object 10 and 11 cages and their reference guides may change.
"""
import bpy, math, json, hashlib, argparse, sys
from pathlib import Path
from mathutils import Vector

ROOT=Path(__file__).resolve().parents[2]
args=argparse.ArgumentParser()
args.add_argument('--baseline',required=True)
args.add_argument('--manifest',required=True)
opt=args.parse_args(sys.argv[sys.argv.index('--')+1:])
baseline=Path(opt.baseline)
assert hashlib.sha256(baseline.read_bytes()).hexdigest()=='e8d5b774c5aba9fecbba3800732592c6b1eb66b34e74e6622c0099d6b60ed7a9'
bpy.ops.wm.open_mainfile(filepath=str(baseline))
bpy.context.preferences.filepaths.save_version=0
manifest=json.loads(Path(opt.manifest).read_text(encoding='utf8'))
objects=[bpy.data.objects[name]for name in manifest['objects']]
changed={'10 / primary swept fringe','11 / underlapping temple turn'}

def fingerprint(o,evaluated=False):
 deps=bpy.context.evaluated_depsgraph_get()
 d=bpy.data.meshes.new_from_object(o.evaluated_get(deps),depsgraph=deps)if evaluated else o.data
 payload={'vertices':[list(v.co)for v in d.vertices],
          'faces':[list(p.vertices)for p in d.polygons],
          'matrix':[list(row)for row in o.matrix_world],
          'materials':[m.name for m in d.materials]}
 value=hashlib.sha256(json.dumps(payload,separators=(',',':')).encode()).hexdigest()
 if evaluated:bpy.data.meshes.remove(d)
 return value

before={o.name:{'cage':fingerprint(o),'evaluated':fingerprint(o,True)}for o in objects if o.name not in changed}

# Each row specifies both borders and its forehead-facing depth. The last two
# rows have separate column offsets: the lower edge stays broad and diagonal,
# with three unequal turning ends rather than both borders meeting at a tip.
# Coordinates are source-local metres; the frozen R3 head offset stays on TRS.
MAIN=[
 # left x,y,z; right x,y,z; centre depth bulge
 ((.007,.012,1.425),(.045,.012,1.427),.001),
 ((-.020,-.035,1.434),(.054,-.033,1.431),.005),
 ((-.070,-.096,1.418),(.056,-.098,1.406),.012),
 ((-.126,-.147,1.379),(.044,-.152,1.369),.015),
 ((-.168,-.174,1.329),(.024,-.183,1.325),.012),
 ((-.190,-.177,1.275),(.004,-.189,1.290),.010),
 ((-.201,-.161,1.224),(-.012,-.187,1.265),.006),
 ((-.199,-.142,1.183),(-.021,-.182,1.250),.003),
 ((-.189,-.124,1.153),(-.024,-.177,1.245),.001),
 ((-.179,-.117,1.140),(-.026,-.174,1.243),0),
]
# A second shorter layer turns across the inner forehead and emerges from
# beneath the main curtain. It shares the part, but not the main tip or axis.
SUPPORT=[
 ((.009,.010,1.422),(.038,.010,1.424),.001),
 ((.000,-.043,1.428),(.053,-.039,1.425),.003),
 ((-.025,-.107,1.401),(.060,-.100,1.393),.008),
 ((-.053,-.151,1.365),(.058,-.146,1.350),.008),
 ((-.070,-.175,1.322),(.045,-.169,1.307),.005),
 ((-.064,-.180,1.280),(.023,-.181,1.270),.003),
 ((-.049,-.177,1.249),(.001,-.180,1.239),.001),
 ((-.033,-.173,1.236),(-.013,-.174,1.232),0),
]

def remake(name,rows,cols,rim_offsets):
 o=bpy.data.objects[name];old=o.data;vs=[];R=len(rows);N=R*cols
 front=[]
 for i,(left,right,bulge)in enumerate(rows):
  for j in range(cols):
   u=j/(cols-1);p=Vector(left).lerp(Vector(right),u)
   # Curl around the forehead: a curved section, not a flat plate.
   p.y-=math.sin(math.pi*u)*bulge
   # Individually drawn terminal heights survive into the native cage.
   p.z+=rim_offsets[j]*max(0,(i/(R-1)-.62)/.38)**2
   front.append(p)
 vs.extend(front)
 for i in range(R):
  for j in range(cols):
   p=front[i*cols+j].copy()
   p.y+=.002+.005*math.sin(math.pi*i/(R-1))
   vs.append(p)
 fs=[]
 for layer in range(2):
  for i in range(R-1):
   for j in range(cols-1):
    a=i*cols+j;f=(a,a+1,a+cols+1,a+cols)
    fs.append(tuple(k+layer*N for k in (f if layer==0 else tuple(reversed(f)))))
 for i in range(R-1):
  for j in [0,cols-1]:a=i*cols+j;b=a+cols;fs.append((a,b,b+N,a+N))
 for i in [0,R-1]:
  for j in range(cols-1):a=i*cols+j;fs.append((a,a+N,a+1+N,a+1))
 d=bpy.data.meshes.new(name+' R7 explicit forehead curtain cage');d.from_pydata(vs,[],fs);d.update()
 for m in old.materials:d.materials.append(m)
 for p in d.polygons:p.use_smooth=True
 o.data=d
 bpy.context.view_layer.objects.active=o
 bpy.ops.object.select_all(action='DESELECT');o.select_set(True)
 bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.mesh.normals_make_consistent(inside=False);bpy.ops.object.mode_set(mode='OBJECT')
 # The original one-level local subdivision modifier remains editable.
 assert len(o.modifiers)==1 and o.modifiers[0].type=='SUBSURF'
 assert o.modifiers[0].levels==1
 for key in ['leftBezier','rightBezier','spineBezier','thicknessControls']:
  if key in o:del o[key]
 o['authoring']='R7 explicit forehead-wrapping quad cage; asymmetric three-turn lower rim; edit vertices directly'
 o['gridRows']=R;o['gridColumns']=cols;o['controlCoordinateSpace']='source-local; frozen R3 object transform'
 o['rimColumnOffsets']=rim_offsets
 for child in list(o.children):
  if child.type=='CURVE':bpy.data.objects.remove(child,do_unlink=True)
 # Visible-in-outliner guide splines are references, not falsely claimed live
 # drivers. Native control vertices, side wall and Subsurf are the real source.
 for label,indices in [('left',[i*cols for i in range(R)]),('right',[i*cols+cols-1 for i in range(R)]),('centre',[i*cols+cols//2 for i in range(R)])]:
  curve=bpy.data.curves.new('R7 reference '+name+' '+label,'CURVE');curve.dimensions='3D'
  s=curve.splines.new('POLY');s.points.add(R-1)
  for p,k in zip(s.points,indices):p.co=(*front[k],1)
  guide=bpy.data.objects.new('GUIDE / '+name+' / R7 '+label,curve);bpy.context.collection.objects.link(guide);guide.parent=o;guide.hide_render=True;guide.hide_viewport=True;guide['role']='reference only; edit parent quad cage'
 bpy.data.meshes.remove(old)

remake('10 / primary swept fringe',MAIN,11,[0,-.003,-.014,-.007,.004,-.008,-.013,.001,-.006,-.003,0])
remake('11 / underlapping temple turn',SUPPORT,7,[0,-.003,-.006,.001,-.004,-.002,0])
bpy.context.view_layer.update()
for o in objects:
 if o.name not in changed:
  assert fingerprint(o)==before[o.name]['cage'],o.name+' native source changed'
  assert fingerprint(o,True)==before[o.name]['evaluated'],o.name+' evaluated geometry changed'
deps=bpy.context.evaluated_depsgraph_get()
for o in objects:
 e=o.evaluated_get(deps);d=e.to_mesh();d.calc_loop_triangles()
 manifest['objects'][o.name]={'controlVertices':len(o.data.vertices),'controlQuads':sum(len(p.vertices)==4 for p in o.data.polygons),'triangles':len(d.loop_triangles)}
 e.to_mesh_clear()
manifest['triangles']=sum(x['triangles']for x in manifest['objects'].values())
manifest['revision']='R7 explicit forehead curtain and separate inner overlap / other 42 source cages frozen'
manifest['hairMethod']='R7 objects 10/11: native explicit closed two-layer quad control nets, staggered diagonal rim and forehead depth; local Subsurf1; 12-16 frozen R6; guides reference only'
manifest['sourceBaselineSha256']='e8d5b774c5aba9fecbba3800732592c6b1eb66b34e74e6622c0099d6b60ed7a9'
manifest['limitations'].append('R7 is a single hair-form review candidate; technical validation is not visual acceptance')
out=ROOT/'assets/authoring/misaki-grayform-v1'
bpy.ops.object.select_all(action='DESELECT')
bpy.data.objects['10 / primary swept fringe'].select_set(True)
bpy.context.view_layer.objects.active=bpy.data.objects['10 / primary swept fringe']
bpy.ops.wm.save_as_mainfile(filepath=str(out/'misaki-grayform.blend'))
(out/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf8')

# Same evaluated grouping/order/export settings as the frozen R6 builder.
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
bpy.ops.export_scene.gltf(filepath=str(ROOT/'public/assets/misaki-grayform-v1/misaki-grayform.glb'),export_format='GLB',use_selection=True,export_apply=True,export_extras=True,export_animations=False)
report={'baselineBlendSha256':manifest['sourceBaselineSha256'],'changedNativeCages':sorted(changed),'frozenSourceCages':len(before),'frozenSourceAndEvaluated':before,'triangles':manifest['triangles'],'objects':manifest['objects'],'newBlendSha256':hashlib.sha256((out/'misaki-grayform.blend').read_bytes()).hexdigest(),'newGlbSha256':hashlib.sha256((ROOT/'public/assets/misaki-grayform-v1/misaki-grayform.glb').read_bytes()).hexdigest()}
evidence=ROOT/'docs/reviews/evidence/misaki-grayform-v1-r7';evidence.mkdir(parents=True,exist_ok=True)
(evidence/'blender-edit-preservation.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf8')
print(json.dumps({k:v for k,v in report.items()if k!='frozenSourceAndEvaluated'and k!='objects'}))
