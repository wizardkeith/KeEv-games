# Misaki R7：額前髮幕候選，未接受／來源與證據已同步

更新：2026-10-28T07:00:40+08:00，Asia/Hong_Kong。

本機已完成一輪有結構變化的髮型候選及實際引擎對照。**R7 仍未獲美術接受；source及完整證據checkpoint均已成功同步，報告／PNG／驗證JSON的不可變證據提交為52cf6601ad7dc70638cb034a478c21ff3ad1e1aa。** Source commit是`d5ad1dc746c84274ef455ead76681ce4c3782f5d`，已由正常non-force push送到既有`codex/asset-foundation-v1`並獨立讀回相同遠端SHA。證據checkpoint的最終SHA及同步結果由交付訊息外部讀回，不在本文自引用。

隔離checkout：`KeEv-games-handoff`。本輪基線`cec0c83464291d885ae363ff22d2881ba7d08dda`保留完整R6及確定性修正；沒有checkout舊快照或改寫歷史。最新讀取main仍為`beda04d6852c05bbcbb528f4edce32c027ade2ed`，其PROJECT_STATE已讀，main／PR／Site均未改。

## 實際原圖與對照

編輯前重新打開原始 `Approved_Visual_Target_Misaki.png`，1536×1024，SHA256 `9f855d2ecfd120bb45c001db3fa9b5a3e3b58b2b3c2a4cf9e7ebfda84f8f7114`，以及 R6 報告、原圖／R5／R6 對照。沒有重新嘗試 PlanB 傳輸，沒有聲稱看過其畫面；側／背仍是推定。

- [原圖／同機 R6／R7 正面頭部](reviews/evidence/misaki-grayform-v1-r7/original-r6-r7-front-head480.png)
- [原圖／同機 R6／R7 三分之四頭部](reviews/evidence/misaki-grayform-v1-r7/original-r6-r7-threequarter-head480.png)
- [原圖／R6／R7 正常遊戲鏡頭](reviews/evidence/misaki-grayform-v1-r7/original-r6-r7-normal-game480.png)
- [完整原始 14 張引擎實拍及載入記錄](reviews/evidence/misaki-grayform-v1-r7/capture.json)
- [裁切、比例縮放、排版及來源 SHA 記錄](reviews/evidence/misaki-grayform-v1-r7/comparison-provenance.json)

對照使用同一次本機 headless Chrome／Intel ANGLE 渲染。各自的 fresh context 載入已固定 SHA 的 R6 或實際 R7 GLB；同一份未改的 authoring TS、材質、鏡頭和燈光。只在頁面文字標籤標示 R6/R7，沒有改模型光影。原圖本來是不同姿勢／投影的三分之四插畫，不能當成精確正交正面。比較圖只裁切、等比縮放、排列和加標籤，沒有改顏色、補畫或生成參考。

## 改了甚麼、仍有甚麼問題

R6 主前髮像一片短葉，額前包覆不足。本輪打開真正 R6 `.blend`，只替換10主髮幕及11短層的原生四邊面控制網：主髮幕10×11×2共220控制頂點，短層8×7×2共112頂點；主髮下緣沿額角斜向落下，保留不等高的轉折，短層獨立由分界伸向內側額前。厚度側壁及一級局部 Subsurf 均可繼續編輯；隱藏曲線只是參考，並非假稱的即時驅動。

實拍顯示 R7 比 R6 更低地包住額角，短層在三分之四可辨。但**主髮幕仍過於整塊、側邊仍顯厚重，下緣錯落在最終渲染中偏弱；短層仍近似窄條，尚非原圖自然的重疊髮束**。原圖的細長髮束和自然髮根未建立；本輪凍結的12–16側／背 bob 仍規整。新髮幕也更接近自身右眼上緣，須覆核是否遮得過多。沒有自判身分或風格 PASS，沒有藉此擴展衣服、材質、動畫。

這次由背景 Python 設定明確控制頂點，再檢視真實渲染；**沒有做 GUI 拖點操作，也沒有證明可獨佔一個顯示器**。整輪沒有桌面輸入、切換焦點、控制使用者 Blender／Unity 視窗或讀取原瀏覽器 profile。

R3 眼睛及改進過的臉／頸、身體、髮夾、其他五片頭髮保持原樣。42個其他物件的原生頂點／面／變換／材質及 evaluated 幾何均逐一核對相同；GLB 的所有27個非頭髮 POSITION／NORMAL／index streams 及 TRS 仍通過原 R5 byte assertions，R3臉／眼／身體24streams仍通過。既有確定性 sRGB8 修正和所有遊戲規則、五語、存檔、accepted props、studio/gameplay TS 均未改。

## 真實產物與核對

| 產物 | 大小 | SHA256 |
| --- | ---: | --- |
| [可編輯 `.blend`](../assets/authoring/misaki-grayform-v1/misaki-grayform.blend) | 1,366,225 bytes | `71a6de35f99476a3d155a6912eb5a3eac05a5ddcecf00521928729765e7e8702` |
| [實際 `.glb`](../public/assets/misaki-grayform-v1/misaki-grayform.glb) | 908,476 bytes | `764d578b0b1fd5958b9773c6abfa0efa87ab13bf0f99b653dbbfc0bb853da4cf` |

Blender5.2.3LTS 先保存真正 `.blend`、輸出 GLB，再以另一個背景程序重新打開 `.blend`；接著在空場景重新 import GLB，兩者均確認44個原生mesh／5個GLB mesh、總49,720tri。兩片新髮的 evaluated shell 閉合、沒有零面積面，但這不等於角色碰撞、hair-head間隙、製作拓撲或 rig 合格。7灰材質、10primitives、0images／skins／animations，實際足底Y=0。重開時有非阻塞的 Blender extensions cache 寫入權限警告；沒有改設定，載入／保存／匯出及 import 仍成功。

已執行，全部 exit0：

- `misaki-hair-r7.py` 真正保存及匯出；`inspect-misaki-r7.py` 獨立重開兩種格式。
- 原 `validate-misaki-gray.mjs`，0errors／0warnings；保留所有原 byte assertions、29個 accepted prop 檔案保護。
- `tsc --noEmit` 及 `vite build`；Vite保留既有大chunk提示，未隱藏門檻。
- 原完整測試 **304/304 pass、0fail、0skip**。
- `validate`、`replay`、root `asset-check`、authoring strict TypeScript。
- `capture-misaki-r7.cjs`：14張真實引擎 PNG，GLB實際HTTP載入SHA吻合，0pageerror，同鏡頭／光／材質斷言通過。fresh Sandbox買3杯：cash5000→4790、stock3、slot2；reload存檔逐值相同，Low→High保留sample。所謂Normal不變只指隔離context中的基線；沒有開啟或碰觸玩家真實profile／Normal資料。
- scope guard：基於本輪CEC基線，其他5,216個既有 tracked 檔案不變；新增只限R7工具／報告／證據。測試產生的歷史 locomotion 證據已另存本輪結果並還原原 tracked bytes。

正常遊戲鏡頭中的新物件是後方灰色 A-pose authoring sample，放置 `[.85,.079,1.35]`、yawπ；前方彩色 gameplay staff 是原版本，沒有替換。縮至正常遊戲尺度，髮型差異很小；截圖不是整體原圖相似度或新造型採用證明。無實體裝置／持續FPS／音訊／動畫認證。

重現指令在 [authoring README](../tools/asset-foundation/MISAKI_GRAY_README.md)。原R6回退可由CEC提交逐byte取回。本輪baseline暫存已在完整證據同步後收入逐檔驗證的壓縮回退檔，詳見清理回執；重建時可按README重新建立暫存目錄。

## 同步狀態、恢復經過與下一步

最初staging/commit被自動審批拒絕，理由是審批上下文缺少直接用戶美術任務。該次未執行。父緒補回用戶要求「再繼續重做」、「成個model要從底層重做」、本機Web開發及逐階段cloud sync的原話後，同一操作經正常審批重試一次，成功建立source commit d5ad1dc746c84274ef455ead76681ce4c3782f5d。沒有再要求重複授權、改AGENTS、安全設定或認證路線。

隨後第一次推送遇exec-server transport disconnected，環境變為unavailable；獨立GitHub唯讀確認當時遠端仍CEC，未聲稱已交付。恢復同一環境後先核對本地HEAD、空index、完整未提交證據及實際遠端CEC，確認remote為ancestor才正常push。這次exit0，獨立ls-remote讀回d5ad1dc746c84274ef455ead76681ce4c3782f5d。

完整證據commit 52cf6601ad7dc70638cb034a478c21ff3ad1e1aa包含本檔、14張原始實拍、6張比較圖及來源／測試JSON，已normal push並獨立讀回同SHA。此後只補充同步／清理收尾記錄，沒有更改來源、美術或圖片。來源／匯出／比較圖的SHA在環境恢復後再次核對；沒有冒充重新跑全套測試。

完整證據同步後，只清理本任務hair-r7冗餘暫存。先建立ZIP並逐一核對22個檔案的長度及SHA256，確認全部可回復才移除原暫存目錄；2,298,681 bytes變為933,145 bytes的回退ZIP，實測邏輯資料容量減少1,365,536 bytes。未量度或聲稱實體磁碟free-space／RAM節省。回退ZIP仍在task根目錄，sha256 c19e26692111b9a6b184ece08dfd097c4ff6960f9da88c2dfd4c2443262683c9；正式blend/glb、原圖、Git回退、必要證據、node_modules／store／dist及其他用戶資料全保留。詳見[清理回執](reviews/evidence/misaki-grayform-v1-r7/cleanup.json)。

現在停在獨立視覺覆核checkpoint：主髮幕仍整塊、短層偏窄、髮根與bob未達原圖。無新美術迭代、GUI、Unity遷移、PR重試、merge、公開Site或玩家存檔變更。最終收尾commit與遠端讀回仍由交付訊息外部回報，避免自引用。
