"""Original celadon pigment / restrained kiln roughness inputs, not a scene image.
UV0 is theta around vessel / physical height divided by0.40m. No stock photo.
"""
from pathlib import Path
import numpy as np
from PIL import Image
import hashlib,json
root=Path(__file__).resolve().parents[1];n=512
y,x=np.mgrid[0:n,0:n]/n;u=x*2*np.pi;v=y*2*np.pi
broad=(np.sin(3*u+.55*np.sin(v))+np.sin(7*u-2*v+.6*np.sin(3*v))*.32+np.cos(2*u+3*v)*.38)/1.7
flow=np.sin(v*4+.24*np.sin(u*3)+.15*np.sin(u*7))*.55+np.cos(v*7-u*2)*.18
pigment=np.clip(.946+.029*broad+.017*flow,0,1)
# Greyscale reflectance variation keeps the authored celadon dye recognisable.
albedo=np.stack([pigment*.994,pigment,pigment*.985],axis=-1)
roughness=np.clip(.81+.09*broad-.035*flow,.66,.97)
h=np.sin(5*u+v)*.00017+np.sin(9*u-4*v)*.00008
# At native scale this is a faint fired-surface ripple, not a coarse woven bump.
gy,gx=np.gradient(h,n**-1,n**-1);normal=np.stack([-gx*.4,-gy*.4,np.ones_like(x)],axis=-1);normal/=np.linalg.norm(normal,axis=-1,keepdims=True)
orm=np.stack([np.ones_like(x),roughness,np.zeros_like(x)],axis=-1)
files={}
for suffix,data in [('albedo',albedo),('normal',normal*.5+.5),('orm',orm)]:
 name='celadon-'+suffix+'.png';dest=root/'assets/masters/native-v11'/name;Image.fromarray(np.rint(np.clip(data,0,1)*255).astype('uint8')).save(dest)
 (root/'public/assets/native-v11'/name).write_bytes(dest.read_bytes());files[name]=hashlib.sha256(dest.read_bytes()).hexdigest()
(root/'assets/authoring/native-v11/celadon-provenance.json').write_text(json.dumps({'source':'tools/paint-v11-celadon.py','generation':'Original deterministic mathematical pigment flow and kiln-roughness field; not generated concept art, scene screenshot or third-party material','size':[n,n],'uv':'Theta U and physical height/0.40m V, one repeat; RGBD room reflection is independent','roughnessFactor':.42,'roughnessRange':[float(roughness.min()*.42),float(roughness.max()*.42)],'normalScale':.06,'files':files},indent=2)+'\n')
