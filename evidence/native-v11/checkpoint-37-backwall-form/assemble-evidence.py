from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import json,hashlib,shutil,subprocess,urllib.request,re
qa=Path('/workspace/qa/v11-slice/c37');out=Path('evidence/native-v11/checkpoint-37-backwall-form');out.mkdir(parents=True,exist_ok=True)
app='cc98c7b6efc67b58a408f9d6d1e62f2cdee8bf5c'
inputs={'before233':qa/'gray-comparison','after245':qa/'final-gray245','preview246':qa/'final-shape246','default247':qa/'default-control247'}
required={'before233':['old-gray-normal-game.png','old-gray-oblique-0.png','old-gray-oblique-1.png'],'after245':['gray-normal-game.png','gray-oblique-0.png','gray-oblique-1.png','results.json'],'preview246':['shape-normal-game.png','actual-after-purchase-normal.png','actual-post-purchase-reload-normal.png','results.json'],'default247':['control-normal-game.png','results.json']}
for name,names in required.items():
 for f in names:assert(inputs[name]/f).is_file(),str(inputs[name]/f)
# Complete-result assertions before copying any evidence.
a=json.loads((inputs['after245']/'results.json').read_text())['results'][0];b=json.loads((inputs['preview246']/'results.json').read_text())['results'][0];c=json.loads((inputs['default247']/'results.json').read_text())['results'][0]
assert a['diagnostic']['world']['backwallForms']['mode']=='gray'
assert b['diagnostic']['world']['backwallForms']['mode']=='shape'
assert c['diagnostic']['world']['backwallForms']['mode']=='control'
assert a['diagnostic']['world']['cameraPose']==b['diagnostic']['world']['cameraPose']==c['diagnostic']['world']['cameraPose']
assert a['economy']==b['economy']==c['economy'];assert a['formOrbitProof']['saveUnchanged'];assert b['stockReloadProof']['saveReloadExact'] and b['stockReloadProof']['actual3DPostReload']
assert not a['errors'] and not b['errors'] and not c['errors']
for name,names in required.items():
 target=out/name;target.mkdir(exist_ok=True)
 for f in names:shutil.copy2(inputs[name]/f,target/f)
for source,target in [(inputs['after245']/'gray-motion',out/'after245'/'gray-motion'),(inputs['preview246']/'purchase-motion',out/'preview246'/'purchase-motion')]:
 target.mkdir(parents=True,exist_ok=True)
 for f in ['gameplay-uncut.webm','recording-provenance.json']:shutil.copy2(source/f,target/f)
logs=['tests245-final.log','validate-final.log','replay-final.log','asset-check-final.log','glb-final.log','preservation-final.log','asset-rebuild-final-parity.json','default-master-comparison.json','runtime-245-parity.json','runtime-246-parity.json','runtime-247-parity.json']+[f'probe-{m}.json'for m in['control','old-gray','gray','shape']]
for f in logs:shutil.copy2(qa/f,out/f)
for n in[245,246,247]:shutil.copy2(qa/('build'+str(n)+('-default'if n==247 else'')+'.log'),out/('build'+str(n)+'.log'))
font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',15)
ref=Path('docs/codex-v4/reference/Approved_Visual_Target_Misaki.png');assert hashlib.sha256(ref.read_bytes()).hexdigest()=='9f855d2ecfd120bb45c001db3fa9b5a3e3b58b2b3c2a4cf9e7ebfda84f8f7114'
def panel(path,box,label,w=660,h=535):
 p=Image.open(path).convert('RGB').crop(box);p.thumbnail((w-12,480),Image.Resampling.LANCZOS);frame=Image.new('RGB',(w,h),'#F4EFE8');frame.paste(p,((w-p.width)//2,43));ImageDraw.Draw(frame).text((12,13),label,fill='#302E2B',font=font);return frame
refbox=(0,0,1185,1024);roombox=(76,118,1390,1096)
# Equal 480px actual room height, caption outside source pixels. No synthesis.
for name,panels in {'target-before-after-gray480.png':[(ref,refbox,'Original approved target | reference'),(out/'before233/old-gray-normal-game.png',roombox,'Before233 | ACTUAL GAME / scoped gray'),(out/'after245/gray-normal-game.png',roombox,'C37 245 | ACTUAL GAME / scoped gray')],'target-default-preview480.png':[(ref,refbox,'Original approved target | reference'),(out/'default247/control-normal-game.png',roombox,'C36 default247 | ACTUAL GAME'),(out/'preview246/shape-normal-game.png',roombox,'C37 preview246 | ACTUAL GAME / NOT adopted')]}.items():
 sheet=Image.new('RGB',(660*len(panels),535),'#F4EFE8')
 for i,args in enumerate(panels):sheet.paste(panel(*args),(660*i,0))
 sheet.save(out/name)
# Raw pixel crop, identical actual-camera region. Supplemental, not a substitute
# for the primary equal-room-height normal-game judgment.
bgbox=(395,160,1270,545);sheet=Image.new('RGB',(1760,450),'#F4EFE8')
for i,(path,label)in enumerate([(out/'before233/old-gray-normal-game.png','Before233 | actual background crop'),(out/'after245/gray-normal-game.png','C37 245 | actual background crop')]):
 p=Image.open(path).crop(bgbox);sheet.paste(p,(i*880,43));ImageDraw.Draw(sheet).text((i*880+12,13),label,font=font,fill='#302E2B')
sheet.save(out/'same-camera-background-gray.png')
http=[]
for port,num,folder in [(4518,245,'immutable245-c37-clearance-gray'),(4519,246,'immutable246-c37-clearance-shape'),(4520,247,'immutable247-c37-default-control')]:
 root=Path('/workspace/qa/v11-slice')/folder;html=urllib.request.urlopen(f'http://127.0.0.1:{port}').read().decode()
 paths=re.findall(r'(?:src|href)="(/assets/[^\"]+\.(?:js|css))"',html)
 for p in paths:
  data=urllib.request.urlopen(f'http://127.0.0.1:{port}'+p).read();assert data==(root/p.lstrip('/')).read_bytes();http.append({'build':num,'path':p,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest(),'actualHTTPMatchesFrozenBuild':True})
(out/'actual-bundle-http-identity.json').write_text(json.dumps({'application':app,'records':http,'limit':'Local cloud authoring servers, not public Site verification'},indent=2)+'\n')
proof={'application':app,'reference':{'path':str(ref),'sha256':hashlib.sha256(ref.read_bytes()).hexdigest(),'comparedArea':'left shop scene; portrait excluded from equal-room-height comparison'},'variants':{'before233':'C36 geometry / old-gray scope, app80eecd38c05d6cd6a9aac339f8f8fb651a8521dd; no new forms','after245':'Final C37 gray form gate','preview246':'Final C37 forms with inherited/placeholder palettes. NOT new material acceptance or default','default247':'Ordinary development default remains C36, C37 control/OFF'},'cameraEqual':True,'initialEconomyEqual':True,'normal':a['normal'],'stockReloadProof':b['stockReloadProof'],'postprocessing':{'referenceShopCrop':refbox,'actualRoomCrop':roombox,'roomHeight':480,'backgroundCrop':bgbox,'operations':'only crop, uniform Lanczos resize and captions outside source pixels; raw screenshots retained'},'exploratoryExcluded':[234,235,236,237,239,240,242,243],'scopeLimits':'No final target acceptance, C37 material gate/default adoption, fresh full stock cycle/settlement/handoff/Low/ReduceMotion/five-locale narrow UI/hidden-tab/physical GPU/audio/native certification. Those C36 results remain historical. No public Site or owner save accessed.'}
(out/'evidence-provenance.json').write_text(json.dumps(proof,indent=2)+'\n')
records={str(p.relative_to(out)):hashlib.sha256(p.read_bytes()).hexdigest()for p in sorted(out.rglob('*'))if p.is_file()and p.name!='SHA256SUMS.json'};(out/'SHA256SUMS.json').write_text(json.dumps(records,indent=2)+'\n');print(json.dumps({'files':len(records),'application':app,'stockProof':{k:v for k,v in b['stockReloadProof'].items()if k!='diagnostic'}}))
