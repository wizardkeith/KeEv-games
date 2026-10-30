# Misaki – Procedural Low-Poly TRIAL (blockout / placeholder)
Game: 下一站・小店物語 (Web 3D) · Built 2026-10-30 with Blender 4.2.3 LTS (headless, Python script only)

## What this is
A **procedurally generated** stylised low-poly blockout of Misaki, made entirely by script
(`scripts/build_misaki.py`) without hand sculpting or viewport editing. It is a **trial to judge quality**,
suitable as a **blockout / in-engine placeholder / proportion & colour reference**. It is **not** final character art.

## Files
- `Misaki_trial.blend` – scene with mesh `Misaki` + armature `Misaki_Rig` (Armature modifier)
- `Misaki_trial.glb` – glTF binary, skinned mesh + armature, +Y up (glTF default)
- `render_front.png`, `render_34.png`, `render_side.png`, `render_back.png` – 1024² Cycles previews (orthographic)
- `render_posetest.png` – quick pose test proving skinning deforms (head tilt, arm, leg bend)
- `misaki_trial_sheet.png` – contact sheet
- `scripts/` – build_misaki.py (model + rig + export), render_misaki.py, compose.py, validate.py

## Stats
- ~8.6k triangles, ~4.5k verts, 1 mesh, 17 flat materials (no textures / no UV painting)
- Size 0.73 (W, hand-to-hand A-pose) × 0.46 (D) × 1.48 m (H). Stylised ~1.48 m, ≈4 heads tall (chibi-leaning)
- Origin at feet centre, faces −Y in Blender (→ +Z forward / Y-up in glTF), transforms applied
- 17 bones: root, hips, spine, neck, head, upperarm/lowerarm/hand .L/.R, upperleg/lowerleg/foot .L/.R
- Weights: scripted (rigid per part, distance-blended top-2 at shoulders/elbows/knees). Not Blender auto-weights.

## Locked design followed
Short brown bob with bangs, white leaf clip on HER LEFT (+X), large soft brown eyes, blush, small smile,
sage cardigan (open front, buttons, pockets), cream shirt with collar, beige apron with pockets + back bow,
dusty purple skirt, white crew socks, brown loafers. Colours are approximate (sampled/eyeballed).

## Limitations (honest)
- Geometry is primitive-based: hair reads as a "helmet + bangs" shape, not the soft messy bob of the Visual Target.
- Face features are separate small floating shells (not painted textures) — fine at game distance, stiff up close;
  no blendshapes/expressions, no eye rig.
- No UVs/textures; flat per-part materials only. No knit/fabric detail, no cloth folds, skirt pleats only hinted.
- Hands are mittens (no fingers). Apron is a stiff panel; skirt/apron are rigid to hips (legs clip through when walking far).
- Not watertight; parts intersect (fine for rendering, not for 3D printing).
- Weights are basic; expect to repaint for animation. Rig is not Mixamo/Humanoid-standard named.

## Recommended next step
Use as blockout for scale/camera/collision in the Web 3D scene; for final art, hand-model in Blender or use
an image-to-3D tool (Meshy/Tripo) with the ref pack, then retopo + rig (this rig/scale can be reused).
