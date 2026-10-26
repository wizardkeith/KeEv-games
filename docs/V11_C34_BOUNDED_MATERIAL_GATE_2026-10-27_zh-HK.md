# C34：已通過灰模的同桌材質整合候選

**C33花冠／C32布已通過獨立灰模門檻；本次不再改形。材質門檻仍待覆核，整體原圖仍未接受。** 沒有向全店擴散，沒有採用為普通預設，也不是發佈候選。

Application：`0e20d41262e5234db57d800f9ab965eb019dce49`。最終兩組：build229 `VITE_V11_BOUNDED_MATERIAL=base`（已過形體＋原材質），build228 `VITE_V11_BOUNDED_MATERIAL=values`（相同形體＋UV形體色面）。C31／C30 OFF、gray flag為control。普通無旗標仍feature201，公開V17不變。

## 先看實際正常尺寸

- [同480px場景區／正常鏡頭原材質與色面比較](../evidence/native-v11/checkpoint-34/normal-game-material-comparison-480.png)，[雙斜角0](../evidence/native-v11/checkpoint-34/oblique-0-material-comparison-480.png)、[雙斜角1](../evidence/native-v11/checkpoint-34/oblique-1-material-comparison-480.png)。
- [唯一原圖左店景與實際遊戲](../evidence/native-v11/checkpoint-34/original-target-and-actual-game.png)、[已過灰模與材質候選](../evidence/native-v11/checkpoint-34/gray-pass-and-material-game.png)。沒有概念圖／離線render冒充遊戲。原圖SHA256仍 `9f855d2ecfd120bb45c001db3fa9b5a3e3b58b2b3c2a4cf9e7ebfda84f8f7114`。
- [base229正常全頁](../evidence/native-v11/checkpoint-34/base229/base-normal-game.png)、[values228正常全頁](../evidence/native-v11/checkpoint-34/values228/values-normal-game.png)、[補充同鏡頭局部](../evidence/native-v11/checkpoint-34/supplemental-table-comparison.png)。比較圖只裁切／縮放原始實拍，店員自然活動位置不同，沒有合成物件或背景。
- [base229未剪85.640秒／31幀](../evidence/native-v11/checkpoint-34/base229/base-motion/gameplay-uncut.webm)、[values228未剪107.240秒／32幀](../evidence/native-v11/checkpoint-34/values228/values-motion/gameplay-uncut.webm)及各自recording-provenance.json。這是實際pointer雙斜角／閉店活動的稀疏雲端SwiftShader錄影，非實體GPU/FPS或全流程流暢度認證。

自查：花冠跨簇遮蓋、另一側較大開口與布的寬轉面保留。values228的布前轉面較深、主褶更明確，花冠主／側簇有亮暗差；**全正常畫面的增益仍有限，前垂布是否過暗、白花是否足夠柔亮自然，必須獨立判斷，不能以局部放大或測試通過代替。** 第一版values226正常尺寸太接近原材質，已拒用；[保留其實拍及來源](../evidence/native-v11/checkpoint-34/rejected-values226/provenance.json)，不冒作最終候選。

## 改了甚麼，鎖定甚麼

- C33花／C32布的positions、normals、indices完全相同，原JSON／Blend母檔逐byte保留；C27位置、精確庫存／承托、枝根、外框、192反射不變。只有花的既有UV映射及兩張albedo版本圖頁改變，沒有加面／花／材質群。
- 沿用C31物件UV圖集管線，保留舊圖頁，新增可重建C34版本。花的原longitude／ring UV分配至同一圖集三個主／側區；既有相同paper批次使用白色保留區，因此仍共用**一個原paper角色／roughness .96**，沒有第18群。
- 布保留原物理寬度／弧長UV。色面只由已接受布本身的法線，在既有UV中畫出寬幅暖亮／冷暗轉折；厚度共用UV時選取物件固有的上面／前面，沒有讀取相機、庫存或場景遮擋。原display-linen albedo作底，原fabric角色／roughness .86、normal／ORM／sheen保留。
- **沒有把杯或其他庫存陰影畫進固定圖。** 真3D燈光、接觸陰影、法線及specular繼續作用。src/world.ts相對C33只有診斷import／metrics欄位；移除此二項後逐byte相同，光照、材質工廠、相機、動作與計帳程式未變。

## 本次來源的證據

- [最終255tests](../evidence/native-v11/checkpoint-34/c34-final228-tests.log)、tsc／三個variant build通過；validate五語174keys／replay／asset-check通過。沒有新跑五語窄屏操作，沒有冒稱舊UI矩陣屬於228。
- 新整合測試實際編譯base/values配方，兩者花／布geometry hash等於已接受母檔，**style+canopy15776tri／17styling群**，原 `<16000`／`≤17` 上限不變。原4448底點／541布接觸檢查通過，沒有放寬斷言。
- 146GLB零錯警告、305保護檔通過；55個既有公開GLB byte不變，原生母檔只更新sources metadata。**這不是C34材質的原生匯出或native接受**；新的atlas、生成腳本與既有模型源已保留供後續整合。
- [values228／182檔](../evidence/native-v11/checkpoint-34/c34-final-parity-values.json)、[base229／182檔](../evidence/native-v11/checkpoint-34/c34-final-parity-base.json)均由最終application重建逐byte相同；兩張新圖頁master／public與重建byte一致。普通build保留201形體；新增圖頁尚非普通預設的材質採用。
- [最終browser證明](../evidence/native-v11/checkpoint-34/c34-final-browser-proof.json)：支持的UI匯入同一8-stock測試Sandbox，正常camera／兩個實際pointer orbit／經濟相同、save不變、fresh隔離Normal不變、0pageerror。故事卡的延後顯示用正常UI關閉並等待完成，沒有修改故事程式或玩家存檔。

本次**未採用材質**，因此沒有把C29交易影片冒作228的新sale／handoff／reload驗收；若材質獲准採用，仍需新來源實際交易／0部分滿庫存及reload等affected流程。Low／hidden-tab／closure／實體GPU／audio/native仍不由這些片段認證。

下一步只覆核同桌材質；若失敗，保持已通過形體與構圖，針對值面修正，不擴散全店。無merge／Ready／Site save/deploy／新發佈包／Library或LTC重試／玩家Chrome或Normal／Unity／關機。環境短暫重連後先確認原程序與完整結果，沒有重跑完成錄影。無需使用者動作的阻塞。
