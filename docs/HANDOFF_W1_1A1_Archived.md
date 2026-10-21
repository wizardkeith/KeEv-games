# 《下一站・小店物語》W1.1A1 — 陶杯／材質／特效生命週期小修

2026-10-21（香港）。完成來源修正、回歸及可玩候選交付；**3D 視覺待確認**。沿用原 Bible、Part II、chill／治癒／溫暖／精緻方向。本輪沒有新增故事、角色、天氣、特效種類、燈光或後製。

## 同一公開 Site 與來源

- URL：https://next-stop-little-shop-w1.starry-ridge-5482.chatgpt.site
- Project：`appgprj_6ad82a08ed2881918ebcc2dd206a122d`
- 開始前以 Sites source helper 核對最新 canonical：`8296c3251b0a7bfd43221781ba7241319891f396`，與審核基準相同；沒有較新工作需要覆蓋／合併。
- 本輪起點為 Site version3、public、policy revision2；使用者已確認公開，保持原設定與網址。
- 新 source commit、實際 Site version、部署 ID／結果在交付包 `DELIVERY_RECEIPT.json`；獨立下載版 HANDOFF 亦附實際回執。

經營核心、schema2／ts-w1-2、十款商品／ID、價格規則、normal／sandbox DB keys、CAS、command dedup、migration、復業支援、P&L 及所有原43測試保留。125個受保護舊檔逐 byte 對照起點無差異（core、content、storage、lockfile、原資產／字體／輸入／authoring）。沒有以美術擺拍覆寫玩家存檔。原 W1.1A handoff 封存於 `docs/HANDOFF_W1_1A_Archived.md`。

## 先重現，再修正

審核包完整保留於 source-inputs/w1_1a1-review，19個原始檔的 MANIFEST hash 全吻合。新重現結果另存 evidence/w1_1a1/baseline：

- 幾何射線證明杯沿缺口，把手沿X與杯身分離；實際 runtime material factory 對比 GLB import 確認雙面設定不一致。
- 原 main 函數邊界重現 hidden commit 後仍啟動 sale FX／1次audio；100ms/frame時UI先結束但scene只走600/1100ms；貨架實改index1而feedback指index2。
- 這些是來源／數學／mock呈現邊界重現，不是實際 WebGL 畫面。舊把手問題也存在於W1.1，沒有稱作本輪新回歸。

## A1、A2、F1–F3 實作與測試

| 項目 | 修正 | 實際可執行證據 |
|---|---|---|
| A1 陶杯 | 杯沿使用與內外壁相同的12段邊界，封合完整壁厚並保留中央空腔；XY平面C形把手有上下兩個接點，保留把手孔，不伸入杯腔。 | 108條跨壁厚／角度射線、中央杯底射線、邊界頂點對照；上／下接點 y=.070/.180 的實際三角形交集含杯身表面，約5.69mm壁內接觸；來源／實際GLB交點誤差<1e-7m。法線、端蓋、繞序、非退化三角形通過。不是只看AABB。 |
| A2 材質一致性 | shared spec 明確 doubleSided；glass雙面，其餘閉合表面維持單面。共同render identity包含顏色／alpha／粗糙／金屬／IOR意圖／alpha mode／雙面設定；runtime／exporter讀同一狀態。 | 抽取實際world.material()執行，與15個GLB獨立import的76個材質比較：alpha blend／顏色／alpha／roughness／metallic／backFaceCulling／twoSidedLighting一致。GLB JSON亦逐項檢查。IOR仍是已披露extras意圖，沒有聲稱KHR_materials_ior或一般importer一致。 |
| F1 hidden後commit完成 | run在await前捕捉presentation epoch；交易照常保存、事件照常消費／去重，但hidden或已取消epoch不啟動FX／聲音。world入口再防hidden／disposed；文字摘要可保留。 | 真實Saves＋fake IndexedDB＋deferred Promise，測hidden時resolve及先返回visible再resolve；state只commit一次，FX/audio呼叫0，回來同事件不重播。 |
| F2 Skip與場景 | 只有world真正接受且允許動態時才顯示Skip；用共用vfx.reveal.duration。UI deadline明確取消scene；scene自然完成／取消／替代／Low／Minimal／reduced亦通知UI結束。舊timer有epoch與當前狀態guard，不能取消替代效果。50ms dt clamp保留。 | 100ms/frame模擬12幀時Skip仍在；UI deadline後scene/UI同步清除。正常幀、timer先到、被另一事件取代、stale timer、skip、hidden／mode、場景失敗、Low／Auto降級／Minimal／reduced全部覆蓋。已提交reveal和完成卡保留。 |
| F3 貨架目標 | click發起時捕捉不可變slot，command與成功文字都用它；projector再從已提交填入的changed shelf推導FX。selection仍可轉動，不跳回舊架。 | 執行真正main click/run/act函數，延後Saves結果：指令架2、await期間選架3，資料／通知／FX仍架2，selection仍架3；no-op／失敗／重複無新錯誤動畫。 |
| 診斷 | worldEverReady與worldAvailable分開；worldReady現指目前可用，startupMs保留歷史。context loss清理呈現與world。 | 真正diagnostics函數邊界：曾ready後dispose仍ever=true、available／ready=false，歷史startupMs不變。 |

Lifecycle測試執行真正來源函數；只明確mock DOM、audio、timer及renderer邊界，相關交易使用真實Saves＋fake IDB。不是GPU生命週期或實體裝置測試。主要FX上限1、pool12 meshes、微塵8、queue0、原優先順序與音量／品質／降級政策保持不變。

## 驗證結果與界線

- **55 tests PASS，0 fail／skip／cancelled**：原43全部保留＋A1/A2五項＋呈現／診斷七項。逐名結果：evidence/w1_1a1/tests.log；新呈現完整邊界：presentation-tests.log。
- 內容：10 Offerings、五語言各168keys、六品質階級與獨立Unique；無新增文案、字型或平衡改動。
- 新15個versioned GLB masters：**495,332 bytes**，Khronos **0 errors／0 warnings**；獨立重匯 **15/15**、76材質檢查通過。舊原始counter／skin、W1.1A匯入亦重新通過；歷史masters／manifest／source hashes保留。
- TypeScript、production build PASS。既有>500KB chunk warning保留，沒有升級／隱藏門檻。
- Production遞迴檢查沒有review DB/key、VITE_ART_REVIEW或QA頁；沒有部署tests／evidence／source inputs。
- Supported preview本輪再次啟動，明確回報 **Error: WebGL not supported**。**沒有取得真正3D前後圖、動態或觸控／FPS證據。**
- 獨立compile-only review DB實際DOM流程：命名→buy5 notebooks→架2→開店→advance1h→真實售5、cash¥51,400→High且Minimal關閉→reveal。完成卡立即出現，completion=true／revealing=0／Skip=0；reload保留cash／完成卡、notices=0。場景不存在時不留無作用Skip。詳見BROWSER_REVIEW.md。

待確認：實際光影下杯沿／把手、玻璃背面與透明排序、慢幀Skip／局部FX觀感、真實hidden/resume、GPU context loss、OS減少動態、手機觸控與裝置幀時間。NullEngine／validator／ray／mock tests都不能填補這項視覺缺口。

## 來源、資產版本與效能

新資產屬原有project-original procedural geometry修訂。W1.1與W1.1A權威GLB／Web copies／manifest／證據保留；修改前另凍結W1.1A geometry／recipes／materials／exporter／validator於assets/authoring/w1_1a/source_snapshot，記錄原commit/hash。新exporter只寫w1_1a1。

15個新master在assets/masters/w1_1a1；只把3個直接受影響的mug／counter／room新Web derivatives（159,624bytes）加到public/assets/w1_1a1，其餘新master不再重複加入runtime下載清單。遊戲仍從共用recipe建立場景。詳見ART_W1_1A1.md。

來源盤點（不是draw calls／GPU/FPS）：empty173／max-stocked233 meshes、64材質身份，與上版相同；max-stocked vertices28,394／triangles32,748，較前+16／+12。沒有增加FX／光源／貼圖／render target預算。

本機production files（非實際網絡傳輸）：W1.1A 4,183,538 raw／1,588,367 gzip-9 bytes → W1.1A1 **4,344,788 raw／1,618,574 gzip-9 bytes**。包括歷史資產與3個新derivatives；cold/warm startup、GPU記憶體與FPS未量測。exact file rows及方法在evidence/w1_1a1。

GLB、材質意圖、recipe和VFX參數可供Android／iOS重用；Unity／URP、IOR／透明排序、平台input／storage／audio／clock／pool仍須native adapter與實機驗收。TypeScript核心仍PORT_REQUIRED_FOR_UNITY，C# proof保持凍結。

## 重建、回退及交付

Node24、原精確lockfile。`npm ci` → `npm test` → `npm run validate` → `npm run asset-check` → `node tools/validate-art-w1_1a1.mjs` → `npm run build`。需要重新匯出時：`node --import tsx tools/art-w1_1.ts`，只寫w1_1a1。歷史來源重建請在獨立副本恢復source_snapshot和其baseline catalog／contracts／lockfile，勿在目前工作樹運行舊exporter覆寫歷史權威檔。

瀏覽器審查用`VITE_ART_REVIEW=1 npm run build`（本輪新隔離DB），發佈前一定重新普通production build。不能為擺拍匯入覆寫玩家sandbox。原有草稿／focus／scroll／五語言UI修正保留。

Source checkpoint包括來源、原始規格／審查證據、masters／授權、測試、凍結來源與部署回執；排除依賴安裝目錄、快取、build output、憑證和玩家存檔。回退點是Site version3／commit8296c3251b0a7bfd43221781ba7241319891f396：只回退程式／資產，保留public，不回退玩家進度。

後續最多三種畫面仍是Zen全景、架2＋面板、商品／角色近景；方便可用10–15秒短片觀察動效。沒有要求安裝driver／Unity或改公司安全設定；畫面回傳不是完成本輪其餘工作的前置條件。
