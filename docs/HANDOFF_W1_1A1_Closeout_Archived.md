# W1.1A1 source closeout — startup visibility P3

2026-10-21（香港）。完成本輪局部來源收尾後封存；不展開全面美化、故事、角色或新內容。**3D 視覺待確認**。

同一Site：appgprj_6ad82a08ed2881918ebcc2dd206a122d
URL：https://next-stop-little-shop-w1.starry-ridge-5482.chatgpt.site

開始前以正式source helper核對canonical為`2da2ca394bd2e1c0d3ec65d6e0f712b21a5294c4`，Site version4、public／policy revision2，沒有較新工作需要覆蓋。本輪保留public、同網址、玩家正常／沙盒進度及全部W1.1A1主要修正。新commit／實際version／部署結果見交付包根目錄 **DELIVERY_RECEIPT.json**；它由實際Sites發佈回覆在source commit之後產生，是明確標記的delivery metadata，並非Git原始檔。獨立下載HANDOFF亦附實際回執。

## 唯一遊戲來源修正

main的visibilitychange及focus接線移到boot開始、第一個await之前；UI可操作前已能記錄hidden取消。resume明確要求state與Saves都就緒，原有normal／busy／hidden／blocking等保護保留。舊world完成後的重複註冊位置已移除；main listener只有一份。world自己的內部暫停處理沒有改動。

正常提交、事件消費／去重、presentation epoch／world入口防禦、完成卡及無WebGL時的Skip政策不變。這是首次載入期間的過時呈現P3殘留，不是新的金錢／庫存／獎勵重複提交問題。

修正前用附件原startup probe重現：first-world pending時main listeners=0；hide→resume epoch仍0；之後commit有FX1／audio1，revision4→5、售出5件。
修正後同probe：listeners在pending期間已為1，hide→resume epoch0→1；commit仍revision4→5、只售5件，但FX0／audio0。probe的exit0只代表收集觀察，真正acceptance assertions另在新增測試。

## 實際測試與保存

- **57 PASS、0 fail／skip／cancelled**：原55具名案例完整保留，新增2個boot／deferred-world案例。逐名輸出在evidence/w1_1a1_closeout/tests.log。
- 新測試抽取真正boot/run/commit/cancel/resume函數，使用真實Saves＋fake IndexedDB，只mock瀏覽器事件、DOM、audio、timers與world工廠。驗證接線早於core/state/world await及第一個actionable draw、未初始化normal resume安全、listener前後均1份。
- 測hide→visible→world ready→延後結果交付：只commit一次，FX／audio0，回來同事件不重播。正常可見control仍FX1／audio1。
- 測hidden後首次world失敗：UI fallback保留，結果仍commit一次，FX／audio0，返回後不補播，無孤立Skip。
- 內容檢查PASS：十商品、五語言各168keys、六品質階級與獨立Unique不變。TypeScript與production build PASS，原有chunk warning未隱藏。
- 普通production無review DB/key／VITE_ART_REVIEW／QA頁。測試只用隔離review DB，沒有重設fixture或覆寫玩家normal／sandbox。
- 開始文件收尾前逐byte核對原334個tracked files：只有src/main.ts不同，其餘333檔相同。後續只增加本輪測試、交付檢查工具、審核輸入／證據及文件。
- 原A1/A2、F1–F3、全部資產／masters／authoring歷史、經濟核心、schema2／ts-w1-2、storage／CAS／migration／dedup、P&L／復業、字型／五語言及依賴均未改。本輪沒有重新生成GLB或擴大美術驗收。

## 瀏覽器與證據界線

本輪fresh compile-only QA build經支援的managed preview再次回報`Error: WebGL not supported`。既有隔離review進度現金¥51,400、Tokyo11:00、完成卡仍可開、無Skip；沒有執行經濟操作或重設審查存檔。

真實GPU world尚不可用，因此startup hide/resume的瀏覽器動態、杯／材質觀感、透明排序、OS減少動態、觸控及裝置幀時間未驗。boot race的受控測試、GLB／NullEngine舊成果都不是實際3D畫面驗收。沒有要求更改安全設定、driver或安裝Unity。

## 完整交付流程

上輪接收副本被獨立確認截斷，不能視為完整checkpoint；無法確定截斷在打包、上載或傳送哪一步發生，也不代表公開runtime缺檔。本次從精確新canonical commit重建全部tracked files，沒有重包partial local records。

新`tools/checkpoint.py`流程：在暫存路徑完整寫入ZIP並關閉writer／flush；再以正常ZipFile reader重新開啟，檢查全部CRC、無重複entry、exact檔案清單及每個Git blob的SHA256。SOURCE_MANIFEST.sha256覆蓋全部tracked source，包含src、tests、tools、tsconfig、Bible和所有素材。部署回執／final handoff是額外且標明來源的metadata。只有完整驗證後才atomic rename至最終交付檔名；之後不再修改ZIP。最後提供實際大小與整包SHA256。

DELIVERY_RECEIPT.json必須實際在ZIP根目錄，內容與本輪實際發佈一致。完整來源包排除安裝依賴、快取、build output、認證與玩家存檔。保存後另取回ZIP副本核對大小、SHA256、正常reader CRC與manifest，結果如實列在最終交付；不把未完成的下載當作驗證通過。

## 重建、回退及封存

Node24與原lockfile：npm ci → npm test → npm run validate → npm run build。需要美術驗證／重建的舊指引及證據完整保留，但本輪沒有改資產，無須再匯出。TypeScript核心仍PORT_REQUIRED_FOR_UNITY，C# proof保持凍結。

回退點：Site version4／commit2da2ca394bd2e1c0d3ec65d6e0f712b21a5294c4；只回退程式，不回退玩家進度或更改public。W1.1A1交接封存於docs/HANDOFF_W1_1A1_Archived.md。此輪來源修正至此封存；3D視覺門檻保留待確認，不自動展開新美術／內容工作。
