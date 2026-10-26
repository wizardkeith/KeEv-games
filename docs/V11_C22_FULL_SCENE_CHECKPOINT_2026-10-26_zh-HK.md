# C22：混合陳列與明暗層次的實際遊戲檢查點

**目標美術仍未達標，工作未完成；這是下一輪獨立視覺批評的固定切片，不是發佈候選驗收。** Draft PR8／`codex/game-v11-target-slice` 未合併，公開 V17 不變。選定 application **`e13ef125f50ce8603a9c1104cc4344f17afc898d`**，src tree `389aff0c1d6248f52a463cb844a4cf1096c15aaa`；以下 final 實拍全部來自 immutable134，163 個 runtime 檔案與此來源新鮮重建逐 byte 一致。後續提交只整理 QA 診斷／證據／文件，未更改 application。

## 唯一原目標與實際前後

| 證據 | 身份／比較條件 |
|---|---|
| [原圖](codex-v4/reference/Approved_Visual_Target_Misaki.png) | 原始批准目標，1536×1024，SHA256 `9f855d2ecfd120bb45c001db3fa9b5a3e3b58b2b3c2a4cf9e7ebfda84f8f7114`；比較左側店景。不是遊戲輸出。 |
| [BEFORE：C21／127 正常遊戲鏡頭](../evidence/native-v11/checkpoint-21/light127/after-normal-game.png) | application `01dc573430c8306da3c0d1fc1d8afe52785eeb85`。已改善 C21 櫃體／地板／庭景，偏淡光路。 |
| [AFTER：C22／134 正常遊戲](../evidence/native-v11/checkpoint-22/selected134/after-normal-game.png) | 真正 production WebGL，普通 Sandbox 買入及放架；同三個 camera pose、現金、庫存、貨架資料逐項相等。自然角色／葉片相位不保證相同，沒有注入 pose。 |
| [AFTER：正常操作下的全景](../evidence/native-v11/checkpoint-22/selected134/after-panorama-game.png)／[櫃檯近鏡](../evidence/native-v11/checkpoint-22/selected134/after-counter-game.png) | 真正遊戲中的既有 Zen／staff camera；補充視角，不代替正常畫面。 |
| [實際收銀狀態](../evidence/native-v11/checkpoint-22/normal-flow134/03-cashier-contact-in-game.png) | 同一選定134，營業流程自然到達；不是 studio 或概念圖。 |

畫面未做調色、補畫、AI 替代或將原圖貼成背景。所有遊戲影像均是雲端 ANGLE SwiftShader 軟件渲染，不是實體手機或 GPU 表現。

## 已整合的大形與光路變更

保留 C21 三款櫃體、分離高低平台、前景 counter wing、窄地板與庭景，不重新推翻改善。重排同一批 35 件固定樣品，維持 ID／數量；加上明確非庫存的文件架、書卡／工作紙品與下層空腔籃，中央花束提高至可讀層次。既有 notebook／card 真實存貨以穩定 3／5 層群組展示；仍遵循相同數量、8 件可視上限及支承面，沒有新增 SKU／售價／庫存。修正後牆組裝遺失的原本釉陶 finish。中度木色後架切開原來深色長條，收銀工作區加紙盤及只有裝飾作用的服務鈴。

126（舊燈／較強木 normal）、127（新整組燈／較弱 normal）、128（舊燈／較弱 normal）實拍顯示，淡化主要與**整組燈光**有關，不能單獨歸因 fill 或木 normal。最終採克制全局反射、定向反射與暖色收銀焦點；木 normal 保留 .10。439 個固定網格的新 Cycles 接觸 **AO** 原始 JSON／Blender／PNG／receipt 保留在 `assets/masters/native-v11/c22-contact/`；排除人物、活動門及真庫存。不是 GI 或新烘焙全局照明的宣稱。

131／132 同幾何、相機、現金及庫存，只切換鏡頭不可見的天花投影；132 過暗。[關](../evidence/native-v11/checkpoint-22/shadow-ab131-132/before-normal-game.png)／[開](../evidence/native-v11/checkpoint-22/shadow-ab131-132/after-normal-game.png)。133 增加定向反射及收銀焦點仍未形成足夠有用的整體層次，[原始試作](../evidence/native-v11/checkpoint-22/rejected-directed133/after-normal-game.png)與重現 patch 保留，**天花網格在134普通遊戲不建立，未採納**。並未把被否決試作當成改進。早期129超材質預算及130未完成擺放修正皆排除；原有上限未放寬。

## 精確來源的檢查與真實交易

提交後在 e13ef125 重新執行 `npm test`（**223／223**）、build／validate／replay／asset-check；141 GLB 零錯誤／警告，305 個保護檔案零變更；4 個 native exporters 的 34 個輸出逐 byte 相同，163 個實際134 payload 與新鮮 pinned-source build 相同。這些不是把92e早期結果冒稱最新 head。[來源及全檔雜湊](../evidence/native-v11/checkpoint-22/selected-provenance.json)。五語 × 1280×720／375×812／320×420 共15案例／75面板切換檢查580px桌面drawer、相機不跳、無水平溢出、44px買入及touch／Reduce Motion emulation；不是物理觸屏認證。

[原始199.280秒未剪流程](../evidence/native-v11/checkpoint-22/normal-flow134/gameplay-uncut.webm)，workflow200.610秒：真 Sandbox 買入／放架、A招呼／收銀接觸／交袋、一次真實結算、A離店／店員返回與重載；零頁面錯誤，隔離 Normal 基線不變，未讀取或改動玩家 Normal。結算18件，內部 revenue1710、COGS870、gross840，顯示倍率下為 **+¥8,400 本次結算毛利，未扣人工／租金**；是實際批次合計，不是杜撰每客利潤或收入當利潤。

**浮窗像素核對已解決：**原片145.990／147.421秒實際清楚顯示18件／+¥8,400／未扣人工租金。[146.5秒原片原尺寸擷取](../evidence/native-v11/checkpoint-22/motion-samples/actual-margin146_5.png)。原始 `04-actual-margin-in-game.png` 取樣過遲，原樣保留，**不作浮窗證據**。一次同 e13e 來源的有界 read-only style／位置診斷亦在 [231.320秒未剪片](../evidence/native-v11/checkpoint-22/margin-probe134/gameplay-uncut.webm)153.5–157.9秒找到浮窗；[原CDP154.939秒](../evidence/native-v11/checkpoint-22/motion-samples/probe-margin154_939.jpg)，DOM bounds 在視窗內。先前 `actualMargin:true` 僅是 logical cue 不能獨立認證像素；已改善 QA 結果措辭及診斷記錄，**沒有因取樣錯誤改動遊戲／會計**。第二次完整流程232.776秒，真交易／A離店返回／重載、零錯誤／隔離Normal同樣通過。兩次不是實體 FPS 或完整手部精準量度。

## 仍然與原圖有明顯距離

1. 雖然後牆及工作群組密度增加，真實同款杯／瓶仍大量成規整群組；整店不像原圖混合紙品、花、陶器及包材的自然錯落。不能靠刪減真庫存或假增庫存解決。需要在既有展示權限內調整輪廓／群組與清楚非庫存工作物件，而非再加同款小物。
2. 原圖窗邊暖光、柔和葉影、亮暗交錯與冷色遠景的層次仍未建立到位。134比127恢復分離，但大片牆與木面仍偏均勻，庭景也較平。被拒絕的天花試作不是答案。
3. 人物、家具、釉陶、紙／布／植物雖有來源實作改善，正常畫面仍較硬／簡化，細膩度與整體材質語言低於原圖。沒有重新認證角色／布料已達標，也不把鏡頭放大當品質達成。

下一步應由原圖左店景和正常縮圖的**整體明暗／混合陳列量體**覆核選定134，再作高影響重建；保留已正確的家具結構、scale／support、人物身份／rig／接觸與相機操作。

未宣稱新完整 B 交易、關店 drain／reopen、真 hidden-tab、全部路徑／全程精確手接觸、物理 GPU／FPS／音訊／原生驗收。無新 release archive／Library 上傳重試；既有 Library helper 發現失敗限制仍在，repo 圖片／原片可直接審查。沒有新的安全或權限阻擋；主要未完成項是目標美術品質。公開 V17、Site 身份／網址／公開設定、經濟、存檔及五語受保護內容均不變，無 merge／save／deploy。
