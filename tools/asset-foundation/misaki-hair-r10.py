"""Direct R10 sculpt of the passed R9 mesh. No base rebuild or added sheets.
Edit existing control vertices and soft crease only. Freeze topology, modifiers, vertex
groups, two lower overlaps and37 non-hair objects. Local soft crease edits on
existing edges articulate the shared turning planes. Background Blender only.
"""
import bpy,math,json,hashlib,argparse,sys
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[2]
p=argparse.ArgumentParser();p.add_argument('--baseline',required=True);p.add_argument('--manifest',required=True)
a=p.parse_args(sys.argv[sys.argv.index('--')+1:]);base=Path(a.baseline)
assert hashlib.sha256(base.read_bytes()).hexdigest()=='27b69fae409e7b8c589ae1af0c48b23e9b728a3c4d2cd933e0f955c5ced13b53'
bpy.ops.wm.open_mainfile(filepath=str(base));bpy.context.preferences.filepaths.save_version=0
manifest=json.loads(Path(a.manifest).read_text(encoding='utf8'));objects=[bpy.data.objects[n]for n in manifest['objects']]
main=bpy.data.objects['10 / primary swept fringe'];assert len(main.data.vertices)==337 and len(main.data.polygons)==320
def topology(o):
 return {'faces':[list(p.vertices)for p in o.data.polygons],'edges':[list(e.vertices)for e in o.data.edges],
 'vertexGroups':[[[g.group,g.weight]for g in v.groups]for v in o.data.vertices],
 'modifiers':[(m.type,m.levels,m.render_levels)if m.type=='SUBSURF'else(m.type,m.thickness,m.offset,m.use_rim)for m in o.modifiers]}
top=topology(main)
oldCreases=[x.value for x in main.data.attributes['crease_edge'].data]
def fingerprint(o,evaluated=False):
 deps=bpy.context.evaluated_depsgraph_get();d=bpy.data.meshes.new_from_object(o.evaluated_get(deps),depsgraph=deps)if evaluated else o.data
 v={'positions':[list(v.co)for v in d.vertices],'faces':[list(p.vertices)for p in d.polygons],'matrix':[list(r)for r in o.matrix_world],'materials':[m.name for m in d.materials]}
 h=hashlib.sha256(json.dumps(v,separators=(',',':')).encode()).hexdigest()
 if evaluated:bpy.data.meshes.remove(d)
 return h
frozen={o.name:{'native':fingerprint(o),'evaluated':fingerprint(o,True)}for o in objects if o!=main};assert len(frozen)==39
old=[v.co.copy()for v in main.data.vertices]
def wrap(x):return(x+math.pi)%(2*math.pi)-math.pi
def gauss(x,c,w):return math.exp(-(wrap(x-c)/w)**2)

# Column identity is the retained R9 topology, not a newly generated surface.
boundary=[k for k in range(81)if k//9 in(0,8)or k%9 in(0,8)]
def original_cap_xy(k):
 u=k%9/8*2-1;v=k//9/8*2-1
 return(.105*u*math.sqrt(1-v*v*.5),.100*v*math.sqrt(1-u*u*.5))
boundary.sort(key=lambda k:math.atan2(original_cap_xy(k)[0],-original_cap_xy(k)[1]))
angles=[math.atan2(original_cap_xy(k)[0],-original_cap_xy(k)[1])for k in boundary]

# Connected root / diagonal sweep / shorter above-ear support strokes.
# Each row: centre angle, transverse width, outward Y stroke, vertical turn.
MAIN=[(.10,.31,.010,.008),(-.10,.29,.016,.009),(-.30,.29,.022,.008),(-.45,.30,.022,.004),(-.58,.29,.019,.002),(-.63,.27,.014,-.002),(-.70,.24,.008,-.004),(-.76,.22,.003,-.010)]
VALLEY=[(.34,.24,.008,-.006),(.18,.24,.012,-.006),(.05,.25,.014,-.005),(-.10,.24,.014,-.004),(-.20,.23,.012,-.002),(-.27,.22,.009,.002),(-.31,.22,.005,.006),(-.34,.21,.002,.008)]
SUPPORT=[(.48,.31,.004,.004),(.63,.32,.004,.005),(.79,.33,.003,.004),(.92,.32,.002,.003),(1.04,.30,.001,.002),(1.12,.27,0,.005),(1.17,.25,0,.009),(1.19,.23,0,.013)]
edits=[];clipProtected=[]
for i,v in enumerate(main.data.vertices):
 c=old[i];delta=Vector((0,0,0));regions=[]
 if i<81:
  part=.030+.012*(c.y-.025)/.1;long=math.exp(-((c.y-.01)/.14)**4)
  valley=math.exp(-((c.x-part)/.022)**2)*long
  primary=math.exp(-((c.x-(part-.042))/.032)**2)*long
  secondary=math.exp(-((c.x-(part+.036))/.030)**2)*long
  delta.z+=-.008*valley+.007*primary+.003*secondary
  delta.x-=.004*primary*max(0,(.04-c.y)/.13)
  regions.append('offset roots')
 else:
  row=(i-81)//32;theta=angles[(i-81)%32];t=(row+1)/8
  centre,width,height,turn=MAIN[row];w=gauss(theta,centre,width)
  delta.y-=height*w;delta.z+=turn*w
  # Actual first-render correction: spread the diagonal mass tangentially
  # instead of inflating a rounded frontal hump.
  delta.x-=[.004,.012,.020,.022,.019,.012,.006,.002][row]*w
  centre,width,height,turn=VALLEY[row];valley=gauss(theta,centre,width)
  delta.y+=height*valley;delta.z+=turn*valley
  centre,width,height,turn=SUPPORT[row];support=gauss(theta,centre,width)
  delta.y-=height*support;delta.x+=.006*support*math.sin(math.pi*t);delta.z+=turn*support
  if w>.1:regions.append('diagonal main ridge')
  if valley>.1:regions.append('broad adjacent valley')
  if support>.1:regions.append('shorter above-ear support')
  # Blend the outside of the old clip hollow into the shorter turning plane.
  blend=gauss(theta,.98,.55)*math.exp(-((c.z-1.35)/.10)**2)*.60
  plane=1.1874677915742335*c.x+.5543182543513901*c.z-1.0092630557457134+.010
  delta.y+=(plane-c.y)*blend
  # Cheek-side fullness and lower return belong to the same mesh. Broad,
  # unequal boundary turns are kept connected, never split into strips.
  side=gauss(theta,-1.55,.60)+.65*gauss(theta,1.90,.52)
  radial=Vector((c.x,-0+c.y-.025,0)).normalized()
  if row in(4,5):delta+=radial*(.010 if row==4 else .014)*side
  if row>=6:
   phase=(row-5)/2;delta-=radial*.012*side*phase
   ends=-.017*gauss(theta,-1.72,.23)-.010*gauss(theta,-2.4,.26)-.012*gauss(theta,2.16,.28)+.011*gauss(theta,-2.04,.17)+.009*gauss(theta,2.65,.21)
   delta.z+=ends*phase
   if side>.1:regions.append('outward cheek to inward uneven return')
  # Preserve the proven clip seating core, including its original X/Z. The
  # surrounding shared vertices can blend; no displacement crosses in front
  # of the passed core. Actual final ray/pixel checks still follow.
  if .10<c.x<.215 and 1.255<c.z<1.36 and c.y<.05:
   delta.x=0;delta.z=0;delta.y=max(0,delta.y);clipProtected.append(i)
 if delta.length>1e-7:
  v.co=c+delta;edits.append({'index':i,'before':list(c),'after':list(v.co),'regions':regions})
# Preserve the original mesh but articulate two connected turning planes with
# soft crease on existing edges. The old straight front crease is replaced by
# one diagonal valley path, not repeated radial seams or new hair sheets.
edge_map={tuple(sorted(e.vertices)):e.index for e in main.data.edges}
creases=main.data.attributes['crease_edge'].data
for e in main.data.edges:
 x,y=e.vertices
 if x>=81 and y>=81 and(x-81)%32==(y-81)%32 and abs(angles[(x-81)%32])<1:
  creases[e.index].value=0
def soft_edge(x,y,value):
 index=edge_map.get(tuple(sorted((x,y))))
 if index is not None:creases[index].value=max(creases[index].value,value)
def flow_path(centres,last,strength):
 previous=None
 for row,theta in enumerate(centres[:last]):
  col=min(range(32),key=lambda j:abs(wrap(angles[j]-theta)))
  current=81+row*32+col
  if previous is None:soft_edge(boundary[col],current,strength*.65)
  else:
   old_row,old_col,old_id=previous
   same_column=81+row*32+old_col;soft_edge(old_id,same_column,strength)
   step=1 if col>=old_col else-1
   for j in range(old_col,col,step):soft_edge(81+row*32+j,81+row*32+j+step,strength*.8)
  previous=(row,col,current)
flow_path([x[0]for x in VALLEY],7,.42)
flow_path([.72,.84,.98,1.11],3,.28)
for row in range(1,7):soft_edge(row*9+4,(row+1)*9+4,.24)
creaseEdits=[{'edge':i,'before':old,'after':creases[i].value}for i,old in enumerate(oldCreases)if abs(old-creases[i].value)>1e-7]
main.data.update();bpy.context.view_layer.update()
assert topology(main)==top,'R9 topology / modifier / group anchors changed'
for o in objects:
 if o.name in frozen:
  assert fingerprint(o)==frozen[o.name]['native'],o.name+' native changed'
  assert fingerprint(o,True)==frozen[o.name]['evaluated'],o.name+' evaluated changed'
main['R10Sculpt']='Existing R9 vertices only: offset roots, diagonal ridge/broad valley, shorter above-ear supporting plane, cheek outward and uneven inward return'
deps=bpy.context.evaluated_depsgraph_get()
for o in objects:
 e=o.evaluated_get(deps);d=e.to_mesh();d.calc_loop_triangles();assert len(d.loop_triangles)==manifest['objects'][o.name]['triangles'];e.to_mesh_clear()
manifest['revision']='R10 direct connected-region sculpt of retained R9 control mesh / unaccepted candidate'
manifest['hairMethod']='Retained R9 337-vertex/320-quad continuous mesh, unchanged faces/groups/modifiers and two frozen overlaps; direct root/ridge/valley/support/cheek/return vertex sculpt with local soft crease on existing edges; no new sheets or materials'
manifest['sourceBaselineSha256']=hashlib.sha256(base.read_bytes()).hexdigest()
manifest['limitations']=[s for s in manifest['limitations']if not s.startswith('R9 is')]+['R10 is an unaccepted flow/identity review candidate; no contact/collision certification']
source=ROOT/'assets/authoring/misaki-grayform-v1';bpy.ops.object.select_all(action='DESELECT');main.select_set(True);bpy.context.view_layer.objects.active=main
bpy.ops.wm.save_as_mainfile(filepath=str(source/'misaki-grayform.blend'))
(source/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf8',newline='\n')
groups={};baked=[]
for src in objects:
 n=int(src.name[:2]);group='face'if n<3 else'feature-placement'if n<10 else'hair'if n<17 else'own-left-clip'if n<20 else'clothed-body'
 d=bpy.data.meshes.new_from_object(src.evaluated_get(deps),preserve_all_data_layers=True,depsgraph=deps);o=bpy.data.objects.new(src.name+' export',d);bpy.context.collection.objects.link(o);o.matrix_world=src.matrix_world.copy();groups.setdefault(group,[]).append(o)
for name,items in groups.items():
 bpy.ops.object.select_all(action='DESELECT')
 for o in items:o.select_set(True)
 bpy.context.view_layer.objects.active=items[0];bpy.ops.object.join();o=items[0];o.name='misaki-grayform/'+name;o['grayformGroup']=name;baked.append(o)
bpy.ops.object.select_all(action='DESELECT')
for o in baked:o.select_set(True)
glb=ROOT/'public/assets/misaki-grayform-v1/misaki-grayform.glb';bpy.ops.export_scene.gltf(filepath=str(glb),export_format='GLB',use_selection=True,export_apply=True,export_extras=True,export_animations=False)
out=ROOT/'docs/reviews/evidence/misaki-grayform-v1-r10';out.mkdir(parents=True,exist_ok=True)
r={'baselineCommit':'76d6db3342ed8ab27d51f68a39c9f52f408fbba1','baselineBlendSha256':manifest['sourceBaselineSha256'],'retainedR9TopologyGroupsModifiers':True,'creaseEdits':creaseEdits,'frozenOtherObjects':frozen,'frozenNonHairObjects':37,'frozenLowerOverlaps':2,'mainControlVertices':337,'mainControlQuads':320,'vertexEdits':edits,'clipProtectedIndices':clipProtected,'mainStrokeRows':MAIN,'valleyStrokeRows':VALLEY,'supportStrokeRows':SUPPORT,'triangles':manifest['triangles'],'blendSha256':hashlib.sha256((source/'misaki-grayform.blend').read_bytes()).hexdigest(),'glbSha256':hashlib.sha256(glb.read_bytes()).hexdigest(),'limits':['Side/back inferred','Direct control-vertex edits via background Python, not GUI sculpting','No art or contact/collision acceptance']}
(out/'blender-edit-preservation.json').write_text(json.dumps(r,indent=2)+'\n',encoding='utf8',newline='\n')
print(json.dumps({'editedVertices':len(edits),'clipProtectedVertices':len(clipProtected),'triangles':r['triangles'],'blendSha256':r['blendSha256'],'glbSha256':r['glbSha256']}))
