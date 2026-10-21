import concurrent.futures,urllib.request, pathlib,json
from fontTools import subset
fonts={'PlusJakartaSans':'ofl/plusjakartasans/PlusJakartaSans[wght].ttf','NotoSansHK':'ofl/notosanshk/NotoSansHK[wght].ttf','NotoSansJP':'ofl/notosansjp/NotoSansJP[wght].ttf','NotoSansThai':'ofl/notosansthai/NotoSansThai[wdth,wght].ttf','NotoSansSC':'ofl/notosanssc/NotoSansSC[wght].ttf'}
pathlib.Path('assets/masters/fonts').mkdir(parents=True,exist_ok=True);pathlib.Path('public/fonts').mkdir(parents=True,exist_ok=True)
chars=''.join(p.read_text() for p in pathlib.Path('src/content').glob('*.json'))+''.join(chr(i) for i in range(32,127))+'¥％◇＋−×・…／：（）→'
def work(entry):
 name,path=entry;base='https://raw.githubusercontent.com/google/fonts/main/';folder=path.rsplit('/',1)[0];src=pathlib.Path(f'assets/masters/fonts/{name}.ttf');
 
 if not src.exists(): urllib.request.urlretrieve(base+path.replace('[','%5B').replace(']','%5D'),src)
 licence=pathlib.Path(f'assets/masters/fonts/{name}-OFL.txt')
 if not licence.exists(): urllib.request.urlretrieve(base+folder+'/OFL.txt',licence)
 options=subset.Options();font=subset.load_font(str(src),options);sub=subset.Subsetter(options);sub.populate(text=chars);sub.subset(font);subset.save_font(font,f'public/fonts/{name}.ttf',options)
 return {'id':'font.'+name,'source':str(src),'source_url':base+path,'runtime':f'public/fonts/{name}.ttf','licence':'SIL Open Font License 1.1','subset':'W1.1 locale strings + basic Latin, numerals, symbols; user names may use system fallback'}
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:results=list(pool.map(work,fonts.items()))
pathlib.Path('assets/font-manifest.json').write_text(json.dumps(results,indent=2));print(json.dumps(results))
