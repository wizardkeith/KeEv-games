"""Head/neck-only R3. Called by build-misaki-gray.py with shared authoring helpers.
Canonical original pixels govern; side/back remain inferred. No new textures.
"""
head_offset=.045  # Give the actual neck space above the unchanged shirt collar.
face_profile=[(1.008,.045,.034,.010),(1.025,.075,.056,-.007),(1.052,.112,.084,-.008),(1.089,.149,.111,-.002),(1.135,.176,.133,.005),(1.190,.181,.141,.011),(1.250,.174,.140,.018),(1.315,.150,.128,.024),(1.365,.108,.100,.026),(1.395,.038,.041,.025),(1.402,.005,.006,.023)]
def face_section(z):
 for a,b in zip(face_profile,face_profile[1:]):
  if a[0]<=z<=b[0]:
   t=(z-a[0])/(b[0]-a[0]);return[a[k]*(1-t)+b[k]*t for k in range(1,4)]
 return face_profile[0][1:]if z<face_profile[0][0]else face_profile[-1][1:]
def face_front(x,z):
 rx,ry,cy=face_section(z);f=math.sqrt(max(.008,1-(x/rx)**2));y=cy-ry*f
 bridge=.008*math.exp(-((z-1.177)/.046)**2)*math.exp(-(x/.018)**2)
 tip=.022*math.exp(-((z-1.127)/.025)**2)*math.exp(-(x/.025)**2)
 cheek=.008*math.exp(-((abs(x)-.111)/.043)**2)*math.exp(-((z-1.108)/.040)**2)
 muzzle=.003*math.exp(-((z-1.068)/.020)**2)*math.exp(-(x/.050)**2)
 return y-bridge-tip-cheek-muzzle
def opening(cx,u,upper):
 # Wider almond aperture, outer canthus subtly raised. No circular lid torus.
 side=1 if cx>0 else-1;x=cx+.037*u
 z=1.166+side*.0025*u+(1 if upper else-1)*(.036 if upper else.0275)*max(0,1-u*u)**.58
 return x,z

# Continuous face with two real apertures. Ring cage transitions from broad
# cheeks through narrowing jaw; boundary quads become the eyelid support flow.
zs=[1.008,1.018,1.035,1.058,1.084,1.108,1.128,1.141,1.153,1.166,1.181,1.197,1.216,1.246,1.281,1.317,1.351,1.378,1.395,1.402]
rows=len(zs);cols=64;vs=[];eye_ranges=[(2,8,.075),(56,62,-.075)]
for r,z in enumerate(zs):
 rx,ry,cy=face_section(z)
 for j in range(cols):
  a=j*math.tau/cols;x=math.sin(a)*rx;y=cy-math.cos(a)*ry
  if math.cos(a)>0:y+=(face_front(x,z)-(cy-ry*math.sqrt(max(.008,1-(x/rx)**2))))*math.cos(a)**4
  for low,high,cx in eye_ranges:
   if 7<=r<=11 and low<=j<=high and(r in(7,11)or j in(low,high)):
    u=(j-(low+high)/2)/((high-low)/2);v=(r-9)/2;angle=math.atan2(v,u);u=math.cos(angle);x,z_eye=opening(cx,u,math.sin(angle)>=0);y=face_front(x,z_eye);z_out=z_eye;break
  else:z_out=z
  vs.append((x,y,z_out))
fs=[]
for r in range(rows-1):
 for j in range(cols):
  if any(7<=r<11 and low<=j<high for low,high,_ in eye_ranges):continue
  fs.append((r*cols+j,r*cols+(j+1)%cols,(r+1)*cols+(j+1)%cols,(r+1)*cols+j))
fs.extend([tuple(reversed(range(cols))),tuple((rows-1)*cols+j for j in range(cols))])
face=mesh('01 / cheek to narrowing jaw and real eye apertures',vs,fs,skin,1)
# Crease only the aperture edge slightly, keeping the face a smooth surface.
crease=face.data.attributes.new('crease_edge','FLOAT','EDGE')
boundary=set()
for low,high,_ in eye_ranges:
 for r in range(7,12):
  for j in range(low,high+1):
   if r in(7,11)or j in(low,high):boundary.add(r*cols+j)
for e in face.data.edges:
 if all(i in boundary for i in e.vertices):crease.data[e.index].value=.30
loft('02 / visible neck bridge',[(.976,.046,.042,.019),(.992,.046,.042,.019),(1.026,.040,.038,.019),(1.071,.038,.037,.019),(1.112,.042,.040,.019)],skin,9,20)

# Visible ears are broad bowls, not fine helix detail. Their negative spaces
# separate the swept front locks from the side/back bob.
for side in[-1,1]:
 vs=[];er=5;ec=20
 for i in range(er):
  t=i/(er-1)
  for j in range(ec):
   a=j*math.tau/ec;x=side*(.185+.020*t+.008*math.sin(math.pi*t));y=-.025+.027*t*math.cos(a);z=1.157+.037*t*math.sin(a);vs.append((x,y,z))
 fs=connect(er,ec);mesh('02 / ear bowl '+str(side),vs,fs,skin,1,.004)

for side in[-1,1]:
 cx=side*.075;cz=1.166;n=32;rings=4;vs=[(cx,face_front(cx,cz)-.004,cz)]
 for r in range(1,rings+1):
  t=r/rings
  for j in range(n):
   a=j*math.tau/n;u=math.cos(a);edge_x,edge_z=opening(cx,u,math.sin(a)>=0);x=cx+(edge_x-cx)*t;z=cz+(edge_z-cz)*t
   # Edge goes inside the actual opening; centre gently bulges outward.
   y=face_front(x,z)+.002-.006*(1-t*t);vs.append((x,y,z))
 fs=[(0,j+1,(j+1)%n+1)for j in range(n)]
 for r in range(rings-1):
  for j in range(n):a=1+r*n+j;b=1+r*n+(j+1)%n;fs.append((a,a+n,b+n,b))
 mesh('03 / convex eye behind almond aperture '+str(side),vs,fs,eye,0)
 # Upper fold and lower lid are open surfaces with unequal depth/width,
 # merging into the canthi. No repeated concentric rims around the eye.
 for upper in[True,False]:
  vs=[];count=17
  for layer in[0,1]:
   for j in range(count):
    u=-1+2*j/(count-1);x,z=opening(cx,u,upper);lift=(.003 if upper else-.002)*math.sin(math.pi*j/(count-1))
    if layer:z+=lift
    vs.append((x,face_front(x,z)-(.001 if layer else.0018),z))
  fs=[(j,j+1,j+1+count,j+count)for j in range(count-1)];mesh('04 / '+('upper folded lid 'if upper else'lower soft lid ')+str(side),vs,fs,skin,1,.0006)
 # Simple grayscale iris geometry is clipped under the wider upper opening;
 # identity comes from the aperture and planes rather than painted detail.
 vs=[(cx,face_front(cx,cz+.006)-.006,cz+.006)]
 for j in range(32):
  a=j*math.tau/32;x=cx+.021*math.cos(a);z=cz+.008+.027*math.sin(a);u=(x-cx)/.037;_,top=opening(cx,u,True);_,bottom=opening(cx,u,False);z=min(top-.0005,max(bottom+.0005,z));vs.append((x,face_front(x,z)-.006,z))
 mesh('05 / iris placement under upper lid '+str(side),vs,[(0,j+1,(j+1)%32+1)for j in range(32)],feature,0)
 path=[]
 for j in range(13):
  u=-1+j/6;x,z=opening(cx,u,True);path.append((x,face_front(x,z)-.0038,z))
 tube('06 / upper lash placement '+str(side),path,[.0004+.0007*math.sin(math.pi*j/12)for j in range(13)],feature,6,0)
 path=[]
 for j in range(11):
  t=j/10;x=cx-.031+.062*t;z=1.225+.007*math.sin(t*math.pi)+side*(x-cx)*.04;path.append((x,face_front(x,z)-.002,z))
 tube('06 / broad brow placement '+str(side),path,[.0015]*11,feature,6,0)
path=[]
for j in range(13):
 x=-.018+j*.003;z=1.072+.004*(x/.018)**2;path.append((x,face_front(x,z)-.002,z))
tube('07 / neutral mouth placement',path,[.0011]*13,feature,6,0)

# The dominant swept fringe is part of the continuous hair volume. There are
# no separate petal/tube panels from the crown. One off-centre valley divides
# a broad swept lobe from the smaller tucked lobe at the exposed ear/clip.
hem=[(-math.pi,2.65),(-2.65,2.75),(-2.25,2.56),(-1.90,2.80),(-1.50,2.67),(-1.15,2.28),(-.85,1.90),(-.55,1.60),(-.25,1.38),(0,1.13),(.15,1.04),(.35,1.08),(.60,1.29),(.90,1.46),(1.20,1.60),(1.57,1.62),(1.90,2.14),(2.25,2.57),(2.70,2.76),(math.pi,2.65)]
def end_theta(a):
 a=(a+math.pi)%math.tau-math.pi
 for i,(p,q)in enumerate(zip(hem,hem[1:])):
  if p[0]<=a<=q[0]:
   t=(a-p[0])/(q[0]-p[0]);v0=hem[max(0,i-1)][1];v1=p[1];v2=q[1];v3=hem[min(len(hem)-1,i+2)][1]
   return((2*v1)+(-v0+v2)*t+(2*v0-5*v1+4*v2-v3)*t*t+(-v0+3*v1-3*v2+v3)*t*t*t)/2
 return hem[0][1]
def hair_point(a,theta,layer=0):
 signed=(a+math.pi)%math.tau-math.pi;front=max(0,math.cos(a))
 spread=math.sin(theta)if theta<1.45 else math.sin(1.45)-.15*(theta-1.45)**2
 # Medium continuous lobes and a single part valley, not strand ridges.
 dominant=.028*math.exp(-((signed+.42)/.60)**2)*math.sin(theta)**1.4
 tucked=.012*math.exp(-((signed-.58)/.45)**2)*math.sin(theta)**1.4
 valley=-.008*math.exp(-((signed-.18)/.12)**2)*math.sin(theta)**.8
 flow=(.014*math.cos(3*a+.7*theta)+.006*math.sin(2*a-.3))*math.sin(theta)**2*(1-front*.5)+dominant+tucked+valley
 rx=.227-layer*.030+flow;ry=.193-layer*.030+flow*.7
 return Vector((math.sin(a)*rx*spread-.025*max(0,math.cos(theta))**2,.023-math.cos(a)*ry*spread,1.210+(.232-layer*.030)*math.cos(theta)))
vs=[];hr=12;hc=36
angles=[j*math.tau/hc for j in range(hc)];angles[1]=.165;angles[2]=.190;angles[3]=.41
for layer in range(2):
 for i in range(hr):
  for j in range(hc):
   a=angles[j];theta=.025+(end_theta(a)-.025)*i/(hr-1);vs.append(hair_point(a,theta,layer))
N=hr*hc;fs=[]
for layer in range(2):
 for f in connect(hr,hc):
  if layer==0 and f[0]%hc==1:continue
  fs.append(tuple(k+layer*N for k in(f if layer==0 else tuple(reversed(f)))))
for j in range(hc):
 b=(j+1)%hc;fs.extend([(j,b,b+N,j+N),((hr-1)*hc+j,(hr-1)*hc+j+N,(hr-1)*hc+b+N,(hr-1)*hc+b)])
for i in range(hr-1):
 for j in[1,2]:
  a=i*hc+j;b=(i+1)*hc+j;f=(a,b,b+N,a+N);fs.append(f if j==1 else tuple(reversed(f)))
bob=mesh('10 / continuous side-part swept bob with unequal ends',vs,fs,hair,1)
part_crease=bob.data.attributes.new('crease_edge','FLOAT','EDGE')
for e in bob.data.edges:
 a,b=e.vertices
 if a<N and b<N and a%hc==b%hc and a%hc in(1,2):part_crease.data[e.index].value=.70

# Few substantial volumes blend into the foundation, instead of thin panels
# perched on it. Quad cages / named vertex groups stay editable. The same one
# subdivision level is followed by a bounded union and runtime reduction.
def mass(name,path,radii):
 vs=[];cols=10
 for i,c in enumerate(path):
  c=Vector(c);tangent=Vector(path[min(i+1,len(path)-1)])-Vector(path[max(0,i-1)]);tangent.normalize()
  outward=Vector((c.x,c.y-.023,0)).normalized();u=tangent.cross(outward).normalized();v=tangent.cross(u).normalized();w,d=radii[i]
  for j in range(cols):
   a=j*math.tau/cols;vs.append(c+u*w*math.cos(a)+v*d*math.sin(a))
 fs=connect(len(path),cols);fs.extend([tuple(reversed(range(cols))),tuple((len(path)-1)*cols+j for j in range(cols))]);return mesh(name,vs,fs,hair,1)
masses=[bob]
masses.append(mass('11 / dominant swept volume',[(.005,-.030,1.402),(-.033,-.121,1.365),(-.100,-.158,1.296),(-.164,-.131,1.211),(-.190,-.094,1.156)],[ (.080,.042),(.087,.038),(.074,.031),(.047,.024),(.014,.012)]))
masses.append(mass('12 / smaller tucked volume',[(.044,-.012,1.406),(.118,-.086,1.361),(.178,-.091,1.302),(.199,-.035,1.245)],[ (.050,.032),(.054,.028),(.039,.023),(.016,.014)]))
for o in masses:
 group=o.vertex_groups.new(name=o.name);group.add(list(range(len(o.data.vertices))),1,'REPLACE')
bpy.ops.object.select_all(action='DESELECT')
for o in masses:o.select_set(True)
bpy.context.view_layer.objects.active=bob;bpy.ops.object.join()
for o in masses[1:]:objects.remove(o)
bob.name='10 / continuous side-part swept bob with unequal ends'
union=bob.modifiers.new('Few-volume voxel union / editable cages retained','REMESH');union.mode='VOXEL';union.voxel_size=.006;union.use_smooth_shade=True
relax=bob.modifiers.new('Broad union relaxation','SMOOTH');relax.factor=.70;relax.iterations=12
bpy.context.view_layer.update();deps=bpy.context.evaluated_depsgraph_get();evaluated=bob.evaluated_get(deps);data=evaluated.to_mesh();data.calc_loop_triangles();union_triangles=len(data.loop_triangles);evaluated.to_mesh_clear()
budget=bob.modifiers.new('Bounded runtime hair / source cages retained','DECIMATE');budget.ratio=min(1,8000/max(1,union_triangles));budget.use_collapse_triangulate=True

# Rigid tangent attachment keeps the leaf outline intact instead of distorting
# each vertex to a different projected depth. The clip remains own LEFT +X.
clip_original_pivot=Vector((.1715,-.1715,1.309))
clip_anchor=hair_point(.95,1.06)
clip_normal=(hair_point(.951,1.06)-hair_point(.949,1.06)).cross(hair_point(.95,1.061)-hair_point(.95,1.059)).normalized()
if clip_normal.dot(clip_anchor-Vector((0,.023,1.21)))<0:clip_normal=-clip_normal
from mathutils.bvhtree import BVHTree
bpy.context.view_layer.update();deps=bpy.context.evaluated_depsgraph_get();evaluated=bob.evaluated_get(deps);data=evaluated.to_mesh();tree=BVHTree.FromPolygons([v.co.copy()for v in data.vertices],[list(p.vertices)for p in data.polygons]);outward=(clip_anchor-Vector((0,.023,1.21))).normalized();hit=tree.ray_cast(clip_anchor+outward*.3,-outward,1.0);point,normal,_,_=hit if hit[0]is not None else tree.find_nearest(clip_anchor);clip_anchor=point;clip_normal=normal;evaluated.to_mesh_clear()
clip_rotation=Vector((0,-1,0)).rotation_difference(clip_normal)
