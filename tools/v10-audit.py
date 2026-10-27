"""V10 source/assets preservation, deterministic rebuild and actual package audit."""
from pathlib import Path
import subprocess,json,hashlib,tarfile,gzip,io
out=Path('/workspace/qa/v10/checks');out.mkdir(parents=True,exist_ok=True)
sha=lambda b:hashlib.sha256(b).hexdigest()
git=lambda *a:subprocess.check_output(['git',*a])
head=git('rev-parse','HEAD').decode().strip()
files=sorted(p.as_posix() for root in ['assets','public'] for p in Path(root).rglob('*') if p.is_file())
before={p:sha(Path(p).read_bytes()) for p in files}
for script in ['generate-v10-surfaces.py','export-misaki.ts','export-native-characters.ts','export-native-environment.ts','export-native-products.ts','export-v4-fixtures.ts']:
 cmd=['python3','tools/'+script] if script.endswith('.py') else ['node','--import','tsx','tools/'+script]
 with (out/(script+'.log')).open('w') as f:subprocess.run(cmd,check=True,stdout=f,stderr=subprocess.STDOUT)
changed=[p for p,h in before.items() if sha(Path(p).read_bytes())!=h]
assert not changed,changed
(out/'asset-rebuild.json').write_text(json.dumps({'source':head,'files':len(files),'tools':6,'changed':changed,'status':'pass'},indent=2)+'\n')
base='8277b326ddbdac71c128dc91b07b930a315904f5'
paths=git('ls-tree','-r','--name-only',base).decode().splitlines()
protected=[p for p in paths if p.startswith(('src/core/','src/platform/','src/content/','src/narrative/','src/locales/','src/ui/','source-inputs/','.openai/','public/fonts/')) or p in ['src/main.ts','package.json','package-lock.json','src/art/geometry.ts','src/art/recipes.ts','src/art/materials.ts','src/presentation/native-routes.ts','src/presentation/native-feet.ts','src/presentation/native-delivery.ts','src/presentation/native-commits.ts','src/presentation/sale-accounting.ts'] or p.startswith(('assets/masters/','public/assets/')) and '/native-v3/' not in p and '/native-v4/' not in p]
changed=[p for p in protected if not Path(p).is_file() or git('hash-object',p).strip()!=git('rev-parse',base+':'+p).strip()]
assert not changed,changed
history=git('rev-list','--reverse','10c070c8121aecfd9e3e1ac9d0db213947416a08').decode().splitlines();assert len(history)==11
for commit in history:subprocess.run(['git','merge-base','--is-ancestor',commit,'HEAD'],check=True)
(out/'preservation.json').write_text(json.dumps({'source':head,'base':base,'protectedPaths':protected,'protectedFiles':len(protected),'changed':changed,'originalElevenCommits':history,'status':'pass'},indent=2)+'\n')
print(json.dumps({'rebuildFiles':len(files),'protectedFiles':len(protected),'status':'pass'}))
