from pathlib import Path
import json,subprocess,hashlib,math
qa=Path('/workspace/qa/v11-slice/c37');data=json.loads((qa/'route-data.json').read_text());r=data['radius'];boxes=[]
for j,path in enumerate(data['paths']):
 for k in range(1,len(path)):
  a,b=path[k-1:k+1];boxes.append((j,k,[min(a['x'],b['x'])-r,.08,min(a['z'],b['z'])-r],[max(a['x'],b['x'])+r,2.10,max(a['z'],b['z'])+r]))
def sub(a,b):return[x-y for x,y in zip(a,b)]
def cross(a,b):return[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]
def hits(v,lo,hi):
 for i in range(3):
  if min(p[i]for p in v)>hi[i]+1e-8 or max(p[i]for p in v)<lo[i]-1e-8:return False
 c=[(a+b)/2 for a,b in zip(lo,hi)];h=[(b-a)/2 for a,b in zip(lo,hi)];p=[sub(a,c)for a in v];e=[sub(p[(i+1)%3],p[i])for i in range(3)];unit=[[1,0,0],[0,1,0],[0,0,1]]
 for axis in[cross(e[0],e[1])]+[cross(a,b)for a in e for b in unit]:
  if sum(x*x for x in axis)<1e-24:continue
  q=[sum(x*y for x,y in zip(v,axis))for v in p];rr=sum(x*abs(y)for x,y in zip(h,axis))
  if min(q)>rr+1e-8 or max(q)<-rr-1e-8:return False
 return True
def probe(raw):
 parts=json.loads(raw);contacts=[]
 for i,p in enumerate(parts):
  assert p['shape']=='mesh';g=p['geometry'];points=[[v+p['at'][d]for d,v in enumerate(g['positions'][k:k+3])]for k in range(0,len(g['positions']),3)]
  for k in range(0,len(g['indices']),3):
   tri=[points[g['indices'][k+j]]for j in range(3)]
   for route,segment,lo,hi in boxes:
    if hits(tri,lo,hi):contacts.append({'part':i,'triangle':k//3,'route':route,'segment':segment,'role':p['role'],'vertices':tri})
 return{'triangleBoxContacts':len(contacts),'uniqueTriangles':len({(a['part'],a['triangle'])for a in contacts}),'firstContacts':contacts[:4]}
path='assets/masters/native-v11/backwall-c37/trailing-greenery.json';old='3047406a052152d45617972fcb95865efb25aef5';before=subprocess.check_output(['git','show',old+':'+path]);now=Path(path).read_bytes();a=probe(before);b=probe(now);assert a['triangleBoxContacts']>0;assert b['triangleBoxContacts']==0
out={'beforeCandidate':old,'application':subprocess.check_output(['git','rev-parse','HEAD']).decode().strip(),'sourcePath':path,'routeData':data,'sourceRouteSHA256':hashlib.sha256(Path('src/presentation/native-routes.ts').read_bytes()).hexdigest(),'bodyHeightMax':2.10,'before':a,'after':b,'scope':'Conservative axis-aligned body boxes along existing authored straight customer route segments. Quantifies clearance risk; not exact animated actor-mesh collision, every rounded turn, staff or physical-device certification.'}
(qa/'route-clearance-before-after.json').write_text(json.dumps(out,indent=2)+'\n');print(json.dumps({'beforeContacts':a['triangleBoxContacts'],'beforeUniqueTriangles':a['uniqueTriangles'],'afterContacts':b['triangleBoxContacts']}))
