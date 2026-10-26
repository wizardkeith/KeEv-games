# C33：只修一個低側簇內肩，等待花冠灰模覆核

C32 獨立結果為 **布 PASS／花 FAIL**。本次保留已通過的布，僅修花冠內肩；不進入材質／貼圖，也不宣稱整體原圖達標。

Application：`ea69496cfaccc4633161d6743ecd60fdcd255ff8`；固定實拍 build221，`VITE_V11_GRAY_FORMS=gray`，C31/C30 OFF。普通預設仍是 feature201，未合併、公開 V17 不變。

## 實際遊戲比較

先看 [固定正常視角／同480px場景區](../evidence/native-v11/checkpoint-33/normal-game-gray-comparison-480.png)，再看 [斜角0](../evidence/native-v11/checkpoint-33/oblique-0-gray-comparison-480.png)、[斜角1](../evidence/native-v11/checkpoint-33/oblique-1-gray-comparison-480.png)。兩側均為實際 WebGL 頁面截圖，使用相同矩形裁切與縮放；店員自然活動位置不相同，沒有合成人物或背景。

- [正常全頁原檔](../evidence/native-v11/checkpoint-33/gray221/gray-normal-game.png)、[斜角0原檔](../evidence/native-v11/checkpoint-33/gray221/gray-oblique-0.png)、[斜角1原檔](../evidence/native-v11/checkpoint-33/gray221/gray-oblique-1.png)。
- [原始目標左店景／灰模診斷並列](../evidence/native-v11/checkpoint-33/original-target-and-gray-game.png)。原圖仍是 `Approved_Visual_Target_Misaki.png`，SHA256 `9f855d2ecfd120bb45c001db3fa9b5a3e3b58b2b3c2a4cf9e7ebfda84f8f7114`；沒有新目標圖。
- [放大局部](../evidence/native-v11/checkpoint-33/supplemental-flower-crop-enlarged.png)只補充查形，不能取代正常店鋪尺寸判斷。
- [100.080秒未剪 pointer 雙斜角錄影](../evidence/native-v11/checkpoint-33/gray221/gray-motion/gameplay-uncut.webm)、[37個實際CDP幀來源](../evidence/native-v11/checkpoint-33/gray221/gray-motion/recording-provenance.json)。雲端 SwiftShader 稀疏取樣，並非實體 GPU/FPS、流暢度或完整交易錄影。

## 唯一形體變更及鎖定

保留 C32 母檔，新增 `flower-spray-c33.json/.blend` 與可重建來源。只有既有 part15（left-low-front 的第2個花面，authoring lobe6）內側上肩改形，沿 u/y/depth 曲線平滑拉向主簇的前下方；底圈、枝根、枝端以及其他32部件不變。沒有加花面／部件／三角面／材質。首輪 build220 拉伸太像細長連接，拒用；本報告與錄影僅指修成較寬上肩的 build221。

正常實拍可見原本全透空隙出現遮蓋，另一側較大開口保留；這是實作自查觀察，**花冠與整組灰模仍待獨立判定**。不能由此認定材質或原圖品質接受。

[幾何／鎖定證明](../evidence/native-v11/checkpoint-33/c33-change-proof.json)：全部枝幹與其他花面逐值相同，33部件／1524tri。C27固定變換後外框三軸 min/max 完全相同；C27構圖、192反射與布的 JSON／Blend／provenance／generator 六項雜湊不變。布 JSON 仍 `5c5ef77a29f4900985ddf611198adb0ac3e5b309a9148423c95270a455fe9d33`。

[固定正常投影射線抽樣](../evidence/native-v11/checkpoint-33/c33-overlap-proof.json)：C32主簇與該花面交疊0點，C33在2mm格點有483點交疊、403點為側肩在前。這是實際閉合三角網格抽樣，非視覺驗收。可重現：`python tools/v11-flower-overlap-probe.py --output /tmp/c33-overlap.json`。

## 本次來源的檢查

- **253 tests／tsc／build 通過**；新測試只准 part15改形，保持拓撲、UV、原材質、外框、單位法線及布雜湊。既有10 SKU×8件／4448底點／541原布接觸檢查通過，沒有放寬斷言。
- [預算](../evidence/native-v11/checkpoint-33/c33-final-budget.json)：style+canopy **15776tri／17個styling群**，原 `<16000`／`≤17` 上限保留；一個實際灰PBR、無base/normal/ORM貼圖或發光。
- validate：五語174keys／10 offerings零錯；replay、asset-check；146GLB零錯警告；305保護檔通過。environment master及manifest只重建來源metadata，既有模型輸出未改。
- [221重建180runtime逐byte相同](../evidence/native-v11/checkpoint-33/c33-parity221.json)；[普通無旗標build180檔與C32 control218逐byte相同](../evidence/native-v11/checkpoint-33/c33-default-parity.json)。沒有把新灰模偷偷設成預設。
- [實際camera/material/save證明](../evidence/native-v11/checkpoint-33/c33-camera-and-material-proof.json)：支持的Sandbox匯入8件庫存，正常／兩斜角pose、經濟資料及實際灰PBR與217一致；真pointer操作、save不變、隔離Normal不變、0pageerror。

本次沒有重新跑全交易／Low／五語窄屏／hidden-tab／退出返回；舊證據不冒作新通過。也沒有宣稱精確手接觸、所有stock狀態／毫米級碰撞或實體GPU/audio/native接受。環境曾短暫unavailable，恢復後讀回commit與完整檔案，沒有重跑或覆寫已完成錄影。

下一步只覆核三視角的單一 inter-cluster overlap 與保留的布。整組灰模通過後才准既有atlas／原材質整合；未通過便繼續改形。無merge／Site操作／Library或LTC重試／玩家Chrome或Normal／Unity／關機，無需使用者動作的權限阻塞。
