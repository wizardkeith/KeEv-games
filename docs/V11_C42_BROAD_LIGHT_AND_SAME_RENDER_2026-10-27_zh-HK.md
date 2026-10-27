# V11 C42：較廣暖間接光／同render陰影證據，未採用

Application `78b0889312496ddc9e9c1fdb288621cd6b7ad2b9`，[Draft PR8](https://github.com/wizardkeith/KeEv-games/pull/8)。C41獨立視覺FAIL，維持OFF；**普通預設仍是已通過開發採用覆核的C40，C42只作明確authoring候選。整體原圖品質與風格仍未接受，沒有merge或公開發佈，公開V17不變。**

## 真正遊戲畫面及方法

[唯一原圖／C40 control／C42正常店高480px對照](../evidence/native-v11/checkpoint-42-light-balance/target-control-balanced-normal480.png)，[C42未裁剪正常遊戲](../evidence/native-v11/checkpoint-42-light-balance/balanced-normal-game.png)、[斜角一](../evidence/native-v11/checkpoint-42-light-balance/oblique-0-comparison.png)、[斜角二](../evidence/native-v11/checkpoint-42-light-balance/oblique-1-comparison.png)。唯一原圖仍是 `Approved_Visual_Target_Misaki.png`，SHA256 `9f855d2ecfd120bb45c001db3fa9b5a3e3b58b2b3c2a4cf9e7ebfda84f8f7114`。比較只裁切／等比例縮放／加標籤，沒有重繪或以概念圖替代遊戲。顧客／員工自然活動相位不同，不把人物差異歸因於光源。

- `VITE_V11_SCENE_WINDOW=balanced npm run build`產生266；普通／`control`仍不啟用。曝光1、全部已接受模型、材質、192反射、C36桌／C38形體／C39圖頁、camera／rig／routes／核心經濟及存檔不改。
- 將C41室內殘餘directional換成廣域暖hemisphere代理（`.85`、上色`#FFF0D9`、地色`#75624C`），保留原sky／room IBL。窗洞spot由280降至120、aperture soft edge `.10→.35`、shadow blur `.08→.16`；室外sun/fill降至2.80/1.25，降低屋面對比但不改ridge。這是可運行3D光源代理，**不是完整GI或物理量測照度**。
- 首次Hemi2.30在實際畫面造成沖淡，已[拒用並保留來源／圖片](../evidence/native-v11/checkpoint-42-light-balance/rejected-2.30/README.txt)。directional與hemisphere的數字不能直接當成相同能量；最終以實拍校準.85，未調曝光或albedo來掩蓋。
- [C42可重建母檔／receipt](../assets/authoring/native-v11/scene-balance-c42.json)，原C41 cookie與receipt原封保留。使用既有允許的光源方法；停止的LTC403未重試。最多6個PBR lights及一張動態陰影RTT（High1024／Low512），有實際成本，未聲稱手機FPS達標。

親自查看原圖、正常全景及雙斜角：C42入口、後牆與前景較C41恢復明度，窗側不再只有集中強峰；2.30試樣的明顯沖淡已避免。**但相對原圖仍偏均勻、軟接觸與受光面層次不足，屋頂仍是大灰面，材質及人物精緻度仍有距離。這不是美術PASS。** 這輪停在來源固定的可覆核比較，不把「較亮」當成原圖畫風，也不改成普通預設。

## 同一shadow render ID的證據

新增只讀`shadow-pass-audit-v11.ts`：在真RTT開始／第一個shadow mesh pre-draw／每個mesh post-draw／RTT結束記錄frame ID、render ID、RTT及texture UID、quality epoch、完整caster UID和已繪商品UID。source／target以同一物件參考及UID核對，避免同名但已disposed的舊mesh誤當新mesh。每次畫質resize重新掛到新RTT，僅保留8筆。

QA等候庫存改變後的**新**完整pass，核對同一render ID下source／target一致、source商品UID與實際post-draw商品UID集合一致，0庫存必須兩者皆空；Low512與High1024及目前texture UID相符。這比在兩次clock之間讀診斷嚴謹，但**仍只是CPU端WebGL draw dispatch／RTT觀察，沒有GPU fence，不能稱GPU完成畫格、逐幀無鬼影或實體效能認證。** C41兩筆舊時間診斷並非已證實永久ghost，本輪不據此修改正確會計。

## 修正實測暴露的既有RTT生命週期問題

首輪264的8→2及Low／High已通過，但2→0後等待原中央接觸陰影`refreshRate=0`逾時120秒，[失敗log與部分結果](../evidence/native-v11/checkpoint-42-light-balance/incomplete264-resize/README.txt)保留，未稱整體PASS。安裝中的Babylon8.32.0 `ShadowGenerator`在`RenderTargetTexture.resize` observer內重建RTT；原`table-contact-v11`只在初始目標設定refresh0／renderCount observer，實際NullEngine可重現High0→Low1→High1。

最小修正：resize後對**目前新RTT**重新套用原refresh0與一次observer，再invalidate。沒有加強陰影或改接觸形體，也不把連續render冒充靜態一次更新。新277th測試用真ShadowGenerator反覆Low／High重建，驗證新map不同、refresh0、尺寸、目前observer計數、舊map不重複計數，以及新增／移除售罄商品不殘留。完整真UI流程在266重新跑，和264未完成的證據分開。

## 驗證與限制

[真UI庫存／畫質原片665.160秒](../evidence/native-v11/checkpoint-42-light-balance/stock266/gameplay-uncut.webm)、[七份存檔／完整caster及draw UID核對](../evidence/native-v11/checkpoint-42-light-balance/stock-shadow-proof.json)：0→3→8→重載8→營業一小時2→再一小時0→售罄重載0通過；零值購買無寫入，003買入、005鍵盤買入及原稿保留，三款上架不再扣款。現金raw5000→4565→3840→3840→5490→6000→6000；兩次結算sales1710／570、COGS870／290、每次人工租金營運合計60，成本不重扣，eventSequence增加18／6。照片保留8→2→0實際商品數，固定花器／書／布不變，售罄圖沒有原杯群或固定杯影殘留；非所有視角／所有SKU的毫米承托認證。

2及0庫存各做Low512／High1024窗光RTT；中央接觸RTT分別256／1024、refresh0皆保留，完整core存檔在每次畫質切換前後逐值相同。8重載後mesh UID與2件新mesh UID不重疊；0與重載0 source／target／draw商品UID全空。零庫存frame65／render315的RTT before／sample／after皆315，商品0draw；是同pass dispatch證據，後續Playwright照片不宣稱與該GPU畫格pixel-identical。fresh隔離Normal不變，0pageerror。

必要檢查與來源、真實庫存／畫質結果見同目錄證據及`source-identity.json`、`stock-shadow-proof.json`。277 tests、TypeScript／兩組build、五語174keys validate、replay、asset-check、146 GLB零error/warning、305保護檔；506資產重建逐byte一致，266／267各182runtime由application重建一致。最終control267與balanced266均從固定application重建，逐byte相同。

正常1440×1200實際UI／pointer：C42有HUD；control的DOM有HUD但headless raster遺漏，原圖及DOM如實保留，沒有貼回假HUD。比較縮圖只判場景區，不將此遺漏稱為Zen操作通過。[C42原片116.920秒](../evidence/native-v11/checkpoint-42-light-balance/balanced-motion/gameplay-uncut.webm)／[control原片109.200秒](../evidence/native-v11/checkpoint-42-light-balance/base-motion/gameplay-uncut.webm)保留public CDP時間及來源。

雲端Chromium154／ANGLE SwiftShader軟件渲染。這輪庫存結算不等於全A/B動畫交付、B接袋、hidden-tab／closure、五語窄屏、ReduceMotion或實體GPU/FPS/audio/native重測。Normal只讀比對fresh隔離baseline，沒有讀取或修改玩家Normal；沒有Site、玩家Chrome、Unity、Library／LTC重試、關機或新發佈包操作。下一步先獨立判斷C42全景是否真的改善，再決定採用或拒用，整體原圖目標繼續開放。
