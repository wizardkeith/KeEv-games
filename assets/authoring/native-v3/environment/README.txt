Native v3 environment source and interchange contract

Rebuild from repository root:
  node --import tsx tools/export-native-environment.ts

Master: assets/masters/native-v3/environment-v3.json
This engine-neutral JSON preserves the complete recipes, material roles, local pivots and source hashes used by the actual Web scene. The standard geometry builder produces actual indexed meshes with normals; the material adapter converts authored sRGB colours to linear PBR factors. It is not glTF and does not contain skeletal clips, texture atlases or UVs.

Metres; right handed; Y-up. Door root at [2.34,0.08,3.20], negative local Y rotation opens into exterior +Z. The back wall and skirting are split around the aperture, not hidden behind glass. Door sign is a separate child at contract.signPivot. Route controller must fully open the door before crossing and keep it open until travelers clear the sweep.

Plant base contains pot, soil and fixed stem. Every leaf attachment pivot is plant-local, its recipe is attachment-local. Apply restrained relative rotation to leaf nodes only. Exterior geometry is a small stationary window vignette and does not create gameplay terrain.

Counter and display recipes keep existing footprints and surfaces while adding visible construction details. Product IDs, selection targets and authoritative inventory stay in the world/economic adapters.

No generated external images, paid assets or video dependencies were used. These original recipes were authored in this update. Source/geometry validation is not actual 3D visual acceptance or device performance evidence.
