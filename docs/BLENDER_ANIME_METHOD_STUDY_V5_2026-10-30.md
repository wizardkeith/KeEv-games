# Blender built-in anime method study v5

**Result: technical methods execute; target-style art still FAIL and not adopted.** This is an isolated head/shoulders study. No further parameter variants should run while the user's proposed AI base-mesh route is assessed.

- [Target / v3 / researched candidate, neutral and warm lighting](reviews/evidence/anime-lookdev-v5/anime-method-reference-comparison.png)
- [Actual front / three-quarter / profile comparisons](reviews/evidence/anime-lookdev-v5/anime-method-view-comparison.png)
- [Actual EEVEE compatibility probe](reviews/evidence/anime-lookdev-v5/eevee-toon-compatibility.png)
- [Editable native source and method limits](../assets/authoring/anime-lookdev-v5/README.md)
- [Fresh-process reopen evidence](reviews/evidence/anime-lookdev-v5/fresh-reopen-verification.json)

Applied the parent-supplied primary-source research using existing built-in features: flattened custom-profile Bezier curves with taper/radius/tilt, own UV albedo/iris maps, directional Normal Edit on cheeks, and EEVEE Shader to RGB with three softly transitioned colour bands. These are actual rendered methods, not a PBR scene renamed anime. The custom normal modifier changes 13,204 of 32,704 evaluated corner normals; packed UV images and editable ten-curve controls survive reopening. Shader graphs are native Blender lookdev; arbitrary toon-node export to GLB or Unity is not established.

The actual pixels still fail: sparse hanging hair ribbons and awkward root joins, broad forehead, broken/undulating eyelids and toy-like expression remain far from the target's coherent fluffy bob and warm face. The UV/normal/shader method does not solve these construction/design errors automatically. The first construction and one bounded correction are preserved; no more minor parameter cycling is justified. Native v3 remains byte-identical, game/public Site/player saves unchanged.

Commands actually executed from this checkout with installed Blender 5.2.3 and bundled Python:

```text
blender --background --factory-startup --python-exit-code 1 --python tools/anime-lookdev-v5/engine_probe.py
python tools/anime-lookdev-v5/paint_maps.py
blender --background --factory-startup --python-exit-code 1 --python tools/anime-lookdev-v5/build_lookdev.py
blender --background --factory-startup --python-exit-code 1 --python tools/anime-lookdev-v5/verify_native.py
python tools/anime-lookdev-v5/make_review.py
blender --background --factory-startup --python-exit-code 1 --python tools/anime-lookdev-v5/inspect_native.py
```

The initial build stopped on an assumed RGB node name; the script now names that node explicitly and the corrected run succeeds. Reopen/render succeeds; RGB8 mean error is under 0.0075/channel and maximum 7, not exact equality. Optional thumbnail/cache writes emitted errors in Blender, but the actual `.blend` and all renders were written and reopened. No system setting was changed to suppress those errors. No game source changed, so historic Web tests are not reported as newly run for this isolated asset study.

The previously requested CUA Blender launcher operation timed out on app approval. This turn did not retry it, circumvent the gate or touch GUI input. No sculpt/paint brush operation has been proven. A future bounded GUI test would require completing that local app-access approval, and would demonstrate input/save ability only.

The distinct Library comparison item preserves this failed method separately from the v3 preview. Local metadata-helper application fails because this Windows Python has no `os.setxattr`; the Library upload succeeds and its opaque identity is retained privately. Normal branch push/readback is reported externally; no PR, merge or public deployment.

Sources supplied by the parent research:

- [Blender Normal Edit](https://docs.blender.org/manual/en/5.0/modeling/modifiers/normals/normal_edit.html)
- [Curve taper, tilt and custom profile](https://docs.blender.org/manual/en/dev/modeling/curves/properties/geometry.html)
- [EEVEE node support and limitations](https://docs.blender.org/manual/id/5.1/render/eevee/limitations/nodes_support.html)

The user now proposes Meshy/Tripo base meshes. Import operator readiness is recorded separately; no provider upload, purchase, addon installation or generated-mesh quality claim occurred. Parent is reviewing provider capabilities/licensing/privacy before any such action. Preserve the current work and await that route decision.
