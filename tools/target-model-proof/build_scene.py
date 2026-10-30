"""Whole-character and representative display Blender proof, independent of game.
Editable native geometry, restrained PBR/vertex colours, packed inherited textures.
Unknown side/back details and the standing pose are explicitly inferred.
"""
import bpy,bmesh,math,json,hashlib,random,sys
from pathlib import Path
from mathutils import Vector,Matrix
ROOT=Path(__file__).resolve().parents[2]
SRC=ROOT/'assets/authoring/target-model-proof-v1';OUT=ROOT/'docs/reviews/evidence/target-model-proof-v1'
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
sage=material('Misaki / muted sage cardigan','#7C886D',.88)
sageedge=material('Misaki / knit edge and rolled cuff','#6B785F',.91)
shirt=material('Misaki / warm ivory blouse','#EFE6D4',.84)
apron=material('Misaki / unbleached cream apron','#D9C9A8',.91)
seam=material('Misaki / quiet linen seam','#B8A989',.93)
plum=material('Misaki / dusty plum skirt','#71606C',.90)
shoe=material('Misaki / soft brown leather','#65452E',.49)
sole=material('Misaki / warm dark sole','#493527',.73)
hair=material('Misaki / cocoa bob vertex colour','#FFFFFF',.64)
hairdark=material('Misaki / root and quiet accent','#493024',.56)
brow=material('Misaki / soft brown brows','#70503B',.73)
cream=material('Misaki / ivory leaf clip','#F5E5BB',.43)
white=material('Misaki / warm eye whites','#FFF7EA',.33)
iris=material('Misaki / warm chestnut iris','#8A542D',.30)
irislight=material('Misaki / amber lower iris','#B88043',.35)
irisdark=material('Misaki / iris outer ring','#4B2F20',.36)
pupil=material('Misaki / pupil and soft lash','#30221C',.40)
lip=material('Misaki / restrained smile','#A65D4E',.70)
highlight=material('Misaki / eye catchlight','#FFFDF3',.22)
for m in(skinvc,hair):
 n=m.node_tree.nodes.new('ShaderNodeVertexColor');n.layer_name='ArtColour';m.node_tree.links.new(n.outputs['Color'],m.node_tree.nodes['Principled BSDF'].inputs['Base Color'])

def mesh(name,verts,faces,mat,group='character',sub=0,thick=0):
 d=bpy.data.meshes.new(name+' editable');d.from_pydata(verts,[],faces);d.update();o=bpy.data.objects.new(name,d);current.objects.link(o);o.data.materials.append(mat);o['proof_group']=group;made.append(o)
 for p in d.polygons:p.use_smooth=True
 if sub:s=o.modifiers.new('Editable surface subdivision','SUBSURF');s.levels=sub;s.render_levels=sub
 if thick:s=o.modifiers.new('Actual garment thickness','SOLIDIFY');s.thickness=thick;s.offset=0
 return o
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
 return mesh(name,vs,faces,mat,group,sub,.003 if open_angle is not None else 0)
def tube(name,points,widths,mat,group='clothes',sides=14,sub=1):
 vs=[];faces=[]
 for i,co in enumerate(points):
  c=Vector(co);t=(Vector(points[min(len(points)-1,i+1)])-Vector(points[max(0,i-1)])).normalized();ref=Vector((0,1,0));u=t.cross(ref).normalized();v=t.cross(u).normalized()
  w=widths[i];wx,wy=(w,w)if isinstance(w,(float,int))else w
  for j in range(sides):a=j/sides*math.tau;vs.append(c+u*math.cos(a)*wx+v*math.sin(a)*wy)
 for i in range(len(points)-1):
  for j in range(sides):k=i*sides+j;q=i*sides+(j+1)%sides;faces.append((k,q,q+sides,k+sides))
 faces.extend([tuple(reversed(range(sides))),tuple((len(points)-1)*sides+j for j in range(sides))]);return mesh(name,vs,faces,mat,group,sub)

# New proportions and posed complete body; no R10 geometry is imported.
loft('Ivory socks / own right',[(.07,.032,.034,0),(.13,.034,.035,0),(.23,.037,.035,0),(.36,.039,.037,0)],shirt,n=24).location.x=-.075
loft('Ivory socks / own left',[(.07,.032,.034,-.025),(.13,.034,.035,-.025),(.23,.037,.035,-.025),(.36,.039,.037,-.025)],shirt,n=24).location.x=.075
for side,dy in[(-1,.014),(1,-.025)]:
 foot=ellipsoid('Leather oxford shoe '+str(side),(side*.075,dy-.032,.057),(.053,.100,.052),shoe,'shoes');foot.rotation_euler.z=-side*.07
 ellipsoid('Flat dark sole '+str(side),(side*.075,dy-.032,.015),(.054,.101,.015),sole,'shoes')
 for j in range(3):
  yy=dy-.025+j*.012;curve('Crossed brown lace '+str(side)+' '+str(j),[(side*.075-.022,yy,.092),(side*.075,yy+.008,.100),(side*.075+.022,yy,.092)],.0014,sole,'shoes')
 curve('Toe seam '+str(side),[(side*.075-.038,dy-.075,.067),(side*.075,dy-.086,.081),(side*.075+.038,dy-.075,.067)],.0009,sole,'shoes')
loft('Unequal soft A-line plum skirt',[(.302,.220,.148,.010),(.319,.222,.151,.010),(.39,.210,.145,.007),(.50,.187,.133,.003),(.61,.163,.119,0),(.71,.142,.102,0),(.77,.128,.093,0)],plum,n=64,fold=.12)
loft('Blouse torso',[(.725,.124,.087,0),(.80,.132,.091,0),(.91,.145,.087,0),(1.01,.154,.081,0),(1.065,.105,.068,0),(1.095,.052,.044,0)],shirt,n=36)
loft('Visible neck',[(1.043,.039,.035,.004),(1.11,.040,.035,.005),(1.175,.045,.040,.006)],skin,'skin',n=24)
cardigan=loft('Open sage cardigan / continuous shoulders and sides',[(.70,.145,.102,.004),(.77,.144,.103,.003),(.87,.157,.098,0),(.97,.170,.093,0),(1.045,.166,.077,0),(1.080,.083,.057,0)],sage,n=36,open_angle=.47)
for side in(-1,1):
 curve('Cardigan open knit edge '+str(side),[(side*.067,-.096,.708),(side*.066,-.099,.79),(side*.073,-.091,.90),(side*.077,-.080,1.01),(side*.038,-.052,1.08)],.004,sageedge,'clothes')
 # Soft shoulder -> bent elbow -> rolled cuff. Infer unseen sleeve back.
 path=[(side*.127,.004,1.043),(side*.157,-.003,1.012),(side*.183,-.024,.951),(side*.190,-.055,.890),(side*.160,-.102,.824),(side*.126,-.143,.784)]
 tube('Bent knitted sleeve '+str(side),path,[.043,.055,.056,.055,.048,.042],sage,sides=18)
 tube('Rolled broad cuff '+str(side),[path[-2],path[-1],(side*.116,-.153,.772)],[.049,.047,.043],sageedge,sides=18)
 wrist=(side*.071,-.184-(.018 if side==1 else 0),.715)
 palm=(side*.019,-.211-(.014 if side==1 else 0),.696-(.014 if side==1 else 0))
 tube('Exposed forearm '+str(side),[(side*.122,-.145,.785),(side*.105,-.167,.752),wrist,palm],[.034,.031,.025,(.024,.016)],skin,'skin',sides=14)
 ellipsoid('Soft clasped palm '+str(side),palm,(.031,.017,.036),skin,'skin')
 for j in range(4):
  xx=palm[0]+side*(.010-j*.008);yy=palm[1]-.010-j*.001;zz=palm[2]-.014
  tube('Clasped finger '+str(side)+' '+str(j),[(xx,yy,zz+.016),(xx-side*.007,yy-.006,zz-.006),(xx-side*.016,yy-.003,zz-.022)],[.0055,.005,.0035],skin,'skin',sides=8)
 tube('Visible thumb '+str(side),[(side*.041,palm[1]-.007,palm[2]+.015),(side*.026,palm[1]-.019,palm[2]+.020),(side*.012,palm[1]-.019,palm[2]+.010)],[.008,.007,.004],skin,'skin',sides=10)
 # Blouse collar points, not a rigid flat neck ring.
 pts=[(side*.006,-.045,1.094),(side*.040,-.047,1.092),(side*.060,-.089,1.049),(side*.025,-.107,1.027),(side*.010,-.078,1.061)]
 mesh('Folded blouse collar '+str(side),pts,[(0,1,2,3,4)],shirt,'clothes',1,.003)
for z in(1.062,1.025,.989,.950,.911,.872,.833,.794):ellipsoid('Small blouse button',(0,-.095,z),(.0035,.002,.0035),sole,'details',16,10)

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

# New face and coloured feature system. Surface eyes conform to the real face
# profile; no billboard photo or generated image substitutes for geometry.
head_objects_start=len(made)
CZ=1.365;RZ=.190
def headprofile(z):
 v=max(-.9999,min(.9999,(z-CZ)/RZ));s=math.sqrt(max(.00001,1-v*v));jaw=.77+.23*(.5+.5*math.tanh((v+.23)*3))
 return .178*s*jaw,.147*s,.012
def face_y(x,z):
 rx,ry,cy=headprofile(z);return cy-ry*math.sqrt(max(.01,1-(x/max(rx,.001))**2))-.004*math.exp(-(x/.035)**2-((z-1.315)/.048)**2)
vs=[];fs=[];ROWS=33;COLS=48
for i in range(ROWS):
 z=CZ-RZ+.001+(2*RZ-.002)*i/(ROWS-1);rx,ry,cy=headprofile(z)
 for j in range(COLS):
  a=j/COLS*math.tau;x=rx*math.sin(a);y=cy-ry*math.cos(a)
  if math.cos(a)>0:y=face_y(x,z)
  vs.append((x,y,z))
for i in range(ROWS-1):
 for j in range(COLS):k=i*COLS+j;q=i*COLS+(j+1)%COLS;fs.append((k,q,q+COLS,k+COLS))
fs.extend([tuple(reversed(range(COLS))),tuple((ROWS-1)*COLS+j for j in range(COLS))])
face=mesh('Misaki / rounded cheek and narrowing jaw',vs,fs,skinvc,'skin',1)
def skin_colour(p):
 base=rgb('#EFC4A7');blush=max(math.exp(-((p.x-.107)/.037)**2-((p.z-1.300)/.034)**2),math.exp(-((p.x+.107)/.037)**2-((p.z-1.300)/.034)**2))
 front=max(0,min(1,(-p.y-.020)/.09));return mix(base,rgb('#E79B91'),blush*.40*front)
paint(face,skin_colour)
for side in(-1,1):
 ellipsoid('Warm ear bowl '+str(side),(side*.171,.000,1.315),(.022,.029,.043),skin,'skin')
 ellipsoid('Soft ear inner '+str(side),(side*.187,-.012,1.314),(.006,.018,.026),material('Ear inner '+str(side),'#E4AD93',.73),'skin',20,12)
 # Actual curved almond patch, with a higher outer corner and broad upper arc.
 cx=side*.073;zc=1.349
 ev=[(cx,face_y(cx,zc)-.010,zc)];ef=[];rings=5;n=40
 for ri in range(1,rings+1):
  r=ri/rings
  for j in range(n):
   a=j/n*math.tau;dx=.047*r*math.cos(a);zz=.032*r*math.sin(a)+side*.10*dx
   x=cx+dx;z=zc+zz;y=face_y(x,z)-.0015-.008*(1-r*r);ev.append((x,y,z))
 for j in range(n):ef.append((0,1+j,1+(j+1)%n))
 for r in range(rings-1):
  for j in range(n):k=1+r*n+j;q=1+r*n+(j+1)%n;ef.append((k,q,q+n,k+n))
 mesh('Curved almond eye white '+str(side),ev,ef,white,'eyes')
 # Slightly inward gaze; concentric curved real iris surfaces and pupil.
 ic=cx-side*.001;iz=zc-.001
 def disc(name,rx,rz,offset,mat):
  v=[(ic,face_y(ic,iz)-offset,iz)];f=[]
  for j in range(48):
   a=j/48*math.tau;x=ic+rx*math.cos(a);z=iz+rz*math.sin(a);v.append((x,face_y(x,z)-offset+.001,z))
  for j in range(48):f.append((0,j+1,(j+1)%48+1))
  return mesh(name,v,f,mat,'eyes')
 disc('Dark iris rim '+str(side),.030,.032,.0115,irisdark)
 disc('Chestnut iris '+str(side),.0285,.0305,.013,iris)
 # Amber lower crescent: geometry bands, not an image texture.
 vv=[];ff=[]
 for r in(.56,.94):
  for j in range(21):
   a=math.pi+j/20*math.pi;x=ic+.028*r*math.cos(a);z=iz+.029*r*math.sin(a);vv.append((x,face_y(x,z)-.014,z))
 for j in range(20):ff.append((j,j+1,j+22,j+21))
 mesh('Amber lower iris crescent '+str(side),vv,ff,irislight,'eyes')
 disc('Deep pupil '+str(side),.0115,.021,.0155,pupil)
 for dx,dz,r in[(-.009,.014,.0065),(.010,-.012,.0028)]:
  x=ic+dx;z=iz+dz;ellipsoid('Eye catchlight '+str(side),(x,face_y(x,z)-.018,z),(r,.002,r*1.15),highlight,'eyes',16,10)
 upper=[];lower=[]
 for j in range(9):
  a=math.pi-j/8*math.pi;dx=.047*math.cos(a);x=cx+dx;z=zc+.032*math.sin(a)+side*.10*dx;upper.append((x,face_y(x,z)-.003,z))
  a=math.pi+j/8*math.pi;dx=.047*math.cos(a);x=cx+dx;z=zc+.032*math.sin(a)+side*.10*dx;lower.append((x,face_y(x,z)-.0025,z))
 curve('Swept upper eyelash '+str(side),upper,.0028,pupil,'eyes',[.30,.55,.8,1,1,1,.9,.7,.35])
 curve('Quiet lower lid '+str(side),lower,.0005,irisdark,'eyes',[.1,.4,.6,.7,.7,.7,.6,.3,.1])
 outerx=cx+side*.045;outerz=zc+side*.10*(side*.045)+.009
 curve('Outer lash flick '+str(side),[(outerx-side*.008,face_y(outerx-side*.008,outerz)-.004,outerz),(outerx+side*.006,face_y(outerx,outerz)-.004,outerz+.008),(outerx+side*.013,face_y(outerx,outerz)-.002,outerz+.014)],.0018,pupil,'eyes',[1,.7,.05])
 pts=[]
 for xx,zz in[(-.034,1.409),(-.013,1.418),(.012,1.418),(.032,1.411)]:
  x=cx+xx;pts.append((x,face_y(x,zz)-.0025,zz))
 curve('Warm expressive brow '+str(side),pts,.0021,brow,'eyes',[.25,.9,1,.18])
ellipsoid('Small soft nose',(0,face_y(0,1.306)-.003,1.306),(.008,.009,.011),skin,'skin',20,14)
mouth=[]
for x,z in[(-.017,1.259),(-.007,1.253),(.007,1.253),(.018,1.260)]:mouth.append((x,face_y(x,z)-.0015,z))
curve('Gentle small smile',mouth,.0018,lip,'eyes',[.18,.8,.85,.12])

# Coherent cocoa bob mass with a few actual foreground/lower curl volumes.
# Profiles/side-back are inferred; this is new authoring, not a frozen R10 cage.
vs=[];fs=[];C=48;R=10
for i in range(R):
 t=[0,.03,.10,.24,.40,.57,.74,.87,.95,1][i]
 for j in range(C):
  a=j/C*math.tau;s=math.sin(a);front=max(0,math.cos(a))**3
  rx=[.018,.105,.170,.206,.222,.226,.229,.223,.208,.189][i]
  ry=[.015,.091,.146,.177,.191,.193,.190,.176,.151,.129][i]
  end=1.152+.018*math.sin(a+.7)+.009*math.sin(5*a+.8)
  end=end*(1-front)+1.495*front
  # Connected broad turning planes, with subdued valleys flowing out of the
  # off-centre crown; the lower silhouette is not a straight helmet edge.
  flow=a+.19*math.sin(math.pi*t)+.10*s*t
  turn=math.cos(7*flow+.55)+.28*math.cos(11*flow-.3)
  amplitude=.010*math.sin(math.pi*t*.83)**1.2*(1-.70*front)
  z=1.583+(end-1.583)*t+.010*math.sin(7*flow+.55)*t**6*(1-front)
  z+=.085*math.exp(-((a-1.15)/.36)**2)*t**6
  x=.023*(1-t)+(rx+amplitude*turn)*s
  y=.020-(ry+amplitude*turn)*math.cos(a)
  if math.cos(a)>.4:y+=.10*front*t
  vs.append((x,y,z))
for i in range(R-1):
 for j in range(C):k=i*C+j;q=i*C+(j+1)%C;fs.append((k,q,q+C,k+C))
fs.extend([tuple(reversed(range(C))),tuple((R-1)*C+j for j in range(C))])
bob=mesh('Cocoa bob / connected rounded asymmetric core',vs,fs,hair,'hair',2)
def hair_colour(p):
 light=.35+.22*max(0,min(1,(p.z-1.15)/.44))+.08*math.sin(p.x*24+p.z*4)
 return mix(rgb('#3E291F'),rgb('#7B583F'),light)
paint(bob,hair_colour)
def lock(name,rows):
 C=7;R=len(rows);N=C*R;outer=[];normal=[]
 for i,(co,width)in enumerate(rows):
  c=Vector(co);w=Vector(width);dt=Vector(rows[min(R-1,i+1)][0])-Vector(rows[max(0,i-1)][0]);n=w.cross(dt).normalized()
  if n.dot(c-Vector((0,.02,1.37)))<0:n=-n
  for j in range(C):u=j/(C-1)*2-1;outer.append(c+w*u+n*.004*(1-u*u));normal.append(n)
 v=outer+[p-n*.003 for p,n in zip(outer,normal)];f=[]
 for layer in range(2):
  for i in range(R-1):
   for j in range(C-1):k=i*C+j;q=(k,k+1,k+C+1,k+C);f.append(tuple(x+layer*N for x in(q if layer==0 else tuple(reversed(q)))))
 for i in range(R-1):
  for j in(0,C-1):k=i*C+j;l=k+C;f.append((k,l,l+N,k+N))
 for i in(0,R-1):
  for j in range(C-1):k=i*C+j;f.append((k,k+N,k+1+N,k+1))
 o=mesh(name,v,f,hair,'hair',2);paint(o,hair_colour);return o
lock('Dominant broad diagonal forelock',[
 ((.025,.005,1.583),(.017,0,0)),((.012,-.065,1.579),(.032,-.002,.002)),((-.020,-.133,1.555),(.050,-.005,.008)),((-.058,-.173,1.517),(.061,-.006,.017)),((-.094,-.184,1.468),(.053,-.005,.023)),((-.121,-.169,1.430),(.039,-.004,.025)),((-.138,-.145,1.402),(.024,-.003,.018)),((-.138,-.121,1.390),(.011,-.002,.009)),((-.128,-.108,1.391),(.004,-.001,.003))])
lock('Shorter clipward supporting sweep',[
 ((.046,.008,1.580),(.013,.001,0)),((.075,-.063,1.579),(.024,.004,-.004)),((.112,-.119,1.557),(.035,.008,-.013)),((.148,-.144,1.520),(.036,.014,-.023)),((.171,-.129,1.487),(.028,.017,-.021)),((.184,-.090,1.458),(.016,.012,-.014)),((.185,-.048,1.443),(.005,.005,-.005))])
for side in(-1,1):
 for index in range(2 if side==-1 else 1):
  y=.005+index*.055;z=1.25+index*.011;xx=side*(.197+index*.003)
  lock('Jaw-level soft bob curl '+str(side)+' '+str(index),[
   ((xx,y,z),(.007,side*.014,-.004)),((xx+side*.010,y+.007,z-.037),(.009,side*.018,.002)),((xx+side*.012,y+.005,z-.076),(.008,side*.017,.007)),((xx+side*.005,y-.007,z-.106),(.006,side*.012,.010)),((xx-side*.009,y-.019,z-.120),(.003,side*.006,.004)),((xx-side*.018,y-.024,z-.113),(.001,side*.002,.002))])
# A few shallow dark root accents are actual curves, not a raster reference.
curve('Offset root division',[(.034,-.006,1.584),(.033,-.032,1.581),(.023,-.064,1.568)],.0011,hairdark,'hair',[.1,.65,.1])
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
headroot.rotation_euler.y=-.075;headroot.rotation_euler.z=-.035
# Seat the shortened, tilted face onto the neck instead of leaving a gap.
headroot.location.z-=.035
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
area('Warm large window key',(-3.5,-4.5,6),650,4.0,(1,.89,.74))
area('Gentle neutral fill',(3,-2,3.5),180,3.5,(.87,.91,1))
area('Warm rim and table lift',(1.0,3,4.5),400,3,(1,.88,.70))
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
scene.view_settings.exposure=.15
for name in ['use_stamp_date','use_stamp_time','use_stamp_render_time','use_stamp_frame','use_stamp_frame_range','use_stamp_scene','use_stamp_camera','use_stamp_lens','use_stamp_filename','use_stamp_marker','use_stamp_memory','use_stamp_hostname']:
 if hasattr(scene.render,name):setattr(scene.render,name,False)
scene.render.use_stamp=True;scene.render.use_stamp_note=True;scene.render.use_stamp_labels=False;scene.render.stamp_font_size=15
scene.render.stamp_note_text='BLENDER MODEL RENDER / Misaki + display proof v1 / unaccepted art study'
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
receipt={'createdFromCheckpoint':'5e741db98ec14dcb7576e45bce3b1848fad85874','reference':REFERENCE.relative_to(ROOT).as_posix(),'referenceSha256':scene['referenceSha256'],'source':source_path.relative_to(ROOT).as_posix(),'blendSha256':hashlib.sha256(source_path.read_bytes()).hexdigest(),'exports':exports,'nativeCharacterObjects':len([o for o in CHAR.objects if o.type in('MESH','CURVE')]),'nativeDisplayObjects':len(inherited),'assemblyPlacements':{'Misaki':list(charroot.location),'Display':list(displayroot.location)},'inheritedNativeSources':['assets/authoring/asset-foundation-v1/display-set.blend','assets/authoring/asset-foundation-paper-v1/paper-display-set.blend'],'renderEngine':'Cycles CPU, actual Blender scene','limits':['Unaccepted whole-image model proof, not game screenshot or production integration','New character proportions and pose; no R10 geometry reused','Side/back and standing pose inferred','Rig, collisions, mobile performance and target likeness not certified'],'cameras':{k:o.name for k,o in cameras.items()}}
(SRC/'manifest.json').write_text(json.dumps(receipt,indent=2)+'\n',encoding='utf8',newline='\n')
print('MODEL_BUILD_COMPLETE '+json.dumps(receipt))
# Early whole-image proof before a detailed/expensive iteration.
scene.camera=cameras['assembly'];scene.render.filepath=str(OUT/'blender-model-assembly-v1.png');bpy.ops.render.render(write_still=True)
print('FIRST_BLENDER_RENDER_COMPLETE')
