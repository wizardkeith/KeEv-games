# W1.1A1 — focused UI refinement

2026-10-22（香港）。依同日 Visual Review and Work Prompt 執行，延續已接受 W1.1A1 Closeout；來源修正仍封存，不重開 A1／A2／F1–F3 或新增故事、經濟與特效。**3D 視覺待確認**。

Site：appgprj_6ad82a08ed2881918ebcc2dd206a122d
URL：https://next-stop-little-shop-w1.starry-ridge-5482.chatgpt.site

開始前以正式 source helper 核對最新 canonical commit 為 `6c42daeae2246275bc98553b774fe800c068cc32`，Site version 5／public／policy revision 2，沒有其後工作被覆蓋。本輪實際 source commit、Site version 及部署結果由交付檔所附 `DELIVERY_RECEIPT.json` 記錄。回執是 commit 後的交付 metadata，不聲稱它已在相同 Git commit 內。

## 改動與理由

1. 入貨：收緊目錄與數量／目的架上方留白，移除重複的目的架說明；每件成本／本次總額並排，入貨後現金仍在動作之前。購買與上架分開、保留商品所在卡片、數量／總額及目標架標籤，沒有全局固定購買列。原 52dvh 手機 drawer、底部導航位置、主要字體及 44px 操作目標不變。
2. 玩家文案：五語「灰盒供應商」改為一般入貨目錄；沒有創造正式供應商身份。技術移植標記留在 README／CONTRACT 等開發文件；「關於此試作」保留本機存檔／正式帳戶轉移未保證、美術／數值／翻譯待審等玩家限制。
3. 手記：保留溫暖標題與完成內文；先顯示入貨／欣賞小店，之後只顯示一次本地化 Select 品質、獨立 Unique 標記，以及「教學樣本 · 無經營加成 · 非正式故事物品」。沒有更改品質 ID、Unique tag、0 stats 或存檔含義。
4. 定價／陳列：新增情境專用五語字串「儲存售價」「取消改價」「收起陳列」，共用 apply／cancel／clear 未改；原商品仍在存貨說明保留。動作 handler 不變。Standard 商品品質也使用共用本地化顯示字串。

只更改 src/ui/panels.ts、src/style.css、五語 JSON 與對應作者文案 rows；其餘為文件、附件與實際證據。src/main.ts、world、core、storage、presentation、schema2／ts-w1-2、內容 ID、catalog、所有原始資源／歷史 masters／authoring、測試及 lockfile 不變。未重匯出 GLB，未重新開啟封存的資產證明工作。

## 實際驗證

- 原有 **57 tests PASS，0 fail／skip／cancelled**；沒有為純間距／文案新增重複實作的測試。
- content validator PASS：10 商品、五語各 174 keys、六品質階與獨立 Unique 不變。新增 6 個顯示 key；supplier／revealed 為原 key 文案更新。
- TypeScript／正常 production build PASS；原有大 chunk warning 保留。
- 目視比較 managed Chrome 電腦版 1363×936 與 375×780 CSS iframe 的修改前後入貨／手記。這是 CSS viewport，並非手機實機或觸控效能驗收。
- 五語均在 scrollTop=0 時完整顯示首件購買按鈕；實測 buy bottom=680.875、panel bottom=701 CSS px，按鈕高44px，頁面沒有橫向溢出。五語完成卡後續操作亦在首屏內。
- 目視保存的窄屏截圖為 zh-HK、EN、TH；JA／zh-CN 以實際 DOM 文案與座標核對，不把錯時合成的畫面冒充指定面板截圖。
- 數量0：invalid 與對應錯誤說明、禁用購買、焦點留在同一 input。數量1000：不足現金提示¥348,600；之後還原5。Tab 數量→目的架、Escape 關閉並返回入貨導航焦點、PageDown 讓面板 scrollTop>0（觀察131）正常。雲端原生 wheel wrapper 未推動 iframe，沒有據此宣稱手機觸控測試。
- 改價草稿900→取消後回800，現價仍800。完成卡「入貨」開入貨面板，「欣賞小店」進 Zen 並可返回。未執行入貨、銷售、清架、改價提交、匯入或重置；沿用既有隔離審查進度，顯示現金一直¥51,400。未觸碰正式玩家 DB。
- 新的正常 production 移除 QA wrapper、review DB/key 與編譯開關；審查頁只由 VITE_ART_REVIEW=1 的本地 build 產生。正式 build 不包含測試頁。

## 視覺證據界線

本輪 QA 仍回報 `Error: WebGL not supported`，更新 UI 的錯誤時間為 2026-10-21T16:45:05.251Z（香港2026-10-22 00:45）。截圖只證明 UI，並不是小店3D實拍、光影／材質／動效驗收或FPS。未以空白 canvas、NullEngine 或AI圖替代。

因此本輪不調整3D構圖、光影、材質、人物及特效。Bible §9／20／28／29，以及原ART／VFX規格仍是後續依據。沒有要求安裝軟件、Unity、driver或更改公司安全設定。

## 下一份最少3D取樣

同一公開網址、平時看得見3D的瀏覽器及現有進度即可，不必重置或額外買貨：

A. 更多→欣賞小店：窗邊、地板、櫃台及三架的 Zen 全景。
B. 選架2，再開入貨／店務：正常操作畫面，方便時用平時手機。
C. 有限縮放：兩三款已有商品與通用人物近鏡，含受光及陰影面。

只方便一張先傳A；短片可選。附裝置／瀏覽器、畫質、最少特效及系統減少動態狀態。若只見「3D未能啟動」，回傳提示即可。既有 docs/W1_1A_Visual_Check_zh-HK.md 的路徑繼續有效。

## 來源與交付

完整可重建來源由同一 Site canonical Git checkpoint 保存；重建：Node24 + 原 lockfile，npm ci → npm test → npm run validate → npm run build。原來源／資源歷史與上一輪完整來源ZIP保留，沒有重製封存的 Closeout 證明包。

本輪交付是 UI handoff／實際測試結果與修改前後畫面證據；ZIP包含本輪真正部署回執。採完整關閉 writer 後正常 ZIP reader 的 CRC／清單檢查，再提供實際大小與 SHA256，不交付尚未寫完的ZIP。

上一輪 accepted handoff 逐byte封存於 docs/HANDOFF_W1_1A1_Closeout_Archived.md；回退點為 version5／6c42daeae2246275bc98553b774fe800c068cc32，只回退程式，不回退玩家進度或更改 public。此輪 UI 範圍完成後停止；3D精修等待真正畫面判斷。
