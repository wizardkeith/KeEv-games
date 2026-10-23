"""Original seamless strand colour and tangent-normal inputs, not baked light.
UV u wraps around the bob; v follows authored head height. No image inputs.
Normal map is OpenGL +Y tangent-space, RGB linear data. Masters retained.
"""
import math,pathlib,struct,zlib,hashlib,json,shutil
size=512

def field(u,v):
 flow=u+.045*math.sin(v*math.tau)+.014*math.sin(v*math.tau*2)
 return .65*math.cos(flow*math.tau*8)+.22*math.cos(flow*math.tau*17+.5)+.06*math.cos(flow*math.tau*43+v*math.tau*2)
def chunk(t,d):return struct.pack('!I',len(d))+t+d+struct.pack('!I',zlib.crc32(t+d)&0xffffffff)
def png(rows,srgb):return b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('!IIBBBBB',size,size,8,2,0,0,0))+(chunk(b'sRGB',b'\0') if srgb else b'')+chunk(b'IDAT',zlib.compress(bytes(rows),9))+chunk(b'IEND',b'')
colour=bytearray();normal=bytearray()
for y in range(size):
 colour.append(0);normal.append(0)
 for x in range(size):
  u=x/size;v=y/size;f=field(u,v);tone=round(235+17*f);colour.extend([tone]*3)
  e=1/size;du=(field(u+e,v)-field(u-e,v))/(2*e);dv=(field(u,v+e)-field(u,v-e))/(2*e);nx=-du*.006;ny=-dv*.006;nz=1;n=math.sqrt(nx*nx+ny*ny+1);normal.extend(round((a/n*.5+.5)*255) for a in [nx,ny,nz])
records=[]
for name,data,srgb in [('hair-strand-basecolor',colour,True),('hair-strand-normal',normal,False)]:
 b=png(data,srgb);p=pathlib.Path('assets/masters/native-v5')/(name+'.png');p.write_bytes(b);w=pathlib.Path('public/assets/native-v5')/p.name;shutil.copyfile(p,w);records.append({'file':str(p),'public':str(w),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest(),'colour_space':'sRGB' if srgb else 'linear tangent normal OpenGL +Y'})
pathlib.Path('assets/masters/native-v5/hair-material-contract.json').write_text(json.dumps({'id':'native.v5.hair.strands','source':'tools/generate-v5-hair.py','rights':'Original mathematical fields; no external images or models','UV':'Cylindrical atan2(z-.028,x) u, head-local y height v; seam triangles split with u+1, sampler repeat. Only native bob roughness .60 material uses these inputs; eyelash/brow surfaces are plain.','normal_scale':.65,'baked_light':False,'maps':records},indent=2)+'\n');print(records)
