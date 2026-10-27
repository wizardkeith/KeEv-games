"""Presentation only: crop, proportional scale, arrange and label actual pixels.
Raw PNGs and the exact original remain unmodified. No colour/lighting edits.
"""
from PIL import Image,ImageDraw,ImageFont
from pathlib import Path
import os
root=Path(__file__).resolve().parents[2];out=root/os.environ.get('QA_OUTPUT','docs/reviews/evidence/asset-foundation-v1-r2')
font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',17)
items=[('EXACT ORIGINAL • left shop crop',root/'docs/codex-v4/reference/Approved_Visual_Target_Misaki.png',(0,0,1184,1024)),('ACTUAL GAME • material prototype',out/'material-normal-game.png',(105,75,1190,800)),('ACTUAL GAME • prototype grayform',out/'gray-normal-game.png',(105,75,1190,800))]
images=[]
for label,path,box in items:
 im=Image.open(path).convert('RGB').crop(box);im=im.resize((round(im.width*480/im.height),480),Image.Resampling.LANCZOS);images.append((label,im))
canvas=Image.new('RGB',(sum(im.width for _,im in images)+48,536),'#f5f1ea');d=ImageDraw.Draw(canvas);x=12
for label,im in images:
 d.text((x,12),label,fill='#302b26',font=font);canvas.paste(im,(x,44));x+=im.width+12
canvas.save(out/'target-material-gray-shop480.png')
