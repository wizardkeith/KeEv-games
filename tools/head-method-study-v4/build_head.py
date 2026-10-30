"""Bounded head-only method study: sculpted mesh sockets + native NURBS hair.
No reference pixels are sampled into any material or projected onto geometry.
"""
import bpy,bmesh,math,json,hashlib
from pathlib import Path
from mathutils import Vector,Matrix
ROOT=Path(__file__).resolve().parents[2]
ASSET=ROOT/'assets/authoring/head-method-study-v4';OUT=ROOT/'docs/reviews/evidence/head-method-study-v4'
ASSET.mkdir(parents=True,exist_ok=True);OUT.mkdir(parents=True,exist_ok=True)
ORIGINAL=ROOT/'assets/authoring/target-model-proof-v3/misaki-display-model-proof.blend'
original_hash=hashlib.sha256(ORIGINAL.read_bytes()).hexdigest()
assert original_hash=='d58bb179624083b30de52e0852bae7025281fd8bc5347a9ed9e95abb4a2583fa'
REFERENCE=ROOT/'docs/codex-v4/reference/Approved_Visual_Target_Misaki.png'
assert hashlib.sha256(REFERENCE.read_bytes()).hexdigest()=='9f855d2ecfd120bb45c001db3fa9b5a3e3b58b2b3c2a4cf9e7ebfda84f8f7114'

# Normalize a baked copy of v3 head into an unposed head-centred space. The
# original native source is never saved over. All original pose/scale is removed.
bpy.ops.wm.open_mainfile(filepath=str(ORIGINAL))
scene=bpy.context.scene
baseline=bpy.data.collections.new('01 Preserved v3 head / projection control');scene.collection.children.link(baseline)
oldroot=bpy.data.objects['Head pose / inferred small tilt'];deps=bpy.context.evaluated_depsgraph_get()
baked=[];normalise=Matrix.Translation((0,0,-.24))@oldroot.matrix_world.inverted()
for obj in list(oldroot.children_recursive):
 if obj.type not in ('MESH','CURVE'):continue
 data=bpy.data.meshes.new_from_object(obj.evaluated_get(deps),preserve_all_data_layers=True,depsgraph=deps)
 data.transform(normalise@obj.matrix_world)
 copy=bpy.data.objects.new('V3 control / '+obj.name,data);baseline.objects.link(copy);baked.append(copy)
for obj in list(bpy.data.objects):
 if obj not in baked:bpy.data.objects.remove(obj,do_unlink=True)
for c in list(scene.collection.children):
 if c!=baseline:scene.collection.children.unlink(c)

study=bpy.data.collections.new('02 New mesh-socket and NURBS method');scene.collection.children.link(study)
context=bpy.data.collections.new('03 Shared studio and bust');scene.collection.children.link(context)
current=study
def link(o):
 for c in list(o.users_collection):c.objects.unlink(o)
 current.objects.link(o);return o
def rgb(h):
 vals=[int(h[i:i+2],16)/255 for i in (1,3,5)]
 return tuple(v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4 for v in vals)
def mix(a,b,t):return tuple(x*(1-t)+y*t for x,y in zip(a,b))
def mat(name,h,rough=.65,spec=.23):
 m=bpy.data.materials.new('Head study / '+name);m.use_nodes=True;p=m.node_tree.nodes['Principled BSDF'];p.inputs['Base Color'].default_value=(*rgb(h),1);p.inputs['Roughness'].default_value=rough;p.inputs['Specular IOR Level'].default_value=spec;m.diffuse_color=(*rgb(h),1);return m
skin=mat('warm skin','#F2C5AD',.69);rose=mat('ear and lower lid','#DE9F8B',.76)
skinpaint=mat('sculpted cheek vertex paint','#FFFFFF',.69)
irispaint=mat('iris radial vertex paint','#FFFFFF',.42)
for m in (skinpaint,irispaint):
 n=m.node_tree.nodes.new('ShaderNodeVertexColor');n.layer_name='StudyPaint';m.node_tree.links.new(n.outputs['Color'],m.node_tree.nodes['Principled BSDF'].inputs['Base Color'])
white=mat('warm inset eye white','#F9EEDB',.48);dark=mat('soft lash and pupil','#36251E',.5)
browmat=mat('warm brows','#79543C',.77);lip=mat('warm lip','#B96D5B',.75);mouthmat=mat('smile opening','#80483D',.84);tooth=mat('small tooth glint','#F4E5CF',.72)
hairbase=mat('dark continuous scalp underlayer','#463023',.67)
ivory=mat('ivory leaf clip','#F6E4B8',.48)

def mesh(name,vs,fs,m,sub=0,thick=0):
 d=bpy.data.meshes.new(name+' controls');d.from_pydata(vs,[],fs);d.update();o=bpy.data.objects.new(name,d);current.objects.link(o);d.materials.append(m)
 for p in d.polygons:p.use_smooth=True
 if sub:s=o.modifiers.new('Editable subdivision','SUBSURF');s.levels=sub;s.render_levels=sub
 if thick:s=o.modifiers.new('Thin actual 3D surface','SOLIDIFY');s.thickness=thick;s.offset=0
 return o
def paint(o,fn):
 col=o.data.color_attributes.new(name='StudyPaint',type='FLOAT_COLOR',domain='CORNER')
 for lp in o.data.loops:col.data[lp.index].color=(*fn(o.data.vertices[lp.vertex_index].co),1)
def ellipsoid(name,co,size,m):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=32,ring_count=20,location=co);o=link(bpy.context.object);o.name=name;o.scale=size;o.data.materials.append(m)
 for p in o.data.polygons:p.use_smooth=True
 return o
def curve(name,pts,r,m,radii=None):
 d=bpy.data.curves.new(name,'CURVE');d.dimensions='3D';d.resolution_u=12;d.bevel_depth=r;d.bevel_resolution=3;s=d.splines.new('BEZIER');s.bezier_points.add(len(pts)-1)
 for i,(p,co)in enumerate(zip(s.bezier_points,pts)):p.co=co;p.handle_left_type='AUTO';p.handle_right_type='AUTO';p.radius=radii[i]if radii else 1
 o=bpy.data.objects.new(name,d);current.objects.link(o);d.materials.append(m);return o

# Directly displaced uniform sphere mesh, with open eye sockets. Anatomical
# masks stay editable as vertex groups rather than loft cross-section controls.
EX=.081;EZ=-.010
def facial_displacement(x,z):
 nose=.008*math.exp(-(x/.018)**2-((z+.061)/.023)**2)
 cheek=.004*(math.exp(-((x-.103)/.046)**2-((z+.070)/.045)**2)+math.exp(-((x+.103)/.046)**2-((z+.070)/.045)**2))
 sockets=.006*(math.exp(-((x-EX)/.048)**2-((z-EZ)/.035)**2)+math.exp(-((x+EX)/.048)**2-((z-EZ)/.035)**2))
 return -nose-cheek+sockets
def front_y(x,z):
 jaw=1-.10*max(0,-z/.185)
 return .014-.137*math.sqrt(max(.01,1-(x/(.181*jaw))**2-(z/.185)**2))+facial_displacement(x,z)
bpy.ops.mesh.primitive_uv_sphere_add(segments=64,ring_count=48,radius=1)
face=link(bpy.context.object);face.name='New head / free mesh facial sculpt and open sockets'
bm=bmesh.new();bm.from_mesh(face.data)
for v in bm.verts:
 p=v.co.copy();z=p.z*.185;v.co=(p.x*.181*(1-.10*max(0,-p.z)),.014+p.y*.137,z)
 if p.y<0:v.co.y+=facial_displacement(v.co.x,z)
delete=[]
for f in bm.faces:
 p=f.calc_center_median()
 if p.y<-.035 and min(((p.x-side*EX)/.044)**2+((p.z-EZ)/.031)**2 for side in(-1,1))<.92:delete.append(f)
bmesh.ops.delete(bm,geom=delete,context='FACES');bm.to_mesh(face.data);bm.free();face.data.materials.clear();face.data.materials.append(skinpaint)
for p in face.data.polygons:p.use_smooth=True
s=face.modifiers.new('Editable facial surface refinement','SUBSURF');s.levels=1;s.render_levels=1
s=face.modifiers.new('Socket rim skin thickness','SOLIDIFY');s.thickness=.0012;s.offset=-1
for name,cx,cz,wx,wz in [('Cheek own left',.105,-.075,.055,.05),('Cheek own right',-.105,-.075,.055,.05),('Nose bridge',0,-.05,.025,.045),('Jaw and chin',0,-.155,.12,.045)]:
 group=face.vertex_groups.new(name=name)
 for v in face.data.vertices:
  weight=math.exp(-((v.co.x-cx)/wx)**2-((v.co.z-cz)/wz)**2)
  if weight>.01:group.add([v.index],weight,'REPLACE')
def cheek_colour(p):
 amount=max(math.exp(-((p.x-.107)/.045)**2-((p.z+.068)/.036)**2),math.exp(-((p.x+.107)/.045)**2-((p.z+.068)/.036)**2))
 return mix(rgb('#F2C5AD'),rgb('#E68D85'),.66*amount*max(0,min(1,(-p.y-.01)/.08)))
paint(face,cheek_colour)
for side in(-1,1):
 ellipsoid('Sculpt ear / '+str(side),(side*.177,.006,-.043),(.023,.022,.037),skin)
 ellipsoid('Ear recess / '+str(side),(side*.191,-.004,-.042),(.006,.013,.022),rose)
 cx=side*EX;cy=-.082;zc=EZ
 ellipsoid('Inset actual eyeball / '+str(side),(cx,cy,zc),(.045,.024,.033),white)
 def eye_y(x,z):return cy-.024*math.sqrt(max(.01,1-((x-cx)/.045)**2-((z-zc)/.033)**2))
 ic=cx-side*.003;iz=zc-.001
 def disc(name,rx,rz,offset,m,rings=5):
  vs=[(ic,eye_y(ic,iz)-offset,iz)];fs=[];N=48
  for r in range(1,rings+1):
   for j in range(N):
    a=j/N*math.tau;x=ic+rx*r/rings*math.cos(a);z=iz+rz*r/rings*math.sin(a);vs.append((x,eye_y(x,z)-offset,z))
  for j in range(N):fs.append((0,1+j,1+(j+1)%N))
  for r in range(rings-1):
   for j in range(N):k=1+r*N+j;q=1+r*N+(j+1)%N;fs.append((k,q,q+N,k+N))
  return mesh(name,vs,fs,m)
 disc('Soft iris edge / '+str(side),.025,.027,.0005,browmat)
 iris=disc('Painted curved iris / '+str(side),.024,.026,.0009,irispaint)
 paint(iris,lambda p:mix(rgb('#4A3023'),rgb('#C19465'),max(0,min(1,(iz+.02-p.z)/.048))))
 disc('Rounded pupil / '+str(side),.011,.017,.0014,dark)
 for dx,dz,r in[(-.008,.011,.0045),(.009,-.011,.0017)]:
  x=ic+dx;z=iz+dz;ellipsoid('Small catchlight / '+str(side),(x,eye_y(x,z)-.0024,z),(r,.0008,r),tooth)
 upper=[];lower=[];crease=[]
 for j in range(13):
  a=math.pi-j/12*math.pi;x=cx+.046*math.cos(a);z=zc+.033*math.sin(a)+side*.06*(x-cx)
  upper.append((x,front_y(x,z)-.0015,z));crease.append((x,front_y(x,z+.004)-.001,z+.004))
  a=math.pi+j/12*math.pi;x=cx+.045*math.cos(a);z=zc+.028*math.sin(a)+side*.06*(x-cx);lower.append((x,front_y(x,z)-.001,z))
 curve('Actual upper eyelid / '+str(side),crease,.0023,skin,[.1,.3,.6,.9,1,1,1,1,1,.8,.5,.3,.1])
 curve('Soft upper lash / '+str(side),upper,.0018,dark,[.1,.3,.5,.7,.9,1,1,1,.95,.8,.6,.3,.1])
 curve('Warm lower lid / '+str(side),lower,.0013,rose,[.1,.2,.4,.5,.7,.7,.7,.7,.6,.4,.3,.2,.1])
 eyebrow=[(cx+x,front_y(cx+x,z)-.001,z)for x,z in[(-.032,.055),(-.012,.065),(.012,.066),(.030,.060)]]
 curve('Soft expressive brow / '+str(side),eyebrow,.0018,browmat,[.15,.8,1,.1])
mouth=[]
for j in range(32):
 a=j/32*math.tau;x=.019*math.cos(a);z=-.104+.0025*math.sin(a)+.10*x+.005*(x/.019)**2;mouth.append((x,front_y(x,z)-.001,z))
mesh('Small warm smile opening',[(0,front_y(0,-.104)-.001,-.104)]+mouth,[(0,j+1,(j+1)%32+1)for j in range(32)],mouthmat)
curve('Smile lower soft lip',[(x,front_y(x,z)-.002,z)for x,z in[(-.016,-.101),(0,-.108),(.014,-.098)]],.0011,lip,[.1,.7,.1])

# Dark scalp underlayer is a sculpted mesh with an open forehead/ear region.
bpy.ops.mesh.primitive_uv_sphere_add(segments=48,ring_count=24,radius=1)
cap=link(bpy.context.object);cap.name='Hair / sculpted continuous scalp support'
bm=bmesh.new();bm.from_mesh(cap.data)
for v in bm.verts:
 p=v.co.copy();z=.035+.207*p.z
 factor=1
 if z<.08:
  desired=.97-.08*max(0,min(1,(-z-.02)/.12));factor=desired/max(.15,math.sqrt(max(.001,1-p.z*p.z)))
 v.co=(.207*p.x*factor-.008*(1-p.z*p.z),.022+.177*p.y*factor,z)
delete=[f for f in bm.faces if (f.calc_center_median().y<-.025 and f.calc_center_median().z<.115+.20*f.calc_center_median().x and abs(f.calc_center_median().x)<.177)or f.calc_center_median().z<-.125]
bmesh.ops.delete(bm,geom=delete,context='FACES');bm.to_mesh(cap.data);bm.free();cap.data.materials.append(hairbase)
for p in cap.data.polygons:p.use_smooth=True
mod=cap.modifiers.new('Scalp surface refinement','SUBSURF');mod.levels=1
mod=cap.modifiers.new('Scalp real thickness','SOLIDIFY');mod.thickness=.002

# UV-driven painted brown flow on editable NURBS sheets, not a reference decal.
hair=mat('surface hair painted flow','#6D4832',.56)
nodes=hair.node_tree.nodes;links=hair.node_tree.links
tex=nodes.new('ShaderNodeTexCoord');sep=nodes.new('ShaderNodeSeparateXYZ');links.new(tex.outputs['UV'],sep.inputs[0])
ramp=nodes.new('ShaderNodeValToRGB');ramp.color_ramp.interpolation='EASE'
colours=[(0,'#3E291F'),(.30,'#846046'),(.62,'#6C4933'),(1,'#432C21')]
ramp.color_ramp.elements.remove(ramp.color_ramp.elements[1])
for i,(p,h)in enumerate(colours):
 el=ramp.color_ramp.elements[0]if i==0 else ramp.color_ramp.elements.new(p);el.position=p;el.color=(*rgb(h),1)
links.new(sep.outputs['Y'],ramp.inputs['Fac']);links.new(ramp.outputs['Color'],nodes['Principled BSDF'].inputs['Base Color'])
nurbs_objects=[]
def surface_lock(name,rows):
 bpy.ops.surface.primitive_nurbs_surface_surface_add();o=link(bpy.context.object);o.name=name
 bpy.ops.object.mode_set(mode='EDIT');bpy.ops.curve.select_all(action='SELECT');bpy.ops.curve.subdivide(number_cuts=1);bpy.ops.object.mode_set(mode='OBJECT')
 spline=o.data.splines[0];spline.use_endpoint_u=True;spline.use_endpoint_v=True;spline.order_u=4;spline.order_v=4
 assert spline.point_count_u==7 and spline.point_count_v==7
 for i,(co,w,roll)in enumerate(rows):
  centre=Vector(co);width=Vector(w)
  for j in range(7):
   u=j/6*2-1;pt=centre+width*u
   # A shallow rolled turning plane and twisted control border, not a tube.
   pt.y-=.006*(1-u*u)*math.sin(i/6*math.pi);pt.z+=roll*u*u
   # Surface-root constraint: seat upper control rows on the 3D scalp/bob
   # support, then release the last two rows as thin independent tapered ends.
   blend=[1,1,1,.9,.6,.2,0][i]
   if any(label in name for label in ('dominant swept','overlapping inner','shorter clip')):
    support=.022-.177*math.sqrt(max(.01,1-((pt.x+.008)/.207)**2-((pt.z-.035)/.207)**2))-.004
    pt.y=pt.y*(1-blend)+support*blend
   else:
    vertical=(pt.z-.035)/.207;rad=math.sqrt(max(.02,1-vertical*vertical))if pt.z>=.08 else .97-.08*max(0,min(1,(-pt.z-.02)/.12))
    direction=Vector(((pt.x+.008)/.207,(pt.y-.022)/.177,0)).normalized()
    support=Vector((-.008+direction.x*(.207*rad+.005),.022+direction.y*(.177*rad+.005),pt.z))
    pt.x=pt.x*(1-blend)+support.x*blend;pt.y=pt.y*(1-blend)+support.y*blend
   spline.points[i*7+j].co=(*pt,1)
 o.data.resolution_u=10;o.data.resolution_v=10
 if hasattr(spline,'use_smooth'):spline.use_smooth=True
 o.data.materials.append(hair)
 solid=o.modifiers.new('Thin tapered hair surface','SOLIDIFY');solid.thickness=.0015;solid.offset=0
 nurbs_objects.append(o);return o

surface_lock('NURBS / dominant swept fringe',[
 ((.028,-.025,.235),(.010,0,0),0),((.021,-.087,.220),(.028,-.002,.004),.002),((-.012,-.145,.178),(.048,-.003,.012),.004),((-.053,-.179,.123),(.050,-.003,.018),.005),((-.090,-.183,.071),(.039,-.003,.023),.003),((-.129,-.158,.023),(.019,-.002,.014),-.002),((-.153,-.128,.017),(.001,0,.001),0)])
surface_lock('NURBS / overlapping inner fringe',[
 ((.029,-.034,.237),(.006,0,0),0),((.025,-.100,.208),(.018,-.001,.003),.001),((.005,-.160,.153),(.028,-.002,.010),.003),((-.028,-.189,.096),(.029,-.002,.015),.003),((-.057,-.179,.047),(.022,-.002,.012),.001),((-.080,-.154,.022),(.010,-.001,.007),-.001),((-.099,-.132,.030),(.001,0,0),0)])
surface_lock('NURBS / shorter clip-side sweep',[
 ((.035,.000,.237),(.009,0,0),0),((.085,-.073,.209),(.025,.004,-.006),.002),((.135,-.126,.165),(.034,.008,-.014),.003),((.178,-.139,.111),(.030,.013,-.020),.004),((.200,-.113,.061),(.020,.015,-.014),.002),((.208,-.077,.034),(.011,.009,-.006),0),((.199,-.052,.036),(.001,.001,0),0)])
paths=[
 ('own right face frame',[(-.024,.016,.232),(-.098,-.080,.184),(-.167,-.123,.104),(-.207,-.101,.010),(-.223,-.067,-.082),(-.209,-.033,-.152),(-.182,-.047,-.161)],[.010,.026,.035,.036,.028,.014,.001]),
 ('own right outer wave',[(-.055,.052,.224),(-.137,.019,.155),(-.200,.009,.068),(-.233,.032,-.027),(-.246,.035,-.104),(-.231,.004,-.172),(-.209,-.021,-.178)],[.010,.027,.038,.039,.030,.015,.001]),
 ('own left ear-side wave',[(.075,.040,.227),(.151,.016,.168),(.205,.023,.082),(.235,.035,-.012),(.239,.039,-.100),(.215,.011,-.155),(.188,-.015,-.157)],[.009,.026,.034,.036,.028,.013,.001]),
 ('own left short lower overlap',[(.136,.093,.165),(.192,.083,.111),(.222,.087,.034),(.239,.095,-.042),(.230,.077,-.117),(.206,.043,-.181),(.185,.023,-.171)],[.009,.025,.033,.034,.028,.012,.001]),
 ('back right inferred',[(-.089,.099,.205),(-.167,.131,.136),(-.212,.158,.045),(-.227,.163,-.049),(-.223,.140,-.123),(-.201,.101,-.181),(-.178,.071,-.167)],[.009,.029,.040,.042,.031,.015,.001]),
 ('back centre inferred',[(.011,.074,.231),(.017,.164,.156),(.022,.202,.067),(.013,.209,-.029),(-.005,.188,-.111),(-.027,.153,-.179),(-.046,.127,-.160)],[.009,.029,.041,.044,.034,.017,.001]),
 ('back left inferred',[(.086,.083,.214),(.165,.143,.147),(.211,.171,.057),(.231,.162,-.032),(.227,.137,-.111),(.205,.101,-.174),(.179,.071,-.158)],[.009,.028,.039,.041,.031,.015,.001])]
for name,points,widths in paths:
 rows=[]
 for i,(p,w)in enumerate(zip(points,widths)):
  r=Vector((p[0],p[1]-.02,0)).normalized();lateral=Vector((-r.y,r.x,.08))
  rows.append((p,lateral*w,.003*math.sin(i*.9)))
 surface_lock('NURBS / '+name,rows)

# Small real leaf clip, attached to the clip-side surface; no reference image.
def leaf(name,base,tip,width):
 b=Vector(base);t=Vector(tip);direction=(t-b).normalized();cross=direction.cross(Vector((.5,-.86,.05))).normalized();vs=[];fs=[]
 for i in range(7):
  q=i/6;c=b.lerp(t,q);w=width*math.sin(q*math.pi)
  for u in(-1,0,1):vs.append(c+cross*u*w+Vector((0,-.0015*(1-u*u),0)))
 for i in range(6):
  for j in range(2):k=i*3+j;fs.append((k,k+1,k+4,k+3))
 mesh(name,vs,fs,ivory,1,.001)
leaf('Own left upper leaf',(.167,-.144,.106),(.183,-.128,.149),.008)
leaf('Own left lower leaf',(.168,-.145,.107),(.150,-.157,.131),.007)

# Shared pose is applied after both methods are built. A common neutral bust
# prevents clothing changes being mistaken for head-method improvements.
for col in (baseline,study):
 root=bpy.data.objects.new(col.name+' pose',None);col.objects.link(root)
 for obj in list(col.objects):
  if obj!=root:obj.parent=root
 root.rotation_euler.y=-.17;root.rotation_euler.z=-.03
current=context
ellipsoid('Shared neck',(0,.01,-.214),(.034,.033,.070),skin)
sage=mat('shared muted sage bust','#78866C',.92);blouse=mat('shared ivory blouse','#E5D9C2',.9)
ellipsoid('Shared shoulder bust',(0,.02,-.345),(.174,.083,.125),sage)
mesh('Shared blouse front',[(-.05,-.068,-.243),(.05,-.068,-.243),(.072,-.08,-.433),(-.072,-.08,-.433)],[(0,1,2,3)],blouse,1,.002)
for side in(-1,1):mesh('Shared pointed collar '+str(side),[(side*.007,-.047,-.225),(side*.031,-.049,-.227),(side*.060,-.08,-.277),(side*.026,-.09,-.257)],[(0,1,2,3)],blouse,0,.002)
def area(name,co,energy,size,colour):
 d=bpy.data.lights.new(name,'AREA');d.energy=energy;d.shape='DISK';d.size=size;d.color=colour;o=bpy.data.objects.new(name,d);context.objects.link(o);o.location=co;o.rotation_euler=(Vector((0,0,-.03))-o.location).to_track_quat('-Z','Y').to_euler()
area('Study warm window',(-2.5,-3,3),380,2.5,(1,.88,.75));area('Study neutral fill',(2.5,-2,1.0),70,3,(.9,.93,1));area('Study warm rim',(1,2,2.5),220,2,(1,.85,.68))
world=bpy.data.worlds.new('Study quiet ivory');world.use_nodes=True;world.node_tree.nodes['Background'].inputs[0].default_value=(.68,.62,.53,1);world.node_tree.nodes['Background'].inputs[1].default_value=.35;scene.world=world
def camera(name,co,target):
 d=bpy.data.cameras.new(name);d.type='ORTHO';d.ortho_scale=.62;o=bpy.data.objects.new(name,d);context.objects.link(o);o.location=co;o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler();return o
cameras={'matched':camera('Matched inferred portrait projection',(.90,-3.6,.20),(0,0,-.045)), 'front':camera('World front head proof',(0,-3.6,.13),(0,0,-.04)), 'three-quarter':camera('World 35 degree head proof',(2.5,-3.6,.20),(0,0,-.04))}
scene.render.engine='CYCLES';scene.cycles.device='CPU';scene.cycles.samples=64;scene.cycles.adaptive_threshold=.035;scene.cycles.use_denoising=True;scene.cycles.seed=0
scene.render.threads_mode='FIXED';scene.render.threads=8;scene.render.resolution_x=900;scene.render.resolution_y=900;scene.render.resolution_percentage=100;scene.render.film_transparent=False
scene.view_settings.view_transform='AgX';scene.view_settings.look='AgX - Medium High Contrast';scene.view_settings.exposure=.1
for name in ['use_stamp_date','use_stamp_time','use_stamp_render_time','use_stamp_frame','use_stamp_frame_range','use_stamp_scene','use_stamp_camera','use_stamp_lens','use_stamp_filename','use_stamp_marker','use_stamp_memory','use_stamp_hostname']:
 if hasattr(scene.render,name):setattr(scene.render,name,False)
scene.render.use_stamp=True;scene.render.use_stamp_note=True;scene.render.use_stamp_labels=False;scene.render.stamp_font_size=14
scene.render.stamp_note_text='BLENDER HEAD METHOD STUDY / native mesh sockets + NURBS surfaces / UNACCEPTED'
baseline.hide_render=True;scene.camera=cameras['matched'];bpy.context.view_layer.update()
scene['referenceSha256']=hashlib.sha256(REFERENCE.read_bytes()).hexdigest();scene['scope']='Local head-only method study; no full-body integration or external upload; inferred hidden forms'
bpy.context.preferences.filepaths.save_version=0
source=ASSET/'head-method-study.blend';bpy.ops.wm.save_as_mainfile(filepath=str(source))
manifest={'source':source.relative_to(ROOT).as_posix(),'sourceSha256':hashlib.sha256(source.read_bytes()).hexdigest(),'v3RollbackSha256':original_hash,'method':'Direct BMesh sphere sculpt with open eye sockets/inset eyeballs; editable 7x7 NURBS hair patches with 1.5mm thickness and UV procedural paint','nurbsSurfaces':len(nurbs_objects),'referenceSha256':scene['referenceSha256'],'limits':['UNACCEPTED head-only local method study','Side/back and camera inferred','No brush-stroke GUI sculpt, reference-image projection, full-body integration or export acceptance']}
for key,cam in cameras.items():
 baseline.hide_render=True;study.hide_render=False;scene.camera=cam;scene.render.filepath=str(OUT/('new-head-'+key+'.png'));bpy.ops.render.render(write_still=True)
baseline.hide_render=False;study.hide_render=True;scene.camera=cameras['matched'];scene.render.stamp_note_text='BLENDER V3 HEAD CONTROL / same inferred camera and lights / UNACCEPTED'
scene.render.filepath=str(OUT/'v3-head-control.png');bpy.ops.render.render(write_still=True)
assert hashlib.sha256(ORIGINAL.read_bytes()).hexdigest()==original_hash
(ASSET/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf8',newline='\n')
print('LOCAL_HEAD_METHOD_STUDY_RENDERED '+json.dumps(manifest))
