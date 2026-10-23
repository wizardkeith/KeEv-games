# v4 雲端驗收與交付

已從原完整 v11 / v3.1 工程接續整合。沒有新增遊戲分支版本或替代 Site；原經濟、存檔、內容、Bible、五個基本 locale、依賴 lockfile 和 hosting identity 與 `10c070c8` 完全一致。原輸入兩包 ZIP CRC、25 個 payload SHA-256、完整 bundle SHA-256 及 593 個基線 Git blob SHA-256 已核對。

## 已實際完成的檢查

| 檢查 | 結果 |
| --- | --- |
| 完整 unit / storage / presentation / geometry 回歸 | 142 通過；0 失敗／跳過／取消 |
| TypeScript + production Vite build | 通過；保留既有 Babylon 大 chunk 提示 |
| Content validation | 通過；10 個 Offering、5 個 locale |
| Deterministic replay | 通過；原經濟結果保持一致 |
| Current GLB | 3 角色 + 15 家具／商品 GLB，0 errors / 0 warnings |
| Web / GLB 實際渲染 | 11 組相同 camera / pose / light：正、四分三、背面、idle、walk、service、flat、no-shadow |
| 20 / 30 / 60 Hz | 腳掌 anchor 及真實腿長可達性通過；原 2mm 支撐腳門檻保留 |
| 入貨與架位 | 下方兩種商品不同數量、雙擊僅扣一次、補貨保持陳列、替換／搬架、庫存保留 |
| 輸入與狀態 | 空白／負數／小數／指數／超大數、缺錢、原 DOM / focus、逐件 draft、缺貨卡暫留 |
| 保存資料 | 真正 export / import / reload；Normal / Sandbox 草稿與經濟進度隔離 |
| 窄螢幕 | 320 / 375px × 五語系，實際選架命令與鍵盤 focus；橫向版面 |
| A / B 交袋 correctness | 兩者均以真 Saves 結算驅動 actual scene adapter；單一袋 owner、連續世界位置、淨空及離店 |

## 實際畫面與影片

- `evidence/native-v4/browser/interaction.webm`：122.68 秒未剪輯錄影，1000×760，Low。入貨／換架 → 正式結算 fallback → A 進店／看貨 → 再次正式結算 → 接近／包裝／交袋 → 接袋／離店，再檢查 Low / Minimal / Reduce Motion。袋子 ownership 在時序記錄約 79 秒移到既有 Visitor A；約 118 秒顧客離店。錄影為 25fps 編碼，不代表實測遊戲 FPS；沒有音效驗收。
- `evidence/native-v4/browser/ui-acceptance.webm`：獨立、未剪輯 UI 驗收，從真正完成遊戲流程的 QA checkpoint 接續；沒有假造現金、庫存或收入。窄螢幕架位選擇實際提交 display command。
- `evidence/native-v4/render/before-v31-original.png`、`after-orientation-only.png`、`final-v4-matched-camera.png`：1440×1000、High、相同初始 Sandbox／camera／lighting。中間狀態只有隨附的 CCW adapter patch。
- `final-v4-stocked-shop.png` / `final-v4-desktop-stock.png`：正式命令入貨後的實際遊戲；商品跟隨真實庫存。另有角色 Web／GLB 對照和五語系手機版面截圖。

遊戲影片、模型對照、後續 UI 驗收的 source commit / app source tree、SHA-256、影片 metadata 及分開的時序記錄都保存在 evidence。影片採集後至交付只補測試、文件及包裝，遊戲 src tree 保持一致。GLB 對照兩個 canvas 的平均 RGB 差異小於 0.002 / 255；此數值只證明該 fixture 的 Web / GLB 一致性，不能自動代表美術品質接受。

## 誠實的驗證邊界

雲端使用 Chromium WebGL2 / ANGLE SwiftShader **軟體渲染**。High 實畫面與 Low 互動錄影均已看到；不是 NullEngine、概念圖或舊影片。320/375px 是桌面 responsive emulation，沒有實體手機鍵盤、手機 GPU、30/60 FPS 或音效保證。B 的袋子完整 correctness 已在 actual scene adapter 測試；未單獨錄製 B 交袋影片。新 rig 仍是保留 pivots / sockets 的 articulated rigid hierarchy，沒有聲稱 GLB 內含 skeletal clips 或完成 Android/iOS/Unity 移植。

目前角色／家具已實際升級並接回原遊戲；概念圖仍是風格目標，未宣稱即時 3D 與生成圖像素一致。

## 發佈狀態

完整原歷史已正常導入並推送原 GitHub origin，沒有 force push。最終 SHA 由交付 receipt 指定。完整 source/history 可由 canonical GitHub main 或兩包 source ZIP 還原；Web Candidate ZIP 提供 `dist/`。

**原公開 Site 尚未更新。** 此雲端沒有 Sites 發佈工具；請由原 Work/Sites 流程讀取完整工程、保留 `.openai/hosting.json` 並發佈此候選 build。GitHub push、build ZIP、雲端環境設定都不等於遊戲已部署。Keith 無需在公司電腦安裝開發工具。
