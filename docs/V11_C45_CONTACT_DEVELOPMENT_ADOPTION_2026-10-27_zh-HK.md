# V11 C45：C44局部接觸配置的開發預設採用

Application `1aaf9ce67c465f0fd1a3a10d8c5465f161608f84`，[Draft PR8](https://github.com/wizardkeith/KeEv-games/pull/8)。父任務轉達C44局部接觸門檻PASS，固定已審candidate `6c7f0a98c70f5c278e8a0f329065a7badb785779`／application `35301d7b59b42c1875558665d8daf21298c1d4ca`／build273。**C45只把同一套 `.20` 配置採為V11開發candidate的普通預設，沒有再調AO、光、模型或材質；整體原圖品質／風格仍未接受。** 功能未合併／PR8仍Draft，沒有Site發佈，本輪未改公開V17。

[原圖／已審C44／無flag C45正常480px](../evidence/native-v11/checkpoint-45-development-adoption/target-reviewed-default-normal480.png)，[未裁剪普通正常遊戲](../evidence/native-v11/checkpoint-45-development-adoption/ordinary-normal-game.png)，[第一斜角](../evidence/native-v11/checkpoint-45-development-adoption/oblique-0-comparison.png)／[第二斜角](../evidence/native-v11/checkpoint-45-development-adoption/oblique-1-comparison.png)。真正WebGL像素，只裁切／等比縮放／標籤，沒有重繪或概念替代；自然員工相位不同。唯一原圖仍`Approved_Visual_Target_Misaki.png`，SHA256 `9f855d2ecfd120bb45c001db3fa9b5a3e3b58b2b3c2a4cf9e7ebfda84f8f7114`。部分headless raster的HUD遺漏與DOM無Zen class證據如實保留，不稱完整UI驗收或貼回假HUD。

普通build277清除caller的`VITE_V11_SCENE_WINDOW`後執行，Vite預設`contact`；明確`contact` build278的全部195runtime檔與277逐byte相同。[新採用receipt](../assets/authoring/native-v11/scene-contact-c45-adoption.json)保留C44原配方及C40背景採用receipt的原hash。新增獨立採用層，只改default mapping、採用metadata／說明；C44原配方本身不改，actual AO及light的光學數值逐值對上已審資料，只有`defaultAdopted`等採用狀態更新。明確`control`仍可供診斷，ordinary High／Low／Auto原有品質政策保留，Low仍不掛新增AO pass。

無flag實際頁面的High AO是`.20`、defaultAdopted=true，背景live PBR／C36桌面配置對上已審資料；正常camera pose、兩次真pointer orbit pose及經濟欄位對上C44。**接觸半徑門檻保持鎖定，不聲稱C45有新的美術增益。** 317個模型／貼圖／反射原始與交付檔逐byte同C44；已通過的`table-contact-v11.ts` RTT修正hash也完全相同。17styling群／14036tri／155固定項、camera／rig／routes／catalog／經濟／存檔保持。

282tests／tsc／build／五語174keys validate／replay／asset-check通過；146GLB零error／warning、305保護檔、509資產重建一致，兩組195runtime由application重建一致。新測試鎖定C44數值及Vite no-flag→contact／explicit-control保留；不是從設定檔推論畫面，亦有上述實際頁面與素材下載hash核對。

[庫存／會計／quality完整核對](../evidence/native-v11/checkpoint-45-development-adoption/stock-shadow-proof.json)：fresh隔離Sandbox真UI invalid0、003買入／005鍵盤買入原稿、上架、0→3→8→reload8→一小時2→再一小時0→soldoutreload0通過。raw現金5000→4565→3840→3840→5490→6000→6000，sales1710／570、COGS870／290、每次現金營運費60、eventSequence增加18／6，無動畫入帳或成本重扣。四Low／High的核心存檔不變、High新epoch、0與reload0產品caster／draw空，實拍無杯群遮蔽殘留；fresh隔離Normal baseline不變，0pageerror。

新增實際1280×900案例：[Low](../evidence/native-v11/checkpoint-45-development-adoption/lowrm277/low-motion-normal-game.png)、[Low＋Reduce Motion](../evidence/native-v11/checkpoint-45-development-adoption/lowrm277/low-reduced-normal-game.png)、[High＋Reduce Motion](../evidence/native-v11/checkpoint-45-development-adoption/lowrm277/high-reduced-normal-game.png)。三例真UI各買入／上架8件notebook、mug、tea，五個實際下載圖頁／192反射SHA與來源相符，live背景PBR不變。Low無新增AO／geometry renderer，High＋RM保留`.20` AO；Reduce Motion=true、staff routine x/z跨實際Raf不變、active props為0。店名沿用QA「隔離Low檢查」標籤，不代表High案例的實際quality；原始diagnostics明確為High。這是偏好／形體／材質檢查，不是新完整B交易或連續動作認證。

首輪QA漏傳C44 expected ID，shared waiter仍等C43而120秒逾時，未計PASS；dependent stock／LowRM未開始。[失敗紀錄](../evidence/native-v11/checkpoint-45-development-adoption/failed-id-qa/README.txt)保留。以正確C44 ID在fresh隔離context重跑，沒有改runtime、放寬數值或碰玩家Normal。

[普通pointer原片61.400秒](../evidence/native-v11/checkpoint-45-development-adoption/ordinary-motion/gameplay-uncut.webm)僅31來源幀，中位1.92秒／最大4.09秒間隔；[庫存／quality原片317.400秒](../evidence/native-v11/checkpoint-45-development-adoption/stock277/gameplay-uncut.webm)僅188來源幀，中位1.81秒／最大9.45秒。Chromium154／ANGLE SwiftShader、public CDP＋已安裝ffmpeg，未剪切／加速，**稀疏軟件片不作連續動作、completed GPU frame或實體FPS認證**。CPU graph Low無buffer／High恢復、同render caster/draw與NullEngine測試亦不能認證supported WebGL GPU資源完成釋放。無新完整B接袋、closure／hidden-tab、五語窄屏、physicalGPU/audio/native驗收；無Native port主張。

下一全景優先建議是**窗側亮區→中央過渡→暖收銀焦點的連續受光主次，以及過重灰屋面／室外值層次**。實際普通圖仍比原圖均勻、材質轉面與室內外氣氛不足；應保持已過`.20`及模型／材質，不再靠AO製造方向光。這只是根據原圖與本輪正常像素提出下一slice，**尚未實作**。原圖重建目標繼續，C45採用checkpoint待獨立覆核；無使用者動作阻塞，無merge／Site／玩家Chrome或Normal／Unity／其他項目／Library或LTC重試／關機操作。
