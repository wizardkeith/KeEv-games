"""Crop/scale/label actual R3/R4 frames only; no colour or geometry edits."""
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
root=Path(__file__).resolve().parents[2]
out=root/'docs/reviews/evidence/asset-foundation-v1-r4';old=root/'docs/reviews/evidence/asset-foundation-v1-r3'
font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',17)
def row(items,name,height,crop=None):
 frames=[]
 for label,path,box in items:
  im=Image.open(path).convert('RGB')
  if box:im=im.crop(box)
  im=im.resize((round(im.width*height/im.height),height),Image.Resampling.LANCZOS);frames.append((label,im))
 image=Image.new('RGB',(sum(im.width for _,im in frames)+12*(len(frames)+1),height+56),'#f5f1ea');draw=ImageDraw.Draw(image);x=12
 for label,im in frames:draw.text((x,12),label,font=font,fill='#302b26');image.paste(im,(x,44));x+=im.width+12
 image.save(out/name)
scene=(105,75,1190,800)
row([('EXACT ORIGINAL • left shop',root/'docs/codex-v4/reference/Approved_Visual_Target_Misaki.png',(0,0,1184,1024)),('R3 • STYLE FAIL',old/'material-normal-game.png',scene),('R4 • SHAPE CANDIDATE',out/'material-normal-game.png',scene)],'target-r3-r4-normal480.png',480)
row([('R3 • gray / matched lights',old/'gray-normal-game.png',scene),('R4 • gray / matched lights',out/'gray-normal-game.png',scene)],'r3-r4-gray-normal480.png',480)
for angle in ['oblique-left','oblique-right']:
 row([('R3 • '+angle,old/('material-'+angle+'.png'),None),('R4 • '+angle,out/('material-'+angle+'.png'),None)],'r3-r4-'+angle+'.png',600)
row([('R3 • fixed geometry reading',old/'fixed-light-gray.png',None),('R4 • SAME LIGHTS / shapes only',out/'fixed-light-gray.png',None)],'r3-r4-fixed-gray.png',600)
