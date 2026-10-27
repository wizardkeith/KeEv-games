"""Original seamless crossing-rattan PBR inputs, not a scene image/photo."""
from pathlib import Path
import numpy as np
from PIL import Image
import hashlib,json
root=Path(__file__).resolve().parents[1];n=512;y,x=np.mgrid[0:n,0:n]/n;u=x*8;v=y*8;i=np.floor(u).astype(int);j=np.floor(v).astype(int);a=u%1-.5;b=v%1-.5
warp=np.clip((.40-np.abs(a))/.07,0,1);weft=np.clip((.40-np.abs(b))/.07,0,1);over=(i+j)%2==0
h=np.maximum(warp*(.30+.35*over),weft*(.30+.35*~over));height=h+.025*np.sin(x*np.pi*64)+.012*np.sin(y*np.pi*96)
colour=np.clip(.76+.19*np.maximum(warp,weft)+.025*np.sin((i+j)*2.4)+.012*np.cos(x*np.pi*112+y*np.pi*32),0,1)
albedo=np.stack([colour,colour*.987,colour*.963],-1);gy,gx=np.gradient(height);normal=np.stack([-gx*2.5,-gy*2.5,np.ones_like(x)],-1);normal/=np.linalg.norm(normal,axis=-1,keepdims=True)
roughness=np.clip(.90+.055*np.sin(x*np.pi*16+y*np.pi*16)-.035*h,.78,.98);orm=np.stack([np.ones_like(x),roughness,np.zeros_like(x)],-1);files={}
for suffix,data in [('albedo',albedo),('normal',normal*.5+.5),('orm',orm)]:
 name='wicker-'+suffix+'.png';p=root/'assets/masters/native-v11'/name;Image.fromarray(np.rint(np.clip(data,0,1)*255).astype('uint8')).save(p);(root/'public/assets/native-v11'/name).write_bytes(p.read_bytes());files[name]=hashlib.sha256(p.read_bytes()).hexdigest()
(root/'assets/authoring/native-v11/wicker-provenance.json').write_text(json.dumps({'source':'tools/paint-v11-wicker.py','method':'Original deterministic8x8 interlaced fibre pigment/normal/ORM, not a photograph or scene image. Broad stakes/bands are actual3D geometry; small fibre crossing is PBR data','size':[n,n],'repeat':4,'normalScale':.12,'roughnessFactor':.89,'files':files},indent=2)+'\n')
