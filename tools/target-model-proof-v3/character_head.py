"""V2 shorter face, fuller cheeks and softly layered eyes. Native surfaces."""
head_objects_start=len(made)
CZ=1.370;RZ=.172
def headprofile(z):
    v=max(-.9999,min(.9999,(z-CZ)/RZ));s=math.sqrt(max(.00001,1-v*v))
    jaw=.88+.12*(.5+.5*math.tanh((v+.20)*3))
    return .189*s*jaw,.144*s,.012
def face_y(x,z):
    rx,ry,cy=headprofile(z)
    return cy-ry*math.sqrt(max(.01,1-(x/max(rx,.001))**2))-.002*math.exp(-(x/.030)**2-((z-1.291)/.040)**2)
v=[];f=[];ROWS=37;COLS=56
for i in range(ROWS):
    z=CZ-RZ+.001+(2*RZ-.002)*i/(ROWS-1);rx,ry,cy=headprofile(z)
    for j in range(COLS):
        a=j/COLS*math.tau;x=rx*math.sin(a);y=cy-ry*math.cos(a)
        if math.cos(a)>0:y=face_y(x,z)
        v.append((x,y,z))
for i in range(ROWS-1):
    for j in range(COLS):k=i*COLS+j;q=i*COLS+(j+1)%COLS;f.append((k,q,q+COLS,k+COLS))
f.extend([tuple(reversed(range(COLS))),tuple((ROWS-1)*COLS+j for j in range(COLS))])
face=mesh('Misaki / rounded cheek and narrowing jaw',v,f,skinvc,'skin',1)
def skin_colour(p):
    blush=max(math.exp(-((p.x-.108)/.041)**2-((p.z-1.278)/.032)**2),math.exp(-((p.x+.108)/.041)**2-((p.z-1.278)/.032)**2))
    front=max(0,min(1,(-p.y-.020)/.085))
    return mix(rgb('#F1C5AB'),rgb('#E58E88'),blush*.70*front)
paint(face,skin_colour)
for side in (-1,1):
    ellipsoid('Warm ear bowl '+str(side),(side*.176,-.001,1.299),(.024,.026,.039),skin,'skin')
    ellipsoid('Soft ear inner '+str(side),(side*.192,-.013,1.299),(.006,.015,.024),earinner,'skin',20,12)
    curve('Ear folded inner ridge '+str(side),[(side*.188,-.026,1.317),(side*.197,-.023,1.305),(side*.189,-.025,1.287)],.0018,skin,'skin')
    cx=side*.073;zc=1.329
    ev=[(cx,face_y(cx,zc)-.0038,zc)];ef=[];rings=5;n=48
    for ri in range(1,rings+1):
        r=ri/rings
        for j in range(n):
            a=j/n*math.tau;dx=.043*r*math.cos(a)
            dz=(.029 if math.sin(a)>0 else .025)*r*math.sin(a)+side*.075*dx
            x=cx+dx;z=zc+dz;ev.append((x,face_y(x,z)-.001-.0028*(1-r*r),z))
    for j in range(n):ef.append((0,1+j,1+(j+1)%n))
    for r in range(rings-1):
        for j in range(n):k=1+r*n+j;q=1+r*n+(j+1)%n;ef.append((k,q,q+n,k+n))
    mesh('Curved almond eye white '+str(side),ev,ef,white,'eyes')
    ic=cx-side*.002;iz=zc-.001
    def disc(name,rx,rz,offset,mat,rings=1):
        vs=[(ic,face_y(ic,iz)-offset,iz)];fs=[];N=48
        for ri in range(1,rings+1):
            r=ri/rings
            for j in range(N):
                a=j/N*math.tau;x=ic+rx*r*math.cos(a);z=min(iz+rz*r*math.sin(a),zc+.025)
                vs.append((x,face_y(x,z)-offset+.0005*r*r,z))
        for j in range(N):fs.append((0,1+j,1+(j+1)%N))
        for ri in range(rings-1):
            for j in range(N):k=1+ri*N+j;q=1+ri*N+(j+1)%N;fs.append((k,q,q+N,k+N))
        return mesh(name,vs,fs,mat,'eyes')
    disc('Thin chestnut iris rim '+str(side),.0278,.029,.0047,irisdark)
    irisobj=disc('Soft gradient chestnut iris '+str(side),.0267,.028,.0056,irisvc,6)
    def iris_colour(p):
        lower=max(0,min(1,(iz+.021-p.z)/.048))
        radial=math.atan2(p.z-iz,p.x-ic)
        t=max(0,min(1,lower*.82+.05*math.sin(radial*13)))
        return mix(rgb('#4B3023'),rgb('#B68B5D'),t)
    paint(irisobj,iris_colour)
    disc('Round soft pupil '+str(side),.0125,.0175,.0068,pupil)
    for dx,dz,r in [(-.008,.012,.0043),(.009,-.012,.0018)]:
        x=ic+dx;z=iz+dz;ellipsoid('Eye catchlight '+str(side),(x,face_y(x,z)-.008,z),(r,.0013,r*1.1),highlight,'eyes',16,10)
    upper=[];lower=[];crease=[]
    for j in range(11):
        a=math.pi-j/10*math.pi;dx=.043*math.cos(a);x=cx+dx;z=zc+.029*math.sin(a)+side*.075*dx
        upper.append((x,face_y(x,z)-.002,z));crease.append((x,face_y(x,z+.004)-.001,z+.004))
        a=math.pi+j/10*math.pi;dx=.043*math.cos(a);x=cx+dx;z=zc+.025*math.sin(a)+side*.075*dx
        lower.append((x,face_y(x,z)-.001,z))
    curve('Soft upper eyelid volume '+str(side),crease,.0016,skin,'eyes',[.1,.3,.6,.9,1,1,1,.9,.6,.3,.1])
    curve('Swept brown upper eyelash '+str(side),upper,.0022,pupil,'eyes',[.1,.3,.5,.75,.9,1,1,.95,.7,.4,.1])
    curve('Rose lower lid '+str(side),lower,.0008,earinner,'eyes',[.1,.2,.4,.5,.6,.6,.6,.5,.4,.2,.1])
    outerx=cx+side*.043;z=zc+.008
    curve('Outer soft lash flick '+str(side),[(outerx-side*.005,face_y(outerx-side*.005,z)-.002,z),(outerx+side*.006,face_y(outerx,z)-.002,z+.007)],.0014,pupil,'eyes',[1,.1])
    pts=[]
    for xx,zz in [(-.031,1.389),(-.012,1.398),(.012,1.399),(.030,1.392)]:
        x=cx+xx;pts.append((x,face_y(x,zz)-.0018,zz))
    curve('Warm expressive brow '+str(side),pts,.0018,brow,'eyes',[.15,.8,1,.1])
ellipsoid('Small soft nose',(0,face_y(0,1.290)-.001,1.290),(.0065,.0055,.0075),skin,'skin',20,14)
curve('Gentle small smile',[(x,face_y(x,z)-.001,z) for x,z in [(-.017,1.258),(-.006,1.254),(.007,1.255),(.018,1.262)]],.0013,lip,'eyes',[.1,.8,.8,.1])
