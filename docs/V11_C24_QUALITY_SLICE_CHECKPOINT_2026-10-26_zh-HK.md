# V11 C24：中央桌製作方法切換與實際遊戲149（原圖品質仍未達標）

這是可覆核的在製檢查點，**不是美術完成、目標驗收或發佈建議**。PR8保持Draft／未合併；公開V17不變，沒有Site save/deploy。唯一原圖不變，沒有用生成圖片或離線渲染替代遊戲。

實際 application **da12df8fd9707a73c52f559e97f8d9bbb3b58201**，固定production **149**；`src` tree見[provenance](../evidence/native-v11/checkpoint-24/provenance.json)。後續本檢查點只有證據／文件。

## 先看真正畫面

| 來源 | 全景／局部 |
|---|---|
| 使用者確認的唯一原圖 | [完整原件](codex-v4/reference/Approved_Visual_Target_Misaki.png)／[左店鋪原像素](../evidence/native-v11/checkpoint-24/target-shop-crop.png)／[中央群組原像素](../evidence/native-v11/checkpoint-24/target-central-crop.png) |
| BEFORE：真正production140 | [正常遊戲全景](../evidence/native-v11/checkpoint-23/selected140/after-normal-game.png)／[同矩形中央桌](../evidence/native-v11/checkpoint-24/before140-table-crop.png)／[窗外](../evidence/native-v11/checkpoint-24/before140-window-crop.png) |
| AFTER：真正production149 | [正常遊戲全景](../evidence/native-v11/checkpoint-24/selected149/after-normal-game.png)／[中央桌](../evidence/native-v11/checkpoint-24/selected149/after-table-crop.png)／[窗外](../evidence/native-v11/checkpoint-24/selected149/after-window-crop.png) |
| 真正營業而非靜物展示 | [193.880秒未剪原片](../evidence/native-v11/checkpoint-24/normal-flow149/gameplay-uncut.webm)／[127–156秒連續摘錄](../evidence/native-v11/checkpoint-24/normal-flow149/continuous-127-to-156.webm)／[實際毛利PNG](../evidence/native-v11/checkpoint-24/normal-flow149/04-actual-margin-in-game.png) |

BEFORE／AFTER1440×1200，正常camera、現金／庫存／三貨架逐值相同：[比較記錄](../evidence/native-v11/checkpoint-24/matched-camera-economy.json)。原圖相機未知，沒有宣稱像素配準；原圖／BEFORE裁切保留原像素，[裁切驗證](../evidence/native-v11/checkpoint-24/crop-provenance.json)。場景中的休息／營業、風動及角色姿態有自然差異。

## 真正改用的製作方法與保留部分

- **模型**：中央既有mug以可編輯Blender spline shell／swept handle重做，真中空、杯足／圓唇／內壁、實際高度UV；兩部分合計5204tri。只作table1既有SKU外觀，8件實物與存活prefix仍按真庫存。880tri、2mm真厚度亞麻網格保留平承托面及桌沿以下主要垂褶。遠樹在原C23樞紐使用720tri單一連通冠體，非三個重新上色球體。
- **材質／紙品**：中央乳白釉、亞麻、蜜色木面各有獨立albedo／normal／ORM，白色基調避免重複棕色相乘。原創生成植物封面只接三件既有固定非庫存紙品；原創小植物釉紋及樹冠繪畫是**2D表面素材**，不是3D／目標圖／遊戲截圖。原始輸出、SHA、來源及editable Blend／JSON均保留；[來源說明](../assets/masters/native-v11/display-quality/README.md)／[材質契約](../assets/authoring/native-v11/display-quality-materials.json)。
- **明確未重做／未整合**：本輪未重新製作人物／rig／家具佈局／地板／門／導航；保留C21–23有效成果。中央花器沿用原形、修正實際高度UV／釉面，**jug.json僅作者原稿，未接入遊戲**。未把小細節傳播全店。

## 診斷與拒絕試作

[同實際mesh/camera的離線Cycles診斷](../evidence/native-v11/checkpoint-24/exploratory/c24-before-diagnostic/DIAGNOSTIC-cycles-bounce.png)及[來源限制](../evidence/native-v11/checkpoint-24/exploratory/README.md)完整分開標記。它使用獨立area/sky及AgX，不是等價Web shader；仍暴露規整陳列／簡化形體，**沒有證明引擎或多邊形上限是根因**。快照gzip保留原SHA，可重建，並非概念替身。

後續同亮度local diffuse SH之真正144/145 A/B改善不足，**普通149停用，runtime不帶該trial JSON**；原資料／工具保留，不冒稱已加入GI。官方Babylon矩形光LTC單次read-only下載HTTP403，該動作停止，沒有改路由、重試或新增服務。它不阻塞獨立模型／材質／既有燈光工作，無需使用者動作。147曾因缺少import令build失敗而複製到舊dist，該capture全部排除；修正後148／最終149皆以`set -e`新建，保留失敗log。

## 固定來源檢查與實際流程

- **230 tests、production build、validate、replay、assets／asset-check通過**；[測試](../evidence/native-v11/checkpoint-24/pinned-tests.log)、[144 GLB零錯誤／警告](../evidence/native-v11/checkpoint-24/glb-results.json)。
- [305保護檔案／原11歷史](../evidence/native-v11/checkpoint-24/pinned-protected.json)零變更；經濟、交易、存檔、五語／兩份清單及camera fit／drawer邏輯保留。37個native輸出[新鮮重建byte parity](../evidence/native-v11/checkpoint-24/native-parity.json)，174個實際payload與提交後新build[逐byte相同](../evidence/native-v11/checkpoint-24/runtime-parity.json)，普通build不含read-only reference hook。原創材質[重建相同](../evidence/native-v11/checkpoint-24/material-rebuild-parity.json)；未宣稱Blend二進位可重現。
- [五語×三尺寸15案例／75面板](../evidence/native-v11/checkpoint-24/framing149/results.json)：touch／Reduce Motion、44px購買目標、無頁面溢出、580pxdesktopdrawer及camera穩定。沒有改動文案／價格規則。
- [真正High流程結果](../evidence/native-v11/checkpoint-24/normal-flow149/results.json)：實際買8本／8杯／8茶並放三架、招呼、單次UI一小時結算、A收銀接觸／交袋、離店／店員返回、reload保持；0pageerror，隔離Normal基線不變。193.880秒原片142／144／146／148秒可讀「18件／+¥8,400／未扣人工租金」，[142秒抽幀](../evidence/native-v11/checkpoint-24/normal-flow149/video-samples/second-142.png)；屬**本次結算合計毛利**，沒有改作單客或淨利。

雲端SwiftShader/CDP原時間錄影只有154個收到的畫面，保留時間、無加速；它可證流程／可見結果，**不能認證連續流暢度、實體GPU/FPS/audio/native**。未新增完整B成交、hidden-tab或關店drain/reopen驗收，不沿用舊版數字當本輪通過。

## 未達原圖：下一輪仍需解決

正常尺度可見乳白釉／淺木／布的分離與更有葉面訊息的冠體，**仍不足以成為品質標準**。整體仍是棕米色主導、八杯重複群／長架規整；花器／白花的主形和密度弱，垂布／木構與角色的細膩程度不一致。窗外冠體仍可見團塊／貼圖語言，屋頂／地面過簡，窗影偏硬、沒有原圖明亮柔和葉影與豐富反射層次。植物釉紋在正常全景很小，不能把新增貼圖當作主要畫質改善。

下一個有效切片仍應保留本輪有用來源，先解決中央花器／白花／布的整體形體與真實軟接觸光，在固定正常camera判斷，未通過不擴散全店；不得以230tests或離線漂亮圖宣布目標完成。沒有新發佈包／Library重試／玩家Chrome／Unity／關機操作。
