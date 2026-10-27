"""Original garment-rest authoring experiment; never a runtime cloth system.

Start from the real C11 coat shell, author controlled slack and pin the accepted
neck/shoulder region, simulate its resting drape, then project the same bounded
low-poly topology. Original input, modifiers and applied high-detail rest mesh
remain editable in the saved Blender master. No actor pose/save is involved.
"""
import bpy, json, os, math, hashlib
from pathlib import Path
from mathutils import Vector
from mathutils.bvhtree import BVHTree

root = Path(__file__).resolve().parents[1]
source = Path(os.environ.get('V11_COAT_INPUT', str(root / 'assets/masters/native-v11/coat-rest-input.json')))
out = Path(os.environ.get('V11_COAT_OUT', str(root / 'assets/masters/native-v11/coat-rest')))
out.mkdir(parents=True, exist_ok=True)
data = json.loads(source.read_text())
g = data['surfaces']['body:0']['geometry']
original = [g['positions'][i:i+3] for i in range(0, len(g['positions']), 3)]
segments = 24
side_count = len(original) - 2 * (segments + 1)
assert side_count % segments == 0
rings = side_count // segments
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

def mesh(name, positions, faces):
    me = bpy.data.meshes.new(name)
    me.from_pydata(positions, [], faces)
    me.update()
    ob = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(ob)
    for p in me.polygons:
        p.use_smooth = True
    return ob

seed = []
for x, y, z in original[:side_count]:
    slack = max(0., min(1., (.99-y)/.25))
    radius = math.hypot(x, z) or 1.
    offset = .002 * math.sin(y*37 + math.atan2(z, x)*3) * slack
    seed.append([x*(1+.045*slack)+x/radius*offset, y, z*(1+.045*slack)+z/radius*offset])
quads = []
for r in range(rings-1):
    for j in range(segments):
        a = r*segments+j
        b = r*segments+(j+1)%segments
        quads.append([a, a+segments, b+segments, b])
cloth_ob = mesh('Coat authoring shell with controlled slack', seed, quads)
bpy.context.view_layer.objects.active = cloth_ob
cloth_ob.select_set(True)
sub = cloth_ob.modifiers.new('High-detail cloth authoring subdivision', 'SUBSURF')
sub.levels = 2
sub.render_levels = 2
bpy.ops.object.modifier_apply(modifier=sub.name)
pins = cloth_ob.vertex_groups.new(name='Accepted shoulders and gathered waist seam')
basis = cloth_ob.shape_key_add(name='Original slack rest')
waist_key = cloth_ob.shape_key_add(name='Tailored lower seam tension')
for i, v in enumerate(cloth_ob.data.vertices):
    hem = max(0., min(1., (.805-v.co.y)/.065))
    waist_key.data[i].co.x *= 1-.10*hem
    waist_key.data[i].co.z *= 1-.10*hem
waist_key.value = 0
waist_key.keyframe_insert(data_path='value', frame=1)
waist_key.value = 1
waist_key.keyframe_insert(data_path='value', frame=38)
for v in cloth_ob.data.vertices:
    weight = max(max(0., min(1., (v.co.y-.985)/.045)), max(0., min(1., (.805-v.co.y)/.065)))
    if weight:
        pins.add([v.index], weight, 'REPLACE')

collider_vertices = []
for x, y, z in original:
    r = math.hypot(x, z)
    inset = .004+.012*max(0., min(1., (.97-y)/.18))
    k = max(0., 1-inset/r) if r else 1.
    collider_vertices.append([x*k, y, z*k])
collider = mesh('Invisible authoring-body collision support', collider_vertices,
                [g['indices'][i:i+3] for i in range(0, len(g['indices']), 3)])
collider.modifiers.new('Garment authoring collision', 'COLLISION')
collider.collision.thickness_outer = .003
collider.hide_render = True
mod = cloth_ob.modifiers.new('Rest drape cloth authoring', 'CLOTH')
settings = mod.settings
settings.quality = 8
settings.mass = .25
settings.tension_stiffness = 18
settings.compression_stiffness = 18
settings.shear_stiffness = 12
settings.bending_stiffness = .6
settings.air_damping = 3
settings.vertex_group_mass = pins.name
settings.pin_stiffness = 1
settings.effector_weights.gravity = .4
mod.collision_settings.use_collision = True
mod.collision_settings.distance_min = .003
mod.collision_settings.use_self_collision = True
mod.collision_settings.self_distance_min = .004
mod.point_cache.frame_start = 1
mod.point_cache.frame_end = 80
scene = bpy.context.scene
scene.frame_start = 1
scene.frame_end = 80
scene.render.fps = 24
for frame in range(1, 81):
    scene.frame_set(frame)
    bpy.context.view_layer.update()
    evaluated = cloth_ob.evaluated_get(bpy.context.evaluated_depsgraph_get())
    _ = len(evaluated.data.vertices)
    if frame % 10 == 0:
        print('Authored rest drape frame', frame, flush=True)

depsgraph = bpy.context.evaluated_depsgraph_get()
evaluated = cloth_ob.evaluated_get(depsgraph)
rest_mesh = bpy.data.meshes.new_from_object(evaluated)
# Broad reference-directed sculpt cleanup after rest simulation, not fibre
# noise. Tension runs from the underarms toward the lower seam; shoulder pins
# and seam boundaries remain untouched.
def smooth(v):
    t=max(0.,min(1.,v));return t*t*(3-2*t)
def ridge(d,w):
    q=d/w;return (1-q*q)*math.exp(-q*q*.5)
for v in rest_mesh.vertices:
    x,y,z=v.co
    mask=smooth((y-.755)/.075)*smooth((.99-y)/.055)
    primary=(.018*ridge(y-(.80+.60*abs(x)),.038)+.010*ridge(y-(.905-.25*x),.045)) if z>0 else .014*ridge(y-(.815+.60*abs(x)),.040)
    radius=math.hypot(x,z)
    if radius:
        v.co.x+=x/radius*primary*mask
        v.co.z+=z/radius*primary*mask
rest_mesh.update()
rest = bpy.data.objects.new('Applied high-detail coat rest sculpt', rest_mesh)
bpy.context.collection.objects.link(rest)
cloth_ob.hide_render = True
tree = BVHTree.FromPolygons([v.co for v in rest_mesh.vertices], [list(p.vertices) for p in rest_mesh.polygons], all_triangles=False)
projected, moves, clamped = [], [], 0
ray_hits, nearest_boundary = 0, 0
for point in original[:side_count]:
    v = Vector(point)
    if point[1] >= .99:
        projected.append(list(point))
        continue
    # The same bounded topology must follow the primary V fold. Uniform
    # horizontal loops undersample its crest, even with a good high-detail rest.
    # Move only the three lower internal loops; accepted shoulder/seam controls
    # and topology stay fixed. Front/back lines join continuously at the sides.
    x,y,z=point
    front=max(0.,min(1.,(.04-z)/.08))
    if abs(y-.79)<1e-8: v.y=.755+.60*abs(x)+front*.015
    elif abs(y-.84)<1e-8: v.y=.80+.60*abs(x)+front*.015
    elif abs(y-.905)<1e-8: v.y=.845+.50*abs(x)+front*.015
    radial=Vector((v.x,0,v.z)).normalized()
    hit=tree.ray_cast(v+radial*.10,-radial,.20)
    if hit[0] is None:
        hit=tree.find_nearest(v)
        nearest_boundary+=1
    else:
        ray_hits+=1
    if hit[0] is None:
        raise RuntimeError('retopology projection missed the real rest sculpt')
    delta = hit[0] - Vector(point)
    if delta.length > .075:
        delta *= .075/delta.length
        clamped += 1
    moves.append(delta.length)
    projected.append(list(Vector(point)+delta))
# Retain exactly the original closed-cap topology; do not project a cap centre
# onto the outside shell. Duplicated cap rims follow their corresponding rings.
for ring in [0, rings-1]:
    loop = projected[ring*segments:(ring+1)*segments]
    projected.extend([list(v) for v in loop])
    projected.append(list(original[-1]) if ring == rings-1 else [sum(v[k] for v in loop)/segments for k in range(3)])
assert len(projected) == len(original)
runtime = mesh('Bounded original-topology rest retopology', projected,
               [g['indices'][i:i+3] for i in range(0, len(g['indices']), 3)])
runtime.hide_render = True
payload = {'status': 'Draft playable rest shape; target visual gate remains open',
           'source': 'tools/build-v11-coat-cloth.py',
           'inputSha256': hashlib.sha256(source.read_bytes()).hexdigest(),
           'sourceSignature': data['surfaces']['body:0']['signature'],
           'positions': [c for v in projected for c in v], 'indices': g['indices'],
           'stats': {'vertices': len(projected), 'runtimeTriangles': len(g['indices'])//3,
                     'highDetailVertices': len(rest_mesh.vertices), 'highDetailPolygons': len(rest_mesh.polygons),
                     'maxProjectionMetres': max(moves), 'meanProjectionMetres': sum(moves)/len(moves),
                     'clampedVertices': clamped, 'radialProjectionHits': ray_hits, 'nearestBoundaryFallbacks': nearest_boundary, 'pinRegionUnchangedAboveY': .99,
                     'bounds': {'min': [min(v[k] for v in projected) for k in range(3)],
                                'max': [max(v[k] for v in projected) for k in range(3)]}},
           'parameters': {'subdivision': 2, 'frames': 80, 'fps': 24, 'gravityWeight': .4,
                          'radialSlack': .045, 'tensionCompression': 18, 'shear': 12,
                          'bend': .6, 'collisionMetres': .003, 'selfCollisionMetres': .004, 'authoringBodyInsetMetres': [.004,.016], 'lowerSeamTension': .10, 'primarySculptMetres': [.018,.010,.014], 'retopology': 'same 24x15 topology; three lower loops follow primary V crease instead of horizontal undersampling'},
           'limits': 'Offline artist-directed resting-cloth construction, not runtime physics or dynamic garment acceptance. High-detail rest retained; gameplay render and fitted-layer/limb tests required before adoption.'}
(out/'coat-rest-retopo.json').write_text(json.dumps(payload, separators=(',', ':'))+'\n')
cloth_ob.hide_set(True)
collider.hide_set(True)
runtime.hide_set(True)
scene['scope'] = payload['limits']
bpy.context.preferences.filepaths.save_version = 0
bpy.ops.wm.save_as_mainfile(filepath=str(out/'coat-rest-authoring.blend'))
print(json.dumps(payload['stats']), flush=True)
