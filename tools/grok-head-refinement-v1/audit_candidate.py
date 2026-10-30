"""Own read-only candidate audit. Never runs archive scripts or saves source."""
from pathlib import Path
from collections import Counter
import bpy,json,math,hashlib,struct
from mathutils import Vector
R=Path(__file__).resolve().parents[2];A=R/'assets/authoring/grok-head-refinement-v1/original';O=R/'docs/reviews/evidence/grok-head-refinement-v1/source-audit';O.mkdir(parents=True,exist_ok=True)
blend=A/'Misaki_trial.blend';glb=A/'Misaki_trial.glb';before={p.name:hashlib.sha256(p.read_bytes()).hexdigest()for p in(blend,glb)}
assert before['Misaki_trial.blend']=='d6ac7d03759a00a60fdab4232e980221e16165c9125afe765bd106d6974f09a0'
data=glb.read_bytes();assert data[:4]==b'glTF';j=json.loads(data[20:20+struct.unpack_from('<I',data,12)[0]])
uris=[x['uri']for k in('buffers','images')for x in j.get(k,[])if 'uri'in x];assert not uris,'External GLB resources blocked'
assert not bpy.context.preferences.filepaths.use_scripts_auto_execute
bpy.ops.wm.open_mainfile(filepath=str(blend),load_ui=False,use_scripts=False)
assert not bpy.context.preferences.filepaths.use_scripts_auto_execute
def stats():
 result=[]
 for o in bpy.data.objects:
  if o.type!='MESH':continue
  m=o.data;m.calc_loop_triangles();edgefaces=Counter()
  for p in m.polygons:
   for a,b in zip(p.vertices,list(p.vertices[1:])+[p.vertices[0]]):edgefaces[tuple(sorted((a,b)))]+=1
  adjacency=[[]for v in m.vertices]
  for e in m.edges:a,b=e.vertices;adjacency[a].append(b);adjacency[b].append(a)
  seen=set();components=[]
  for v in range(len(m.vertices)):
   if v in seen:continue
   stack=[v];seen.add(v);count=0
   while stack:
    q=stack.pop();count+=1
    for n in adjacency[q]:
     if n not in seen:seen.add(n);stack.append(n)
   components.append(count)
  uvinfo=[]
  for uv in m.uv_layers:
   tris=[];area=0
   for t in m.loop_triangles:
    pts=[tuple(uv.data[li].uv)for li in t.loops];area+=abs((pts[1][0]-pts[0][0])*(pts[2][1]-pts[0][1])-(pts[1][1]-pts[0][1])*(pts[2][0]-pts[0][0]))/2
    tris.append(tuple(sorted(tuple(round(c,6)for c in p)for p in pts)))
   counts=Counter(tris);uvinfo.append({'name':uv.name,'loopCount':len(uv.data),'summedTriangleUvArea':area,'exactDuplicateUvTriangles':sum(n-1 for n in counts.values()if n>1),'note':'Overlapping primitive UVs can be harmless for flat materials, unsuitable as a unique bake atlas.'})
  influences=Counter();unweighted=0;nonunit=0;groupTotals=Counter()
  for v in m.vertices:
   weights=[g for g in v.groups if g.weight>1e-6];influences[len(weights)]+=1
   if not weights:unweighted+=1
   if weights and abs(sum(g.weight for g in weights)-1)>1e-4:nonunit+=1
   for g in weights:groupTotals[o.vertex_groups[g.group].name]+=1
  coords=[o.matrix_world@v.co for v in m.vertices];mins=[min(v[k]for v in coords)for k in range(3)];maxs=[max(v[k]for v in coords)for k in range(3)]
  materials=[]
  for mat in m.materials:
   p=mat.node_tree.nodes.get('Principled BSDF')if mat.use_nodes else None
   materials.append({'name':mat.name,'baseColour':list(p.inputs['Base Color'].default_value)if p else list(mat.diffuse_color),'nodes':[n.bl_idname for n in mat.node_tree.nodes]if mat.use_nodes else[]})
  result.append({'name':o.name,'vertices':len(m.vertices),'polygons':len(m.polygons),'triangles':len(m.loop_triangles),'disconnectedComponents':len(components),'componentVertexCounts':sorted(components,reverse=True),'boundaryEdges':sum(n==1 for n in edgefaces.values()),'edgesWithMoreThanTwoFaces':sum(n>2 for n in edgefaces.values()),'zeroFaceEdges':sum(tuple(sorted(e.vertices))not in edgefaces for e in m.edges),'uvLayers':uvinfo,'shapeKeys':len(m.shape_keys.key_blocks)if m.shape_keys else 0,'materials':materials,'modifiers':[{'type':mod.type,'target':mod.object.name if mod.type=='ARMATURE'and mod.object else None}for mod in o.modifiers],'vertexGroups':dict(groupTotals),'influencesPerVertex':dict(influences),'unweightedVertices':unweighted,'nonUnitWeights':nonunit,'boundsMin':mins,'boundsMax':maxs,'dimensions':[b-a for a,b in zip(mins,maxs)]})
 return result
native=stats();arms=[o for o in bpy.data.objects if o.type=='ARMATURE'];external={'libraries':[x.filepath for x in bpy.data.libraries],'images':[{'name':x.name,'path':x.filepath}for x in bpy.data.images if x.type!='RENDER_RESULT'],'fonts':[x.filepath for x in bpy.data.fonts if x.filepath and not x.filepath.startswith('<')],'sounds':[x.filepath for x in bpy.data.sounds]}
assert not any(external.values()),'Unexpected external resource datablocks; stop before render'
rigs=[{'name':o.name,'bones':[{'name':b.name,'parent':b.parent.name if b.parent else None,'deform':b.use_deform}for b in o.data.bones]}for o in arms]
drivers=[{'id':x.name,'count':len(x.animation_data.drivers)}for x in list(bpy.data.objects)+list(bpy.data.materials)if x.animation_data and x.animation_data.drivers]
assert not drivers,'Unexpected expression drivers; stop before evaluation'
report={'blender':bpy.app.version_string,'autoExecDisabled':not bpy.context.preferences.filepaths.use_scripts_auto_execute,'onlineAccess':bpy.app.online_access,'sourceBefore':before,'objects':[{'name':o.name,'type':o.type}for o in bpy.data.objects],'nativeMeshes':native,'rigs':rigs,'actionCount':len(bpy.data.actions),'textBlocks':[t.name for t in bpy.data.texts],'drivers':drivers,'externalResourceDatablocks':external,'glbExternalUris':uris,'bundledScriptsExecuted':False,'poseProbe':[],'originalsSavedOver':False}
# In-memory bone response only. Not a walk/cloth/animation acceptance test.
mesh=next(o for o in bpy.data.objects if o.type=='MESH');arm=arms[0]if arms else None
def evaluatedCoords():
 bpy.context.view_layer.update();e=mesh.evaluated_get(bpy.context.evaluated_depsgraph_get());m=e.to_mesh();v=[p.co.copy()for p in m.vertices];e.to_mesh_clear();return v
if arm:
 for name in('lowerarm.L','lowerleg.L'):
  bone=arm.pose.bones.get(name)
  if not bone:continue
  original=bone.matrix_basis.copy();base=evaluatedCoords();bone.rotation_mode='XYZ';bone.rotation_euler.x+=math.radians(30);changed=evaluatedCoords();distances=[(a-b).length for a,b in zip(base,changed)];bone.matrix_basis=original;bpy.context.view_layer.update();report['poseProbe'].append({'bone':name,'localXDeltaDegrees':30,'movedVertices':sum(d>1e-5 for d in distances),'maxLocalVertexDelta':max(distances),'scope':'In-memory response only; pose restored, no file saved.'})
(O/'local-native-audit.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf8',newline='\n')
# Two bounded proof images; cloud owns exhaustive matched comparisons.
scene=bpy.context.scene
for o in list(bpy.data.objects):
 if o.type in('CAMERA','LIGHT'):bpy.data.objects.remove(o,do_unlink=True)
def area(name,co,power,size):
 d=bpy.data.lights.new(name,'AREA');d.energy=power;d.size=size;o=bpy.data.objects.new(name,d);scene.collection.objects.link(o);o.location=co;o.rotation_euler=(Vector((0,0,.8))-o.location).to_track_quat('-Z','Y').to_euler()
area('Audit key',(-3,-4,5),400,4);area('Audit fill',(3,-2,3),160,4)
w=bpy.data.worlds.new('Audit neutral world');w.use_nodes=True;w.node_tree.nodes['Background'].inputs[0].default_value=(.55,.55,.55,1);w.node_tree.nodes['Background'].inputs[1].default_value=.45;scene.world=w
d=bpy.data.cameras.new('Audit camera');d.type='ORTHO';d.ortho_scale=1.72;cam=bpy.data.objects.new('Audit camera',d);scene.collection.objects.link(cam);scene.camera=cam
scene.render.engine='BLENDER_EEVEE';scene.view_settings.view_transform='Standard';scene.view_settings.look='None';scene.view_settings.exposure=0;scene.render.resolution_x=720;scene.render.resolution_y=720;scene.render.resolution_percentage=100;scene.render.image_settings.file_format='PNG';scene.render.use_stamp=True;scene.render.use_stamp_note=True;scene.render.use_stamp_labels=False;scene.render.stamp_font_size=12
for prop in ['use_stamp_date','use_stamp_time','use_stamp_render_time','use_stamp_frame','use_stamp_frame_range','use_stamp_scene','use_stamp_camera','use_stamp_lens','use_stamp_filename','use_stamp_marker','use_stamp_memory','use_stamp_hostname']:
 if hasattr(scene.render,prop):setattr(scene.render,prop,False)
def render(name,location,label):
 cam.location=location;cam.rotation_euler=(Vector((0,0,.75))-cam.location).to_track_quat('-Z','Y').to_euler();scene.render.stamp_note_text='LOCAL REOPEN PROOF / '+label+' / unaccepted trial, not game screenshot';scene.render.filepath=str(O/name);bpy.ops.render.render(write_still=True)
render('local-candidate-front.png',(0,-5,.85),'original materials / front')
clay=bpy.data.materials.new('Neutral untextured audit clay');clay.use_nodes=True;p=clay.node_tree.nodes['Principled BSDF'];p.inputs['Base Color'].default_value=(.45,.45,.45,1);p.inputs['Roughness'].default_value=.85
bpy.context.view_layer.material_override=clay;render('local-candidate-clay-three-quarter.png',(3,-5,1.0),'untextured geometry / three-quarter');bpy.context.view_layer.material_override=None
bpy.ops.wm.read_factory_settings(use_empty=True);bpy.ops.import_scene.gltf(filepath=str(glb));report['importedGlbMeshes']=stats();report['importedGlbBoneCounts']=[len(o.data.bones)for o in bpy.data.objects if o.type=='ARMATURE'];report['sourceUnchanged']={p.name:hashlib.sha256(p.read_bytes()).hexdigest()==before[p.name]for p in(blend,glb)};assert all(report['sourceUnchanged'].values())
report['renders']=[{'file':p.name,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}for p in O.glob('*.png')];report['judgment']='Local reopen/import/structure checks only; art remains unaccepted, cloud owns matched target/v3/v5 comparison.'
(O/'local-native-audit.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf8',newline='\n');print('LOCAL_CANDIDATE_REOPEN_AND_GLB_IMPORT_PASS '+json.dumps({'meshes':[(x['vertices'],x['triangles'],len(x['materials']))for x in native],'bones':[len(x['bones'])for x in rigs],'sourceUnchanged':report['sourceUnchanged'],'poseProbe':report['poseProbe']}))
