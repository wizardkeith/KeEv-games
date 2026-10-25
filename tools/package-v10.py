"""Deterministic reviewed runtime only: dist plus original hosting identity."""
from pathlib import Path
import gzip,tarfile,io,hashlib,json,subprocess,os
sha=lambda b:hashlib.sha256(b).hexdigest();git=lambda *a:subprocess.check_output(['git',*a]).decode().strip()
files={p.as_posix():p.read_bytes() for p in Path('dist').rglob('*') if p.is_file()};runtime=len(files);files['.openai/hosting.json']=Path('.openai/hosting.json').read_bytes();out=Path(os.environ.get('V10_PACKAGE_OUT','evidence/native-v10/delivery'));out.mkdir(parents=True,exist_ok=True);archive=out/'NextStopLittleShop-v10-deploy.tar.gz'
with archive.open('wb') as raw:
 with gzip.GzipFile(fileobj=raw,mode='wb',filename='',mtime=0) as g:
  with tarfile.open(fileobj=g,mode='w') as t:
   for n,b in sorted(files.items()):
    ti=tarfile.TarInfo(n);ti.size=len(b);ti.mode=0o644;ti.mtime=0;t.addfile(ti,io.BytesIO(b))
with tarfile.open(archive) as t:
 entries=t.getmembers();assert len(entries)==len(files) and all(m.isfile()for m in entries);assert {m.name:t.extractfile(m).read()for m in entries}==files
r={'applicationCommit':git('rev-parse','HEAD'),'srcTree':git('rev-parse','HEAD:src'),'runtimeFiles':runtime,'archiveFiles':len(files),'bytes':archive.stat().st_size,'sha256':sha(archive.read_bytes()),'allActualArchivePayloadsMatch':True,'payloads':{n:{'bytes':len(b),'sha256':sha(b)}for n,b in sorted(files.items())},'status':'Draft PR7. Not merged/deployed; public Site remains V16; independent review required.','limits':'Runtime archive contains only dist plus unchanged hosting identity; no evidence/master bulk.'};(out/'receipt.json').write_text(json.dumps(r,indent=2)+'\n');print(json.dumps({k:v for k,v in r.items()if k!='payloads'}))
