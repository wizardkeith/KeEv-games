"""One bounded head refinement of user-supplied candidate. Original untouched."""
import bpy,json,math,hashlib,struct
from pathlib import Path
from mathutils import Vector
from mathutils.bvhtree import BVHTree
R=Path(__file__).resolve().parents[2];A=R/'assets/authoring/grok-head-refinement-v1';O=R/'docs/reviews/evidence/grok-head-refinement-v1';O.mkdir(parents=True,exist_ok=True)
src=A/'original/Misaki_trial.blend';before=hashlib.sha256(src.read_bytes()).hexdigest();assert before=='d6ac7d03759a00a60fdab4232e980221e16165c9125afe765bd106d6974f09a0'
assert not bpy.context.preferences.filepaths.use_scripts_auto_execute and not bpy.app.online_access
bpy.ops.wm.open_mainfile(filepath=str(src),load_ui=False,use_scripts=False);o=bpy.data.objects['Misaki'];m=o.data;scene=bpy.context.scene
assert not bpy.data.libraries and not bpy.data.images and not bpy.data.texts
# Connected islands are inspected from geometry, not archive-script execution.
adj=[set()for v in m.vertices]
for e in m.edges:a,b=e.vertices;adj[a].add(b);adj[b].add(a)
seen=set();parts=[]
for start in range(len(adj)):
 if start in seen:continue
 stack=[start];seen.add(start);ids=[]
 while stack:
  q=stack.pop();ids.append(q)
  for n in adj[q]:
   if n not in seen:seen.add(n);stack.append(n)
 ids=sorted(ids);s=set(ids);polys=[p.index for p in m.polygons if p.vertices[0]in s];parts.append({'ids':ids,'polys':polys,'material':m.materials[m.polygons[polys[0]].material_index].name,'centre':sum((m.vertices[i].co for i in ids),Vector())/len(ids),'minZ':min(m.vertices[i].co.z for i in ids)})
headparts=[p for p in parts if p['minZ']>1.10];headids={i for p in headparts for i in p['ids']};bodyids=set(range(len(m.vertices)))-headids
def body_fingerprint():
 rows=[]
 for i in sorted(bodyids):
  v=m.vertices[i];rows.append((i,tuple(v.co),[(o.vertex_groups[g.group].name,g.weight)for g in v.groups]))
 for p in m.polygons:
  if p.vertices[0]in bodyids:rows.append((p.index,tuple(p.vertices),m.materials[p.material_index].name,[tuple(m.uv_layers.active.data[li].uv)for li in p.loop_indices]))
 return hashlib.sha256(json.dumps(rows).encode()).hexdigest()
body_before=body_fingerprint()
def eval_body():
 bpy.context.view_layer.update();e=o.evaluated_get(bpy.context.evaluated_depsgraph_get());mesh=e.to_mesh();out={'co':[tuple(mesh.vertices[i].co)for i in sorted(bodyids)],'normals':[tuple(mesh.corner_normals[li].vector)for p in mesh.polygons if p.vertices[0]in bodyids for li in p.loop_indices]};e.to_mesh_clear();return out
body_eval_before=eval_body()
# Keep an untouched mesh control in this separate scene; both share one rig.
control=o.copy();control.data=m.copy();control.name='Original candidate / same studio control';scene.collection.objects.link(control);control.hide_render=True
for obj in list(bpy.data.objects):
 if obj.type in('CAMERA','LIGHT'):bpy.data.objects.remove(obj,do_unlink=True)
def area(name,co,power,size):
 d=bpy.data.lights.new(name,'AREA');d.energy=power;d.size=size;obj=bpy.data.objects.new(name,d);scene.collection.objects.link(obj);obj.location=co;obj.rotation_euler=(Vector((0,0,1.28))-obj.location).to_track_quat('-Z','Y').to_euler();return d
key=area('Shared neutral broad key',(-3,-4,5),400,4);fill=area('Shared soft fill',(3,-2,3),160,4)
w=bpy.data.worlds.new('Shared neutral studio');w.use_nodes=True;w.node_tree.nodes['Background'].inputs[0].default_value=(.55,.55,.55,1);w.node_tree.nodes['Background'].inputs[1].default_value=.45;scene.world=w
def camera(name,co,target,scale):
 d=bpy.data.cameras.new(name);d.type='ORTHO';d.ortho_scale=scale;obj=bpy.data.objects.new(name,d);scene.collection.objects.link(obj);obj.location=co;obj.rotation_euler=(Vector(target)-obj.location).to_track_quat('-Z','Y').to_euler();return obj
cameras={'front':camera('Shared front',(0,-3,1.33),(0,0,1.29),.48),'three-quarter':camera('Shared three-quarter',(1.6,-3,1.36),(0,0,1.29),.48),'profile':camera('Shared profile',(3,0,1.34),(0,0,1.29),.48),'full':camera('Shared full',(0,-5,.85),(0,0,.75),1.72)}
scene.render.engine='BLENDER_EEVEE';scene.view_settings.view_transform='Standard';scene.view_settings.look='None';scene.view_settings.exposure=0;scene.render.resolution_x=760;scene.render.resolution_y=760;scene.render.resolution_percentage=100;scene.render.image_settings.file_format='PNG';scene.render.use_stamp=True;scene.render.use_stamp_note=True;scene.render.use_stamp_labels=False;scene.render.stamp_font_size=12
for prop in ['use_stamp_date','use_stamp_time','use_stamp_render_time','use_stamp_frame','use_stamp_frame_range','use_stamp_scene','use_stamp_camera','use_stamp_lens','use_stamp_filename','use_stamp_marker','use_stamp_memory','use_stamp_hostname']:
 if hasattr(scene.render,prop):setattr(scene.render,prop,False)
def render(mode,mood,view):
 control.hide_render=mode!='before';o.hide_render=mode!='after';scene.camera=cameras[view];key.color=(1,1,1)if mood=='neutral'else(1,.88,.76);fill.color=(1,1,1)if mood=='neutral'else(.92,.96,1);scene.render.stamp_note_text='ACTUAL BLENDER / '+mode+' / '+mood+' / '+view+' / head study, not accepted/game screenshot';scene.render.filepath=str(O/(mode+'-'+mood+'-'+view+'.png'));bpy.ops.render.render(write_still=True)
for view in ('front','three-quarter','profile','full'):render('before','neutral',view)
render('before','warm','three-quarter')
# Directly reshape the existing seven closed bang cages. No extra hair sheets.
bangs=sorted([p for p in headparts if p['material']=='M_Hair'and len(p['ids'])==28],key=lambda p:p['centre'].x);assert len(bangs)==7
cap=next(p for p in headparts if p['material']=='M_Hair'and len(p['ids'])>500)
face=next(p for p in headparts if p['material']=='M_Skin'and len(p['ids'])==200)
def tree_for(p):
 ids=p['ids'];lookup={vid:i for i,vid in enumerate(ids)};return BVHTree.FromPolygons([m.vertices[i].co for i in ids],[[lookup[i]for i in m.polygons[j].vertices]for j in p['polys']],all_triangles=False)
face_tree=tree_for(face)
# Crown/side volume remains connected: small asymmetry and inward lower return.
for i in cap['ids']:
 v=m.vertices[i];x,y,z=v.co
 if z<1.37:
  t=max(0,min(1,(1.37-z)/.26));v.co.x*=1-.045*math.sin(t*math.pi*.7);v.co.y=.012+(y-.012)*(1-.12*max(0,(y-.012)/.21))
  if x>0:v.co.z+=.013*t*t
 if z>1.38:
  v.co.z-=.0035*math.exp(-((x-.028)/.023)**2)*max(0,1-abs(y+.035)/.15)
cap_tree=tree_for(cap)
tips=[(-.137,-.085,1.247),(-.112,-.112,1.278),(-.075,-.132,1.302),(-.031,-.143,1.320),(.030,-.143,1.344),(.084,-.115,1.329),(.130,-.081,1.307)]
def bez(a,b,c,d,t):return a*(1-t)**3+3*b*t*(1-t)**2+3*c*t*t*(1-t)+d*t**3
for index,(part,tip)in enumerate(zip(bangs,tips)):
 ids=part['ids'];old=[m.vertices[i].co.copy()for i in ids];root=(old[0]+old[1])/2;end=Vector(tip)
 assert all((old[2*j]-old[2*j+1]).length<.12 for j in range(7))
 p1=Vector((root.x+.015,-.075,1.435));p2=Vector((end.x+.025,end.y-.004,end.z+.065))
 for j in range(7):
  t=j/6;centre=bez(root,p1,p2,end,t);direction=(old[2*j+1]-old[2*j]).normalized();direction=(direction*(1-.65*t)+Vector((1,0,.05))*(.65*t)).normalized();original_half=(old[2*j+1]-old[2*j]).length/2;half=original_half*(1.05-.90*t**3)
  for k in (0,1):
   p=centre+direction*half*(-1 if k==0 else 1)
   for surface in (face_tree,cap_tree):
    hit=surface.ray_cast(Vector((p.x,-1,p.z)),Vector((0,1,0)))[0]
    if hit:p.y=min(p.y,hit.y-.0045)
   m.vertices[ids[2*j+k]].co=p
   m.vertices[ids[14+2*j+k]].co=p+(old[14+2*j+k]-old[2*j+k])*.60
for part in headparts:
 if part['material']=='M_Hair'and len(part['ids'])==32:
  side=1 if part['centre'].x>0 else-1
  for i in part['ids']:
   v=m.vertices[i];t=max(0,min(1,(1.30-v.co.z)/.18));v.co.x-=side*.012*t*t
   if side>0:v.co.z+=.012*t*t
# Own loop colour, usable without a unique UV atlas. Body colours/materials stay unchanged.
attribute=m.color_attributes.new(name='HeadLookdevColour',type='FLOAT_COLOR',domain='CORNER')
for item in attribute.data:item.color=(1,1,1,1)
def assign(part,material):
 if material.name not in [x.name for x in m.materials]:m.materials.append(material)
 slot=list(m.materials).index(material)
 for pi in part['polys']:m.polygons[pi].material_index=slot
def rgb(h):
 c=[int(h[k:k+2],16)/255 for k in(1,3,5)];return tuple(x/12.92 if x<=.04045 else((x+.055)/1.055)**2.4 for x in c)
skin_base=tuple(bpy.data.materials['M_Skin'].node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value)[:3]
def skincolour(p):
 blush=max(math.exp(-((p.x-.079)/.029)**2-((p.z-1.224)/.022)**2),math.exp(-((p.x+.079)/.029)**2-((p.z-1.224)/.022)**2));f=max(0,min(1,(-p.y-.02)/.07));return tuple(a*(1-blush*.25*f)+b*blush*.25*f for a,b in zip(skin_base,rgb('#EFA597')))
def painted_pbr(name):
 mat=bpy.data.materials.new(name);mat.use_nodes=True;n=mat.node_tree.nodes;p=n['Principled BSDF'];p.inputs['Roughness'].default_value=.88;p.inputs['Specular IOR Level'].default_value=.08;colour=n.new('ShaderNodeVertexColor');colour.layer_name=attribute.name;mat.node_tree.links.new(colour.outputs['Color'],p.inputs['Base Color']);return mat
face_mat=painted_pbr('Head only / own cheek colour and soft response');hair_mat=painted_pbr('Head only / broad brown clump colour')
# Use actual EEVEE coloured shadow response on face only; separate export fallback later.
n=face_mat.node_tree.nodes;n.remove(n['Principled BSDF']);links=face_mat.node_tree.links;colour=next(x for x in n if x.bl_idname=='ShaderNodeVertexColor');diff=n.new('ShaderNodeBsdfDiffuse');diff.inputs['Color'].default_value=(1,1,1,1);convert=n.new('ShaderNodeShaderToRGB');ramp=n.new('ShaderNodeValToRGB');ramp.color_ramp.interpolation='EASE'
for j,(pos,c)in enumerate([(0,(.78,.66,.66,1)),(.19,(.78,.66,.66,1)),(.31,(.98,.94,.91,1)),(.64,(.98,.94,.91,1)),(.77,(1,1,.98,1)),(1,(1,1,.98,1))]):
 e=ramp.color_ramp.elements[j]if j<2 else ramp.color_ramp.elements.new(pos);e.position=pos;e.color=c
multiply=n.new('ShaderNodeMixRGB');multiply.blend_type='MULTIPLY';multiply.inputs[0].default_value=1;em=n.new('ShaderNodeEmission');links.new(diff.outputs[0],convert.inputs[0]);links.new(convert.outputs[0],ramp.inputs[0]);links.new(colour.outputs[0],multiply.inputs[1]);links.new(ramp.outputs[0],multiply.inputs[2]);links.new(multiply.outputs[0],em.inputs[0]);links.new(em.outputs[0],n['Material Output'].inputs['Surface']);face_mat['portability']='Native EEVEE lookdev only; separate PBR fallback required for GLB.'
for part in headparts:
 if part['material']in('M_Skin','M_Blush'):
  assign(part,face_mat)
  for pi in part['polys']:
   for li in m.polygons[pi].loop_indices:attribute.data[li].color=(*skincolour(m.vertices[m.loops[li].vertex_index].co),1)
 if part['material']=='M_Hair':
  assign(part,hair_mat)
  for pi in part['polys']:
   for li in m.polygons[pi].loop_indices:
    p=m.vertices[m.loops[li].vertex_index].co;t=.06*math.exp(-((p.z-1.40)/.065)**2)+.025*math.sin((p.x+.02)*25);base=rgb('#6B4330');attribute.data[li].color=tuple(x*(1+t)for x in base)+(1,)
# Eye whites and iris painting are applied to their original islands, not new floating eyes/lashes.
sclera=bpy.data.materials['M_Skin'].copy();sclera.name='Head only / warm ivory sclera';p=sclera.node_tree.nodes['Principled BSDF'];p.inputs['Base Color'].default_value=(*rgb('#F5EAD5'),1);p.inputs['Roughness'].default_value=.85;p.inputs['Specular IOR Level'].default_value=.05
iris_mat=bpy.data.materials['M_Iris'].copy();iris_mat.name='Head only / own brown iris paint';p=iris_mat.node_tree.nodes['Principled BSDF'];p.inputs['Roughness'].default_value=.85;p.inputs['Specular IOR Level'].default_value=.08;tex=iris_mat.node_tree.nodes.new('ShaderNodeTexImage');tex.image=bpy.data.images.load(str(A/'own-painted-iris.png'));tex.image.pack();iris_mat.node_tree.links.new(tex.outputs['Color'],p.inputs['Base Color'])
for part in headparts:
 if part['material']=='M_Eye'and len(part['ids'])==62:assign(part,sclera)
 if part['material']=='M_Eye'and len(part['ids'])==32:
  c=part['centre']
  for i in part['ids']:m.vertices[i].co.z=c.z+(m.vertices[i].co.z-c.z)*.65
 if part['material']=='M_Iris':
  assign(part,iris_mat);c=part['centre']
  for i in part['ids']:
   p=m.vertices[i].co;p.x=c.x+(p.x-c.x)*1.10;p.z=c.z+(p.z-c.z)*1.12;p.y-=.0010
  xs=[m.vertices[i].co.x for i in part['ids']];zs=[m.vertices[i].co.z for i in part['ids']]
  for pi in part['polys']:
   for li in m.polygons[pi].loop_indices:
    p=m.vertices[m.loops[li].vertex_index].co;m.uv_layers.active.data[li].uv=((p.x-min(xs))/(max(xs)-min(xs)),(p.z-min(zs))/(max(zs)-min(zs)))
# Controlled face-only normals. No effect on body vertices or materials.
group=o.vertex_groups.new(name='Head lookdev normals mask')
for i in face['ids']:
 p=m.vertices[i].co;weight=max(0,min(1,(-p.y-.035)/.07));group.add([i],weight,'REPLACE')
guide=bpy.data.objects.new('Head only normal guide',None);scene.collection.objects.link(guide);guide.location=(0,-2,1.28)
mod=o.modifiers.new('Head only soft normal control','NORMAL_EDIT');mod.mode='DIRECTIONAL';mod.target=guide;mod.mix_factor=.22;mod.vertex_group=group.name
m.update();body_after=body_fingerprint();assert body_before==body_after
body_eval_after=eval_body();body_position_delta=max((Vector(a)-Vector(b)).length for a,b in zip(body_eval_before['co'],body_eval_after['co']));body_normal_delta=max((Vector(a)-Vector(b)).length for a,b in zip(body_eval_before['normals'],body_eval_after['normals']));assert body_position_delta==0 and body_normal_delta<1e-6
control.hide_render=True;o.hide_render=False;scene.camera=cameras['three-quarter'];key.color=(1,1,1);fill.color=(1,1,1);bpy.context.preferences.filepaths.save_version=0;out=A/'rejected-head-geometry.blend';bpy.ops.wm.save_as_mainfile(filepath=str(out))
for view in ('front','three-quarter','profile','full'):render('after','neutral',view)
render('after','warm','three-quarter')
assert hashlib.sha256(src.read_bytes()).hexdigest()==before
report={'sourceOriginalSha256':before,'newNativeSha256':hashlib.sha256(out.read_bytes()).hexdigest(),'vertices':len(m.vertices),'triangles':sum(len(p.vertices)-2 for p in m.polygons),'existingBangCagesReshaped':7,'newFloatingHairSheetsAdded':0,'bodyUnchanged':{'rawGeometryWeightsMaterialUvFingerprint':body_before,'rawAfter':body_after,'evaluatedPositionDelta':body_position_delta,'evaluatedNormalDelta':body_normal_delta},'methods':['Direct original seven bang-cage sweep/width/tip edits and connected cap/side return adjustment','Original eye islands use ivory sclera and own iris UV painting; original glints retained, original lash islands thinned','Face-only own cheek loop colours, actual EEVEE coloured shadow bands and masked normal control'],'portability':'Native toon material not claimed as GLB/Unity. Export only after visual review, with explicit PBR fallback.','artAcceptance':'Unaccepted head candidate; inspect comparison, retain original if worse','scriptsFromUserArchiveExecuted':False,'guiInput':False,'renders':[{'file':p.name,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}for p in O.glob('*.png')]}
(A/'manifest.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf8',newline='\n');print('HEAD_REFINEMENT_RENDERED '+json.dumps(report))
