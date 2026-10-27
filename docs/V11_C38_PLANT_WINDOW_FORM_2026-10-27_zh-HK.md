# C38：不等長垂葉與可讀窗景，灰模候選

**C37整組獨立FORM gate為FAIL；本輪仍待形體覆核，沒有採用／進新材質／合併／發佈。** 保留已改善的混合陳列、長架、中央桌／收銀、相機／照明、真實stock與經濟。只修正植物與窗外輪廓。

Application：`fbf6dd6859c70844cd45f0b51c283b178e9ee3a9`，灰模253、普通control254。253只是本地authoring建置識別，不是公開Site版本。普通無旗標開發版仍C36。

## 同相機實際遊戲

- [原始目標／已拒C37灰248／C38灰253，同店鋪高度480px](../evidence/native-v11/checkpoint-38-form/target-before-after-normal480.png)。[正常相機背景局部](../evidence/native-v11/checkpoint-38-form/same-camera-background.png)、[相同兩斜角BEFORE／AFTER](../evidence/native-v11/checkpoint-38-form/before-after-two-obliques.png)。
- 最終253原始完整畫面：[正常](../evidence/native-v11/checkpoint-38-form/gray-normal-game.png)、[斜角A](../evidence/native-v11/checkpoint-38-form/gray-oblique-0.png)、[斜角B](../evidence/native-v11/checkpoint-38-form/gray-oblique-1.png)。[76.560秒未剪pointer雙角度原片](../evidence/native-v11/checkpoint-38-form/motion/gameplay-uncut.webm)。
- 實際runtime身份為`v11.c38.unequal-trailers-window-opening.v2`，mode gray；沒有拿探索251或C37畫面冒作253。[身份、實際HTTP bundle、原圖SHA、裁切及coverage](../evidence/native-v11/checkpoint-38-form/evidence-provenance.json)、[全部SHA256](../evidence/native-v11/checkpoint-38-form/SHA256SUMS.json)。

全部為真正可運行WebGL遊戲、指定區域的同一無貼圖灰PBR，沒有studio／概念圖／風景替代圖。原始參考仍是[同一PNG](codex-v4/reference/Approved_Visual_Target_Misaki.png)，SHA256 `9f855d2ecfd120bb45c001db3fa9b5a3e3b58b2b3c2a4cf9e7ebfda84f8f7114`。只裁左側店鋪、均勻縮放及在圖外加標題，原始遊戲全畫面另存。這是休店固定8-stock匯入比較，不以沒有顧客作美術缺陷。

## 只改形體

- **一短密、一長疏**：前端盆用4條較短、不等長枝與較密葉群，窗角盆用3條較長、疏密不均的主枝。上段葉片沿實際sweep截面接過盆口／前緣，再接下垂段，避免把裸上枝和下方葉列分成兩截。兩盆總葉面量不增：原33／33片，現在長疏23、短密43片；長盆最低葉面約0.896m、短盆約1.566m。這些是作者模型量度，並非原圖已批准尺寸或視覺通過證明。
- **留出能讀屋面的窗景**：大葉改成6組不等量、較小而重疊的近葉群，仍有實體枝條；總近葉84→83，沒有用堆數量替代分組。房屋仍2幢、4個真正屋面；調整投影高度並用原有材質的真實ridge／eave／rake輪廓讓山牆、簷口可見。遠樹稍移入視窗，讓近枝、屋頂、遠樹與天空有前後關係。沒有新紋理、曝光／照明／反射更動或screen固定替代。
- **保留已過部分**：C37固定展示樣本與紙品工作組逐byte相同；C37全部8個原master亦與已審來源逐byte一致。新配方另存[backwall-c38 indexed JSON及provenance](../assets/masters/native-v11/backwall-c38/)，重用的原創遠樹Blender／JSON仍保留在C37。沒有改動商品目錄、存檔、交易、rig或路徑。

## 幾何與最終來源檢查

[獨立數值量度與範圍](../evidence/native-v11/checkpoint-38-form/geometry-scope-proof.json)：保留原完整triangle–box SAT、radius0.24m、Y0.08–2.10m與三塊原架板盒，沒有改成只看vertices或放寬斷言。C37全部2944個／C38全部3000個植物三角形均是路段盒0相交、架板0相交。固定正常相機下、用來看前山牆的window-plane開口，被近枝／葉三角形遮蓋由111→0；這只是所選正常投影的幾何空隙，不是所有orbit、角色完整動作碰撞或視覺辨識認證。

- **266/266 tests**、tsc/build、validate五語各174keys、replay、asset-check通過；[測試](../evidence/native-v11/checkpoint-38-form/tests-final.log)。146既有GLB零錯警告；C38新重用來源為indexed JSON，不宣稱新原生平台驗收。
- [四模式探針](../evidence/native-v11/checkpoint-38-form/probe-shape.json)：中央花／布、中央／收銀樣本與工作物件雜湊同，styling+canopy **14,036tri／17styling群**；固定場景155項，原16k／17／160上限不變。[305保護檔、原路徑／相機保留](../evidence/native-v11/checkpoint-38-form/preservation.log)。
- [500 tracked資產重建逐byte一致](../evidence/native-v11/checkpoint-38-form/asset-rebuild-parity.json)：四canonical exporters＋新C38 exporter，沒有重跑舊C37 generator覆寫其母檔，沒有Blender二進位重建聲稱。
- [253灰模](../evidence/native-v11/checkpoint-38-form/runtime-253-parity.json)／[254control](../evidence/native-v11/checkpoint-38-form/runtime-254-parity.json)各182runtime與此application重建逐byte一致。[普通control環境主檔除sources外同C36](../evidence/native-v11/checkpoint-38-form/default-master-comparison.json)。沒有新彩色／材質預覽或發佈tar。

## 尚未接受

實拍可讀出不同的植物長度與屋脊／簷口，但葉群仍有人工排列感，遠樹仍是簡化體塊，窗外房屋投影也偏強。**C38形體須按正常480px和兩斜角獨立覆核；整體原圖的畫風、材質與氣氛仍未達到。** 不把開口0相交或266tests當作形體通過。未過則繼續只修本區形體，已過才進材質，不再磨已過中央桌。

本輪新瀏覽器證據限真UI匯入8-stock、同camera/economy與pointer雙角度；資料及fresh隔離Normal不變、0pageerror。C37的買入／reload或舊High結算交接、Low／ReduceMotion、五語窄屏不是C38新跑結果。雲端Chromium／SwiftShader／稀疏CDP不是實體GPU/FPS／逐幀流暢度／audio/native／hidden-tab認證。PR8仍Draft，公開Site未由本輪改動；沒有merge／Ready／Site／Library或LTC重試／玩家Chrome或Normal／Unity／關機操作，沒有新的Library ID或使用者動作權限阻塞。
