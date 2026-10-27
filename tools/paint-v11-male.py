"""Original analytical UV skin paint for the independently rebuilt visitor A.
No borrowed/reference pixels; same top-down glTF UV convention as the sculpt.
"""
from pathlib import Path
from PIL import Image
import math,hashlib,json,shutil
root=Path(__file__).resolve().parents[1];out=root/'assets/masters/native-v11';web=root/'public/assets/native-v11';out.mkdir(exist_ok=True);web.mkdir(exist_ok=True)
def g(x,y,cx,cy,sx,sy):return math.exp(-((x-cx)/sx)**2-((y-cy)/sy)**2)
im=Image.new('RGB',(512,512));p=im.load()
for y in range(512):
 for x in range(512):
  u=x/511;v=1-y/511;t=.16*(g(u,v,.23,.31,.115,.078)+g(u,v,.77,.31,.115,.078))+.08*g(u,v,.5,.35,.045,.075)+.08*g(u,v,.5,.20,.075,.036);p[x,y]=tuple(round(a*(1-t)+b*t) for a,b in zip([231,193,162],[208,122,94]))
im.save(out/'visitor-a-skin.png');shutil.copyfile(out/'visitor-a-skin.png',web/'visitor-a-skin.png');(root/'assets/authoring/native-v11/visitor-a-paint-provenance.json').write_text(json.dumps({'source':'tools/paint-v11-male.py','method':'Original analytic UV paint; no face/reference pixels','sha256':hashlib.sha256((out/'visitor-a-skin.png').read_bytes()).hexdigest()},indent=2)+'\n')
