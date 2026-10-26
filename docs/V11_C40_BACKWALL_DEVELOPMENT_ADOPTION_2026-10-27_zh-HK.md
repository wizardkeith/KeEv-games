# V11 C40：採用已過後牆／窗景標準，開發驗證完成

Application：`4b3fc354af6e0379342b19dd01727d37dcf986f7`，[Draft PR8](https://github.com/wizardkeith/KeEv-games/pull/8)。父任務轉達 C38 窄 FORM 及 C39 窄 MATERIAL 獨立 PASS；本次普通無旗標 build257 採用同一形體／256映射。**這是 V11 開發預設，不是 main 功能合併、公開發佈或整體原圖接受。** C36桌／收銀、C38形體、C39值、17群、經濟／存檔／camera／rig保持。

## 實際遊戲證據

- [唯一原圖／已審256／普通257，正常店高480px](../evidence/native-v11/checkpoint-40-adoption/target-256-adopted257-normal480.png)，[普通257完整正常畫面](../evidence/native-v11/checkpoint-40-adoption/stock257/02-eight.png)。相同 normal camera；自然 idle 姿態不同，沒有注入pose或把概念圖代替遊戲。
- [0件／8件／售罄重載的桌面](../evidence/native-v11/checkpoint-40-adoption/stock0-eight-soldout-table.png)，七張原始庫存全景及逐次狀態均保留。
- [210.800秒 High 實際未剪片](../evidence/native-v11/checkpoint-40-adoption/complete257/gameplay-uncut.webm)及[recording provenance](../evidence/native-v11/checkpoint-40-adoption/complete257/recording-provenance.json)：真實 UI 買入上架、迎客、提交結算、cashier／交袋／毛利、顧客離店、員工返回及重載。960×720、public CDP＋已安裝ffmpeg；雲端SwiftShader稀疏幀，非實體GPU/FPS／逐幀平滑證明。
- [實際交接階段](../evidence/native-v11/checkpoint-40-adoption/complete257/03-cashier-contact-in-game.png)、[實際已提交毛利](../evidence/native-v11/checkpoint-40-adoption/complete257/04-actual-margin-in-game.png)、[重載後真3D](../evidence/native-v11/checkpoint-40-adoption/complete257/07-actual-post-reload-game.png)。已親自查看原始PNG：毛利是「本次結算毛利・18件／+¥8,400／未扣人工、租金等費用」。交接PNG是動作階段，不冒稱那一幀精確手距或完整步態認證。
- [Low](../evidence/native-v11/checkpoint-40-adoption/low257/low-motion-normal-game.png)／[Low＋Reduce Motion](../evidence/native-v11/checkpoint-40-adoption/low257/low-reduced-normal-game.png)，1280×900；較低內部解析度是原Low政策，非高畫質截圖。
- [來源與限制](../evidence/native-v11/checkpoint-40-adoption/source-identity.json)、[全部媒體SHA256](../evidence/native-v11/checkpoint-40-adoption/media-sha256.json)。圖中原圖另有標籤；比較圖只裁切／等比例縮放，全部 after 來自可運行遊戲。

## 實際採用檢查

- [普通配方](../evidence/native-v11/checkpoint-40-adoption/default-probe.json)的geometry（含normal/UV/winding）、material profile、foreground及0/3/8 stock prefixes與已審256逐值一致。`VITE_V11_BACKWALL_FORMS=shape`／`...MATERIAL=values`成為普通預設，原control／gray／base診斷仍可明確選用。原C38/C39 receipt／母檔保留，新採用記錄另存 [C40 receipt](../assets/authoring/native-v11/backwall-c40-adoption.json)。沒有再調palette、形體、光照或相機。
- [真UI庫存結果](../evidence/native-v11/checkpoint-40-adoption/stock257/results.json)：invalid0／Enter不寫入；買3＋5、上架、8重載、兩次各別普通1小時提交、售罄重載。raw quantity `005`保持；place不扣款。0→3→8→reload8→2→0→reload0的庫存、bookCost、COGS、cash與eventSequence均[獨立重算七個快照](../evidence/native-v11/checkpoint-40-adoption/stock-ledger-proof.json)。raw core cash：5000→4565→3840→3840→5490→6000→6000；JPY畫面按既有formatter×10，不混淆兩種單位。0件及售罄重載未見固定杯影殘留。
- [完整High結果](../evidence/native-v11/checkpoint-40-adoption/complete257/results.json)／[事件證據](../evidence/native-v11/checkpoint-40-adoption/adoption-flow-proof.json)：visitor-a及visitor-b均觀察到entering→browsing→leaving→outside。visitor-a獲已提交revision9的呈現，實際接袋後exit，staff返回。批次18件收入1710、已售成本870、毛利840（UI +¥8,400），cash增加1650即sales1710減現金費用60；不是單一虛構顧客的淨利。完整時間線以`timeline.json.gz`保留，沒有偽造交易、clock、pose或買家。
- [Low／Reduce Motion結果](../evidence/native-v11/checkpoint-40-adoption/low257/results.json)：兩次fresh Sandbox真買入上架、原C35花布與C39架板／葉片／192反射5個實際下載SHA均對上；live PBR與已審256的23個材質紀錄逐值同。Reduce Motion位置不變／activeProps0；兩組0pageerror、fresh隔離Normal baseline不變。
- **保留未通過的首個錄製**：[target-B-only結果／原片](../evidence/native-v11/checkpoint-40-adoption/initial-target-b-not-passed/results.json)。指定B的狹窄selector在420秒觀察窗內沒有發出結算，故沒有contact/margin，完整流程斷言失敗；不是完整High通過，也沒有據此修改正確遊戲。後來單獨跑普通eligible-customer流程，在較小viewport減少軟件renderer競爭，完成雙route及交易。此處沒有規避任何權限／403或注入狀態。

## 回歸、輸出與初次失敗的處理

- [270/270](../evidence/native-v11/checkpoint-40-adoption/tests-final.log)、普通build／strictTS、五語174keys validate、replay、asset-check通過；[146 GLB零錯誤／警告](../evidence/native-v11/checkpoint-40-adoption/glb-validation.log)。原完整route／shelf SAT斷言、3000植物tri、17groups／14036tri／155固定項不變。[305受保護檔](../evidence/native-v11/checkpoint-40-adoption/preservation.json)及原11提交保留。
- 首次採用回歸有[7項失敗](../evidence/native-v11/checkpoint-40-adoption/tests-initial.log.gz)，沒有隱藏：舊C36/C20 hash與15776tri測試明確保留control，普通default改核對已審C39的14036tri及完整payload；遠樹現在2個volume＋2個thin-leaf批次，非舊2批；舊「visible<85%」不再代表窗洞，改核對實際9條開口ray；光照測試由隨tessellation改變的>100個頂點，改為完整三角形經窗投影地面總面積>.03m²（實測.03510559、8面，非聯集／柔影品質認證）。原opening SAT亦保留。
- 原遠樹Blender Float32 normal最大單位長度誤差`8.3312e-8`，**沒有改normal來湊測試或破壞已審資料**。匯入值明確按兩個Float32 half-ULP（`2^-23`）檢查，double authoring仍用原`1e-8`；finite及完整已審geometry逐值鎖同時存在。這是數值格式檢查修正，不當作美術提升或掩蓋零normal／NaN。
- [502資產重建逐byte相同](../evidence/native-v11/checkpoint-40-adoption/asset-rebuild-parity.json)，四canonical exporters＋新C40 receipt；不覆寫原C38/C39母檔，不聲稱重建Blender二進位。[普通257全部182runtime與application重建逐byte同](../evidence/native-v11/checkpoint-40-adoption/runtime257-parity.json)。沒有新公開發佈包或Site操作。

## 尚待覆核與下一個全景重點

請獨立覆核此**開發採用**checkpoint。沒有本輪新hidden-tab／closure queue／中斷壓力／五語窄屏或實體GPU/FPS/audio/native認證；舊通過不能轉算為本來源的新實測。無使用者動作／權限阻塞，無Library或LTC重試、玩家Chrome、Normal玩家存檔、Unity或關機操作；PR仍Draft、main僅文件入口、公開V17不變。

**整體原圖仍未接受。** 已過桌與後牆／窗景標準應保留，下一全景優先是大灰屋頂的視覺比重，以及從窗側跨地板／中桌到前景counter的柔和日光、暖bounce及接觸明暗層次。原圖仍明顯更通透、有焦點；不應再以磨架板色值、增加小葉或重排已過花布代替全景質感的改善。後續先固定正常相機比較，再作方法與實際像素驗證。
