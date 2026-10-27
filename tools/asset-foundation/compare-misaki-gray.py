"""Actual pixel crops / proportional scaling only. Canonical pose differs;
R5/R6 share the same camera and crop. No colour edits or new reference views.
"""
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
root=Path(__file__).resolve().parents[2]
out=root/'docs/reviews/evidence/misaki-grayform-v1-r6'
before=root/'docs/reviews/evidence/misaki-grayform-v1-r5'
original=root/'docs/codex-v4/reference/Approved_Visual_Target_Misaki.png'
font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',16)
def arrange(name,items,height=480):
 panels=[]
 for label,path,box in items:
  im=Image.open(path).convert('RGB').crop(box);im=im.resize((round(im.width*height/im.height),height),Image.Resampling.LANCZOS);panels.append((label,im))
 frame=Image.new('RGB',(sum(im.width for _,im in panels)+12*(len(panels)+1),height+56),'#f5f1ea');d=ImageDraw.Draw(frame);x=12
 for label,im in panels:d.text((x,12),label,fill='#302b26',font=font);frame.paste(im,(x,44));x+=im.width+12
 frame.save(out/name)
for view,label in [('front','FRONT'),('threequarter','3/4'),('side','SIDE / inferred')]:
 arrange('original-r5-r6-'+view+'-head480.png',[
  ('ORIGINAL / 3/4, pose differs',original,(1206,678,1512,966)),
  ('R5 / '+label,before/('grayform-'+view+'.png'),(170,4,550,330)),
  ('R6 / '+label,out/('grayform-'+view+'.png'),(170,4,550,330))])
 arrange('r5-r6-'+view+'-body-same-scale480.png',[
  ('R5 / identity gate FAIL',before/('grayform-'+view+'.png'),(0,0,720,900)),
  ('R6 / hair candidate',out/('grayform-'+view+'.png'),(0,0,720,900))])
arrange('original-game-normal-shop480.png',[
 ('EXACT ORIGINAL / left shop',original,(0,0,1184,1024)),
 ('ACTUAL NORMAL / R6 grayform',out/'grayform-game-normal.png',(105,75,1190,800))])
arrange('r5-r6-normal-shop480.png',[
 ('R5 / actual normal',before/'grayform-game-normal.png',(105,75,1190,800)),
 ('R6 / actual normal',out/'grayform-game-normal.png',(105,75,1190,800))])
arrange('grayform-four-views480.png',[(label,out/('grayform-'+view+'.png'),(100,4,620,850))for label,view in [('FRONT / canonical only','front'),('SIDE / inferred','side'),('BACK / inferred','back'),('3/4 / canonical only','threequarter')]])
