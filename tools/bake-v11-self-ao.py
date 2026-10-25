"""Original per-rigid-part garment self-occlusion authoring experiment.

No pose, skin, lighting, inventory or screenshot is baked. Each fixed garment
assembly is isolated so a moving arm cannot leave a baked shadow on the torso.
Only scalar vertex values return; original source geometry remains authoritative.
"""
import bpy, json, os, math, hashlib
from pathlib import Path

root = Path(__file__).resolve().parents[1]
source = Path(os.environ.get('V11_SELF_AO_INPUT', str(root / 'assets/masters/native-v11/visitor-b-cloth-input.json')))
out = Path(os.environ.get('V11_SELF_AO_OUT', '/workspace/qa/v11-slice/self-ao78'))
out.mkdir(parents=True, exist_ok=True)
data = json.loads(source.read_text())
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.device = 'CPU'
scene.cycles.samples = 32
scene.render.threads_mode = 'FIXED'
scene.render.threads = 4
scene.render.bake.target = 'VERTEX_COLORS'
scene.view_settings.view_transform = 'Raw'
assemblies = {}
for key, record in data['surfaces'].items():
    assemblies.setdefault(key.split(':')[0], []).append((key, record))
result = {'version': 1, 'status': 'EXPERIMENTAL, not target acceptance',
          'method': 'Cycles32samples, AO shader distance0.16m/samples32/only_local; EMIT to linear corner colour, averaged per original vertex; each rigid part isolated',
          'inputSha256': hashlib.sha256(source.read_bytes()).hexdigest(), 'surfaces': {}}
stats = {}
for part, records in assemblies.items():
    positions, normals, faces, ranges = [], [], [], []
    for key, record in records:
        g = record['geometry']
        start = len(positions)
        positions.extend([g['positions'][i:i+3] for i in range(0, len(g['positions']), 3)])
        normals.extend([g['normals'][i:i+3] for i in range(0, len(g['normals']), 3)])
        faces.extend([[start+i for i in g['indices'][j:j+3]] for j in range(0, len(g['indices']), 3)])
        ranges.append((key, record, start, len(positions)))
    me = bpy.data.meshes.new(part + ' original garment assembly')
    me.from_pydata(positions, [], faces)
    me.update()
    for poly in me.polygons:
        poly.use_smooth = True
    me.normals_split_custom_set_from_vertices(normals)
    colour = me.color_attributes.new(name='Original linear self AO', type='FLOAT_COLOR', domain='CORNER')
    me.color_attributes.active_color = colour
    me.color_attributes.render_color_index = 0
    ob = bpy.data.objects.new(part, me)
    bpy.context.collection.objects.link(ob)
    mat = bpy.data.materials.new(part + ' bounded self AO')
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    nodes.clear()
    ao = nodes.new('ShaderNodeAmbientOcclusion')
    ao.only_local = True
    ao.samples = 32
    ao.inputs['Distance'].default_value = .16
    emission = nodes.new('ShaderNodeEmission')
    output = nodes.new('ShaderNodeOutputMaterial')
    mat.node_tree.links.new(ao.outputs['Color'], emission.inputs['Color'])
    mat.node_tree.links.new(emission.outputs[0], output.inputs['Surface'])
    me.materials.append(mat)
    bpy.ops.object.select_all(action='DESELECT')
    ob.select_set(True)
    bpy.context.view_layer.objects.active = ob
    bpy.ops.object.bake(type='EMIT')
    sums, counts = [0.] * len(positions), [0] * len(positions)
    for loop in me.loops:
        c = colour.data[loop.index].color
        value = max(0., min(1., (c[0] + c[1] + c[2]) / 3))
        sums[loop.vertex_index] += value
        counts[loop.vertex_index] += 1
    values = [round(s / n, 6) if n else 1. for s, n in zip(sums, counts)]
    for key, record, start, end in ranges:
        v = values[start:end]
        result['surfaces'][key] = {'signature': record['signature'], 'values': v}
        stats[key] = {'vertices': len(v), 'min': min(v), 'max': max(v), 'mean': sum(v)/len(v), 'belowPoint99': sum(a < .99 for a in v)}
    print('Baked actual isolated garment:', part, len(positions), flush=True)
(out / 'visitor-b-self-ao.json').write_text(json.dumps(result, separators=(',', ':')) + '\n')
(out / 'self-ao-provenance.json').write_text(json.dumps({'status': 'EXPERIMENTAL not adopted', 'source': 'tools/bake-v11-self-ao.py', 'inputSha256': result['inputSha256'], 'parts': len(assemblies), 'stats': stats, 'limits': 'Artist-directed diffuse self-shading approximation, not full GI or dynamic contact lighting. No geometry returned from Blender; Web/GLB geometry must retain original doubles.'}, indent=2) + '\n')
bpy.context.preferences.filepaths.save_version = 0
bpy.ops.wm.save_as_mainfile(filepath=str(out / 'visitor-b-self-ao.blend'))
print(json.dumps({'parts': len(assemblies), 'surfaces': len(stats), 'output': str(out), 'status': 'not gameplay or art acceptance'}), flush=True)
