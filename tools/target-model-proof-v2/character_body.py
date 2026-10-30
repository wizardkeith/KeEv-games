"""V2 body control surfaces. Executed in build_scene.py's authoring context."""
# Recognizable flat soles, raised insteps and stitched loafer vamps.
loft('Ivory socks / own right',[(.07,.030,.031,.008),(.16,.031,.032,.008),(.28,.034,.034,.006),(.37,.036,.035,.004)],shirt,n=24).location.x=-.073
loft('Ivory socks / own left',[(.07,.030,.031,-.019),(.16,.031,.032,-.019),(.28,.034,.034,-.021),(.37,.036,.035,-.020)],shirt,n=24).location.x=.074
for side,dy in [(-1,.018),(1,-.025)]:
    x0=side*.074
    outline=[(-.025,-.143),(.025,-.143),(.047,-.123),(.052,-.083),(.048,-.032),(.041,.023),(.036,.064),(-.036,.064),(-.041,.023),(-.048,-.032),(-.052,-.083),(-.047,-.123)]
    v=[(x0+x,y+dy,z) for z in (0,.012) for x,y in outline];n=len(outline)
    f=[tuple(reversed(range(n))),tuple(range(n,2*n))]+[(j,(j+1)%n,(j+1)%n+n,j+n) for j in range(n)]
    o=mesh('Loafer / flat welt sole '+str(side),v,f,sole,'shoes')
    bevel=o.modifiers.new('Soft leather sole corners','BEVEL');bevel.width=.004;bevel.segments=3
    rows=[(-.145,.009,.028,.039),(-.137,.033,.023,.050),(-.113,.047,.021,.063),(-.070,.048,.022,.072),(-.025,.044,.023,.098),(.018,.039,.023,.110),(.053,.034,.023,.094),(.065,.018,.026,.070)]
    v=[];f=[];C=20
    for y,w,low,high in rows:
        for j in range(C):
            a=math.tau*j/C;bottom=low-.010;v.append((x0+w*math.cos(a),y+dy,bottom+(high-bottom)*(.5+.5*math.sin(a))))
    for i in range(len(rows)-1):
        for j in range(C):k=i*C+j;q=i*C+(j+1)%C;f.append((k,q,q+C,k+C))
    f.extend([tuple(reversed(range(C))),tuple((len(rows)-1)*C+j for j in range(C))])
    mesh('Loafer / shaped toe and high instep '+str(side),v,f,shoe,'shoes',2)
    curve('Loafer / moccasin vamp stitch '+str(side),[(x0-.034,dy-.025,.077),(x0-.040,dy-.071,.065),(x0-.027,dy-.116,.057),(x0,dy-.126,.059),(x0+.027,dy-.116,.057),(x0+.040,dy-.071,.065),(x0+.034,dy-.025,.077)],.0011,seam,'shoes')
    tube('Loafer / raised penny strap '+str(side),[(x0-.042,dy-.017,.073),(x0-.024,dy-.026,.088),(x0,dy-.028,.095),(x0+.024,dy-.026,.088),(x0+.042,dy-.017,.073)],[(.007,.002)]*5,shoe,'shoes',sides=8)
    curve('Loafer / small strap opening '+str(side),[(x0-.011,dy-.033,.098),(x0+.011,dy-.033,.098)],.0012,sole,'shoes')

# Broad A-line with asymmetric box/knife pleats carried through the lower body.
skirtrows=[(.295,.239,.151,.008),(.310,.243,.154,.008),(.365,.232,.150,.006),(.46,.210,.138,.003),(.57,.183,.124,0),(.67,.157,.111,0),(.75,.132,.096,0),(.773,.126,.093,0)]
v=[];f=[];C=80
for i,(z,rx,ry,cy) in enumerate(skirtrows):
    t=i/(len(skirtrows)-1)
    for j in range(C):
        a=math.tau*j/C
        pleat=.10*math.cos(9*a+.4)+.035*math.cos(15*a-.8)
        radius=1+pleat*(.95-.45*t)
        v.append((rx*math.sin(a)*radius,cy-ry*math.cos(a)*radius,z+.006*math.sin(3*a+.2)*(1-t)))
for i in range(len(skirtrows)-1):
    for j in range(C):k=i*C+j;q=i*C+(j+1)%C;f.append((k,q,q+C,k+C))
f.append(tuple((len(skirtrows)-1)*C+j for j in range(C)))
skirt=mesh('Plum skirt / flared unequal sculpted pleats',v,f,plum,'clothes',2,.003)
ring_uv(skirt,C,len(skirtrows),36,[row[0]*30 for row in skirtrows])

# Blouse and cardigan surfaces have compressed folds, not round rigid cylinders.
blouse=loft('Blouse torso',[(.748,.121,.089,0),(.79,.127,.094,0),(.86,.135,.087,0),(.94,.140,.082,0),(1.015,.140,.075,0),(1.060,.102,.062,0),(1.091,.045,.037,0)],shirt,n=48)
for vert in blouse.data.vertices:
    p=vert.co;front=max(0,min(1,(-p.y-.02)/.06))
    p.y-=front*(.0035*math.sin(p.x*95+p.z*10)+.0015*math.sin(p.x*155-p.z*17))
loft('Visible neck',[(1.043,.035,.032,.004),(1.105,.037,.033,.005),(1.186,.041,.036,.006)],skin,'skin',n=24)
cardigan=loft('Open sage cardigan / dropped soft shoulders',[(.715,.133,.095,.004),(.75,.139,.103,.003),(.82,.144,.099,0),(.91,.151,.092,0),(.985,.154,.081,0),(1.035,.142,.069,0),(1.077,.072,.052,0)],sage,n=48,open_angle=.44)
for vert in cardigan.data.vertices:
    p=vert.co
    p.y+=.003*math.sin(p.x*70+p.z*29)*max(0,min(1,(1.03-p.z)/.28))
for side in (-1,1):
    curve('Cardigan open knit edge '+str(side),[(side*.058,-.091,.718),(side*.062,-.099,.79),(side*.070,-.085,.91),(side*.073,-.071,1.01),(side*.033,-.048,1.079)],.0033,sageedge,'clothes')
    path=[(side*.116,.005,1.041),(side*.148,-.001,1.017),(side*.170,-.019,.981),(side*.186,-.040,.934),(side*.189,-.070,.893),(side*.171,-.111,.853),(side*.141,-.144,.820),(side*.119,-.156,.802)]
    widths=[(.033,.037),(.046,.043),(.050,.047),(.052,.048),(.058,.049),(.056,.043),(.045,.034),(.034,.030)]
    o=tube('Dropped sleeve / compressed elbow folds '+str(side),path,widths,sage,sides=24,sub=2)
    for index,vert in enumerate(o.data.vertices):
        row=index//24;a=math.tau*(index%24)/24
        if 2<=row<=6:
            p=vert.co;c=Vector(path[row]);delta=p-c
            p+=delta.normalized()*(.0060*math.sin(3*a+row*2.3)+.0030*math.sin(5*a-row))
    tube('Turned cuff / upper soft fold '+str(side),[(side*.144,-.144,.825),(side*.126,-.158,.804),(side*.116,-.160,.794)],[(.044,.034),(.041,.034),(.034,.030)],sageedge,'clothes',sides=24,sub=2)
    tube('Turned cuff / lower rolled lip '+str(side),[(side*.127,-.157,.808),(side*.117,-.163,.794),(side*.112,-.163,.787)],[(.036,.031),(.037,.032),(.031,.027)],sage,'clothes',sides=24)
    # Two relaxed overlapping hands, with fingers laid down rather than locked.
    if side==-1:
        wrist=(-.047,-.205,.715);palm=(-.026,-.224,.679)
    else:
        wrist=(.033,-.233,.725);palm=(-.006,-.248,.693)
    tube('Exposed forearm '+str(side),[(side*.112,-.163,.792),(side*.094,-.185,.758),wrist,palm],[.029,.027,.021,(.024,.013)],skin,'skin',sides=16,sub=2)
    o=ellipsoid('Relaxed overlapping palm '+str(side),palm,(.025,.013,.036),skin,'skin');o.rotation_euler.y=-.20 if side==-1 else .40
    for j in range(4):
        x=palm[0]+(j-1.5)*.010;z=palm[2]-.016+.003*abs(j-1.5);y=palm[1]-.002
        tube('Relaxed finger '+str(side)+' '+str(j),[(x,y,z),(x-.004,y-.005,z-.023),(x-.010,y-.003,z-.039+.005*abs(j-1.5))],[.0056,.0051,.0037],skin,'skin',sides=10,sub=2)
    tube('Resting thumb '+str(side),[(palm[0]+.022,palm[1]-.002,palm[2]+.014),(palm[0]+.027,palm[1]-.012,palm[2]-.002),(palm[0]+.012,palm[1]-.014,palm[2]-.012)],[.007,.006,.004],skin,'skin',sides=12)
    # True grid control surface creates pointed folded collars under subdivision.
    pts=[(side*.006,-.040,1.093),(side*.028,-.041,1.096),(side*.047,-.056,1.071),(side*.058,-.076,1.041),(side*.024,-.091,1.030),(side*.013,-.067,1.066)]
    mesh('Folded pointed blouse collar '+str(side),pts,[(0,1,2,5),(5,2,3,4)],shirt,'clothes',1,.0025)
for z in (1.052,1.015,.978,.941,.904,.867,.830,.793):
    ellipsoid('Small blouse button',(0,-.093,z),(.0025,.0017,.0025),sole,'details',16,10)
curve('Blouse centre sewn placket',[(.010,-.082,1.062),(.010,-.091,.97),(.010,-.096,.86),(.010,-.097,.78)],.0007,seam,'details')
