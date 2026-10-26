# C37後牆—右窗：通道淨空修正後的形體候選

**形體待獨立覆核，整體原圖仍未接受；沒有採用／合併／發佈。** Application `7569e136ebf74a3f08bfd3b83dd6b00748cf677c`，最終灰模248／繼承或暫用材質預覽249／普通control250。原C36中央桌、收銀、相機、照明、路徑、35固定樣本ID及數量、真實庫存與經濟保留。C37仍是建置旗標，feature無旗標仍C36，公開Site沒有操作。

早期候選`3047406a052152d45617972fcb95865efb25aef5`已撤回作本輪最終覆核用途，但來源、母檔和原圖證據留在歷史。[早期範圍／原創模型方法與探索紀錄](V11_C37_BACKWALL_WINDOW_FORM_2026-10-27_zh-HK.md)仍可追溯。

## 真實遊戲證據

- [原始目標／Before233／248正常480px灰模](../evidence/native-v11/checkpoint-37-route-clearance/target-before-after-gray480.png)；[同相機背景局部](../evidence/native-v11/checkpoint-37-route-clearance/same-camera-background-gray.png)。只灰化指定背景，中央桌及收銀保留已過材質。
- **248主要形體證據**：[完整正常遊戲畫面](../evidence/native-v11/checkpoint-37-route-clearance/after248/gray-normal-game.png)、[真pointer斜角A](../evidence/native-v11/checkpoint-37-route-clearance/after248/gray-oblique-0.png)、[斜角B](../evidence/native-v11/checkpoint-37-route-clearance/after248/gray-oblique-1.png)、[147.120秒未剪原片](../evidence/native-v11/checkpoint-37-route-clearance/after248/gray-motion/gameplay-uncut.webm)。同Before233相機角度／radius／target，沒有注入pose或庫存。
- **249補充預覽，非材質驗收**：[原圖／C36 BEFORE247／新249](../evidence/native-v11/checkpoint-37-route-clearance/target-default-preview480.png)、[完整正常遊戲畫面](../evidence/native-v11/checkpoint-37-route-clearance/preview249/shape-normal-game.png)。Before247為先前`cc98c7b`來源的真實C36普通畫面；沒有冒稱重新實拍250，現250主檔與C36除sources欄外完全一致。
- **249新真UI買入／reload**：[買入後](../evidence/native-v11/checkpoint-37-route-clearance/preview249/actual-after-purchase-normal.png)、[reload後完成3D](../evidence/native-v11/checkpoint-37-route-clearance/preview249/actual-post-purchase-reload-normal.png)、[107.160秒未剪原片](../evidence/native-v11/checkpoint-37-route-clearance/preview249/purchase-motion/gameplay-uncut.webm)。真買1杯：stock8→9、cash3840→3770、cost70；purchases／bookCost各加70、上架位置不變，reload資料相同、fresh隔離Normal不變、0pageerror。數字是原內部帳本單位；陳列仍保留原可見數量上限。

全部是實際可運行WebGL遊戲，不是studio／概念圖或替代風景。原目標仍為[同一原始PNG](codex-v4/reference/Approved_Visual_Target_Misaki.png)，SHA256 `9f855d2ecfd120bb45c001db3fa9b5a3e3b58b2b3c2a4cf9e7ebfda84f8f7114`；480px比較只裁左店鋪、等比例縮放、外加標題，原始全畫面另存。[完整來源／裁切／coverage](../evidence/native-v11/checkpoint-37-route-clearance/evidence-provenance.json)及[SHA256](../evidence/native-v11/checkpoint-37-route-clearance/SHA256SUMS.json)。休店固定庫存畫面不以缺少顧客作美術缺陷。

## 本輪修正與保留

後架29件固定樣本與三組原紙品工作組形成高低群；已移到中央／收銀的6件不動。兩盆植物坐回真實上層架面、枝條跨層，第三盆置右窗台。窗外仍是實體近枝、原兩房屋四個屋面及兩側遠樹；原創510tri Blender雕形與indexed JSON留作native重用，並非新地圖／庫存。[模型／source/provenance](../assets/masters/native-v11/backwall-c37/)。

自檢先修正枝條越過架前緣，新增三角形與三架板AABB零相交檢查。最後核對現有客人路線時發現，前伸的垂葉仍進入保守身體掃掠盒，因此撤回304候選，收窄葉面深度、保留枝根與原路徑後重建。[獨立數值量度](../evidence/native-v11/checkpoint-37-route-clearance/route-clearance-before-after.json)：304有476個不同三角形進入包圍盒（跨路段重複計1344），現在為0。半徑取現有contract的0.24m，Y範圍0.08–2.10m。這是**保守直線路段淨空量度**，不冒稱影片已證明舊版穿模，亦不等於所有圓角轉彎、店員、完整動畫骨架逐幀碰撞驗收。葉根仍取真正sweep截面，沒有放寬架板／route斷言或改經濟來遮掩。

## 最終來源檢查與限制

- **264/264 tests**、tsc/build、validate五語各174keys／replay／asset-check通過；[測試](../evidence/native-v11/checkpoint-37-route-clearance/tests248-final.log)。146既有GLB零錯警告，新C37可重用來源是JSON／Blend，沒有原生平台驗收聲稱。
- 四變體探針：C36花／布、中央／收銀樣本與工作物件雜湊相同；35固定ID／數量、架面／堆疊承托、三架板及客人路段body-box檢查通過。C37 styling+canopy **14,344tri／17 styling群**，完整固定場景155項，未提高原16k／17／160上限。[探針](../evidence/native-v11/checkpoint-37-route-clearance/probe-shape.json)、[305保護檔／相機／路徑保留](../evidence/native-v11/checkpoint-37-route-clearance/route-preservation-final.log)。
- [494 tracked資產重建byte一致](../evidence/native-v11/checkpoint-37-route-clearance/route-asset-rebuild-parity.json)，四canonical exporters+C37 recipe exporter；Blend保留可編輯來源，不聲稱Blender二進位重建一致。
- 同application重建：[248](../evidence/native-v11/checkpoint-37-route-clearance/runtime-248-parity.json)／[249](../evidence/native-v11/checkpoint-37-route-clearance/runtime-249-parity.json)／[250](../evidence/native-v11/checkpoint-37-route-clearance/runtime-250-parity.json)各182runtime逐byte同；[實際本地HTTP bundle identity](../evidence/native-v11/checkpoint-37-route-clearance/actual-bundle-http-identity.json)。[普通250環境主檔除sources外與C36相同](../evidence/native-v11/checkpoint-37-route-clearance/route-default-master-comparison.json)。這不是公開Site的驗證。

**仍有視覺差距**：長架水平線仍突出、垂葉尚有規整垂簾感與較裸露的上段枝條、窗外葉群／屋頂造形與光色仍簡化；原圖的柔光、質感與整體豐富度未達到。間距／枝根正確及264tests不等於美術接受。請先按正常480px與雙斜角覆核本區高低遮疊和近枝—屋頂—遠樹天空，未過則只修其形體；不再改已過中央桌，也不先進新材質。

本輪新增實測限248雙角度、249一次買入／reload。C36全stock循環、High結算接袋／離店、Low／ReduceMotion及舊五語窄屏均沒有冒作本輪新跑。雲端SwiftShader／稀疏CDP原片不是實體GPU/FPS／完整平滑度／audio/native／hidden-tab或全角色碰撞認證。沒有merge／Ready／Site／玩家Chrome或Normal／Unity／關機操作；既有Library／LTC停止路徑未重試，無新Library ID。沒有需要使用者動作的權限阻塞，獨立形體覆核與整體目標仍開放。
