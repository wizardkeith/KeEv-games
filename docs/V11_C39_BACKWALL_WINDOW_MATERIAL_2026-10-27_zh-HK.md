# V11 C39：後牆—右窗的單一材質候選，尚未採用

Application：`061f9b0e86982020a21b6ce1b6eec161908f0204`。分支 `codex/game-v11-target-slice`／[Draft PR8](https://github.com/wizardkeith/KeEv-games/pull/8)。C38 的植物／室外深度 FORM 已由父任務轉達獨立 PASS；本次鎖定253形體，只進材質階段。**C39 材質待獨立覆核；整體原圖仍未達標。無旗標預設仍是 C36，未合併、未發佈，公開 V17 未由本輪改動。**

## 實際遊戲比較

- [唯一原圖／基準255／候選256，正常店高480px](../evidence/native-v11/checkpoint-39-material/target-base-values-normal480.png)。原圖仍是 [Approved_Visual_Target_Misaki.png](codex-v4/reference/Approved_Visual_Target_Misaki.png)，SHA256 `9f855d2ecfd120bb45c001db3fa9b5a3e3b58b2b3c2a4cf9e7ebfda84f8f7114`；只取左側店景作有標籤對照，沒有替換參考。
- [正常相機的後牆／窗局部](../evidence/native-v11/checkpoint-39-material/backwall-window-crop.png)，[第一斜角](../evidence/native-v11/checkpoint-39-material/oblique-0-comparison.png)，[第二斜角](../evidence/native-v11/checkpoint-39-material/oblique-1-comparison.png)。另保留六張未裁剪原始 PNG；拼圖只裁切、等比例縮放及標籤，沒有重繪或合成遊戲內容。
- 原始連續 pointer 錄影：[base255，122.240秒](../evidence/native-v11/checkpoint-39-material/base-motion/gameplay-uncut.webm)／[values256，100.640秒](../evidence/native-v11/checkpoint-39-material/values-motion/gameplay-uncut.webm)。public CDP 實際頁面＋已安裝 ffmpeg；未剪接、未加速，但 SwiftShader 傳回幀稀疏，不能據此認證實體 FPS 或連續動作平滑。
- [來源與旗標](../evidence/native-v11/checkpoint-39-material/source-identity.json)、[實際 camera／Sandbox 結果](../evidence/native-v11/checkpoint-39-material/results.json)、[全部媒體 SHA256](../evidence/native-v11/checkpoint-39-material/media-sha256.json)。相機、曝光、燈光、庫存相同；員工依原邏輯活動，兩組截圖的 idle 位置／朝向不同，不能把這個差異當材質效果。

## 唯一候選改動及觀察

`VITE_V11_BACKWALL_FORMS=shape` ＋ `VITE_V11_BACKWALL_MATERIAL=base|values`。只有 `values` 啟用候選；普通建置為 `control`。沒有第二套未披露的彩色方案。

- 三層架板重用既有 display-oak albedo，較淺暖中性木色，原木材法線保留。**不套 central-table finish/AO**，避免把杯影或桌面接觸圖帶到架板。商品原有陶瓷、紙、布材質完全保留，用架板與商品的差異分層。
- 垂葉保留短密／長疏形體與共用中綠；近枝使用四個較明確的綠值並保留薄葉透光。屋頂保留中值，遠樹與幾何天空較淡；兩個遠樹體積取消薄片透光，周邊真正薄葉仍透光。沒有背景貼圖、假庫存或新圖像素材。
- [實際 live PBR 證據](../evidence/native-v11/checkpoint-39-material/actual-material-proof.json)：兩個架板 batch 的 albedo 真正載入、repeat U/V=1、ambient=null；兩個遠樹體積 opaque PBR、四個近葉 batch 保留透光，四段天空保持 unlit。不是只憑 palette 參數宣稱已整合。
- 已觀看正常全景及兩斜角：架板較淺、商品與木面的區別更清楚，室外近葉／屋頂／遠樹仍可分辨。**全景增益有限**：屋頂仍佔較強的大面、遠樹仍簡化，整店的窗光／接觸陰影與原圖的明亮豐富層次仍有明顯距離。不宣稱材質門檻或整體原圖通過，不擴散／採用候選。

## 檢查與保留範圍

- [268/268 tests](../evidence/native-v11/checkpoint-39-material/tests-final.log)、兩個 build／strict TS、[五語174keys validate](../evidence/native-v11/checkpoint-39-material/validate.log)、[replay](../evidence/native-v11/checkpoint-39-material/replay.log)、[asset-check](../evidence/native-v11/checkpoint-39-material/asset-check.log)通過。首輪267/268因共用材質來源改動後 products manifest 尚未重建；正規 exporter 修正雜湊後完整重跑268通過，沒有放寬該斷言。
- [146既有 GLB 零錯誤／警告](../evidence/native-v11/checkpoint-39-material/glb-validation.log)；這是普通 default 資產檢查，不冒稱已輸出採用 C39 材質的 native 包。
- [C39 配方／幾何鎖](../evidence/native-v11/checkpoint-39-material/material-probe.json)：base/values 的實際 positions、normals、UV、winding canonical hashes 全同，並匹配已過 C38 原母檔；C36中央花布、收銀、傢俬、前景植物／裝飾及0/3/8 stock prefixes 的原始配方／材質相同。C37/C38原母檔完整保留，不重寫已過來源。
- [形體／原預算](../evidence/native-v11/checkpoint-39-material/form-probe.json)：14036 tri／17 styling groups／155 fixed-scene parts，原上限不變。原完整 triangle-box SAT、radius .24m、Y .08–2.10及三架板斷言仍通過；C38全部3000植物tri幾何未變。不是角色全動作逐幀接觸認證。
- C38 provenance 現在驗證其**固定已審 commit 的原 authoring source**及全部未變母檔；C39另驗證現行配方幾何、當前來源 receipt，避免為材質 callback 改動而重寫歷史已過 geometry receipt。原 SAT／opening 條件未變。
- [501 tracked assets/public 保留／重建](../evidence/native-v11/checkpoint-39-material/asset-rebuild.json)：496個 asset檔案經四 canonical exporters＋C39 receipt 後逐byte一致，另5字型未變；沒有 Blender二進位重建聲稱。[305保護檔](../evidence/native-v11/checkpoint-39-material/preservation.json)／原11提交完整，經濟、存檔、UI、五語內容、routes/camera核心未改。
- [base255](../evidence/native-v11/checkpoint-39-material/runtime255-parity.json)／[values256](../evidence/native-v11/checkpoint-39-material/runtime256-parity.json)各182 runtime從本 application 重建逐byte一致。[普通環境主檔除來源雜湊外同C38 control](../evidence/native-v11/checkpoint-39-material/default-master-comparison.json)，沒有把候選設為預設。
- 真實 Sandbox UI 匯入既有8-stock QA export、High WebGL、兩次真pointer orbit；camera/economy逐值一致、0 pageerror、兩組 fresh 隔離 Normal baseline 不變。**沒有本輪新買入／place／售罄／reload／結算交接／Low/ReduceMotion／五語窄屏實測**；既往通過不轉算成本來源認證，採用前仍須 affected flows。

沒有需要使用者處理的權限阻塞。沒有 LTC／Library重試、新服務、玩家Chrome、Normal存檔修改、Unity或關機操作。下一步是本輪正常480px＋雙斜角的獨立材質門檻；未過便在同區域修正，不把技術通過當成原圖接受。
