"""Original repeatable PBR wardrobe inputs, not borrowed/reference pixels.
Albedo sRGB; OpenGL tangent normal and ORM linear. Editable analytical source.
"""
from PIL import Image
from pathlib import Path
import math,json,hashlib,shutil
root=Path(__file__).resolve().parents[1];dest=root/'assets/masters/native-v11';web=root/'public/assets/native-v11';tau=math.tau;size=512;records={}
def broad(u,v):return .6*math.sin(tau*(2*u+3*v))+.4*math.cos(tau*(5*u-2*v))
def height(style,u,v):
 if style=='knit':
  row=v*24;phase=row-math.floor(row)-.5;stagger=.5*(math.floor(row)%2)
  return .22*math.cos(tau*(u*24+stagger)+abs(phase)*2.6)*math.cos(phase*math.pi)**2+.065*broad(u,v)
 if style=='linen':return .14*math.sin(u*tau*48)*math.cos(v*tau*48)+.045*broad(u,v)
 if style=='canvas':return .20*math.sin(u*tau*32)*math.cos(v*tau*32)+.065*broad(u,v)
 return .13*math.sin(tau*(u*53+v*47))+.10*math.cos(tau*(u*71-v*59))+.035*broad(u,v)
for style in ['knit','linen','canvas','leather']:
 images=[Image.new('RGB',(size,size))for _ in range(3)];pixels=[im.load()for im in images]
 for y in range(size):
  for x in range(size):
   u=x/size;v=y/size;h=height(style,u,v);low=broad(u,v);tone=(252 if style=='linen' else 250 if style=='knit' else 246)+(2 if style=='linen' else 4 if style=='knit' else 6)*low+2*h
   pixels[0][x,y]=tuple(max(0,min(255,round(tone-k)))for k in [0,0,1])
   dx=(height(style,u+1/size,v)-height(style,u-1/size,v))*3;dy=(height(style,u,v+1/size)-height(style,u,v-1/size))*3;n=math.sqrt(dx*dx+dy*dy+1)
   pixels[1][x,y]=tuple(round(127.5+127.5*q/n)for q in [-dx,-dy,1])
   rough=(.86 if style=='knit' else .95 if style=='linen' else .96 if style=='canvas' else .84)+(.012 if style=='linen'else .025)*low
   pixels[2][x,y]=(255,round(255*max(0,min(1,rough))),0)
 for suffix,im in zip(['albedo','normal','orm'],images):
  name=f'{style}-{suffix}.png';im.save(dest/name);shutil.copyfile(dest/name,web/name);records[name]={'sha256':hashlib.sha256((dest/name).read_bytes()).hexdigest(),'encoding':'sRGB'if suffix=='albedo'else'linear','size':[size,size]}
(root/'assets/authoring/native-v11/fabric-provenance.json').write_text(json.dumps({'source':'tools/paint-v11-fabrics.py','rights':'Original analytical KeEv wardrobe inputs; no external/reference pixels','files':records},indent=2)+'\n')
print(json.dumps({'textures':len(records),'styles':4}))
