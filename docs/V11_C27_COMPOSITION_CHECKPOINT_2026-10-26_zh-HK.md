# V11 C27：同一批資產的中央桌構圖／受光，原圖品質仍未通過

Application **510cc245777b4162dbcd238bed7506cda8614d55**，src tree `0e6897afd4e627042e87e5e00b6d26fbf3053983`，production **169**。[Draft PR8](https://github.com/wizardkeith/KeEv-games/pull/8)；沒有合併或 Site save/deploy，公開 V17 不變。**這是構圖覆核檢查點，不是原圖美術驗收或發佈建議。**

[唯一原圖](codex-v4/reference/Approved_Visual_Target_Misaki.png)／[原圖中央局部](../evidence/native-v11/checkpoint-27/original-target-central-crop.png)；[C26 BEFORE163 正常遊戲](../evidence/native-v11/checkpoint-26/selected163/after-normal-game.png)／[AFTER169 正常遊戲](../evidence/native-v11/checkpoint-27/selected169/after-normal-game.png)。相同 340×300 原像素矩形：[BEFORE](../evidence/native-v11/checkpoint-27/before163-full-group.png)／[AFTER](../evidence/native-v11/checkpoint-27/selected169/central-full-group-crop.png)。[正常鏡頭及實際 cash/inventory/shelves 完全一致](../evidence/native-v11/checkpoint-27/matched-camera-economy.json)；原圖相機未知，沒有宣稱與原圖像素配準。角色及葉片自然移動，沒有固定姿態或場景圖片替代遊戲。

保留同一708tri花器、1738tri花枝／60朵花、5204tri杯及1744tri布；未重做或擴散其他模型。花器與三本原有書冊移到中央中後軸，整束花枝繞頸口轉向，使固定鏡頭下較橫向展開。八件真實庫存杯分成5／3不等量群，前後錯開並留出中央布面；存活單位位置不因買入、售出或重載而重排。固定裝飾樣品仍35個，花器及書不是新商品／獎勵／庫存。其他SKU也檢查0至9件、最多8個實體樣品及穩定prefix，沒有修改經濟或save。

中途檢查找到兩項實際支承問題並修正：鉛筆橫跨2mm布邊，改放完整木面；中央桌在遊戲layout有`(+0.1,0,-0.1)m`位移，花器／書／卡座現在從同一layout offset轉換到世界座標。[新增真實世界桌面射線及全SKU碰撞回歸](../tests/v11-central-composition.test.ts)檢查花器底部整圈、底本書角、實際檯座1mm支承間隙，及庫存與花枝三角形／裝飾的間隔。沒有只以模型原點或錯誤local bounds代替接觸檢查。`6e949d4`／build168是修正前診斷，**不能當作最終169證據**。

受光沿用現有兩盞補光代理：收銀燈不變，中央燈由垂直改為與窗光同方向，位置`[-2.5,3,-.3]`、方向`[.80,-.62,.18]`、24candela；全局曝光／fill／窗光／shadow設定不變，沒有新增燈、動態反射或GI聲稱。偏移／PCSS柔度試驗165和局部PBR倍率166在正常鏡頭收益不足，**都撤回**；[診斷](../evidence/native-v11/checkpoint-27/diagnostics/)與選定畫面分開。矩形光LTC既有read-only403仍停止，沒有重試或改路由。

**238tests、production build、validate（5語／174keys）、replay、asset-check通過**；[146GLB零錯誤／警告](../evidence/native-v11/checkpoint-27/glb-results.json)、[305受保護檔案及相機演算法](../evidence/native-v11/checkpoint-27/pinned-protected.json)不變。styling＋canopy仍15990tri／17群，沒有提高／拆分預算。[39native輸出重建一致](../evidence/native-v11/checkpoint-27/native-rebuild-parity.json)，425個tracked asset檔案在重建前後不變（不宣稱425個均重新生成）。[174實際runtime檔案與固定169逐byte相同](../evidence/native-v11/checkpoint-27/runtime-parity.json)，沒有建立新發佈tar。C26五語15尺寸案例／75面板僅作先前證據；本輪UI／locale／camera算法bytes保留，**沒有假稱重跑該矩陣**。

花器／書／布形成較明確的不同高度，杯群分組與布面留白可見；但花冠自然密度、釉／布的柔和反應、全店棕米中間調、規整貨群、窗外冠體質感仍落後原圖。**「花器／書／布先讀、杯其次」的獨立像素門檻仍待覆核；不宣稱同桌品質標準已通過，也不把這套未通過標準擴散到全店。**

## 最終來源的實際操作及限制

[386.280秒未剪接原片](../evidence/native-v11/checkpoint-27/normal-flow169/gameplay-uncut.webm)／[從259秒開始的26.600秒連續摘錄](../evidence/native-v11/checkpoint-27/normal-flow169/continuous-from259.webm)。要求29秒來源窗口，VFR端點使編碼摘錄較短，無內部剪接或加速。[High實際結果](../evidence/native-v11/checkpoint-27/normal-flow169/results.json)：買8本／8杯／8茶、擺3架、招呼、一次普通UI一小時結算、A收銀交接／袋／離店／店員返回與reload，0pageerror、隔離Normal基線不變。[原片276秒](../evidence/native-v11/checkpoint-27/normal-flow169/video-samples/second-276.png)清楚顯示「18件／+¥8,400／未扣人工、租金」；[319秒](../evidence/native-v11/checkpoint-27/normal-flow169/video-samples/second-319.png)見A帶袋離店，[330秒](../evidence/native-v11/checkpoint-27/normal-flow169/video-samples/second-330.png)見A已離開、店員返回櫃檯。是已提交結算的合計毛利，不是營業額、淨利或捏造單客交易。

143個CDP畫面保留原時間，整個QA執行389.277秒；軟件渲染及並行捕捉造成疏取樣／呈現延遲。遲到的`04-actual-margin-in-game.png`原樣保留，但它沒有文字，**不能作提示像素通過證據**；本輪另直接核對原片276秒。不是實體GPU/FPS/audio/native或連續流暢度驗收；未新做完整B／hidden-tab／closure流程。

[實際庫存循環](../evidence/native-v11/checkpoint-27/stock-cycle169/results.json)：[初始空桌0](../evidence/native-v11/checkpoint-27/stock-cycle169/after-empty-normal-game.png) → [實買並擺3杯等商品](../evidence/native-v11/checkpoint-27/stock-cycle169/after-normal-game.png) → [一次真實UI小時售罄0](../evidence/native-v11/checkpoint-27/stock-cycle169/after-depleted-normal-game.png)，已上架ID保留，reload後仍0；三種商品合計真售9件。另[8件正常桌面及reload](../evidence/native-v11/checkpoint-27/selected169/results.json)通過。0時只剩固定非庫存花器／書／布，沒有假裝仍有可售杯。這是UI＋只讀存檔驗證，沒有直接寫入狀態、改價或改模擬。

原創母檔／Blend／作者程式／未採用試驗及歷史均保留。沒有Library新上傳或下載重試、玩家Chrome／Normal存檔、Unity、關機或帳戶設定操作。可選LTC403不阻塞既有方法，也不需要使用者動作；本輪沒有被拒絕或不確定的外部發佈寫入，merge／Site save/deploy沒有執行。美術目標仍開放，交付供下一次獨立實際像素覆核。
