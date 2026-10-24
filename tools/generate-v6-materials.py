"""Original procedural base-colour inputs; no photo, concept-image or lighting bake.
Floor has two staggered 0.55m boards per 1.10 x 2.20m repeat. Cloth is a quiet
thread multiplier. Retain lossless masters and generator for future adapters.
"""
import math,pathlib,struct,zlib,hashlib,json
size=512
def chunk(t,d):return struct.pack('!I',len(d))+t+d+struct.pack('!I',zlib.crc32(t+d)&0xffffffff)
records=[]
for name in ['floor-planks','cloth-weave']:
 pixels=bytearray()
 for y in range(size):
  pixels.append(0)
  for x in range(size):
   u=x/size;v=y/size
   if name=='floor-planks':
    phase=.18 if u<.5 else .68
    distance=abs((v-phase+.5)%1-.5)
    seam=max(0,1-distance/.0035)
    vein=(.5+.5*math.cos((u+.008*math.sin(v*math.tau))*math.tau*24))**16
    tone=round(250-6*vein-20*seam)
   else:
    warp=math.cos(u*math.tau*32);weft=math.cos(v*math.tau*32)
    tone=round(250-2.5*warp*weft-1.5*math.sin((u+v)*math.tau*64))
   pixels.extend([max(0,min(255,tone))]*3)
 png=b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('!IIBBBBB',size,size,8,2,0,0,0))+chunk(b'sRGB',b'\0')+chunk(b'IDAT',zlib.compress(bytes(pixels),9))+chunk(b'IEND',b'')
 for root in ['assets/masters/native-v6','public/assets/native-v6']:
  p=pathlib.Path(root)/f'{name}-basecolor.png';p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(png)
 records.append({'name':name,'sha256':hashlib.sha256(png).hexdigest(),'bytes':len(png),'size':[size,size],'channels':'RGB sRGB base-colour multiplier; no alpha or baked shadows'})
pathlib.Path('assets/masters/native-v6/material-contract.json').write_text(json.dumps({'source':'tools/generate-v6-materials.py','rights':'Original deterministic project-authored inputs; no external images','floorUV':'face-plane metres; U scale 1/1.10, offset 4.525/1.10; V scale 1/2.20','clothUV':'face-plane metres; repeat 16 per metre','nativeStatus':'Lossless original masters retained; future engine material binding required; no native port claimed','assets':records},indent=2)+'\n')
print(json.dumps(records))
