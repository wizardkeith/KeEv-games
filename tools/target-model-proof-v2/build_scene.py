"""Whole-character and representative display Blender proof, independent of game.
Editable native geometry, restrained PBR/vertex colours, packed inherited textures.
Unknown side/back details and the standing pose are explicitly inferred.
"""
import bpy,bmesh,math,json,hashlib,random,sys
from pathlib import Path
from mathutils import Vector,Matrix
ROOT=Path(__file__).resolve().parents[2]
SRC=ROOT/'assets/authoring/target-model-proof-v2';OUT=ROOT/'docs/reviews/evidence/target-model-proof-v2'
SRC.mkdir(parents=True,exist_ok=True);(SRC/'exports').mkdir(exist_ok=True);OUT.mkdir(parents=True,exist_ok=True)
REFERENCE=ROOT/'docs/codex-v4/reference/Approved_Visual_Target_Misaki.png'
assert hashlib.sha256(REFERENCE.read_bytes()).hexdigest()=='9f855d2ecfd120bb45c001db3fa9b5a3e3b58b2b3c2a4cf9e7ebfda84f8f7114'
bpy.ops.wm.read_factory_settings(use_empty=True);bpy.context.preferences.filepaths.save_version=0
random.seed(4030)
def collection(name):
 c=bpy.data.collections.new(name);bpy.context.scene.collection.children.link(c);return c
CHAR=collection('01 Misaki / coloured editable model');DISPLAY=collection('02 Display / reusable authored components');STUDIO=collection('03 Blender studio / not exported')
current=CHAR;made=[]
def register(o,group):
 for c in list(o.users_collection):c.objects.unlink(o)
 current.objects.link(o);o['proof_group']=group;made.append(o);return o
def lin(c):return c/12.92 if c<=.04045 else((c+.055)/1.055)**2.4
def rgb(hex):return tuple(lin(int(hex[i:i+2],16)/255)for i in(1,3,5))
def material(name,color,rough=.65,sub=.0):
 m=bpy.data.materials.new(name);m.use_nodes=True;m.diffuse_color=(*rgb(color),1)
 p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=m.diffuse_color;p.inputs['Roughness'].default_value=rough;p.inputs['Subsurface Weight'].default_value=sub;p.inputs['Specular IOR Level'].default_value=.28
 return m
skin=material('Misaki / warm peach skin','#EFC4A7',.66,.06)
skinvc=material('Misaki / vertex-painted peach and soft blush','#FFFFFF',.59,.08)
sage=material('Misaki / muted sage cardigan','#758369',.90)
sageedge=material('Misaki / knit edge and rolled cuff','#69765D',.93)
shirt=material('Misaki / warm ivory blouse','#E7DDCB',.88)
apron=material('Misaki / unbleached cream apron','#DCCCB1',.93)
seam=material('Misaki / quiet linen seam','#B8A989',.93)
plum=material('Misaki / dusty plum skirt','#685562',.93)
shoe=material('Misaki / soft brown leather','#65452E',.49)
sole=material('Misaki / warm dark sole','#493527',.73)
hair=material('Misaki / cocoa bob vertex colour','#FFFFFF',.66)
hairdark=material('Misaki / root and quiet accent','#493024',.56)
brow=material('Misaki / soft brown brows','#70503B',.73)
cream=material('Misaki / ivory leaf clip','#F5E5BB',.43)
white=material('Misaki / warm eye whites','#F4EADD',.50)
earinner=material('Misaki / warm rose eyelids and ears','#DEAC94',.75)
iris=material('Misaki / warm chestnut iris','#8A542D',.30)
irisvc=material('Misaki / gradient chestnut iris vertex colour','#FFFFFF',.38)
irislight=material('Misaki / amber lower iris','#B88043',.35)
irisdark=material('Misaki / iris outer ring','#4B2F20',.36)
pupil=material('Misaki / pupil and soft lash','#30221C',.40)
lip=material('Misaki / restrained smile','#A65D4E',.70)
highlight=material('Misaki / eye catchlight','#FFFDF3',.22)
for m in(skinvc,hair,irisvc):
 n=m.node_tree.nodes.new('ShaderNodeVertexColor');n.layer_name='ArtColour';m.node_tree.links.new(n.outputs['Color'],m.node_tree.nodes['Principled BSDF'].inputs['Base Color'])

# Small packed tangent-space weave tile, carried by the GLB as an actual image.
# No generated reference picture is projected onto the model.
weave=bpy.data.images.new('Misaki / restrained woven normal tile',width=128,height=128,alpha=True)
pixels=[]
for iy in range(128):
 for ix in range(128):
  u=ix/128*math.tau*8;v=iy/128*math.tau*8
  dx=.28*math.cos(u+.45*math.sin(v))*math.sin(v)
  dy=.28*math.sin(u+.45*math.sin(v))*math.cos(v)
  n=Vector((-dx,-dy,1)).normalized();pixels.extend((n.x*.5+.5,n.y*.5+.5,n.z*.5+.5,1))
weave.pixels.foreach_set(pixels);weave.colorspace_settings.name='Non-Color';weave.pack()
for m in(sage,sageedge,shirt,apron,plum):
 m['clothNormal']=True
 tex=m.node_tree.nodes.new('ShaderNodeTexImage');tex.image=weave;tex.extension='REPEAT'
 normal=m.node_tree.nodes.new('ShaderNodeNormalMap');normal.inputs['Strength'].default_value=.12 if m in(sage,sageedge)else .06
 m.node_tree.links.new(tex.outputs['Color'],normal.inputs['Color']);m.node_tree.links.new(normal.outputs['Normal'],m.node_tree.nodes['Principled BSDF'].inputs['Normal'])

def mesh(name,verts,faces,mat,group='character',sub=0,thick=0):
 d=bpy.data.meshes.new(name+' editable');d.from_pydata(verts,[],faces);d.update();o=bpy.data.objects.new(name,d);current.objects.link(o);o.data.materials.append(mat);o['proof_group']=group;made.append(o)
 for p in d.polygons:p.use_smooth=True
 if mat.get('clothNormal'):
  uv=d.uv_layers.new(name='Woven metre scale')
  for poly in d.polygons:
   for li in poly.loop_indices:
    co=d.vertices[d.loops[li].vertex_index].co;uv.data[li].uv=(co.x*30,co.z*30)
 if sub:s=o.modifiers.new('Editable surface subdivision','SUBSURF');s.levels=sub;s.render_levels=sub
 if thick:s=o.modifiers.new('Actual garment thickness','SOLIDIFY');s.thickness=thick;s.offset=0
 return o

def ring_uv(o,cols,rows,uscale,vcoords,closed=True):
 if not o.data.materials[0].get('clothNormal'):return
 uv=o.data.uv_layers.active
 for poly in o.data.polygons:
  indices=[o.data.loops[li].vertex_index for li in poly.loop_indices]
  cap=len(set(k//cols for k in indices))==1
  seam=closed and 0 in [k%cols for k in indices]and cols-1 in[k%cols for k in indices]
  for li,k in zip(poly.loop_indices,indices):
   j=k%cols
   if cap:
    a=j/cols*math.tau;uv.data[li].uv=(.5+.5*math.cos(a),.5+.5*math.sin(a))
   else:
    u=j/(cols if closed else cols-1)
    if seam and j==0:u=1
    uv.data[li].uv=(u*uscale,vcoords[k//cols])
def paint(o,fn):
 col=o.data.color_attributes.new(name='ArtColour',type='FLOAT_COLOR',domain='CORNER')
 for p in o.data.polygons:
  for li in p.loop_indices:col.data[li].color=(*fn(o.data.vertices[o.data.loops[li].vertex_index].co),1)
def mix(a,b,t):return tuple(x*(1-t)+y*t for x,y in zip(a,b))
def ellipsoid(name,co,scale,mat,group='character',segments=24,rings=16):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=segments,ring_count=rings,location=co);o=bpy.context.object;o.name=name;o.scale=scale;o.data.materials.append(mat)
 for p in o.data.polygons:p.use_smooth=True
 return register(o,group)
def curve(name,points,radius,mat,group='details',radii=None):
 d=bpy.data.curves.new(name,'CURVE');d.dimensions='3D';d.resolution_u=12;d.bevel_depth=radius;d.bevel_resolution=3
 s=d.splines.new('BEZIER');s.bezier_points.add(len(points)-1)
 for i,(p,co)in enumerate(zip(s.bezier_points,points)):p.co=co;p.handle_left_type='AUTO';p.handle_right_type='AUTO';p.radius=radii[i]if radii else 1
 o=bpy.data.objects.new(name,d);current.objects.link(o);o.data.materials.append(mat);o['proof_group']=group;made.append(o);return o
def loft(name,rows,mat,group='clothes',n=36,sub=1,fold=0,open_angle=None):
 vs=[];faces=[]
 for i,(z,rx,ry,cy)in enumerate(rows):
  for j in range(n):
   a=(open_angle+j/(n-1)*(math.tau-2*open_angle))if open_angle is not None else j/n*math.tau
   f=1+fold*(.62*math.cos(a*7+.3)+.38*math.cos(a*11-1.1))*(1-i/(len(rows)-1))
   vs.append((math.sin(a)*rx*f,cy-math.cos(a)*ry*f,z+.004*fold*math.sin(a*5)))
 for i in range(len(rows)-1):
  for j in range(n-1 if open_angle is not None else n):k=i*n+j;q=i*n+(j+1)%n;faces.append((k,q,q+n,k+n))
 if open_angle is None:faces.extend([tuple(reversed(range(n))),tuple((len(rows)-1)*n+j for j in range(n))])
 o=mesh(name,vs,faces,mat,group,sub,.003 if open_angle is not None else 0)
 ring_uv(o,n,len(rows),24,[row[0]*30 for row in rows],open_angle is None)
 return o
def tube(name,points,widths,mat,group='clothes',sides=14,sub=1):
 vs=[];faces=[]
 for i,co in enumerate(points):
  c=Vector(co);t=(Vector(points[min(len(points)-1,i+1)])-Vector(points[max(0,i-1)])).normalized();ref=Vector((0,1,0));u=t.cross(ref).normalized();v=t.cross(u).normalized()
  w=widths[i];wx,wy=(w,w)if isinstance(w,(float,int))else w
  for j in range(sides):a=j/sides*math.tau;vs.append(c+u*math.cos(a)*wx+v*math.sin(a)*wy)
 for i in range(len(points)-1):
  for j in range(sides):k=i*sides+j;q=i*sides+(j+1)%sides;faces.append((k,q,q+sides,k+sides))
 faces.extend([tuple(reversed(range(sides))),tuple((len(points)-1)*sides+j for j in range(sides))])
 o=mesh(name,vs,faces,mat,group,sub);distance=[0]
 for a,b in zip(points,points[1:]):distance.append(distance[-1]+(Vector(b)-Vector(a)).length*30)
 ring_uv(o,sides,len(points),8,distance)
 return o

exec((Path(__file__).parent/'character_body.py').read_text(encoding='utf8'),globals())

# Broad continuous apron and a gently supported pocket.
aprows=[(.462,.189,-.160),(.477,.192,-.160),(.495,.193,-.160),(.57,.180,-.151),(.66,.157,-.129),(.75,.136,-.111),(.770,.134,-.108)]
vs=[];fs=[];C=17
for i,(z,w,y)in enumerate(aprows):
 for j in range(C):
  u=j/(C-1)*2-1;vs.append((w*u,y+.035*u*u-.004*math.cos(u*math.pi*.5)+.0025*math.sin(u*13+z*3)*(1-i/(len(aprows)-1)),z+.007*u*(1-i/(len(aprows)-1))))
for i in range(len(aprows)-1):
 for j in range(C-1):k=i*C+j;fs.append((k,k+1,k+1+C,k+C))
mesh('Cream waist apron / continuous unequal hem',vs,fs,apron,'clothes',2,.0025)
for side in(-1,1):
 curve('Apron waist tie '+str(side),[(0,-.113,.768),(side*.105,-.078,.77),(side*.139,.016,.769),(side*.115,.083,.766)],.009,apron,'clothes')
 tube('Hanging back waist tie '+str(side),[(side*.11,.083,.766),(side*.165,.087,.728),(side*.178,.082,.636),(side*.180,.075,.550)],[.010,.011,.011,.009],apron,'clothes',sides=8)
px=.112;pz=.613;py=-.152
def apron_y(x,z):
 for (za,wa,ya),(zb,wb,yb)in zip(aprows,aprows[1:]):
  if za<=z<=zb:
   t=(z-za)/(zb-za);w=wa*(1-t)+wb*t;y=ya*(1-t)+yb*t;u=x/w
   return y+.035*u*u-.004*math.cos(u*math.pi*.5)
 return -.14
pocket_vertices=[];pocket_faces=[]
for i in range(5):
 v=i/4*2-1
 for j in range(5):
  u=j/4*2-1;x=px+u*.044;z=pz+v*.050+.002*u;pocket_vertices.append((x,apron_y(x,z)-.0018-.002*(1-u*u)*(1-v*v),z))
for i in range(4):
 for j in range(4):k=i*5+j;pocket_faces.append((k,k+1,k+6,k+5))
mesh('Apron patch pocket',pocket_vertices,pocket_faces,apron,'clothes',1,.0018)
curve('Pocket quiet top stitch',[(x,apron_y(x,z)-.003,z)for x,z in[(px-.039,pz+.040),(px,pz+.038),(px+.036,pz+.036)]],.0008,seam,'details')

exec((Path(__file__).parent/'character_head.py').read_text(encoding='utf8'),globals())

exec((Path(__file__).parent/'character_hair.py').read_text(encoding='utf8'),globals())

def leaf(name,base,tip,w):
 b=Vector(base);t=Vector(tip);direction=(t-b).normalized();normal=Vector((.55,-.83,.05));cross=direction.cross(normal).normalized();vs=[];fs=[]
 for i in range(7):
  q=i/6;c=b.lerp(t,q)+normal*.002*math.sin(q*math.pi);width=max(.0005,w*math.sin(q*math.pi))
  for u in(-1,0,1):vs.append(c+cross*u*width+normal*(1-u*u)*.0015)
 for i in range(6):
  for j in range(2):k=i*3+j;fs.append((k,k+1,k+4,k+3))
 return mesh(name,vs,fs,cream,'details',1,.001)
leaf('Own LEFT ivory upper leaf clip',(.158,-.151,1.486),(.173,-.139,1.526),.008)
leaf('Own LEFT ivory lower leaf clip',(.159,-.153,1.487),(.143,-.162,1.509),.007)
curve('Ivory clip short stem',[(.163,-.151,1.478),(.159,-.153,1.488),(.160,-.149,1.500)],.0015,cream,'details')

# Gentle head tilt, with feature/hair source meshes still separate and editable.
headroot=bpy.data.objects.new('Head pose / inferred small tilt',None);CHAR.objects.link(headroot);headroot.location=(0,0,1.13)
bpy.context.view_layer.update()
for o in made[head_objects_start:]:
 o.parent=headroot;o.matrix_parent_inverse=headroot.matrix_world.inverted()
headroot.rotation_euler.y=-.12;headroot.rotation_euler.z=-.035
# Seat the shortened, tilted face onto the neck instead of leaving a gap.
headroot.scale=(1.10,1.10,1.10)
headroot.location.z-=.060
charroot=bpy.data.objects.new('Misaki / model origin at feet',None);CHAR.objects.link(charroot)
for o in list(CHAR.objects):
 if o!=charroot and o.parent is None:o.parent=charroot
charroot.location=(-.88,-.02,0)

# Reuse previously authored display native sources without modifying originals.
current=DISPLAY
displayroot=bpy.data.objects.new('Display / model origin at floor',None);DISPLAY.objects.link(displayroot)
inherited=[]
for file,up in [('assets/authoring/asset-foundation-v1/display-set.blend',0),('assets/authoring/asset-foundation-paper-v1/paper-display-set.blend',.905)]:
 with bpy.data.libraries.load(str(ROOT/file),link=False)as(src,dst):dst.objects=[n for n in src.objects]
 for o in dst.objects:
  if o is None or o.type not in('MESH','CURVE'):continue
  for c in list(o.users_collection):c.objects.unlink(o)
  DISPLAY.objects.link(o);o.location.z+=up;o.parent=displayroot;o['proof_group']='display/'+str(o.get('component','component')).split('/')[-1];inherited.append(o)
  if str(o.get('component','')).split('/')[-1]in('vase','flowers'):o.location+=Vector((-.16,-.12,0))
displayroot.location=(.53,.10,0)
for image in bpy.data.images:
 if image.source=='FILE'and not image.packed_file:
  try:image.pack()
  except Exception:pass

# Studio floor/cameras/lights are authoring/render context, never game evidence.
current=STUDIO
floor=material('Studio / warm ivory ground','#EDE3D2',.85)
bpy.ops.mesh.primitive_plane_add(size=200,location=(0,0,-.003));ground=bpy.context.object;ground.name='Studio ground / not model asset';ground.data.materials.append(floor);register(ground,'studio')
def area(name,co,energy,size,color):
 d=bpy.data.lights.new(name,'AREA');d.energy=energy;d.shape='DISK';d.size=size;d.color=color;o=bpy.data.objects.new(name,d);STUDIO.objects.link(o);o.location=co;o.rotation_euler=(Vector((0,0,.80))-o.location).to_track_quat('-Z','Y').to_euler();return o
area('Warm large window key',(-3.5,-4.5,6),650,2.5,(1,.89,.74))
area('Gentle neutral fill',(3,-2,3.5),100,3.5,(.87,.91,1))
area('Warm rim and table lift',(1.0,3,4.5),260,3,(1,.88,.70))
world=bpy.data.worlds.new('Warm quiet studio world');world.use_nodes=True;world.node_tree.nodes['Background'].inputs[0].default_value=(.63,.60,.54,1);world.node_tree.nodes['Background'].inputs[1].default_value=.30;bpy.context.scene.world=world
def camera(name,co,target,scale):
 d=bpy.data.cameras.new(name);d.type='ORTHO';d.ortho_scale=scale;d.lens=65;o=bpy.data.objects.new(name,d);STUDIO.objects.link(o);o.location=co;o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler();return o
cameras={
 'assembly':camera('Blender model proof / person and display',(3.0,-6.5,3.2),(-.08,.03,.77),3.65),
 'character':camera('Blender model portrait / complete Misaki',(.25,-4.2,1.65),(-.88,0,.80),1.85),
 'face':camera('Blender model portrait / face detail',(-.12,-3.3,1.64),(-.88,-.01,1.36),.67),
}
scene=bpy.context.scene;scene.camera=cameras['assembly'];scene.render.engine='CYCLES';scene.cycles.device='CPU';scene.cycles.samples=32;scene.cycles.use_denoising=True;scene.cycles.adaptive_threshold=.07
scene.render.threads_mode='FIXED';scene.render.threads=8;scene.render.resolution_x=1200;scene.render.resolution_y=800;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG';scene.render.film_transparent=False;scene.view_settings.view_transform='AgX'
try:scene.view_settings.look='AgX - Medium High Contrast'
except Exception:pass
scene.view_settings.exposure=.10
for name in ['use_stamp_date','use_stamp_time','use_stamp_render_time','use_stamp_frame','use_stamp_frame_range','use_stamp_scene','use_stamp_camera','use_stamp_lens','use_stamp_filename','use_stamp_marker','use_stamp_memory','use_stamp_hostname']:
 if hasattr(scene.render,name):setattr(scene.render,name,False)
scene.render.use_stamp=True;scene.render.use_stamp_note=True;scene.render.use_stamp_labels=False;scene.render.stamp_font_size=15
scene.render.stamp_note_text='BLENDER MODEL RENDER / Misaki + display proof v2 / unaccepted art study'
scene.render.stamp_foreground=(.18,.14,.11,1);scene.render.stamp_background=(.95,.91,.84,.82)
scene['referenceSha256']=hashlib.sha256(REFERENCE.read_bytes()).hexdigest();scene['proofScope']='Complete coloured Misaki + representative authored display; not game screenshot, not whole shop or accepted art'
scene['inferred']='Side/back details, clasped standing pose, head tilt and studio composition inferred'
bpy.context.view_layer.update()
source_path=SRC/'misaki-display-model-proof.blend';bpy.ops.wm.save_as_mainfile(filepath=str(source_path))

# Bake evaluated copies for portable exports. The saved native source remains
# editable; actual geometry, PBR colours, vertex colours and packed images travel.
def export_component(collection,root,path):
 deps=bpy.context.evaluated_depsgraph_get();source=[o for o in collection.objects if o.type in('MESH','CURVE')];groups={};baked=[];stats={'sourceObjects':len(source),'triangles':0,'min':[1e9]*3,'max':[-1e9]*3}
 for src in source:
  d=bpy.data.meshes.new_from_object(src.evaluated_get(deps),preserve_all_data_layers=True,depsgraph=deps)
  # MikkTSpace requires triangles/quads. Triangulate only portable-copy ngons;
  # native editable control surfaces and their modifiers remain untouched.
  if any(len(p.vertices)>4 for p in d.polygons):
   bm=bmesh.new();bm.from_mesh(d);bmesh.ops.triangulate(bm,faces=[f for f in bm.faces if len(f.verts)>4],ngon_method='BEAUTY');bm.to_mesh(d);bm.free()
  d.calc_loop_triangles();stats['triangles']+=len(d.loop_triangles)
  o=bpy.data.objects.new(src.name+' portable',d);scene.collection.objects.link(o);o.matrix_world=src.matrix_world.copy();o.matrix_world.translation-=root.location
  for v in d.vertices:
   p=o.matrix_world@v.co
   for k in range(3):stats['min'][k]=min(stats['min'][k],p[k]);stats['max'][k]=max(stats['max'][k],p[k])
  groups.setdefault(src.get('proof_group','model'),[]).append(o)
 for key,items in groups.items():
  bpy.ops.object.select_all(action='DESELECT')
  for o in items:o.select_set(True)
  bpy.context.view_layer.objects.active=items[0]
  if len(items)>1:bpy.ops.object.join()
  o=items[0];o.name='target-proof/'+key;baked.append(o)
 bpy.ops.object.select_all(action='DESELECT')
 for o in baked:o.select_set(True)
 bpy.ops.export_scene.gltf(filepath=str(path),export_format='GLB',use_selection=True,export_apply=True,export_extras=True,export_animations=False,export_tangents=True)
 for o in baked:bpy.data.objects.remove(o,do_unlink=True)
 stats['file']=path.relative_to(ROOT).as_posix();stats['sha256']=hashlib.sha256(path.read_bytes()).hexdigest();return stats
exports={'Misaki':export_component(CHAR,charroot,SRC/'exports/misaki-model.glb'),'Display':export_component(DISPLAY,displayroot,SRC/'exports/display-group.glb')}
receipt={'createdFromCheckpoint':'538e6159c1a07bb889a60d7002031644d2792132','reference':REFERENCE.relative_to(ROOT).as_posix(),'referenceSha256':scene['referenceSha256'],'source':source_path.relative_to(ROOT).as_posix(),'blendSha256':hashlib.sha256(source_path.read_bytes()).hexdigest(),'exports':exports,'nativeCharacterObjects':len([o for o in CHAR.objects if o.type in('MESH','CURVE')]),'nativeDisplayObjects':len(inherited),'assemblyPlacements':{'Misaki':list(charroot.location),'Display':list(displayroot.location)},'inheritedNativeSources':['assets/authoring/asset-foundation-v1/display-set.blend','assets/authoring/asset-foundation-paper-v1/paper-display-set.blend'],'renderEngine':'Cycles CPU, actual Blender scene','limits':['Unaccepted whole-image model proof, not game screenshot or production integration','New character proportions and pose; no R10 geometry reused','Side/back and standing pose inferred','Rig, collisions, mobile performance and target likeness not certified'],'cameras':{k:o.name for k,o in cameras.items()}}
(SRC/'manifest.json').write_text(json.dumps(receipt,indent=2)+'\n',encoding='utf8',newline='\n')
print('MODEL_BUILD_COMPLETE '+json.dumps(receipt))
# Early whole-image proof before a detailed/expensive iteration.
scene.camera=cameras['assembly'];scene.render.filepath=str(OUT/'blender-model-assembly-v2.png');bpy.ops.render.render(write_still=True)
print('FIRST_BLENDER_RENDER_COMPLETE')
