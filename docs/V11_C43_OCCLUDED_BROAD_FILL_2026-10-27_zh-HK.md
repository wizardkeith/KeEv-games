# V11 C43：有遮蔽的廣域光候選，未採用

Application `4df471263d6bb5c2aaf6d0591f66f5240a875d94`，[Draft PR8](https://github.com/wizardkeith/KeEv-games/pull/8)。父任務轉達C42獨立視覺FAIL、RTT生命週期修正PASS，後者保留。**普通光照仍C40；C41／C42視覺試樣OFF，C43也未採用。整體原圖品質與風格仍未接受，沒有merge或Site發佈，本輪未改公開V17。**

## 固定正常畫面與三處介面

[唯一原圖／普通C40／拒用C42／C43，正常店高480px](../evidence/native-v11/checkpoint-43-occluded-fill/target-controls-occluded-normal480.png)；[未裁剪實際C43正常遊戲](../evidence/native-v11/checkpoint-43-occluded-fill/occluded-normal-game.png)；[層架—後牆、中央桌—地板、前櫃—地板三處對照](../evidence/native-v11/checkpoint-43-occluded-fill/three-interfaces-flat-vs-occluded.png)；[第一斜角](../evidence/native-v11/checkpoint-43-occluded-fill/oblique-0-comparison.png)／[第二斜角](../evidence/native-v11/checkpoint-43-occluded-fill/oblique-1-comparison.png)。唯一原圖仍`Approved_Visual_Target_Misaki.png`，SHA256 `9f855d2ecfd120bb45c001db3fa9b5a3e3b58b2b3c2a4cf9e7ebfda84f8f7114`。矩陣只裁切／等比縮放／加標籤，沒有重繪、假HUD、概念圖或替代背景。

270（occluded）、271（C42 balanced）、272（C40 control）從同一application建立；三組原始正常camera pose、兩次真pointer orbit pose及匯入後核心經濟逐值相同。自然員工相位不同，不把人物差異當成光源改善。部分headless raster遺漏HUD，原DOM證明body／html無Zen class、HUD可見；沒有把遺漏圖稱為完整UI驗收或貼回假HUD。

親自看正常480px、原始全景與雙斜角：C43較C42增加層架背部／牆角軟遮蔽，桌腳、櫃底與地板有較連續接地層次，未再把整個入口及後牆壓暗。**但這只支持方法有可見效果，未構成視覺PASS；全景仍偏平、窗側至收銀的受光方向與材質轉面不及原圖，灰屋面仍過重。** 不以局部AO或279tests代替原圖品質接受，不擴散或改成預設。請以完整正常畫面及三處介面判斷是否值得保留，再決定下一個切片。

## 一個受控方法及兩個拒用試樣

`VITE_V11_SCENE_WINDOW=occluded npm run build`才啟用。所有C42光量參數、曝光1、geometry、材質、C36桌／C38形體／C39值、192反射及camera／rig／routes／經濟與存檔保持。沒有再切回強spot、提升曝光或增加花／葉。新方法為已安裝Babylon8.32.0 SSAO2：實際720×600深度／view-normal MRT，半徑.70m、16samples、強度1、base.12、雙向8sample blur、.5 blur ratio，與現有3D光／接觸陰影共用場景。Low會移除新增pipeline及geometry buffer，High重新建立；無新增timer、會計事件或存檔欄位。

SSAO是**螢幕空間近似**，不是完整GI或真正只作用於間接光。內建combine會乘上最終場景色，亦影響direct／specular；隱藏幾何、畫面邊緣、透明表面均有限制，斜角與實際材質必須看圖評估。新增MRT及五個post-process有實際shader／記憶體／繪製成本，沒有聲稱效能免費或實體FPS達標。深度來自當前真實物件，沒有固定庫存影、screen-fixed貼圖或拍照專用替代場景。[原創整合來源／可重建receipt](../assets/authoring/native-v11/scene-occlusion-c43.json)包含精確Babylon／shader來源雜湊，並非已完成native port。

[268／269拒用圖片及來源](../evidence/native-v11/checkpoint-43-occluded-fill/rejected/README.txt)保留：268相機pose本來相同，但combine重套UI-safe viewport造成raster取樣錯位；269只修buffer／combine座標後投影恢復，入口玻璃仍黑。已安裝GeometryBufferRenderer預設`renderTransparentMeshes=true`，半透明面寫入深度法線造成不合理遮蔽。270只用opaque／alpha-test occluder，玻璃本身材質不改；實拍正常、雙斜角及High重建後黑塊消失。沒有用更強AO遮掩錯誤、改相機或藉口歸咎引擎。停止的LTC403及Library路線未重試。

## 實測、來源及限制

279 tests通過（新增不支援SSAO renderer的無buffer／無相機變更fallback，以及光量控制／shader來源鎖定；保留真ShadowGenerator resize回歸），tsc／三組build、五語174keys validate、replay、asset-check通過。146GLB零error／warning、305保護檔、507資產重建逐byte一致；三組runtime由application重建一致：270為195檔、271／272各182檔。普通build沒有加入AO runtime pass，17styling群／14036tri／155固定項及已過圖頁、模型／192反射保留。

[七個stock階段與四個quality階段的原始核對](../evidence/native-v11/checkpoint-43-occluded-fill/stock-shadow-proof.json)：fresh隔離Sandbox真UI invalid0／buy003+005／鍵盤005原稿／上架、0→3→8→reload8→一小時2→再一小時0→soldoutreload0通過。七會計快照raw現金5000→4565→3840→3840→5490→6000→6000；兩次sales1710／570、COGS870／290、每次人工租金營運合計60、eventSequence增加18／6，沒有重扣成本或動畫入帳。兩組Low／High前後完整core相同，Low無AO／buffer，High新epoch及720×600 buffer恢復；接觸RTT的refresh0／新observer修正保留。8→2新stock UID替換，0及reload0商品source／target／draw均空；實拍售罄圖沒有原杯群或遮蔽殘留，固定花器／書／布仍在。0pageerror，fresh隔離Normal baseline不變。

shadow RTT的同render ID caster／draw紀錄仍只證明**CPU端WebGL dispatch及callback**；不是GPU fence、逐幀無鬼影或completed GPU frame。照片是後續browser擷取，沒有聲稱與某個logged RTT畫格pixel-identical。未新增完整A/B接袋、closure／hidden-tab、五語窄屏／ReduceMotion、實體GPU/FPS/audio/native驗收。

- [C43真pointer原片73.080秒](../evidence/native-v11/checkpoint-43-occluded-fill/occluded-motion/gameplay-uncut.webm)：31來源幀，中位約1.99秒／最大5.26秒間隔。
- C42控制片70.120秒／27幀，中位2.48秒／最大7.84秒；C40控制片70.480秒／29幀，中位2.33秒／最大4.88秒。
- [真UI庫存／畫質原片300.720秒](../evidence/native-v11/checkpoint-43-occluded-fill/stock270/gameplay-uncut.webm)：184來源幀，中位約1.84秒／最大7.57秒。

以上皆public CDP＋已安裝ffmpeg、Chromium154／ANGLE SwiftShader軟件擷取，未剪切／加速，**仍是稀疏來源幀，不能當連續動作／平滑或實體GPU認證**。前輪C42的665.160秒片只有184來源幀、中位約3.94秒／最大17.61秒，也不重新包裝成motion PASS。來源、cadence、media SHA見`source-identity.json`與`media-sha256.json`。無使用者動作／權限阻塞；功能未合併，等待固定候選獨立視覺覆核。無Site／玩家Chrome或Normal／Unity／其他項目／關機操作，原圖重建目標仍繼續。
