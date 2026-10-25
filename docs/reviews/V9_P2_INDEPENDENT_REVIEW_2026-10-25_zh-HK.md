# V9 P2 修訂獨立複核

時間：2026-10-25T11:51:21+08:00。**有條件通過增量試玩發佈；舊兩項 P2 release hold 已解除，今次未發現新增 P1/P2。** 最終目標美術、High／實機性能仍未通過驗收。Parent 負責後續整合／發佈；本次只審查及更新文件，公開 Site 仍為 V15。

審查 source：`85bebba9fc1419a8f01b18e46ed821cd1a1e24b2`；application `cf28233398c8e492994908224cf9e3d4a462064c`；兩者 `src` tree `8f668f05af7f5711c72afd5b9f9bbee59ea86e17` 一致。PR #6 仍在獨立分支。讀取最新遠端 AGENTS／PROJECT_STATE（main `365515e78434f111d0c6b79c48089700317c4c34`）、[修訂說明](https://github.com/wizardkeith/KeEv-games/blob/85bebba9fc1419a8f01b18e46ed821cd1a1e24b2/docs/V9_P2_FIXES.md) 並重跑；保留[舊拒收報告](V9_INDEPENDENT_RELEASE_REVIEW_2026-10-25_zh-HK.md)及原始失敗證據。

## 兩項 P2 解決情況

| 舊問題／重現 | 最終 source | 本次獨立結果 |
| --- | --- | --- |
| 職員行到迎賓位置後仍用固定收銀原點，向錯客人方向 | `src/presentation/native-attention.ts:13–25`、`native-scene.ts:60–65` 使用當前位置及指定客人 | 真實 WebGL 七個穩定迎賓樣本最大誤差約 `2.55e-14°`；另一位較近客人測試亦通過。此數值不包括刻意有限速轉身過程。 |
| 手相距約 1.0055m、袋在 0.20 視覺秒橫移約 89.06cm | `native-routes.ts:43`、`native-handoff.ts:7–24`、`native-scene.ts:90–105`、`native-delivery.ts:28`：可到達接觸位置及真實手距確認後交袋 | 原 reviewer probe 直接重跑：交接手距 3.600cm；轉手一幀位移約 `5.96e-8m`。完整接觸窗 24 樣本，袋路程 3.585cm；之後 0.20 秒位移 2.120cm／路程 2.123cm。真實 WebGL 三個接觸樣本最大手距 3.600cm，觀察到同一袋跟客人離場。 |

新增[獨立頂點探針](probes/v9-p2-clearance.ts)在同一路徑以每三幀抽樣約 394 萬個職員／在場客人上下臂及手部頂點，未見進入櫃檯體積；職員／客人根部最小距離 0.690m。這是指定路徑的幾何覆蓋，並非所有衣物、所有動作或物理碰撞完整證明。重新執行的 Visitor A/B 交接、無接觸拒絕轉手、交接前後 hidden/reduced/close/replacement 共八種中斷測試通過，無新結算、原地跳動或舊袋重播。

## 本次實際執行

- `npm test`：165 pass，0 fail；`npm run build`、`validate`、`replay`、`asset-check` 全部通過。
- `node --import tsx docs/reviews/probes/v9-handoff-measure.ts` 舊探針原樣重跑；`tools/v9-contact-measure.ts` 使用真正 handoff acknowledgement，另跑上述獨立 clearance 探針。
- `QA_URL=<isolated candidate preview> QA_OUTPUT=<review evidence> node tools/v9-motion-qa.cjs`：本次錄得 **179.32 秒連續 Chromium WebGL2／ANGLE SwiftShader，Low/Minimal**。實際 Sandbox 入貨、陳列、開店、迎賓、步行、收銀、交袋、離場、正負結算、Reduce Motion、關店；0 page errors，隔離 Normal 基線不變。[完整實拍](evidence/v9-p2-independent/independent-179s.webm)、[摘要](evidence/v9-p2-independent/browser-summary.json)、[交接畫面](evidence/v9-p2-independent/handoff-detail.png)。影片編碼 fps 不是遊戲或實機 fps。
- 真實正結算收入285−COGS145=140（畫面 +JPY1400）；負結算3−145=−142（−JPY1420），各三件。標示清楚是本次結算毛利、未扣人工租金，非逐客／淨利。正結算有指定視覺客人交袋；負結算無可用客人，使用櫃檯 fallback。動畫不發出經濟寫入。
- 全部 **139 個保留 GLB** 逐一 validator：0 errors／warnings；surface generator 加五個 exporter 重建 **225** 個 assets/public 檔，hash 全部一致；**247** 個 protected 檔同基準 byte-identical。
- 實際重新開啟 delivery tar，**126** 個檔逐一對 fresh build／hosting bytes；檔數、路徑唯一及安全、大小及 SHA256 都一致。Archive `4d3e846f0b487b02d1685a2fa2480fa43bc780e04c943af9a888c1b635d53606`，3,690,593 bytes；31 個修訂 provenance entries hash/size 符合。[獨立完整性摘要](evidence/v9-p2-independent/integrity.json)。
- 對舊候選 `0e4fff3…` 比對：UI/core/platform/content/narrative/locales/art/CSS/package/hosting 完全不變；沿用有效的五語言 60 個 stock/pricing/set 窄屏真實瀏覽器案例、舊 Sandbox 相容及 queue/reload 覆蓋，沒有聲稱本次再跑全部 60 個。新增測試包含實際兩位客人定向及接觸中斷，整套交易／存檔回歸已重跑。

## 仍未接受／下一步（按影響）

1. **High 性能未通過，原因仍未完整定位。** 舊兩次 180 秒 High work-capture 逾時仍是失敗；本次沒有將它們改成 pass 或盲目再跑。已查看修訂 45 秒診斷原始資料：44.71 wall seconds 只增加約3.45 visual seconds，未到 work window，無 JS error。`src/world.ts:136–140`／native routine 的有界視覺時鐘可解釋低幀率時動作時間變慢，但不是根因或實機性能證明。成功 Low walkthrough 不代表 High 工作捕捉成功。由於交易獨立、Low 可完整互動，這項目前不阻擋有明確限制的增量試玩；不要宣稱性能正式驗收或所有裝置穩定。Parent 發佈後在隔離 Sandbox 比較 Auto/Low/High 實際操作延遲／幀時間，再另行收斂原因。
2. **目標美術仍有大距離。** 本次重新查看原 `Approved_Visual_Target_Misaki.png` 真實像素及 live 迎賓／交接連續取樣；P2 修訂令行為更可信，但沒有新增美術。既有 V9 的層架、窗景及光材質進步保留；人物髮束／衣料、柔和有層次光影、植物自然度、密度及材質重複仍明顯落後。近鏡手勢仍較機械化；接觸量度不等於最終自然動作或目標圖驗收。維持故事／玩法／新店／套裝／能力擴張凍結。
3. 實機 GPU/FPS、Safari、手機實體鍵盤／觸控、音訊、真正 OS hidden-tab、native 均未獨立驗證；單元政策覆蓋不冒稱 OS 實測。三張 placement 圖仍未讀，沿用已披露 handoff-only 本店加乘，不擴大實作範圍。此項不要求使用者在本機 Unity/Blender 補工。

建議：解除舊兩 P2 hold，允許 parent 按原同一 Site 流程進行本次增量試玩更新，保留上述 High／美術驗收限制。本次沒有需要 KeiTHxMC 先改工程的新增軟件阻擋。無 denied/pending/uncertain 外部操作；沒有 source/assets/PR metadata/merge/deploy/Site/玩家 Normal/本機 Unity/權限變更。文件由執行 reviewer 同步到 main，commit SHA 於外部回報，不在本檔自我引用。
