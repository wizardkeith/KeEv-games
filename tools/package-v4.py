"""Package the committed v4 checkpoint, static build and <=32 MiB handoff ZIPs.
Run from the repository root after committing all delivery evidence. Full source
and history live in a self-contained main bundle; no credential config is copied.
"""
import argparse, hashlib, json, pathlib, subprocess, zipfile
p=argparse.ArgumentParser();p.add_argument('--output',required=True);args=p.parse_args();out=pathlib.Path(args.output);out.mkdir(parents=True,exist_ok=True)
def git(*a):return subprocess.check_output(['git',*a])
def sha(b):return hashlib.sha256(b).hexdigest()
if git('status','--porcelain').strip():raise SystemExit('Commit the source/evidence checkpoint before packaging.')
head=git('rev-parse','HEAD').decode().strip()
if git('rev-parse','main').decode().strip()!=head:raise SystemExit('Local main must point to the delivery checkpoint; do not overwrite other work to change it.')
bundle=out/'source-history.bundle'
if bundle.exists():raise SystemExit('Choose a fresh output directory; existing bundle retained.')
subprocess.run(['git','bundle','create',str(bundle),'main'],check=True)
subprocess.run(['git','bundle','verify',str(bundle)],check=True,capture_output=True)
files=[]
for entry in git('ls-tree','-r','-z','HEAD').split(b'\0'):
 if not entry:continue
 meta,name=entry.split(b'\t',1);blob=meta.split()[2].decode();data=git('cat-file','blob',blob)
 files.append({'path':name.decode(),'git_blob':blob,'size_bytes':len(data),'sha256':sha(data)})
source_manifest=json.dumps({'commit':head,'file_count':len(files),'files':files},indent=2).encode()
raw=bundle.read_bytes();parts=[];chunks={};chunk_size=28*1024*1024
for i,start in enumerate(range(0,len(raw),chunk_size),1):
 name=f'source-history.bundle.part{i:02}';data=raw[start:start+chunk_size];chunks[name]=data;parts.append({'name':name,'size_bytes':len(data),'sha256':sha(data)})
info={'bundle':{'name':bundle.name,'size_bytes':len(raw),'sha256':sha(raw)},'parts':parts,'branch':'main','commit':head}
restorer='''from pathlib import Path
import hashlib,json,tempfile,os
root=Path(__file__).resolve().parent
info=json.loads((root/'BUNDLE_PARTS.json').read_text())
def digest(p):
 h=hashlib.sha256()
 with p.open('rb') as f:
  for b in iter(lambda:f.read(1048576),b''):h.update(b)
 return h.hexdigest()
target=root/'source-history.bundle'
if target.exists():
 if digest(target)!=info['bundle']['sha256']:raise SystemExit('Different bundle exists; retained without overwrite.')
 print('Existing bundle SHA-256 verified.');raise SystemExit(0)
for part in info['parts']:
 p=root/part['name']
 if p.stat().st_size!=part['size_bytes'] or digest(p)!=part['sha256']:raise SystemExit('Part checksum mismatch: '+part['name'])
with tempfile.NamedTemporaryFile(dir=root,delete=False) as f:
 temp=Path(f.name)
 for part in info['parts']:
  with (root/part['name']).open('rb') as src:
   for b in iter(lambda:src.read(1048576),b''):f.write(b)
if temp.stat().st_size!=info['bundle']['size_bytes'] or digest(temp)!=info['bundle']['sha256']:
 temp.unlink();raise SystemExit('Combined checksum mismatch.')
os.replace(temp,target)
print('Complete bundle restored and SHA-256 verified.')
print('git clone --branch main source-history.bundle project')
'''.encode()
readme=f'''下一站・小店物語 v4 完整雲端交接

Source checkpoint: {head}
Canonical repository: https://github.com/wizardkeith/KeEv-games

完整源碼、Bible、美術原圖、資產、驗收證據及 Git 歷史都在 bundle。
把所有 source A/B ZIP 解壓到同一目錄，進入 LittleShop-v4/，由雲端執行：
  python3 restore_bundle.py
  git clone --branch main source-history.bundle project
再讀 project/README.md、docs/V4_CANDIDATE_zh-HK.md 及 docs/V4_QA.md。
若已有 canonical checkout，先保留未提交工作與 origin，按原 START_HERE A 節合併；不 force push。

未更新公開 Site；需由原 Work/Sites 流程發佈 dist，保留 .openai/hosting.json 身份。
Keith 無需在公司電腦執行命令或安裝工具。
'''.encode()
records=[]
def write_zip(name,members):
 file=out/name
 if file.exists():raise SystemExit('Existing archive retained: '+str(file))
 hashes={n:{'size_bytes':len(b),'sha256':sha(b)} for n,b in members.items()};members={**members,'SHA256SUMS.json':json.dumps(hashes,indent=2).encode()}
 with zipfile.ZipFile(file,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
  for n,b in members.items():z.writestr(n,b)
 with zipfile.ZipFile(file) as z:
  assert z.testzip() is None
  assert len(z.namelist())==len(set(z.namelist())) and set(z.namelist())==set(members)
  for n,b in members.items():assert sha(z.read(n))==sha(b),n
 records.append({'file':file.name,'size_bytes':file.stat().st_size,'sha256':sha(file.read_bytes()),'closed_reader_crc_and_sha256_passed':True})
for i,part in enumerate(parts):
 members={'LittleShop-v4/'+part['name']:chunks[part['name']]}
 if i==0:members.update({'LittleShop-v4/restore_bundle.py':restorer,'LittleShop-v4/BUNDLE_PARTS.json':json.dumps(info,indent=2).encode(),'LittleShop-v4/START_HERE_v4_zh-HK.txt':readme,'LittleShop-v4/SOURCE_FILES_SHA256.json':source_manifest})
 write_zip('LittleShop-v4-source-'+chr(65+i)+'.zip',members)
 assert records[-1]['size_bytes']<32*1024*1024
runtime={str(p):p.read_bytes() for p in pathlib.Path('dist').rglob('*') if p.is_file()};assert 'dist/index.html' in runtime
runtime.update({'START_HERE_v4_zh-HK.txt':readme,'SOURCE_RECEIPT.json':json.dumps({'commit':head,'repository':'wizardkeith/KeEv-games','source_files':len(files),'bundle':info['bundle'],'publication':'Candidate only. GitHub push/build is not Site deployment.'},indent=2).encode(),'.openai/hosting.json':pathlib.Path('.openai/hosting.json').read_bytes()})
write_zip('LittleShop-v4-Web-Candidate.zip',runtime)
receipt={'source_commit':head,'git_branch':'main','source_files':len(files),'bundle':info,'archives':records,'site_deployment':'not performed; original Work/Sites publisher required'}
(out/'DELIVERY_RECEIPT.json').write_text(json.dumps(receipt,indent=2)+'\n')
print(json.dumps(receipt,indent=2))
