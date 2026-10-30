"""V3 overlapping tapered locks and authored non-radial side/back paths.

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
        rx=[.012,.078,.137,.179,.204,.215,.216,.204,.185,.160][i]
        ry=[.010,.070,.119,.153,.174,.184,.178,.163,.144,.119][i]
        end=1.245+.013*math.sin(5*a+.4)+.014*math.sin(3*a)
        end=end*(1-front)+1.487*front
        end+=.10*math.exp(-((a-1.18)/.42)**2)
        z=1.569+(end-1.569)*t
        wave=.004*math.sin(7*a+.4+t*.8)*math.sin(t*math.pi)
        vs.append((.023*(1-t)+(rx+wave)*s,.026-(ry+wave)*math.cos(a)+.025*front*t,z))
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
            # Root backs embed in the continuous crown instead of leaving
            # hollow cracks between several floating tubular locks.
            bulge=depth*.70*sn if sn>=0 else max(depth*.55,.028*(1-t)**2)*sn
            p=c+w*math.cos(a)+normal*bulge;vs.append(p)
            band=.13*math.exp(-((math.cos(a)-.28+.18*t)/.30)**2)
            lit=.26+.30*math.sin((t+.12)*math.pi*.78)+band
            colours.append(mix(rgb('#302019'),rgb('#7C5840'),lit))
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
 ((-.091,-.183,1.444),(.040,-.004,.021),.017),((-.110,-.174,1.399),(.025,-.003,.018),.012),
 ((-.131,-.150,1.373),(.012,-.002,.008),.006),((-.143,-.128,1.378),(.0015,0,.002),.0015)])
clump('Main sweep / overlapping inner shortened turn',[
 ((.024,-.033,1.569),(.005,0,0),.002),((.024,-.094,1.542),(.018,-.001,.004),.008),
 ((.010,-.165,1.491),(.028,-.002,.009),.013),((-.006,-.191,1.445),(.027,-.002,.013),.014),
 ((-.033,-.190,1.402),(.022,-.002,.012),.010),((-.057,-.177,1.376),(.010,-.001,.007),.006),
 ((-.078,-.155,1.380),(.0015,0,.0015),.001)])
clump('Own right / cheek framing outward and inward curl',[
 ((-.014,.010,1.563),(.008,.001,0),.004),((-.074,-.086,1.527),(.031,-.005,.004),.015),
 ((-.140,-.137,1.459),(.038,-.003,.011),.019),((-.187,-.129,1.380),(.030,.002,.010),.019),
 ((-.211,-.093,1.306),(.025,.009,.007),.015),((-.232,-.074,1.258),(.018,.014,.003),.011),
 ((-.243,-.041,1.224),(.009,.009,.004),.006),((-.225,-.018,1.222),(.0015,.0015,.001),.001)])
clump('Clipward supporting sweep / above-ear return',[
 ((.034,.000,1.570),(.007,.001,0),.003),((.079,-.071,1.548),(.023,.002,-.003),.012),
 ((.128,-.127,1.511),(.032,.005,-.010),.018),((.168,-.145,1.465),(.029,.012,-.018),.019),
 ((.191,-.120,1.423),(.019,.015,-.014),.014),((.202,-.087,1.398),(.010,.012,-.007),.008),
 ((.201,-.066,1.399),(.0015,.002,-.001),.0015)])

# Deliberately unequal medium side/back volumes. Their path behind the visible
# ear is inferred; front controls leave an actual ear-side opening.
sidepaths=[
 ('Own left / lifted outer return',[(.081,.04,1.551),(.155,.005,1.50),(.208,.008,1.42),(.242,.02,1.33),(.250,.035,1.264),(.230,.005,1.227),(.210,-.024,1.235)],[.003,.029,.037,.034,.027,.014,.002]),
 ('Own left / shorter tucked curl',[(.139,.092,1.491),(.207,.070,1.42),(.244,.078,1.333),(.239,.086,1.257),(.214,.059,1.201),(.198,.028,1.192),(.189,.010,1.207)],[.003,.026,.033,.030,.021,.009,.0015]),
 ('Own right / broken lower silhouette',[(-.073,.054,1.536),(-.154,.025,1.474),(-.209,.029,1.388),(-.239,.046,1.296),(-.248,.042,1.223),(-.229,.008,1.184),(-.207,-.022,1.194)],[.003,.032,.039,.034,.028,.014,.002]),
 ('Own right / short outward flick',[(-.139,.123,1.458),(-.199,.110,1.38),(-.230,.121,1.299),(-.239,.107,1.246),(-.253,.076,1.218),(-.235,.051,1.215)],[.004,.027,.033,.025,.013,.002]),
 ('Inferred back / long own-right turn',[(-.05,.065,1.558),(-.15,.12,1.48),(-.216,.155,1.371),(-.234,.145,1.275),(-.250,.103,1.223),(-.235,.071,1.183),(-.211,.047,1.190)],[.003,.031,.041,.039,.025,.012,.002]),
 ('Inferred back / short lower own-right overlap',[(-.12,.13,1.48),(-.197,.179,1.39),(-.226,.189,1.30),(-.219,.171,1.222),(-.199,.142,1.172),(-.181,.109,1.186)],[.004,.030,.037,.031,.016,.002]),
 ('Inferred back / asymmetric centre curl',[(.02,.08,1.56),(.034,.179,1.45),(.045,.227,1.34),(.032,.228,1.259),(.010,.201,1.193),(-.014,.173,1.205)],[.003,.034,.044,.039,.021,.002]),
 ('Inferred back / lifted own-left curl',[(.08,.08,1.53),(.17,.16,1.44),(.222,.177,1.332),(.238,.151,1.245),(.215,.132,1.184),(.190,.107,1.199)],[.003,.031,.040,.032,.017,.002]),
 ('Inferred back / swept short own-left tip',[(.14,.10,1.49),(.213,.129,1.40),(.254,.121,1.315),(.255,.073,1.267),(.231,.034,1.228),(.210,.002,1.234)],[.004,.027,.034,.030,.015,.0015])]
for name,points,widths in sidepaths:
    rows=[]
    for i,(p,w) in enumerate(zip(points,widths)):
        radial=Vector((p[0],p[1]-.02,0)).normalized();lateral=Vector((-radial.y,radial.x,0))
        rows.append((p,lateral*w,max(.001,w*.50)))
    clump(name,rows)
