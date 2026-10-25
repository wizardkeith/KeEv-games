# V9 independent release review

**未接受／release hold：兩項 P2 新動作問題需修正。** 沒有發現經濟／存檔資料安全阻擋；不是因為最終美術尚未完全達標而單獨阻擋增量試玩。具體問題是迎賓沒有使用目前 staff 原點計算朝向，以及新收銀距離令交袋跨空滑行。建議只修正座標／接觸關係，再針對 greeting、cashier transfer、body/prop clearance與取消做重驗；不展開新故事／玩法／新店／套裝或全面重做美術。

Parent 已確認最後 immutable candidate **`0e4fff3c400ea02eedaa69e01dd08c79be171627`**，application **`600b539a23e577e83d014b4f4c809e59f3b7648e`**，相同 src tree **`4cd18b993557f435fa4760feea053f1f441a89f0`**。本次先固定 `c99e157…`／runtime `0d8404c…`（tree `68e97ac…`）完成獨立 UI／motion，再核對最後差異只有 eyelid recipe及兩個 QA tools；兩項涉事 motion source、UI/core/save/list都相同。已於最後候選版重新執行162 tests／build／validators／asset rebuild／handoff geometry probe及package核對。沒有把初始60案例冒稱重新全跑在final。

最後 delivery **126檔**已實際打開並逐檔等同本次 clean build，3,689,078bytes，SHA-256 **`15c8c5388c1874f16fc688687cf5bf8ac62dc0ffb6af80b11104621ecc9b008f`**；140項provenance大小/hash全相符。Parent confirmation及package缺口已解除；目前hold原因是下列P2，不是仍等artifact。沒有實作修正、PR metadata／merge／publish／Site／本機 Unity操作；公開仍按main receipt為V15。

## P2 — 離開收銀原點後，迎賓朝向仍用舊座標計算

位置：[`src/presentation/native-attention.ts:7`](https://github.com/wizardkeith/KeEv-games/blob/0e4fff3c400ea02eedaa69e01dd08c79be171627/src/presentation/native-attention.ts#L7)、同檔 17／20；caller [`src/presentation/native-scene.ts:65`](https://github.com/wizardkeith/KeEv-games/blob/0e4fff3c400ea02eedaa69e01dd08c79be171627/src/presentation/native-scene.ts#L65)。`angle()` 及選客距離固定使用收銀位置 `[2.6, −0.65]`，而 routine 已移動 Misaki 到迎賓點 `[2.2, 1.4]`。

重現：新隔離 Sandbox → 開店，讓既有顧客入店、staff 行到 welcome 並 greeting。實際 browser trace（單獨錄影 44.744 秒、greeting age 1.7）記錄 staff `[2.2,1.4]`、guest `[1.37018,1.78744]`；root yaw 2.67431，而由**現時 staff 位置**計算的朝向應為 2.00761 rad，偏差 **38.20°**。在另一輪同樣重現。獨立重算 final 165.68秒錄影的trace，在42.949秒／greeting age1.75，仍偏 **36.92°**（actual2.68059、expected2.03626rad）。它不是有上限轉身尚未追上的瞬間，而是 target 本身用了舊原點。

建議：把 current staff X/Z 及正在 greeting 的 guest identity 傳入 attention；welcome／customer 目標與選客距離使用當前座標，保留既有 shortest-arc／work orientation 邊界。加上「迎賓位＋兩客」幾何朝向回歸，再查看真實 wave。不要僅加大轉身速度。

## P2 — 收銀交袋時手部距離過遠，袋跨空滑行

位置：[`src/presentation/native-routes.ts:43`](https://github.com/wizardkeith/KeEv-games/blob/0e4fff3c400ea02eedaa69e01dd08c79be171627/src/presentation/native-routes.ts#L43)、[`src/presentation/native-scene.ts:90`](https://github.com/wizardkeith/KeEv-games/blob/0e4fff3c400ea02eedaa69e01dd08c79be171627/src/presentation/native-scene.ts#L90)。顧客 servicePoint `[3.95, −1.45]`，staff checkout 回 `[2.6, −0.65]`；handover 把同一袋由 staff 位置 interpolate 到 recipient，`.18s` Lerp 沒有先要求兩手接近。

重現：真實 Sandbox 買入／陳列／營業 → 15 分鐘結算 → 讓雙方走到收銀。Actual scene adapter 的 NullEngine 量度在 progress 0.642857：staff socket `[2.93553,1.48257,−0.47457]`、guest socket `[3.75083,1.20748,−0.99483]`，相隔 **1.0055m**；袋由約 `[2.93,1.14,−0.48]` 到 `[3.64759,0.87748,−0.93365]`，**0.20 秒視覺時間移動 0.8906m**。實際 WebGL 錄影也有相同 ownership／progress 轉換。這是連續跨空滑行，非接觸後換 owner；舊測試只驗證單 frame 位移小於 0.1m，不能保證自然交接。

建議：協調兩方 cashier 停靠點／伸手姿勢，從真實 socket 求可接觸 meeting point，在實際接近時交換 owner；同時保留櫃面／門口／身體 clearance。驗證**整段**袋與雙手距離／總路徑，而非只縮短 Lerp 或放寬單 frame 門檻。

[可重跑的純場景量度 probe](probes/v9-handoff-measure.ts)：repo root 執行 `node --import tsx docs/reviews/probes/v9-handoff-measure.ts`；只使用記憶體 Core／NullEngine，沒有 DB、玩家 save 或 economic callback。需把此report probe放到固定candidate checkout的同一相對位置、安裝其依賴後執行；main仍是V15，不應在main runtime上量度V9。Portable probe亦已在final checkout重跑，得到相同數值。輸出資料與圖片是幾何／實際軟件 WebGL 證據，不是實體裝置自然度簽收。

## 本次真正完成的檢查

- 初始checkpoint及最後immutable candidate均實際執行 `npm test`／build／validate／replay／asset-check；初始有 `npm ci`。最後**162 pass，0 fail／skip**；`npm run validate`／`replay`／`asset-check`／`build` 全通過（既有 large-chunk warning）。Replay cash5020／stock4／net180／units6。
- 重新執行 `generate-v9-surfaces.py` 及五個既有 asset exporters：**225 tracked assets/public** hash 全部不變（final再次重建通過）。獨立 glTF validator 掃描**全部 139 個 tracked retained GLB（含歷史 master/public，較宣稱72範圍更廣）**，0 error／warning（final再掃描同樣139／零error-warning）；其中 public 55 個亦單獨驗證。
- 本次核對的 **99 個 protected source/config/input paths**（core/platform/content/narrative/source-inputs、accepted stock/pricing list及state/copy、package／hosting）對 base `5a88308…` 相同；沒有把作者較廣的192個數字照抄成獨立結果。原 Bible／reference 與原 W1.1B masters 無改動。另按final preservation manifest逐檔獨立比較全部 **247 protected files**，亦無改動；沒有照抄數字而省略比對。
- 真正 production preview 執行 **20 set＋20 pricing＋20 stock 五語／320、375px × 420、812px cases**，0 page errors。Hover／click／tap／Enter／Space／Escape／focus／44px／無水平或 nested scroll、現時啟動 vs 上次0%／10%、取消／leading-zero／pending新草稿／連按／abort／reload、580px drawer／已調整 camera pose 均過。
- 舊 V5 QA Sandbox 透過 UI 匯入／完整 reload／再買入／新 pricing row 改價通過；隔離 Normal baseline 保留。不是玩家 Normal save。
- 自行錄製 **168.76 秒**連續 Low＋Minimal 實際 greeting／walk／positive＋negative settlement：正值收入 **JPY2850**、實售成本 **JPY1450**、毛利 **+JPY1400**，3件；負值收入 **JPY30**、成本 **JPY1450**、毛利 **−JPY1420**，3件。均與 reports delta 相符，並清楚標示「本次結算毛利／未扣人工、租金等費用」。正批次有 receipt-matched generic bag transfer；負批次是無可用顧客的 counter fallback，**沒有宣稱虧損也完成顧客交袋**。162 tests 另覆蓋實際加權 book-cost 的成本 basis。沒有 fictional per-customer profit、revenue/net profit 混稱。
- 第一次 motion harness 同時跑 UI 時在等待 margin 的固定 iteration window 超時，當時 commit 已成功、顧客仍 to-service，未見額外 economic write。單獨重跑只延長等待、收起既有 story overlay（無 app 改動）後完成；**不把首次 failure 隱藏或當作 physical FPS 通過**。
- 額外三次真實結算 queue probe：分別約338／629／273ms完成提交，視覺 batch／pending margin 有上限2；Reduce Motion 清 queue／props，完整 reload 不重播 margin、不多結算。Probe 起初錯把 settlement 預期為新增 commandIds，修正為核對 revision 後通過；這是 reviewer probe 假設錯誤，非產品修正。True background-tab／native-device lifecycle 未實測；源碼及既有 tests 有 hidden/epoch/reload cancellation。

- Final另啟動 `v9-high-qa.cjs` 的1440×1000 High work-pose capture，在180s等候條件超時；再以1000×760相同條件捕捉亦180s超時。沒有得到本次final新work截圖，兩次均不標示為pass；原因未充分定位，不能排除High工作流程／此環境渲染時序問題。Final已提交的1000×760 High work/two-guest實拍及provenance bytes已直接檢視／核對；不是把它們冒稱為本次1440設定測試。這項雲端High等待／性能限制尚未歸因為產品功能故障，亦不影響上述兩項獨立幾何P2證據。

## Set／scope 與視覺評估

`set-status.ts` 直接讀 current shelf 配置及 stored breakdown；active／inactive 有文字、展開符號與原生 button，不依賴顏色。可重現「目前已啟動、上次結算0%」，下一次結算才變10%，移除後「未啟動、上次10%」；售罄仍配置在架上的規則也說明清楚。prototype 沒 assigned tier，明說中性 fallback，沒用 Standard／Unique 冒充。Bible 只有概念品質語彙／Visual DNA，沒有 canonical hex palette；沒有憑空替此 prototype 指定稀有度。

本店加乘依最新 scope 仍是 planned handoff placeholder，無需現時 functional；三張新 placement PNG 未讀，不能簽收精確位置。此項不列作本輪缺陷，也不加入能力 progression／新店／新故事／套裝擴張。

實際 High render 已重做並直接與既有 approved PNG 比較：第三層既有牆架、window trim／canopy、既有植物與陳列層次、木／布／灰泥材質及接地光影有實質進步。整體仍偏規整、部分木紋條紋／重複尺度較突出；target 的有機植物／髮衣輪廓、細緻材質與自然窗光氣氛差距仍大。新 welcome 朝向使 staff 可正常望入口，stills 出現背面本身不是 bug；上述 P2 是相對真正顧客的幾何偏差。**不簽收最終美術／完整自然動作，不解凍新內容。** 後續先修兩個動作空間關係，再保持同店面／鏡頭／庫存做美術對照。

## Evidence／final reconciliation

- [本次初始checkpoint High全景](evidence/v9-independent/panorama.png)／[final錄影迎賓frame](evidence/v9-independent/greeting-final.png)
- [正毛利](evidence/v9-independent/profit-margin.png)／[負毛利](evidence/v9-independent/loss-margin.png)
- [final錄影迎賓方向量度](evidence/v9-independent/greeting-angle-final.json)／[交袋場景量度](evidence/v9-independent/handoff-measure.json)

**Final reconciliation完成：** parent指定SHA已固定；全部126個archive entries byte-identical、225 asset rebuild、139 GLBs、247 protected files、140 provenance項目核對完成；final actual before/after／High work／motion像素已檢視，final錄影亦保留迎賓偏差。初始60案例、168.76秒自行錄影及舊save測試合理沿用於不變的UI/core/motion source，沒有冒稱全套重錄於final；final eyelid-only差異另以新source/tests/GLB及實際render evidence核對。Library reviewZIP未另下載，因repo artifact已可讀並逐檔驗證。

**Limit：** Chromium ANGLE SwiftShader 軟件 WebGL，不是 physical GPU/FPS、Safari、真手機鍵盤／safe area、audio、true hidden-tab 或 Unity/C#/URP 驗收。之前 public proxy403／Library attachment transfer 沒重試或繞過；沒有操作本機 Unity、玩家存檔、Site或任何 permission/security設定。沒有 denied external mutation；最後候選版／package已確認，**release hold源於兩項P2新動作缺陷**，不是permission denial或pending external write。文件操作只有reviewer交接。

記錄時間：2026-10-25T11:15:56+08:00。
