# V11 C46：方向窗光開發候選，未採用

**C45仍是普通開發預設；公開V17未改。C46只是待獨立看圖的`daylight`候選，整體原圖品質／風格仍未達標。沒有merge或發佈。**

應用來源：`875d43351bc0644ef0411d0a7a61ae5d0b7e9343`，同一[Draft PR8](https://github.com/wizardkeith/KeEv-games/pull/8)。唯一原圖仍是[Approved_Visual_Target_Misaki.png](codex-v4/reference/Approved_Visual_Target_Misaki.png)，SHA256 `9f855d2ecfd120bb45c001db3fa9b5a3e3b58b2b3c2a4cf9e7ebfda84f8f7114`。原圖左邊店景作主要比較，右邊人物稿不是實際遊玩證據。

## 實際畫面與判斷

- [原圖／普通C45／C46，同480px店高](../evidence/native-v11/checkpoint-46-window-direction/target-control-candidate-normal480.png)
- [C45正常全頁](../evidence/native-v11/checkpoint-46-window-direction/contact-normal-game.png) → [C46正常全頁](../evidence/native-v11/checkpoint-46-window-direction/daylight-normal-game.png)
- [斜角一](../evidence/native-v11/checkpoint-46-window-direction/oblique-0-comparison.png)、[斜角二](../evidence/native-v11/checkpoint-46-window-direction/oblique-1-comparison.png)
- [窗側桌面／地板](../evidence/native-v11/checkpoint-46-window-direction/window-floor-comparison.png)、[中央桌](../evidence/native-v11/checkpoint-46-window-direction/central-table-comparison.png)、[櫃台／地板](../evidence/native-v11/checkpoint-46-window-direction/cashier-floor-comparison.png)

以上是1440×1200實際普通遊玩WebGL截圖；比較圖只裁切、縮放和標字，沒有重畫、生成替身、Zen／studio替代。兩組正常鏡頭、兩次真pointer斜角及庫存／現金相同；員工自然動作階段不同。

**實際全景有可見但有限的改善**：窗側桌面與地板出現方向一致的亮區，入口與收銀保留底光，沒有改曝光把全店洗白。斜角仍可見該亮區跟隨3D場景。可是亮帶仍規整、面積有限，大片米棕中間調、重灰屋面及材質豐富度與原圖有明顯距離，不能把這個控制當成整店受光已達標。窄視覺門檻交獨立判斷；C46未採為普通預設。

## 方法與控制

先測平行光2／5／12、關閉陰影以及12配低底光；實際畫面仍偏均勻或單純變亮／變暗，沒有通過。接收面shader有真實`DIRLIGHT`／`SHADOWPCSS`旗標，RTT範圍涵蓋店內；沒有證據可把問題歸咎於燈數、引擎或多邊形預算。這些[失敗控制](../evidence/native-v11/checkpoint-46-window-direction/rejected-controls/)保留並明確排除於最終驗證。

最終換成遠距窄角窗光：世界位置`[-80,52,-15]`朝實際窗洞`[-4.47,1.84,0]`，角度`.07rad`、candela強度110000、range150m、shadow70–150m；原有128px程序窗洞遮罩限制開頂剖面的入光，沒有新增遮擋模型或螢幕貼圖。遠距減少近點光的距離衰減差，並較接近平行方向；不是校準過的實體照度／封閉室內GI。此方法同時改變方向、範圍和窗洞限制，沒有把改善歸因於某一個參數。

最終288把新key的陰影軟度恢復C45的`.16`；沒有宣稱它相對285的`.025`單獨帶來重大視覺提升。保留C45半球底光`.85`、曝光1、contrast1.06、局部AO `.20`及192反射；key陰影darkness `.12`、暖色`#FFF0D3`及強度／方向是本次候選的一部分。舊C45key數值與普通選擇不變。

可重建：`VITE_V11_SCENE_WINDOW=daylight npm run build`；普通`npm run build`仍選`contact`。`VITE_V11_DAYLIGHT_SHADOW=off`只屬失敗診斷，不是候選。完整[原生作者收據](../assets/authoring/native-v11/scene-daylight-c46.json)與引擎中立master保留方法／來源；它們不是native驗收。

## 來源與檢查

- 最終應用build290的195個runtime檔與實拍288逐byte相同；普通應用build291的195檔與控制286相同，286與289亦相同。[比對](../evidence/native-v11/checkpoint-46-window-direction/runtime-parity.json)／[全部payload SHA](../evidence/native-v11/checkpoint-46-window-direction/runtime-payload-sha256.json)。候選entry：`index-BAjigDTh.js`，普通entry：`index-CXHfstcQ.js`，共同CSS：`index-CiMc3Tjj.css`。
- 285tests、tsc/build、validate/replay/asset-check通過；146GLB零錯／零警告；305保護檔及原11個commit歷史保留；五個作者輸出重建前後510檔逐byte相同；317模型／貼圖／反射檔對C45原bytes不變。已過中央桌、背景形狀／材質、camera、routes及RTT生命週期修正均未重做。
- 第一輪全測有1項來源manifest未重建失敗，已保留log並在重建後重跑285／285，沒有算通過或放寬行為斷言。C45舊收據以已推送的`1aaf9ce67c465f0fd1a3a10d8c5465f161608f84`原始來源驗證，不改寫舊收據；本次來源另由C46收據嚴格比對。
- [來源／實際光學值／鏡頭及限制](../evidence/native-v11/checkpoint-46-window-direction/source-identity.json)。

七個真UI stock／會計階段及四次品質切換PASS：[完整proof](../evidence/native-v11/checkpoint-46-window-direction/stock-accounting-quality-proof.json)、[8件](../evidence/native-v11/checkpoint-46-window-direction/stock288/02-eight.png)、[真實18件／+¥8,400結算毛利](../evidence/native-v11/checkpoint-46-window-direction/stock288/04-hour1-stock2.png)、[售罄後重載](../evidence/native-v11/checkpoint-46-window-direction/stock288/05-soldout-reload.png)。

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

Low、Low+ReduceMotion、High+ReduceMotion三個fresh個案真UI買8及上架三SKU，五素材SHA與live材質／AO狀態、Reduced staff位置固定／props0均PASS：[圖片及raw結果](../evidence/native-v11/checkpoint-46-window-direction/lowrm288/)。帶touch能力的cloud context，未冒稱實體觸控裝置。

[庫存原片](../evidence/native-v11/checkpoint-46-window-direction/stock288/gameplay-uncut.webm)：310.800秒、183來源幀，中位間距1.88秒／最大7.71秒。18件／+¥8,400是**本次批次結算毛利**，尚未扣工資租金，不是單一顧客盈利。本輪未把這段稀疏片或浮字等同完整收銀接觸／handoff／退出連續動作驗收。所有個案0pageerror，fresh隔離Normal基線不變。

## 證據限制與下一步

[C45控制pointer原片](../evidence/native-v11/checkpoint-46-window-direction/contact-motion/gameplay-uncut.webm)81.480秒／28來源幀，中位間距2.43秒、最大7.59秒；[C46候選pointer原片](../evidence/native-v11/checkpoint-46-window-direction/daylight-motion/gameplay-uncut.webm)61.120秒／31幀，中位1.96秒、最大4.39秒。保留全部CDP來源幀的未剪接檔，不代表連續流暢動作驗收。

全部是cloud SwiftShader軟體渲染；沒有GPU fence、完成GPU畫格、實體GPU/FPS/audio/native、完整B交易或closure/hidden-tab認證。此輪沒有重測未改動的五語窄UI，不能挪用舊通過為新測試。只用fresh隔離Sandbox，沒有碰玩家Normal、使用者Chrome或Unity。已停止的Library／LTC路徑未重試，沒有新使用者動作阻塞。

下一步先獨立看固定窗光的全景及斜角；若仍不足，針對亮區跨度、窗框陰影過規整及全景亮暗主次改方法。保留已過AO／模型材質，不回到葉片、花瓣或AO微調，也不宣稱原圖重建完成。
