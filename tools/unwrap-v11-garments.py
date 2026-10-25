"""Reusable real garment UV master. Geometry/normals come back from the exact
source input, never Blender's float32 mesh. Only loop UV seams are exported.
Smart projection is area-scaled to metres, with vertical island alignment.
"""
import bpy,json,math
from pathlib import Path
root=Path(__file__).resolve().parents[1];folder=root/'assets/masters/native-v11';data=json.loads((folder/'visitor-b-cloth-input.json').read_text());bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False);result={'version':1,'method':'Blender smart projection, vertical aligned, area-scaled metre UV; original geometry retained','surfaces':{}};stats={}
for key,record in data['surfaces'].items():
 g=record['geometry'];positions=[g['positions'][i:i+3]for i in range(0,len(g['positions']),3)];faces=[g['indices'][i:i+3]for i in range(0,len(g['indices']),3)];me=bpy.data.meshes.new(key);me.from_pydata(positions,[],faces);me.update();ob=bpy.data.objects.new(key,me);bpy.context.collection.objects.link(ob);bpy.context.view_layer.objects.active=ob;ob.select_set(True);bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.uv.smart_project(angle_limit=math.radians(60),rotate_method='AXIS_ALIGNED_Y',island_margin=.012,area_weight=0,correct_aspect=True,scale_to_bounds=False);bpy.ops.object.mode_set(mode='OBJECT');ob.select_set(False)
 layer=me.uv_layers.active;area3=0;area2=0
 for p in me.polygons:
  a,b,c=[positions[i]for i in p.vertices];u=[b[k]-a[k]for k in range(3)];v=[c[k]-a[k]for k in range(3)];area3+=math.sqrt((u[1]*v[2]-u[2]*v[1])**2+(u[2]*v[0]-u[0]*v[2])**2+(u[0]*v[1]-u[1]*v[0])**2)/2
  a,b,c=[layer.data[i].uv for i in p.loop_indices];area2+=abs((b.x-a.x)*(c.y-a.y)-(c.x-a.x)*(b.y-a.y))/2
 scale=math.sqrt(area3/area2);lookup={};vertices=[];uvs=[];indices=[]
 for p in me.polygons:
  for li in p.loop_indices:
   vi=me.loops[li].vertex_index;u,v=layer.data[li].uv;uv=(float(u)*scale,-float(v)*scale);k=(vi,round(uv[0],9),round(uv[1],9))
   if k not in lookup:lookup[k]=len(vertices);vertices.append(vi);uvs.extend(uv)
   indices.append(lookup[k]);layer.data[li].uv=uv
 # Align each continuous island's warp with local garment Y. Packing may
 # rotate islands arbitrarily; tiled cloth does not require non-overlap.
 parent=list(range(len(vertices)))
 def find(n):
  while parent[n]!=n:parent[n]=parent[parent[n]];n=parent[n]
  return n
 for k in range(0,len(indices),3):
  ids=indices[k:k+3]
  for n in ids[1:]:parent[find(n)]=find(ids[0])
 groups={}
 for n in range(len(vertices)):groups.setdefault(find(n),[]).append(n)
 sums={k:[0.,0.]for k in groups}
 for k in range(0,len(indices),3):
  ids=indices[k:k+3];r=find(ids[0])
  for j in range(3):
   a,b=ids[j],ids[(j+1)%3];dy=positions[vertices[b]][1]-positions[vertices[a]][1];sums[r][0]+=(uvs[b*2]-uvs[a*2])*dy;sums[r][1]+=(uvs[b*2+1]-uvs[a*2+1])*dy
 rotations=[]
 for r,ids in groups.items():
  su,sv=sums[r];angle=-math.atan2(su,-sv) if math.hypot(su,sv)>1e-10 else 0;co=math.cos(angle);si=math.sin(angle);cx=sum(uvs[n*2]for n in ids)/len(ids);cy=sum(uvs[n*2+1]for n in ids)/len(ids)
  for n in ids:
   u,v=uvs[n*2]-cx,uvs[n*2+1]-cy;uvs[n*2]=cx+u*co-v*si;uvs[n*2+1]=cy+u*si+v*co
  rotations.append({'vertices':len(ids),'rotationDegrees':angle*180/math.pi})
 cursor=0
 for p in me.polygons:
  for li in p.loop_indices:n=indices[cursor];layer.data[li].uv=(uvs[n*2],uvs[n*2+1]);cursor+=1
 ob['finish']=record['finish'];ob['metre_uv_area_scale']=scale;ob['original_geometry_signature']=record['signature'];result['surfaces'][key]={'signature':record['signature'],'vertices':vertices,'indices':indices,'uvs':uvs};stats[key]={'surfaceAreaM2':area3,'uvAreaM2':area2*scale*scale,'scale':scale,'vertices':len(vertices),'warpAlignment':rotations}
bpy.context.preferences.filepaths.save_version=0;bpy.ops.wm.save_as_mainfile(filepath=str(folder/'visitor-b-cloth-uv.blend'));(folder/'visitor-b-cloth-uv.json').write_text(json.dumps(result,separators=(',',':'))+'\n');(root/'assets/authoring/native-v11/garment-uv-provenance.json').write_text(json.dumps({'input':'assets/masters/native-v11/visitor-b-cloth-input.json','source':'tools/unwrap-v11-garments.py','units':'UV area in square metres; vertical aligned islands; source-space Y up','stats':stats},indent=2)+'\n');print(json.dumps({'surfaces':len(stats),'preserved':'original source indices/vertices/normals; UV corner splits only'}))
