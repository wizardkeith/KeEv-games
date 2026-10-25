"""Original V11 visitor-a sculpt source. Run with Blender --background --python.
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
profile=[(-.025,.030,.026,.013),(.008,.115,.090,.008),(.058,.178,.140,.004),(.130,.203,.164,.008),(.215,.207,.166,.014),(.295,.185,.150,.023),(.357,.120,.108,.027),(.385,.012,.012,.028)]
verts=[];uv=[];faces=[];rows=18;cols=40
for i in range(rows+1):
    y,rx,rz,cz=smooth_profile(profile,i/rows)
    for j in range(cols):
        a=j*math.tau/cols;x=math.cos(a)*rx;z=math.sin(a)*rz+cz
        front=max(0,-math.sin(a))**10
        z-=front*(.010*math.exp(-((y-.116)/.052)**2)*math.exp(-(x/.029)**2)+.006*math.exp(-((y-.045)/.026)**2))
        verts.append((x,y,z));uv.append((.5-x/.46,1-(y+.035)/.44))
for i in range(rows):
    for j in range(cols):
        a=i*cols+j;b=i*cols+(j+1)%cols;faces.append((a,a+cols,b+cols,b))
faces.extend([tuple(reversed(range(cols))),tuple(rows*cols+j for j in range(cols))])
surface('Visitor A continuous cheek-jaw-nose sculpt',verts,faces,'#FFFFFF','skin',uv,1,'/assets/native-v11/visitor-a-skin.png')
# Independent sculpted ears remain visible below the short hairline.
for side in (-1,1):
    ear=[];earuv=[];faces=[];cols=16;rows=10
    ear.append((side*.202,.191,.015));earuv.append((.5-side*.202/.46,1-(.191+.035)/.44))
    for r in range(1,rows):
        t=r/rows*math.pi
        for j in range(cols):
            a=j/cols*math.tau;x=side*(.202+.027*math.sin(t)*math.cos(a));y=.145+.046*math.cos(t);z=.015+.026*math.sin(t)*math.sin(a);ear.append((x,y,z));earuv.append((.5-x/.46,1-(y+.035)/.44))
    bottom=len(ear);ear.append((side*.202,.099,.015));earuv.append((.5-side*.202/.46,1-(.099+.035)/.44))
    for j in range(cols):faces.extend([(0,1+j,1+(j+1)%cols),(bottom,1+(rows-2)*cols+(j+1)%cols,1+(rows-2)*cols+j)])
    for r in range(rows-2):
        for j in range(cols):a=1+r*cols+j;b=1+r*cols+(j+1)%cols;faces.append((a,a+cols,b+cols,b))
    surface('Visitor A ear %s'%side,ear,faces,'#FFFFFF','skin',earuv,1,'/assets/native-v11/visitor-a-skin.png')
# Short crown foundation with a real open hairline and narrow crown part.
# Independent thick locks break up the side/back silhouette.
verts=[];uv=[];faces=[];rows=12;cols=40
for layer in range(2):
    for i in range(rows+1):
        for j in range(cols):
            a=j*math.tau/cols;front=max(0,-math.sin(a));end=1.95-front*.75+.055*math.sin(a*4+.4)*(1-front)
            t=.025+end*i/rows;radius=.225-layer*.006
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
surface('Visitor A short sculpted crown',verts,faces,'#40352E','hair',uv,1)
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
# Tousled short hair is independently authored, not a recoloured Misaki bob.
for k in range(7):
    x=(k-3)*.045
    ribbon('Male fringe %s'%k,[(x*.25,.425,-.004),(x*.55,.360,-.125),(x,.280,-.182),(x+.015*math.sin(k),.209+.018*math.cos(k),-.164+abs(x)*.18)],.031,['#40352E','#4C3C31','#5B4434'][k%3],.012)
for side in (-1,1):
    ribbon('Male temple %s'%side,[(side*.105,.385,.014),(side*.207,.285,.015),(side*.226,.196,.020),(side*.213,.123,.024)],.025,'#40352E',.010)
for k in range(7):
    x=(k-3)*.055;z=.025+.204*math.sqrt(max(.08,1-(x/.25)**2))
    ribbon('Male back flow %s'%k,[(x*.25,.422,.034),(x*.65,.343,z*.78),(x,.227,z),(x+.010*math.sin(k),.119+.010*math.cos(k),z-.024)],.031,['#40352E','#4C3C31','#5B4434'][k%3],.007,1)
# Six cross-flow tufts disrupt the previously comb-like round outline. Their
# tips lift off the crown/back as in the original target's male silhouette.
for side in (-1,1):
    ribbon('Male lifted crown %s'%side,[(side*.015,.420,.018),(side*.080,.428,.045),(side*.151,.401,.089),(side*.185,.349,.131)],.026,'#4C3C31',.008,1)
    ribbon('Male side tuft upper %s'%side,[(side*.135,.337,.080),(side*.221,.289,.110),(side*.245,.245,.103),(side*.252,.235,.068)],.025,'#40352E',.009,1)
    ribbon('Male side tuft lower %s'%side,[(side*.183,.258,.100),(side*.230,.196,.114),(side*.244,.163,.105),(side*.245,.155,.072)],.021,'#4C3C31',.008,1)
# A sculpt master and a bounded runtime retopology are separate stages. The
# non-destructive high surface remains in the .blend; collapse is evaluated only
# for the game mesh and preserves material/UV seam boundaries.
for ob,color,role,texture in pieces:
    lod=ob.modifiers.new('Runtime retopology - source sculpt retained','DECIMATE');lod.ratio=.23 if role=='skin' else .08;lod.use_collapse_triangulate=True;lod.delimit={'UV','MATERIAL'}
# Preserve a fully editable Blender master with explicit local-space surfaces.
out=Path(os.environ.get('V11_MASTER_OUT',str(ROOT/'assets/masters/native-v11')));out.mkdir(parents=True,exist_ok=True)
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(out/'visitor-a-head.blend'))
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
    item['authoringName']=ob.name
    if texture:item['baseColorTexture']=texture
    result.append(item);evaluated.to_mesh_clear()
(out/'visitor-a-head.json').write_text(json.dumps(result,separators=(',',':'))+'\n')
print(json.dumps({'surfaces':len(result),'triangles':sum(len(s['geometry']['indices'])//3 for s in result),'editable_master':str(out/'visitor-a-head.blend')}))
