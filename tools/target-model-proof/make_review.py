"""Compose labelled comparisons from actual Blender renders and canonical pixels."""
from PIL import Image,ImageDraw,ImageFont,ImageChops,ImageStat
from pathlib import Path
import json,hashlib,math
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'docs/reviews/evidence/target-model-proof-v1'
FONT=Path('C:/Windows/Fonts/arial.ttf')
def font(n):return ImageFont.truetype(str(FONT),n)
def fitted(image,size):
    scale=min(size[0]/image.width,size[1]/image.height)
    image=image.resize((round(image.width*scale),round(image.height*scale)),Image.Resampling.LANCZOS)
    canvas=Image.new('RGB',size,'#f4efe5')
    canvas.paste(image,((size[0]-image.width)//2,(size[1]-image.height)//2))
    return canvas
reference=Image.open(ROOT/'docs/codex-v4/reference/Approved_Visual_Target_Misaki.png').convert('RGB')
portrait=Image.open(OUT/'blender-model-character-v1.png').convert('RGB')
assembly=Image.open(OUT/'blender-model-assembly-v1.png').convert('RGB')
face=Image.open(OUT/'blender-model-face-v1.png').convert('RGB')
front=Image.open(OUT/'blender-model-front-v1.png').convert('RGB')
board=Image.new('RGB',(1800,1160),'#f4efe5');d=ImageDraw.Draw(board)
d.text((28,15),'APPROVED TARGET vs ACTUAL BLENDER MODEL PROOF v1',font=font(32),fill='#493b30')
d.text((28,59),'Art likeness NOT accepted. Editable 3D source; no game integration. Unknown side/back and pose are inferred.',font=font(22),fill='#7b4c34')
panels=[(28,'TARGET / original pixels',reference.crop((1217,76,1480,660)),(400,890)),
        (452,'BLENDER / full character',portrait.crop((255,50,785,1245)),(400,890))]
for x,title,im,size in panels:
    d.text((x,112),title,font=font(24),fill='#493b30');board.paste(fitted(im,size),(x,155))
d.text((884,112),'BLENDER / complete character + display',font=font(24),fill='#493b30')
board.paste(fitted(assembly,(886,590)),(884,155))
d.text((884,770),'Remaining mismatches',font=font(27),fill='#493b30')
for i,line in enumerate(['Hair still reads as broad solid panels; lacks layered turns.',
                         'Face/eyes, hands and sleeves remain simplified.',
                         'Fabric folds, shoes and material response need work.',
                         'This is a representative display, not the entire shop.']):
    d.text((884,817+i*43),line,font=font(23),fill='#6d5747')
d.text((28,1090),'Native Blender Cycles renders; reference crop is unchanged. No AI-painted replacement or game screenshot.',font=font(24),fill='#493b30')
board.save(OUT/'reference-model-comparison-v1.png')
close=Image.new('RGB',(1800,790),'#f4efe5');d=ImageDraw.Draw(close)
for x,title,im in [(20,'TARGET / original portrait',reference.crop((1217,680,1508,976))),
                   (620,'BLENDER / same source, 3/4',face),(1220,'BLENDER / same source, front',front)]:
    d.text((x,25),title,font=font(25),fill='#493b30');close.paste(fitted(im,(560,630)),(x,85))
d.text((20,745),'UNACCEPTED model study. Lighting and pose differ from reference; side/back details are inferred.',font=font(24),fill='#7b4c34')
close.save(OUT/'reference-face-comparison-v1.png')
native=Image.open(OUT/'blender-model-assembly-v1.png').convert('RGB')
portable=Image.open(OUT/'blender-model-glb-roundtrip-v1.png').convert('RGB')
assert native.size==portable.size
diff=ImageChops.difference(native,portable);stats=ImageStat.Stat(diff)
pixel_report={'scope':'Same saved scene camera/lights, Cycles CPU 64spp seed0, native vs GLB reimport',
  'nativeSha256':hashlib.sha256((OUT/'blender-model-assembly-v1.png').read_bytes()).hexdigest(),
  'glbReimportSha256':hashlib.sha256((OUT/'blender-model-glb-roundtrip-v1.png').read_bytes()).hexdigest(),
  'meanAbsoluteErrorRGB8':stats.mean,'rmsErrorRGB8':stats.rms,
  'limits':'Not an artistic acceptance score. glTF approximates Blender shading and skin SSS.'}
(OUT/'render-comparison-metrics.json').write_text(json.dumps(pixel_report,indent=2)+'\n',encoding='utf8')
print(json.dumps(pixel_report))
