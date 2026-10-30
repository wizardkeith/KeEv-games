from pathlib import Path
from datetime import datetime,timezone,timedelta
import json,hashlib,re,shutil
R=Path(__file__).resolve().parents[2];A=R/'assets/authoring/grok-head-refinement-v1';O=R/'docs/reviews/evidence/grok-head-refinement-v1';review=R.parent/'misaki-user-trial-review';raw=O/'source-audit';raw.mkdir(exist_ok=True)
for p in (review/'local-evidence').iterdir():
 if p.suffix in('.json','.png'):
  if p.suffix=='.json':(raw/p.name).write_text(p.read_text(encoding='utf8'),encoding='utf8',newline='\n')
  else:shutil.copyfile(p,raw/p.name)
for name in('archive-audit.json','local-audit.log','component-inspection.log'):(raw/name).write_text((review/name).read_text(encoding='utf8'),encoding='utf8',newline='\n')
shutil.copyfile(review/'extracted/misaki-3d-trial/README.md',A/'original/README.user-supplied.md')
# These are our own previously executed audit scripts, not archive code.
audit=(review/'audit_candidate.py').read_text(encoding='utf8').replace("R=Path(__file__).resolve().parent;A=R/'extracted/misaki-3d-trial';O=R/'local-evidence';O.mkdir(exist_ok=True)","R=Path(__file__).resolve().parents[2];A=R/'assets/authoring/grok-head-refinement-v1/original';O=R/'docs/reviews/evidence/grok-head-refinement-v1/source-audit';O.mkdir(parents=True,exist_ok=True)")
(R/'tools/grok-head-refinement-v1/audit_candidate.py').write_text(audit,encoding='utf8',newline='\n')
inspection=(review/'inspect_components.py').read_text(encoding='utf8').replace("R=Path(__file__).resolve().parent","R=Path(__file__).resolve().parents[2]").replace("R/'extracted/misaki-3d-trial/Misaki_trial.blend'","R/'assets/authoring/grok-head-refinement-v1/original/Misaki_trial.blend'").replace("R/'local-evidence/head-components.json'","R/'docs/reviews/evidence/grok-head-refinement-v1/source-audit/head-components.json'")
(R/'tools/grok-head-refinement-v1/inspect_components.py').write_text(inspection,encoding='utf8',newline='\n')
for name in('build','fallback','verify'):
 p=R.parent/('grok-head-refinement-v1-'+name+'.log');(O/(name+'.log')).write_text(p.read_text(encoding='utf8'),encoding='utf8',newline='\n')
now=datetime.now(timezone(timedelta(hours=8))).isoformat(timespec='seconds');p=R/'PROJECT_STATE.md';text=p.read_text(encoding='utf8');text=re.sub(r'Last updated: \*\*[^*]+\*\*',f'Last updated: **{now}**',text,count=1)
section='''## User-selected Grok foundation; head geometry attempt rejected, 2026-10-30

- User supplied `Misaki_3D_Trial.zip`, then explicitly identified Downloads after the Windows Library xattr helper failed. Exact local named ZIP SHA256 `b279ddaadb5aa7d7632286e50eb6c4da9bf41029bafc5c0b3bf6bbdc202252f2` matched; no alternate transfer or unrelated Downloads read. [Local source audit and actual target/original/material study](docs/GROK_CANDIDATE_LOCAL_REVIEW_2026-10-30.md). The user judged Grok better but still short of Japanese anime: **original Grok is the chosen foundation, not final target acceptance**. Prior v3/v5 stay recoverable.
- Actual background Blender5.2.3 reopen with autoexec disabled/offline and GLB import pass. Source:4484verts/8608tri/17materials/17bones,80parts/48boundaryedges,no textures/actions/shape keys/drivers/linked resources. UVMap exists but5664/8608 UV triangles degenerate (65.799%) and extensive overlaps. Native bone response demonstrated, not walk/cloth/humanoid readiness;99 source vertices have non-unit total weights. Original GLB validator0errors/1skinned-node-hierarchy warning/17unused-UV infos, not strict zero-warning. A hidden importer Icosphere is a bone display helper, not character geometry.
- One focused seven-bang-cage/ivory-sclera geometry attempt actually rendered but **worsened roots/intersections and exposed protruding eye shells; rejected**. No extra hair sheets. `rejected-head-geometry.blend` and failed images/archive preserved. No further geometry variants. The optional `grok-head-material-fallback.blend` restores all4484 original vertex coordinates/polygon indices and all deform weights, retains original dark eye/lash material, and keeps only own iris colour/UV and face-only colour/shadow/normal lookdev. Its SHA256 `80ecbffdd738b1e65fcd2a46f027ce9c93e6235844ee7f31ffcb6c9deca71535`.
- Fresh-process fallback reopen:2766 non-head vertices' material/UV anchors and evaluated body positions/normals exact; neutral three-quarter rerender exact RGB8 equality in this run. Before/after cameras/light/distance fixed. **Only a small material study; hair identity and Japanese-anime likeness remain unaccepted.** No automatic adoption. Native EEVEE toon graph is not arbitrary GLB/Unity portability; original GLB preserved, no new fallback-export/runtime claim. Actual comparison Library item and normal Git sync/readback reported externally.
- Sources/own scripts/evidence under `assets/authoring/grok-head-refinement-v1/`, `tools/grok-head-refinement-v1/`, `docs/reviews/evidence/grok-head-refinement-v1/`. Original Downloads ZIP/source unchanged. No bundled script execution, GUI retry/input, installs/auth/security changes, external 3D service use, new gameplay/Unity work, PR/merge/public Site/save changes or filesystem deletion. Review original vs material-only fallback before any next artistic step.

'''
needle='## Researched built-in anime head study';assert needle in text
if '## User-selected Grok foundation'not in text:text=text.replace(needle,section+needle,1)
p.write_text(text,encoding='utf8',newline='\n')
files=[]
for root in(A,O,R/'tools/grok-head-refinement-v1'):
 for p in sorted(root.rglob('*')):
  if p.is_file()and p.name!='checkpoint-files.json':files.append({'path':p.relative_to(R).as_posix(),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
(O/'checkpoint-files.json').write_text(json.dumps({'recordedAtHongKong':now,'files':files,'totalBytes':sum(x['bytes']for x in files),'artAccepted':False,'originalSourceUnmodified':True,'cleanup':'No filesystem deletion; original and failed source evidence retained.'},indent=2)+'\n',encoding='utf8',newline='\n');print(json.dumps({'files':len(files),'bytes':sum(x['bytes']for x in files),'time':now}))
