"""Preserve failed-method evidence and GUI blocker, without changing any model."""
from pathlib import Path
import hashlib,json,datetime
ROOT=Path(__file__).resolve().parents[2];A=ROOT/'assets/authoring/head-method-study-v4';O=ROOT/'docs/reviews/evidence/head-method-study-v4'
for source,destination in [('head-method-study-v4-probe.log','background-probe.log'),('head-method-study-v4-build.log','background-build.log'),('head-method-study-v4-verify.log','background-reopen.log'),('head-method-study-v4-gui-prep.log','background-gui-prep.log'),('head-method-study-v4-readiness.log','background-readiness.log')]:
 text=(ROOT.parent/source).read_text(encoding='utf8',errors='replace')
 for old,new in [(str(ROOT),'<REPO>'),(str(ROOT.parents[4]),'<USER_HOME>')]:text=text.replace(old.replace('\\','\\\\'),new).replace(old,new)
 (O/destination).write_text(text,encoding='utf8',newline='\n')
files=[p for folder in (A,O,ROOT/'tools/head-method-study-v4')for p in folder.rglob('*')if p.is_file()and p.name!='preservation-receipt.json']
for p in files:
 if p.suffix in('.py','.json','.md','.log'):p.write_bytes(p.read_bytes().replace(b'\r\n',b'\n'))
v3=ROOT/'assets/authoring/target-model-proof-v3/misaki-display-model-proof.blend'
assert hashlib.sha256(v3.read_bytes()).hexdigest()=='d58bb179624083b30de52e0852bae7025281fd8bc5347a9ed9e95abb4a2583fa'
assert hashlib.sha256((A/'head-method-study.blend').read_bytes()).hexdigest()=='a43dbce709d3dab6001a8cf2071bb03a5788e5a9fb7d197a53d5525e91a02918'
baseline=json.loads((O/'gui-test-before.json').read_text())
test_unchanged=hashlib.sha256((ROOT/baseline['testFile']).read_bytes()).hexdigest()==baseline['testBeforeSha256']
assert test_unchanged,'Disposable GUI test file changed unexpectedly; inspect before preserving this blocked-test receipt'
receipt={'recordedAt':datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=8))).isoformat(),'status':'Failed-method evidence preservation only; not accepted art','v3SourceUnchanged':True,'guiTestFileUnchangedSincePreparation':test_unchanged,'guiStatus':'App approval timed out before any interactive stroke/save; no bypass','libraryDelivery':'Distinct failed comparison item created successfully; identity reported separately','files':[{'path':p.relative_to(ROOT).as_posix(),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}for p in sorted(files)]}
(O/'preservation-receipt.json').write_text(json.dumps(receipt,indent=2)+'\n',encoding='utf8',newline='\n')
print(json.dumps({'files':len(files),'bytes':sum(p.stat().st_size for p in files),'v3Unchanged':True,'artAccepted':False,'guiStrokeProven':False}))
