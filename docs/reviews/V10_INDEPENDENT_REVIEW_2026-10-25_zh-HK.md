# V10 獨立審查：模型重建、營業互動與發佈 gate

2026-10-25T17:08:53+08:00。**今次候選暫不接受發佈：先修正 P2 布袋配件與袋身分離，再做針對性重驗。最終目標美術亦仍未接受。** 沒有發現經濟／存檔損壞；功能與新 High 完整流程可通過。Parent 協調修訂及任何後續發佈，本 reviewer 沒有實作修正。

Parent 已確認最終 candidate **`486bc3609426023dcb4a53d25f2939c611c41ea9`**；application **`0626469e7d376fe7cd1962370e2955017154bacf`**，相同 src tree **`fcb228bf2463353dcc70d6eb01d899d59a6fab6e`**。初始觀察9758已被新版取代；本次測試與實際渲染均跑0626469，之後完整比對至486bc360：`src/assets/public/package/lockfile` 全不變。已讀最新 AGENTS／PROJECT_STATE（main58fefbe）、Bible既有完整審查及本輪第28章、原批准 target 實際像素、V10 progress/report/evidence attribution。沒有使用新目標替代原圖。

## 按優先次序列出發現

**P1｜最終目標品質／風格尚未達到（持續美術 gate）。** 已確認實際新建人物、十種商品、家具／門窗／植物及材質輸入，超出小幅燈光調整；但在本次自攝 production 全景、同 production recipe 的中性 studio，並對照原圖及提交的同鏡頭 BEFORE/AFTER後，品質仍有明顯距離：

- 人物：`src/art/characters-v10.ts:10–35,47–59` 的髮冠背部仍近圓殼，前髮只是少數厚束；眼／臉層次較平，明顯圓柱頸、袖山與軀幹肩線凹槽、手腕分段、裙／圍裙大塊摺痕仍像簡化人偶。中性照明與遊玩照明分開記錄，沒有將 studio 冒稱標準遊玩鏡頭。新圍裙覆蓋修正有實質作用，本次未再見原突破問題。[自攝全身](evidence/v10-independent/misaki-body.png)、[面部](evidence/v10-independent/misaki-face.png)。
- 環境／陳列：`src/art/shop-v10.ts:11–59`、`native-display.ts:21` 可見桌腳、板件／抽屜、布巾及新印畫；木紋規律感改善，但仍缺原目標的自然商品組合、豐富植物及窗外前後景、細緻布木陶瓷分工與柔和光影層次。[自攝全景](evidence/v10-independent/panorama.png)。
- 十種商品：輪廓、內壁、紙頁及實際印刷圖可辨認，是真實幾何；新增葉印是已保留／核對 hash 的1254×1254 RGB原創 Work albedo，不是3D／動畫。全十款以實際 recipe 獨立渲染檢查；其中布袋有下列具體錯誤。[十款實拍](evidence/v10-independent/ten-products.png)。人物 GLB 的原生布料材質外觀仍未驗收，Web 微法線不可冒稱完整 Native parity。

這個 P1 代表原目標尚未交付，持續凍結故事／玩法／能力／新店／套裝擴張；最終美術 gate 與逐次增量試玩分開。今次增量發佈先處理以下新模型缺陷。

**P2｜新布袋印畫、提手、縫線浮離袋身。** [最終 source `products-v10.ts:22`](https://github.com/wizardkeith/KeEv-games/blob/486bc3609426023dcb4a53d25f2939c611c41ea9/src/art/products-v10.ts#L22) 使用 `sculptCloth(... z:0, thickness:.086)`，而 [sculpt-v10.ts:26–29](https://github.com/wizardkeith/KeEv-games/blob/486bc3609426023dcb4a53d25f2939c611c41ea9/src/art/sculpt-v10.ts#L26) 從前面向正Z延伸；印畫／前提手／側縫卻放在Z=-.047/-.039附近。這是實際幾何分離，不會被 GLB normals／triangle validators 找出。

重現：將本[商品 gallery probe](probes/v10-product-gallery.html)帶到上述 candidate checkout，以 Vite 開啟；用右手座標前上視角查看最左前方的 tote，或在遊戲購入及陳列 `off.tote` 後繞看。前提手端、兩條縫線及印畫都與袋面分離。[獨立實拍放大](evidence/v10-independent/tote-detail.png)。[測量 probe](probes/v10-attachment-measure.ts)直接與真正袋身三角形求交，在同(x,y)沿Z量得：印畫中心 **5.1217cm**、左右縫中心 **8.0305/8.0051cm**、前提手接點中心 **5.9457cm**。扣除1.5mm縫半徑／12mm提手半徑仍明顯懸空。[量測 JSON](evidence/v10-independent/tote-attachments.json)。

修訂建議：統一袋身前後座標，按實際布面求印畫／縫／提手接點位置，再重建商品 JSON master／interchange GLB／production bundle 及同角度拍攝；保留原SKU、尺寸預算和經濟規則。實際受影響的衍生檔是 `assets/masters/native-v3/products-v3.json`、`assets/authoring/native-v3/products-manifest.json`、`assets/masters/native-v4/product-off.tote.glb` 及 `fixtures-manifest.json`；Web 由 `nativeProductRecipe` 直接建模，背景 showroom 亦使用相同 recipe（`src/art/back-display-v10.ts`），所以要重建 bundle。優先修 `off.tote` 本身的共同座標／表面接點；若修改共享 `sculptCloth`，必須保住已修圍裙的 drape／clearance。只需要這個資產的接點／渲染回歸及必要完整性檢查；沒有要求重做玩法或使用者本機 Unity/Blender。

## 本次獨立執行與結果

- `npm test` **173 pass、0 fail/skip**；`npm run build/validate/replay/asset-check` 全部通過。`tools/v10-audit.py` 實跑245 assets/public hash重建及276 protected檔／原11commit ancestry；六個生成／匯出工具後無 asset差異。`v10-mesh-probe.ts`／`v10-asset-probe.ts` 通過；全部139保留 GLB逐一validator零errors/warnings。這些結果沒有代替外觀接受。
- 真正 production Chromium WebGL2／ANGLE SwiftShader，1000×760 High＋Minimal **132.84s**完整錄影通過。原工具會強制Minimal，因此另以隔離QA副本把該一行改成`uncheck()`，再跑 **High完整效果／Minimal=false，138.76s**，實際迎賓、雙人場景、行去收銀、同袋轉手、離場、正負結算、Reduce Motion／關店及隔離Normal保留均通過，0pageerrors。[本次原始完整實拍](evidence/v10-independent/high-full-138s.webm)、[結果](evidence/v10-independent/high-full-results.json)。正批次285−145=140，+JPY1400；負批次3−145=−142，−JPY1420，各三件；從已提交結算到浮字分別25.085s／12.442s。標示清楚是本次結算毛利、未扣人工租金，沒有逐客／淨利假帳。
- `tools/v10-life-qa.cjs` fresh Low/Minimal：歡迎、客人回應、browse、farewell、goodbye均實際出現；五語375px一個泡泡、無橫向溢出、Reduce Motion／關店取消通過。五語新增文案已讀，語意連貫，沒有買家收益宣稱。[本次錄影](evidence/v10-independent/life-full.webm)、[五語結果](evidence/v10-independent/life-results.json)。另獨立執行`QA_EMPTY_FIRST=1`的前段實際空店瀏覽：沒有購買／陳列前，十二個樣本無browse商品評論；這項不是從非空店案例推論。[空店結果](evidence/v10-independent/empty-results.json)。
- 舊v4真實QA Sandbox export（不是玩家Normal）重新import／reload／後續購買及990JPY定價均通過，主要存檔欄位／cash／stock正確且隔離Normal不變。[相容結果](evidence/v10-independent/old-save.json)。三次實際結算各455/466/450ms完成、revision恰增3，視覺queue<=2；ReduceMotion清空、reload不播舊毛利、不再寫經濟。[隊列結果](evidence/v10-independent/queue-results.json)。
- 新版到final的receipt／evidence successor只改文件／交付證據。對770e09c再做`git diff --exit-code`確認 UI/core/platform/content/locales/main/CSS/presentation 仍一致；原有40 pricing/inventory及10 lifecycle案例按提交歸屬查看並復用，本次沒有冒稱重跑全部55。接受的580px drawer／vertical lists／鏡頭源碼保留；fresh High真實購買／陳列／定價及舊save流程再涵蓋主要鏈路。
- 實際重開135-entry tar並逐一同fresh build／hosting／receipt比對，無重名或不安全路徑。**6,302,965bytes，SHA256 `aefd19fe29059aeca7f79c557f39ed3a8d0c2983b02f48ed2b5f1f530df6cc50`**；157個final provenance大小/hash吻合。[本次封包核對](evidence/v10-independent/package.json)。六頁提交PDF存在；實際像素主要直接查看原圖／PNG並自行渲染。使用已在repo的完整證據，不依賴Library跨executor路徑；Library ZIP外層沒有另下載驗CRC，沒有假稱做過。

## 驗收界線與下一步

這次首次獨立完成新模型的High完整效果收銀流程，支持50ms-only時間遺失修訂的實際效果；舊V16本機187秒及兩次180秒失敗仍是歷史失敗，不追溯改pass，也不能證明本機觀察的所有原因。作者額外45秒High idle-work close-up未成功觀察完整姿勢，仍未通過該項；本次沒有以High收銀代替該近鏡結果。139GLBs／錄影編碼fps均不是實機30/60fps證明。

實體GPU/FPS、Safari、手機實體鍵盤、音訊、真正OS hidden-tab/native仍未獨立驗證；frozen→active與政策測試不是OS hidden-tab驗收。原路徑／植足／接觸solver多數保留，動作仍有機械感，不能稱自然度最終完成。三張placement圖仍未讀，本店加乘依指示維持planned/handoff-only。沒有重試被拒的`localreview.html`瀏覽路徑或把該報告換路徑serve；本次QA使用獲授權候選production preview／實際資產studio。

建議 parent **先只修布袋接點缺陷，再交相同固定candidate方式複核**；其後可另判斷增量試玩發佈，維持目標美術gate及內容凍結。此次所有請求的read/test/document操作均完成，沒有新的denied／pending／uncertain外部寫入；產品不接受原因是已重現P2。只更新審查文件／證據及PROJECT_STATE，未修改app source/assets、PR、merge、Site、玩家Normal、本機Unity或權限；公開仍V16。文件commit正常push/readback後由外部回報SHA。
