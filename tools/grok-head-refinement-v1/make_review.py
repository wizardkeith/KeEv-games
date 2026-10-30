from PIL import Image,ImageDraw,ImageFont,ImageChops,ImageStat
from pathlib import Path
import hashlib,json
R=Path(__file__).resolve().parents[2];O=R/'docs/reviews/evidence/grok-head-refinement-v1';ref=R/'docs/codex-v4/reference/Approved_Visual_Target_Misaki.png';assert hashlib.sha256(ref.read_bytes()).hexdigest()=='9f855d2ecfd120bb45c001db3fa9b5a3e3b58b2b3c2a4cf9e7ebfda84f8f7114';target=Image.open(ref).convert('RGB').crop((1217,680,1508,976))
def font(n):return ImageFont.truetype('C:/Windows/Fonts/arial.ttf',n)
def fit(im,size):
 im=im.convert('RGB');im.thumbnail(size,Image.Resampling.LANCZOS);out=Image.new('RGB',size,'#f4efe6');out.paste(im,((size[0]-im.width)//2,(size[1]-im.height)//2));return out
board=Image.new('RGB',(2100,1320),'#f4efe6');d=ImageDraw.Draw(board);d.text((24,16),'USER-SUPPLIED GROK FOUNDATION / CONSERVATIVE HEAD MATERIAL STUDY',font=font(29),fill='#493b30');d.text((24,60),'Original foundation retained. Geometry attempt rejected. Material-only fallback is UNACCEPTED; no game integration.',font=font(24),fill='#8d4636')
for row,(mood,view)in enumerate([('neutral','front'),('warm','three-quarter')]):
 y=112+row*470
 for col,(label,im)in enumerate([('TARGET / original pixels',target),('ORIGINAL / '+mood+' / '+view,Image.open(O/f'before-{mood}-{view}.png')),('MATERIAL FALLBACK / '+mood,Image.open(O/f'fallback-{mood}-{view}.png'))]):
  x=24+col*690;d.text((x,y),label,font=font(23),fill='#493b30');board.paste(fit(im,(660,420)),(x,y+36))
d.text((24,1070),'200px head-and-shoulders proxy / actual Blender renders, not gameplay screenshots',font=font(24),fill='#493b30')
for col,im in enumerate([target,Image.open(O/'before-neutral-front.png'),Image.open(O/'fallback-neutral-front.png')]):board.paste(fit(im,(200,200)),(24+col*230,1110))
for j,line in enumerate(['All original vertex coordinates and deformation weights retained.', 'Only face colour/shadow response and iris detail remain as optional lookdev.', 'Helmet hair, rigid features/clothes and target likeness remain unresolved.', 'No new portable toon export or Unity/runtime acceptance.']):d.text((760,1120+j*43),line,font=font(23),fill='#75513c')
board.save(O/'grok-original-vs-material-fallback.png')
fail=Image.new('RGB',(1800,780),'#f4efe6');d=ImageDraw.Draw(fail);d.text((20,14),'REJECTED GEOMETRY ATTEMPT / DO NOT ADOPT',font=font(31),fill='#943f35')
for col,(name,label)in enumerate([('before-neutral-front.png','Original candidate'),('after-neutral-front.png','Rejected hair / sclera attempt'),('fallback-neutral-front.png','Original geometry restored')]):
 x=20+col*595;d.text((x,68),label,font=font(23),fill='#493b30');fail.paste(fit(Image.open(O/name),(570,630)),(x,106))
d.text((20,744),'Hair root intersections and exposed bulging eye shells worsened the candidate; preserve original geometry.',font=font(23),fill='#943f35');fail.save(O/'rejected-head-geometry-comparison.png')
views=Image.new('RGB',(1800,820),'#f4efe6');d=ImageDraw.Draw(views);d.text((20,15),'ORIGINAL GEOMETRY / MATERIAL FALLBACK / ACTUAL EEVEE',font=font(29),fill='#493b30')
for col,view in enumerate(('front','three-quarter','profile')):
 x=20+col*595;d.text((x,68),view+' / unaccepted',font=font(23),fill='#493b30');views.paste(fit(Image.open(O/f'fallback-neutral-{view}.png'),(570,690)),(x,105))
views.save(O/'material-fallback-view-sheet.png')
a=Image.open(O/'fallback-neutral-three-quarter.png').convert('RGB');b=Image.open(O/'fallback-fresh-reopen-three-quarter.png').convert('RGB');delta=ImageChops.difference(a,b);s=ImageStat.Stat(delta)
judgment={'geometryAttempt':'FAIL; rejected, original retained','materialFallback':'Small face colour/iris-detail study only, unaccepted; not a solution to Japanese-anime target likeness','newHairImprovementClaim':False,'newArtAccepted':False,'freshReopenRgb8MeanDelta':s.mean,'freshReopenRgb8MaxDelta':[e[1]for e in delta.getextrema()],'referenceProjection':'Inferred; model before/after share exact cameras and lights for each view','gameplayCapture':False,'files':[{'file':p.name,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}for p in O.glob('*.png')]}
(O/'visual-judgment.json').write_text(json.dumps(judgment,indent=2)+'\n',encoding='utf8',newline='\n');print(json.dumps({k:v for k,v in judgment.items()if k!='files'}))
