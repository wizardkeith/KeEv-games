"""Own UV paint maps, not samples/projections from the reference image."""
from pathlib import Path
from PIL import Image
import math,json,hashlib
ROOT=Path(__file__).resolve().parents[2];OUT=ROOT/'assets/authoring/anime-lookdev-v5/textures';OUT.mkdir(parents=True,exist_ok=True)
def rgb(h):return tuple(int(h[i:i+2],16)for i in(1,3,5))
def blend(a,b,t):return tuple(round(x*(1-t)+y*t)for x,y in zip(a,b))
def save(name,size,fn):
 im=Image.new('RGB',size);px=im.load()
 for y in range(size[1]):
  for x in range(size[0]):px[x,y]=fn((x+.5)/size[0],1-(y+.5)/size[1])
 im.save(OUT/name)
def face(u,v):
 cheeks=max(math.exp(-((u-.390)/.038)**2-((v-.325)/.085)**2),math.exp(-((u-.610)/.038)**2-((v-.325)/.085)**2))
 c=blend(rgb('#F3C8B0'),rgb('#E9988C'),cheeks*.58)
 nose=.12*math.exp(-((u-.5)/.016)**2-((v-.35)/.035)**2)
 return blend(c,rgb('#D99A86'),nose)
def iris(u,v):
 x=(u-.5)*2;y=(v-.5)*2;r=math.hypot(x,y);a=math.atan2(y,x)
 lower=max(0,min(1,(.8-y)/1.7));grain=.04*math.sin(a*21+r*12)*max(0,min(1,(r-.3)/.7))
 c=blend(rgb('#4E3328'),rgb('#BC9465'),max(0,min(1,lower*.90+grain)))
 edge=max(0,min(1,(r-.87)/.11));c=blend(c,rgb('#4E3326'),edge*.80)
 pupil=((x+.02)/.34)**2+((y+.015)/.60)**2
 if pupil<1:c=blend(rgb('#2D211C'),c,max(0,min(1,(pupil-.88)/.12)))
 for cx,cy,rad in [(-.28,.35,.12),(.29,-.32,.046)]:
  d=math.hypot(x-cx,y-cy)
  if d<rad:c=blend(c,rgb('#FFF4DC'),max(0,min(1,(rad-d)/(.15*rad))))
 return c
def hair(u,v):
 root=.23+.52*math.sin(math.pi*max(0,min(1,v)))**.65
 c=blend(rgb('#40291F'),rgb('#80543A'),root)
 band=.22*math.exp(-((u-.40-.05*math.sin(v*3))/.20)**2)*math.sin(math.pi*v)**.6
 return blend(c,rgb('#AC8258'),band)
save('face-own-blush-uv.png',(1024,512),face)
save('iris-own-detail-uv.png',(512,512),iris)
save('hair-own-broad-flow-uv.png',(256,1024),hair)
(OUT/'paint-provenance.json').write_text(json.dumps({'method':'Own generated UV colour paint, no reference pixels read by this generator','purpose':'Editable albedo/iris/flow maps for Blender head-only lookdev','files':[{ 'name':p.name,'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}for p in OUT.glob('*.png')]},indent=2)+'\n',encoding='utf8',newline='\n')
print('OWN_UV_PAINT_MAPS_WRITTEN')
