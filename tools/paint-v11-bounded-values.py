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
# Three bounded strips in the existing petal atlas, one shared material.
# Main crown receives warm white; unequal side clusters provide supporting values.
im=Image.new('RGB',(128,128),'white')
palettes=[((205,205,182),(255,251,239)),((174,183,160),(251,245,226)),((153,169,145),(235,238,219))]
for y in range(128):
 v=y/127;t=smooth((v-.10)/.80)
 for cluster,(shade,lit) in enumerate(palettes):
  lo=.02+cluster*.28;hi=lo+.24
  for x in range(max(0,math.floor((lo-.012)*127)),min(128,math.ceil((hi+.012)*127)+1)):
   u=max(0,min(1,(x/127-lo)/.24));rounding=1-.025*math.cos(u*2*math.pi)
   im.putpixel((x,y),tuple(round(min(255,(shade[k]*(1-t)+lit[k]*t)*rounding))for k in range(3)))
save('petal-form-values-c34.png',im)
# Rasterize only the accepted cloth's own normals in its original UVs.
# This is an authored broad form tint, not shadow/AO from any scene objects.
import numpy as np
base=Image.open(out/'display-linen-albedo.png').convert('RGB');w,h=base.size
g=json.loads((out/'display-quality/linen-c32.json').read_text())['geometry'];uv=np.array(g['uvs']).reshape(-1,2);norm=np.array(g['normals']).reshape(-1,3);ids=np.array(g['indices']).reshape(-1,3);field=np.zeros((h,w,3));field[:,:,1]=1;priority=np.full((h,w),-np.inf)
for tri in ids:
 a,b,c=uv[tri];det=(b[0]-a[0])*(c[1]-a[1])-(c[0]-a[0])*(b[1]-a[1])
 if abs(det)<1e-10:continue
 x0=max(0,int(math.floor(min(a[0],b[0],c[0])*(w-1))));x1=min(w-1,int(math.ceil(max(a[0],b[0],c[0])*(w-1))));y0=max(0,int(math.floor(min(a[1],b[1],c[1])*(h-1))));y1=min(h-1,int(math.ceil(max(a[1],b[1],c[1])*(h-1))))
 if x1<x0 or y1<y0:continue
 yy,xx=np.mgrid[y0:y1+1,x0:x1+1];xx=xx/(w-1);yy=yy/(h-1);u=((xx-a[0])*(c[1]-a[1])-(c[0]-a[0])*(yy-a[1]))/det;v=((b[0]-a[0])*(yy-a[1])-(xx-a[0])*(b[1]-a[1]))/det;mask=(u>=-1e-6)&(v>=-1e-6)&(u+v<=1+1e-6)
 n=(1-u-v)[:,:,None]*norm[tri[0]]+u[:,:,None]*norm[tri[1]]+v[:,:,None]*norm[tri[2]];patch=field[y0:y1+1,x0:x1+1];rank=n[:,:,1]-n[:,:,2];best=priority[y0:y1+1,x0:x1+1];mask &= rank>best;patch[mask]=n[mask];best[mask]=rank[mask]
field/=np.maximum(np.linalg.norm(field,axis=2,keepdims=True),1e-8);light=np.array([-.55,.8,-.30]);light/=np.linalg.norm(light);lit=np.clip((field@light+.10)/.95,0,1);form=.61+.48*lit;cool=1-lit;tint=np.stack([1-.08*cool,1-.025*cool,1+.035*cool],axis=2);data=np.array(base).astype(float)*form[:,:,None]*tint;im=Image.fromarray(np.round(np.clip(data,0,255)).astype('uint8'))
save('linen-form-values-c34.png',im)
(root/'assets/authoring/native-v11/bounded-values-c34.json').write_text(json.dumps({'source':'tools/paint-v11-bounded-values.py','sourceSHA256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),'pipeline':'Existing C31 object-UV atlas + display-linen albedo/normal/ORM finish; original inputs retained','flower':'Existing longitude/ring UV in3strips main/side/side; original matching surfaces neutral-white U.95, no new material group','linen':'Existing physical width/arclength UV, broad tone field derived only from accepted cloth surface normals. No scene/inventory/contact shadows baked','geometry':'C33flower/C32cloth unmodified','files':files,'acceptance':'Actual normal/two-oblique material gate pending'},indent=2)+'\n');print(files)
