# V11 C30：同桌漫反射方法比較，視覺門檻未通過

Application **`0f082eae3ce8753ea216fee743cd4c15832c0dfa`**，同一 Draft PR8；沒有合併或發佈。原圖仍未達標，這是拒用光照試驗的可覆核檢查點，**不是完成美術更新或發佈候選**。C27構圖、201全部幾何／法線、192反射及普通預設效果保留。

## 真實遊戲結果

[原圖／201／202同店鋪高度比較](../evidence/native-v11/checkpoint-30/original-baseline-rejected-normal-equal-shop-height.png)；[四組正常相機同桌對照](../evidence/native-v11/checkpoint-30/fixed203-neutral/controlled-four-way-central.png)。原圖是既有PNG左店鋪，原始鏡頭／曝光未知；遊戲組均同1440×1200相機、同一份普通UI匯入的8庫存Sandbox。人物仍自然活動，位置不同，不冒充同姿勢人物比較。全圖與裁切都是實際可操作WebGL，沒有概念圖／離線渲染代替遊戲。

|方法|實際結果與決定|
|---|---|
|[Cycles原頂點DIFFUSE直接／間接分離](../evidence/native-v11/checkpoint-30/rejected-cycles/transport-normal-game.png)|表面交界採樣出現碎暗點、桌面偏暗，**拒用**。此為DEV探索，未冒充固定202。|
|[確定性CPU BVH ray180](../evidence/native-v11/checkpoint-30/ray180-exploratory/transport-normal-game.png)|2mm法線偏移、16寬太陽／16窗面／32餘弦半球一次漫反彈，消除明顯碎暗點；花布仍未形成原圖柔亮大形，**未通過**。DEV探索，未做新流程認證。|
|[固定build202寬窗1400](../evidence/native-v11/checkpoint-30/fixed202-window-rejected/transport-normal-game.png)|只重校準同方法窗光／太陽／天空，沒有全局曝光／AO增強；杯布變亮但花冠仍是小點、花器層次變弱，**拒用**。|
|[固定build203中性漫反射](../evidence/native-v11/checkpoint-30/fixed203-neutral/transport-normal-game.png)|相同幾何／反射／UV，以0.8常量乘本色代替漫射，只作形體／受光隔離。仍見分散小點及平布，**不是美術方案**。|

這些對照支持「繼續加光或AO不能單獨解決這一門檻」，不證明引擎／面數預算不夠，也未建立唯一根因。下一步需要獨立覆核原圖與中性對照中的投影、材質及光形差距，再選擇能改變正常畫面讀法的生產方法；本輪沒有擅自解鎖幾何或移動已接受構圖，也沒有把小幅差異稱為目標風格提升。

## 方法、重建及身份

新增PBR MaterialPlugin僅替換漫反射，保留原albedo/UV、192鏡面與clearcoat；不是發光貼圖或場景圖片。每個接收mesh核對原位置／法線指紋及頂點數，固定範圍外權重0。CPU光照不含人物／owned stock／門／FX作固定遮擋或反彈，**動態陰影遮罩、其他SKU／數量及Low診斷尚未整合**；所以不適合啟用或發佈。無新增幾何、面數／燈數／陰影圖或普通渲染通道；診斷額外GPU屬性未作效能驗收。

[可重用gzip光場母檔／來源與SHA](../assets/masters/native-v11/c30-irradiance/provenance.json)及同目錄原始actual-scene-input.json.gz只含隔離QA的scene幾何／材質／相機，不含帳戶、憑證或玩家存檔。提供Cycles與確定性BVH工具；後者是獨立光度校準的一次反彈近似，反彈使用材質平均本色，未假稱完整路徑追蹤。保留原母檔。192反射SHA256仍`ab2ddab4e6f5b7e64370f7ba2fb63497326a4f19b669a5ccb459cfef8e2f3258`，構圖SHA256仍`f3bafaca37ee5b4c0050929b2b772baf01368cf1f53dd4a4a28dd8f91ce745e9`。

普通build178檔，**沒有診斷光場**；只有明確authoring命令暫放所選光場，成功build後複製到新的immutable目錄，再移除自己建立的暫存檔，拒絕覆寫既有輸出。重建例：

```sh
python tools/build-v11-irradiance-diagnostic.py window1400-rejected /tmp/new-c30-diagnostic
```

202的180runtime檔與相同source重新build205逐byte一致（builder額外AUTHORING標籤另計），[parity](../evidence/native-v11/checkpoint-30/checks/c30-reproduction-parity.json)。固定202／203瀏覽器結果包含實際fetch光場SHA256、校準、已套用接收mesh；[202](../evidence/native-v11/checkpoint-30/fixed202-window-rejected/results.json)／[203](../evidence/native-v11/checkpoint-30/fixed203-neutral/results.json)。兩者均完成普通匯入、[202重載真3D](../evidence/native-v11/checkpoint-30/fixed202-window-rejected/actual-post-reload-normal-game.png)／[203重載真3D](../evidence/native-v11/checkpoint-30/fixed203-neutral/actual-post-reload-normal-game.png)、存檔逐值相同、隔離Normal不變、0pageerror。未將203作者標籤檔計入runtime parity。

初次DEV依賴預編譯重新整理使UI等候timeout；另一張在加身份記錄後的HMR重新整理期間只截到載入頁，均**排除為無效證據**。固定生產build＋光場SHA＋兩實際渲染幀檢查解決證據身份問題；沒有將失敗改成通過。

## 已完成檢查與限制

同source247tests全過、build／五語174keys validate／replay／asset-check、146GLB零錯警告、305保護檔及相機演算法不變。[原始紀錄](../evidence/native-v11/checkpoint-30/checks/)。首輪tests發現world.ts來源manifest未更新，依正常exporter重建三角色manifest後重跑通過，三GLB仍零錯警告；測試未放寬。原模型、產品、UI、五語、economy/save/rig檔沒有改動；沒有把本輪叫作447資產全量重建或新的五語Low／完整High交易認證。

固定204為**原預設效果保留**的[116.760秒未剪實際買入／orbit／reload錄影](../evidence/native-v11/checkpoint-30/default204-buy-reload/gameplay-uncut.webm)，[原始結果](../evidence/native-v11/checkpoint-30/default204-buy-reload/results.json)：pointer兩角度／面板與同Shop視角保留orbit，真買1杯cost70、cash3840→3770／stock8→9，逐值reload及實際3D、0pageerror／隔離Normal不變。tableIrradiance=null，**不是202光場交易驗收**。201既有502.920秒A／Low五語／售罄循環仍只屬201；不冒作新診斷通過。雲端SwiftShader不是實體GPU/FPS／完整動作平滑／audio/native驗收。

原圖及同桌柔亮門檻保持FAIL；沒有使用者動作阻塞，動態遮影／庫存／Low支援是未完成的診斷限制，不是拒權。LTC403仍停止，沒有Library重試、發佈包、merge／Site save/deploy、使用者Chrome／Normal、Unity或關機。
