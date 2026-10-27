"""Collect only generated QA evidence, excluding browser storage and duplicates."""
from pathlib import Path
import shutil,json,hashlib,subprocess
q=Path('/workspace/qa/v10');root=Path('evidence/native-v10/final');root.mkdir(parents=True,exist_ok=True)
def copytree(src,dst):
 dst.mkdir(parents=True,exist_ok=True)
 for p in src.iterdir():
  if p.is_file() and p.suffix in ['.json','.png','.webm']:shutil.copyfile(p,dst/p.name)
copytree(q/'candidate-high',root/'motion/high');copytree(q/'candidate-life',root/'motion/life');copytree(q/'motion-extracts',root/'motion/excerpts');copytree(q/'release-pricing',root/'ui/pricing');copytree(q/'release-inventory',root/'ui/inventory');copytree(q/'candidate-lifecycle',root/'ui/lifecycle');copytree(q/'studio',root/'art/studio');copytree(q/'candidate-high-close',root/'art/high-close-diagnostic');
(root/'saves').mkdir(exist_ok=True);shutil.copyfile(q/'candidate-old-save.json',root/'saves/old-save.json')
art=root/'art';art.mkdir(exist_ok=True)
for name in ['panorama','shop','character-close','rail-shop']:
 shutil.copyfile(q/'before'/(name+'.png'),art/('before-'+name+'.png'));shutil.copyfile(q/'final-exact-art'/(name+'.png'),art/('after-'+name+'.png'))
shutil.copyfile(q/'before/render.json',art/'before-render.json');shutil.copyfile(q/'final-exact-art/render.json',art/'after-render.json')
for name in ['final-tests','final-content','final-replay','final-asset-check','r9-build','candidate-high','candidate-life','candidate-lifecycle','candidate-old-save','release-pricing','release-inventory','candidate-high-close']:
 p=q/(name+'.log')
 if p.exists():shutil.copyfile(p,root/'checks'/(name+'.log'))
# All per-item results must be readable and successful before claiming completion.
for name in ['candidate-high','candidate-life']:
 r=json.loads((q/name/'results.json').read_text());assert r['status']=='pass' and not r['errors']
for name,count in [('release-pricing',20),('release-inventory',20),('candidate-lifecycle',10),('candidate-life',5)]:
 r=json.loads((q/name/'results.json').read_text());assert len(r['cases'])==count and not r['errors']
old=json.loads((q/'candidate-old-save.json').read_text());assert old['status']=='pass'
app=subprocess.check_output(['git','rev-parse','HEAD']).decode().strip()
source={'application':app,'sourceTree':subprocess.check_output(['git','rev-parse','HEAD:src']).decode().strip(),'artAndLife':'0626469e7d376fe7cd1962370e2955017154bacf','highAndLifecycleAndOldSave':'9758ca19cdd090eed0d0a366c2d4d94866db3755','pricingAndInventory':'770e09ce356977b51e3f8a864dd7239ef52d80fd','studio':'same production characters-v10.ts/sculpt-v10.ts as final app; separate neutral camera/light','reuse':'See checks/reuse-scope.json. Final actual-product-child condition is covered by final empty-stock/live dialogue run. No false all-rerun claim.','caseCount':55,'HighIdleWorkClose45Seconds':'NOT OBSERVED SUCCESSFULLY: last sample starts tidy at entry0; diagnostic retained, not a pass.','limitations':['Target art quality/style not accepted','Cloud SwiftShader, not physical GPU/FPS/Safari/audio/native','True hidden-tab not established by frozen→active QA','Three placement PNGs remain unread; bonus HUD handoff-only','Original V16 local187s and two180s failures remain historical failures']}
(root/'execution-sources.json').write_text(json.dumps(source,indent=2)+'\n')
records={p.relative_to(root).as_posix():{'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}for p in root.rglob('*')if p.is_file() and p.name!='provenance.json'}
(root/'provenance.json').write_text(json.dumps({'application':app,'files':records},indent=2)+'\n');print(len(records),'evidence files verified')
