Native v3.1 environment source and interchange contract

Rebuild from repository root:
  node --import tsx tools/export-native-environment.ts

Master: assets/masters/native-v3/environment-v3.json
This engine-neutral JSON preserves the complete recipes, material roles, local pivots and source hashes used by the actual Web scene. The standard geometry builder produces actual indexed meshes with normals; the material adapter converts authored sRGB colours to linear PBR factors. This JSON is not glTF and has no skeletal clips. It retains the procedural surface/probe contracts; nativeSurfaceGeometry derives metre UVs and the separate fixture GLBs embed the original surface maps.

Metres; right handed; Y-up. Door root at [2.34,0.08,3.20], negative local Y rotation opens into exterior +Z. The back wall and skirting are split around the aperture, not hidden behind glass. Door sign is a separate child at contract.signPivot. Route controller must fully open the door before crossing and keep it open until travelers clear the sweep.

Plant base contains pot, soil and fixed stem. Every leaf attachment pivot is plant-local, its recipe is attachment-local. Apply restrained relative rotation to leaf nodes only. Exterior geometry is a small stationary window vignette and does not create gameplay terrain.

Counter and display recipes keep existing footprints and surfaces while adding visible construction details. Native-only matte floor roughness .83, counter top .57, display top .64 and wall shelf .76 are preserved per surface; they do not mutate shared historical material definitions. Product IDs, selection targets and authoritative inventory stay in the world/economic adapters.

Camera/light intent is exported in master.presentation and authored in native-view.ts. The shop fit protects every critical shelf, counter, doorway/visitor foot/head and service-bay envelope over the curated yaw/elevation range inside the actual UI-safe viewport. Decorative outer plinth/upper-wall bounds do not force excess blank margins. Staff view is intentionally focused. Preserve user-selected zoom when resizing/repainting. Restricted face fill targets face skin/ink meshes only; exposure remains1 and no bloom is added. The candidate has been verified by geometry and Babylon projection matrices, not rendered WebGL. Low gables/ridges/window bays replace the previous tall raw exterior boxes.

No generated external images, paid assets or video dependencies were used. These original recipes were authored in this update. Source/geometry validation is not actual 3D visual acceptance or device performance evidence.
