# V7 部分獨立審查：發佈驗收暫停

用戶最新澄清入貨要採用 Excel inventory 式直向列表：每件商品一行，保留 icon／小圖，以一般垂直捲動瀏覽。現有橫向卡片設計未獲批准；本報告不作 release approval。等修訂候選版再驗收。PR #4 保持 draft，未合併或發佈；公開 Site 仍為 V13／V6。

## 固定來源與阻擋項目

實際測試 candidate：`01b54997075ecb324acce6a05d98ffc0f76b6980`。與 runtime `b323129040b1414f0e60cc3a05090c44cffab1cb` 的 `src` tree 同為 `5176ecfa2b54a27f8e6a5011f0ea744a17810aac`。

- **P1／發佈 gate：入貨版面與最新要求不符。** `src/ui/stock.ts:12` 仍呼叫 `productRail`，`src/ui/stock.ts:14` 輸出整張商品卡；`src/style.css:99` 保留卡內細節垂直捲動。重現：Sandbox → 入貨 → 用箭頭或左右捲動切換商品；不是每件一行的 inventory list。下一版應沿用交易／草稿／小圖功能，改為有清晰欄位的直向商品列及一般垂直捲動，再重驗短屏、鍵盤與五語。

## 本次已完成的獨立檢查

- `npm ci --cache /tmp/keev-review-npm`；`npm test`：**145 pass，0 fail／skip**。`npm run validate`、`npm run replay`、`npm run asset-check`、`npm run build` 全部成功；既有大 chunk 警告仍在。Replay cash 5020、stock 4、net 180、units 6。
- 對 canonical base `c3c706aabae0ff32b56ab7c4b733d0cbea722892` 比較 **94 個 protected files**，核心、平台、內容、敘事、source inputs、package／lock、hosting 全部無改動。沒有修改玩家 Normal save。
- 真正舊版 V5 QA Sandbox export 透過 UI 匯入：18 個身份／經濟／存貨／陳列／報告／事件／watermark 等欄位相符，完整 snapshot 重載不變，再購買成功；全新隔離 context 的 Normal baseline 不變。不是玩家存檔。
- 實際 Chromium WebGL／ANGLE SwiftShader：所有桌面 drawer 580px；真正調整 orbit／zoom 後，五個 panel 開關／切換的 camera pose 保留。鍵盤購買後 focus 留在 Buy，下一個 Tab 到 Place；入貨、同卡上架、位置及原始草稿保留。無效輸入、連按、延遲 IndexedDB 提交及主動 abort 測試通過，沒有重複扣款或存檔部分寫入。
- `PLAYWRIGHT_BROWSERS_PATH=… QA_URL=… QA_OUTPUT=… node tools/v6-ui-qa.cjs`：20 個五語／320、375px × 420、812px 觸控購買／上架案例、44px targets、reduced motion、搜尋／filter／草稿／重載與隔離 Normal baseline 通過，0 page errors。這是已開始檢查的收尾，沒有繼續發佈驗收。
- `QA_URL=… QA_OUTPUT=… node tools/v7-layout-qa.cjs`：**15 個五語／1280×720、320×420、375×812 layout cases 通過**。實際檢視本次截圖：數量／總額／買入／上架可見；375px 簡中 **JP¥48,200** 完整。花瓶 `007` 在重載及 Report→Stock 後仍為 selected，保留原始文字與水平位置。這些是舊設計的修正結果，不取代最新列表要求。
- 實際打開 delivery tar，**122 個檔案（121 runtime＋hosting）逐檔等同本次 clean build**，無重複／不安全 entry。gzip SHA-256 `b5e8847769c7c7c16f0d6a6546643734c639a00de6c0be1be9dd1b8c6bd13942`。46 個 provenance evidence 項目的大小／SHA-256 全部相符。

## 美術、證據與界限

已直接檢視 approved Misaki target PNG、repo 的實拍 before／after 角色圖及本次實際 stock 截圖。V7 前額開口與眼睛可讀性、較暖髮色、counter 淺色 inset 有可見小幅改善；目標圖的有機髮型、細緻面部／衣物與家具、柔和環境光仍未完成。暫停後沒有繼續完整 motion／performance acceptance，沒有宣稱最終 target 通過。

- [本次獨立 375px 簡中畫面](evidence/v7-partial/stock-375x812-zh-CN.png)
- [本次獨立 320×420 英文畫面](evidence/v7-partial/stock-320x420-en.png)
- [固定候選版的實拍美術 before／after 及原片](https://github.com/wizardkeith/KeEv-games/tree/01b54997075ecb324acce6a05d98ffc0f76b6980/evidence/native-v7/browser)

Library owner baseline `libfile_7f2f9cdcea848191b3a4f13efcf23e93`：本執行者使用 current supported materialization helpers，prepare 成功，但 materialize 回報 **download failed**；沒有取得可讀 ZIP，未檢視其 36 JPG／2 JSON，沒有自行繞過下載限制。此為失敗結果，非下載成功或已讀像素。程式／本地 runtime 檢查已繼續完成。

145 tests 及 asset-check 不等於本次重跑作者聲稱的 207 deterministic rebuild 或 55 GLB validators；這兩項未獨立重跑。完整連續影片動作、實體 GPU／FPS、Safari、真實手機鍵盤／safe area、音訊、true hidden-tab、Unity／C#／URP、用戶最終美術接受仍未驗證。沒有 merge、PR metadata 改動、Site 操作、實作修正或本機 Unity 操作。

記錄時間：2026-10-24T18:52:07+08:00。
