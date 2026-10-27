import numpy as np,json,math,pathlib
parts=json.load(open('assets/masters/native-v11/backwall-c38/window-near-branches.json'));tri=[]
for p in parts:
 if p['role']!='leaf':continue
 g=p['geometry'];v=np.array(g['positions']).reshape(-1,3)+np.array(p['at']);tri.extend(v[np.array(g['indices']).reshape(-1,3)])
tri=np.array(tri);a=tri[:,0];e1=tri[:,1]-a;e2=tri[:,2]-a
window=np.array([-4.47,1.84,0]);old=np.array([-80.,52.,-15.]);dist=np.linalg.norm(window-old)
def source(slope,z):
 d=np.array([1.,-slope,z]);return window-dist*d/np.linalg.norm(d)
def leafhit(point,src):
 delta=src-point;maxT=np.linalg.norm(delta);ray=delta/maxT;h=np.cross(np.broadcast_to(ray,e2.shape),e2);det=(e1*h).sum(1);ok=abs(det)>1e-9;f=np.divide(1.,det,out=np.zeros_like(det),where=ok);s=point-a;u=f*(s*h).sum(1);q=np.cross(s,e1);v=f*(q*ray).sum(1);t=f*(e2*q).sum(1);return bool(np.any(ok&(u>=0)&(v>=0)&(u+v<=1)&(t>1e-4)&(t<maxT)))
def entry(p,src):
 return p+(src-p)*((window[0]-p[0])/(src[0]-p[0]))
out={'leafTriangles':len(tri),'limits':'Rest-pose world-space triangle intersections only, not actual GPU shadow samples or animated foliage; no material/stock/geometry changes.','cases':[]}
for name,src in [('C46',old),('C47-v1',source(.30,-.22)),('C47-final',source(.30,-.08))]:
 pts=[('table-centre',np.array([.1,1.1,0.])),('central-aisle',np.array([.1,.08,.8])),('cashier-floor',np.array([2.6,.08,-.65]))];probes=[]
 for n,p in pts:
  w=entry(p,src);probes.append({'name':n,'point':p.tolist(),'windowCrossing':w.tolist(),'withinAperture':bool(.925<w[1]<2.755 and -2.055<w[2]<2.055),'nearLeafHit':leafhit(p,src)})
 hits=[];eligible=0
 for x in np.linspace(-2,2.7,25):
  for z in np.linspace(-1.5,1.5,19):
   p=np.array([x,.08,z]);w=entry(p,src)
   if .925<w[1]<2.755 and -2.055<w[2]<2.055:
    eligible+=1
    if leafhit(p,src):hits.append([round(x,3),round(z,3)])
 out['cases'].append({'name':name,'position':src.tolist(),'targetDistance':float(np.linalg.norm(window-src)),'probes':probes,'gridApertureEligible':eligible,'gridNearLeafHits':len(hits),'gridHitXZ':hits})
pathlib.Path('/workspace/qa/v11-slice/c47/ray-probe.json').write_text(json.dumps(out,indent=2));print(json.dumps({**out,'cases':[{k:v for k,v in c.items()if k!='gridHitXZ'}for c in out['cases']]},indent=2))
