from pathlib import Path
from datetime import datetime,timezone,timedelta
import json,hashlib,re,shutil
ROOT=Path(__file__).resolve().parents[2];O=ROOT/'docs/reviews/evidence/anime-lookdev-v5';A=ROOT/'assets/authoring/anime-lookdev-v5'
for name in ('engine-probe','build','build-corrected','verify','inspect'):
 p=ROOT.parent/('anime-lookdev-v5-'+name+'.log')
 if p.exists():(O/(name+'.log')).write_text(p.read_text(encoding='utf8'),encoding='utf8',newline='\n')
for p in O.glob('*.json'):p.write_text(p.read_text(encoding='utf8'),encoding='utf8',newline='\n')
now=datetime.now(timezone(timedelta(hours=8))).isoformat(timespec='seconds')
state=ROOT/'PROJECT_STATE.md';text=state.read_text(encoding='utf8');text=re.sub(r'Last updated: \*\*[^*]+\*\*',f'Last updated: **{now}**',text,count=1)
section='''## Researched built-in anime head study — visual FAIL, not adopted, 2026-10-30

- [Actual target/v3/new neutral/warm and front/three-quarter/profile comparisons, method report](docs/BLENDER_ANIME_METHOD_STUDY_V5_2026-10-30.md). Applied the parent-supplied official-method research in isolated `assets/authoring/anime-lookdev-v5/`: real EEVEE Shader to RGB bands, own generated UV colour/iris maps, directional Normal Edit, editable flat-profile Bezier hair with taper/radius/tilt. No addons installed, GUI input or projected reference face. Sphere compatibility test and actual head renders both execute.
- **Visual FAIL**: sparse ribbon-like hair, root seams, broad forehead and irregular/intersecting eyelids/expression remain far from the target. First construction plus one bounded correction preserved; do not adopt into v3/game or continue minor parameter variants. Existing v3 source SHA256 remains `d58bb179624083b30de52e0852bae7025281fd8bc5347a9ed9e95abb4a2583fa`. New native SHA256 is `3eadf328c4e8c063a6387c6a704bb9987a5a3fe0d5eadec8b334556226b1daf3`.
- Fresh-process reopen confirms ten editable flat/tapered curves, three packed own UV maps, 12 actual toon lighting graphs and 13,204 changed evaluated corner normals. Re-render RGB8 mean differences <0.0075/channel, max 7; not exact equality. Native toon graph is EEVEE-only lookdev; no new GLB toon export/Unity/runtime certification. Comparisons use inferred reference projection and a 200px head/shoulder scale proxy, not gameplay capture.
- A distinct failed-study comparison Library item was created; v3/previous failed item untouched. Its Windows metadata helper fails because `os.setxattr` is unavailable; upload succeeds and identity is privately retained. Normal Git sync/readback reported externally. Source/evidence/scripts only; no game logic/locales/saves/Site/main change, PR, merge, public deployment or filesystem cleanup.
- The separate earlier CUA Blender app approval timed out; no retry/bypass or GUI sculpt/paint proof. User now proposes Meshy/Tripo image-to-3D base meshes. Stop new from-scratch variants while parent reviews official capabilities/privacy/licensing. Existing OBJ/FBX/glTF import registration is recorded read-only; no target upload, service access, credits spent or external AI model imported. Mesh quality, untextured anatomy, UVs and deformation topology must be assessed on an approved actual file before adoption.

'''
needle='## Failed head-method evidence checkpoint'
assert needle in text
if '## Researched built-in anime head study'not in text:text=text.replace(needle,section+needle,1)
state.write_text(text,encoding='utf8',newline='\n')
files=[]
for root in(A,O,ROOT/'tools/anime-lookdev-v5'):
 for p in sorted(root.rglob('*')):
  if p.is_file()and p.name!='checkpoint-files.json':files.append({'path':p.relative_to(ROOT).as_posix(),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
(O/'checkpoint-files.json').write_text(json.dumps({'recordedAtHongKong':now,'artAccepted':False,'files':files,'totalBytes':sum(x['bytes']for x in files),'preservation':'No filesystem deletion; failed construction and previous v3 retained.'},indent=2)+'\n',encoding='utf8',newline='\n')
print(json.dumps({'files':len(files),'bytes':sum(x['bytes']for x in files),'time':now}))
