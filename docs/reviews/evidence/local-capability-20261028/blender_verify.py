import bpy, json, pathlib, struct, sys
root = pathlib.Path(__file__).resolve().parent
mode = sys.argv[sys.argv.index('--') + 1]
if mode == 'blend':
    bpy.ops.wm.open_mainfile(filepath=str(root / 'smoke.blend'))
else:
    blob = (root / 'smoke.glb').read_bytes()
    magic, version, size = struct.unpack_from('<4sII', blob)
    assert magic == b'glTF' and version == 2 and size == len(blob)
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=str(root / 'smoke.glb'))
meshes = [o for o in bpy.context.scene.objects if o.type == 'MESH']
assert len(meshes) == 1
obj = meshes[0]
assert obj.name == 'SmokeTest_NotGameArt'
assert len(obj.data.vertices) >= 8
assert len(obj.data.polygons) in (6, 12)
assert len(obj.data.materials) == 1
assert all(abs(a - b) < 1e-5 for a, b in zip(obj.location, (0, 0, 1)))
report = {'mode': mode, 'blender': bpy.app.version_string, 'background': bpy.app.background, 'object': obj.name, 'vertices': len(obj.data.vertices), 'polygons': len(obj.data.polygons), 'materials': len(obj.data.materials), 'location': list(obj.location), 'passed': True}
(root / ('blender-verify-' + mode + '.json')).write_text(json.dumps(report, indent=2), encoding='utf-8')
print('SMOKE_VERIFY_OK ' + json.dumps(report))
