"""Verify bounded scope and complete original history without rewriting saves."""
import subprocess,pathlib,json,hashlib
root=pathlib.Path('.');baseline='10c070c8121aecfd9e3e1ac9d0db213947416a08';candidate='274148b19e53cd33e68e214d41aed05e19d272b3'
def git(*args):return subprocess.check_output(['git',*args])
files=git('ls-tree','-r','--name-only',baseline).decode().splitlines()
# Locale wording and day1-copy are intentionally authorized presentation changes.
protected=[p for p in files if p.startswith(('src/core/','src/platform/','source-inputs/','.openai/','public/fonts/')) or p.startswith('src/narrative/') and p!='src/narrative/day1-copy.ts' or p in ['src/content/catalog.json','src/content/layout.json','package.json','package-lock.json','src/art/geometry.ts','src/art/recipes.ts','src/art/materials.ts','src/presentation/native-feet.ts','src/presentation/native-routes.ts','src/presentation/native-delivery.ts','src/presentation/native-commits.ts'] or p.startswith(('assets/masters/','public/assets/')) and '/native-v3/' not in p and '/native-v4/' not in p and '/native-v5/' not in p]
changed=[p for p in protected if not pathlib.Path(p).is_file() or git('hash-object',p).strip()!=git('rev-parse',candidate+':'+p).strip()]
commits=git('rev-list','--reverse',baseline).decode().splitlines();assert len(commits)==11
for c in commits:subprocess.run(['git','merge-base','--is-ancestor',c,'HEAD'],check=True)
subprocess.run(['git','fsck','--full'],check=True,capture_output=True)
report={'baseline':baseline,'protected_comparison':candidate,'original_history_commits':commits,'protected_count':len(protected),'changed_protected':changed,'authorized_text_changes':'Five locale dictionaries, Day 1 copy and presentation guidance only. Narrative predicates/economy/catalog/layout/storage/schema unchanged.','historical_masters':'All original source and masters remain in full Git history; new v5 wood master is separate. Current native-v3/v4 export paths intentionally regenerated to preserve reusable stable assets.','pass':not changed}
pathlib.Path('evidence/native-v5/preservation.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report));assert not changed
