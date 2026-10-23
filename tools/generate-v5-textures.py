"""Original, deterministic seamless wood input. No photographed/baked lighting.
Python stdlib only; linear grain field encoded to sRGB PNG for base-color use.
Retain the generator and lossless 512px master; Web uses the same input.
"""
import math, pathlib, struct, zlib, shutil, hashlib, json
size=512
pixels=bytearray()
for y in range(size):
 pixels.append(0)
 for x in range(size):
  u=x/size;v=y/size
  flow=u+.014*math.sin(v*math.tau)+.005*math.sin(v*math.tau*3+u*math.tau)
  veins=(.5+.5*math.cos(flow*math.tau*11))**18
  fine=(.5+.5*math.sin(flow*math.tau*71+math.sin(v*math.tau*4)))**12
  tone=round(249-7*veins-2*fine+2*math.sin(u*math.tau*3))
  pixels.extend([tone]*3)
def chunk(t,d):return struct.pack('!I',len(d))+t+d+struct.pack('!I',zlib.crc32(t+d)&0xffffffff)
png=b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('!IIBBBBB',size,size,8,2,0,0,0))+chunk(b'sRGB',b'\0')+chunk(b'IDAT',zlib.compress(bytes(pixels),9))+chunk(b'IEND',b'')
master=pathlib.Path('assets/masters/native-v5/wood-grain-basecolor.png');master.parent.mkdir(parents=True,exist_ok=True);master.write_bytes(png)
web=pathlib.Path('public/assets/native-v5/wood-grain-basecolor.png');web.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(master,web)
pathlib.Path('assets/masters/native-v5/texture-contract.json').write_text(json.dumps({'id':'native.v5.wood.grain','source':'tools/generate-v5-textures.py','rights':'Original procedural asset, authored for KeEv Games in this task. No third-party image inputs.','channels':'RGB base-color multiplier; sRGB; no alpha, shadows, highlights or text','projection':'nativeSurfaceGeometry per-vertex metre-based face-plane UV; REPEAT S/T','size':[size,size],'sha256':hashlib.sha256(png).hexdigest()},indent=2)+'\n')
print('Wood texture:',len(png),'bytes',hashlib.sha256(png).hexdigest())
