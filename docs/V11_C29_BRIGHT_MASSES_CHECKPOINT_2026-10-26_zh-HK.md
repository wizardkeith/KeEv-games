# V11 C29 同桌白花／布重建201 — 候選，原圖仍未通過

Application **567c4fb51794be7d17b472fc7201795f91ba7fda**／固定build201，PR8保持Draft，無merge／Site變更。C27已接受的位置層級及192反射逐byte保留；本輪只重建同桌既有非庫存花冠與linen，不擴散全店，不增加SKU／故事／玩法／加乘／存檔欄位。

[唯一原圖](codex-v4/reference/Approved_Visual_Target_Misaki.png)／[192真正常BEFORE](../evidence/native-v11/checkpoint-28/selected192/combined-normal-game.png)／[201真正常AFTER](../evidence/native-v11/checkpoint-29/selected201/view-purchase-reload/combined-normal-game.png)。[同一原像素局部](../evidence/native-v11/checkpoint-29/selected201/192-before-201-after-central.png)／[原圖及正常全幀對比](../evidence/native-v11/checkpoint-29/selected201/reference-before-after-normal.png)／[可見店鋪同高480px比較](../evidence/native-v11/checkpoint-29/selected201/equal-shop-height-comparison.png)。相機與初始cash3840／8庫存／shelves逐值相同；原圖相機未知，不宣稱像素配準。全是實際production WebGL，僅標示／裁切／等比例縮放，沒有生成概念或studio替代遊戲畫面。

## 實際重建與保留

- 六組疏密不同（12–30朵／組）的120朵封閉立體五邊小花，分開上下瓣面法線，真實枝梗接口藏入母枝體積；不是平面卡、alpha花圖或隨鏡頭轉向。花冠在固定3D資產空間朝正常相機橫向展開；沒有改C27 crownYaw／花器基點／書／杯群。原先50朵與景深朝向收益不足，未列為通過。
- Linen有三組不等寬主垂褶、實際2mm厚度及24條獨立流蘇；從25mm真實桌角起垂，平面商品承托高度不變。褶深收在原傢俬界線內，沒有放寬路徑／碰撞／承托測試。UV沿實際布面弧長，未增加weave解析度。新接觸AO由同一固定模型重烘，強度0.55／距離0.12m不變，排除owned stock、人物、door和FX，售罄不留杯影。
- Styling＋canopy **15986tri／17群**（192為15990tri），未提高16000上限；linen2076tri（舊1744）。原C25/C28 JSON／Blend及接觸母檔保留，新C29另存可編輯母檔。192反射SHA256仍`ab2ddab4e6f5b7e64370f7ba2fb63497326a4f19b669a5ccb459cfef8e2f3258`。薄瓣透光199無可靠正常尺度增益，已撤回。

[探索與撤回記錄](../evidence/native-v11/checkpoint-29/exploratory/)：193因TS失敗誤複製舊192 dist，**影像已排除**，只留INVALID說明；後續set-e及brightMasses身份斷言。194–197是實際C29工作樹探索，仍稀疏／法線問題，不冒充固定source的測試；198建立120花群；199透光撤回。首次外凸布褶被既有envelope測試捉到，修正幾何後247tests全過，未放寬測試。

## 固定201已完成的檢查

**247tests／build／validate五語174keys／replay／asset-check；146GLB零錯警告、305保護檔／相機演算法不變；39native及447 tracked資產/public素材重建前後一致、178runtime檔與固定201逐byte相同。** 447是重建前後核對數，非宣稱447個均重新生成。[完整記錄](../evidence/native-v11/checkpoint-29/selected201/)。

[15五語／尺寸Low／觸控模擬／Reduce Motion案例、75面板](../evidence/native-v11/checkpoint-29/selected201/low/results.json)通過。[148.840秒未剪真遊戲](../evidence/native-v11/checkpoint-29/selected201/view-purchase-reload/gameplay-uncut.webm)含真實pointer雙角度、面板／同一Shop視角保留orbit、買1杯cost70／cash3840→3770／stock8→9、逐值reload及[購買後實際reload3D](../evidence/native-v11/checkpoint-29/selected201/view-purchase-reload/actual-post-purchase-reload-game.png)。0pageerror，隔離Normal不變；46個CDP來源畫面是稀疏雲端軟件錄影，不是實體GPU/FPS／連續流暢度／audio/native驗收。**201完整A及庫存循環已另完成，來源同為567c4fb／201。** [502.920秒未剪High原片](../evidence/native-v11/checkpoint-29/selected201/high/gameplay-uncut.webm)／[380–410秒連續毛利與回位節錄](../evidence/native-v11/checkpoint-29/selected201/high/continuous-380-410s.webm)／[420–450秒連續離店節錄](../evidence/native-v11/checkpoint-29/selected201/high/continuous-420-450s.webm)。真買入／上架／招呼／一次普通UI小時／收銀接觸／[393.2秒18件+¥8400合計毛利、未扣人工租金](../evidence/native-v11/checkpoint-29/selected201/high/actual-margin-393_2s.png)／[398秒回位](../evidence/native-v11/checkpoint-29/selected201/high/actual-staff-home-398s.png)／[450秒已服務A離店](../evidence/native-v11/checkpoint-29/selected201/high/actual-served-exit-450s.png)／[結算後reload真3D](../evidence/native-v11/checkpoint-29/selected201/high/07-actual-post-reload-game.png)，0pageerror／隔離Normal不變。[原始結果／完整時間線](../evidence/native-v11/checkpoint-29/selected201/high/results.json)。手動抽看360.28/374.87/393.21/407.19/424.95/441.71及另抽393.2/398/450秒；155個CDP來源畫面，沒有冒稱所有連續畫面、精準手接觸、全B／closure／hidden-tab或實體效能驗收。

[真正UI庫存循環](../evidence/native-v11/checkpoint-29/selected201/stock-cycle/results.json)完成0→買3／上架→鍵盤005至8→reload8→兩次分別確認UI小時至2→0→售罄reload0；無效0+Enter不寫入、原始005草稿保留、存檔逐值相同、隔離Normal不變、0pageerror。所有階段固定花冠／書／布保留；手動查看[初始0](../evidence/native-v11/checkpoint-29/selected201/stock-cycle/00-empty.png)和[售罄reload0](../evidence/native-v11/checkpoint-29/selected201/stock-cycle/05-soldout-reload.png)沒有明顯owned cup影殘留，並非所有相機／毫米級認證。局部contact計數1→2→3，reload後1→2→3；兩實際幀間不重繪，非GPU效能分數。

[獨立scratch作者重建](../evidence/native-v11/checkpoint-29/selected201/c29-authoring-parity201.json)：新linen JSON／provenance及AO PNG／provenance四檔逐byte相同；Blend保留可編輯母檔但不冒稱含時間／路徑的二進位metadata一致，沒有重寫canonical Blend。

花群與主褶在正常畫面有可見變化，但白花仍可辨個別亮點、布與整體場景的柔光／材質豐富度仍離原圖有差距。**同桌材質及原圖門檻尚未通過，等待獨立像素覆核**；沒有靠tests或不可見幾何宣稱達標。LTC403保持停止，無Library重試／新發佈包／玩家Chrome或Normal／Unity／關機，無需使用者動作阻塞。

## 另補192原有驗證缺口（不是201證據）

runtime **104845d1af897902297fd759efd699bc8a7eeb38／192**：[reload真實3D345active meshes](../evidence/native-v11/checkpoint-29/baseline192-closure/reload/actual-post-reload-normal-game.png)、[五語Low15案例75面板](../evidence/native-v11/checkpoint-29/baseline192-closure/low/results.json)、[新268.920秒未剪High](../evidence/native-v11/checkpoint-29/baseline192-closure/high/gameplay-uncut.webm)。真買入／上架／招呼／一次UI小時／A接觸交接／[185.5秒18件+¥8400合計毛利，未扣人工租金](../evidence/native-v11/checkpoint-29/baseline192-closure/high/actual-margin-185_5s.png)／[店員回位198.6秒](../evidence/native-v11/checkpoint-29/baseline192-closure/high/actual-staff-return-198_6s.png)／[客人離店215.3秒](../evidence/native-v11/checkpoint-29/baseline192-closure/high/actual-served-exit-215_3s.png)／[結算後reload真3D](../evidence/native-v11/checkpoint-29/baseline192-closure/high/07-actual-post-reload-game.png)。0pageerror／隔離Normal不變。

舊184harness要求home與outside同一取樣，會漏掉店員先回位再工作；新觀察分別記錄checkout後兩真實事件（home198.623s、exit210.911s），未改遊戲／注入clock或sale／將舊false改true。原片抽看166.3/174.9/185.53/194.6/201.52/208.47/215.35/224.01秒；151 CDP來源畫面，不冒稱B／hidden-tab／closure／實體GPU/FPS或完整平滑動作認證。
