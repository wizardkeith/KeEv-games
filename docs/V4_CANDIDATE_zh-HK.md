# v4 雲端候選版本

從公開 Site v11 的完整 `10c070c8121aecfd9e3e1ac9d0db213947416a08` Git 歷史接續。保留原 GitHub origin、Site hosting identity、Bible、Web-first Addendum、經濟與存檔。交接原圖和 v4 指示在 `docs/codex-v4/`。

## 整合內容

- 每件商品獨立數量草稿、5/10/20 設定、即時計價／不足金額、持久成功提示；買入後原地選三個真架位，明示替換與移動。搜尋／篩選／缺貨卡暫留，支援五語系、鍵盤和窄螢幕工作區。
- 買入在 await 之前擷取 item ID、quantity、mode；沿用同步 busy 和正式 Saves 命令。Normal／Sandbox 草稿隔離；舊 global draft 僅於載入時遷移，不改經濟 schema。輸入節點使用原 keyed DOM patch 保留 raw text、focus 與游標。
- 只在 RH／CCW neutral mesh adapter 設定 CCW；保留正常 culling、腿部與陰影，不改內杯壁或第三方 loader。
- 連續、有厚度的 bob 髮殼、眼睛／鼻／眉比例、完整圍裙 bib 與袖口接合；保留角色 IDs、所有 pivots、sockets 和 rigid hierarchy。三位角色共用 Web／GLB authoring，沒有聲稱 skeletal clips。
- 三種桌面 runner、堆疊文具和非機械排列；展示數量由正式庫存決定，零庫存不畫可售商品。低對比原創木紋有 metre-based UV、sRGB 用途及 lossless master。
- 放慢巡航並校準步幅；可通行的轉角使用經淨空檢查的曲線。短轉角步、提前落腳方向、恢復移動時重新安排空中腳，保留支撐腳 anchor／IK。看貨先有視線，再伸手。店員 crossfade 改為 .32–.37 秒，交袋抬手時確保袋體離開櫃檯。
- 可達性決定現有 Visitor A／B 的交袋；維持期限、單一袋 owner、pool、取消與 fallback。動畫不寫入收入／庫存。

## 重建

使用 Node 24.19.0／npm 11.9.0，從工程根目錄執行：

```sh
npm ci
python3 tools/generate-v4-textures.py
node --import tsx tools/export-native-characters.ts
node --import tsx tools/export-native-environment.ts
node --import tsx tools/export-native-products.ts
node --import tsx tools/export-v4-fixtures.ts
npm test
npm run validate
npm run asset-check
npm run replay
npm run build
```

`dist/` 為標準靜態 Web build。沒有新增服務、付費依賴或秘密變數。GLB／texture masters 在 `assets/masters/native-v4/`，目前三個角色 GLB 保留既有穩定路徑 `assets/masters/native-v3/`；舊版仍在原 Git 歷史。

## 驗證與發佈範圍

實際測試／渲染／錄影結果見本目錄後續驗收記錄及 `evidence/native-v4/`。舊 `evidence/native-v3_1/` 為歷史證據。

當前雲端可使用 Chromium 的 WebGL 2.0／ANGLE SwiftShader 軟體渲染。這是當前 runtime 圖像證據，不能代表手機實體 GPU 或商用 FPS 保證。桌面 responsive emulation 不等於手機鍵盤／真機測試。

保留 `.openai/hosting.json`。推送 GitHub 或輸出 build 都不表示原公開 Site 已更新。此環境沒有 Sites 發佈工具；需由原 Work／Sites 流程發佈此候選版本。沒有建立替代 Site 或虛構 deployment receipt。

所有操作使用雲端工具，Keith 無需在公司電腦安裝開發環境。
