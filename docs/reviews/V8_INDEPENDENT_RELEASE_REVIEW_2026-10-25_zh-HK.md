# V8 art／pricing 獨立審查

**有條件通過：可作安全增量試玩版；最終美術 gate 未通過。** 未發現 P1／P2 軟件阻擋。店務定價已成為直向清單，accepted 入貨列表與交易規則保留；實際 3D 有可見且具體的改善，整體仍與批准目標有很大距離。故事、玩法、新店、套裝繼續凍結，不以今次通過開啟下一個內容階段。審查者沒有改實作、PR metadata、merge 或 publish；公開版本仍按 main receipt 為 V14，parent 安排後續 release。

## 固定來源與技術結果

Candidate **`972a9f6efb598ae40ec4bbb5c8b86da92b1aa383`**；runtime **`ac134fd5dec19f64aa00e0b4441e3006f07c8a0b`**，兩者 `src` tree **`6b0e747182b5b2ad498e27d23fec0ffc3478a244`**。開始時讀 remote main `bb807adb7fd94b486a612371c55d6cc806dfd2ba` 的 AGENTS／PROJECT_STATE，沿用未改動的 Bible／approved scope，重新直接檢視 approved target PNG 像素。

- `npm ci`（使用臨時 cache）；`npm test`：**150 pass，0 fail／skip**。`npm run validate`、`npm run replay`、`npm run asset-check`、`npm run build` 全通過；既有 large-chunk warning。Replay cash 5020／stock 4／net 180／units 6。
- `gltf-validator.validateBytes` 重新掃描 **55 public GLB：0 error／warning**。實際重跑 `export-misaki.ts`、`export-native-products.ts`、`export-native-characters.ts`、`export-native-environment.ts`、`export-v4-fixtures.ts`，**212 tracked assets/public** 檔案 rebuild 前後 hash 相同。
- **111 protected files** 對 V14 receipt base `208c445…` 相同：core／platform／content／narrative／source inputs／hosting／package、所有 presentation motion、accepted stock list/state/copy/session。原 v11 baseline 仍為祖先。沒有新增 SKU、店舖、玩法、故事 predicate 或 save schema／balance 更動。
- 實際 final-build Chromium WebGL：`tools/v8-pricing-qa.cjs` 的 **20 五語 × 320／375px × 420／812px touch price-save cases** 全過；五欄對齊、三個原有架位／空位、44px targets、無橫向／nested row scroll、錯誤／取消、Enter／Tab focus、leading zero／panel／reload、delayed／repeated／abort／recovery、新 pending 草稿、remove／restock／placement 全過；cash／stock／bookCost 與隔離 Normal baseline 保留，0 page errors。五個 drawer 仍為 580px，camera pose 保留。
- accepted stock `tools/v7-inventory-list-qa.cjs` 全套回歸亦完成 **20 五語窄／短屏 touch buy/place cases**，包括真正調整 orbit／zoom 後 camera、鍵盤 focus、無效／連按／delayed／abort、花瓶 `007`／選取、query／filter／垂直位置／panel／reload；重跑 0 page errors。首輪最後的固定 250ms wheel 斷言失敗，見下方 P3；沒有隱藏該失敗或改 app 使其通過。
- 額外獨立 Playwright probe：JPY **10／1,000,000** 兩端正確轉成 core 1／100000；ArrowUp 依 10 JPY step；11 的錯誤修正成 10 後仍為**同一 input node**，`aria-invalid` 及同列狀態清除，per-product JPY label 存在。Pending captured **830** 時改成 **00940**，切換 report／pricing 再連按，僅提交一次 83；新草稿經 reload 保留，再 Enter 成功提交 94。另 **15 五語 × 1280／720／721px** 邊界版面無 cell／document overflow。沒有寫玩家 Normal save。
- 真正舊 V5 QA Sandbox export 經 UI 匯入，18 個身份／經濟／存貨／ledger／watermark 等欄位保留，完整 reload snapshot 相同，其後實際買入與新 pricing row 改價成功；隔離 Normal baseline 不變。
- 逐檔打開新版 archive：**121 runtime＋hosting＝122 檔**與本次 clean build 一致，3,184,867 bytes，SHA-256 **`0c199367f738d14af3e6472a7f9ff607e6a4ed6de67238933e26f2360e54221e`**。50 個 evidence provenance 大小／hash 相符；七個 art/world component 同 capture checkpoint 及 final 一致，capture 後差異為 pricing-only。未把舊 capture 當成 final pricing 證據。

## 美術觀察：實質改善，但未完成目標

已直接檢視 approved repo PNG、同鏡頭 High＋Reduce Motion before／after，並用 final candidate 真正買入／陳列三類商品、重做 High shop／panorama／staff capture。畫面「小店選物 · v6」係工具固定 QA 店名，不是 release 版本；本次渲染使用上述 final candidate。新 capture 的 staff camera pose 與 receipt 相同（alpha −π/4、beta 0.8726646、radius 4.7150267、target [2.55,1.02,−0.73]）。以下依目前視覺影響排序，均是後續美術工作，不是新玩法建議：

1. **整體場景／光影層次差距最大。** 目前大面積牆／地面仍偏均一、陳列與植物輪廓稀疏，窗邊至室內的明暗與冷暖分層較弱。Target 的木材、植物及道具群形成更豐富的前／中／後景；V8 的暖 bounce 與接觸陰影只完成其中一部分。下一輪先在**同一店面、同一鏡頭／庫存**處理既有陳列、植物分組與窗光方向／材質尺度，不加新 SKU 或地圖。位置：[`src/art/native-view.ts:48`](https://github.com/wizardkeith/KeEv-games/blob/972a9f6efb598ae40ec4bbb5c8b86da92b1aa383/src/art/native-view.ts#L48)、[`src/art/native-environment.ts:79`](https://github.com/wizardkeith/KeEv-games/blob/972a9f6efb598ae40ec4bbb5c8b86da92b1aa383/src/art/native-environment.ts#L79)。重現：新 Sandbox 買入／陳列 notebook、mug、tea → High → 全景，與 target 比較。
2. **Misaki 面部可讀性改善最明顯；髮與衣物仍過於整齊／簡化。** 開額、temple sweeps、較清楚的眼睛，在正常 staff 鏡頭可直接看出，並非只換色。髮殼分束／髮尾、臉部柔和度、cardigan／裙／apron 的結構及材質細節仍未達 target；沒有證據支持 final-art acceptance。位置：[`src/art/native-characters.ts:55`](https://github.com/wizardkeith/KeEv-games/blob/972a9f6efb598ae40ec4bbb5c8b86da92b1aa383/src/art/native-characters.ts#L55)、[`src/art/native-characters.ts:78`](https://github.com/wizardkeith/KeEv-games/blob/972a9f6efb598ae40ec4bbb5c8b86da92b1aa383/src/art/native-characters.ts#L78)。重現：High／Reduce Motion → 店員鏡頭。
3. **櫃面／枱布／植物是有用的幾何改善，細部自然度仍有限。** Cabinet frame／inset 比先前較可讀，枱布真的越過桌緣，新葉片改變輪廓；所以今次不是純 cosmetic noise。它們仍偏規整、重複，木／布／葉的尺度與粗糙度、既有植物的生長方向和層次還可提升。位置：[`src/art/native-environment.ts:131`](https://github.com/wizardkeith/KeEv-games/blob/972a9f6efb598ae40ec4bbb5c8b86da92b1aa383/src/art/native-environment.ts#L131)、[`src/art/native-environment.ts:148`](https://github.com/wizardkeith/KeEv-games/blob/972a9f6efb598ae40ec4bbb5c8b86da92b1aa383/src/art/native-environment.ts#L148)。優先保留正常鏡頭下可見的大形與材質分離，再增加小細節。

26 秒 motion excerpt 逐秒 chronological actual-frame samples／全尺寸 frame 已檢視；另把 **650 個 decoded frames** 的 32×24 灰階縮圖與原片連續片段對比：最佳起點 original frame 781（31.24 秒），平均 absolute error 0.057／255、最大單 frame 平均 0.175，支持連續來源一致；不是人眼完整流暢度或實體 FPS 驗收。25fps 是編碼。可見顧客／staff 活動及真正 purchase projection；presentation motion 源碼未改，沒有新證據可宣稱步行、轉身、packing／bag handoff 已達 target 自然度。

## P3：QA 固定等待造成不穩定結果

[`tools/v7-inventory-list-qa.cjs:17`](https://github.com/wizardkeith/KeEv-games/blob/972a9f6efb598ae40ec4bbb5c8b86da92b1aa383/tools/v7-inventory-list-qa.cjs#L17) 在 `mouse.wheel(-220)` 後只等 250ms。首輪 20 個 touch cases 完成後在最後 wheel 斷言失敗；一個額外短 probe 的同類固定等待亦失敗。只加入診斷 log、保留原斷言的完整第二輪則通過（461→241）。另外四次以狀態等待的普通／Reduce Motion probe 全部 500→280，wheel 未被 preventDefault；發出至讀回移動約 394–826ms，包含雲端／自動化排程。未重現功能性 wheel 阻擋，應把 QA 改為有上限的 scroll-state／event 等待；**本審查沒有修改工具或 app source**。這也是不可用雲端結果宣稱實體裝置即時反應／性能通過的原因。

## 交付與尚欠範圍

- [本次 final-build High 全景](evidence/v8-independent/panorama.png)／[Misaki／櫃面](evidence/v8-independent/character-close.png)
- [本次定價 desktop](evidence/v8-independent/pricing-desktop.png)／[320×420 繁中](evidence/v8-independent/pricing-320x420-zh-HK.png)
- [固定候選版 handoff、原始 before／after／影片／package](https://github.com/wizardkeith/KeEv-games/blob/972a9f6efb598ae40ec4bbb5c8b86da92b1aa383/docs/V8_ART_PRICING.md)

軟件 WebGL renderer 為 Chromium／ANGLE SwiftShader。High shadow map 為 2048、Low 1024；physical GPU／FPS／startup／Safari／真手機鍵盤／safe area／音訊／true hidden-tab／Unity／C#／URP 未驗收，不能由上述 tests 或影片編碼推斷。沒有新具體軟件問題要求先用 KeiTHxMC 才能排除；實體性能及最終視覺仍需真機／owner 確認。既有 public proxy CONNECT403 未重試／繞過，公開網址 live payload／Sandbox smoke 未由本審查驗證。

重新附加 JPEG `libfile_8331a41ec92c8191a12e7a908c4d770a` 沒有本地可讀 bytes，本次未重試已失敗的 supported transfer，也未宣稱看過附件；owner 確認係同一既有目標，repo approved PNG 已實際檢視。沒有新的 Library 輸出 ID、待確認 external write、permission bypass、玩家 Normal save 或本機 Unity 操作。

下一步只做一輪以**既有店面構圖／窗光明暗與 Misaki 髮／衣物質感**為主的可比美術 checkpoint，保持 pricing／stock／economy 凍結；parent 可按已有授權安排今次增量試玩，不能把這份 review 當成內容解凍或 final-art approval。

記錄時間：2026-10-25T05:23:23+08:00。
