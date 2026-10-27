# V11 C44：只縮小接觸遮蔽半徑，未採用

Application `35301d7b59b42c1875558665d8daf21298c1d4ca`，[Draft PR8](https://github.com/wizardkeith/KeEv-games/pull/8)。父任務轉達C43窄視覺FAIL：接地與層架分離有實際改善，但上層架後連續灰帶及植物／架端煙霧感過廣。**C44只把SSAO radius `.70→.20`；C40仍普通預設，C43／C44均未採用，整體原圖品質／風格未接受。** 已通過的RTT修正保留，沒有merge或Site發佈，本輪未改公開V17。

[原圖／C43 .70／C44 .20，正常店高480px](../evidence/native-v11/checkpoint-44-local-contact/target-broad-contact-normal480.png)、[三處介面](../evidence/native-v11/checkpoint-44-local-contact/three-interfaces-broad-vs-contact.png)、[第一斜角](../evidence/native-v11/checkpoint-44-local-contact/oblique-0-comparison.png)／[第二斜角](../evidence/native-v11/checkpoint-44-local-contact/oblique-1-comparison.png)、[未裁剪C44正常遊戲](../evidence/native-v11/checkpoint-44-local-contact/contact-normal-game.png)。唯一原圖仍`Approved_Visual_Target_Misaki.png`，SHA256 `9f855d2ecfd120bb45c001db3fa9b5a3e3b58b2b3c2a4cf9e7ebfda84f8f7114`。圖片均來自實際1440×1200 WebGL遊戲，矩陣只裁切／等比縮放／標籤，沒有重繪、假HUD或概念替代。自然員工相位不同，不歸因於光源；部分headless raster遺漏HUD，DOM無Zen class且可見的證據保留，不當完整UI驗收。

273（contact）及274（occluded控制）從同一application建立；正常camera pose、兩次真pointer orbit pose、核心經濟欄位相同。live pipeline確認radius .20／.70；強度1、base.12、16samples、epsilon、blur、MRT比例、全部光量／曝光／camera／192反射／已過模型材質均逐值鎖定。[可重建來源與receipt](../assets/authoring/native-v11/scene-contact-c44.json)保留C43原配方及新來源雜湊；普通build仍`control`，只有`VITE_V11_SCENE_WINDOW=contact`啟用C44。沒有強化AO解決方向光或屋頂，也沒改布、花、層架或角色。

親自看正常全景、三處介面及雙斜角後：.20令層架後大灰帶和植物周圍擴散影明顯縮小，家具影範圍縮至接觸附近；桌腳與前櫃仍見較窄接地影。**這是供覆核的最小修正，是否保留足夠C43接地感仍待獨立判斷，不自稱視覺PASS。** 全景受光方向／材質轉面與灰屋面等原圖差距完全沒有宣稱解決，原圖重建目標繼續。

280tests、tsc／三組build、五語174keys validate、replay、asset-check通過；146GLB零error／warning、305保護檔、508資產重建一致。273／274各195runtime檔、普通275為182檔，從application重建逐byte一致。新增測試限定只有radius有視覺參數差異；原17styling群／14036tri／155固定項、geometry／materials／rig／routes／經濟／存檔不變。

[七份stock／四份quality及會計核對](../evidence/native-v11/checkpoint-44-local-contact/stock-shadow-proof.json)：fresh隔離Sandbox真UI invalid0、003買入／005鍵盤買入原稿保留、上架、0→3→8→reload8→一小時2→再一小時0→soldoutreload0通過。raw現金5000→4565→3840→3840→5490→6000→6000，sales1710／570、COGS870／290、每次現金營運費合計60、eventSequence增加18／6，沒有動畫入帳或重扣成本。Low不掛新增AO／geometry renderer，High新epoch恢復，畫質切換前後完整core相同；0與reload0產品caster／draw集合為空、實拍沒有原杯群遮蔽殘留，固定花器／書／布保留。fresh隔離Normal baseline不變，0pageerror。

Low軟件graph中無buffer、High重新掛載及NullEngine unsupported-path切換，**均不能認證supported WebGL的GPU資源已完成釋放**。同render caster／draw只屬CPU dispatch／RTT callback，非GPU fence／完成畫格。沒有新增完整B接袋、Reduce Motion、closure／hidden-tab、五語窄屏、實體GPU/FPS/audio/native驗收。

[C44 pointer原片85.520秒](../evidence/native-v11/checkpoint-44-local-contact/contact-motion/gameplay-uncut.webm)：27來源幀，中位3.18秒／最大6.65秒間隔；C43控制67.200秒／29幀，中位2.45秒／最大5.68秒。[真UI庫存／畫質原片293.400秒](../evidence/native-v11/checkpoint-44-local-contact/stock273/gameplay-uncut.webm)：177來源幀，中位1.82秒／最大7.16秒。public CDP＋已安裝ffmpeg、Chromium154／ANGLE SwiftShader，未剪切／加速，仍是稀疏軟件擷取，**不作連續動作或實體效能認證**。來源、cadence及24個media SHA完整保留。無使用者動作阻塞；功能未合併／PR8仍Draft，無玩家Chrome或Normal／Unity／Site／其他項目／Library或LTC重試／關機操作。
