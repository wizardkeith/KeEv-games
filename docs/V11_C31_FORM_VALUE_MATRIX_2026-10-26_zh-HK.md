# V11 C31：正常遊戲尺度形體／設計值2×2，拒用本版

Application **`2cdc18cbab0eb8092f68e467b9fc7d04e65a1774`**。同一Draft PR8，未合併／發佈，公開V17不變。**這一版未通過花布大形門檻，沒有採用。** 預設保留201花冠／布、C27構圖、192反射；C30光照試驗全部OFF。原圖仍是唯一目標，不是相對進步便算完成。

[原圖左店鋪／C31實際正常畫面、同店高](../evidence/native-v11/checkpoint-31/original-combined-equal-shop-height.png)；[正常全景2×2](../evidence/native-v11/checkpoint-31/normal-game-matrix-equal-shop-height.png)；[斜角一](../evidence/native-v11/checkpoint-31/oblique-0-matrix-equal-shop-height.png)／[斜角二](../evidence/native-v11/checkpoint-31/oblique-1-matrix-equal-shop-height.png)。皆為真實WebGL原片截圖，沒有用Blender／概念圖代替遊戲。原圖相機參數未知，同店高只是比較大形，不是像素級匹配認證。人物自然活動，位置不同，不冒作同姿勢人物比較。

## 唯一一輪2×2結果

四組同1440×1200正常相機、201燈光／曝光、192反射、同一份普通UI匯入的8庫存Sandbox；兩個斜角由實際pointer操作取得。跨四組相機／經濟／兩個斜角pose逐值一致、C30均OFF，隔離Normal不變、0pageerror。[逐值結果及原片長度](../evidence/native-v11/checkpoint-31/checks/c31-cross-matrix-proof.json)。

|正常圖|形體|值設計|實際判斷|
|---|---|---|---|
|[206 control](../evidence/native-v11/checkpoint-31/matrix-original-values/control-normal-game.png)|201原形|原值|基準；同桌／整體原圖門檻仍FAIL。|
|[207 shape](../evidence/native-v11/checkpoint-31/matrix-original-values/shape-normal-game.png)|新形|原值|花瓣群較大，但正常全景／斜角仍是分開的扁瓣與細枝，未形成鬆軟主要花團；拒用。|
|[208 values](../evidence/native-v11/checkpoint-31/matrix-authored-values/values-normal-game.png)|201原形|物件UV設計值|局部冷暖／暗部差異不足以改變正常讀法；另材質群超原限，拒用。|
|[209 combined](../evidence/native-v11/checkpoint-31/matrix-authored-values/combined-normal-game.png)|新形|物件UV設計值|放大裁切可見變化，全景未建立花團／布轉面大形；斜角仍偏扁散；拒用，沒有追加花數／微紋。|

**決定性的下一步：不再放大個別花瓣或加點。應在同一花冠範圍直接雕出有起伏、遮蓋及負空隙的主要簇面，再以小花收邊；布則先設計正常鏡頭可見的外翻曲面及主褶方向。先過正常輪廓／轉面，再回到材質；不可讓設計值取代實際形體。** 這是下一步方法判斷，不冒充本輪已做到；本輪僅完成指定一輪對照。中性平坦是預期控制結果，不是幾何唯一根因或引擎／面數預算極限的證明。

## 本輪實際製作與預算

- 新花JSON／可編輯Blend：30朵互相覆疊的主要五瓣形＋24朵邊緣小花，封閉上下表面、分開法線／UV，三主枝／六疏密群；1176tri（原1734），不是圖片卡或朝鏡頭billboard。但**幾何封閉不等於視覺有體積**，斜角仍讀成扁瓣，所以拒用。
- 新布JSON／Blend：兩道寬主褶、2mm實厚及24流蘇，2076tri與原相同。商品承托平面／20條實際support rays保留，未移物件／改庫存規則。正常尺度外翻面仍不足，未採用。
- [原創UV值設計及來源](../assets/authoring/native-v11/form-values-c31.json)：128²花瓣上／下側暖亮冷暗、512²布的寬值域。沒有庫存／杯子／相機輸入，沒有固定庫存陰影；保留真PBR光照、接觸、鏡面及粗糙度／normal。沒有發光圖、螢幕貼圖或烘焙場景替代。
- [各variant獨立預算稽核](../evidence/native-v11/checkpoint-31/checks/)：control15986tri／17群，shape15428tri／17群；values15986tri／18群、combined15428tri／18群。**設計值兩組18群未符合既有少於18群上限，亦不具採用資格。** 未放寬測試／預算；普通預設仍17群，未把已失敗試驗當生產功能。未為無效視覺方案擴散材質或進行全店重做。

## 固定來源、原片與檢查

可用同一份[普通UI產生的隔離Sandbox fixture](../evidence/native-v11/checkpoint-31/actual-ui-sandbox-seed.json)及既有QA工具重現；不是玩家Normal或人工組裝經濟狀態。每次固定構建後用新的immutable目錄，禁止覆寫舊證據。例：

```sh
VITE_V11_FORM_VALUES=combined npm run build
# control / shape / values / combined 四組，其他旗標不變；C30不啟用
# QA_FORM_MATRIX=1 QA_FORM_ORBITS=1 QA_EXPECT_MODE=combined QA_EXPECT_BRIGHT=combined
# QA_SEED=evidence/native-v11/checkpoint-31/actual-ui-sandbox-seed.json
# QA_LOOK_URLS=combined=http://127.0.0.1:<local-port> QA_OUTPUT=<new-local-directory>
# node tools/v11-table-look-qa.cjs
```

四組各180runtime檔與最終source按各旗標重建逐byte相同，包含實際使用PNG／bundle，不以模式文字單獨冒充資產身份。[四份final-parity](../evidence/native-v11/checkpoint-31/checks/)。另捕捉到未指定旗標時Vite保留未選模型資料（world chunk約9.96MB、control約8.81MB）的交付問題；已用build config將普通構建明確規範為control。**無旗標普通build與206 control的180檔逐byte一致**，[確認](../evidence/native-v11/checkpoint-31/checks/c31-final-default-parity.json)。全部歷史保留，不把較早失敗比對改成通過；沒有因此採用新美術。

四段未剪實際pointer／正常到雙斜角錄影：

- [control137.520秒](../evidence/native-v11/checkpoint-31/matrix-original-values/control-motion/gameplay-uncut.webm)，22個CDP來源幀。
- [shape140.080秒](../evidence/native-v11/checkpoint-31/matrix-original-values/shape-motion/gameplay-uncut.webm)，30幀。
- [values128.800秒](../evidence/native-v11/checkpoint-31/matrix-authored-values/values-motion/gameplay-uncut.webm)，22幀。
- [combined140.080秒](../evidence/native-v11/checkpoint-31/matrix-authored-values/combined-motion/gameplay-uncut.webm)，30幀。

人工查看四張正常圖、兩張四組斜角拼圖、combined原尺寸雙斜角及原圖；未逐幀覆核四片。這是稀疏CDP／雲端SwiftShader及閉店人物活動／相機操作，**不是連續流暢度、實體GPU/FPS或新收銀／交易／離店流程驗收**。

最終source預設control的**250tests／build／validate五語174keys／replay／asset-check，146GLB零錯警告、305保護檔／相機演算法**通過。[原始檢查](../evidence/native-v11/checkpoint-31/checks/)。新增三測試直接驗證C31封閉花瓣／法線／UV／較低面數／範圍、商品support、原圖／構圖／192反射／素材byte。四native exporter完成：458原tracked資產比對，僅三個manifest／環境master的sources metadata更新；既有GLB未變。**250預設測試不冒作values18群合規；獨立variant稽核明確FAIL。** 原母檔不覆寫，新JSON／Blend／兩PNG及工具另存，未假稱本輪新變體已匯出為GLB或447素材全量重建。

C31新形沒有被採用，因此沒有把舊201／C30交易、五語Low／觸控／Reduce Motion、售罄／reload、A/B等原片重新標成C31通過；若後續方案視覺及預算先過，採用前仍需 affected actual buy/place/stock/reload／Low與流程確認。UI／五語／economy／save／rig／camera來源保持，未新增故事／店／套裝／能力。

沒有merge、Site save/deploy、發佈tar、Library／LTC重試、玩家Chrome／Normal操作、Unity或關機。沒有使用者動作／權限阻塞。待解的是未通過的視覺方法及試驗材質群超限，非可忽略的完成項目；原圖仍未達標。
