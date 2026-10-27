# C47：固定距離的窗光方向控制，未採用

**C46獨立方向門檻FAIL；C47幾何覆蓋變廣，但正常畫面的全店明暗／葉影仍不足，自我檢查未把方向假設判為視覺通過。C45仍是普通開發預設，公開V17本輪未改；沒有merge／發佈。**

應用`56a213c65f2725be0e10dbd1bbee16c0c083224d`，仍在[Draft PR8](https://github.com/wizardkeith/KeEv-games/pull/8)。原圖是[Approved_Visual_Target_Misaki.png](codex-v4/reference/Approved_Visual_Target_Misaki.png)，SHA256 `9f855d2ecfd120bb45c001db3fa9b5a3e3b58b2b3c2a4cf9e7ebfda84f8f7114`，本輪再次實際看圖。

## 實際比較

- [原圖／同來源C46／C47，正常480px店高](../evidence/native-v11/checkpoint-47-window-reach/target-control-reach-normal480.png)
- [C46全頁](../evidence/native-v11/checkpoint-47-window-reach/daylight-normal-game.png) → [C47全頁](../evidence/native-v11/checkpoint-47-window-reach/reach-normal-game.png)
- [斜角一](../evidence/native-v11/checkpoint-47-window-reach/oblique-0-comparison.png)、[斜角二](../evidence/native-v11/checkpoint-47-window-reach/oblique-1-comparison.png)

全部是普通遊玩camera的實際WebGL；對照只裁切／縮放／標字，沒有重畫、噪點遮罩、生成場景或studio替代。固定camera、pointer斜角、8件庫存及經濟相同；員工自然姿態不同。C46控制是本應用重編294的新實拍，沒有挪用舊source圖片冒稱本次驗證。

光區不再只集中近窗，中央桌與通道／收銀附近地板開始參與，但正常縮圖仍偏平、窗框條帶仍規整，沒有形成原圖的豐富柔和葉影與全店明暗主次。這是**方向假設的有限效果，尚不足視覺門檻**，不是整體原圖接受，也不把技術檢查算美術PASS。

## 唯一光學改動

C46 source `[-80,52,-15]`改為C47 `[-92.23796930319992,28.170390790959974,7.021437544255994]`，target仍`[-4.47,1.84,0]`，兩者距離同為91.90106909062592m。先測slope `.30`／z比`−.22`（292），最後只把z比修至`−.08`（293／296）；最終軸向為`[1,−.30,−.08]`正規化。光量110000、angle `.07`、range／near-far、半球底光`.85`、softness `.16`、AO `.20`、曝光、192反射、模型／材質全部保留。沒有調亮度或加入光斑貼圖；程序窗洞只隨新方向重投影，範圍及軟邊不變。

新`reach`只是explicit authoring旗標；原`daylight`保留C46，no-flag仍`contact`。新[收據](../assets/authoring/native-v11/scene-window-reach-c47.json)及測試逐欄比較C46，除position及非光學id/mode/說明外不得改值；固定窗中心距離避免把近距離衰減改變混成方向效果。

## 幾何證據與失敗邊界

[探針與程式](../evidence/native-v11/checkpoint-47-window-reach/ray-probe.json)使用既有近葉片1328三角形、實際world座標及Möller射線相交；不是GPU shadow取樣。C46中央桌／通道／收銀地板的反向光線都越過窗洞上緣；C47三處均在洞內。

|固定中央地板475點|窗內可達|近葉片相交|
|---|---:|---:|
|C46|166|0|
|C47首控制292|366|18|
|C47固定293|437|32|

[有限方位格](../evidence/native-v11/checkpoint-47-window-reach/direction-grid.json)只試三個slope及五個方位，沒有宣稱找到全域最優。近葉片本來已在source／caster中，這次也沒有補加葉片。可達區擴展不等於自然葉影已可讀：只有部分靜態取樣被葉片遮擋，降低角度亦降低水平面直射法線分量。這可解釋為何擴大投影不保證更強層次；不是已證明引擎、缺少caster、材質clip或多邊形上限有錯。正常／斜角的實際不足保留，不能用幾何數字取代畫面。

## 來源與回歸

288tests／tsc-build／validate／replay／asset-check通過；146GLB零錯警告、305保護檔、五作者輸出重建前後511檔相同。317原模型／貼圖／反射bytes與C46相同，既有environment geometry／presentation及全部舊renderer extension值相同，只新增C47作者設定。舊C46來源收據固定對原應用875d433驗證，不改寫歷史收據；首次輔助測試讀取原PNG超出git預設buffer後，改以本地原檔嚴格SHA驗證該鎖，8項聚焦及288項全測重跑通過，未放寬值或行為比較。

293實拍候選與推送應用296全部195runtime byte同。294 C46與295普通重新編譯的JS chunk hash有變，沒有宣稱與舊C46/C45 payload相同；兩者以新來源實際頁面驗證選擇及光學值。[來源／runtime／覆蓋限制](../evidence/native-v11/checkpoint-47-window-reach/source-identity.json)。

七個真UI stock／會計階段及四次品質切換PASS：[完整proof](../evidence/native-v11/checkpoint-47-window-reach/stock-accounting-quality-proof.json)、[8件](../evidence/native-v11/checkpoint-47-window-reach/stock293/02-eight.png)、[真實18件／+¥8,400結算毛利](../evidence/native-v11/checkpoint-47-window-reach/stock293/04-hour1-stock2.png)、[售罄後重載](../evidence/native-v11/checkpoint-47-window-reach/stock293/05-soldout-reload.png)。

|階段|每SKU件數|現金raw|
|---|---:|---:|
|空架|0|5000|
|買3及上架|3|4565|
|鍵盤買005|8|3840|
|8件重載|8|3840|
|首小時結算|2|5490|
|次小時結算|0|6000|
|售罄重載|0|6000|

表列是save原始數值，UI日圓為其10倍。收入／現金費用、bookCost／COGS、units／eventSequence逐項對帳；成本沒有再付一次。新stock UID取代舊8件、售罄caster/draw為空；同render-ID RTT集合及512/1024重建一致。這是draw派送與CPU資料，沒有GPU fence或supported-WebGL資源釋放認證。實拍售罄中央桌保留固定花器／書／布，所見沒有明顯杯影殘留，不代表所有狀態／視角驗證。

Low、Low+ReduceMotion、High+ReduceMotion三個fresh個案真UI買8及上架三SKU，五素材SHA與live材質／AO狀態、Reduced staff位置固定／props0均PASS：[圖片及raw結果](../evidence/native-v11/checkpoint-47-window-reach/lowrm293/)。帶touch能力的cloud context，未冒稱實體觸控裝置。

[庫存原片](../evidence/native-v11/checkpoint-47-window-reach/stock293/gameplay-uncut.webm)：303.560秒、183來源幀，中位間距1.87秒／最大7.48秒。18件／+¥8,400是**本次批次結算毛利**，尚未扣工資租金，不是單一顧客盈利。本輪未把這段稀疏片或浮字等同完整收銀接觸／handoff／退出連續動作驗收。所有個案0pageerror，fresh隔離Normal基線不變。

[C46 pointer原片](../evidence/native-v11/checkpoint-47-window-reach/daylight-motion/gameplay-uncut.webm)65.240秒／33來源幀，[C47 pointer原片](../evidence/native-v11/checkpoint-47-window-reach/reach-motion/gameplay-uncut.webm)56.160秒／28幀；間距見source-identity。

稀疏CDP原片保留所有收到的來源幀；不是連續動作、GPU fence、完成GPU畫格、supported-WebGL GPU資源釋放、實體GPU/FPS/audio/native認證。沒有新完整B／handoff／closure-hidden-tab／五語窄UI認證。只用fresh隔離Sandbox，Normal基線不變；沒有操作玩家Normal、Chrome、Unity、Library／LTC重試或關機。

下一步由獨立看圖判斷此方向控制是否足夠；若仍不過，方向投影已擴大而正常層次仍弱，應重新診斷直接光與既定底光／材質轉面的可見對比，而不是再加微細葉片、AO或隨機光斑。原圖重建目標仍持續，沒有使用者動作阻塞。
