"""Head/neck-only R2. Called by build-misaki-gray.py with shared authoring helpers.
Canonical original pixels govern; side/back remain inferred. No new textures.
"""
head_offset=.045  # Give the actual neck space above the unchanged shirt collar.
face_profile=[(1.008,.026,.029,.010),(1.025,.061,.052,-.007),(1.052,.100,.082,-.008),(1.089,.149,.111,-.002),(1.135,.176,.133,.005),(1.190,.181,.141,.011),(1.250,.174,.140,.018),(1.315,.150,.128,.024),(1.365,.108,.100,.026),(1.395,.038,.041,.025),(1.402,.005,.006,.023)]
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
 side=1 if cx>0 else-1;x=cx+.042*u
 z=1.166+side*.004*u+(1 if upper else-1)*(.031 if upper else.022)*max(0,1-u*u)**.66
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
 if all(i in boundary for i in e.vertices):crease.data[e.index].value=.45
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
    u=-1+2*j/(count-1);x,z=opening(cx,u,upper);lift=(.006 if upper else-.0035)*math.sin(math.pi*j/(count-1))
    if layer:z+=lift
    vs.append((x,face_front(x,z)-(.0015 if layer else.003),z))
  fs=[(j,j+1,j+1+count,j+count)for j in range(count-1)];mesh('04 / '+('upper folded lid 'if upper else'lower soft lid ')+str(side),vs,fs,skin,1,.001)
 # Simple grayscale iris geometry is clipped under the wider upper opening;
 # identity comes from the aperture and planes rather than painted detail.
 vs=[(cx,face_front(cx,cz+.003)-.006,cz+.003)]
 for j in range(32):
  a=j*math.tau/32;x=cx+.021*math.cos(a);z=cz+.004+.027*math.sin(a);u=(x-cx)/.042;_,top=opening(cx,u,True);_,bottom=opening(cx,u,False);z=min(top-.0005,max(bottom+.0005,z));vs.append((x,face_front(x,z)-.006,z))
 mesh('05 / iris placement under upper lid '+str(side),vs,[(0,j+1,(j+1)%32+1)for j in range(32)],feature,0)
 path=[]
 for j in range(13):
  u=-1+j/6;x,z=opening(cx,u,True);path.append((x,face_front(x,z)-.0038,z))
 tube('06 / upper lash placement '+str(side),path,[.0005+.0013*math.sin(math.pi*j/12)for j in range(13)],feature,6,0)
 path=[]
 for j in range(11):
  t=j/10;x=cx-.031+.062*t;z=1.225+.007*math.sin(t*math.pi)+side*(x-cx)*.04;path.append((x,face_front(x,z)-.002,z))
 tube('06 / broad brow placement '+str(side),path,[.0015]*11,feature,6,0)
path=[]
for j in range(13):
 x=-.018+j*.003;z=1.072+.004*(x/.018)**2;path.append((x,face_front(x,z)-.002,z))
tube('07 / neutral mouth placement',path,[.0011]*13,feature,6,0)

# The cap is an unequal, inward-turning lobed bob with an ear notch. It no
# longer closes a long cylindrical wall down to the collar or carries back
# paddles. Broad connected surface turns replace fine strand decoration.
vs=[];hr=12;hc=36
for layer in range(2):
 for i in range(hr):
  t=i/(hr-1)
  for j in range(hc):
   a=j*math.tau/hc;front=max(0,math.cos(a));side_distance=min(abs(a-math.pi/2),abs(a-3*math.pi/2))
   ear_notch=.74*math.exp(-(side_distance/.34)**2)
   end=2.38-1.28*front**2-ear_notch+.065*math.sin(3*a+.5)*(1-front)
   theta=.025+(end-.025)*t
   spread=math.sin(theta)if theta<1.45 else math.sin(1.45)-.23*(theta-1.45)**2
   flow=(.016*math.cos(3*a+.65*theta)+.009*math.sin(5*a-.3))*math.sin(theta)**2*(1-front*.7)
   rx=.227-layer*.009+flow;ry=.193-layer*.009+flow*.65
   vs.append((math.sin(a)*rx*spread,.023-math.cos(a)*ry*spread,1.210+(.232-layer*.009)*math.cos(theta)))
N=hr*hc;fs=[]
for layer in range(2):
 for f in connect(hr,hc):fs.append(tuple(k+layer*N for k in(f if layer==0 else tuple(reversed(f)))))
for j in range(hc):
 b=(j+1)%hc;fs.extend([(j,b,b+N,j+N),((hr-1)*hc+j,(hr-1)*hc+j+N,(hr-1)*hc+b+N,(hr-1)*hc+b)])
mesh('10 / loose bob connected lobes with ear notches',vs,fs,hair,1)
def lock(name,points,width,depth=.012):
 vs=[];steps=12;cols=8
 for i in range(steps):
  t=i/(steps-1);c=Vector(sample(points,t));ta=Vector(sample(points,min(1,t+.002)))-Vector(sample(points,max(0,t-.002)));ta.normalize();normal=Vector((c.x,c.y-.023,0)).normalized();u=ta.cross(normal).normalized();v=ta.cross(u).normalized()
  w=width*(.07+.93*math.sin(math.pi*(.01+.975*t))**.55)*(1-.80*t**8)
  for j in range(cols):
   a=j*math.tau/cols;vs.append(c+u*w*math.cos(a)+v*depth*(.25+.75*math.sin(math.pi*t))**.7*(1-.90*t**6)*math.sin(a))
 fs=connect(steps,cols);fs.extend([tuple(reversed(range(cols))),tuple((steps-1)*cols+j for j in range(cols))]);mesh(name,vs,fs,hair,1)
lock('11 / off-centre swept broad fringe',[(.029,-.006,1.435),(-.018,-.139,1.365),(-.091,-.171,1.290),(-.154,-.132,1.230)],.049,.010)
lock('12 / shorter parted own-left fringe',[(.039,-.014,1.431),(.104,-.142,1.360),(.164,-.146,1.293),(.190,-.093,1.239)],.035,.011)
lock('13 / inner curved fringe turn',[(.028,-.055,1.411),(.014,-.167,1.341),(-.014,-.180,1.281),(-.048,-.168,1.253)],.027,.008)
for side in[-1,1]:
 lock('14 / cheek curl with open ear gap '+str(side),[(side*.161,-.107,1.300),(side*.191,-.122,1.216),(side*.204,-.110,1.137),(side*.174,-.098,1.149)],.018,.013)
 lock('15 / rounded side volume turning inward '+str(side),[(side*.173,.068,1.315),(side*.225,.100,1.230),(side*.238,.070,1.130),(side*.207,.040,1.065),(side*.181,.030,1.079)],.035,.023)
