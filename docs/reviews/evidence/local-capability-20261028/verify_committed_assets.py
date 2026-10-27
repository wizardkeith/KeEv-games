import bpy, pathlib, json, sys, hashlib, struct
root = pathlib.Path(__file__).resolve().parent
repo = root.parent / 'KeEv-games-handoff'
source = repo / 'assets/authoring/misaki-grayform-v1/misaki-grayform.blend'
glb = repo / 'public/assets/misaki-grayform-v1/misaki-grayform.glb'
paths = [source, glb]
before = {str(p.relative_to(repo)): hashlib.sha256(p.read_bytes()).hexdigest() for p in paths}
bpy.ops.wm.open_mainfile(filepath=str(source))
mesh_objects = [o for o in bpy.context.scene.objects if o.type == 'MESH']
depsgraph = bpy.context.evaluated_depsgraph_get()
triangles = 0
for obj in mesh_objects:
    evaluated = obj.evaluated_get(depsgraph)
    mesh = evaluated.to_mesh()
    mesh.calc_loop_triangles()
    triangles += len(mesh.loop_triangles)
    evaluated.to_mesh_clear()
source_report = {'meshObjects': len(mesh_objects), 'curveObjects': len([o for o in bpy.context.scene.objects if o.type == 'CURVE']), 'evaluatedTriangles': triangles, 'materialSlots': len(bpy.data.materials)}
blob = glb.read_bytes()
magic, version, length = struct.unpack_from('<4sII', blob)
assert magic == b'glTF' and version == 2 and length == len(blob)
json_size, chunk_type = struct.unpack_from('<II', blob, 12)
assert chunk_type == 0x4E4F534A
gltf = json.loads(blob[20:20+json_size])
assert len(blob) == 902132
assert hashlib.sha256(blob).hexdigest() == '29f4ff9e8711f80cef1f5d899d9c5f0fab0facbf1841274678313581998bb823'
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(glb))
imported = [o for o in bpy.context.scene.objects if o.type == 'MESH']
assert imported
glb_report = {'bytes': len(blob), 'gltfMeshes': len(gltf.get('meshes', [])), 'gltfPrimitives': sum(len(m['primitives']) for m in gltf.get('meshes', [])), 'gltfMaterials': len(gltf.get('materials', [])), 'gltfImages': len(gltf.get('images', [])), 'gltfSkins': len(gltf.get('skins', [])), 'gltfAnimations': len(gltf.get('animations', [])), 'importedMeshObjects': len(imported), 'importedTriangles': sum(len(o.data.polygons) for o in imported)}
after = {str(p.relative_to(repo)): hashlib.sha256(p.read_bytes()).hexdigest() for p in paths}
assert before == after
report = {'blender': bpy.app.version_string, 'background': bpy.app.background, 'source': source_report, 'glb': glb_report, 'sha256': before, 'sourceFilesUnchanged': True, 'passed': True}
(root / 'committed-assets-verification.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
print('COMMITTED_ASSET_INTEGRITY_OK ' + json.dumps(report))
