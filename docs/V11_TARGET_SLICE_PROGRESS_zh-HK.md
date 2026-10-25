# V11 原目標重建切片 — 進行中，未驗收

使用 Keith 2026-10-25 再確認的唯一原圖：`docs/codex-v4/reference/Approved_Visual_Target_Misaki.png`，1536×1024，SHA256 `9f855d2ecfd120bb45c001db3fa9b5a3e3b58b2b3c2a4cf9e7ebfda84f8f7114`。Library 原樣副本 `libfile_df47ac9baf04819182f496bbb7ff40b6`。已實際讀取原圖與 V17 完整遊戲截圖；原圖是目標店景／人物合成圖，不是已達成的遊戲畫面。Bible §28：真正3D、35–45°、約3.5–4頭身、柔和anime toon人物／soft stylized PBR環境。

## 實際主要差距

- 完整店景：V17 空白地板／牆面比例大，陳列高度單一，四件同類商品不足以形成目標的混合生活選物密度；須保留實際庫存顯示，不能用美術擅自增加可賣商品。
- 人物：短髮偏球殼，側髮像附加小條；臉部輪廓／眼睛／皮膚層次不足。原待客朝向令常態鏡頭多見背面；須用真正待客／結帳過程評估可見臉，不能為截圖偽造姿勢。
- 器物／環境：陶器、植物、窗外深度與材質太簡化；光影也偏平。僅修改顏色／燈光不能解決造形差距。

## 已改變的方法與目前進度

- **Misaki頭部已另建可編輯Blender細分曲面**（`tools/build-v11-character.py` → `assets/masters/native-v11/misaki-head.blend`／JSON）：同一臉面含頰、下顎、鼻樑；26個實體曲面組成非對稱分層短髮，保留原rig、肢長、接觸／動作流程。首版87,808tri過重，已重拓撲至頭部4,640tri／完整角色11,652tri，仍低於既有12,000限制；高密度來源與非破壞修飾器保留於.blend（仍需實際效能驗證）。原V10模型／所有原masters未刪除。
- 新增真正UV材質流程，原創膚色與虹膜paint由可重建Python來源產生，眼睛／眉／唇按實際細分臉面定位；不把目標PNG貼成角色或背景。Web已接入；glTF同步路徑已修改，尚待最終重建／完整驗證。
- 新建連續曲線陶杯／花瓶與有厚度的手柄，SKU／庫存／價格規則不變；筆記本呈現採更接近目標的低彩度綠。
- 新建分枝植栽、實體薄葉與織籃、垂吊綠植／多層窗外樹冠；窗外按材質合批，避免逐片樹葉一個draw call。正接入完整遊戲。
- 首輪實際WebGL正常鏡頭已產生（本地QA中）；**仍明顯未達目標**，因此繼續改，不把這輪當完成品。下一步：完整店景實拍、待客臉部／服裝輪廓、陳列／材質與光影反覆比較，再跑回歸／連續動作。

## 界線

公開仍V17；本分支是草稿，不合併／不發佈。保留UI清單、580pxdrawer及鏡頭行為、五語、存檔／會計。沒有story／店舖／套裝／能力擴張，沒有Normal存檔修改、使用者Chrome／Unity操作或關機。雲端SwiftShader畫面不代表實體GPU/FPS/audio/native驗收。目標品質與風格驗收持續開放；此文是早期checkpoint，不是完成報告。

## 第一個公開可讀checkpoint

[完整遊戲途中畫面](../evidence/native-v11/checkpoint-1/game-panorama-intermediate.png)／[真正結帳畫面](../evidence/native-v11/checkpoint-1/game-cashier-intermediate.png)，[來源與限制](../evidence/native-v11/checkpoint-1/provenance.json)。這是build6途中證據，不宣稱最後candidate匹配或目標通過。14項focused regression已全通過；完整回歸第一次162/172，修正後175/176，UV locality修正後完整176/176通過；沒有修改面數與固定dressing預算。錄影曾因UI harness最後close selector timeout而未成功完成，不把該次叫pass。改用公開CDP screencast和已有FFmpeg，沒有繞過官方FFmpeg下載的Domain forbidden；這是本機錄影，不是另路存取受限資源。
