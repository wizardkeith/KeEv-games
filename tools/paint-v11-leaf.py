"""Original painted broadleaf vein albedo; colour is a multiplier on authored greens."""
from PIL import Image
from pathlib import Path
import math,shutil
root=Path(__file__).resolve().parents[1];im=Image.new('RGB',(512,512));p=im.load()
for y in range(512):
 for x in range(512):
  u=x/511*2-1;t=y/511;vein=math.exp(-(u/.021)**2)*.08
  branch=abs((t-.34*abs(u))*11-round((t-.34*abs(u))*11));vein+=math.exp(-(branch/.055)**2)*.035*(1-abs(u)*.5)
  v=.91+.065*(1-u*u)+vein-.035*abs(u)**2;v=max(.82,min(1,v));p[x,y]=tuple(round(255*v*k) for k in (1,1,.98))
out=root/'assets/masters/native-v11/broadleaf-albedo.png';im.save(out);shutil.copyfile(out,root/'public/assets/native-v11/broadleaf-albedo.png')
