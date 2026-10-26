"""Original physically-scaled central-table material set. Source fields, not
scene images. Albedo carries reflectance ONCE (white material tint); ORM carries
roughness, no painted window shadow or false game information. 512px field masters; generated botanical glaze source retains its original dimensions.
"""
from pathlib import Path
import numpy as np,json,hashlib
from PIL import Image
root=Path(__file__).resolve().parents[1];n=512;y,x=np.mgrid[0:n,0:n]/n;rng=np.random.default_rng(241024);files={}
def write(name,a):
 path=root/'assets/masters/native-v11'/name;Image.fromarray(np.uint8(np.rint(np.clip(a,0,1)*255))).save(path);(root/'public/assets/native-v11'/name).write_bytes(path.read_bytes());files[name]={'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'dimensions':list(Image.open(path).size)}
def maps(finish,albedo,h,rough):
 gy,gx=np.gradient(h,1/n,1/n);normal=np.stack([-gx,-gy,np.ones_like(x)],axis=-1);normal/=np.linalg.norm(normal,axis=-1,keepdims=True)
 for suffix,a in [('albedo',albedo),('normal',normal*.5+.5),('orm',np.stack([np.ones_like(x),rough,np.zeros_like(x)],axis=-1))]:write(finish+'-'+suffix+'.png',a)
# One circumference x physical height. Broad kiln wash and a rough clay foot;
# no directional highlight is baked into albedo. Warm cream body / pale interior.
u=x*2*np.pi;v=y*2*np.pi;wash=(np.sin(u*3+np.sin(v)*.4)+np.sin(u*7-v*2)*.28+np.cos(v*4+u)*.35)/1.63;foot=np.clip((.086-y)*90,0,1);rim=np.exp(-((y-.973)/.03)**2);cream=np.array([.935,.902,.823])[None,None,:]*(.982+.018*wash[...,None]);clay=np.array([.727,.612,.465])[None,None,:]*(.97+.03*np.sin(u*7)[...,None]);a=cream*(1-foot[...,None])+clay*foot[...,None];rough=np.clip(.38+.055*wash+.55*foot-.045*rim,.29,.98);maps('stoneware',a,np.sin(v*29+np.sin(u*2))*.000018,rough)
# The half-metre linen unwrap. Subtle crossing fibres, broad clean ivory, real
# broad folds come from Blender mesh. Texture does not fake drape or AO.
warp=np.sin(x*np.pi*2*240);weft=np.sin(y*np.pi*2*270);grain=rng.normal(0,.0018,(n,n));linen=np.array([.914,.888,.825])[None,None,:]*(.99+.004*warp[...,None]+.004*weft[...,None]+grain[...,None]);border=(np.exp(-((x-.025)/.007)**2)+np.exp(-((x-.975)/.007)**2))*.014;linen-=border[...,None];maps('display-linen',linen,(warp+weft)*.000012,np.clip(.91+.025*warp*weft,.84,.98))
# Width U / actual long board V. Flowing oak growth, light pore ribbons and
# restrained warm reflectance; no black grain painted across every surface.
flow=x+.018*np.sin(y*9+x*8)+.008*np.sin(y*25);growth=np.sin(flow*70)+.30*np.sin(flow*159+y*.8);pore=np.maximum(0,np.cos(flow*260+y*2))**14;value=.985+.018*growth-.018*pore;oak=np.array([.797,.679,.510])[None,None,:]*value[...,None];maps('display-oak',oak,(np.sin(flow*260)*.000008+np.sin(flow*70)*.000015),np.clip(.81+.04*growth+.04*pore,.68,.94))
# Preserve the original generated artwork; the procedural base above remains reproducible.
source=root/'assets/masters/native-v11/display-quality/stoneware-botanical-source.png'
for target in [root/'assets/masters/native-v11/stoneware-albedo.png',root/'public/assets/native-v11/stoneware-albedo.png']:target.write_bytes(source.read_bytes())
files['stoneware-albedo.png']={'sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'dimensions':list(Image.open(source).size),'source':str(source.relative_to(root))}
(root/'assets/authoring/native-v11/display-quality-materials.json').write_text(json.dumps({'source':'tools/paint-v11-display-quality.py','method':'Original explicit roughness/normal and oak/linen fields, original generated restrained botanical glaze albedo. Physically scaled UVs, white surface tint. No scene rendering or reference pixels copied; generated original bytes and provenance retained.','size':[n,n],'finishes':['stoneware','display-linen','display-oak'],'files':files},indent=2)+'\n');print('Wrote9 original multi-channel inputs')
