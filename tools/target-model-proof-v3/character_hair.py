"""V2 rounded clump volumes with authored sweeps and unequal side returns.

The small continuous under-volume sits behind the clumps. Each major clump has
editable closed cross sections, a raised turning plane and independently bent
endpoint. No strands, hair cards, voxel fusion or global smoothing operation.
"""
def hair_colour(p):
    light=.32+.30*max(0,min(1,(p.z-1.18)/.40))
    return mix(rgb('#35221B'),rgb('#714D36'),light)

vs=[];fs=[];C=64;R=10
for i in range(R):
    t=[0,.035,.11,.23,.39,.56,.72,.85,.95,1][i]
    for j in range(C):
        a=j/C*math.tau;s=math.sin(a);front=max(0,math.cos(a))**3
        rx=[.012,.078,.137,.179,.204,.219,.222,.217,.205,.186][i]
        ry=[.010,.070,.119,.153,.174,.184,.182,.171,.151,.132][i]
        end=1.192+.009*math.sin(5*a+.4)+.008*math.sin(3*a)
        end=end*(1-front)+1.487*front
        end+=.145*math.exp(-((a-1.18)/.42)**2)
        z=1.569+(end-1.569)*t
        wave=.004*math.sin(7*a+.4+t*.8)*math.sin(t*math.pi)
        vs.append((.023*(1-t)+(rx+wave)*s,.026-(ry+wave)*math.cos(a)+.085*front*t,z))
for i in range(R-1):
    for j in range(C):k=i*C+j;q=i*C+(j+1)%C;fs.append((k,q,q+C,k+C))
fs.extend([tuple(reversed(range(C))),tuple((R-1)*C+j for j in range(C))])
bob=mesh('Cocoa bob / small connected under-volume',vs,fs,hair,'hair',2);paint(bob,hair_colour)

def clump(name,rows):
    # Each row is (centre, lateral width vector, outer depth). Width/depth taper
    # independently, so the end curves back into the silhouette rather than
    # becoming a repeated flat radial strip or spear-shaped panel.
    C=12;R=len(rows);vs=[];fs=[];colours=[]
    for i,(co,width,depth) in enumerate(rows):
        c=Vector(co);w=Vector(width)
        tangent=Vector(rows[min(R-1,i+1)][0])-Vector(rows[max(0,i-1)][0])
        normal=w.cross(tangent).normalized()
        if normal.dot(c-Vector((0,.02,1.36)))<0:normal=-normal
        t=i/(R-1)
        for j in range(C):
            a=j/C*math.tau;sn=math.sin(a)
            bulge=depth*.55*sn if sn>=0 else depth*.20*sn
            p=c+w*math.cos(a)+normal*bulge;vs.append(p)
            band=.08*math.exp(-((math.cos(a)-.18)/.35)**2)
            lit=.32+.24*math.sin(t*math.pi*.8)+band
            colours.append(mix(rgb('#332019'),rgb('#72513B'),lit))
    for i in range(R-1):
        for j in range(C):k=i*C+j;q=i*C+(j+1)%C;fs.append((k,q,q+C,k+C))
    fs.extend([tuple(reversed(range(C))),tuple((R-1)*C+j for j in range(C))])
    o=mesh(name,vs,fs,hair,'hair',2)
    col=o.data.color_attributes.new(name='ArtColour',type='FLOAT_COLOR',domain='CORNER')
    for loop in o.data.loops:col.data[loop.index].color=(*colours[loop.vertex_index],1)
    return o

clump('Main sweep / broad curved central turn',[
 ((.024,-.028,1.568),(.007,0,0),.003),((.010,-.079,1.562),(.026,-.002,.003),.011),
 ((-.027,-.135,1.533),(.044,-.004,.010),.020),((-.063,-.174,1.490),(.047,-.004,.017),.022),
 ((-.091,-.183,1.444),(.036,-.004,.021),.019),((-.109,-.174,1.409),(.025,-.003,.019),.013),
 ((-.127,-.153,1.384),(.012,-.002,.010),.007),((-.136,-.137,1.381),(.0015,0,.002),.0015)])
clump('Main sweep / overlapping inner shortened turn',[
 ((.024,-.033,1.569),(.005,0,0),.002),((.024,-.094,1.542),(.018,-.001,.004),.008),
 ((.010,-.165,1.491),(.028,-.002,.009),.013),((-.006,-.191,1.445),(.027,-.002,.013),.014),
 ((-.031,-.190,1.406),(.020,-.002,.012),.010),((-.056,-.179,1.385),(.009,-.001,.007),.006),
 ((-.073,-.162,1.386),(.0015,0,.0015),.001)])
clump('Own right / cheek framing outward and inward curl',[
 ((-.014,.010,1.563),(.008,.001,0),.004),((-.074,-.086,1.527),(.031,-.005,.004),.015),
 ((-.140,-.137,1.459),(.038,-.003,.011),.019),((-.187,-.129,1.380),(.030,.002,.010),.019),
 ((-.211,-.093,1.306),(.023,.009,.007),.017),((-.215,-.049,1.247),(.018,.014,.003),.013),
 ((-.198,-.037,1.213),(.010,.010,.004),.008),((-.179,-.049,1.218),(.0015,.0015,.001),.001)])
clump('Clipward supporting sweep / above-ear return',[
 ((.034,.000,1.570),(.007,.001,0),.003),((.079,-.071,1.548),(.023,.002,-.003),.012),
 ((.128,-.127,1.511),(.032,.005,-.010),.018),((.168,-.145,1.465),(.029,.012,-.018),.019),
 ((.191,-.120,1.423),(.019,.015,-.014),.014),((.202,-.087,1.398),(.010,.012,-.007),.008),
 ((.201,-.066,1.399),(.0015,.002,-.001),.0015)])

# Deliberately unequal medium side/back volumes. Their path behind the visible
# ear is inferred; front controls leave an actual ear-side opening.
sidepaths=[
 ('Own left / outer cheek-to-jaw returning volume',[(.081,.040,1.551),(.153,.012,1.507),(.204,.010,1.435),(.231,.027,1.345),(.237,.039,1.270),(.222,.018,1.220),(.198,-.009,1.207),(.190,-.026,1.221)]),
 ('Own left / short lower overlap',[(.139,.092,1.491),(.200,.083,1.423),(.229,.092,1.335),(.236,.096,1.262),(.225,.072,1.212),(.206,.041,1.191),(.198,.023,1.200)]),
 ('Own right / unequal outer lower overlap',[(-.073,.054,1.536),(-.154,.033,1.474),(-.202,.044,1.388),(-.226,.064,1.292),(-.225,.060,1.227),(-.207,.028,1.186),(-.188,.005,1.194)]),
 ('Own right / short back curl',[(-.139,.123,1.458),(-.191,.119,1.387),(-.218,.132,1.305),(-.220,.126,1.239),(-.201,.096,1.207),(-.182,.070,1.217)])]
for name,points in sidepaths:
    rows=[];N=len(points);side=1 if points[0][0]>0 else -1
    for i,p in enumerate(points):
        t=i/(N-1);w=.030*math.sin(math.pi*t)**.6+.002
        if i in (0,N-1):w=.002
        rows.append((p,(side*.30*w,.92*w,.12*w),max(.001,.018*math.sin(math.pi*t)**.7)))
    clump(name,rows)
for k,a in enumerate([1.95,2.50,3.16,3.82,4.38]):
    points=[]
    for i,(r,z) in enumerate([(.045,1.556),(.115,1.513),(.176,1.439),(.205,1.341),(.205,1.261),(.185,1.210),(.163,1.202+.013*math.sin(k*2)),(.152,1.214)]):
        flow=a+.10*math.sin(i/7*math.pi)+.035*math.sin(k)
        co=(r*math.sin(flow),.028-r*.88*math.cos(flow),z)
        w=.030*math.sin(i/7*math.pi)**.7+.0015
        points.append((co,(w*math.cos(flow),w*math.sin(flow),.002),max(.001,.015*math.sin(i/7*math.pi))))
    clump('Inferred back bob turning volume '+str(k+1),points)
