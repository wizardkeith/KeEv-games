# V11 C41：窗洞光的全景層次候選，未採用

Application `cac185234c6813b07e6bb2f09a83842f22cc2110`，[Draft PR8](https://github.com/wizardkeith/KeEv-games/pull/8)。C40普通257的獨立開發採用PASS保留；本輪只試新的全景光分佈，**普通預設仍C40。C41視覺門檻待獨立覆核，整體原圖品質／風格仍未達標；沒有merge或公開發佈，公開V17未由本輪改動。**

## 實際正常遊戲／斜角比較

- [唯一原圖／同來源control261／候選260，正常店高480px](../evidence/native-v11/checkpoint-41-lighting/target-control-aperture-normal480.png)，[未裁剪候選正常遊戲](../evidence/native-v11/checkpoint-41-lighting/aperture-normal-game.png)、[窗側至收銀局部](../evidence/native-v11/checkpoint-41-lighting/window-to-counter-crop.png)。原圖仍是 `Approved_Visual_Target_Misaki.png`，SHA256 `9f855d2ecfd120bb45c001db3fa9b5a3e3b58b2b3c2a4cf9e7ebfda84f8f7114`，沒有換參考。
- [第一斜角](../evidence/native-v11/checkpoint-41-lighting/oblique-0-comparison.png)／[第二斜角](../evidence/native-v11/checkpoint-41-lighting/oblique-1-comparison.png)：真pointer orbit、同geometry/material/stock/camera pose；自然員工活動相位不同，不作同姿勢像素歸因。[原始結果](../evidence/native-v11/checkpoint-41-lighting/results.json)、[DOM狀態](../evidence/native-v11/checkpoint-41-lighting/aperture-dom-state.json)保留，最終正常圖有完整HUD、body無zen class。比較圖只裁切、等比例縮放及標籤，不曾重繪遊戲圖片。
- 真實未剪pointer錄影：[control261，95.600秒](../evidence/native-v11/checkpoint-41-lighting/base-motion/gameplay-uncut.webm)／[aperture260，95.680秒](../evidence/native-v11/checkpoint-41-lighting/aperture-motion/gameplay-uncut.webm)。正常1440×1200，public CDP＋已安裝ffmpeg，非實體GPU/FPS或逐幀平滑認證。

親自查看正常480px、原始全景及雙斜角後：窗側桌／地面亮區、中央過渡與較暖收銀焦點已比control清楚；C36花器／白布仍可讀，沒有重排已過桌或小葉。**但候選全店仍偏沉，左／後牆的暖反彈不足，窗側亮區與影帶仍偏集中，灰屋頂依然佔強面積。它未達原圖明亮、柔和、通透且豐富的整體讀法，不能以273tests或「比之前好」代替美術接受。** 這是一個不同方法的可覆核候選，不擴散、不改成預設。下一步應先判斷窗光較寬的分佈／柔化及暖反彈，不回頭磨已過架板、花布或葉數。

## 與C30不同的實際3D方法

明確authoring命令：`VITE_V11_SCENE_WINDOW=aperture npm run build`；普通或`control`不啟用。曝光仍1，原tone mapping、albedo／roughness、C39值、192反射與room probe均保留；沒有C30漫反射替換、emissive場景貼圖、畫面overlay或camera-dependent光斑。

- 原無窗洞限制的directional sunlight只照原室外mesh；室內以.70殘餘directional作廣域sky-bounce代理。另由實際窗外位置`[-6.8,3.1,0]`照向窗洞`[-4.47,1.84,0]`的SpotLight，強度280、暖白`#FFF2DC`，以場景座標ray生成128²線性灰階窗洞cookie。它不是物理量測lux或完整GI。
- 這個spot用真正動態ShadowGenerator，High1024／Low512；只加入一張陰影RTT，光源新增2個代理、PBR最多6燈（原上限4），有額外shader／RTT成本，**未聲稱效能免費或手機FPS達標**。原外景、路徑與geometry完全不改。
- [原創RGBA8母檔及source receipt](../assets/authoring/native-v11/scene-window-c41.json)／[可重建來源](../src/art/scene-window-light-v11.ts)為未來native重用保留；不是聲稱已整合Unity/native。普通GLB不假稱含此動態照明。
- 首輪[258/259探索](../evidence/native-v11/checkpoint-41-lighting/rejected-v1/README.txt)強度100、共用RTT hooked-array，實際browser `casterListShared=false` 且新stock不在新陰影清單，**拒用**。其HUD缺失擷取也排除為最終正常證據，沒有把它當Zen／正常UI通過。v2按原sun的authoritative live list，在每次render前及resize後同步非disposed caster；新材質即時給6燈，保留初稿來源及診斷。
- 單元測試涵蓋cookie範圍／軟邊、現有／新stock、移除、quality resize後再新增；不是只驗證vertex存在。舊AST material-adapter測試補傳新`sceneWindowMode=control`依賴，原PBR／sidedness斷言未放寬。C40已審receipt改核對固定原commit source，新增C41 receipt核對當前world／Vite／光源來源，沒有覆寫已過母檔。

## 來源特定的實際流程與限制

- [228.680秒High原片](../evidence/native-v11/checkpoint-41-lighting/flow260/gameplay-uncut.webm)、[流程結果](../evidence/native-v11/checkpoint-41-lighting/flow260/results.json)與`timeline.json.gz`：960×720，fresh Sandbox真UI從0買8、place、開店、一次正常1小時結算；A接袋／exit、staff返回、reload真3D。A與B均觀察到完整入店／瀏覽／離店路線，**只有A交易呈現，沒有B handoff交易**。0pageerror、fresh隔離Normal baseline不變。
- 毛利payload為revision9／18件／收入1710／已售成本870／毛利840，JPY UI `+¥8,400`，是批次合計且未扣工租。[直接取自原CDP的150.063秒frame000130原JPEG](../evidence/native-v11/checkpoint-41-lighting/flow260/actual-margin-cdp150.063s-original.jpg)已親自讀到數字及文字；自動命名的`04-actual-margin-in-game.png`因排隊擷取錯過popup，**不作像素證明**。原片／原JPEG／原PNG均保留。
- [Low／Reduce Motion結果](../evidence/native-v11/checkpoint-41-lighting/low260/results.json)：1280×900，實際真買入上架，5個既有素材實際下載SHA相同；C39 live PBR值保留，新window caster及6-light來源檢查通過，Low shadow512。Reduce Motion位置不動／activeProps0；兩組無pageerror／fresh隔離Normal不變。
- [渲染／流程原始證據](../evidence/native-v11/checkpoint-41-lighting/render-flow-proof.json)：正常比較與Low末態的caster清單匹配，包含實際stock。結算後115.816／116.343秒兩個診斷快照曾不匹配，兩者`nativeTiming.wallMs`同109375.9；118.123秒下一個clock更新110980.8已匹配。這與兩次render之間更新庫存的狀態一致，**是推論，沒有冒稱完整逐幀GPU陰影認證**；原時間線完整保留供覆核。
- 沒有本來源的新售罄循環、hidden-tab／closure／中斷壓力、五語窄屏或實體GPU/FPS/audio/native認證。既往C40七筆ledger及B-only失敗錄製不轉算為本來源新通過。

## 檢查、不可變來源與交接

- [273/273 tests](../evidence/native-v11/checkpoint-41-lighting/final-tests.log)、兩個build／strict TS、validate五語174keys、replay、asset-check；[146GLB零錯警告](../evidence/native-v11/checkpoint-41-lighting/glb-validation.log)，[305受保護檔及原11history](../evidence/native-v11/checkpoint-41-lighting/preservation.json)不變。原17styling群／14036tri／155固定項、C38完整3000tri route/shelf SAT及C36/C39配方／atlas保留。
- [504資產重建逐byte同](../evidence/native-v11/checkpoint-41-lighting/asset-rebuild.json)；[260](../evidence/native-v11/checkpoint-41-lighting/runtime260-parity.json)／[261](../evidence/native-v11/checkpoint-41-lighting/runtime261-parity.json)各182runtime從application重建逐byte同。[來源／旗標](../evidence/native-v11/checkpoint-41-lighting/source-identity.json)及[媒體SHA256](../evidence/native-v11/checkpoint-41-lighting/media-sha256.json)可核對，沒有新發佈tar或Library重試。
- 請獨立覆核這個**非預設光照方法**及整體畫面讀法，特別是亮區分佈與結算邊界的shadow trace。整體原圖仍未接受，這不是完成重製或release候選。

無使用者動作／權限阻塞。沒有LTC403重試、新服務、玩家Chrome、Normal玩家存檔修改、Unity、merge／Site或關機；main只更新文件入口，PR8仍Draft，公開V17不變。
