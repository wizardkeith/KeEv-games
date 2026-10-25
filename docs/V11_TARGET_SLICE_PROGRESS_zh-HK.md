# V11 原目標重建切片 — 進行中，未驗收

使用 Keith 2026-10-25 再確認的唯一原圖：`docs/codex-v4/reference/Approved_Visual_Target_Misaki.png`，1536×1024，SHA256 `9f855d2ecfd120bb45c001db3fa9b5a3e3b58b2b3c2a4cf9e7ebfda84f8f7114`。Library 原樣副本 `libfile_df47ac9baf04819182f496bbb7ff40b6`。已實際讀取原圖與 V17 完整遊戲截圖；原圖是目標店景／人物合成圖，不是已達成的遊戲畫面。Bible §28：真正3D、35–45°、約3.5–4頭身、柔和anime toon人物／soft stylized PBR環境。

## 實際主要差距

- 完整店景：V17 空白地板／牆面比例大，陳列高度單一，四件同類商品不足以形成目標的混合生活選物密度；須保留實際庫存顯示，不能用美術擅自增加可賣商品。
- 人物：短髮偏球殼，側髮像附加小條；臉部輪廓／眼睛／皮膚層次不足。原待客朝向令常態鏡頭多見背面；須用真正待客／結帳過程評估可見臉，不能為截圖偽造姿勢。
- 器物／環境：陶器、植物、窗外深度與材質太簡化；光影也偏平。僅修改顏色／燈光不能解決造形差距。

## 已改變的方法與目前進度

- **Misaki頭部已另建可編輯Blender細分曲面**（`tools/build-v11-character.py` → `assets/masters/native-v11/misaki-head.blend`／JSON）：同一臉面含頰、下顎、鼻樑；26個實體曲面組成非對稱分層短髮，保留原rig、肢長、接觸／動作流程。首版87,808tri過重，已重拓撲至頭部4,640tri／完整角色11,988tri，仍低於既有12,000限制；高密度來源與非破壞修飾器保留於.blend（仍需實際效能驗證）。原V10模型／所有原masters未刪除。
- 新增真正UV材質流程，原創膚色與虹膜paint由可重建Python來源產生，眼睛／眉／唇按實際細分臉面定位；不把目標PNG貼成角色或背景。Web已接入；glTF同步路徑已修改，尚待最終重建／完整驗證。
- 新建連續曲線陶杯／花瓶與有厚度的手柄，SKU／庫存／價格規則不變；筆記本呈現採更接近目標的低彩度綠。
- 新建分枝植栽、實體薄葉與織籃、垂吊綠植／多層窗外樹冠；窗外按材質合批，避免逐片樹葉一個draw call。正接入完整遊戲。
- 首輪實際WebGL正常鏡頭已產生（本地QA中）；**仍明顯未達目標**，因此繼續改，不把這輪當完成品。下一步：完整店景實拍、待客臉部／服裝輪廓、陳列／材質與光影反覆比較，再跑回歸／連續動作。

## 界線

公開仍V17；本分支是草稿，不合併／不發佈。保留UI清單、580pxdrawer及鏡頭行為、五語、存檔／會計。沒有story／店舖／套裝／能力擴張，沒有Normal存檔修改、使用者Chrome／Unity操作或關機。雲端SwiftShader畫面不代表實體GPU/FPS/audio/native驗收。目標品質與風格驗收持續開放；此文是早期checkpoint，不是完成報告。

## 第一個公開可讀checkpoint

[完整遊戲途中畫面](../evidence/native-v11/checkpoint-1/game-panorama-intermediate.png)／[真正結帳畫面](../evidence/native-v11/checkpoint-1/game-cashier-intermediate.png)，[來源與限制](../evidence/native-v11/checkpoint-1/provenance.json)。這是build6途中證據，不宣稱最後candidate匹配或目標通過。14項focused regression已全通過；完整回歸第一次162/172，修正後175/176，UV locality修正後完整176/176通過；沒有修改面數與固定dressing預算。錄影曾因UI harness最後close selector timeout而未成功完成，不把該次叫pass。改用公開CDP screencast和已有FFmpeg，沒有繞過官方FFmpeg下載的Domain forbidden；這是本機錄影，不是另路存取受限資源。


## 第二個進度 checkpoint — 2026-10-26 00:03 HKT，仍未達標

已改動真正可玩的場景：加厚櫃檯與側櫃、抽屜／把手／結構桌腳與陳列高低架；窗洞加寬、窗外樹冠下降到實際鏡頭可見高度；分枝薄葉改用原創葉脈貼圖；裙襬／袖子／袖口另建連續曲面，圍裙依實際新裙面重新貼合；臉面、眼睛、髮夾與髮片再校準。真實庫存最多呈現8件，仍依原已入貨／已上架數量，沒有增加SKU或經濟獎勵。新的厚度擴大了四個既有碰撞包圍盒，路徑／會計／時間規則不變。Misaki完整11,988tri，原12,000上限不變。

材質不是把參考圖當背景：另生成一張原創木材ALBEDO（來源、原檔與雜湊保留），UV按實際木板長軸；用實際靜態店景在Blender Cycles烘焙接觸AO，Web UV2與標準glTF occlusionTexture內嵌同一原始PNG；可編輯烘焙.blend保留。沒有烘焙人物、庫存或交易。曾試SSAO2但產生鏡頭裁切，已完整移除，不當作已通過。預設鏡頭目標收緊；只有玩家明確切換Zen時使用完整viewport，drawer切換不參與鏡頭計算。

**實際證據與來源：**

- [build24完整遊戲Zen店景](../evidence/native-v11/checkpoint-2/game-panorama-build24.png)／[正常UI店景](../evidence/native-v11/checkpoint-2/game-ui-build24.png)：真正production WebGL、實際Sandbox購買／上架，沒有注入姿勢或假庫存。
- [build23真正收銀接觸近景](../evidence/native-v11/checkpoint-2/game-cashier-build23.png)／[其後店員鏡頭](../evidence/native-v11/checkpoint-2/game-staff-build23.png)／[連續未剪遊戲錄影](../evidence/native-v11/checkpoint-2/game-build23-uncut.webm)。build24只再調鏡頭，這些build23影像不冒充更後版本。
- [V17人物](../evidence/native-v11/checkpoint-2/v17-body-studio.png)／[目前V11人物](../evidence/native-v11/checkpoint-2/v11-body-studio.png)：相同三分之四鏡頭與比例的**實際production模型補充studio比較，並非遊戲截圖**；不能取代上面的實際遊戲證據。
- [177測試](../evidence/native-v11/checkpoint-2/177-tests.log)、build/validate/replay/asset-check通過；139 GLB零error/warning；305受保護檔案與原11commit歷史檢查通過。真正圖面仍優先於這些技術結果。[完整來源／限制](../evidence/native-v11/checkpoint-2/provenance.json)。

**尚未解決／不能宣稱通過：**整體仍與目標有明顯距離。軀幹胸肩／短頸和兩位顧客仍大幅沿用V10，下一步須實際重塑；商品組合／花材與室內窗光層次不足。現有一輪High錄影確實見到招呼、實際結算、手部接觸與交袋，但輪詢沒觀察到短暫毛利提示；正核對原始CDP畫面與事件時間，尚未判定是QA截圖阻塞而錯過或真正presentation缺失，**不能將完整流程稱pass**。較早build11曾實拍全部流程通過，但不拿舊版結果代替當前驗證。雲端SwiftShader不是實體GPU/FPS/audio/native驗收。未發佈、未合併，公開仍V17。
