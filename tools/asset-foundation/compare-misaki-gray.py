"""Raw-pixel crops/proportional scaling only. Pose/projection differs; no tracing.
Canonical original governs. PlanB was not readable locally in this checkpoint.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
root=Path(__file__).resolve().parents[2]
out=root/'docs/reviews/evidence/misaki-grayform-v1-r2'
font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',16)
def arrange(name,items,height=480):
 panels=[]
 for label,path,box in items:
  im=Image.open(path).convert('RGB').crop(box);im=im.resize((round(im.width*height/im.height),height),Image.Resampling.LANCZOS);panels.append((label,im))
 result=Image.new('RGB',(sum(im.width for _,im in panels)+12*(len(panels)+1),height+56),'#f5f1ea');d=ImageDraw.Draw(result);x=12
 for label,im in panels:d.text((x,12),label,fill='#302b26',font=font);result.paste(im,(x,44));x+=im.width+12
 result.save(out/name)
original=root/'docs/codex-v4/reference/Approved_Visual_Target_Misaki.png'
arrange('original-grayform-proportion480.png',[
 ('ORIGINAL / relaxed',original,(1206,76,1460,654)),
 ('GLB / neutral A-pose',out/'grayform-front.png',(100,4,620,850)),
 ('GLB / 3-quarter',out/'grayform-threequarter.png',(100,4,620,850))])
arrange('original-game-normal-shop480.png',[
 ('EXACT ORIGINAL / left shop',original,(0,0,1184,1024)),
 ('ACTUAL NORMAL / static grayform at front',out/'grayform-game-normal.png',(105,75,1190,800))])
arrange('grayform-four-views480.png',[(label,out/('grayform-'+view+'.png'),(100,4,620,850))for label,view in [('FRONT / canonical only','front'),('SIDE / inferred','side'),('BACK / inferred','back'),('3-QUARTER / canonical only','threequarter')]])
before=root/'docs/reviews/evidence/misaki-grayform-v1'
for view in ['front','threequarter','side']:
 arrange('r1-r2-'+view+'-body-same-scale480.png',[
  ('R1 / independent FAIL',before/('grayform-'+view+'.png'),(0,0,720,900)),
  ('R2 / head-neck candidate',out/('grayform-'+view+'.png'),(0,0,720,900))])
arrange('r1-r2-normal-shop480.png',[
 ('R1 / actual normal',before/'grayform-game-normal.png',(105,75,1190,800)),
 ('R2 / actual normal',out/'grayform-game-normal.png',(105,75,1190,800))])
arrange('original-r1-r2-head480.png',[
 ('ORIGINAL / pose differs',original,(1206,678,1512,1000)),
 ('R1 / same pixel crop',before/'grayform-front.png',(170,4,550,330)),
 ('R2 / same pixel crop',out/'grayform-front.png',(170,4,550,330))])
