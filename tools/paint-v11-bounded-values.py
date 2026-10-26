"""C34 adapts the existing C31 object-UV atlas and display-linen albedo pipeline.
Original form-value authorship, no reference-image pixels or rendered shadows.
"""
from pathlib import Path
from PIL import Image
import math,json,hashlib
root=Path(__file__).resolve().parents[1];out=root/'assets/masters/native-v11';public=root/'public/assets/native-v11';files={}
def save(name,im):
 im.save(out/name);(public/name).write_bytes((out/name).read_bytes());files[name]={'sha256':hashlib.sha256((out/name).read_bytes()).hexdigest(),'size':im.size}
def smooth(x):x=max(0,min(1,x));return x*x*(3-2*x)
im=Image.new('RGB',(128,128),'white')
for y in range(128):
 v=y/127;t=smooth((v-.12)/.78)
 for x in range(104):
  u=x/103;shade=(174,185,175);lit=(255,250,236);rounding=1-.035*math.cos(u*2*math.pi)
  im.putpixel((x,y),tuple(round(min(255,(shade[k]*(1-t)+lit[k]*t)*rounding))for k in range(3)))
save('petal-form-values-c34.png',im)
base=Image.open(out/'display-linen-albedo.png').convert('RGB');im=base.copy();w,h=im.size
for y in range(h):
 v=y/(h-1);turn=smooth((v-.56)/.32)
 for x in range(w):
  u=x/(w-1);trough=.18*math.exp(-((u-.20)/.115)**2)+.14*math.exp(-((u-.72)/.14)**2);crest=.055*math.exp(-((u-.44)/.20)**2)
  form=1+crest*(.3+.7*turn)-trough*(.20+.80*turn)-.055*turn
  cool=smooth(trough*3+turn*.12);tint=(1-.07*cool,1-.025*cool,1+.025*cool)
  im.putpixel((x,y),tuple(round(max(0,min(255,base.getpixel((x,y))[k]*form*tint[k])))for k in range(3)))
save('linen-form-values-c34.png',im)
(root/'assets/authoring/native-v11/bounded-values-c34.json').write_text(json.dumps({'source':'tools/paint-v11-bounded-values.py','sourceSHA256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),'pipeline':'Existing C31 object-UV atlas + display-linen albedo/normal/ORM finish; original inputs retained','flower':'Existing longitude/ring UV compressed into atlasU.02-.78; original matching surfaces neutral-white U.95, no new material group','linen':'Existing physical width/arclength UV, broad unequal20/72percent folds. No owned-stock or contact shadow baked','geometry':'C33flower/C32cloth unmodified','files':files,'acceptance':'Actual normal/two-oblique material gate pending'},indent=2)+'\n');print(files)
