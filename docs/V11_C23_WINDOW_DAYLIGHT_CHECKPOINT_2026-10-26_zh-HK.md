# C23：窗外模型—窗邊陳列—中央日光切片

**仍未達原圖品質／畫風，整體美術重建未完成。** 本次是可重現的下一輪視覺覆核點，不是目標接受或發佈批准。PR8 保持 Draft／未合併，公開 V17 不變，無 save／deploy。

最終 application **`53555cc5e5960826d82d7f3891618ebc4e80bcc2`**，src tree `6df1658d9571bca231a15c28bad045e716f55c85`，實際遊玩 **immutable140**。早期71394df／135–139不能冒稱140；最後提交只整理 QA／證據／文件，不改遊戲來源。

## 真正遊戲的對照

| 影像 | 身份及限制 |
|---|---|
| [唯一原目標](codex-v4/reference/Approved_Visual_Target_Misaki.png) | 原批准1536×1024 PNG；SHA256 `9f855d2ecfd120bb45c001db3fa9b5a3e3b58b2b3c2a4cf9e7ebfda84f8f7114`。比較左店景，非已實現遊戲。 |
| [BEFORE：C22／134正常遊戲](../evidence/native-v11/checkpoint-22/selected134/after-normal-game.png) | application e13ef125，已改善C21櫃體及C22混合陳列／收銀暖光。 |
| [AFTER：C23／140正常遊戲](../evidence/native-v11/checkpoint-23/selected140/after-normal-game.png) | 1440×1200，真Sandbox買入8件／放三架；與BEFORE相機、現金、庫存、貨架逐項相等。自然角色及葉片相位不同，無姿勢／存檔注入。 |
| [營業中的正常鏡頭](../evidence/native-v11/checkpoint-23/normal-flow140/01b-normal-game.png)／[正常鏡頭交袋137.8秒](../evidence/native-v11/checkpoint-23/motion-samples/handoff137_8.png) | 同最終140來源，真正可操作WebGL，不是studio或mockup。正常休息中商品實拍沒有客人，不當成美術缺陷。 |
| [同來源收銀近鏡](../evidence/native-v11/checkpoint-23/normal-flow140/06-actual-staff-camera.png) | 既有staff camera實際切換所得，補充圖，不取代正常全景。 |

原圖與遊戲不是逐像素註冊：原圖含右側人物展示，遊戲有UI及可操作鏡頭；以上只聲稱遊戲前後相同相機與經濟資料。沒有把目標圖當背景、重繪實拍或用概念圖冒充。影像全部來自雲端 ANGLE SwiftShader，非物理GPU或手機品質驗收。

## 重建與保留

**重建窗外近樹模型**：四組相近排列的幼樹改為兩組不等高、不同深度的分叉樹冠。共14主要分枝、98小枝、196片閉合曲面葉片；枝根由實際掃掠樹幹的ring centre插值取得，葉對同起於實際小枝末端。新檢查雙向射線確認每個主要枝根在真樹皮內，並確認風擺範圍中所有幾何仍在玻璃外、樹冠確實進入正常窗孔且留有開口。不是用幾個色塊背景貼圖替代。

**重建兩座非互動鄰屋模型**：有實際牆面、成對斜屋頂、山牆、屋脊與四個玻璃窗灣／窗框；降低及拉遠後，近葉、低屋頂、遠樹與天色形成獨立深度。遠樹是有枝幹及不等形冠簇的較低細節模型；天空是既有portal內的原創色層幾何，不是下載或生成的街景圖片。沒有新增可進入商店／地形或玩法。

**日光方向切片**：key方向由 `[.88,-.48,.25]` 改為 `[.80,-.62,.18]`，色溫／key與fill比例及接觸硬化陰影軟度一起調整，讓同一窗側方向落在窗邊桌、中央陳列與地面。保留C22暖色收銀焦點；冷色室外fill僅作用室外。實拍可見窗框明暗帶及桌面分離；**沒有單獨隔離葉影貢獻或釉層，因此不宣稱已完成原圖的自然柔葉影或新增glaze效果**。無新GI／反射probe烘焙，原C22實際固定家具接觸AO保持；沒有重新引入被否決的暗天花。

保留C21家具／分離平台／counter wing／窄地板／庭景，C22工作紙品／下層收納／後架finish，已改進人物／頭髮／服裝／rig／手部接觸，真商品比例與支承。未修改相機／導航算法、存貨／售價／需求／成本／P&L、存檔schema、五語文字與已接受直向清單。舊canopy hash凍結預期依本次明確戶外重建授權移除；室內盆栽／七個葉風錨／原C20室內styling保護仍在，另加窗外接觸、玻璃距離及真窗孔射線檢查，沒有放寬預算或經濟測試。

實際固定場景153 parts，連未啟用封存天花也僅154<160；styling10,632＋canopy5,208＝15,840tri<16,000。保留可重建TS、完整engine-neutral JSON master、portable canopy GLB及manifest，舊版本完整Git歷史不刪。原始角色、產品與較早master保護檔案不變。

## 精確最終來源的軟件驗證

- 提交後重跑 **226／226 tests**，build／validate／replay／asset-check通過；141 GLB零錯誤／警告；305保護檔案零改動，原11提交歷史及路線／相機算法保留。
- 4個native exporters的 **34個輸出**新鮮重建逐byte相同；**163個實際遊玩140 payload**與同一固定來源重新build逐byte相同。[逐檔結果／來源／雜湊](../evidence/native-v11/checkpoint-23/provenance.json)。不是新release archive或Site部署驗證。
- **五語×1280×720／375×812／320×420＝15案例／75面板切換**，實際production WebGL、touch及Reduce Motion emulation；相機穩定、580px桌面drawer、無橫溢出及44px買入按鈕通過。[原始結果](../evidence/native-v11/checkpoint-23/framing140/results.json)。
- 初次窗外原型枝葉越玻璃／樹冠投影偏高，修正後才選定140。完整回歸亦抓出新屋窗使用paint而非原四個glass窗灣；已補回真正glass並保留原斷言。失敗日誌明確標記EXCLUDED，未當作通過。

## 真實連續營業與像素證據

[**191.680秒完整未剪錄影**](../evidence/native-v11/checkpoint-23/normal-flow140/gameplay-uncut.webm)，workflow193.287秒，147個CDP原始取樣影格；129個營業diagnostic樣本均為normal shop camera。普通UI真買入／放架，A招呼、一次真一小時結算、收銀接觸／交袋、A離店／店員返回及reload完成，零頁面錯誤，隔離Normal基線不變，沒有存取玩家Normal。影片末端才切既有近鏡作補充實拍。

[**29.120秒連續摘錄**](../evidence/native-v11/checkpoint-23/motion-samples/continuous125-155.webm)：從原片要求125–155秒擷取，VFR最後可用影格令輸出實長29.120秒；單一連續時段，沒有加速／重排，不稱為另一段完整未剪流程。片中可見收銀、交袋及其後毛利提示。

[原片140.5秒實際擷取](../evidence/native-v11/checkpoint-23/motion-samples/margin140_5.png)清楚讀到 **18件／+¥8,400／未扣人工、租金等費用**。是已提交批次售出成本基礎的合計毛利，不是杜撰每客利潤或收入。原始CDP140.389秒也已實看，浮窗像素通過；04排程PNG再次取樣過遲，原樣保留但不當作浮窗證據。QA已明確區分logical cue及人工原片像素核對，沒有為截圖問題改遊戲或會計。

## 未達標與下一個視覺門檻

比134更可分辨窗外景深、窗邊亮面與地面方向，但室內仍有大面積偏均勻棕／米色；葉影不及原圖柔和豐富，遠樹仍偏簡化圓簇，商品群組仍太規整，人物／家具／紙布釉面的整體細膩度與原圖有明顯距離。**不宣稱目標收斂或完成。** 下一輪應看正常全景明暗縮圖及原圖左店景，決定如何形成更自然的窗邊葉影／反射與混合商品量體；保留此次可見方向與C21／22改善，不再用微葉／杯口細節代替整店。

新完整B交易、關店drain／reopen、真hidden-tab、全程精確手部／完整walk-cycle量度、物理GPU／FPS／音訊／原生驗收均未在本切片重新認證。High設定的雲端流程端點成功不等於實體High效能／流暢度驗收。無Library重試／新ID、無release archive、無merge／save／deploy／使用者Chrome／Unity／shutdown；公開V17不變。沒有新的安全或權限阻擋，未完成項是原圖畫風／品質與上述驗證範圍。
