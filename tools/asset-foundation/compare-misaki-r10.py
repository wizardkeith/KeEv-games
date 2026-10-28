"""Reference/R9/R10 review panels: crop, proportional resize and labels only.
No generated reference, colour correction, painted pixels or unseen PlanB.
"""
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import hashlib,json
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'docs/reviews/evidence/misaki-grayform-v1-r10'
original=ROOT/'docs/codex-v4/reference/Approved_Visual_Target_Misaki.png'
assert hashlib.sha256(original.read_bytes()).hexdigest()=='9f855d2ecfd120bb45c001db3fa9b5a3e3b58b2b3c2a4cf9e7ebfda84f8f7114'
font=next((ImageFont.truetype(str(p),16)for p in [Path('C:/Windows/Fonts/segoeui.ttf'),Path('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf')]if p.exists()),ImageFont.load_default())
records=[]
def arrange(name,items,height=480):
 panels=[]
 for label,path,box in items:
  im=Image.open(path).convert('RGB').crop(box)
  im=im.resize((round(im.width*height/im.height),height),Image.Resampling.LANCZOS);panels.append((label,im))
 frame=Image.new('RGB',(sum(im.width for _,im in panels)+12*(len(panels)+1),height+56),'#f5f1ea');draw=ImageDraw.Draw(frame);x=12
 for label,im in panels:draw.text((x,12),label,fill='#302b26',font=font);frame.paste(im,(x,44));x+=im.width+12
 frame.save(OUT/name)
 records.append({'file':name,'sha256':hashlib.sha256((OUT/name).read_bytes()).hexdigest(),'panels':[{'label':label,'source':str(path.relative_to(ROOT)).replace('\\','/'),'sourceSha256':hashlib.sha256(path.read_bytes()).hexdigest(),'crop':box}for label,path,box in items],'height':height})
for view,label in [('front','FRONT'),('threequarter','3/4')]:
 arrange('original-r9-r10-'+view+'-head480.png',[
  ('ORIGINAL / 3/4; pose differs',original,(1206,678,1512,966)),
  ('R9 / '+label+' / same local renderer',OUT/('r9-'+view+'.png'),(170,4,550,330)),
  ('R10 / '+label+' / review candidate',OUT/('r10-'+view+'.png'),(170,4,550,330))])
 arrange('r9-r10-'+view+'-body480.png',[(r.upper()+' / '+label,OUT/(r+'-'+view+'.png'),(0,0,720,900))for r in ['r9','r10']])
arrange('original-r9-r10-normal-game480.png',[
 ('ORIGINAL / left shop',original,(0,0,1184,1024)),
 ('R9 / actual normal camera',OUT/'r9-game-normal.png',(105,75,1190,800)),
 ('R10 / actual normal camera',OUT/'r10-game-normal.png',(105,75,1190,800))])
arrange('r10-inferred-side-back480.png',[(label,OUT/('r10-'+view+'.png'),(100,4,620,850))for label,view in [('SIDE / inferred','side'),('BACK / inferred','back')]])
(OUT/'comparison-provenance.json').write_text(json.dumps({'method':'Unedited source pixels, specified crop, proportional Lanczos resize, layout and labels only','originalSha256':hashlib.sha256(original.read_bytes()).hexdigest(),'referenceViewLimit':'Original illustration has different three-quarter pose/projection; no exact front/side/back reference claimed','panels':records},indent=2)+'\n',encoding='utf8',newline='\n')
print('Created',len(records),'source-traceable comparison sheets')
