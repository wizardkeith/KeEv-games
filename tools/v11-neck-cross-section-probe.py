"""Read-only accepted-source neck crossing diagnostic; never alters geometry."""
from pathlib import Path
import argparse,json,math,hashlib
parser=argparse.ArgumentParser();parser.add_argument('--output',required=True);parser.add_argument('--flower',default='flower-spray-c36.json');args=parser.parse_args()
r=Path(__file__).resolve().parents[1];d=r/'assets/masters/native-v11/display-quality';vase=json.loads((d/'flower-jug.json').read_text());flower=json.loads((d/args.flower).read_text())
body=vase[0]['geometry'];points=list(zip(*[iter(body['positions'])]*3));y=max(p[1]for p in points);rim=[math.hypot(x,z)for x,yy,z in points if abs(yy-y)<1e-7];outer=max(rim);parts=[]
for i,p in enumerate(flower):
 if p['role']!='wood':continue
 g=p['geometry'];v=list(zip(*[iter(g['positions'])]*3));radii=[]
 for n in range(0,len(g['indices']),3):
  t=[v[k]for k in g['indices'][n:n+3]]
  for k in range(3):
   a,b=t[k],t[(k+1)%3]
   if (a[1]-y)*(b[1]-y)<0:
    f=(y-a[1])/(b[1]-a[1]);radii.append(math.hypot(a[0]+f*(b[0]-a[0]),a[2]+f*(b[2]-a[2])))
 if radii:parts.append({'part':i,'minRadius':min(radii),'maxRadius':max(radii),'outsideEvenOuterRim':max(radii)>outer,'minimumWorldRadialOverhangMetres':max(0,max(radii)-outer)*1.1})
result={'source':'Read-only '+args.flower+' against actual retained C25jug','mouthHeight':y,'rimRadii':[min(rim),outer],'C27Scale':1.1,'parts':parts,'lockedSourceSHA256':{f:hashlib.sha256((d/f).read_bytes()).hexdigest()for f in['flower-jug.json',args.flower]},'status':'blocked'if any(p['outsideEvenOuterRim']for p in parts)else'pass','limits':'Cross-section proof, not a new physical device or artistic acceptance. C33 visible crown/C32cloth/C35values retained; only C36 lower trunks change.'}
Path(args.output).write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result,indent=2))
