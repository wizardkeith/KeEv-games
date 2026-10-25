"""Original deterministic surface inputs, no photo/reference pixels or lighting bake.
RGB colour multipliers and tangent-space normal maps; metre UVs documented below.
Prior v5/v6 masters are retained. Python stdlib only, repeatable lossless PNGs.
"""
import math,pathlib,struct,zlib,hashlib,json
S=512
TAU=math.tau
def chunk(t,d):return struct.pack('!I',len(d))+t+d+struct.pack('!I',zlib.crc32(t+d)&0xffffffff)
def grain(u,v):
 flow=u+.018*math.sin(v*TAU)+.007*math.sin(v*TAU*3)
 rings=(.5+.5*math.cos(flow*TAU*19+.8*math.sin(v*TAU*2)))**10
 fine=(.5+.5*math.cos(flow*TAU*103+math.sin(v*TAU*7)))**12
 return rings*.8+fine*.2
records=[]
for name in ['timber-colour','timber-normal','plaster-normal','linen-normal','floor-colour']:
 data=bytearray()
 for y in range(S):
  data.append(0)
  for x in range(S):
   u=x/S;v=y/S
   if name=='timber-colour':
    tone=248-19*grain(u,v)+3*math.sin(u*TAU*3);rgb=[tone,tone-1,tone-3]
   elif name=='floor-colour':
    phase=.18 if u<.5 else .68;seam=max(0,1-abs((v-phase+.5)%1-.5)/.004)
    board=math.floor(u*2);region=1 if ((v-phase)%1)>.5 else 0
    tone=244-17*grain(u*1.4,v)-34*seam+(board*2-1)*3+region*2;rgb=[tone,tone-1,tone-3]
   else:
    if name=='timber-normal':
     dx=(grain(u+1/S,v)-grain(u-1/S,v))*.13;dy=(grain(u,v+1/S)-grain(u,v-1/S))*.13
    elif name=='plaster-normal':
     dx=.055*math.sin((u*53+v*71)*TAU)+.025*math.cos((u*127-v*91)*TAU);dy=.05*math.cos((u*71-v*43)*TAU)
    else:dx=.13*math.sin(u*TAU*32);dy=.13*math.sin(v*TAU*32)
    n=math.sqrt(dx*dx+dy*dy+1);rgb=[128+127*dx/n,128+127*dy/n,128+127/n]
   data.extend(max(0,min(255,round(c))) for c in rgb)
 png=b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('!IIBBBBB',S,S,8,2,0,0,0))+chunk(b'IDAT',zlib.compress(bytes(data),9))+chunk(b'IEND',b'')
 for root in ['assets/masters/native-v9','public/assets/native-v9']:
  p=pathlib.Path(root)/(name+'.png');p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(png)
 records.append({'file':name+'.png','sha256':hashlib.sha256(png).hexdigest(),'bytes':len(png),'size':[S,S]})
pathlib.Path('assets/masters/native-v9/surfaces.json').write_text(json.dumps({'version':'native.v9.surfaces','source':'tools/generate-v9-surfaces.py','rights':'Original procedural KeEv Games inputs. No third-party/ref-image pixels.','colourEncoding':'sRGB colour maps; linear OpenGL tangent-space normals','projection':'nativeSurfaceGeometry per-face metre UV. Timber repeat1/m; floor repeat1.10x2.20m; plaster1/m; linen16/m. Runtime levels timber.20/plaster.15/linen.13. Prior original masters retained.','assets':records},indent=2)+'\n')
print(json.dumps(records))
