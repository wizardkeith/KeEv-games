"""C33 fixed-normal closed-mesh overlap probe. Sampling is not art acceptance."""
import json,math,argparse
from pathlib import Path
parser=argparse.ArgumentParser();parser.add_argument('--output',required=True);args=parser.parse_args()
old=json.loads(Path('assets/masters/native-v11/display-quality/flower-spray-c32.json').read_text());new=json.loads(Path('assets/masters/native-v11/display-quality/flower-spray-c33.json').read_text());c,s=math.cos(3.8),math.sin(3.8);h=[(c-s)/math.sqrt(2),0,(s+c)/math.sqrt(2)];d=[(c+s)/math.sqrt(2),0,(s-c)/math.sqrt(2)];co,si=math.cos(math.radians(40)),math.sin(math.radians(40))
def project(p):
 x,y,z=p;u=x*h[0]+z*h[2];depth=x*d[0]+z*d[2];return(u,y*co-depth*si,y*si+depth*co)
def surface(part):
 g=part['geometry'];p=[project(v)for v in zip(*[iter(g['positions'])]*3)];return [[p[i]for i in g['indices'][n:n+3]]for n in range(0,len(g['indices']),3)]
def scan(parts):
 main=sum([surface(parts[i]) for i in [2,4,6,8,10]],[]);side=surface(parts[15]);n=front=0
 def hit(tris,x,y):
  z=-1e9
  for a,b,c in tris:
   det=(b[0]-a[0])*(c[1]-a[1])-(c[0]-a[0])*(b[1]-a[1])
   if abs(det)<1e-12:continue
   u=((x-a[0])*(c[1]-a[1])-(c[0]-a[0])*(y-a[1]))/det;v=((b[0]-a[0])*(y-a[1])-(x-a[0])*(b[1]-a[1]))/det
   if u>=0 and v>=0 and u+v<=1:z=max(z,a[2]+u*(b[2]-a[2])+v*(c[2]-a[2]))
  return z
 for ix in range(-100,31):
  for iy in range(180,301):
   x,y=ix*.002,iy*.002;a,b=hit(main,x,y),hit(side,x,y)
   if min(a,b)>-1e8:n+=1;front+=b>a
 return {'overlapSamplesAt2mm':n,'sideInFrontSamples':front,'approxOverlapAreaM2':n*.002**2}
proof={'C32':scan(old),'C33':scan(new),'projection':'Fixed normal camera elevation40deg; actual closed-mesh ray intersections; local authoring metres before fixed1.1scale. Sampling diagnostic, not independent visual acceptance.'};Path(args.output).write_text(json.dumps(proof,indent=2));print(proof)
