"""R5 hair only: individually shaped cubic edge surfaces, no spherical base,
voxel fusion, decimation or global smoothing. Called with shared mesh helpers.
Independent internal spine controls drive changing cross-sections, not border-only plates.
"""
from mathutils.bvhtree import BVHTree
hair_parts=[]
def cubic(points,t):
 a,b,c,d=[Vector(p)for p in points];s=1-t
 return a*s**3+b*3*s*s*t+c*3*s*t*t+d*t**3
def bezier(points,t):
 segments=[points[i:i+4]for i in range(0,len(points)-1,3)]
 lengths=[sum((cubic(p,(i+1)/12)-cubic(p,i/12)).length for i in range(12))for p in segments];distance=t*sum(lengths)
 for p,length in zip(segments,lengths):
  if distance<=length:return cubic(p,distance/length)
  distance-=length
 return Vector(points[-1])
def scalar(values,t):
 s=1-t;return values[0]*s**3+3*values[1]*s*s*t+3*values[2]*s*t*t+values[3]*t**3
def guide(name,points,parent):
 data=bpy.data.curves.new(name,'CURVE');data.dimensions='3D';s=data.splines.new('BEZIER');s.bezier_points.add((len(points)-1)//3)
 for j,p in enumerate(s.bezier_points):
  k=j*3;p.co=points[k];p.handle_left_type='FREE';p.handle_right_type='FREE';p.handle_left=points[k-1]if k else Vector(points[0])*2-Vector(points[1]);p.handle_right=points[k+1]if k<len(points)-1 else Vector(points[-1])*2-Vector(points[-2])
 o=bpy.data.objects.new(name,data);bpy.context.collection.objects.link(o);o.parent=parent;o.hide_render=True;o.hide_viewport=True
def clump(name,left,right,crest=(.004,.013,.009,.002),thickness=(.002,.010,.006,.0016),phase=0,spine=None):
 rows=12;cols=6;vs=[]
 def surface(t,u):
  l=bezier(left,t);r=bezier(right,t)
  if spine is None:return l*(1-u)+r*u
  m=bezier(spine,t);control=m*2-(l+r)*.5
  return l*(1-u)**2+control*2*u*(1-u)+r*u*u
 for layer in range(2):
  for i in range(rows):
   t=[0,.02,.12,.24,.37,.50,.64,.77,.87,.94,.985,1][i]
   for j in range(cols):
    u=([0,.12,.34,.5,.76,1][j]if spine else j/(cols-1));p=surface(t,u)
    dt=surface(min(1,t+.002),u)-surface(max(0,t-.002),u)
    du=surface(t,min(1,u+.002))-surface(t,max(0,u-.002))
    normal=du.cross(dt).normalized()
    if normal.dot(p-Vector((0,.015,1.205)))<0:normal=-normal
    roundness=math.sin(math.pi*u)**.85
    p+=normal*(scalar(crest,t)*roundness-layer*scalar(thickness,t)*(.35+.65*roundness))
    p.z+=.008*math.sin(math.pi*u+phase)*t**7
    vs.append(p)
 N=rows*cols;fs=[]
 for layer in range(2):
  for f in connect(rows,cols,False):fs.append(tuple(k+layer*N for k in(f if layer==0 else tuple(reversed(f)))))
 for i in range(rows-1):
  for j in[0,cols-1]:a=i*cols+j;b=(i+1)*cols+j;fs.append((a,b,b+N,a+N))
 for i in[0,rows-1]:
  for j in range(cols-1):a=i*cols+j;b=a+1;fs.append((a,a+N,b+N,b))
 o=mesh(name,vs,fs,hair,1);o['authoring']='independent internal spine and border Bezier controls / changing curved cross-sections'if spine else'border controls / variable crest and thickness';o['leftBezier']=[list(p)for p in left];o['rightBezier']=[list(p)for p in right];o['thicknessControls']=list(thickness)
 crease=o.data.attributes.new('crease_edge','FLOAT','EDGE')
 for edge in o.data.edges:
  a,b=edge.vertices
  if a<N and b<N and(a//cols==b//cols==0):crease.data[edge.index].value=.05
  elif a<N and b<N and a%cols==b%cols and a%cols in(0,cols-1):crease.data[edge.index].value=.25
 
 if spine is not None:o['spineBezier']=[list(p)for p in spine];guide('GUIDE / '+name+' / internal spine',spine,o)
 guide('GUIDE / '+name+' / left',left,o);guide('GUIDE / '+name+' / right',right,o);hair_parts.append(o);return o

# Rear scaffold is three broad flowing clumps, not a spherical skull shell.
# The central root runs under the front roots; neighboring edges overlap.
root_underlap=clump('16 / local curved crown root join',
 [(-.025,-.012,1.416),(-.035,.010,1.424),(-.025,.035,1.424),(-.015,.055,1.416)],
 [(.060,-.012,1.417),(.070,.010,1.425),(.060,.035,1.425),(.050,.055,1.417)],
 spine=[(.020,-.012,1.423),(.022,.010,1.431),(.022,.035,1.431),(.020,.055,1.424)],
 crest=(0,0,0,0),thickness=(.002,.004,.004,.002),phase=0)
clump('13 / rear central flow',
 [(-.010,.020,1.422),(-.160,.160,1.470),(-.180,.240,1.300),(-.100,.150,1.012),(-.085,.140,.999),(-.055,.135,.994),(-.035,.120,1.003)],
 [(.045,.020,1.423),(.130,.170,1.470),(.160,.230,1.300),(.100,.160,1.029),(.080,.150,1.010),(.050,.135,1.000),(.025,.120,1.009)],
 spine=[(.018,.020,1.426),(0,.225,1.485),(0,.280,1.255),(0,.175,1.020),(0,.160,1.005),(0,.140,.999),(0,.125,1.005)],
 crest=(.001,.003,.003,.001),phase=.2)
clump('14 / fuller rear own-right flow',
 [(-.015,.012,1.420),(-.210,-.110,1.340),(-.260,-.090,1.170),(-.200,-.055,1.065),(-.200,-.020,1.030),(-.205,.060,1.025),(-.190,.090,1.026),(-.190,.080,1.009),(-.180,.075,.999),(-.170,.080,1.008)],
 [(.040,.015,1.423),(-.105,.215,1.460),(-.140,.245,1.280),(-.105,.150,1.047),(-.120,.135,1.029),(-.135,.115,1.013),(-.145,.105,1.018)],
 spine=[(.012,.017,1.426),(-.160,.025,1.465),(-.270,.130,1.245),(-.205,.055,1.034),(-.205,.065,1.020),(-.190,.075,1.010),(-.170,.080,1.018)],
 crest=(.001,.003,.003,.0007),phase=1.1)
clump('15 / shorter rear own-left flow',
 [(.005,.015,1.422),(.100,.215,1.460),(.140,.245,1.280),(.115,.150,1.047),(.130,.140,1.031),(.145,.120,1.020),(.155,.100,1.027)],
 [(.045,.012,1.421),(.195,-.065,1.370),(.235,.000,1.290),(.220,.035,1.234),(.235,.060,1.180),(.220,.070,1.100),(.205,.055,1.075),(.210,.055,1.048),(.205,.060,1.030),(.180,.075,1.038)],
 spine=[(.020,.017,1.426),(.150,.040,1.465),(.260,.145,1.250),(.200,.075,1.050),(.200,.080,1.034),(.180,.090,1.025),(.170,.100,1.032)],
 crest=(.001,.003,.003,.0007),phase=-.8)

# Main sweep is wide at its root and changes section depth; it does not start
# as a point or inflated petal. Lower edge is diagonal and uneven.
clump('10 / primary swept fringe',
 [(-.005,.012,1.425),(-.090,-.140,1.425),(-.230,-.170,1.270),(-.198,-.100,1.172)],
 [(.045,.012,1.427),(.090,-.165,1.375),(-.008,-.196,1.245),(-.050,-.169,1.223)],
 spine=[(.020,.020,1.429),(.015,-.178,1.425),(-.075,-.214,1.275),(-.130,-.166,1.198)],
 crest=(.001,.002,.002,.0005),thickness=(.002,.010,.005,.0015),phase=.6)
clump('11 / underlapping temple turn',
 [(-.015,.012,1.420),(-.210,-.110,1.340),(-.260,-.090,1.170),(-.200,-.055,1.065)],
 [(.035,.010,1.420),(-.115,-.140,1.340),(-.185,-.140,1.180),(-.185,-.085,1.095)],
 spine=[(.010,.012,1.425),(-.170,-.155,1.390),(-.270,-.120,1.160),(-.195,-.090,1.080)],
 crest=(.001,.002,.002,.0006),thickness=(.002,.008,.004,.0014),phase=-.7)
clump('12 / shorter swept own-left ear side',
 [(.015,.010,1.423),(.065,-.150,1.390),(.160,-.150,1.310),(.200,-.040,1.226)],
 [(.045,.012,1.421),(.195,-.065,1.370),(.235,.000,1.290),(.220,.035,1.234)],
 crest=(.002,.010,.007,.0012),thickness=(.002,.009,.004,.0014),phase=1.3)

# Own-left clip geometry is frozen from R4 controls in the builder.
# Current surface distances are inspected, not hidden by reattaching the clip.
