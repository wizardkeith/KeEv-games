# V11 C37：後牆至右窗的形體候選，未採用

> 歷史候選304已撤回作本輪最終覆核：保守客人路段body-box淨空有風險。來源與媒體保留；請改看[通道修正後的同源候選／新實拍](V11_C37_ROUTE_CLEARANCE_FINAL_2026-10-27_zh-HK.md)。


**交付可覆核的形體版本，沒有宣稱形體門檻或整體原圖已通過。** C36中央桌已獲獨立development-adoption通過，本輪鎖定它、收銀區、相機、照明、路徑與經濟。普通開發版仍是C36；C37只由建置旗標開啟，PR8仍Draft，公開V17未改。

Application：`cc98c7b6efc67b58a408f9d6d1e62f2cdee8bf5c`。最終灰模245、繼承／暫用材質的形體預覽246、無旗標control247，三者均由此來源重建。這不是新發佈包。

## 實際遊戲圖與原片

- [原圖／Before233灰模／最終245，同店鋪高度480px](../evidence/native-v11/checkpoint-37-backwall-form/target-before-after-gray480.png)。[同相機背景局部](../evidence/native-v11/checkpoint-37-backwall-form/same-camera-background-gray.png)。灰只作用於指定背景；中央桌及收銀保持原材質，不用全場灰化掩蓋回歸。
- **主要形體證據245**：[正常完整遊戲畫面](../evidence/native-v11/checkpoint-37-backwall-form/after245/gray-normal-game.png)、[實際pointer斜角A](../evidence/native-v11/checkpoint-37-backwall-form/after245/gray-oblique-0.png)、[斜角B](../evidence/native-v11/checkpoint-37-backwall-form/after245/gray-oblique-1.png)；[154.600秒未剪原片](../evidence/native-v11/checkpoint-37-backwall-form/after245/gray-motion/gameplay-uncut.webm)。相機角度／縮放／target與Before233相同，兩斜角由真滑鼠拖動取得，沒有注入pose。
- **補充，非材質驗收**：[原圖／普通control247／246形體預覽](../evidence/native-v11/checkpoint-37-backwall-form/target-default-preview480.png)、[246正常完整遊戲畫面](../evidence/native-v11/checkpoint-37-backwall-form/preview246/shape-normal-game.png)。預覽沿用舊調色及暫用樹冠材質，沒有把它說成新材質標準或預設。
- **246真UI買入／reload**：[買入後正常畫面](../evidence/native-v11/checkpoint-37-backwall-form/preview246/actual-after-purchase-normal.png)、[reload後完成3D畫面](../evidence/native-v11/checkpoint-37-backwall-form/preview246/actual-post-purchase-reload-normal.png)、[137.840秒未剪原片](../evidence/native-v11/checkpoint-37-backwall-form/preview246/purchase-motion/gameplay-uncut.webm)。隔離Sandbox真買1杯：stock8→9、cash3840→3770、cost70；purchases及bookCost各加70、shelves不變，reload逐項資料相同，fresh隔離Normal未變，0pageerror。數值是現有內部帳本單位；畫面沿用原貨幣格式。陳列仍依原可見上限，不宣稱9杯全數可見。

以上全部為**實際可運行WebGL遊戲**，不是studio／概念圖／替代背景。截圖為休店固定庫存狀態；不把沒有顧客當作美術問題。原圖仍是[原始PNG](codex-v4/reference/Approved_Visual_Target_Misaki.png)，SHA256 `9f855d2ecfd120bb45c001db3fa9b5a3e3b58b2b3c2a4cf9e7ebfda84f8f7114`。比較只裁左側店鋪，均勻縮放與標題置於圖外，原始全畫面另存。[裁切、變體／來源及限制](../evidence/native-v11/checkpoint-37-backwall-form/evidence-provenance.json)、[全部41項SHA256](../evidence/native-v11/checkpoint-37-backwall-form/SHA256SUMS.json)。

## 本輪重建範圍

1. **後牆固定展示**：保留原35件固定樣本的ID／數量；已移到中央桌及收銀的6件不動，只重排後架29件的高低與前後位置。三個既有紙品工作組改為不同高度；沒有新增SKU、獎勵或假庫存。真實上架商品仍走原stock-driven配方。
2. **植物形體**：原兩個後牆花盆落回上層實際架面，冠部與四條不等長垂枝跨層；第三盆改到右窗台。葉根取自真正sweep截面。自檢發現垂枝可能穿架後，改為先繞過前緣再下垂；新增完整triangle–AABB分離軸檢查，三塊原架板皆零相交，沒有放寬斷言。
3. **窗外近／中／遠**：近樹分高度出枝，曲面葉群留出屋頂開口；原兩幢房屋保留四個實體屋面，錯開深度與高度；遠樹移到窗景兩側。舊大團塊與全葉片試驗不足，最終用原創Blender立體雕形／510三角形母檔加少量邊緣葉，置於近枝及屋頂之後。仍是真實3D與原幾何window portal，不是平面風景貼圖。

[形體旗標與樣本配置](../src/art/backwall-forms-v11.ts)、[植物配方](../src/art/shop-v11.ts)、[窗外配方](../src/art/fixtures-v11.ts)、[原始Blender／indexed JSON及provenance](../assets/masters/native-v11/backwall-c37/)、[原創雕形工具](../tools/build-v11-backwall-canopy.py)。米／RH +Y-up、未引用外部模型或把原圖像素嵌入遊戲。舊母檔與各試驗來源保留於歷史；234–243探索畫面不冒作最終245／246證據。

## 最終來源檢查

- **263/263 tests**、tsc/build、validate五語各174keys、replay、asset-check通過；[測試](../evidence/native-v11/checkpoint-37-backwall-form/tests245-final.log)。146個既有GLB零錯誤／零警告；新C37 native來源是JSON／Blend，不冒稱已作原生平台驗收。
- 四個變體探針保留中央花／布、中央／收銀固定樣本及工作物件相同雜湊；35固定ID／數量和真實架面／堆疊承托通過。C37 **14,344 styling+canopy三角形、17 styling材質組**；完整固定場景155項，小於原160項上限。不是整個Babylon世界只剩155mesh。[shape探針](../evidence/native-v11/checkpoint-37-backwall-form/probe-shape.json)。
- [305受保護檔與相機／路徑保留](../evidence/native-v11/checkpoint-37-backwall-form/preservation-final.log)。經濟、五語、UI清單、故事／save schema／rig與交易投影未改。C27構圖／C32布／C35圖頁／C36瓶口修正／192反射保留。
- [494 tracked資產重建逐byte一致](../evidence/native-v11/checkpoint-37-backwall-form/asset-rebuild-final-parity.json)：四個canonical exporters及C37 recipe exporter。Blend保留可編輯原始來源，不宣稱Blender二進位重建一致。
- [245](../evidence/native-v11/checkpoint-37-backwall-form/runtime-245-parity.json)／[246](../evidence/native-v11/checkpoint-37-backwall-form/runtime-246-parity.json)／[247](../evidence/native-v11/checkpoint-37-backwall-form/runtime-247-parity.json)各182個runtime檔與此application重新建置逐byte相同；[實際本地HTTP bundle identity](../evidence/native-v11/checkpoint-37-backwall-form/actual-bundle-http-identity.json)。[普通control環境主檔與C36除sources欄外完全一致](../evidence/native-v11/checkpoint-37-backwall-form/default-master-comparison.json)。

重現灰模：`VITE_V11_BACKWALL_FORMS=gray npm run build`；繼承材質預覽用`shape`；無旗標仍`control`。只供authoring，不新增玩家設定。未經形體覆核，不開始本區材質整合或採用為預設。

## 尚未接受與下一步

480px全景仍明顯不同於原圖：長架的水平結構仍突出，商品／葉群造形與層次較簡化，原圖暖而柔的材質與室內外光感也未重現。**本輪只交形體覆核候選，不把相對改善或263tests當作視覺通過。** 請先對照正常480px及雙斜角判斷高低群組／跨層植物／窗外近枝—屋頂—遠樹天空是否成立；未過則只修該形體，不再動已過中央桌。

本輪新實測是245雙角度及246單次買入／reload，沒有把C36完整stock循環／High結算交接離店／Low／ReduceMotion或舊五語窄屏冒作本輪新跑。雲端Chromium／SwiftShader、稀疏CDP原片不是實體GPU/FPS、完整平滑度、audio/native或hidden-tab認證。沒有玩家Normal、使用者Chrome、Unity、Site save/deploy、merge／Ready或關機操作；已停止的Library／LTC路徑沒有重試，沒有新Library ID。無需使用者動作的權限阻塞；形體與整體目標驗收仍待獨立覆核。
