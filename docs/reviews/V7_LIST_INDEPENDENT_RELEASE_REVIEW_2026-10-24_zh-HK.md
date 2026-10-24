# V7 直向入貨清單：獨立 release gate

**有條件通過，可作安全增量試玩發佈。** 原先因橫向卡片而暫停的設計 gate 已解除；本次未發現 P1／P2 阻擋缺陷。實際像素及操作符合最新要求：桌面每件商品一行、六欄對齊、有小圖；窄屏維持連續商品列及欄位標籤，使用一般垂直捲動，沒有 carousel、水平溢出或列內獨立捲動。這不等於最終參考美術／實體裝置驗收。審查者沒有 merge、PR metadata 變更、Site 操作或實作修正；公開 Site 仍為 V13／V6，parent 處理發佈。

## 固定來源與本次結果

- **真正測試 candidate** `1fe2bbbc28c0e90debae9f313faf066310bcbb78`；runtime `8f12d614e3a1fc03a7940ac43e247913b387c834`，兩者 `src` tree 均為 `18da5bd9d74d0e958adc4bce82362721ee88a5df`。讀取當時 remote main `17fca522a6607c80115b397816b72eeb5deb655b` 的 AGENTS／PROJECT_STATE；保留先前暫停紀錄。
- `npm ci --cache /tmp/keev-review-npm`、`npm test`：**148 pass，0 fail／skip**。`npm run validate`、`npm run replay`、`npm run asset-check`、`npm run build` 全部成功，既有 large-chunk warning。Replay cash 5020、stock 4、net 180、units 6。
- `PLAYWRIGHT_BROWSERS_PATH=… QA_URL=… QA_OUTPUT=… node tools/v7-inventory-list-qa.cjs` 對本次新 build 真正執行：六欄／十列／native wheel、五個 580px drawer 與實際調整後 camera pose、鍵盤 buy→place→架位、focus／垂直位置、無效／連按／延遲／abort 原子交易、搜尋／filter／panel／reload、花瓶原始 `007`／selected 都通過。**20 個五語 × 320／375px × 420／812px 觸控買入／上架案例**、44px controls、零 nested row scroll、零水平 overflow、Reduce Motion、隔離 Normal baseline、0 page errors。
- 額外獨立 Playwright walkthrough：320×420 原生 CDP vertical touch swipe（scrollTop 0→144）、legacy rail preference 遷移（不把 2723px 誤作垂直位置）、空搜尋返回、花瓶 `007` 與 scrollTop 1671 的 panel 往返保留；五語 × 1280／720／721px **15 個額外版面邊界案例**通過，數量 1000 的欄位亦無 cell overflow。這些不是舊 rail 測試沿用。
- 真正 V5 QA Sandbox export 經 UI 匯入最終候選版，18 個身份／經濟／存貨／架位／事件／watermark 等欄位一致，完整 snapshot reload 相等，之後再購買成功。僅用隔離 QA Sandbox；Normal baseline 不變，未讀寫玩家 Normal save。
- 對舊 V7 `01b5499` 的 **331 個 protected art／motion／master／public／core／platform／content／narrative／source-input／package／hosting files** 全部無改動；原 v11 baseline 仍為祖先。舊 Bible／approved target 內容及已讀證據維持有效。另重新執行三個 asset exporters，**212 個 tracked assets/public 檔案逐檔 hash 不變**；這是本次完整 tracked 範圍，沒有照抄作者的 207 數字。`gltf-validator.validateBytes` 實際重新掃描全部 **55 個 retained public GLB：0 error／warning**。
- 實際打開新版 delivery tar：**122 檔（121 runtime＋hosting）逐檔等同本次 clean build**，無重複／不安全 entry；3,177,368 bytes，SHA-256 **`c94eb88a5de051e75e1a5b0502a8d1a0bb5d954f33c1be85c2dc179b81467c8e`**。新版 provenance 的 **58 個檔案大小／hash 全部相符**；不要使用舊 rail archive。

## 非阻擋觀察與界限

**P3／後續品質：最終 Misaki／店面參考仍未達成。** 直接比較 approved target、V7 before／after 與本次 live render：前額開口／眼睛、較暖髮色及 counter 淺色 inset 有小幅改善；有機髮束、面部／布料細節、豐富家具與柔和環境光仍較簡略。相關位置為 [`src/art/native-characters.ts:55`](https://github.com/wizardkeith/KeEv-games/blob/1fe2bbbc28c0e90debae9f313faf066310bcbb78/src/art/native-characters.ts#L55)、[`src/presentation/native-scene.ts:51`](https://github.com/wizardkeith/KeEv-games/blob/1fe2bbbc28c0e90debae9f313faf066310bcbb78/src/presentation/native-scene.ts#L51)。重現：新 Sandbox → 更多 → 店員鏡頭，與 approved target PNG 比較。下一輪宜集中正常鏡頭下輪廓／臉部與衣物材質，無需阻擋此次列表修訂試玩。

本次另外在實際 Low＋Minimal 軟件 WebGL 觀察 35 秒：看見 `tidy`／`check-note` 及相應 props，Reduce Motion 轉成 `native.staff.still.v3` 並移除 props。便箋／整理動作可辨認，但手部接觸與細緻自然度仍屬後續品質工作。已檢視保留原片的 25.8 秒連續 excerpt、逐秒 chronological frame samples 及全尺寸 frame；25fps 是影片編碼，**不是**實體遊戲 FPS，也沒有據此簽收完整 walking／packing／handoff 的自然度。六個 art/motion component hash 與 final 一致；舊影片內 rail 畫面只屬歷史，不用作新版清單證據。

**KeiTHxMC：沒有發現必須先做本機試玩才能排除的具體軟件 blocker；不新增發布前 gate。** 建議增量發佈後以全新隔離 Sandbox 短測直向清單、實際手機鍵盤／觸控與視覺舒適度。若要簽收真機 GPU／FPS、Safari、safe area／虛擬鍵盤、音訊、true hidden-tab 或最終美術，則仍須另行實際裝置／用戶確認。此雲端審查不能代替，亦未操作 KeiTHxMC／本機 Unity。之前公開 proxy CONNECT 403 未重試或繞過；公開網址 payload／live smoke 未驗證。Unity／C#／URP native 不在本次已通過範圍。

Owner ZIP `libfile_7f2f9cdcea848191b3a4f13efcf23e93` 的前次 supported materialization 結果是 `download failed`；沒有新相關證據支持重試，所以未重試，也未取得可讀 ZIP 或宣稱已讀其像素。repo 的實拍證據與本次獨立 runtime 已足以檢查本輪列表要求。沒有工具拒絕被繞過；這項素材傳輸缺口仍存在。

## 本次獨立畫面

- [1280×720 六欄清單](evidence/v7-list-independent/desktop-list.png)
- [375px 簡中 JP¥48,200](evidence/v7-list-independent/narrow-zh-CN-cash.png)
- [320×420 花瓶 007](evidence/v7-list-independent/vase-007-320x420.png)
- [固定候選版 handoff／實拍與交付包](https://github.com/wizardkeith/KeEv-games/blob/1fe2bbbc28c0e90debae9f313faf066310bcbb78/docs/V7_INVENTORY_LIST.md)

記錄時間：2026-10-24T19:13:57+08:00。
