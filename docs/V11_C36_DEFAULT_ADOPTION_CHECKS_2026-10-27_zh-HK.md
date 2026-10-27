# C36：C35開發預設採用已實作，ready 被瓶口枝幹阻塞

**不是ready候選：258 tests中257 PASS／1 FAIL。** C35窄幅材質／已過灰模維持；本次將它設為V11開發預設並完成下列實際流程，但原鎖定C33枝幹穿過瓶口，保留失敗斷言，沒有擅改模型或放寬測試。整體原圖仍未接受，公開V17／main runtime未變。

Application：`56fd873f2c5d6d28708c783c3f42fa5838d9446b`；**普通無旗標**build231。[預設182檔從此source重建逐byte相同](../evidence/native-v11/checkpoint-36/default-runtime-parity.json)。Web及Node可重建配方均預設C35；舊authoring control/base及灰模診斷仍可明確選用，不是新增玩家設定。

## 唯一未解阻塞：保留的C33兩側主枝

[唯讀截面probe](../evidence/native-v11/checkpoint-36/neck-probe.json)使用實際花器頂部高度Y=`0.3707999885m`，實際rim半徑約`0.07157–0.07243m`，而C33根枝part11／22截面最外點為`0.09282／0.10358m`。C27相同中心／旋轉與1.1倍scale下，最外點比**最寬的實際瓶口外緣**仍超出約 **22.43／34.26mm**。因此不是原`<.069m`開口斷言過嚴，沒有調大上限掩蓋。

可重現：`python tools/v11-neck-cross-section-probe.py --output /tmp/neck.json`；[失敗測試](../evidence/native-v11/checkpoint-36/neck-and-fringe.log)。C33原JSON hash仍`fa8736d8dc37a7d78cc66ad893d9ffb7cde28d7dde712cfa9bfca99e763b5c06`，花／布／C35圖頁、C27構圖與192反射均未改。先前通過的是窄幅灰模／材質門檻，不包含此處隱藏接合。

本輪父任務明確要求鎖定C33 flower geometry，所以**未改part11/22、未雕花冠或改瓶口**。待限定根部修正範圍後，建議僅將兩條下段主枝的分叉收在瓶口內、分叉點提至瓶口上方，保留原根點、上端節點、所有花面／外框／三簇及17群；例如Y約.395m／半徑約.055m可作重建起點，必須重新以原開口斷言量度，不宣稱方案已通過。狀態為**待幾何修正**，不是權限拒絕或不確定外部寫入。

## 已完成的source-specific採用證據

- [普通預設實際正常全景](../evidence/native-v11/checkpoint-36/flow231/01b-normal-game.png)、[實際同桌局部](../evidence/native-v11/checkpoint-36/actual-default-table-crop.png)、[原圖左店景與實際預設](../evidence/native-v11/checkpoint-36/original-target-and-default-game.png)。全為實際WebGL；只有裁切／縮放，沒有concept／studio替代。
- [Low與Reduce Motion](../evidence/native-v11/checkpoint-36/low231/results.json)：兩個fresh隔離Sandbox均真買8件／3款並上架，現金與持貨核對、普通default mode=`values`，瀏覽器實際下載的flower／linen PNG SHA分別為已接受C35的`8b737b…cc74`／`956b76…3563`。Low正常及Reduce Motion均有全景／局部圖；Reduce Motion跨實際兩幀根位置不變、activeProps0，0pageerror、fresh Normal不變。不是Low整條顧客生命週期或physical GPU驗收。
- [真實庫存0／3／8／2／售罄0／reload](../evidence/native-v11/checkpoint-36/stock231/results.json)，無匯入／注入庫存。invalid0 Enter不寫core，keyboard005買入後保留原稿。每次買入按實際cost核對cash及stock，placement不收款；兩次UI小時各只提交一次，cogs與bookCost減少、報告units與eventSequence、現金收支逐項核對。初始與售罄0／reload時中央杯caster均無，靜態影圖只在變更後刷新，兩實際幀穩定。
- [初始0與售罄reload0實際table對照](../evidence/native-v11/checkpoint-36/empty-versus-soldout-table.png)：沒有可見固定杯影殘留，固定花器／書／布保留；不是所有視角毫米級認證。

| 每款stock | cash（內部經濟單位） | purchases | eventSequence |
|---|---:|---:|---:|
| 初始0 | 5000 | 0 | 0 |
| 買入／上架3 | 4565 | 435 | 0 |
| 加5至8／reload8 | 3840 | 1160 | 0 |
| 第1個真UI小時，剩2 | 5490 | 1160 | 18 |
| 第2小時售罄0／reload0 | 6000 | 1160 | 24 |

最初庫存harness被我新增的**錯誤QA驗算**中斷：用report net780當cash delta，實際cash delta1650。存貨成本870早已在買入支付，計入P&L COGS時不再付現金。更正QA為sales−salary−rent−operating，另驗bookCost→COGS，並以全新fresh Sandbox完整重跑；遊戲`src/core`沒有改。[原失敗harness log](../evidence/native-v11/checkpoint-36/stock231.log)不當成遊戲缺陷或通過證據。

## High真實結算／交接／離店

[464.680秒未剪原片](../evidence/native-v11/checkpoint-36/flow231/gameplay-uncut.webm)、176個CDP幀時序的[provenance](../evidence/native-v11/checkpoint-36/flow231/recording-provenance.json)、[逐事件記錄](../evidence/native-v11/checkpoint-36/flow231/timeline.json)／[結果](../evidence/native-v11/checkpoint-36/flow231/results.json)。實際UI買8／上架→招呼→一次UI小時結算→visitor-a領取同revision9袋→staff home269.51s→顧客離店／袋清除349.329s→reload真3D及save逐值相同。Low及High各自fresh Normal均未變。

[實際交接圖](../evidence/native-v11/checkpoint-36/flow231/03-cashier-contact-in-game.png)、[原CDP約268.93秒幀](../evidence/native-v11/checkpoint-36/flow231/actual-margin-pixels-268.93s.jpg)可讀 **18件／+¥8,400／未扣人工租金**。[事件與接袋對應](../evidence/native-v11/checkpoint-36/flow-event-proof.json)為實際已售revenue1710−COGS870=毛利840（顯示×10），不是net或虛構單客收入。原`04-actual-margin-in-game.png`截圖較晚、沒有浮字，明確不以它作pixel證明；沒有因取樣差異改遊戲邏輯。

片段為雲端SwiftShader、稀疏CDP，不是實體GPU/FPS、逐幀平滑／手接觸毫米級／audio/native認證；未把整段稱為人工逐幀看完。完整原始JPG留在本executor QA，repo交付未剪影片、全部時序與關鍵原幀。

## 測試、重建及邊界

- [258項結果](../evidence/native-v11/checkpoint-36/tests.log)：257 PASS、上述瓶口1 FAIL。C29的120小花／三褶歷史斷言改為明確讀取**保留C29母檔**，沒有刪掉；新預設直接核對C35的15閉合主花面、兩主褶母檔／atlas與17群。24條流蘇在已降低的新hem下Y=.52m量度，仍要求24，瓶口閾值原樣保留。
- tsc/build／validate五語174keys／replay／asset-check通過；146GLB零錯警告、305保護檔，15776style+canopy tri／17群及4448底點／541布接觸通過。不是把GLB規格通過當實體接合通過。
- 預設Node配方已重建native環境／fixtures，C35原母檔和前版歷史保留；四個exporter再次重建[483個tracked assets/public檔逐byte不變](../evidence/native-v11/checkpoint-36/asset-rebuild-parity.json)。這是可重建來源，不是native裝置release。
- main只更新文件指標；功能仍Draft PR8，**不ready／未合併／未發佈**。無公開Site／audience／identity變更，無Library或LTC重試／使用者Chrome或Normal／本地Unity／關機。

尚未進下一whole-scene實作，避免繞過未解採用門檻。從本次真實正常圖與原圖的初步觀察，後牆長條等距陳列、大片棕色中間調與灰綠室外層次仍比已通過中央桌更拉開整體距離；等根部及採用門檻處理後，應以這個全景層級定下一個coherent slice，而不是再磨已過的白花／布色面。沒有宣稱全圖品質接受。
