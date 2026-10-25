"""Original V11 Misaki sculpt source. Run with Blender --background --python.
Creates editable subdivision surfaces, not an imported illustration/model.
Coordinates deliberately retain the game's RH Y-up metres and head pivot.
"""
import bpy, math, json, os
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
pieces=[]
def surface(name,vertices,faces,color,role='hair',uvs=None,subdivision=1,texture=None):
    me=bpy.data.meshes.new(name);me.from_pydata(vertices,[],faces);me.update()
    ob=bpy.data.objects.new(name,me);bpy.context.collection.objects.link(ob)
    if uvs:
        layer=me.uv_layers.new(name='Authored flow UV')
        for poly in me.polygons:
            for li in poly.loop_indices:layer.data[li].uv=uvs[me.loops[li].vertex_index]
    bpy.context.view_layer.objects.active=ob;ob.select_set(True)
    bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.mesh.normals_make_consistent(inside=False);bpy.ops.object.mode_set(mode='OBJECT');ob.select_set(False)
    for poly in me.polygons:poly.use_smooth=True
    if subdivision:
        modifier=ob.modifiers.new('Editable continuous Catmull-Clark sculpt','SUBSURF');modifier.levels=subdivision
    ob['original_authoring']='KeEv V11 surface sculpt';ob['material_role']=role
    pieces.append((ob,color,role,texture));return ob
def smooth_profile(controls,t):
    pos=t*(len(controls)-1);i=min(len(controls)-2,int(pos));u=pos-i
    a,b,c,d=[controls[max(0,min(len(controls)-1,j))] for j in (i-1,i,i+1,i+2)]
    return [((2*b[k])+(-a[k]+c[k])*u+(2*a[k]-5*b[k]+4*c[k]-d[k])*u*u+(-a[k]+3*b[k]-3*c[k]+d[k])*u*u*u)/2 for k in range(len(b))]
# Face is one smooth closed surface with a rounded jaw, full cheeks, integrated
# nose bridge and a softly projecting chin. No sphere nose attached to a ball.
profile=[(-.025,.025,.024,.012),(.005,.105,.077,.007),(.048,.168,.128,.003),(.112,.204,.166,.005),(.184,.215,.174,.010),(.270,.198,.165,.018),(.340,.144,.123,.024),(.385,.015,.014,.025)]
verts=[];uv=[];faces=[];rows=18;cols=40
for i in range(rows+1):
    y,rx,rz,cz=smooth_profile(profile,i/rows)
    for j in range(cols):
        a=j*math.tau/cols;x=math.cos(a)*rx;z=math.sin(a)*rz+cz
        front=max(0,-math.sin(a))**10
        z-=front*(.010*math.exp(-((y-.116)/.052)**2)*math.exp(-(x/.029)**2)+.006*math.exp(-((y-.045)/.026)**2))
        verts.append((x,y,z));uv.append((x/.46+.5,(y+.035)/.44))
for i in range(rows):
    for j in range(cols):
        a=i*cols+j;b=i*cols+(j+1)%cols;faces.append((a,a+cols,b+cols,b))
faces.extend([tuple(reversed(range(cols))),tuple(rows*cols+j for j in range(cols))])
surface('Misaki continuous cheek-jaw-nose sculpt',verts,faces,'#FFFFFF','skin',uv,1,'/assets/native-v11/misaki-skin.png')
# Bob foundation: contoured nape with a face opening, narrow crown part, and
# asymmetric scalloped hem. Surface includes thickness; ribbon locks continue
# the crown flow into a loose bob rather than a solid spherical helmet.
verts=[];uv=[];faces=[];rows=12;cols=40
for layer in range(2):
    for i in range(rows+1):
        for j in range(cols):
            a=j*math.tau/cols;front=max(0,-math.sin(a));end=2.46-front*1.35+.075*math.sin(a*5+.4)*(1-front)
            t=.025+end*i/rows;radius=.238-layer*.006
            width=math.sin(t) if t<1.40 else math.sin(1.40)-.035*(t-1.40)
            flow=.0035*math.cos(9*a+t*1.4)*math.sin(t)**2
            verts.append((math.cos(a)*(radius+flow)*width,.197+math.cos(t)*(.234-layer*.006),.036+math.sin(a)*(.228-layer*.006+flow)*width));uv.append((j/cols,1-i/rows))
n=(rows+1)*cols
for layer in range(2):
    for i in range(rows):
        for j in range(cols):
            a=layer*n+i*cols+j;b=layer*n+i*cols+(j+1)%cols;f=(a,b,b+cols,a+cols);faces.append(f if layer else tuple(reversed(f)))
for j in range(cols):
    b=(j+1)%cols;faces.extend([(j,b,b+n,j+n),(rows*cols+j,rows*cols+j+n,rows*cols+b+n,rows*cols+b)])
surface('Misaki shaped bob foundation',verts,faces,'#674330','hair',uv,1)
def ribbon(name,points,width,color,depth=.012,facing=-1):
    verts=[];uv=[];faces=[];steps=16;cols=4
    for layer in range(2):
        for i in range(steps+1):
            t=i/steps;c=smooth_profile(points,t);pa=smooth_profile(points,max(0,t-.002));pb=smooth_profile(points,min(1,t+.002));d=[pb[k]-pa[k] for k in range(3)]
            # width lies mostly across the head; the convex section gives each
            # lock a real broad highlight and a fine, physically closed edge.
            length=math.hypot(d[0],d[1]) or 1;right=[-d[1]/length,d[0]/length,0]
            w=width*(math.sin(math.pi*(.03+.94*t))**.45)*(1-.72*t**6)
            for j in range(cols+1):
                u=j/cols*2-1;roundness=depth*max(0,1-u*u)
                verts.append(tuple(c[k]+right[k]*w*u+(0 if k!=2 else facing*(roundness-layer*.004)) for k in range(3)));uv.append((j/cols,t))
    stride=cols+1;n=(steps+1)*stride
    for layer in range(2):
        for i in range(steps):
            for j in range(cols):
                a=layer*n+i*stride+j;f=(a,a+1,a+stride+1,a+stride);faces.append(f if layer else tuple(reversed(f)))
    for i in range(steps):
        for j in (0,cols):
            a=i*stride+j;b=a+stride;faces.append((a,b,b+n,a+n))
    for i in (0,steps):
        for j in range(cols):
            a=i*stride+j;faces.append((a,a+n,a+n+1,a+1))
    surface(name,verts,faces,color,'hair',uv,1)
# Off-centre part; broad swept bangs, tapered side layers and fine free tips.
ribbon('Swept fringe left',[(.005,.424,-.003),(-.035,.365,-.147),(-.118,.284,-.190),(-.194,.195,-.128)],.039,'#704A35',.018)
ribbon('Swept fringe right',[(.011,.421,-.010),(.069,.361,-.159),(.133,.289,-.182),(.194,.223,-.115)],.041,'#674330',.016)
ribbon('Inner fringe lock',[(.004,.413,-.058),(.022,.352,-.177),(.060,.284,-.192),(.108,.248,-.172)],.026,'#78513B',.012)
for side in (-1,1):
    for k in range(5):
        z=.005+k*.039;x=side*(.172+.013*math.sin(k))
        ribbon('Bob flow %s %s'%(side,k),[(side*.070,.390,.039),(side*.204,.293,z-.020),(side*(.245+.006*k),.145,z),(side*(.224+.009*math.sin(k)),.022+.013*k,z+.013)],.027,['#674330','#704A35','#78513B'][k%3],.016)
    ribbon('Loose cheek curl %s'%side,[(side*.165,.307,-.106),(side*.227,.213,-.106),(side*.245,.089,-.087),(side*.206,.030,-.102)],.020,'#704A35',.013)
for k in range(9):
    x=(k-4)*.052;z=.036+.222*math.sqrt(max(.05,1-(x/.27)**2));
    ribbon('Layered back bob %s'%k,[(x*.22,.418,.049),(x*.65,.338,z*.81),(x,.193,z),(x+.012*math.sin(k),.022+.009*math.cos(k*2),z-.030)],.034,['#674330','#704A35','#78513B'][k%3],.006,1)
# A sculpt master and a bounded runtime retopology are separate stages. The
# non-destructive high surface remains in the .blend; collapse is evaluated only
# for the game mesh and preserves material/UV seam boundaries.
for ob,color,role,texture in pieces:
    lod=ob.modifiers.new('Runtime retopology - source sculpt retained','DECIMATE');lod.ratio=.10;lod.use_collapse_triangulate=True;lod.delimit={'UV','MATERIAL'}
# Preserve a fully editable Blender master with explicit local-space surfaces.
out=Path(os.environ.get('V11_MASTER_OUT',str(ROOT/'assets/masters/native-v11')));out.mkdir(parents=True,exist_ok=True)
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(out/'misaki-head.blend'))
result=[];deps=bpy.context.evaluated_depsgraph_get()
for ob,color,role,texture in pieces:
    evaluated=ob.evaluated_get(deps);me=evaluated.to_mesh();me.calc_loop_triangles()
    positions=[];normals=[];uvs=[];indices=[];lookup={}
    for tri in me.loop_triangles:
        for li in tri.loops:
            loop=me.loops[li];v=me.vertices[loop.vertex_index];uv=me.uv_layers.active.data[li].uv;key=(loop.vertex_index,round(uv.x,7),round(uv.y,7))
            if key not in lookup:
                lookup[key]=len(positions)//3;positions.extend(v.co);normal=loop.normal;length=math.sqrt(sum(float(c)**2 for c in normal)) or 1;normals.extend(float(c)/length for c in normal);uvs.extend(uv)
            indices.append(lookup[key])
    # Preserve geometric winding but split the few UV/edge corners whose
    # interpolated smooth normals face away after collapse of a thin lock rim.
    for k in range(0,len(indices),3):
        ids=indices[k:k+3];a,b,c=[positions[i*3:i*3+3] for i in ids];u=[b[j]-a[j] for j in range(3)];v=[c[j]-a[j] for j in range(3)];n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];length=math.sqrt(sum(x*x for x in n));summed=[sum(normals[i*3+j] for i in ids) for j in range(3)]
        if sum(n[j]*summed[j] for j in range(3))<=1e-17 and length>1e-14:
            for j,i in enumerate(ids):
                indices[k+j]=len(positions)//3;positions.extend(positions[i*3:i*3+3]);normals.extend(x/length for x in n);uvs.extend(uvs[i*2:i*2+2])
    # Authored flowing locks use a narrow atlas band, not cylindrical wrap UV.
    # Each full lock occupies U0..0.45; no triangle crosses a texture repeat.
    if role=='hair':
        for i in range(0,len(uvs),2):uvs[i]*=.45
    for k in range(0,len(indices),3):
        ids=indices[k:k+3];u=[uvs[i*2] for i in ids]
        if max(u)-min(u)>.5:
            for j,i in enumerate(ids):
                if u[j]<.5:
                    indices[k+j]=len(positions)//3;positions.extend(positions[i*3:i*3+3]);normals.extend(normals[i*3:i*3+3]);uvs.extend((uvs[i*2]+1,uvs[i*2+1]))
    item={'shape':'mesh','at':[0,0,0],'color':color,'role':role,'roughness':.60 if role=='hair' else .78,'geometry':{'positions':positions,'normals':normals,'uvs':uvs,'indices':indices}}
    if texture:item['baseColorTexture']=texture
    result.append(item);evaluated.to_mesh_clear()
(out/'misaki-head.json').write_text(json.dumps(result,separators=(',',':'))+'\n')
print(json.dumps({'surfaces':len(result),'triangles':sum(len(s['geometry']['indices'])//3 for s in result),'editable_master':str(out/'misaki-head.blend')}))
