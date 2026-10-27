"""R4 hair only: individually shaped cubic edge surfaces, no spherical base,
voxel fusion, decimation or global smoothing. Called with shared mesh helpers.
Six flow clumps and one local crown root underlap preserve visible boundaries.
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
def clump(name,left,right,crest=(.004,.013,.009,.002),thickness=(.002,.010,.006,.0016),phase=0):
 rows=12;cols=6;vs=[]
 for layer in range(2):
  for i in range(rows):
   t=[0,.02,.12,.24,.37,.50,.64,.77,.87,.94,.985,1][i];l=bezier(left,t);r=bezier(right,t);a=(bezier(left,min(1,t+.002))+bezier(right,min(1,t+.002)))/2;b=(bezier(left,max(0,t-.002))+bezier(right,max(0,t-.002)))/2
   normal=(r-l).cross(a-b).normalized();middle=(l+r)/2
   if normal.dot(middle-Vector((0,.015,1.205)))<0:normal=-normal
   for j in range(cols):
    u=j/(cols-1);p=l*(1-u)+r*u;roundness=math.sin(math.pi*u)**.85
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
 o=mesh(name,vs,fs,hair,1);o['authoring']='two cubic Bezier edge controls / variable crest and thickness / overlap preserved';o['leftBezier']=[list(p)for p in left];o['rightBezier']=[list(p)for p in right];o['thicknessControls']=list(thickness)
 crease=o.data.attributes.new('crease_edge','FLOAT','EDGE')
 for edge in o.data.edges:
  a,b=edge.vertices
  if a<N and b<N and(a//cols==b//cols==0):crease.data[edge.index].value=.05
  elif a<N and b<N and a%cols==b%cols and a%cols in(0,cols-1):crease.data[edge.index].value=.25
 guide('GUIDE / '+name+' / left',left,o);guide('GUIDE / '+name+' / right',right,o);hair_parts.append(o);return o

# Rear scaffold is three broad flowing clumps, not a spherical skull shell.
# The central root runs under the front roots; neighboring edges overlap.
root_underlap=clump('16 / local crown root underlap',
 [(-.110,-.065,1.393),(-.120,-.005,1.400),(-.120,.045,1.400),(-.100,.100,1.393)],
 [(.105,-.065,1.394),(.115,-.005,1.400),(.115,.045,1.400),(.095,.100,1.394)],
 crest=(.018,.030,.030,.018),thickness=(.002,.010,.010,.002),phase=0)
clump('13 / rear central flow',
 [(-.045,-.008,1.419),(-.160,.160,1.470),(-.180,.240,1.300),(-.100,.150,1.012),(-.085,.140,.999),(-.055,.135,.994),(-.035,.120,1.003)],
 [(.045,-.008,1.422),(.130,.170,1.470),(.160,.230,1.300),(.100,.160,1.029),(.080,.150,1.010),(.050,.135,1.000),(.025,.120,1.009)],
 crest=(.002,.014,.012,.002),phase=.2)
clump('14 / fuller rear own-right flow',
 [(-.090,.008,1.413),(-.210,-.110,1.340),(-.260,-.090,1.170),(-.200,-.055,1.065),(-.200,-.020,1.030),(-.205,.060,1.025),(-.190,.090,1.026),(-.190,.080,1.009),(-.180,.075,.999),(-.170,.080,1.008)],
 [(-.040,.015,1.425),(-.105,.215,1.460),(-.140,.245,1.280),(-.105,.150,1.047),(-.120,.135,1.029),(-.135,.115,1.013),(-.145,.105,1.018)],
 crest=(.003,.016,.012,.0015),phase=1.1)
clump('15 / shorter rear own-left flow',
 [(.020,.015,1.427),(.100,.215,1.460),(.140,.245,1.280),(.115,.150,1.047),(.130,.140,1.031),(.145,.120,1.020),(.155,.100,1.027)],
 [(.085,.012,1.419),(.195,-.065,1.370),(.235,.000,1.290),(.220,.035,1.234),(.235,.060,1.180),(.220,.070,1.100),(.205,.055,1.075),(.210,.055,1.048),(.205,.060,1.030),(.180,.075,1.038)],
 crest=(.002,.013,.010,.0015),phase=-.8)

# Main sweep is wide at its root and changes section depth; it does not start
# as a point or inflated petal. Lower edge is diagonal and uneven.
clump('10 / primary swept fringe',
 [(-.065,-.004,1.420),(-.120,-.150,1.390),(-.230,-.160,1.250),(-.205,-.080,1.175)],
 [(-.015,-.012,1.423),(.030,-.170,1.380),(-.015,-.190,1.280),(-.085,-.150,1.245)],
 crest=(.003,.014,.010,.0018),thickness=(.002,.010,.006,.0015),phase=.6)
clump('11 / underlapping temple turn',
 [(-.090,.008,1.413),(-.210,-.110,1.340),(-.260,-.090,1.170),(-.200,-.055,1.065)],
 [(-.015,-.006,1.424),(-.115,-.140,1.340),(-.185,-.140,1.180),(-.185,-.085,1.095)],
 crest=(.002,.009,.007,.0012),thickness=(.002,.008,.004,.0014),phase=-.7)
clump('12 / shorter swept own-left ear side',
 [(-.025,-.014,1.423),(.065,-.150,1.390),(.160,-.150,1.310),(.200,-.040,1.226)],
 [(.085,.012,1.419),(.195,-.065,1.370),(.235,.000,1.290),(.220,.035,1.234)],
 crest=(.002,.010,.007,.0012),thickness=(.002,.009,.004,.0014),phase=1.3)

# Actual ray attachment to the separate evaluated clump surfaces. Leaf shape
# stays rigid, on the character's own LEFT; no arbitrary screen-depth warp.
bpy.context.view_layer.update();deps=bpy.context.evaluated_depsgraph_get();verts=[];polys=[]
for o in hair_parts:
 e=o.evaluated_get(deps);d=e.to_mesh();offset=len(verts);verts.extend([o.matrix_world@v.co for v in d.vertices]);polys.extend([[offset+k for k in p.vertices]for p in d.polygons]);e.to_mesh_clear()
tree=BVHTree.FromPolygons(verts,polys)
clip_original_pivot=Vector((.1715,-.1715,1.309));target=Vector((.165,-.100,1.315));outward=(target-Vector((0,.015,1.205))).normalized();hit=tree.ray_cast(target+outward*.3,-outward,1.0)
clip_anchor,clip_normal,_,_=hit if hit[0]is not None else tree.find_nearest(target)
if clip_normal.dot(outward)<0:clip_normal=-clip_normal
clip_rotation=Vector((0,-1,0)).rotation_difference(clip_normal)
