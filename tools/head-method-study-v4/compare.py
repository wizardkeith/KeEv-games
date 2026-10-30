"""Unretouched failed-study evidence, including same-camera and 200px views."""
from PIL import Image,ImageDraw,ImageFont
from pathlib import Path
import hashlib,json
ROOT=Path(__file__).resolve().parents[2];OUT=ROOT/'docs/reviews/evidence/head-method-study-v4'
ref=Image.open(ROOT/'docs/codex-v4/reference/Approved_Visual_Target_Misaki.png').convert('RGB').crop((1217,680,1508,976))
control=Image.open(OUT/'v3-head-control.png').convert('RGB')
study=Image.open(OUT/'new-head-matched.png').convert('RGB')
def fit(im,size):
 s=min(size[0]/im.width,size[1]/im.height);im=im.resize((round(im.width*s),round(im.height*s)),Image.Resampling.LANCZOS);p=Image.new('RGB',size,'#f4eee4');p.paste(im,((size[0]-im.width)//2,(size[1]-im.height)//2));return p
font=lambda n:ImageFont.truetype('C:/Windows/Fonts/arial.ttf',n)
board=Image.new('RGB',(1950,1120),'#f4eee4');d=ImageDraw.Draw(board)
d.text((20,15),'FAILED HEAD METHOD STUDY / NOT ADOPTED AS AN ASSET',font=font(33),fill='#713d2d')
d.text((20,60),'Same inferred camera/light for model views. Real BMesh/socket head and 7x7 NURBS hair; no reference-image projection.',font=font(22),fill='#4b3a2c')
for x,title,im in [(20,'CANONICAL TARGET / original pixels',ref),(670,'PRESERVED V3 / head control',control),(1320,'NEW METHOD / rejected study',study)]:
 d.text((x,108),title,font=font(25),fill='#4b3a2c');board.paste(fit(im,(610,610)),(x,155))
 board.paste(fit(im,(200,200)),(x+205,790));d.text((x+184,1004),'200px normal-size view',font=font(21),fill='#4b3a2c')
d.text((20,1060),'Thinner ends are executable; scalp seams, eye/face construction and target identity remain inadequate. Evidence only; v3 unchanged.',font=font(23),fill='#713d2d')
board.save(OUT/'local-head-method-comparison.png')
result={'judgment':'VISUAL FAIL; not adopted or full-body integrated','technical':'BMesh vertex sculpt/open sockets and native NURBS controls executed; interactive brush stroke unavailable in background context',
 'failures':['Cap/sheet joins and sharp scalp boundary remain artificial','Eye integration/expression and facial identity do not match reference','Thin tapered ends alone do not establish target-style hair'],
 'studySource':'assets/authoring/head-method-study-v4/head-method-study.blend',
 'studySourceSha256':hashlib.sha256((ROOT/'assets/authoring/head-method-study-v4/head-method-study.blend').read_bytes()).hexdigest(),
 'v3SourceUnchangedSha256':hashlib.sha256((ROOT/'assets/authoring/target-model-proof-v3/misaki-display-model-proof.blend').read_bytes()).hexdigest(),
 'comparisonSha256':hashlib.sha256((OUT/'local-head-method-comparison.png').read_bytes()).hexdigest(),
 'externalWrites':'Initially local-only. Later explicitly authorized for a failed-evidence Git checkpoint and a distinct Library image; exact delivery results reported separately, not artistic adoption.'}
(OUT/'study-judgment.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf8',newline='\n')
print(json.dumps(result))
