"""Package the unmerged feature checkpoint, complete history and checked static output.
Never moves main. Reopen every archive and independently clone the self-contained
bundle to verify all tracked bytes against Git blobs and source hashes.
"""
import argparse,pathlib,subprocess,hashlib,json,zipfile,tarfile,tempfile
p=argparse.ArgumentParser();p.add_argument('--output',required=True);a=p.parse_args();out=pathlib.Path(a.output);out.mkdir(parents=True,exist_ok=False)
def git(*args):return subprocess.check_output(['git',*args])
def sha(b):return hashlib.sha256(b).hexdigest()
if git('status','--porcelain').strip():raise SystemExit('Commit the exact source/evidence checkpoint first.')
branch=git('branch','--show-current').decode().strip();head=git('rev-parse','HEAD').decode().strip();assert branch=='codex/game-v5-refinement'
bundle=out/'source-history.bundle';subprocess.run(['git','bundle','create',str(bundle),branch,'refs/remotes/origin/main'],check=True);subprocess.run(['git','bundle','verify',str(bundle)],check=True,capture_output=True)
files=[]
for ent in git('ls-tree','-r','-z','HEAD').split(b'\0'):
 if not ent:continue
 meta,name=ent.split(b'\t',1);blob=meta.split()[2].decode();b=git('cat-file','blob',blob);files.append({'path':name.decode(),'git_blob':blob,'size':len(b),'sha256':sha(b)})
manifest={'commit':head,'branch':branch,'file_count':len(files),'files':files};(out/'SOURCE_FILES_SHA256.json').write_text(json.dumps(manifest,indent=2)+'\n')
raw=bundle.read_bytes();parts=[];chunks={}
for n,start in enumerate(range(0,len(raw),28*1024*1024),1):
 name=f'source-history.bundle.part{n:02}';b=raw[start:start+28*1024*1024];parts.append({'name':name,'size':len(b),'sha256':sha(b)});chunks[name]=b
info={'branch':branch,'commit':head,'bundle':{'name':bundle.name,'size':len(raw),'sha256':sha(raw)},'parts':parts}
restorer='''from pathlib import Path
import json,hashlib,tempfile,os
root=Path(__file__).resolve().parent
info=json.loads((root/'BUNDLE_PARTS.json').read_text())
sha=lambda b:hashlib.sha256(b).hexdigest()
target=root/info['bundle']['name']
if target.exists():
 if sha(target.read_bytes())!=info['bundle']['sha256']:raise SystemExit('Existing different bundle retained.')
 print('Existing complete bundle verified.');raise SystemExit(0)
with tempfile.NamedTemporaryFile(dir=root,delete=False) as f:
 temp=Path(f.name)
 for part in info['parts']:
  b=(root/part['name']).read_bytes()
  if len(b)!=part['size'] or sha(b)!=part['sha256']:raise SystemExit('Part mismatch: '+part['name'])
  f.write(b)
if temp.stat().st_size!=info['bundle']['size'] or sha(temp.read_bytes())!=info['bundle']['sha256']:raise SystemExit('Combined bundle mismatch.')
os.replace(temp,target)
print('Complete original history + feature source restored.')
print('git clone --branch '+info['branch']+' source-history.bundle project')
'''.encode()
readme=f'''KeEv Game bounded v5 refinement candidate\n\nExact checkpoint: {head}\nUnmerged branch: {branch}\nDraft PR: https://github.com/wizardkeith/KeEv-games/pull/2\n\nAll source, original history, Bible, approved PNG, masters and evidence are in the self-contained bundle. Extract all source ZIP parts into one directory and run restore_bundle.py in the cloud, then clone the feature branch printed by it. Keith need not assemble files or install tools. Existing repositories must preserve local work and history; never force-reset over them.\n\nRead docs/V5_REFINEMENT.md and evidence/native-v5. Art is a refinement candidate, not final target acceptance. Software rendering is not physical-phone FPS/audio/native validation.\n\nThe parent coordinates authorized publication to the SAME existing Site after review/checks. No new Site, access or identity change. GitHub pushes and this build are not a deployment receipt. Keep .openai/hosting.json.\n'''.encode()
archives=[]
def zipwrite(name,members):
 path=out/name;hashes={n:{'size':len(b),'sha256':sha(b)} for n,b in members.items()};members={**members,'SHA256SUMS.json':json.dumps(hashes,indent=2).encode()}
 with zipfile.ZipFile(path,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
  for n,b in members.items():z.writestr(n,b)
 with zipfile.ZipFile(path) as z:
  assert z.testzip() is None and len(z.namelist())==len(set(z.namelist()))
  for n,b in members.items():assert z.read(n)==b
 archives.append({'file':name,'bytes':path.stat().st_size,'sha256':sha(path.read_bytes()),'closed_reader_crc_and_hashes':True})
for n,part in enumerate(parts):
 members={'LittleShop-v5/'+part['name']:chunks[part['name']]}
 if n==0:members.update({'LittleShop-v5/BUNDLE_PARTS.json':json.dumps(info,indent=2).encode(),'LittleShop-v5/restore_bundle.py':restorer,'LittleShop-v5/START_HERE.txt':readme,'LittleShop-v5/SOURCE_FILES_SHA256.json':json.dumps(manifest,indent=2).encode()})
 zipwrite('LittleShop-v5-source-'+chr(65+n)+'.zip',members);assert archives[-1]['bytes']<32*1024*1024
runtime={str(p):p.read_bytes() for p in pathlib.Path('dist').rglob('*') if p.is_file()};assert 'dist/index.html' in runtime
runtime_manifest={n:{'size':len(b),'sha256':sha(b)} for n,b in runtime.items()};zipwrite('LittleShop-v5-Web-Candidate.zip',{**runtime,'.openai/hosting.json':pathlib.Path('.openai/hosting.json').read_bytes(),'START_HERE.txt':readme,'SOURCE_RECEIPT.json':json.dumps({'commit':head,'branch':branch,'runtime_files':len(runtime),'publication':'Not deployed; exact source must be pushed to the configured Sites remote before saving this archive.'},indent=2).encode()})
# Exact supported static deployment archive, with no sessions/saves/source tree.
tar=out/'LittleShop-v5-deploy.tar.gz'
with tarfile.open(tar,'w:gz') as t:
 t.add('.openai/hosting.json',arcname='.openai/hosting.json')
 for n in runtime:t.add(n,arcname=n)
with tarfile.open(tar) as t:
 names=[m.name for m in t.getmembers() if m.isfile()];assert len(names)==len(set(names)) and set(names)==set(runtime)|{'.openai/hosting.json'}
 for n in runtime:assert t.extractfile(n).read()==runtime[n]
# Independently restore a clone and compare every manifest payload to actual bytes.
with tempfile.TemporaryDirectory(dir='/tmp') as d:
 restored=pathlib.Path(d)/'LittleShop-v5'
 for item in archives:
  if '-source-' not in item['file']:continue
  with zipfile.ZipFile(out/item['file']) as z:
   for name in z.namelist():
    if name.startswith('LittleShop-v5/'):z.extract(name,d)
 subprocess.run(['python3',str(restored/'restore_bundle.py')],check=True,capture_output=True)
 reconstructed=restored/'source-history.bundle';assert reconstructed.read_bytes()==raw
 subprocess.run(['git','bundle','verify',str(reconstructed)],check=True,capture_output=True)
 clone=pathlib.Path(d)/'project';subprocess.run(['git','clone','--quiet','--branch',branch,str(reconstructed),str(clone)],check=True)
 assert subprocess.check_output(['git','-C',str(clone),'rev-parse','HEAD']).decode().strip()==head
 for f in files:
  b=(clone/f['path']).read_bytes();assert len(b)==f['size'] and sha(b)==f['sha256']
receipt={'commit':head,'branch':branch,'main_documentation_checkpoint':git('rev-parse','origin/main').decode().strip(),'draft_pr':'https://github.com/wizardkeith/KeEv-games/pull/2','source_files':len(files),'independent_clone_all_source_hashes_match':True,'bundle':info,'runtime_files':len(runtime),'runtime_sha256':runtime_manifest,'archives':archives,'deployment_archive':{'file':tar.name,'bytes':tar.stat().st_size,'sha256':sha(tar.read_bytes()),'all_static_payloads_match':True},'publication':'Not performed; parent coordinates same-Site review/integration/publication. Sites tools available.'}
(out/'DELIVERY_RECEIPT.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps({k:v for k,v in receipt.items() if k!='runtime_sha256'},indent=2))
