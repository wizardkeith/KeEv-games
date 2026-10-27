"""Original restrained oak grain PBR data; no scene photograph/reference pixels."""
from pathlib import Path
import numpy as np
from PIL import Image
import json,hashlib
root=Path(__file__).resolve().parents[1];n=512;y,x=np.mgrid[0:n,0:n]/n
phase=x*2*np.pi*18+.28*np.sin(y*2*np.pi*2)+.16*np.sin(y*2*np.pi*5+x*2*np.pi*2)
grain=.5*np.sin(phase)+.25*np.sin(phase*2)+.10*np.sin(x*2*np.pi*103+y*2*np.pi)
albedo=np.stack([.96+.021*grain,.958+.023*grain,.951+.026*grain],-1)
h=.018*grain;dy,dx=np.gradient(h);normal=np.stack([-dx*2,-dy*2,np.ones_like(x)],-1);normal/=np.linalg.norm(normal,axis=-1,keepdims=True)
orm=np.stack([np.ones_like(x),.95+.018*grain,np.zeros_like(x)],-1);files={}
for suffix,data in [('albedo',albedo),('normal',normal*.5+.5),('orm',orm)]:
 name='oak-floor-'+suffix+'.png';p=root/'assets/masters/native-v11'/name;Image.fromarray(np.rint(np.clip(data,0,1)*255).astype('uint8')).save(p);(root/'public/assets/native-v11'/name).write_bytes(p.read_bytes());files[name]=hashlib.sha256(p.read_bytes()).hexdigest()
(root/'assets/authoring/native-v11/oak-floor-provenance.json').write_text(json.dumps({'source':'tools/paint-v11-oak-floor.py','method':'Original deterministic low contrast longitudinal wood pigment, normal and ORM. Actual separate narrow plank meshes provide staggered joints and bevels. Original target used only for visual direction; no target pixels in texture.','size':[n,n],'repeat':1,'normalScale':.06,'roughnessFactor':.83,'files':files},indent=2)+'\n')
