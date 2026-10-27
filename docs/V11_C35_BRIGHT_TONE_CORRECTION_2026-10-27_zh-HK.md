# C35：只修前垂布與側花的 authored values

C34獨立結論：**材質FAIL，已過花／布形體保持PASS**。本次只修兩個圖頁色面，沒有再雕模型或調燈；材質仍待獨立覆核，整體原圖仍未接受。

Application `8bfd0757febe549f9a3a8b006f7c2408bbd8b92b`，唯一修正版build230；沿用 `VITE_V11_BOUNDED_MATERIAL=values`。普通預設仍201、公開V17不變，未採用／未擴散全店。

- [正常480px同場景對照：已拒用C34/228 → 修正230](../evidence/native-v11/checkpoint-35/normal-game-comparison-480.png)、[斜角0](../evidence/native-v11/checkpoint-35/oblique-0-comparison-480.png)、[斜角1](../evidence/native-v11/checkpoint-35/oblique-1-comparison-480.png)。只交這一個修正版，before確實是覆核的values228，不是舊226。
- [230正常全頁原檔](../evidence/native-v11/checkpoint-35/values230/values-normal-game.png)、[同鏡頭局部補充](../evidence/native-v11/checkpoint-35/supplemental-table-comparison.png)、[唯一原圖左店景與實際遊戲](../evidence/native-v11/checkpoint-35/original-target-and-game.png)。原圖SHA仍 `9f855d2ecfd120bb45c001db3fa9b5a3e3b58b2b3c2a4cf9e7ebfda84f8f7114`。所有AFTER均實際WebGL，非概念／studio替代；只有裁切縮放，店員自然位置不同。
- [95.920秒未剪實際pointer雙斜角](../evidence/native-v11/checkpoint-35/values230/values-motion/gameplay-uncut.webm)，[35個CDP幀／來源](../evidence/native-v11/checkpoint-35/values230/values-motion/recording-provenance.json)。稀疏雲端SwiftShader，不是物理GPU/FPS／完整流暢度或交易驗收。

## 診斷的是輸出，不只係數

[實際圖頁輸出量度](../evidence/native-v11/checkpoint-35/tone-output-measurements.json)將圖頁與原display-linen albedo逐像素比較，並分列sRGB通道比與轉linear後的比值。原前垂UV區的sRGB中位數為 **0.740／0.768／0.798**；在實際照明之前已明顯壓暗。修正後為 **0.983／0.978／0.967**，不靠全局曝光。

1. 布的寬幅乘色收窄；最深 authored 值只在原法線場的低值褶谷出現。保持暖白，不再將整個前垂面乘成深灰或藍灰。幾何、UV、normal／ORM／specular／真實接觸陰影原樣保留，沒有畫入庫存陰影。
2. 同一圖集三個花簇區改為接近的暖灰白，仍由實際遮擋形成深度。三簇中間像素由 `(236,234,216)／(218,220,198)／(199,209,187)` 改為 `(249,246,238)／(246,243,236)／(244,241,236)`，移除側簇綠偏向並收窄主側亮度差。

自查三視角：前垂面回到暖白，褶谷與轉面仍見；側花灰綠偏色消除，跨簇遮蓋及較大開口未變。這只支持本次最小修正，**未宣稱柔亮材質／原圖品質已獲接受**，仍交獨立正常尺寸覆核。

## 來源與必要檢查

- [鎖定證明](../evidence/native-v11/checkpoint-35/scope-locks.json)：相對覆核C34，`src`與config全部逐byte不變；C33花／C32布JSON及Blend、C27構圖、192反射、原圖雜湊相同。只有生成器兩個色值區、其兩張PNG的master/public/provenance及回歸測試變更。前版圖頁仍可由Git歷史 `b054c51a02800f12556775a6c794e0091cd6611e` 讀回。
- **256tests／tsc／build／validate五語174keys／replay／asset-check通過**。新增測試直接解碼RGB8圖頁，守住前垂區中位數、褶谷底值、暖中性色及狹窄主側差；不把係數公式抄成測試。既有形體／承托／17群整合斷言保留。
- **15776 style+canopy tri／17styling群**，原上限不變；4448底點／541原布接觸、146GLB零錯警告、305保護檔通過。沒有原生材質匯出／native接受主張。
- [最終source重建182runtime逐byte一致](../evidence/native-v11/checkpoint-35/runtime-parity.json)、[兩張圖頁重建與master/public一致](../evidence/native-v11/checkpoint-35/map-rebuild.json)。沒有更換材質角色、batch、atlas路徑、光照或反射。
- [實際browser證明](../evidence/native-v11/checkpoint-35/browser-proof.json)：同支持的UI匯入8-stock Sandbox、同228正常camera／兩個pointer orbit／經濟資料，save不變、fresh隔離Normal不變、0pageerror。不是新買入／結算／handoff／reload、Low／五語窄屏／hidden-tab／實體GPU/audio驗收。

下一步只覆核此修正版材質，不重做已過形體。採用前仍需新來源affected實際流程；不合併、不發佈、不改普通預設或公共Site。無Library/LTC重試、玩家Chrome／Normal／Unity／關機操作，無需使用者動作的阻塞。
