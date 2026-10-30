"""Honest side-by-side original pixels and actual Blender renders."""
from PIL import Image,ImageDraw,ImageFont,ImageChops,ImageStat
from pathlib import Path
import json,hashlib
ROOT=Path(__file__).resolve().parents[2];O=ROOT/'docs/reviews/evidence/anime-lookdev-v5'
F='C:/Windows/Fonts/arial.ttf'
def font(n):return ImageFont.truetype(F,n)
def fit(im,size):
 im=im.copy();im.thumbnail(size,Image.Resampling.LANCZOS);out=Image.new('RGB',size,'#f4efe6');out.paste(im,((size[0]-im.width)//2,(size[1]-im.height)//2));return out
ref=ROOT/'docs/codex-v4/reference/Approved_Visual_Target_Misaki.png';assert hashlib.sha256(ref.read_bytes()).hexdigest()=='9f855d2ecfd120bb45c001db3fa9b5a3e3b58b2b3c2a4cf9e7ebfda84f8f7114'
crop=Image.open(ref).convert('RGB').crop((1217,680,1508,976))
board=Image.new('RGB',(1920,1250),'#f4efe6');d=ImageDraw.Draw(board)
d.text((25,16),'BUILT-IN ANIME METHOD STUDY / ACTUAL BLENDER EEVEE RENDERS',font=font(30),fill='#493b30')
d.text((25,58),'VISUAL FAIL / not adopted. Toon node execution does not establish target likeness. Native 3D, no projected reference face.',font=font(22),fill='#943f35')
for row,mood in enumerate(('neutral','warm')):
 y=108+row*415
 for col,(title,im)in enumerate([('TARGET / original pixels',crop),('V3 HEAD / same camera and light',Image.open(O/f'v3-control-{mood}-matched.png')),('RESEARCHED / '+mood,Image.open(O/f'researched-study-{mood}-matched.png'))]):
  x=25+col*630;d.text((x,y),title,font=font(23),fill='#493b30');board.paste(fit(im,(600,370)),(x,y+34))
d.text((25,944),'Normal-view-size diagnostic / 200px head-and-shoulder panels, not a game screenshot',font=font(24),fill='#493b30')
for col,(title,im)in enumerate([('TARGET',crop),('V3 CONTROL',Image.open(O/'v3-control-neutral-matched.png')),('RESEARCHED',Image.open(O/'researched-study-neutral-matched.png'))]):
 x=25+col*240;d.text((x,985),title,font=font(18),fill='#493b30');board.paste(fit(im,(200,200)),(x,1015))
for j,line in enumerate(['Verified: EEVEE bands, own UV albedo/iris paint, flat tapered curves, Normal Edit.', 'Unresolved: fitted hair volume, natural layered roots/ends, coherent eyelids/expression.', 'No addon install, GUI brush proof, GLB toon portability or Unity integration.', 'Reference projection is inferred; unseen side/back details remain inferred.']):d.text((770,1000+j*44),line,font=font(20),fill='#75513c')
board.save(O/'anime-method-reference-comparison.png')
sheet=Image.new('RGB',(1920,1330),'#f4efe6');d=ImageDraw.Draw(sheet)
d.text((22,15),'ACTUAL MATCHED FRONT / THREE-QUARTER / PROFILE / EEVEE',font=font(30),fill='#493b30')
d.text((22,57),'Visual FAIL / unaccepted head study. V3 control and study share camera/light for each column; no game integration.',font=font(22),fill='#943f35')
for row,mode in enumerate(('v3-control','researched-study')):
 for col,view in enumerate(('front','three-quarter','profile')):
  x=22+col*630;y=110+row*605;d.text((x,y),mode+' / '+view,font=font(23),fill='#493b30');sheet.paste(fit(Image.open(O/f'{mode}-neutral-{view}.png'),(600,560)),(x,y+33))
sheet.save(O/'anime-method-view-comparison.png')
a=Image.open(O/'researched-study-neutral-matched.png').convert('RGB');b=Image.open(O/'fresh-reopen-neutral-matched.png').convert('RGB');diff=ImageChops.difference(a,b);stats=ImageStat.Stat(diff)
result={'comparisonSource':'Actual labelled 3D Blender renders plus unchanged canonical reference crop','nativeFreshReopenRgb8MeanError':stats.mean,'nativeFreshReopenRgb8MaxError':[e[1]for e in diff.getextrema()],'visualAcceptance':False,'judgment':'Methods execute, but construction and anime target identity still FAIL; do not adopt into v3/game.','provenance':[{ 'file':p.name,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}for p in O.glob('*.png')]}
(O/'comparison-judgment.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf8',newline='\n')
print(json.dumps(result))
