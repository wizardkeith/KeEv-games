"""Original analytic paint layers for UV-authored 3D skin/eyes, not target pixels.
No illustration is projected into the scene; normal 3D shading remains active.
"""
from PIL import Image
from pathlib import Path
import math, shutil, json, hashlib
root=Path(__file__).resolve().parents[1];out=root/'assets/masters/native-v11';out.mkdir(parents=True,exist_ok=True)
def gauss(x,y,cx,cy,sx,sy):return math.exp(-((x-cx)/sx)**2-((y-cy)/sy)**2)
im=Image.new('RGB',(512,512));p=im.load()
for y in range(512):
 for x in range(512):
  # UV v is bottom-up. Broad cheek and lip colour follows the actual head UV.
  u=x/511;v=1-y/511;blush=gauss(u,v,.23,.31,.115,.078)+gauss(u,v,.77,.31,.115,.078);nose=gauss(u,v,.5,.35,.045,.075);lip=gauss(u,v,.5,.20,.075,.036)
  base=[250,217,192];t=.32*blush+.09*nose+.12*lip;warm=[227,126,119]
  p[x,y]=tuple(round(base[k]*(1-t)+warm[k]*t) for k in range(3))
im.save(out/'misaki-skin.png')
im=Image.new('RGB',(512,512));p=im.load()
for y in range(512):
 for x in range(512):
  u=(x/511-.5)*2;v=(1-y/511-.5)*2;r=math.hypot(u/.75,v/.98);a=math.atan2(v,u);color=[250,241,224]
  if r<1:
   edge=max(0,(r-.77)/.23);shade=.5+.5*v;fiber=(math.sin(a*74+r*11)+math.sin(a*113-r*7))*.5
   color=[143+39*(1-shade)+fiber*7,91+32*(1-shade)+fiber*5,47+24*(1-shade)+fiber*3]
   color=[c*(1-.66*edge) for c in color]
   if math.hypot(u/.38,(v-.04)/.56)<1:color=[55,34,25]
   for cx,cy,rx,ry in [(-.25,.40,.125,.17),(.26,-.40,.055,.065)]:
    if ((u-cx)/rx)**2+((v-cy)/ry)**2<1:color=[255,250,233]
  p[x,y]=tuple(max(0,min(255,round(c))) for c in color)
im.save(out/'misaki-eyes.png')
web=root/'public/assets/native-v11';web.mkdir(parents=True,exist_ok=True)
for name in ('misaki-skin.png','misaki-eyes.png'):shutil.copyfile(out/name,web/name)
(root/'assets/authoring/native-v11/paint-provenance.json').write_text(json.dumps({'source':'tools/paint-v11-face.py','method':'Original mathematical UV paint, no borrowed face/target pixels','files':{n:hashlib.sha256((out/n).read_bytes()).hexdigest() for n in ('misaki-skin.png','misaki-eyes.png')}},indent=2)+'\n')
