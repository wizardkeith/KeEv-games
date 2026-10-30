"""Record scoped output identities and sanitized logs without changing artwork."""
from pathlib import Path
import json,hashlib,datetime
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'docs/reviews/evidence/target-model-proof-v3'
ASSET=ROOT/'assets/authoring/target-model-proof-v3'
manifest=json.loads((ASSET/'manifest.json').read_text())
failed=ASSET/'rejected-hair-study/failed-irregular-lock-study.blend'
failedhash=hashlib.sha256(failed.read_bytes()).hexdigest()
assert failedhash=='eb3571c48a60b011ddab09d636825fc5d7c054fd350184a24cd094feaddf35ef'
(failed.parent/'study-receipt.json').write_text(json.dumps({'status':'VISUALLY REJECTED; not retained hair','source':failed.relative_to(ROOT).as_posix(),'sourceSha256':failedhash,'reason':'Helmet crown and separated thick dangling ends were worse than v2','renderEvidence':[{ 'path':(OUT/name).relative_to(ROOT).as_posix(),'sha256':hashlib.sha256((OUT/name).read_bytes()).hexdigest()}for name in ['rejected-hair-full.png','rejected-hair-close.png']],'portableExports':'Not retained as authoritative outputs; final GLBs correspond to restored v2 hair and v3 garments/pose.'},indent=2)+'\n',encoding='utf8',newline='\n')
# Normalize only receipt paths for use on the cloud/Linux checkout. No model
# or export bytes change, and their verified hashes remain authoritative.
for key in ('reference','source'):manifest[key]=manifest[key].replace('\\','/')
for entry in manifest['exports'].values():entry['file']=entry['file'].replace('\\','/')
(ASSET/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf8',newline='\n')
for log,output in [('target-model-proof-v3-build.log','background-build.log'),
                   ('target-model-proof-v3-validation.log','background-validation.log'),
                   ('target-model-proof-v3-pose.log','background-pose-study.log'),
                   ('target-model-proof-v3-preservation.log','background-preservation.log')]:
    raw=(ROOT.parent/log).read_text(encoding='utf8',errors='replace')
    for path,replacement in [(str(ROOT),'<REPO>'),(str(ROOT.parents[4]),'<USER_HOME>')]:
        raw=raw.replace(path.replace('\\','\\\\'),replacement).replace(path,replacement)
    (OUT/output).write_text(raw,encoding='utf8',newline='\n')
paths=[]
for folder in (ASSET,ROOT/'tools/target-model-proof-v3',OUT):
    paths += [p for p in folder.rglob('*') if p.is_file() and p.name!='phase-receipt.json']
for path in paths:
    if path.suffix in ('.json','.md','.py','.mjs','.log'):
        path.write_bytes(path.read_bytes().replace(b'\r\n',b'\n'))
receipt={'recordedAt':datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=8))).isoformat(),
  'sourceCheckpoint':manifest['createdFromCheckpoint'],'scope':'unaccepted complete character and representative display Blender proof',
  'sourceSha256':manifest['blendSha256'],
  'authoringMethod':'Background Blender Python; editable native meshes/curves/modifiers; no interactive GUI control tested',
  'validation':'Native reopen and independent GLB import passed; zero glTF validator errors/warnings; no new Web/game tests claimed',
  'blenderLogLimits':['Optional thumbnail/cache writes were denied by the profile; outputs saved successfully.',
    'Non-normal-mapped or UV-less meshes can emit tangent calculation warnings. Validator certifies required normal-map tangents.',
    'Mixed-material export can warn about unused vertex colour. Thirteen actual coloured primitives and render roundtrip verified.'],
  'artStatus':'NOT ACCEPTED; substantial hair, expression, clothing and material mismatches',
  'cleanup':'No files deleted; no user process terminated; all task Blender processes exited normally.',
  'files':[{ 'path':p.relative_to(ROOT).as_posix(),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}for p in sorted(paths)]}
(OUT/'phase-receipt.json').write_text(json.dumps(receipt,indent=2)+'\n',encoding='utf8',newline='\n')
print(json.dumps({'recordedAt':receipt['recordedAt'],'files':len(paths),'bytes':sum(p.stat().st_size for p in paths),'sourceSha256':manifest['blendSha256']}))
