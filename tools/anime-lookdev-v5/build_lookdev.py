"""Researched built-in head/shoulders lookdev. No GUI or addon required.

Actual EEVEE Shader-to-RGB bands, UV colour maps, Normal Edit face control and
flat custom-profile Bezier hair with taper and tilt. Never saves over v3.
"""
import bpy,math,json,hashlib
from pathlib import Path
from mathutils import Matrix,Vector
from mathutils.bvhtree import BVHTree
ROOT=Path(__file__).resolve().parents[2];A=ROOT/'assets/authoring/anime-lookdev-v5';O=ROOT/'docs/reviews/evidence/anime-lookdev-v5';O.mkdir(parents=True,exist_ok=True)
SOURCE=ROOT/'assets/authoring/target-model-proof-v3/misaki-display-model-proof.blend'
before=hashlib.sha256(SOURCE.read_bytes()).hexdigest();assert before=='d58bb179624083b30de52e0852bae7025281fd8bc5347a9ed9e95abb4a2583fa'
bpy.ops.wm.open_mainfile(filepath=str(SOURCE));scene=bpy.context.scene
def col(name):
 c=bpy.data.collections.new(name);scene.collection.children.link(c);return c
control=col('01 V3 head control');study=col('02 Researched head lookdev');bust=col('03 Shared original upper torso');studio=col('04 Studio');helpers=col('05 Editable profiles and normal guides')
oldhead=bpy.data.objects['Head pose / inferred small tilt'];oldbody=bpy.data.objects['Misaki / model origin at feet']
headmat=Matrix.Translation((0,0,-.24))@oldhead.matrix_world.inverted();bodymat=Matrix.Translation((0,0,-1.37))@oldbody.matrix_world.inverted()
kept=[];newobjects=[]
def clone(obj,matrix,collection,prefix):
 o=obj.copy();o.data=obj.data.copy();o.parent=None;o.matrix_world=Matrix.Identity(4);o.data.transform(matrix@obj.matrix_world);o.name=prefix+obj.name;collection.objects.link(o);kept.append(o);return o
for obj in list(oldhead.children_recursive):
 if obj.type not in('MESH','CURVE'):continue
 clone(obj,headmat,control,'V3 control / ')
 if obj.get('proof_group')=='hair'or obj.name.startswith(('Thin chestnut iris rim','Round soft pupil','Eye catchlight','Small soft nose')):continue
 newobjects.append(clone(obj,headmat,study,'Lookdev / '))
for obj in list(bpy.data.collections['01 Misaki / coloured editable model'].objects):
 if obj.type not in('MESH','CURVE')or obj in oldhead.children_recursive:continue
 if obj.name.startswith(('Blouse torso','Visible neck','Open sage cardigan','Cardigan open knit edge','Dropped sleeve','Turned cuff','Pointed blouse collar','Small blouse button','Blouse centre sewn placket')):clone(obj,bodymat,bust,'Shared / ')
for obj in list(bpy.data.objects):
 if obj not in kept:bpy.data.objects.remove(obj,do_unlink=True)
for c in list(scene.collection.children):
 if c not in(control,study,bust,studio,helpers):scene.collection.children.unlink(c)

def rgb(h):
 c=[int(h[i:i+2],16)/255 for i in(1,3,5)];return tuple(x/12.92 if x<=.04045 else((x+.055)/1.055)**2.4 for x in c)
images={name:bpy.data.images.load(str(A/'textures'/name),check_existing=True)for name in('face-own-blush-uv.png','iris-own-detail-uv.png','hair-own-broad-flow-uv.png')}
for image in images.values():image.pack()
def toon(name,colour='#FFFFFF',texture=None,style='skin',unlit=False):
 m=bpy.data.materials.new('Researched toon / '+name);m.use_nodes=True;n=m.node_tree.nodes;n.clear();links=m.node_tree.links
 out=n.new('ShaderNodeOutputMaterial');em=n.new('ShaderNodeEmission');links.new(em.outputs[0],out.inputs['Surface'])
 if texture:
  tex=n.new('ShaderNodeTexImage');tex.image=images[texture];base=tex.outputs['Color'];m['portable_base_texture']=texture
 else:
  base_node=n.new('ShaderNodeRGB');base_node.name='Portable base colour';base=base_node.outputs[0];base.default_value=(*rgb(colour),1);m['portable_base_rgba']=[*rgb(colour),1]
 if unlit:links.new(base,em.inputs['Color']);m['lookdev_role']='Own UV painted unlit eye/line';return m
 diffuse=n.new('ShaderNodeBsdfDiffuse');diffuse.inputs['Color'].default_value=(1,1,1,1)
 light=n.new('ShaderNodeShaderToRGB');ramp=n.new('ShaderNodeValToRGB');ramp.color_ramp.interpolation='EASE';links.new(diffuse.outputs[0],light.inputs[0]);links.new(light.outputs['Color'],ramp.inputs['Fac'])
 palette={'skin':[(.66,.49,.50),(.94,.82,.76),(1,.98,.91)],'hair':[(.45,.38,.43),(.86,.77,.71),(1.03,.99,.91)],'cloth':[(.55,.54,.61),(.88,.84,.81),(1,.98,.92)]}[style]
 stops=[(0,0),(.28,0),(.36,1),(.65,1),(.73,2),(1,2)]
 for i,(p,k)in enumerate(stops):
  e=ramp.color_ramp.elements[i]if i<2 else ramp.color_ramp.elements.new(p);e.position=p;e.color=(*palette[k],1)
 multiply=n.new('ShaderNodeMixRGB');multiply.blend_type='MULTIPLY';multiply.inputs[0].default_value=1;links.new(base,multiply.inputs[1]);links.new(ramp.outputs[0],multiply.inputs[2]);links.new(multiply.outputs[0],em.inputs['Color'])
 m['lookdev_role']='EEVEE-only Diffuse -> Shader to RGB -> softly transitioned coloured bands; not arbitrary GLB lighting'
 return m
skin=toon('skin UV and designed shadow',texture='face-own-blush-uv.png');neck=toon('neck','#F1C5AC');white=toon('eye whites','#F7EBD6');iris=toon('iris own detail',texture='iris-own-detail-uv.png',unlit=True)
hair=toon('flattened hair own flow',texture='hair-own-broad-flow-uv.png',style='hair');hairunder=toon('scalp backing','#503326',style='hair')
lash=toon('warm lid line','#493025',unlit=True);brow=toon('brow','#765139',unlit=True);lip=toon('small smile','#A96354',unlit=True);ivory=toon('leaf clip','#F3DFB0',style='cloth')
face=next(o for o in newobjects if 'rounded cheek and narrowing jaw'in o.name)
# Direct cage edits preserve an editable mesh; no reference image plane/decal.
for v in face.data.vertices:
 x,y,z=v.co
 if z<-.085:v.co.x*=1-.12*min(1,(-z-.085)/.085)
 if z<-.11:v.co.z+=.009*min(1,(-z-.11)/.065)
 if y<-.02:v.co.y+=.003*math.exp(-(x/.14)**2-((z+.035)/.12)**2)
uv=face.data.uv_layers.active or face.data.uv_layers.new(name='Own spherical face UV')
for loop in face.data.loops:
 p=face.data.vertices[loop.vertex_index].co;uv.data[loop.index].uv=(.5+math.atan2(p.x,-(p.y-.014))/math.tau,.5+p.z/.40)
face.data.materials.clear();face.data.materials.append(skin)
group=face.vertex_groups.new(name='Designed front cheek shading control')
for v in face.data.vertices:
 p=v.co;w=max(0,min(1,(-p.y-.015)/.08))*max(.15,1-(abs(p.x)/.18)**4)
 if w>.01:group.add([v.index],w,'REPLACE')
guide=bpy.data.objects.new('Directional cheek normal guide',None);helpers.objects.link(guide);guide.location=(0,-2,0)
normal=face.modifiers.new('Controlled anime cheek normals','NORMAL_EDIT');normal.mode='DIRECTIONAL';normal.target=guide;normal.mix_factor=.60;normal.vertex_group=group.name
bpy.context.view_layer.update();tree=BVHTree.FromObject(face,bpy.context.evaluated_depsgraph_get())
for obj in newobjects:
 if obj==face:continue
 name=obj.name.lower()
 if 'soft gradient chestnut iris'in name:
  centre=sum((v.co for v in obj.data.vertices),Vector())/len(obj.data.vertices);side=1 if centre.x>0 else-1
  for v in obj.data.vertices:v.co.x+=side*.005
  uv=obj.data.uv_layers.active or obj.data.uv_layers.new(name='Own iris UV')
  xs=[v.co.x for v in obj.data.vertices];zs=[v.co.z for v in obj.data.vertices];cx=(min(xs)+max(xs))/2;cz=(min(zs)+max(zs))/2
  for loop in obj.data.loops:
   p=obj.data.vertices[loop.vertex_index].co;uv.data[loop.index].uv=((p.x-min(xs))/(max(xs)-min(xs)),(p.z-min(zs))/(max(zs)-min(zs)))
  material=iris
 elif 'eye white'in name:material=white
 elif 'brow'in name:material=brow
 elif 'smile'in name:material=lip
 elif 'clip'in name or 'ivory'in name:material=ivory
 elif 'lash'in name:material=lash
 else:material=neck
 obj.data.materials.clear();obj.data.materials.append(material)
 if any(t in name for t in('eye white','iris','eyelid','eyelash','lower lid','brow','lash')):
  if obj.type=='MESH':
   for v in obj.data.vertices:
    p=v.co;side=1 if p.x>0 else-1
    if 'iris'not in name:p.x+=side*.005
    hit=tree.ray_cast(Vector((p.x,-1,p.z)),Vector((0,1,0)))[0]
    if hit:p.y=hit.y-(.0038 if 'iris'in name else .0016)
  elif obj.type=='CURVE':
   for spline in obj.data.splines:
    for p in spline.bezier_points:
     p.co.x+=(1 if p.co.x>0 else-1)*.005;hit=tree.ray_cast(Vector((p.co.x,-1,p.co.z)),Vector((0,1,0)))[0]
    if hit:p.co.y=hit.y-(.0058 if 'lash'in name else .0040)
    p.handle_left_type='AUTO';p.handle_right_type='AUTO'

# Flat custom bevel profile plus Bezier radius/taper and point tilt.
def helper_curve(name,points,closed=False):
 d=bpy.data.curves.new(name,'CURVE');d.dimensions='2D';s=d.splines.new('POLY');s.points.add(len(points)-1)
 for p,co in zip(s.points,points):p.co=(*co,1)
 s.use_cyclic_u=closed;o=bpy.data.objects.new(name,d);helpers.objects.link(o);o.hide_render=True;return o
profile=helper_curve('Editable flattened rounded profile',[(.026*math.cos(j/16*math.tau),.0032*math.sin(j/16*math.tau),0)for j in range(16)],True)
taper=helper_curve('Editable radius taper',[(0,.35,0),(.15,.85,0),(.45,1,0),(.72,.8,0),(.9,.4,0),(1,.015,0)])
haircurves=[]
def lock(name,pts,radii,tilts):
 d=bpy.data.curves.new(name,'CURVE');d.dimensions='3D';d.resolution_u=18;d.twist_mode='MINIMUM';d.bevel_mode='OBJECT';d.bevel_object=profile;d.taper_object=taper;d.taper_radius_mode='MULTIPLY';d.use_fill_caps=True
 s=d.splines.new('BEZIER');s.bezier_points.add(len(pts)-1)
 for i,(p,co)in enumerate(zip(s.bezier_points,pts)):p.co=co;p.handle_left_type='AUTO';p.handle_right_type='AUTO';p.radius=radii[i];p.tilt=tilts[i]
 o=bpy.data.objects.new(name,d);study.objects.link(o);d.materials.append(hair);haircurves.append(o);return o
lock('Designed main diagonal sweep',[(.027,-.015,.214),(.009,-.081,.204),(-.030,-.131,.162),(-.072,-.160,.107),(-.112,-.155,.046),(-.140,-.125,.021)],[.65,2.25,2.65,2.4,1.3,.03],[.1,.18,.30,.40,.35,.15])
lock('Shorter inner fringe overlap',[(.029,-.024,.216),(.024,-.095,.183),(.003,-.148,.129),(-.032,-.171,.077),(-.065,-.151,.039),(-.084,-.125,.040)],[.4,1.3,1.65,1.5,.8,.02],[.12,.15,.28,.35,.25,.1])
lock('Shorter own-left swept support',[(.033,.002,.218),(.089,-.074,.192),(.146,-.121,.145),(.184,-.128,.093),(.205,-.100,.056),(.205,-.060,.046)],[.65,1.6,1.9,1.55,.8,.02],[.1,.25,.5,.8,1.0,1.1])
paths=[('own-right face frame',[(-.045,.030,.205),(-.123,-.060,.149),(-.187,-.096,.068),(-.215,-.070,-.021),(-.227,-.039,-.103),(-.208,-.005,-.160),(-.184,-.023,-.172)],[.7,1,1.15,1.15,.9,.5,.02],1.0),
 ('own-right outer return',[(-.04,.08,.19),(-.145,.040,.117),(-.209,.044,.024),(-.235,.057,-.078),(-.231,.028,-.151),(-.207,-.004,-.180)],[.5,.95,1.15,1.1,.8,.02],1.15),
 ('own-left ear-side return',[(.075,.05,.20),(.152,.024,.14),(.198,.014,.061),(.218,.023,-.037),(.211,.028,-.115),(.189,-.004,-.160)],[.6,.95,1.1,1.05,.75,.02],-1.0),
 ('own-left short overlap',[(.130,.09,.155),(.199,.077,.076),(.230,.084,-.016),(.228,.070,-.106),(.207,.035,-.171),(.184,.014,-.164)],[.6,.95,1.1,.95,.6,.02],-.9),
 ('inferred back own-right',[(-.08,.09,.19),(-.172,.135,.12),(-.216,.155,.018),(-.225,.150,-.088),(-.204,.108,-.166),(-.177,.075,-.158)],[.6,1,1.2,1.05,.7,.02],.8),
 ('inferred back centre',[(.015,.075,.205),(.023,.168,.128),(.020,.207,.026),(.005,.206,-.077),(-.022,.165,-.167),(-.041,.133,-.151)],[.6,1.05,1.25,1.15,.7,.02],0),
 ('inferred back own-left',[(.080,.087,.19),(.166,.145,.12),(.214,.175,.018),(.228,.150,-.081),(.206,.111,-.166),(.179,.076,-.153)],[.6,1.0,1.2,1.1,.7,.02],-.8)]
for name,pts,radii,tilt in paths:lock('Designed flattened lock / '+name,pts,radii,[tilt*(.4+.6*i/(len(pts)-1))for i in range(len(pts))])

# Only a short crown/backing remains; all visible fringe/lower ends are curves.
verts=[];faces=[];C=48;R=8
for i in range(R):
 t=i/(R-1)
 for j in range(C):
  a=j/C*math.tau;front=max(0,math.cos(a))**3
  z=.215+((- .115)*(1-front)+.155*front-.215)*t
  rx=[.012,.09,.15,.185,.198,.199,.188,.170][i];ry=[.01,.075,.128,.155,.169,.168,.151,.130][i]
  verts.append((.02*(1-t)+rx*math.sin(a),.025-ry*math.cos(a)+.025*front*t,z))
for i in range(R-1):
 for j in range(C):k=i*C+j;q=i*C+(j+1)%C;faces.append((k,q,q+C,k+C))
d=bpy.data.meshes.new('Short continuous backing controls');d.from_pydata(verts,[],faces);d.materials.append(hairunder);o=bpy.data.objects.new('Short crown backing / not a full helmet fringe',d);study.objects.link(o)
for p in d.polygons:p.use_smooth=True
mod=o.modifiers.new('Backing smoothing','SUBSURF');mod.levels=2;mod=o.modifiers.new('Backing thickness','SOLIDIFY');mod.thickness=.0015

# Shared pose and original upper torso, no full-character integration.
roots=[]
for c in(control,study):
 root=bpy.data.objects.new(c.name+' pose',None);c.objects.link(root)
 for obj in list(c.objects):
  if obj!=root:obj.parent=root
 root.rotation_euler.y=-.17;root.rotation_euler.z=-.03;root.location.z=-.032;roots.append(root)
guide.parent=roots[1]
broot=bpy.data.objects.new('Shared torso inferred stance',None);bust.objects.link(broot)
for obj in list(bust.objects):
 if obj!=broot:obj.parent=broot
broot.rotation_euler.z=-.26
palette={}
for obj in bust.objects:
 if not hasattr(obj.data,'materials'):continue
 for i,mat in enumerate(obj.data.materials):
  if mat not in palette:
   p=mat.node_tree.nodes.get('Principled BSDF')if mat.use_nodes else None;c=p.inputs['Base Color'].default_value if p else mat.diffuse_color
   m=toon('shared bust '+mat.name,style='cloth');m.node_tree.nodes['Portable base colour'].outputs[0].default_value=tuple(c);m['portable_base_rgba']=list(c);palette[mat]=m
  obj.data.materials[i]=palette[mat]

def area(name,co,energy,size):
 d=bpy.data.lights.new(name,'AREA');d.energy=energy;d.size=size;o=bpy.data.objects.new(name,d);studio.objects.link(o);o.location=co;o.rotation_euler=(Vector((0,0,-.04))-o.location).to_track_quat('-Z','Y').to_euler();return d
key=area('Controlled broad key',(-2.5,-3,3),190,2.5);fill=area('Controlled soft fill',(2.5,-2,1.5),45,3);rim=area('Gentle rim',(1.0,2,2.5),75,2)
world=bpy.data.worlds.new('Lookdev neutral world');world.use_nodes=True;world.node_tree.nodes['Background'].inputs[0].default_value=(.40,.40,.40,1);world.node_tree.nodes['Background'].inputs[1].default_value=.25;scene.world=world
def camera(name,co):
 d=bpy.data.cameras.new(name);d.type='ORTHO';d.ortho_scale=.62;o=bpy.data.objects.new(name,d);studio.objects.link(o);o.location=co;o.rotation_euler=(Vector((0,0,-.045))-o.location).to_track_quat('-Z','Y').to_euler();return o
cameras={'matched':camera('Matched inferred reference projection',(.9,-3.6,.20)),'front':camera('Front',(0,-3.6,.13)),'three-quarter':camera('Three-quarter',(2.5,-3.6,.20)),'profile':camera('Profile',(3.6,0,.13))}
scene.render.engine='BLENDER_EEVEE';scene.view_settings.view_transform='Standard';scene.view_settings.look='None';scene.view_settings.exposure=0;scene.view_settings.gamma=1
scene.render.resolution_x=700;scene.render.resolution_y=700;scene.render.resolution_percentage=100;scene.render.image_settings.file_format='PNG'
scene.render.use_stamp=True;scene.render.use_stamp_note=True;scene.render.use_stamp_labels=False;scene.render.stamp_font_size=13
for prop in ['use_stamp_date','use_stamp_time','use_stamp_render_time','use_stamp_frame','use_stamp_frame_range','use_stamp_scene','use_stamp_camera','use_stamp_lens','use_stamp_filename','use_stamp_marker','use_stamp_memory','use_stamp_hostname']:
 if hasattr(scene.render,prop):setattr(scene.render,prop,False)
control.hide_render=True;scene.camera=cameras['matched'];bpy.context.preferences.filepaths.save_version=0
source=A/'researched-head-lookdev.blend';bpy.ops.wm.save_as_mainfile(filepath=str(source))
rendered=[]
for mood in ('neutral','warm'):
 key.color=(1,1,1)if mood=='neutral'else(1,.85,.70);fill.color=(1,1,1)if mood=='neutral'else(.9,.94,1);rim.color=(1,1,1)if mood=='neutral'else(1,.84,.68)
 for mode,c in [('v3-control',control),('researched-study',study)]:
  control.hide_render=mode!='v3-control';study.hide_render=mode!='researched-study'
  scene.render.stamp_note_text='ACTUAL EEVEE / '+mode+' / '+mood+' / unaccepted head study; no Unity claim'
  for view,cam in cameras.items():
   scene.camera=cam;name=mode+'-'+mood+'-'+view+'.png';scene.render.filepath=str(O/name);bpy.ops.render.render(write_still=True);rendered.append(name)
assert hashlib.sha256(SOURCE.read_bytes()).hexdigest()==before
manifest={'source':source.relative_to(ROOT).as_posix(),'sourceSha256':hashlib.sha256(source.read_bytes()).hexdigest(),'v3SourceUnchangedSha256':before,'renderEngine':'BLENDER_EEVEE','method':['actual Shader to RGB with 3 soft colour bands','own UV blush/iris/hair colour maps','directional Normal Edit on front cheeks','custom flat curve profile with taper/radius/point tilt','face cage edits and surface-fitted eye/lid meshes'],'hairCurves':len(haircurves),'renders':[{ 'file':n,'sha256':hashlib.sha256((O/n).read_bytes()).hexdigest()}for n in rendered],'artStatus':'Unaccepted research candidate; compare actual pixels before judgment','portability':'Native Blender lighting graph only; no claim arbitrary toon nodes travel through GLB or Unity','guiStatus':'Background work only. CUA app approval timeout not retried.'}
(A/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf8',newline='\n')
print('RESEARCHED_HEAD_LOOKDEV_RENDERED '+json.dumps(manifest))
