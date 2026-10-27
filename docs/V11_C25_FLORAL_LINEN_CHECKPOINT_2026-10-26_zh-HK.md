# V11 C25：真正花器／花冠／流蘇154；仍未成為品質標準

固定application **20a0433484fb71ce3e3aabf3d2ee7de961cf6c70**，build154。這是後續C26的安全基線，**原圖品質仍未達標、非發佈建議**。PR8仍Draft／未合併，公開V17沒有變更。

[唯一原圖中央原像素](../evidence/native-v11/checkpoint-24/target-central-crop.png)／[C24正常BEFORE](../evidence/native-v11/checkpoint-24/selected149/after-normal-game.png)／[C25正常AFTER](../evidence/native-v11/checkpoint-25/selected154/after-normal-game.png)／[C25同矩形局部](../evidence/native-v11/checkpoint-25/selected154/after-table-crop.png)。[正常camera／cash／inventory／shelves相同](../evidence/native-v11/checkpoint-25/matched-camera-economy.json)；原圖相機未知，未宣稱像素配準。角色及風動自然姿態不同。

本輪整合的是**新500tri `flower-jug.json`**，真中空／瓶腹／把手，並非原來未整合的5204tri `jug.json`；後者仍保留原稿。新分枝花冠由三主軸／十群分叉／三十雙花枝末端形成60個封閉3D小花，1618tri取代原1912tri；其他兩束不變。中央布改成0.64m寬、真厚度與24個實體流蘇，1744tri；低對比織線是素材顏色，不是畫上去的懸布。所有editable Blend／原JSON／來源保留，稀疏152已保留並明確不採用。全styling＋canopy15662tri／17材質群，沒有提高或拆分預算。無新SKU、庫存／經濟／存檔／相機／五語／UI語義變更。

- [233tests](../evidence/native-v11/checkpoint-25/pinned-tests.log)／build／validate／replay／assets通過；[146GLB](../evidence/native-v11/checkpoint-25/glb-results.json)零錯誤警告，305保護檔案零變更，39native新鮮重建／174runtime逐byte相同。初版流蘇越界失敗log保留，收回幾何後通過，沒有放寬測試。
- [五語15viewport／75面板](../evidence/native-v11/checkpoint-25/framing154/results.json)通過，touch／Reduce Motion／44px、580px與camera穩定。
- [286.880秒未剪真正High遊戲](../evidence/native-v11/checkpoint-25/normal-flow154/gameplay-uncut.webm)／[147–176秒連續摘錄](../evidence/native-v11/checkpoint-25/normal-flow154/continuous-147-to-176.webm)：實買上架、招呼、一次結算、A收銀交接／離店／店員返回及reload，[結果](../evidence/native-v11/checkpoint-25/normal-flow154/results.json)零pageerror、隔離Normal不變。[164秒抽幀](../evidence/native-v11/checkpoint-25/normal-flow154/video-samples/second-164.png)與[PNG](../evidence/native-v11/checkpoint-25/normal-flow154/04-actual-margin-in-game.png)真可讀18件／+¥8,400／未扣人工租金，是結算合計毛利，沒有改會計。203個CDP收到畫面維持原時間；稀疏錄影不能認證流暢度、實體GPU/FPS/audio/native，未新增完整B／hidden-tab／closure驗收。

**視覺仍不足**：布的實體流蘇較清楚，花器／分枝已重做，但瓶腹和花冠仍太接近杯的尺度、只是附件；八杯群仍主導。按C24獨立覆核，下一步C26在同一張桌內增加主花器／花冠的主從比例，以原有書冊、真杯群與布緣圍繞它，驗證實際支承／接點／空間；不擴散新樹冠或杯紋。這個文件不冒稱未提交C26已經測試／完成。

C24局部diffuse試驗仍停用，LTC403下載仍停止，無新阻塞需要使用者動作。沒有Site save/deploy／merge／新發佈包／Library重試／玩家Chrome／Unity／關機；唯一原圖方向不變。
