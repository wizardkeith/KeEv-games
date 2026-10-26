"""C31 original UV form/value design, not a rendered scene or shadow decal.
Broad warm lit planes/cool shaded planes; all current 3D lighting remains active.
No inventory sample, camera, screen coordinate, contact or sale input.
"""
from pathlib import Path
from PIL import Image
import math,json,hashlib
root=Path(__file__).resolve().parents[1];d=root/'assets/masters/native-v11';public=root/'public/assets/native-v11';files={}
def save(name,im):
 im.save(d/name);(public/name).write_bytes((d/name).read_bytes());files[name]={'sha256':hashlib.sha256((d/name).read_bytes()).hexdigest(),'dimensions':im.size}
# V is an authored upper/underside zone on each actual closed flower, independent
# of camera. The underside stays a supporting cool plane, not a black outline.
im=Image.new('RGB',(128,128))
for y in range(128):
 v=y/127;t=max(0,min(1,(v-.25)/.7));t=t*t*(3-2*t)
 for x in range(128):
  u=x/127;lit=(252,244,225);shade=(166,179,164);radial=1-.035*abs(u-.5)*2;im.putpixel((x,y),tuple(round((lit[k]*(1-t)+shade[k]*t)*radial)for k in range(3)))
save('petal-form-values-c31.png',im)
im=Image.new('RGB',(512,512))
for y in range(512):
 v=y/511;turn=max(0,min(1,(v-.73)/.18));turn=turn*turn*(3-2*turn)
 for x in range(512):
  u=x/511;trough=.20*math.exp(-((u-.24)/.10)**2)+.15*math.exp(-((u-.70)/.13)**2);crest=.055*math.exp(-((u-.43)/.18)**2);form=.94+(crest-trough)*(.25+.75*turn)-.06*turn;shadow=max(0,min(1,trough*3+turn*.17));tint=[1-.06*shadow,.975-.015*shadow,.93+.07*shadow];weave=1+.004*math.sin(x*math.pi/2)*math.sin(y*math.pi/2)
  im.putpixel((x,y),tuple(round(max(0,min(255,255*form*tint[k]*weave)))for k in range(3)))
save('linen-form-values-c31.png',im)
(root/'assets/authoring/native-v11/form-values-c31.json').write_text(json.dumps({'source':'tools/paint-v11-form-values.py','sourceSHA256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),'type':'Original object-UV form/value albedo design, no baked inventory/contact shadow, normal/specular/lighting retained','flowerUV':'Upper corolla V.08-.32 /cool supporting underside V.78-.97, not view-dependent','linenUV':'Existing physical width/arclength; two broad shaded turn planes, top commodity support unchanged','files':files,'limits':'C31 controlled2x2 normal-scale/orbit visual gate pending, no target acceptance'},indent=2)+'\n')
print(files)
