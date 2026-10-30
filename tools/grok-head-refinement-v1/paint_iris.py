from pathlib import Path
from PIL import Image
import math,hashlib,json
R=Path(__file__).resolve().parents[2];A=R/'assets/authoring/grok-head-refinement-v1';A.mkdir(parents=True,exist_ok=True)
im=Image.new('RGB',(512,512));p=im.load()
def c(h):return tuple(int(h[i:i+2],16)for i in(1,3,5))
def mix(a,b,t):return tuple(round(x*(1-t)+y*t)for x,y in zip(a,b))
for y in range(512):
 for x in range(512):
  u=(x+.5)/256-1;v=1-(y+.5)/256;r=math.hypot(u,v);a=math.atan2(v,u)
  t=max(0,min(1,(.9-v)/1.8));colour=mix(c('#553225'),c('#BE9160'),t*.78+.03*math.sin(18*a+8*r))
  colour=mix(colour,c('#43291F'),max(0,min(1,(r-.80)/.17))*.7)
  pupil=(u/.36)**2+((v-.06)/.62)**2
  if pupil<1:colour=mix(c('#2E211C'),colour,max(0,min(1,(pupil-.82)/.18)))
  p[x,y]=colour
path=A/'own-painted-iris.png';im.save(path)
(A/'iris-provenance.json').write_text(json.dumps({'method':'Own generated iris colour painting, no reference pixels sampled/projected; existing geometric glints retained','sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'size':[512,512]},indent=2)+'\n',encoding='utf8',newline='\n')
