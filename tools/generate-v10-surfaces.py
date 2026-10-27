"""Original deterministic surface inputs, no photo/reference pixels or lighting bake.
RGB colour multipliers and tangent-space normal maps; metre UVs documented below.
Prior v5/v6/v9 masters are retained. Python stdlib only, repeatable lossless PNGs.
"""
import math,pathlib,struct,zlib,hashlib,json
S=512
TAU=math.tau
def chunk(t,d):return struct.pack('!I',len(d))+t+d+struct.pack('!I',zlib.crc32(t+d)&0xffffffff)
def grain(u,v):
 # Broad irregular grown rings plus faint fine fibres; no painted board seams.
 flow=u+.025*math.sin(v*TAU)+.009*math.sin(v*TAU*3+u*TAU)
 broad=.5+.5*math.sin(flow*TAU*7+.8*math.sin(v*TAU*2))
 fine=.5+.5*math.sin(flow*TAU*59+.6*math.sin(v*TAU*5))
 return .72*broad**3+.28*fine**6
def hair(u,v):
 flow=u+.025*math.sin(v*TAU)+.008*math.sin(v*TAU*2)
 return .7*math.cos(flow*TAU*7)+.2*math.cos(flow*TAU*13)+.1*math.cos(flow*TAU*31+v*TAU)
records=[]
for name in ['timber-colour','timber-normal','plaster-normal','linen-normal','floor-colour','hair-strand-basecolor','hair-strand-normal','cloth-weave-basecolor']:
 data=bytearray()
 for y in range(S):
  data.append(0)
  for x in range(S):
   u=x/S;v=y/S
   if name=='timber-colour':
    tone=250-12*grain(u,v)+2*math.sin(u*TAU*3);rgb=[tone,tone-1,tone-3]
   elif name=='floor-colour':
    tone=249-11*grain(u,v);rgb=[tone,tone-1,tone-2]
   elif name=='hair-strand-basecolor':
    tone=245+8*hair(u,v);rgb=[tone,tone,tone]
   elif name=='cloth-weave-basecolor':
    tone=249+2*math.sin(u*TAU*32)*math.sin(v*TAU*32);rgb=[tone,tone,tone-1]
   else:
    if name=='hair-strand-normal':
     dx=(hair(u+1/S,v)-hair(u-1/S,v))*.4;dy=(hair(u,v+1/S)-hair(u,v-1/S))*.4
    elif name=='timber-normal':
     dx=(grain(u+1/S,v)-grain(u-1/S,v))*.13;dy=(grain(u,v+1/S)-grain(u,v-1/S))*.13
    elif name=='plaster-normal':
     dx=.055*math.sin((u*53+v*71)*TAU)+.025*math.cos((u*127-v*91)*TAU);dy=.05*math.cos((u*71-v*43)*TAU)
    else:dx=.13*math.sin(u*TAU*32);dy=.13*math.sin(v*TAU*32)
    n=math.sqrt(dx*dx+dy*dy+1);rgb=[128+127*dx/n,128+127*dy/n,128+127/n]
   data.extend(max(0,min(255,round(c))) for c in rgb)
 png=b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('!IIBBBBB',S,S,8,2,0,0,0))+(chunk(b'sRGB',b'\0') if 'colour' in name or 'basecolor' in name else b'')+chunk(b'IDAT',zlib.compress(bytes(data),9))+chunk(b'IEND',b'')
 for root in ['assets/masters/native-v10','public/assets/native-v10']:
  p=pathlib.Path(root)/(name+'.png');p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(png)
 records.append({'file':name+'.png','sha256':hashlib.sha256(png).hexdigest(),'bytes':len(png),'size':[S,S]})
pathlib.Path('assets/masters/native-v10/surfaces.json').write_text(json.dumps({'version':'native.v10.surfaces','source':'tools/generate-v10-surfaces.py','rights':'Original procedural KeEv Games inputs. No third-party/ref-image pixels.','colourEncoding':'sRGB colour maps; linear OpenGL tangent-space normals','projection':'nativeSurfaceGeometry per-face metre UV. Timber repeat1/m; floor physical staggered geometry; repeat1.10x2.20m; plaster1/m; linen16/m. Runtime levels timber.20/plaster.15/linen.13. Prior original masters retained.','assets':records},indent=2)+'\n')
print(json.dumps(records))
