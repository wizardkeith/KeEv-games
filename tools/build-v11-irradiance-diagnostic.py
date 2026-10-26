"""Build an immutable actual-game C30 authoring variant. Never deploys.
Diagnostic fields remain outside ordinary public/runtime payloads.
Usage: python tools/build-v11-irradiance-diagnostic.py VARIANT NEW_OUTPUT_DIRECTORY
"""
import sys,os,json,gzip,hashlib,subprocess,shutil
from pathlib import Path
root=Path(__file__).resolve().parents[1];variant=sys.argv[1];out=Path(sys.argv[2]);master=root/'assets/masters/native-v11/c30-irradiance';provenance=json.loads((master/'provenance.json').read_text());record=provenance['variants'][variant];raw=gzip.decompress((master/(variant+'.json.gz')).read_bytes());assert hashlib.sha256(raw).hexdigest()==record['decodedSHA256'];assert not out.exists(),'Immutable output already exists'
public=root/'public/assets/native-v11/table-irradiance-c30.json';assert not public.exists(),'Do not overwrite another authoring asset';public.write_bytes(raw)
try:
 subprocess.run(['npm','run','build'],cwd=root,env={**os.environ,'VITE_V11_TABLE_IRRADIANCE':'diagnostic'},check=True);shutil.copytree(root/'dist',out);(out/'C30-AUTHORING-ONLY.json').write_text(json.dumps({'variant':variant,'payload':record,'limits':provenance['limits']},indent=2)+'\n')
finally:
 assert hashlib.sha256(public.read_bytes()).hexdigest()==record['decodedSHA256'],'Authoring asset changed concurrently';public.unlink()
