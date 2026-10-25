"""Local document assembly from authorized actual QA image bytes.
No browser file navigation, screenshot fabrication or image regeneration."""
from pathlib import Path
import json
from reportlab.platypus import SimpleDocTemplate,Paragraph,Spacer,Image,Table,TableStyle,PageBreak
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet,ParagraphStyle
from reportlab.lib.pagesizes import A4,landscape
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from PIL import Image as PILImage
pdfmetrics.registerFont(TTFont('ReportHK','/workspace/qa/v10/review/ReportCJK.ttf'))
q=Path('/workspace/qa/v10');out=q/'review/V10_Model_Rebuild_Review_zh-HK.pdf';r=json.loads(Path('evidence/native-v10/delivery/receipt.json').read_text());styles=getSampleStyleSheet()
for key in ['Normal','Title','Heading1','Heading2']:styles[key].fontName='ReportHK';styles[key].wordWrap='CJK'
styles['Normal'].fontSize=11;styles['Normal'].leading=16;styles['Title'].fontSize=21;styles['Title'].leading=28
cap=ParagraphStyle('cap',fontName='ReportHK',fontSize=9,leading=13,wordWrap='CJK',spaceBefore=6)
def P(t,style='Normal'):return Paragraph(t,styles[style])
def I(p,w,h=430):
 with PILImage.open(p)as im:a,b=im.size
 k=min(w/a,h/b);return Image(str(p),a*k,b*k)
def figure(p,label,w):return [I(p,w),Paragraph(label,cap)]
def cols(items):
 t=Table([[figure(p,label,w)for p,label,w in items]],colWidths=[x[2]+10 for x in items]);t.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),5),('RIGHTPADDING',(0,0),(-1,-1),5)]));return t
flow=[P('Next Stop, Little Shop · V10 模型重建／營業互動審查包','Title'),Spacer(1,9),P('<b>未合併／未發佈；公開網站仍為 V16。原目標畫質與畫風尚未接受。</b> 本包提供真正可玩 3D WebGL 與實際操作證據，沒有以生成場景圖代替模型。'),Spacer(1,8),P('固定應用程式：'+r['applicationCommit']+'<br/>src tree：'+r['srcTree']+'<br/>Draft PR：https://github.com/wizardkeith/KeEv-games/pull/7<br/>封包 SHA256：'+r['sha256']+f"<br/>{r['runtimeFiles']} runtime／{r['archiveFiles']} archive entries"),Spacer(1,10)]
rows=[('重建','三名人物、十種商品、店面／門窗／地板、櫃台／展示桌／固定陳列、植物／花枝／窗外幾何、八張原創表面素材及實際印畫 albedo。'),('保留','角色身份／rig joints、經濟與存檔、已接受清單／圖示、鏡頭、植足／走道／接觸求解及既有袋箱小道具校準。不是全資產已重做的聲稱。'),('檢查','173 tests、build／content／replay／asset-check；245 資產重建一致、276 保護檔未變、139 GLB 零錯誤／警告；55 個五語窄屏／觸控案例。'),('證據版本','最終 art/life 執行0626469；High／lifecycle／舊存檔9758；pricing／inventory770e09c。最終僅補空架對話條件；相關 UI／動作／財務不變，詳見 execution-sources。'),('限制','雲端 SwiftShader，非實體 GPU／FPS／Safari／音效／Native／真實隱藏分頁驗收。額外45秒 High 閒置整理近鏡未觀察完整姿勢，不記通過。')]
t=Table([[P(a),P(b)]for a,b in rows],colWidths=[60,690]);t.setStyle(TableStyle([('GRID',(0,0),(-1,-1),.4,colors.HexColor('#D6CBB9')),('VALIGN',(0,0),(-1,-1),'TOP'),('BACKGROUND',(0,0),(0,-1),colors.HexColor('#F2EDE4')),('TOPPADDING',(0,0),(-1,-1),7),('BOTTOMPADDING',(0,0),(-1,-1),7)]));flow+=[t,PageBreak()]
flow+=[P('原有批准目標（沒有改變方向）','Heading1'),I(Path('docs/codex-v4/reference/Approved_Visual_Target_Misaki.png'),750,452),Paragraph('原批准圖；不是本輪生成的遊戲成果。目標畫質／畫風 gate 仍然開放。',cap),PageBreak()]
flow+=[P('相同遊玩構圖：V16 BEFORE → V10 AFTER','Heading1'),cols([(q/'before/panorama.png','BEFORE：公開 V16 source 的本地同鏡頭隔離 Sandbox，並非重新存取 live Site。',365),(q/'final-exact-art/panorama.png','AFTER：最終0626469，真實 WebGL High／Reduce Motion，相同買貨／陳列準備。',365)]),Spacer(1,8),P('家具構造、商品／印畫與分組葉片可見；細緻髮束／面部／布料、豐富自然陳列、植物與窗外深度／間接光仍距目標。'),PageBreak()]
flow+=[P('實際遊玩鏡頭與中性資產近鏡','Heading1'),cols([(q/'final-exact-art/character-close.png','實際 staff 遊玩鏡頭；面向門口，不能冒稱與目標肖像一致。',240),(q/'studio/misaki-body.png','Production 幾何／rig；另用中性 studio camera/light。圍裙破口已以實體表面間距修正。',240),(q/'studio/misaki-face.png','相同實際模型近鏡，面部與髮束層次仍需繼續重建／精修。',240)]),PageBreak()]
flow+=[P('真正已提交的收款與毛利','Heading1'),cols([(q/'candidate-high/profit-margin.png','正毛利：已售收入減實際已售成本的本次結算合計，未扣人工／租金。',365),(q/'candidate-high/loss-margin.png','負毛利：負號及不同色，不是虛構單一客人的收入。',365)]),Spacer(1,8),P('High 收款執行9758，與最終模型／動作／財務源碼相同。原始連續錄影與 timeline 保留；30秒 excerpt 為同一連續區間，沒有接鏡或加速。動畫不擁有、延後或重複財務寫入。'),PageBreak()]
flow+=[P('營業中的歡迎／觀看／道別','Heading1'),cols([(q/'candidate-life/welcome.png','最終0626469：實際入店招呼，面向目前互動客人。',285),(q/'candidate-life/farewell.png','實際離店招呼，不回放離線對話。',285),(q/'candidate-life/dialogue-375-th.png','五語窄屏例：一個泡泡，不超 viewport；Reduce Motion／關店取消。',150)]),Spacer(1,8),P('空架不說觀看商品；變體不連續重複，回應會過期。原經濟／存檔／清單保持。全程沒有操作主人 Normal、本機 Unity、Site 發佈或 Grok。完整版本與限制請看包內 README／execution-sources。')]
doc=SimpleDocTemplate(str(out),pagesize=landscape(A4),rightMargin=36,leftMargin=36,topMargin=25,bottomMargin=25,title='V10 Model Rebuild and Shop Life Review',author='KeEv Games')
def footer(c,d):c.setFont('ReportHK',8);c.drawString(36,13,'Draft PR7 · target art not accepted · cloud software-rendered evidence');c.drawRightString(805,13,str(d.page))
doc.build(flow,onFirstPage=footer,onLaterPages=footer);print(out)
