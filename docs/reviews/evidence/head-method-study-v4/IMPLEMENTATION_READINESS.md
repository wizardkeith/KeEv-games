# Installed implementation readiness — before researched lookdev test

Actual local probe: `implementation-readiness.json`, Blender **5.2.3 LTS** build
`e13b728c6880`. This is a factory-startup background profile, not an inventory of
the user's GUI-enabled third-party addons. No preferences or source files saved.

| Area | Verified now | Remaining gate / isolated next step |
| --- | --- | --- |
| Render engines | `CYCLES`, `BLENDER_EEVEE`, `BLENDER_WORKBENCH` are selectable. `BLENDER_EEVEE_NEXT` is not this installed version's ID. | EEVEE actual rendering/Shader-to-RGB compatibility still needs a minimal image test; selection is not render proof. |
| Current v3 | Cycles, AgX Medium High Contrast; character 80 meshes/24 curves; 20 Principled materials; zero Shader-to-RGB, Toon BSDF or ColorRamp nodes. | Existing look is plain PBR/Cycles, not a dedicated anime lighting graph. Preserve as control/rollback. |
| Failed head method | Cycles; 21 meshes/9 curves/10 NURBS surfaces; 13 Principled materials; one UV-driven base-colour ColorRamp; zero lighting-toon nodes. | Do not confuse the brown UV paint ramp with shadow/light quantization. Head identity/surface fitting failed. |
| Editable structures | Mesh controls, subdivision/thickness, native 7x7 surface controls, vertex colours and UVs exist. | Face/eyelid/iris landmarks, flattened tapered hair design and seams still need actual art-directed improvement. |
| Node types | Shader-to-RGB, Toon BSDF, ColorRamp and VertexColor types are registered. | Registration is not engine support/render acceptance. Use researched engine-appropriate nodes, actual matched images and controlled light response. |
| Bundled addons | Core folder includes `node_wrangler`, `rigify`, `io_scene_gltf2`, `cycles`, pose/IO modules. Batch profile enables glTF/Cycles/IO, not Node Wrangler or Rigify. | No addon needs installing for the first built-in-node test. GUI profile's third-party addon state remains unknown. |
| CUA | Runtime app inventory works; installed Blender launcher found. | App launch approval timed out. No actual stroke, paint or GUI save/delta proven; new research is not that approval. |
| Portability | Existing PBR GLBs reopen with verified geometry/colours; arbitrary custom lookdev graphs are not certified. | Keep Blender-only stylized graph separate from transferable mesh/UV/textures/normals. Verify GLB/Unity behaviour independently; no integration claim. |

Parent research identifies built-in Normal Edit, curve taper/tilt/flat profiles,
Texture Paint and EEVEE Shader-to-RGB as the first methods to test without
installing addons. An isolated head/shoulders scene can retain v3 geometry as a
control, use an independent material set, matched projection/normal viewing size,
and neutral/warm light comparisons. Do not make another full-character variant
or overwrite v3. First prove the renderer/node configuration actually works.

Official research supplied for that next test:

- Normal Edit: https://docs.blender.org/manual/en/5.0/modeling/modifiers/normals/normal_edit.html
- Curve geometry/taper/tilt: https://docs.blender.org/manual/en/dev/modeling/curves/properties/geometry.html
- EEVEE node support: https://docs.blender.org/manual/id/5.1/render/eevee/limitations/nodes_support.html

VRM/MToon are researched candidates only; no addon installed, no shape-matching
capability inferred, and no Unity pipeline or material conversion completed.
