# Misaki R9：連續主髮網／露眼與可見髮夾 checkpoint，未接受

本輪基線 `ea6613cd001f3fe26cd9f4eadd8c972f5e872fea`；source commit `d40d459cbe8630363d41ddaf1d6a3814b39046eb` 已正常push至既有 `codex/asset-foundation-v1` 並獨立讀回同SHA。圖片與驗證收於額外證據checkpoint，最終SHA由外部交付讀回，避免本文自引用。

R8因放射根縫、花瓣側板、三分之四髮夾被遮而獨立FAIL。本輪**改掉重複髮條構造**，不再增加髮條。實拍中的主體已連貫、眼睛露出、自身左側髮夾可見；但輪廓仍偏整塊／頭盔感，尚未重現原圖鬆散蓬鬆的主副束轉折。**未判身分／畫風PASS、未採用。** 為先覆核主體，不追加髮尾細修、衣服、rig或細髮絲。

## 原圖與同機實拍

本輪再次實際打開原圖 `docs/codex-v4/reference/Approved_Visual_Target_Misaki.png`，SHA256 `9f855d2ecfd120bb45c001db3fa9b5a3e3b58b2b3c2a4cf9e7ebfda84f8f7114`，以及R8實際比較。中途及最後均以原圖像素覆核形狀。沒有PlanB重試或假稱看過它；側／背仍是推定。

- [原圖／同機R8／R9正面](reviews/evidence/misaki-grayform-v1-r9/original-r8-r9-front-head480.png)
- [原圖／同機R8／R9三分之四](reviews/evidence/misaki-grayform-v1-r9/original-r8-r9-threequarter-head480.png)
- [原圖／R8／R9正常遊戲尺度](reviews/evidence/misaki-grayform-v1-r9/original-r8-r9-normal-game480.png)
- [推定側／背體積](reviews/evidence/misaki-grayform-v1-r9/r9-inferred-side-back480.png)
- [14張原始引擎實拍、實際GLB載入hash及固定條件](reviews/evidence/misaki-grayform-v1-r9/capture.json)
- [比較圖裁切／縮放／來源SHA](reviews/evidence/misaki-grayform-v1-r9/comparison-provenance.json)

R8與R9都在本機同一headless Chrome156／Intel ANGLE、獨立fresh contexts，以實際各自GLB渲染；studio/gameplay TS、相機、燈光和七灰材質不變，只標示revision文字。比較圖僅crop、等比縮放、排列和標註，不調色、補畫或生成參考。原圖三分之四姿勢／投影不同，不能當作精確正交front／turnaround。

## 連續低解析度主控制網

主體是一張直接可編輯的外控制面：9×9冠部四邊網接8圈、每圈32列的側環，共 **337 control vertices／320 quads，單一連通分量**，沒有放射冠頂fan。逐圈不等的截面由冠部延伸到耳側和下顎，先外鼓再向內收；偏心分界與寬主副束轉折塑在共用頂點內，而非切成多條分件。來源中的六個vertex groups分別選冠、主掃勢、副束、耳口、外轉與內收，舊名object10現在是整個主bob。

只保留兩片較短耳側／下緣重疊，不參與冠部。沒有UV sphere primitive、voxel fusion、decimation或全局融合／平滑；主面只用局部Subsurf1及可編輯2.8mm Solidify。原生外面只有預期的32條下緣boundary edges，厚度評估後是單一閉合分量；兩片小重疊各自閉合，未假稱整頭焊接或無穿插。

這是背景Python建立／調整明確控制頂點，再檢視真正渲染；不是GUI拖點或monitor隔離能力示範。原生網和modifier可直接編輯，沒有把參數或參考曲線假稱成live sculpt driver。

## 先解髮夾與露眼，未追髮尾

第一份連續體積實拍消除了R8根縫，但仍蓋住髮夾。沒有移動或重做髮夾：以它156個固定evaluated頂點擬合承托面，將附近25個實際控制點塑到髮夾後方，最大Y調整85.92mm；同時加強幾個共用面的寬轉折，移除一片外飄下緣重疊，避免又堆髮片。不是相機／材質mask，也沒有讓clip忽略depth。

最終實拍確認自身左側兩葉髮夾在front及3/4可見。相同正交相機方向的hair-ray取樣：

| 取樣 | R8 front | R8 3/4 | R9 front | R9 3/4 |
| --- | ---: | ---: | ---: | ---: |
| clip被hair遮住／156頂點 | 59 | 106 | 0 | 0 |
| 自身右眼上睫毛被遮／78頂點 | 0 | 0 | 0 | 0 |
| 自身左眼上睫毛被遮／78頂點 | 0 | 0 | 0 | 0 |

最初R9 clip遮擋曾是124/156，該初稿未當作成功交付。最後clip頂點至hair unsigned距離1.305–12.215mm、平均6.339mm；**這不是接觸／碰撞／物理依附證明，也不是所有最終像素認證**，仍須連同實拍看附著感。控制網、射線與距離完整記於[獨立重開檢查](reviews/evidence/misaki-grayform-v1-r9/source-reopen-inspection.json)。

殘留：冠部／主副束的surface turns仍弱，主要讀成整塊較平滑的bob，未達原圖自然根部、層疊與鬆散外緣；clip承托凹區仍需看形狀自然度，既有不等長邊緣未進一步精修。此輪僅交連續體積／可見clip基礎覆核，不以技術數值代替美術接受。

## 保留、產物與驗證

37個非hair物件的原生頂點／面／TRS／材質與evaluated幾何逐項不變；原validator照用27個非hair GLB POSITION／NORMAL／index streams及TRS的逐byte斷言，R3眼臉身體24streams、R2臉頸定義、七灰材質及29個accepted prop files全保留。沒有放寬hash／容差。其餘5,312個既有tracked files不變，包括確定性sRGB8、五語、規則／經濟／存檔、相機／光、原圖和Site identity。

| 真正產物 | 大小 | SHA256 |
| --- | ---: | --- |
| [可編輯 `.blend`](../assets/authoring/misaki-grayform-v1/misaki-grayform.blend) | 1,217,457 bytes | `27b69fae409e7b8c589ae1af0c48b23e9b728a3c4d2cd933e0f955c5ced13b53` |
| [實際 `.glb`](../public/assets/misaki-grayform-v1/misaki-grayform.glb) | 872,852 bytes | `40e771a67f8014899443e8ee8f376318e6efdbea3d5be114492810c474a9cc3d` |

Blender5.2.3LTS保存後，獨立背景程序重新開`.blend`，再於空場景import實際GLB：40個原生mesh（37非hair＋3hair）、5個GLB meshes、10primitives、7灰材質、47,752tri，比R8少2,880tri，0images／skins／animations，足底Y=0。重開有既有非阻塞extensions cache權限警告；沒有因而改設定或裝外掛。拓撲連通／閉合不等於製作拓撲、無自交或rig合格。

本輪實際執行且exit0：native build/export、獨立兩格式重開、原嚴格GLB validator（0errors／0warnings）、`tsc --noEmit`、`vite build`、**304/304tests／0fail／0skip**、`validate`、`replay`、root `asset-check`及authoring strict TS。既有Vite大chunk提示未隱藏。14張最終實拍、實際HTTP body SHA核對、fresh Sandbox買3杯cash5000→4790／stock3／slot2、reload逐值相同及Low→High均通過；隔離context的Normal基線不變，從未附加或存取玩家原profile／Normal存檔。所有[命令／logs](reviews/evidence/misaki-grayform-v1-r9/command-results.json)區分本輪實跑，沒有冒充其他OS或native-device測試。

正常鏡頭中後方灰色A-pose是DEV sample `[.85,.079,1.35]`、yawπ；前方彩色gameplay staff仍原版，普通`/`未採用此grayform。沒有持續FPS、實體裝置、音訊或動畫認證。測試產生的舊locomotion證據先另存本輪，再還原tracked歷史bytes。

重現指令見[authoring README](../tools/asset-foundation/MISAKI_GRAY_README.md)。完整證據同步並獨立讀回前不清理；之後僅回收task-owned冗餘暫存，保留原圖、最新來源、必要證據、Git中的R8 rollback及可重用依賴。這輪停在可覆核體積，無GUI、Unity、PR重試、merge、公開Site或Normal變更。
