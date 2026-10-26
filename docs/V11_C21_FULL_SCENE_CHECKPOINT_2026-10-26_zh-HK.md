# V11 C21：整體構圖重建與實際遊戲對照

**美術仍未達原圖品質／畫風；這是下一個獨立視覺檢查點，不是完成或發佈驗收。** PR8保持Draft，公開Site V17不變。

實作／實際遊玩來源：`01dc573430c8306da3c0d1fc1d8afe52785eeb85`（immutable127）。幾何對照來源 `f96f14f884819486691a0e8098616a4368b5eef5`（126）；先前123作整體BEFORE。原圖 [Approved_Visual_Target_Misaki.png](codex-v4/reference/Approved_Visual_Target_Misaki.png)，SHA256 `9f855d2ecfd120bb45c001db3fa9b5a3e3b58b2b3c2a4cf9e7ebfda84f8f7114`，比較其左側店舖，沒有更換參考方向。

## 實際改建，而非只改燈光

- 三款實體桌／櫃：開放紙品工作桌、抽屜中央桌、奶油色面板窗邊矮櫃。兩張靠窗桌向牆側擴至2.25m，顧客側邊緣不變；前景櫃檯左翼擴闊，仍保留原收銀器、工作高度與服務／手部接觸點。避障邊界與選中底框同步配合真實家具尺寸。
- 長條連續展示台改為分開的高／中／低平台。紙本、畫架、筆筒／工作鉛筆、紙卷是固定非庫存陳設；不是新SKU或額外獎勵。實際貨品仍按真實庫存顯示、上限8，減貨／買貨不重新排列存留單位。三桌／全部SKU／0–9數量的prefix、範圍、分離與原支撐檢查通過。
- 新36行真實窄木板、錯縫、倒角與原創低對比PBR木紋，長軸與原圖方向一致。維持原Y=.079／厚.018m；寬度是作者推定，不能稱為原圖核准量度。室內木紋凹凸Web／GLB同步降為.10。
- 門口後方加入真實立體地磚、樹枝和曲面葉叢，透過實際門口幾何裁切，未增加可玩區域或改動門軸。窗外／入口冷光與室內暖反射、柔化陰影另作同模型對照。
- 新439靜態網格的Cycles接觸陰影烘焙，完整JSON／Blend／PNG母檔在 `assets/masters/native-v11/c21-contact/`；舊母檔保留。沒有烘入演員、庫存、銷售、活動門扇或存檔。這是接觸遮蔽，不是GI或場景替代圖。

角色／rig／頭髮／衣服、釉陶、修正後鉛筆尺度沿用先前較好的V11資產，本次沒有把它們重報成新造。接受的直向入貨／定價清單、五語內容、經濟、存檔與相機操作保持。native樣本新增明確 `stackLayer`；未來native adapter須依 `staged-products-v11.ts` 的真實支撐與層高，不可只讀sample.at[1]推算。

## 原圖、BEFORE、AFTER均標明來源

1440×1200的實際正常遊戲，全店可見高度接近原圖左店舖；沒有注入相機／人物姿勢／交易、沒有用資產工作室代替遊戲。前後三種鏡頭及現金／庫存／貨架逐項相同，自然idle／葉動相位可不同。

- [原圖：美術目標，非遊戲](codex-v4/reference/Approved_Visual_Target_Misaki.png)
- [BEFORE：真實遊戲123](../evidence/native-v11/checkpoint-21/macro-height126/before-normal-game.png)
- [幾何重建126：同批貨品／同鏡頭](../evidence/native-v11/checkpoint-21/macro-height126/after-normal-game.png)
- [AFTER127：同幾何、更新光線及木材凹凸](../evidence/native-v11/checkpoint-21/light127/after-normal-game.png)
- [AFTER全景](../evidence/native-v11/checkpoint-21/light127/after-panorama-game.png)、[實際店員／櫃檯近視角](../evidence/native-v11/checkpoint-21/light127/after-counter-game.png)
- [230.960秒未剪接真實營業](../evidence/native-v11/checkpoint-21/normal-flow127/gameplay-uncut.webm)、[流程結果](../evidence/native-v11/checkpoint-21/normal-flow127/results.json)、[原始時間軸](../evidence/native-v11/checkpoint-21/normal-flow127/timeline.json)

實際High流程232.141秒工作時間：買貨／上架、進店招呼、單次真實一小時結算、Visitor A收銀交接、18件合計毛利+¥8,400（未扣人工租金）、離店／店員返回／重載。讀過收銀、毛利畫面及影片151／175／198秒樣本；沒有把抽幀當作精確手部／全步態流暢認證。新的完整Visitor B成交、關店drain／reopen及真正hidden頁面沒有在此影片另行驗證。

## 必要技術檢查與限制

218測試、build／validate／replay／asset-check通過；141 GLB零錯誤／警告，305受保護檔案與其餘路線／相機算法保持。34份native輸出新鮮重建零差異；實際遊玩127與從固定來源新建的163個payload逐byte相同。140個C20 GLB中131完全相同，9個差異均為有意重建家具／地板或配合木紋normal強度，另新增入口GLB。原角色／釉陶／布袋等GLB未在此回合替換。

五語×1280×720／375×812／320×420共15案例、75面板切換，桌面580px、鏡頭不跳、無頁面橫溢及44px購買高度檢查通過；觸控及Reduce Motion為雲端模擬。Normal隔離基線在實際完整流程前後一致，沒有讀寫玩家存檔。

[最終來源、所有證據雜湊與限制](../evidence/native-v11/checkpoint-21/final-provenance.json)。僅Chromium WebGL2／ANGLE SwiftShader雲端軟體渲染，非實體GPU／FPS／音訊／原生或最終目標驗收。原C17房間反射資產仍是已註明的靜態近似，未冒稱C21光照重拍。未新造發佈archive，未save／deploy／merge，未重試Library已受阻路線或使用使用者Chrome。

## 下一輪視覺審查要看甚麼

仍有明顯差距：原圖的混合陳列密度與自然排列、物件／人物在整體中的比例及細緻質感、柔和但有焦點的窗口光、植物／屋頂距離層次，以及前景收銀互動構圖。新桌櫃、地板、庭景與明暗層次要先作整體比較；不能以較亮、更多細節、通過測試或此報告代替原圖品質。不要為了再加微細節而丟掉已改善的角色、產品尺度、釉色或穩定互動。
