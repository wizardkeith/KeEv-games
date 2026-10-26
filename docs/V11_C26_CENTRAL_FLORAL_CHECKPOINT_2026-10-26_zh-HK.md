# V11 C26 同桌主花器163：固定模型／真正正常畫面，品質門檻仍開放

application **ba3fa07d849e12af80838b472e1f65f7bc10aac4**／build163。**原圖品質仍未達標；這是獨立視覺覆核檢查點，不是發佈建議。** PR8保持Draft，無merge／Site save/deploy。

[唯一目標原像素](../evidence/native-v11/checkpoint-24/target-central-crop.png)／[C24正常BEFORE](../evidence/native-v11/checkpoint-24/selected149/after-normal-game.png)／[真正正常AFTER163](../evidence/native-v11/checkpoint-26/selected163/after-normal-game.png)。

同一340×300矩形，包含整個花冠／花器／杯群／布緣：[BEFORE149](../evidence/native-v11/checkpoint-26/before149-full-group.png)／[BEFORE154](../evidence/native-v11/checkpoint-26/before154-full-group.png)／[AFTER163](../evidence/native-v11/checkpoint-26/selected163/central-full-group-crop.png)。[camera／cash／inventory／shelves相同](../evidence/native-v11/checkpoint-26/matched-camera-economy.json)。原圖相機未知，沒有像素配準聲稱；休息時角色／風動自然變化。

中央原有固定花器改成708tri圓腹／肩頸／左向把手、沿用已改善的celadon材質，並非新商品。新1738tri花冠是三主枝／十群分叉／二十末端／60朵五瓣薄實體花，非alpha卡或場景圖片；花朵固定向店內開放空間傾斜且各有差異，不追隨鏡頭。原版5204tri`jug.json`仍未整合；實際使用獨立`flower-jug.json`。只替換同一組非庫存裝飾，另兩束保留。

三本既有書冊旋轉／調整陳列尺度，仍有真實堆疊／桌面支承，與大花器留空隙，35個固定樣品不變。布緣跟隨實際25mm木圓角加2.5mm外偏移（2mm布厚＋0.5mm間隙），保留1744tri、主要重力褶及24實體流蘇；內面最近距離小於1mm且不穿木。真實杯群的SKU／8件／存活prefix／實際支承不變，沒有新增物品或經濟。

[235tests](../evidence/native-v11/checkpoint-26/pinned-tests.log)／production build／[146GLB零錯誤警告](../evidence/native-v11/checkpoint-26/glb-results.json)／[305保護檔案](../evidence/native-v11/checkpoint-26/pinned-protected.json)通過。整組styling＋canopy15990tri／17材質群，沒有提高／拆分預算。姿態投影面積約1.95倍的[數值診斷](../evidence/native-v11/checkpoint-26/static-petal-orientation.json)不計遮擋／照明／AA，不能當作像素覆蓋或目標驗收。

**固定source後重新檢查已完成**：validate／replay／assets、[提交後新build](../evidence/native-v11/checkpoint-26/post-source-build.log)、[39 native輸出重建](../evidence/native-v11/checkpoint-26/native-parity.json)及[174實際runtime payload逐byte相同](../evidence/native-v11/checkpoint-26/runtime-parity.json)。普通build不含reference snapshot hook；未建立新發佈tar或Site版本。[五語×三尺寸15案例／75面板](../evidence/native-v11/checkpoint-26/framing163/results.json)通過，touch／Reduce Motion、44px、580px與camera穩定。所有Blender／低mesh JSON／作者程式及未採用變體保留。新樹冠未當成功標準傳播，LTC403仍停止；無玩家Chrome／Unity／關機／Library重試／新發佈包。

相較C24已形成較明確的圓腹主花器、展開花冠與布緣；仍需覆核花冠密度／自然度、8杯視覺權重、材質細膩度與柔光接觸。全店棕米色、規整陳列及新冠體貼圖語言等整體差距仍在，**沒有宣布同桌品質標準或整幅原圖達標，不向全店擴散**。


## 同一來源的實際營業與限制

[200.800秒未剪接原片](../evidence/native-v11/checkpoint-26/normal-flow163/gameplay-uncut.webm)／[從139秒開始的27.960秒連續摘錄](../evidence/native-v11/checkpoint-26/normal-flow163/continuous-from139-27.960s.webm)。VFR端點令摘錄少於要求的29秒來源窗口，沒有內部剪接或加速。[實際結果](../evidence/native-v11/checkpoint-26/normal-flow163/results.json)：Fresh Sandbox真買8本／8杯／8茶放三架、招呼、一次普通UI一小時結算、A收銀交接／離店／店員返回及reload，零pageerror、隔離Normal基線不變。原片[148秒](../evidence/native-v11/checkpoint-26/normal-flow163/video-samples/second-148.png)／[150秒](../evidence/native-v11/checkpoint-26/normal-flow163/video-samples/second-150.png)清楚可讀「18件／+¥8,400／未扣人工租金」；是實際結算合計毛利，未改會計或捏造單客利潤。[164秒](../evidence/native-v11/checkpoint-26/normal-flow163/video-samples/second-164.png)見送客／離店，[174秒](../evidence/native-v11/checkpoint-26/normal-flow163/video-samples/second-174.png)見店員返回。

150個CDP收到畫面維持原時間；這是雲端SwiftShader軟件WebGL，稀疏錄影**不認證連續流暢度、實體GPU/FPS/audio/native**。沒有新完整B成交／hidden-tab／關店drain驗收。`actualMargin`旗標以外另檢視原片像素；沒有把邏輯cue當畫面通過。物理接點／書冊／布緣由[額外幾何測試](../evidence/native-v11/checkpoint-26/physical-contact-tests.log)驗證，未宣稱影片可作精確手部測量。

[固定鏡頭的花瓣朝向A/B](../evidence/native-v11/checkpoint-26/orientation-ab/provenance.json)保留原162截圖與163選定畫面；姿態數值診斷僅供找原因，非target acceptance。未採用／中途花冠母檔在`assets/masters/native-v11/experiments/c26-*`保留；C25流蘇越界失敗保留在上一檢查點，沒有放寬測試。這次只形成更大的既有主花器與同桌花冠／布緣，**仍不是品質標準完成**，花形仍簡化、杯群規整、材質／柔光未追上原圖，保留獨立視覺覆核門檻。

可選矩形光LTC檔`https://assets.babylonjs.com/core/areaLights/areaLightsLTC.bin`的既有單次read-only讀取回覆HTTP403，該下載已停止，未取得／未整合、未改路由重試；未進一步判定拒絕由哪一層發出。它不阻塞既有模型／材質工作，無需使用者動作。沒有其他被拒絕、待批准或不確定的外部發佈寫入：merge／Site save/deploy根本沒有執行。
