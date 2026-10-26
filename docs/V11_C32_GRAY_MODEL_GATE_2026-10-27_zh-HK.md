# V11 C32：花／布灰模候選，等待獨立形體門檻

Application **`cd3538f46c53529398dca9f9866cbb0726d4958f`**，同一Draft PR8。**僅提交灰模覆核，未宣稱灰模通過、原圖達成或美術完成；未採用／合併／發佈。** 普通預設仍是feature branch的201控制外觀，公開V17沒有由本工作改動。C31拒用方案與C30傳輸全部OFF。灰模獨立通過前，不製作新貼圖／色調／材質整合，也不擴大到全店。

## 請先看實際正常畫面，再看斜角

[正常全景：同店高480px／同灰材質](../evidence/native-v11/checkpoint-32/normal-game-gray-comparison-480.png)，[斜角一](../evidence/native-v11/checkpoint-32/oblique-0-gray-comparison-480.png)／[斜角二](../evidence/native-v11/checkpoint-32/oblique-1-gray-comparison-480.png)，[原圖左店鋪／灰模遊戲](../evidence/native-v11/checkpoint-32/original-reference-gray-game-480.png)。原圖相機未知，等店高是形體比較，沒有冒充像素匹配或最終風格。原圖與灰模圖片均標來源，後者全是真實可操作WebGL；沒有Blender美容圖／概念圖／billboard代替遊戲。

原尺寸正常：[201灰控制216](../evidence/native-v11/checkpoint-32/old-gray216/old-gray-normal-game.png)／[C32灰候選217](../evidence/native-v11/checkpoint-32/gray217/gray-normal-game.png)；C32原尺寸[斜角一](../evidence/native-v11/checkpoint-32/gray217/gray-oblique-0.png)／[斜角二](../evidence/native-v11/checkpoint-32/gray217/gray-oblique-1.png)。[局部裁切僅補充](../evidence/native-v11/checkpoint-32/central-normal-crop.png)，不拿放大差異代替正常尺度門檻。

兩組同1440×1200、201相機／光照／曝光、192反射、同一普通UI匯入的8件Sandbox；實際pointer轉視角，**相機／經濟／兩斜角pose／灰PBR實際狀態逐值相同**。人物仍自然活動，位置不同，未冒稱同姿勢人物比較。[原始跨組核對](../evidence/native-v11/checkpoint-32/checks/c32-cross-proof.json)。

## 真正改了形體，沒有開始貼圖

- **花冠**：維持C27花器／枝根位置，一個較高主簇、兩個較低側簇，前後相差約11.6cm。以有深度的根枝、互相覆疊的封閉圓肩曲面建主要團塊；不是把小花數加多，也不是放大扁瓣。1524tri，原201為1734。初次灰模仍尖散，已收緊同批曲面的覆疊、改圓肩／縱向剖面，沒有增加主要曲面數或貼圖。現在只供檢視大形、遮蓋與不等開口；仍可能需要調整簇輪廓／自然性，不能把封閉幾何測試當灰模接受。
- **布**：兩道不同深度主褶；只在無商品承托的x<.235、z<.10區域隆起，變半徑曲面連續跨角，下垂段加寬可見轉面。實厚2mm、24流蘇，2076tri與原相同；未移杯／書／花器／傢俬。是否仍顯得偏硬、以及正常鏡頭轉面是否足夠，交本次灰模門檻判斷。
- 原JSON／Blend全部保留，新C32 JSON／可編輯Blend另存，工具為`build-v11-gray-flowers.ts`、`build-v11-gray-linen.py`、`blender-v11-gray-flowers.py`。Blend只是可重用作者源，不是遊戲畫面證據；沒有宣稱新形已匯出GLB或native驗收。

**一個真實共用灰PBR**：實際讀回RGB線性值三色均0.3762621、roughness0.801、albedo／normal／ORM貼圖均null、emissive0。為避免18群，灰顯示重用既有枝幹batch；同batch的其他固定枝幹也暫時中性化，兩控制組一致，沒有更改它們幾何。原vase／書／杯／傢俬及192反射維持，普通control不會中性化。不是新材質設計、發光圖或畫入商品陰影。

## 預算、承托、碰撞範圍

[三模式預算](../evidence/native-v11/checkpoint-32/checks/)：control15986tri／17群，old-gray15986／17，gray15776／17；沿用原style+canopy總16000與17群限制，沒有提高上限／拆分規避。布面數保持。早期中性化另開一群曾達18，已改回共用原枝幹batch，最終216／217都是17群。灰門檻通過後才可把色調整合到既有atlas／UV／原材質，屆時仍必須≤17群。

新測試檢查10款商品×8件的**4448個唯一底部點、541個原布接觸點**：新褶不穿入任何底部，原接觸高度保持；同時驗證原XZ布範圍及實際檯前裙板clearance。沒有放寬舊201的承托測試。

[花冠實際C27變換後world bounds](../evidence/native-v11/checkpoint-32/checks/c32-flower-world-bounds.json)：新花冠單獨minZ比舊花冠向檯內伸3.38cm，因此沒有假稱每個子物件bbox完全內含；但它仍在原「中央傢俬＋花冠」XZ範圍內，原有最大Z外伸量縮小，整個原fixture footprint沒有擴大。原碰撞／路徑／相機來源不變；這不是全導航、客人全流程或精準手接觸認證。

## 固定source與實際覆蓋

[模型／原圖／構圖／192反射SHA及三build逐檔身份](../evidence/native-v11/checkpoint-32/checks/source-runtime-identity.json)。最終source重建216及217各180runtime檔逐byte一致，[216](../evidence/native-v11/checkpoint-32/checks/c32-parity216.json)／[217](../evidence/native-v11/checkpoint-32/checks/c32-parity217.json)。普通無旗標與明確control亦逐byte相同，[確認](../evidence/native-v11/checkpoint-32/checks/c32-default-parity.json)。沒有把先前213／214探索畫面作最終來源。

可重現：

```sh
VITE_V11_GRAY_FORMS=old-gray npm run build
VITE_V11_GRAY_FORMS=gray npm run build
# 每組複製到新的immutable目錄再啟本地server，不覆寫先前輸出。
# QA_GRAY_MATRIX=1 QA_FORM_ORBITS=1 QA_EXPECT_MODE=combined QA_EXPECT_BRIGHT=combined
# QA_SEED=evidence/native-v11/checkpoint-31/actual-ui-sandbox-seed.json
# QA_LOOK_URLS=gray=http://127.0.0.1:<port> QA_OUTPUT=<new-local-directory>
# node tools/v11-table-look-qa.cjs
```

灰顯示會覆核同一實際PBR、無貼圖／發光及C31／C30 OFF，不以模式字眼單獨當來源證明。`tools/v11-gray-budget.ts`可經既有esbuild對`import.meta.env.VITE_V11_GRAY_FORMS`定義相同模式，獨立計算總面數／批次。

[216未剪145.840秒／33個CDP來源幀](../evidence/native-v11/checkpoint-32/old-gray216/old-gray-motion/gameplay-uncut.webm)，[217未剪154.720秒／36幀](../evidence/native-v11/checkpoint-32/gray217/gray-motion/gameplay-uncut.webm)。人工查看兩組正常480比較、原尺寸217正常／雙斜角及參考原圖；未逐幀覆核兩片。這是雲端SwiftShader／稀疏CDP閉店活動與真pointer操作，不是實體GPU/FPS／完整動作流暢度／audio/native或新結算流程通過。

[218普通control重載真3D](../evidence/native-v11/checkpoint-32/default218/actual-post-reload-normal-game.png)確認保留原201彩色外觀、灰模式control／灰材質null、逐值save不變、隔離Normal不變、0pageerror。216／217亦0pageerror、普通UI匯入後save／Normal不變。沒有操作玩家Normal。

最終source **252tests／tsc/build／validate五語174keys／replay／asset-check，146GLB零錯警告、305保護檔及相機算法**通過。[紀錄](../evidence/native-v11/checkpoint-32/checks/)。四native exporter只更新default source metadata，既有標準GLB幾何／材質仍由測試逐byte重建核對。早期TS測試輔助陣列缺型別時build已停止，沒有複製舊dist；舊PBR抽取器缺新gray依賴亦已補入binding，原斷言保留，未放寬或跳過失敗。

**現在等待獨立灰模門檻，尚未通過。** 若輪廓／轉面不過，繼續改形，不回到貼圖或加花數；若通過，才進既有材質／atlas階段。原圖整體畫風／畫質仍未接受，不能用252tests或灰模進步宣稱達成。沒有新故事／店／套裝／能力／經濟／save schema改動，UI五語與既有定價／入貨list保留。沒有把舊來源的High結算、Low／觸控／Reduce Motion、五語實機／隱藏頁／native重新標為本輪通過。

未merge、Site save/deploy或新發佈包，Library／LTC重試仍停止，無使用者Chrome／Unity／關機。無使用者動作或權限阻塞；材質階段因本輪明確的獨立灰模先決條件而保持pending。
