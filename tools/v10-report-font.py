"""Embed a document-only TrueType subset from the installed original Noto CJK.
Original runtime fonts are untouched. Noto font name/licence metadata retained."""
from pathlib import Path
from fontTools.ttLib import TTFont,TTCollection
from fontTools import subset
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.pens.cu2quPen import Cu2QuPen
source='/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc'
collection=TTCollection(source,lazy=True);index=next((i for i,f in enumerate(collection.fonts)if 'NotoSansCJKtc' in f['name'].getDebugName(6)),0)
f=TTFont(source,fontNumber=index);text=Path('tools/v10-review-pdf.py').read_text()+Path('docs/V10_MODEL_REBUILD_AND_LIFE_zh-HK.md').read_text()+Path('evidence/native-v10/delivery/receipt.json').read_text();chars={ord(c)for c in text};missing={c for c in chars if c>127 and c not in f.getBestCmap() and not chr(c).isspace()};assert not missing,missing
s=subset.Subsetter();s.populate(text=text);s.subset(f);order=f.getGlyphOrder();glyphSet=f.getGlyphSet();glyphs={}
for name in order:
 pen=TTGlyphPen(glyphSet);glyphSet[name].draw(Cu2QuPen(pen,max_err=1.0,reverse_direction=True));glyphs[name]=pen.glyph()
b=FontBuilder(f['head'].unitsPerEm,isTTF=True);b.setupGlyphOrder(order);b.setupCharacterMap(f.getBestCmap());b.setupGlyf(glyphs);b.setupHorizontalMetrics(f['hmtx'].metrics);b.setupHorizontalHeader(ascent=f['hhea'].ascent,descent=f['hhea'].descent);b.font['name']=f['name'];b.setupOS2(sTypoAscender=f['OS/2'].sTypoAscender,sTypoDescender=f['OS/2'].sTypoDescender,usWinAscent=f['OS/2'].usWinAscent,usWinDescent=f['OS/2'].usWinDescent);b.setupPost();b.setupMaxp();dest=Path('/workspace/qa/v10/review/ReportCJK.ttf');b.save(dest);print(dest,len(order),'glyphs; complete requested Unicode coverage')
