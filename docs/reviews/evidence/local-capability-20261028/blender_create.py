import bpy, json, pathlib, sys
root = pathlib.Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.mesh.primitive_cube_add(size=2, location=(0, 0, 1))
obj = bpy.context.object
obj.name = 'SmokeTest_NotGameArt'
obj['purpose'] = 'Disposable environment test; not game art'
mat = bpy.data.materials.new('SmokeTestMaterial')
mat.diffuse_color = (0.1, 0.5, 0.8, 1)
obj.data.materials.append(mat)
bpy.ops.wm.save_as_mainfile(filepath=str(root / 'smoke.blend'))
bpy.ops.export_scene.gltf(filepath=str(root / 'smoke.glb'), export_format='GLB', use_selection=True)
report = {'blender': bpy.app.version_string, 'python': sys.version, 'background': bpy.app.background, 'object': obj.name, 'vertices': len(obj.data.vertices), 'polygons': len(obj.data.polygons), 'files': {p.name: p.stat().st_size for p in [root / 'smoke.blend', root / 'smoke.glb']}}
(root / 'blender-create.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
print('SMOKE_CREATE_OK ' + json.dumps(report))
