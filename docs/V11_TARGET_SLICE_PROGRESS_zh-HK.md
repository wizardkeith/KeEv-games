# V11 原目標重建切片 — 進行中，未驗收

使用 Keith 2026-10-25 再確認的唯一原圖：`docs/codex-v4/reference/Approved_Visual_Target_Misaki.png`，1536×1024，SHA256 `9f855d2ecfd120bb45c001db3fa9b5a3e3b58b2b3c2a4cf9e7ebfda84f8f7114`。Library 原樣副本 `libfile_df47ac9baf04819182f496bbb7ff40b6`。已實際讀取原圖與 V17 完整遊戲截圖；原圖是目標店景／人物合成圖，不是已達成的遊戲畫面。Bible §28：真正3D、35–45°、約3.5–4頭身、柔和anime toon人物／soft stylized PBR環境。





## 第十八個 checkpoint — 真正房間反射／青瓷素材及實際ORM通道修正，未達目標

**runtimea2b32a498939a3c36ab8ca3b3ea8aec19ce754d2，default112。** 從真正255個static mesh捕捉128²六面線性HDR，GGX64samples／48RGBD mip，排除人物／真庫存／門扇／FX／存檔；原始.env、來源／native契約保留。只替換ceramic specular，原analytic diffuse SH／direct lights／其他材質不變，沒有即時probe、新燈或把房間圖當背景。[單獨反射109實際遊戲](../evidence/native-v11/checkpoint-18/specular-after109/after-normal-game.png)：局部亮邊可見，但不是重大整店風格突破。首次SDK輸出180秒超時排除；成功CPU RGBD／2Dcanvas輸出另有原始log／來源，沒有隱瞞失敗。

原始可重建青瓷釉色／微表面／roughness素材，實際瓶身採物理高度UV，vase仍原SKU／幾何／高度。[完整新材質112普通買入上架／正常鏡頭](../evidence/native-v11/checkpoint-18/celadon-after112/after-normal-game.png)／[實際櫃台](../evidence/native-v11/checkpoint-18/celadon-after112/after-counter-game.png)。before103→112三camera與cash/stock/shelves完全相同，0pageerror／隔離Normal未變。標準GLB嵌入相同albedo／normal／ORM及clearcoat，未把Web效果默認當native外觀相同。

**找到真實設定缺陷：**Babylon8.32預設alpha粗糙度優先，原程式雖設green=true卻未設alpha=false，故ORM green被遮蓋。現依已宣告glTF資料用Groughness／Bmetallic，未改dye、base roughness或mesh。[同鏡頭同自然面向before111](../evidence/native-v11/checkpoint-18/orm-before111-after112/before-female-in-game.png)／[after112](../evidence/native-v11/checkpoint-18/orm-before111-after112/after-female-in-game.png)，B x/z/yaw/browsing及camera exact；頭手／其他人自然相位不同。**實看外套增益仍小，布料gate仍OPEN；不能說所有摺弱都因材質。**

**204tests/build/validate/replay/assets、139GLB零error/warning、305protected/history，36native輸出＋3釉色map fresh rebuild byte-identical。**375×812真Sandbox刻意abort反射檔仍worldReady、原analytic備援、0pageerror。沒有假稱GPU probe再次捕捉byte-identical，或重跑74五語布局。[來源、逐段scope、測試與限制](../evidence/native-v11/checkpoint-18/provenance.json)。

[177.636秒真正正常營業鏡頭流程110](../evidence/native-v11/checkpoint-18/normal-flow110/gameplay-uncut.webm)已完成普通買入／放架／招呼／一次真結算／收銀接觸／可讀18件＋8400批次毛利（未扣人工租金）／A離開／員工返位／reload，0pageerror／隔離Normal未變；[收銀實際PNG](../evidence/native-v11/checkpoint-18/normal-flow110/03-cashier-contact-in-game.png)。**這是110，尚未ORM修正，不冒稱112新完整流程通過。****補充：exact112／a2b32a4已完成170.778秒workflow／169.760秒未剪錄影，同樣真買入上架、招呼、一次結算、A接觸交袋、可讀18件＋8400批次毛利、A離開／員工返位／reload，0pageerror／隔離Normal未變。** [112真正正常營業未剪片](../evidence/native-v11/checkpoint-18/normal-flow112/gameplay-uncut.webm)／[可讀毛利實拍](../evidence/native-v11/checkpoint-18/normal-flow112/04-actual-margin-in-game.png)。不是實體FPS／完整連續手掌精度驗收。

原目標style/quality仍未達到，人物／整店陳列密度／材質層次／入口外景和相對比例仍有差距；反射與ORM技術pass不是目標驗收。依parent完成**一杯／一瓶、同正常遊戲鏡頭**比較：[before103](../evidence/native-v11/checkpoint-18/one-cup-vase103-112/before-normal-game.png)／[after112](../evidence/native-v11/checkpoint-18/one-cup-vase103-112/after-normal-game.png)，普通UI各買1件並用普通wheel到允許近鏡；不是default zoom，鏡頭／經濟exact，員工自然相位不同。材質增益仍有限。這組實拍及新triangle檢查揭露舊前後排猜高度會把杯底放進木riser／瓶底穿cloth；另進行C19真實支承修正和八瓶自然高低層次，不含於112。Library由parent處理，不再重試。保留C16rollback、C17鉛筆／holder、C13衣物及所有economy/save/UI/camera。PR8draft／未merge/deploy，publicV17不變；無實體GPU/FPS/audio/native驗收，無其他內容擴張。

## 第十七個 checkpoint — 真正買入上架的鉛筆比例／接觸修正，繼續整店

原生鉛筆長0.5835m，display×1.12後65.35cm；[實際舊正常遊戲](../evidence/native-v11/checkpoint-17/before100/before-normal-game.png)確實像粗長木棒。重建原SKU的六角筆身／木尖／石墨／金屬箍／擦膠，display後23.86cm；固定櫃台筆筒改約13.33cm高。[同鏡頭實際新版](../evidence/native-v11/checkpoint-17/after103/after-normal-game.png)／[新版實際櫃台](../evidence/native-v11/checkpoint-17/after103/after-counter-game.png)。這些尺寸是由手部／器物比例推算，原圖沒有提供公分規格；不是新增商品或玩法。前四支放回既有淺色runner、後四支在既有riser；仍min(stock,8)，沒有庫存授予。

**runtime6946fad89c409f7c03b1885c2c695e52af4b8f79，200tests/build/validate/replay/asset-check，139GLB零error/warning，305protected/history及36個native輸出fresh rebuild byte-identical。** 六項focused測試含三桌×0..9庫存的真實triangle支承ray、1mm gap、個體不重疊及接合連續性。before100/after103均普通Sandbox買8vase/pencil/tray並放架；cash/inventory/shelves及normal/Zen/staff鏡頭pose完全相同，0pageerror、隔離Normal基線未變。[原始資料／雜湊／失敗排除／限制](../evidence/native-v11/checkpoint-17/provenance.json)。Build101測試TypeScript annotation失敗，誤複製舊dist的那次capture全部排除；修正後102/103由成功build才複製，沒有把舊圖冒充新模型。

Library兩張歷史build94實際正常遊戲／批次毛利圖已按current prepared multi-file helper嘗試，**read-only hosted apps tools/list network失敗**；native Library list成功後一次bounded同路retry仍失敗，prepare/transfer/finalize均未開始、沒有檔案或ID。不是授權拒絕或uncertain write，沒有換直接create／猜URL繞路。[精確blocker及圖片hash](../evidence/native-v11/checkpoint-17/library-delivery-blocker.json)。原build94 GitHub截圖仍可讀。

**原目標仍未達到，繼續。** 比例已修正，但薄小鉛筆正常scale辨識有限，整店仍比原圖平／稀疏，瓷釉／布／紙材質層次及外景仍不足。下一個bounded方法是從真正房間幾何產生方向性specular probe，檢查瓷器是否有可讀窗形／木反射，不再用更高貼圖解析度冒充質感。尚未實作／驗證該probe，不宣稱有效。C16拒絕試驗保留、C13正常衣物保留，沒有重跑新收銀／全語言或實體device；完整Bflow仍exact94，locale仍exact74。PR8draft未merge/deploy，publicV17不變，無Normal玩家資料／使用者Chrome／Unity／關機／內容擴張。

## 第十六個 checkpoint — 少數主摺試驗保留，default未採用；回到整店

依中性診斷結果，只在既有低模邊線增加一條22mm背部主要V摺，及加深五道既有裙褶；沒有更多頻率／小皺紋，也沒有重跑cloth simulation。[正常材質98](../evidence/native-v11/checkpoint-16/control98-primary.png)／[中性99診斷（不是正常美術）](../evidence/native-v11/checkpoint-16/DIAGNOSTIC-neutral99-NOT-normal-art.png)，同geometry/camera/自然面向的隔離仍成立。已實看：中性下腰部折線較明確，但正常藍外套的畫面增益仍有限，不能稱原圖style/quality通過。**未採用為default；原C13局部形體保留。**

[9項fit/UV測試](../evidence/native-v11/checkpoint-16/fit-tests.log)及[topology/normal/budget](../evidence/native-v11/checkpoint-16/budget.log)通過；沒有冒稱trial做了完整suite／新收銀／全步態或實體device驗證。修改patch、真正runtime input／UV／可編輯UV.blend保存於experiments/c16-primary；先封存才只恢復本輪自己的source/UV/GLB/manifest，沒有丟失別人的工作。安裝中的Babylon PBR確實直接使用normal texture level，沒有根據StandardMaterial的反比約定誤修PBR；材質／fill根因未完全隔離。[來源／判斷](../evidence/native-v11/checkpoint-16/provenance.json)。

現在回到整店商品與材質。已量度目前原生鉛筆長0.5835m，display乘1.12後約65.35cm，與原圖手部比例疑有明顯落差；先取得真正購買／放架的遊戲畫面，再做一組手部比例一致的文具切片，尺寸是由參考圖比例推算，並非原圖提供了公分規格。維持相同SKU／經濟／存檔／五語／鏡頭，不增加玩法。原圖及布料gate仍OPEN，publicV17不變，PR8draft／未合併／未發佈。

## 第十五個 checkpoint — 固定 renderer 診斷完成，未拿診斷當美術

依parent覆核，固定同幾何／鏡頭／自然瀏覽面向，實際跑[現行材質control95](../evidence/native-v11/checkpoint-15/control-current-game95.png)與[中性＋單方向光96診斷（不是正常遊戲美術）](../evidence/native-v11/checkpoint-15/DIAGNOSTIC-neutral96-NOT-normal-art.png)。**48個cloth mesh的positions/normals/indices及原material identity雜湊全部一致**，camera與B的x/z/yaw/state一致；普通UI／wheel／自然browseProgress≥.30等待，沒有pose／時鐘／庫存／交易注入。頭手自然相位略不同，不聲稱全pose鎖定。Neutral只換cloth成無貼圖／IBL／specular的灰色材質，只綁一盞無陰影diffuse方向光，其他場景／人物皮膚／rig保留；剔面有效CCW已核對。

已看全圖與4倍nearest原像素crop：**中性單光下主要背部垂墜仍圓滑，不能只怪原材質。**[隔離測試](../evidence/native-v11/checkpoint-15/isolation-test.log)檢查真實衣物所有vertex/normal/UV/index、parent/matrix不變，noncloth燈光保留；它只證明診斷有效，不是美術通過。[來源／量測／限制](../evidence/native-v11/checkpoint-15/provenance.json)。Default build不啟用診斷、不多第五燈，沒有用灰色畫面代替正常玩法證據。

下一步只改少數主要V摺／現有裙褶幅度及必要低模形體，不再盲跑cloth simulation或小皺紋；之後回到整店材質區分／自然陳列／柔和窗光接觸。Target/style/textile gate仍OPEN，publicV17不變，PR8draft未合併／未發佈；雲端不是實體GPU/FPS/audio/native驗收。

## 第十四個 checkpoint — 實際全店層次及櫃台工作用具，布料診斷仍在進行

保留已接受的髮型／肩頸／鏡頭／傢俬／主要陳列。新增原圖櫃台的**真正中空文具杯與五支不同斜向鉛筆**，固定工作用具，沒有SKU／庫存／獎勵／經濟作用；現有一張back-shelf print移到中央riser，配合保留的花／書形成高、中、低組合，35個固定showroom sample種類／數量完全保留。六條16mm牆飾條省去正常距離不足一像素的3mm bevel，保留相同bounds，把576tri轉到可見工作用具；**固定dressing＋canopy15,704tri<16,000，17materialgroups<18**，沒有提高預算。

[真正遊戲改前86](../evidence/native-v11/checkpoint-14/before-game86.png)／[改後94](../evidence/native-v11/checkpoint-14/after-game94.png)及[改後panorama](../evidence/native-v11/checkpoint-14/after-panorama94.png)：相同normal/Zen鏡頭、普通Sandbox實際買8本筆記本／8杯／8茶及放3架後拍攝；沒有pose／camera／sale注入。NPC自然相位與QA店名不同，不能把人物轉向當材質進步。PCSS原.085過度模糊，改.028呈現實際窗框／植物投影；初次.018暴露牆面shadow acne，已修正常bias，不拿有條紋版本作完成畫面。當前key/fill/practical燈／四燈位上限原樣保留。Hemi cloth return令衣物太白太平；Directional第五燈改善有限又多48mesh的shaderinput，**兩者均不採用default**，prototype圖及source留存，未證明第五燈是任何效能問題的根因。

**Default94：197tests/build、139GLB零error/warning、305protected/history、256檔fresh export parity；80frame離線cloth JSON與freshUV JSON/provenance byte-identical。**Prototype92的198項包含後來移走的未採用light測試，沒有改弱既有測試。92High真結算/B接觸及DOM18/+8400可觀察，但poll沒有捕捉float、原loop180s內未驗證完整離店回位，**NOT COMPLETE**，原結果保留。Dual-view QA在短暫float期間操作設定；source本來就會在panel開啟時隱藏float，不能因此推斷交易壞掉。當前94以不切換雙鏡頭的240s bounded loop完成觀察：**347.115s workflow／346.320s未剪片**，真實B入店／招呼／結算／接觸／交袋／18件+8400批次毛利／B離店／店員回位／reload、0pageerror、隔離Normal不變。[原始結果](../evidence/native-v11/checkpoint-14/female-real-flow/results.json)／[未剪片](../evidence/native-v11/checkpoint-14/female-real-flow/uncut.webm)／[已實看可讀毛利](../evidence/native-v11/checkpoint-14/female-real-flow/margin.png)。只稱這些觀察，雲端很慢，不把它當精確手部／全步態流暢／physical FPS驗證。經濟／動畫時序沒有為QA改動。

C13原exit-walk圖片確實仍在貨架，已改名shelf-at-exit-start；[真正136秒離店frame](../evidence/native-v11/checkpoint-13/exit-video136s.png)已實看，原始144.720s未剪片／舊history保留。依parent最新覆核，下一步固定同geometry/camera/自然面向，比較現有材質燈光 vs neutral＋單方向光；先分清主摺形體與shader流失，**不再盲跑複雜cloth simulation或加小皺紋**。布料與整店原圖style/quality仍未達；無release archive／merge／publish，publicV17不變。雲端SwiftShader不當實體GPU/FPS/audio/native通過；五語UI/controller未改，既有15case/75panel驗證仍是74來源，未冒稱94重跑。

## 第十三個 checkpoint — 離線衣料休止形態及真正摺峰邊線，視覺門檻仍開放

以原C11衣殼在雲端Blender做受限80frame休止布料／waist seam tension，再作主要V形受力摺雕塑，保留5,472vertex高模、碰撞支撐、pin／shape keys及低模在可編輯master。第一個均勻水平低模沒有接住摺峰，實際game84仍弱；後續在**相同410vertex／720tri拓撲**把三條腰部邊線改沿主要V摺，沒有提高面數或加強weave。**女顧客11,994tri<12,000**，原肩頸Y≥.99逐座標保留、接點／手臂長度／既有rig不變。寬酒紅背巾保留並加寬緩弧度；裙身改5道不等距重力摺；袖口改真正中空雙捲邊，有內壁／腕部空隙，原實心帽面退役。

[實際遊戲改前77](../evidence/native-v11/checkpoint-13/before-game77.png)／[改後86](../evidence/native-v11/checkpoint-13/after-game86.png)／[完整原始量測](../evidence/native-v11/checkpoint-13/provenance.json)：普通玩家wheel、同camera／B的root與yaw，前後capture均自然瀏覽；頭／手自然相位不完全一致。[4倍nearest evidence crop改前](../evidence/native-v11/checkpoint-13/before-detail-4x-nearest.png)／[改後](../evidence/native-v11/checkpoint-13/after-detail-4x-nearest.png)只是放大原像素，不是生成／補畫。已實看：袖口／腰襬輪廓有變，但正常遊玩尺寸的背部主要衣褶仍弱，**布料及整體原圖門檻未通過，不把高模或tests當視覺成功。**

[全程未剪實際遊戲片](../evidence/native-v11/checkpoint-13/uncut.webm)／[自然B入店瀏覽離店結果](../evidence/native-v11/checkpoint-13/motion-results.json)，96CDP畫面約145秒、0pageerror；只觀察自然入店／瀏覽／離店，**未做新結算或收銀驗證**，C11的真實B交易仍只屬其自身source。稀疏雲端SwiftShader畫面不聲稱全步態／接觸精度／實體GPU/FPS/audio/native通過。

**196tests/build/validate/replay/asset-check、139GLB零error/warning、305protected/history通過**；兩項新geometry測試檢查肩頸逐點不變／中空袖口實際ray穿透及內壁。前片／blouse初次新摺導致layer clearance不足，已改實際層距，原測試門檻沒變。首次未先重建GLB的suite失敗，巨型binary assertion耗盡worker；新增SHA先驗檢查讓stale master先簡短失敗，仍保留exact byte比較，正常export後全數通過。失敗log保留。現有五語UI／經濟／save／鏡頭／燈光／傢俬／已驗證陳列沒有改動；未重稱新版15locale/layout或完整收銀已跑。

後續繼續解決正常尺度衣褶光照可讀性，以及整店仍顯著存在的自然混合商品／材質反應、柔和窗光／接觸層次及遠景差距。沒有為弱視覺試驗再做release archive；PR8仍draft、未合併、未發佈、publicV17不變。

## 第十二個 checkpoint — 實際自身遮蔽試驗，不採用為runtime／主要解法

C11形體已進可玩模型，但正常距離衣褶仍弱。本輪以雲端Blender對5個獨立rigid衣物組件／21面做原創Cycles自身AO，避免把移動手臂陰影烘在身體；實驗WebGL真正套在14mesh／4,456vertex，沒有改任何座標／UV／關節／三角形，也沒有加強weave或貼圖解析度。這是artist-directed diffuse vertex tint，**不是fullGI**。

[真正同面改前](../evidence/native-v11/checkpoint-12/before-female-in-game.png)／[改後](../evidence/native-v11/checkpoint-12/after-female-in-game.png)及[原始量測](../evidence/native-v11/checkpoint-12/results.json)：同camera/root/yaw；pre/postcapture都保持瀏覽。早前一張已離店轉身、另一張仍在轉到瀏覽方向，嚴格guard已排除，沒有拿front/back變化當材質改善。最終有效A/B已實看：有局部暗部變化，但正常距離改善仍太細，不能解決原圖衣料形體／質感差距。**不採用為runtime或主要解法，布料及原圖門檻仍未通過。**

原始可編輯.blend／輸入／scalar值保存在assets/masters/native-v11/experiments/c12-*，baker／runtime patch／glue及[完整來源／限制](../evidence/native-v11/checkpoint-12/provenance.json)保留作研究；原生GLB沒有COLOR_0套用，不聲稱native parity。Default應用恢復C11基線，沒有為試驗再做release archive／完整release測試。

下一步改用較完整的衣物休止形態雕塑／cloth authoring及高模細節烘焙至受限面數可玩mesh，先取同面實際遊戲證據才擴展。保留已驗證髮型／肩頸／關節／鏡頭／燈光／陳列。全景材質／商品規律度／光影接觸／植物遠近細節仍有差距，不只布料；公開V17不變、PR8draft／不合併／不發佈，未稱最終美術或實體GPU/FPS/audio/native通過。

## 第十一個 checkpoint — 真正衣褶／背部圍巾重建，並非貼圖解析度

保留C10已驗證鏡頭／燈光／髮型／肩頸／人物關節／傢俬及陳列。女顧客coat下身改成約1cm中尺度受力褶，袖口堆疊、裙身重力垂墜／不完全一致的裙襬；沒有加強weave或提高貼圖解析度。原圖背後寬酒紅圍巾垂片在舊模型卻是正面窄尾，已重建成貼合真實背面的有厚度垂片，反射時同時處理winding／normals，保留outwardCCW。**女顧客11,930tri<12,000**，沒有為預算削掉既有髮型／手部或提高上限。

[真正同面遊戲改前](../evidence/native-v11/checkpoint-11/before-same-facing-game.png)／[改後](../evidence/native-v11/checkpoint-11/after-same-facing-game.png)：immutable74→77，同camera及B的x/z/yaw，都是背面coat/scarf/skirt；普通玩家wheel到最小允許半徑，沒有pose注入。自然頭／手／browse相位不同，[完整量測](../evidence/native-v11/checkpoint-11/same-facing.json)。已實看：背部圍巾輪廓明顯更接近原圖，腰褶在一般距離仍偏弱；**不把這次形體改動當布料／最終美術通過。**

**194tests/build/validate/replay/assets；139GLB零error/warning；305protected/history通過。**21個衣物面重新做Blender UV，freshJSON/provenance byte-identical。初次新褶令門襟三角形中間穿入1.364mm，已調整實際drape間隙12→14mm，沒有放寬測試。背巾按真實背面測貼合，不沿用錯誤的正面假設。[原始紀錄／sourcehash／限制](../evidence/native-v11/checkpoint-11/provenance.json)。

女顧客針對性收銀初次QA沒有可服務的自然視窗，沒有按結算，所以**未通過，不是交易成功卻沒有動畫**；原始false結果保留。已讀source確認服務座標範圍。第二次普通暫停／重開有真結算及fallback批次毛利，但讀取B位置後2.8秒才按下結算，她已走出範圍；仍NOTPASSED接觸。移開拍圖／IDB／locator等待，以預先讀好的可見按鈕座標做一次普通mouse click，沒有改遊戲規則／強制pose或注入交易，第三輪終於由B自然完成。[fresh77完整252.44秒未剪遊戲](../evidence/native-v11/checkpoint-11/female-real-flow/uncut.webm)／[原始結果](../evidence/native-v11/checkpoint-11/female-real-flow/results.json)：普通暫停／drain／重開，B自然入店，真正結算／收銀階段／交袋／毛利／B離店及店員回位／reload皆觀察，0pageerror，隔離Normal基線不變。[原始CDP128毛利](../evidence/native-v11/checkpoint-11/female-real-flow/raw-cdp-000128.jpg)／[130已交袋](../evidence/native-v11/checkpoint-11/female-real-flow/raw-cdp-000130.jpg)／[204秒離店](../evidence/native-v11/checkpoint-11/female-real-flow/exit-video204s.png)已實看。177個CDP畫面／252秒，不能宣稱全段流暢度或實體FPS；診斷與影片時鐘原點不同，不用秒數硬對齊。[詳細量測及QA修正](../evidence/native-v11/checkpoint-11/female-real-flow/visual-notes.json)。C10fresh74完整流程／五語版面保留，未說成77重跑。按parent要求，沒有為這個視覺切片再做release archive。

整體仍有商品規律度／材質豐富度、暖窗光與柔和接觸層次、遠景簡化等差距；不是只剩布料。**原圖畫風／畫質仍未達，繼續。**公開V17、PR8draft／未合併／未發佈，經濟／存檔／五語／現有list沒有變動；雲端軟體渲染不當實體GPU/FPS/audio/native驗收。

## 第十個 checkpoint — 整束花材／真實窗外遠近層次，原目標仍未達

保留C9三人、髮型、鏡頭、focal light、傢俬／商品組合／庫存。三個原花瓶位置各8主枝，改為12朵開放實體花＋24閉合圓花苞的分叉花團，具下層花頭、葉團與枝間留白；不是再只增加單片花瓣細節。固定dressing合計**15,728tri<16,000**，不提高上限。第一版仍像細枝、第一版遠屋像橫條，均在實際遊戲檢查後退回修正。

原兩棟遠屋／四窗保留，重建屋脊方向、封閉山牆及牆／簷連接，較低視差位置讓山牆落入真正window portal。兩層淡色分葉樹團有局部wind pivot，避免遠樹繞店原點擺；近窗216葉樹冠原樣保留。全authoring仍<160，沒有新可玩建築／庫存或背景圖片。天空／遠景仍明顯簡化，不宣稱原圖氛圍已達。

- [正常遊戲改前](../evidence/native-v11/checkpoint-10/vignette-before-normal-game.png)／[改後](../evidence/native-v11/checkpoint-10/vignette-after-normal-game.png)；[改後實際店員鏡頭](../evidence/native-v11/checkpoint-10/vignette-after-staff-game.png)：immutable66→74，同一真實UI購買／上架Sandbox，normal及staff camera diagnostics完全相等；人物自然相位不同，不當人物同姿勢比較。
- **194tests/build/validate/replay/asset-check；139GLB零error/warning；305protected/history；288files全新重建byte-identical；152actual archive payload parity。**新增遠屋實際window rays／遠樹局部pivot檢查。舊Z向屋坡測試改為任何水平軸真正坡度，仍要求4塊屋坡／4個窗／原低建築及預算限制。
- [build73完整188秒未剪遊戲](../evidence/native-v11/checkpoint-10/build73-motion/uncut.webm)：真入貨／陳列／結算／招呼／收銀接觸／交袋／已服務客人離店及店員回位／reload，0pageerror，隔離Normal基線不變。[影片123秒毛利畫面](../evidence/native-v11/checkpoint-10/build73-motion/margin-video123s.png)可讀18件/+¥8,400/未扣人工租金；最初非同步04截圖錯過浮字，沒有拿空畫面充數。[全部原始數據／來源hash／界線](../evidence/native-v11/checkpoint-10/provenance.json)。build74只再加遠樹葉片；[fresh74完整175秒流程／未剪影片](../evidence/native-v11/checkpoint-10/build74-motion/uncut.webm)已另外完成：同樣觀察所有結點／0pageerror／reload及隔離Normal基線一致。[影片127秒真毛利](../evidence/native-v11/checkpoint-10/build74-motion/margin-video127s.png)／[145秒離店](../evidence/native-v11/checkpoint-10/build74-motion/exit-video145s.png)已查看。136CDPframes／174秒影片不能當物理FPS或全段流暢度驗收。屋坡測試已再明確只認X/Z水平軸，不把Y向yaw當pitch；7focused重跑通過，runtime沒改。

[C9同面較近實際遊戲改前](../evidence/native-v11/checkpoint-10/cloth-same-facing-close/before-female-in-game.png)／[改後](../evidence/native-v11/checkpoint-10/cloth-same-facing-close/after-female-in-game.png)已補完：immutable60→66，camera完全相等、B的x/z/yaw相等、同背面coat/skirt；browse progress .704/.739自然相位不同，不宣稱完全同姿勢。**自查可見提升仍太細，布料門檻不通過。**不是把UV/checker當美術完成；下一步須可讀的中尺度衣褶／垂墜，不再放大weave。[量測與評估](../evidence/native-v11/checkpoint-10/cloth-same-facing-close/assessment.json)。

fresh74[五語×3尺寸／75面板](../evidence/native-v11/checkpoint-10/five-locale-framing/results.json)亦通過：camera完全相等、桌面580pxdrawer、44pxbuy、無pageoverflow/pageerror，touch emulation/ReduceMotion，不是實體手機驗收。

**繼續工作，非美術接受／非release完成。**C9一般及較近鏡頭的布料差異仍偏細；整體造形／材質／商品規律度與原圖仍有距離。雲端SwiftShader低密度截取不證明實體GPU/FPS或完整流暢度，audio/native仍未驗收。公開V17不變，PR8草稿，沒有合併／發佈／內容擴張。

## 第九個 checkpoint — 一套coat／skirt實際UV與材質切片，視覺門檻仍未通過

以第二顧客為切片，保留三人髮型／鏡頭／focal light／傢俬／陳列。21個衣物曲面另存可編輯Blender UV master；SmartProject後按實際面積縮放至metre，逐島調整warp向Y，保留每個原頂點／法線／三角形與pivot，只分UV seam。coat／skirt前面加權warp角度在5°內，UV與3D總面積相等；不是保證每個局部都無投影變形。raw guard改為nanometre比較以避免Node/Chrome末位浮點誤判，仍拒絕10micron變形與stale atlas。

原創knit／linen／canvas／leather albedo／normal／ORM與restrained sheen，只先套在女顧客服裝；標準GLB嵌入同byte／repeat／KHR_materials_sheen。首輪斜向織紋與斑駁linen已退回調整，沒有用誇張weave遮掩造形。新增少量領／腰皺與4mm裙襬變化，24向衣身連續性，完整女顧客**11,910tri <12,000**；新褶令原貼合測試少14micron，已調整外衣實際drape間隙，不放寬測試。Misaki／男顧客GLB與第八輪byte-identical；不是重做既有髮型或移動場景。

- [正常遊戲同面改前](../evidence/native-v11/checkpoint-9/material-before-female-in-game.png)／[改後](../evidence/native-v11/checkpoint-9/material-after-female-in-game.png)：camera完全相等，顧客x=-.65/z=1.1/yaw=π/2相等，兩者都在browse reach之前（手臂休息）；頭／其他人自然時間相位可不同。[同面量測](../evidence/native-v11/checkpoint-9/same-facing.json)。沒有注入姿勢／假交易。
- [真正DEV遊戲50mm checker](../evidence/native-v11/checkpoint-9/checker-after-female-in-game.png)：檢查UV方向／密度，**不是發佈美術**。第一張RawTexture被clamp成藍邊已排除，現明確repeat；正式JS不含checker開關。未settle的camera A/B曾嚴格失敗，後改等inertia=0，沒有降低比較標準。
- **193tests/build/validate/replay/asset-check，139GLB零error/warning，305protected/history通過**。Blender UV原座標／法線／pivot、stale拒絕、物理bag柄接觸／步行覆蓋、四種貼圖／ORM／repeat／sheen parity均通過。[全部來源／payload／原始紀錄與限制](../evidence/native-v11/checkpoint-9/provenance.json)。

**尚非完成／不宣稱接受：**正常鏡頭材質差異仍須視覺覆核，整體原圖品質／畫風仍未達。fresh66女顧客[87.24秒自然入店／瀏覽／離店實拍](../evidence/native-v11/checkpoint-9/female-movement/uncut.webm)及[原始狀態](../evidence/native-v11/checkpoint-9/female-movement/results.json)已完成，0pageerror，leaving與outside觀察。已看離店及39秒frame；89個CDP畫面／87秒，不能由此宣稱完整流暢度或實體GPU/FPS。沒有銷售，不把較早64影片說成66；目前亦不等於新一輪fullrelease或audio/native驗收。後續優先整束花的分枝／花團與留白、商品規律度、較淡遠屋頂／樹層。公開仍V17，PR8維持草稿，沒有合併／發佈或內容擴張。

## 第八個 checkpoint — 有效布料UV、實體花瓣／樹冠，材質門檻仍開放

確認根因：多個sculpt布料mesh沒有UV，原weave只取同一texel。新metre unwrap保留每個實際三角形座標／法線、既有臉／眼atlas，處理cylindrical seam與端蓋，提供正交tangent；Web與GLB嵌入同一原創布色／normal、16/m repeat及KHR_texture_transform。這是必要的正確性修正，**不是聲稱藍外衣已達原圖質感**。原圖式柔和布料／袋／皮革差異仍不足，下一輪集中於一件coat＋skirt的checker方向／尺度、可見材質及少量領／腰褶。

花材第一版仍是平星形，已改成五片獨立、閉合彎曲花瓣和花心；保留三個花瓶位置／組合，瓶口增加圓度。薄葉改為同外輪廓的閉合漸薄lens，省去不可見重邊面數；把預算轉到真正花瓣與窗外216片葉（原144）和較高樹冠，沒有將上限放寬。固定dressing共**15,464tri <16,000**，camera／key／focal lights、傢俬與商品組合保留。陶器新增restrained標準clearcoat，Web／KHR_materials_clearcoat同參數；不是GI或native外觀驗收。

- [UV修正改前遊戲](../evidence/native-v11/checkpoint-8/uv-before-normal-game.png)／[改後](../evidence/native-v11/checkpoint-8/uv-after-normal-game.png)：56→57，同camera／真實QA入貨存檔，角色自然idle相位不同；不把這兩張當同姿勢布料品質通過。
- [花瓣／樹冠改前](../evidence/native-v11/checkpoint-8/flowers-before-normal-game.png)／[改後](../evidence/native-v11/checkpoint-8/flowers-after-normal-game.png)，[實際店員鏡頭](../evidence/native-v11/checkpoint-8/flowers-after-staff-game.png)：59平星試驗→60閉合花瓣，真正遊戲，非概念圖／gallery。
- [最新完整遊戲](../evidence/native-v11/checkpoint-8/game-panorama.png)／[收銀](../evidence/native-v11/checkpoint-8/game-cashier.png)／[毛利](../evidence/native-v11/checkpoint-8/game-margin.png)／[184.601秒連續未剪High/Minimal=false](../evidence/native-v11/checkpoint-8/game-uncut.webm)。真正Sandbox購買／陳列／結算／招呼／接觸／交袋／毛利／reload，0pageerror，隔離Normal基線不變。
- **190tests/build/validate/replay/asset-check，139GLB零error/warning，305protected/history通過**。[原始紀錄／shader與payload雜湊／限制](../evidence/native-v11/checkpoint-8/provenance.json)。目前無fresh190獨立認證，不把parent對c085226的視覺檢查當完整測試認證。

原圖品質／畫風仍未達標。保留已改善髮型與全景，接續可見布料／袋／皮革、自然紙品器物與遠近建築。公開仍V17；草稿PR8，沒有合併／發佈／新內容。

## 第七個 checkpoint — 第二顧客與實際曲面／行走檢查

保留目前鏡頭、燈光、傢俬及商品組合；第二顧客另建可編輯Blender臉／耳／側分髮束／聚攏側髮／低髻，藍外衣、短頸、圍巾、奶油長裙、手指、鞋與個人斜揹袋。女顧客11,710tri、男顧客11,712tri，原12,000限制不變。Misaki recipe仍完全相等，角色limb/socket/rest transforms、下肢與原購物交接袋保留。不是所有模型皆重做；材質／整體目標仍未通過。

**新增實際幾何檢查也找到並修正：**男／女門襟、細肩帶及闊袋蓋原本只有頂點貼合，三角形中間仍切入曲面；改為按實際支撐面細分貼合，測四組三角形內點。兩人個人袋原位置進入行走手臂擺幅，已移到手臂後方、肩帶繞過腰側，保持原移動範圍；不改交接物件或動作時間。最初新QA路徑朝向與前進方向相反，造成錯誤的裙／腳判斷；修正QA方向後恢復原預定裙形，沒有因此改足步／經濟。收銀測實際手到袋柄，而非要求兩手彼此相碰；兩位顧客皆通過。

- [真正遊戲第二顧客改前](../evidence/native-v11/checkpoint-7/customer-before-female-in-game.png)／[改後](../evidence/native-v11/checkpoint-7/customer-after-female-in-game.png)：相同normal shop camera及普通wheel input，camera diagnostics完全相等；自然觀看動作相位不同。這組無入貨，不宣稱任何銷售。
- [真正完整遊戲](../evidence/native-v11/checkpoint-7/game-panorama.png)／[收銀](../evidence/native-v11/checkpoint-7/game-cashier.png)／[實際批次毛利](../evidence/native-v11/checkpoint-7/game-margin.png)／[174.112秒未剪連續High/Minimal=false](../evidence/native-v11/checkpoint-7/game-uncut.webm)。真實Sandbox買貨／上架／結算，招呼／接觸／交袋／毛利／reload皆觀察，0pageerror，隔離Normal基線一致。
- [補充模型改前](../evidence/native-v11/checkpoint-7/female-before-studio.png)／[改後](../evidence/native-v11/checkpoint-7/female-after-studio.png)／[低髻背面](../evidence/native-v11/checkpoint-7/female-back-studio.png)：同尺度production模型studio，**不是遊戲畫面**。
- **187tests/build/validate/replay/asset-check，139GLB零error/warning，305protectedfiles/history通過。**新Blender女顧客JSON可全新byte-identical重建。新增兩位顧客真實IK前進步行、裙覆蓋、鞋底、手與個人袋清除、手到交接袋柄接觸測試。[完整來源／雜湊／原始證據／限制](../evidence/native-v11/checkpoint-7/provenance.json)。

仍明顯不是原圖的材質豐富度與全景品質。下一步針對布料未有有效UV造成平面反應的根因，以及白花、陶器／書本規律度、窗外深度；不是再改鏡頭或擺位。公開仍V17，沒有合併／發佈或新內容。

## 第六個 checkpoint — 男顧客實際重建，目標仍未達標

保留第五輪已經實拍的燈光、櫃檯／中央桌高低陳列與鏡頭，沒有再排列傢俬。男顧客另建可編輯Blender頭／耳／短髮，實體分層髮束與側後輪廓；衣身、斜肩、短頸、厚領片／門襟／袖口、手掌與四指／拇指、帆布鞋及個人斜揹袋重建。**11,172tri，原12,000限制不變**。第一次肩帶末端約5cm浮離衣身、抬高髮束超出3.5–4頭身檢查，已按實際三角面修正並重跑；沒有降低檢查標準。原購物交接袋、IK／所有肢體與接觸關節、交易／存檔完全保留。共用臉面定位函式抽出後，Misaki所有原始recipe幾何／材質／pivot與第五輪snapshot完全相等；第二顧客仍未整合新模型。

- **實際遊戲相同收銀鏡頭：**[改前](../evidence/native-v11/checkpoint-6/before-cashier.png)／[改後](../evidence/native-v11/checkpoint-6/after-cashier.png)。皆真實Sandbox購買／陳列／結算到接觸，非注入姿勢／假銷售；自然動作相位不同，不宣稱逐格同姿勢。
- [改後完整遊戲](../evidence/native-v11/checkpoint-6/after-panorama.png)、[真實毛利](../evidence/native-v11/checkpoint-6/after-margin.png)、[362.621秒連續未剪實拍](../evidence/native-v11/checkpoint-6/after-uncut.webm)／[改前398.428秒](../evidence/native-v11/checkpoint-6/before-uncut.webm)。兩輪High/Minimal=false皆觀察招呼、真正結算、接觸／交袋、毛利，reload／隔離Normal基線一致，0pageerror。包含整個UI準備；重疊雲端渲染造成耗時，不當實體GPU/FPS證據。
- [同尺度模型改前](../evidence/native-v11/checkpoint-6/male-before-studio.png)／[改後](../evidence/native-v11/checkpoint-6/male-after-studio.png)：補充studio，明確**不是遊戲畫面**。
- **184tests／15focused／build／validate／replay／asset-check通過，139GLB零error/warning，305protectedfiles/history通過**。Blender頭JSON全新重建byte-identical。原獨立P2量測probe重跑：socket3.600cm、交接0.20秒位移2.120cm、4,655,808手臂／手頂點清除檢查、root最小距離0.690m。[來源雜湊、全部原始紀錄與界線](../evidence/native-v11/checkpoint-6/provenance.json)。

這不是原圖畫風／畫質驗收；人物仍有低密度形體與布料質感差距，白花／商品規律度及窗外層次仍待改善。下一步第二顧客的低髻、外衣／圍巾及手部，再做實際正常鏡頭比較。公開仍V17、PR8草稿，沒有合併／發佈或內容擴張。

## 實際主要差距

- 完整店景：V17 空白地板／牆面比例大，陳列高度單一，四件同類商品不足以形成目標的混合生活選物密度；須保留實際庫存顯示，不能用美術擅自增加可賣商品。
- 人物：短髮偏球殼，側髮像附加小條；臉部輪廓／眼睛／皮膚層次不足。原待客朝向令常態鏡頭多見背面；須用真正待客／結帳過程評估可見臉，不能為截圖偽造姿勢。
- 器物／環境：陶器、植物、窗外深度與材質太簡化；光影也偏平。僅修改顏色／燈光不能解決造形差距。

## 已改變的方法與目前進度

- **Misaki頭部已另建可編輯Blender細分曲面**（`tools/build-v11-character.py` → `assets/masters/native-v11/misaki-head.blend`／JSON）：同一臉面含頰、下顎、鼻樑；26個實體曲面組成非對稱分層短髮，保留原rig、肢長、接觸／動作流程。首版87,808tri過重，已重拓撲至頭部4,640tri／完整角色11,988tri，仍低於既有12,000限制；高密度來源與非破壞修飾器保留於.blend（仍需實際效能驗證）。原V10模型／所有原masters未刪除。
- 新增真正UV材質流程，原創膚色與虹膜paint由可重建Python來源產生，眼睛／眉／唇按實際細分臉面定位；不把目標PNG貼成角色或背景。Web已接入；glTF同步路徑已修改，尚待最終重建／完整驗證。
- 新建連續曲線陶杯／花瓶與有厚度的手柄，SKU／庫存／價格規則不變；筆記本呈現採更接近目標的低彩度綠。
- 新建分枝植栽、實體薄葉與織籃、垂吊綠植／多層窗外樹冠；窗外按材質合批，避免逐片樹葉一個draw call。正接入完整遊戲。
- 首輪實際WebGL正常鏡頭已產生（本地QA中）；**仍明顯未達目標**，因此繼續改，不把這輪當完成品。下一步：完整店景實拍、待客臉部／服裝輪廓、陳列／材質與光影反覆比較，再跑回歸／連續動作。

## 界線

公開仍V17；本分支是草稿，不合併／不發佈。保留UI清單、580pxdrawer及鏡頭行為、五語、存檔／會計。沒有story／店舖／套裝／能力擴張，沒有Normal存檔修改、使用者Chrome／Unity操作或關機。雲端SwiftShader畫面不代表實體GPU/FPS/audio/native驗收。目標品質與風格驗收持續開放；此文是早期checkpoint，不是完成報告。

## 第一個公開可讀checkpoint

[完整遊戲途中畫面](../evidence/native-v11/checkpoint-1/game-panorama-intermediate.png)／[真正結帳畫面](../evidence/native-v11/checkpoint-1/game-cashier-intermediate.png)，[來源與限制](../evidence/native-v11/checkpoint-1/provenance.json)。這是build6途中證據，不宣稱最後candidate匹配或目標通過。14項focused regression已全通過；完整回歸第一次162/172，修正後175/176，UV locality修正後完整176/176通過；沒有修改面數與固定dressing預算。錄影曾因UI harness最後close selector timeout而未成功完成，不把該次叫pass。改用公開CDP screencast和已有FFmpeg，沒有繞過官方FFmpeg下載的Domain forbidden；這是本機錄影，不是另路存取受限資源。


## 第二個進度 checkpoint — 2026-10-26 00:03 HKT，仍未達標

已改動真正可玩的場景：加厚櫃檯與側櫃、抽屜／把手／結構桌腳與陳列高低架；窗洞加寬、窗外樹冠下降到實際鏡頭可見高度；分枝薄葉改用原創葉脈貼圖；裙襬／袖子／袖口另建連續曲面，圍裙依實際新裙面重新貼合；臉面、眼睛、髮夾與髮片再校準。真實庫存最多呈現8件，仍依原已入貨／已上架數量，沒有增加SKU或經濟獎勵。新的厚度擴大了四個既有碰撞包圍盒，路徑／會計／時間規則不變。Misaki完整11,988tri，原12,000上限不變。

材質不是把參考圖當背景：另生成一張原創木材ALBEDO（來源、原檔與雜湊保留），UV按實際木板長軸；用實際靜態店景在Blender Cycles烘焙接觸AO，Web UV2與標準glTF occlusionTexture內嵌同一原始PNG；可編輯烘焙.blend保留。沒有烘焙人物、庫存或交易。曾試SSAO2但產生鏡頭裁切，已完整移除，不當作已通過。預設鏡頭目標收緊；只有玩家明確切換Zen時使用完整viewport，drawer切換不參與鏡頭計算。

**實際證據與來源：**

- [build24完整遊戲Zen店景](../evidence/native-v11/checkpoint-2/game-panorama-build24.png)／[正常UI店景](../evidence/native-v11/checkpoint-2/game-ui-build24.png)：真正production WebGL、實際Sandbox購買／上架，沒有注入姿勢或假庫存。
- [build23真正收銀接觸近景](../evidence/native-v11/checkpoint-2/game-cashier-build23.png)／[其後店員鏡頭](../evidence/native-v11/checkpoint-2/game-staff-build23.png)／[連續未剪遊戲錄影](../evidence/native-v11/checkpoint-2/game-build23-uncut.webm)。build24只再調鏡頭，這些build23影像不冒充更後版本。
- [V17人物](../evidence/native-v11/checkpoint-2/v17-body-studio.png)／[目前V11人物](../evidence/native-v11/checkpoint-2/v11-body-studio.png)：相同三分之四鏡頭與比例的**實際production模型補充studio比較，並非遊戲截圖**；不能取代上面的實際遊戲證據。
- [177測試](../evidence/native-v11/checkpoint-2/177-tests.log)、build/validate/replay/asset-check通過；139 GLB零error/warning；305受保護檔案與原11commit歷史檢查通過。真正圖面仍優先於這些技術結果。[完整來源／限制](../evidence/native-v11/checkpoint-2/provenance.json)。

**尚未解決／不能宣稱通過：**整體仍與目標有明顯距離。軀幹胸肩／短頸和兩位顧客仍大幅沿用V10，下一步須實際重塑；商品組合／花材與室內窗光層次不足。現有一輪High錄影確實見到招呼、實際結算、手部接觸與交袋，但輪詢沒觀察到短暫毛利提示；正核對原始CDP畫面與事件時間，尚未判定是QA截圖阻塞而錯過或真正presentation缺失，**不能將完整流程稱pass**。較早build11曾實拍全部流程通過，但不拿舊版結果代替當前驗證。雲端SwiftShader不是實體GPU/FPS/audio/native驗收。未發佈、未合併，公開仍V17。


## 第三個 checkpoint — 實際新模型／正常鏡頭，仍在重建

- 上衣不再保留V10直立衣片：新胸背曲面、依實際胸背貼合的厚裁片、斜肩／短頸／折領；手掌重建為掌心、四指及拇指，鞋／鞋底改為連續圓曲面。既有手腕、socket、肢長與接觸／行走時間保留。完整Misaki11,944tri；兩位顧客仍沿用V10，未冒稱全部角色重建。
- 臉面獲較多重拓撲預算，髮片保留流向／分層而減去冗餘內側面；可編輯高細分來源不刪。生成到獨立暫存目錄的JSON與master逐byte相同。花材／空心器皿重新構建，置於窗邊、中心陳列角及櫃檯；窗外枝葉更完整。這些都是固定裝飾，沒有增加庫存、SKU或獎勵。
- 正常UI鏡頭移除固定右側空白、縮小頂部預留；抽屜仍580px、開關不重設orbit／zoom／target。回到曝光1，由實際光源與材質調整畫面，未用提高曝光代替模型工作。窗光陰影做柔化，但畫面仍未達目標的柔和／豐富程度。

[正常遊戲畫面](../evidence/native-v11/checkpoint-3/game-normal-ui.png)／[明確切換Zen](../evidence/native-v11/checkpoint-3/game-zen.png)／[真正收銀接觸](../evidence/native-v11/checkpoint-3/game-cashier.png)／[實際毛利顯示](../evidence/native-v11/checkpoint-3/game-margin.png)／[172秒未剪遊戲錄影](../evidence/native-v11/checkpoint-3/game-uncut.webm)。[人物補充studio](../evidence/native-v11/checkpoint-3/model-studio-body.png)是同一production模型與相同比例的中性studio，**不是遊戲畫面，也不取代前述證據**。

**QA更正：**獨立檢視已在build23原始錄影110–113秒（111秒可讀）找到「18件／+¥8,400／未扣人工、租金」。原`actualMargin:false`是輪詢漏看，不是遊戲經濟出錯；保留原始紀錄並解釋差異，沒有為這個假陰性修改遊戲。QA已加只讀DOM觀察及非阻塞截圖；fresh build31真正Sandbox招呼／結算／交袋／批次毛利均被輪詢、畫面和DOM記錄捕捉，重載快照相同，0pageerror、隔離Normal基線未變。[完整來源／限制](../evidence/native-v11/checkpoint-3/provenance.json)。177 tests、build/validate/replay/assets、139GLB零error/warning、305受保護檔案通過。另實測五語×1280×720／375×812／320×420共15組、75次panel切換，鏡頭pose不變、desktop drawer580px、buy target≥44px；只屬touch emulation/Reduce Motion，不是實體手機驗收。較早未觀察／timeout不因此被改稱歷史pass。

**下一步與未通過項目：**原目標品質／風格仍未達到，正常店景仍偏平，人物服裝／臉部層次、兩位顧客、自然混合高度與白花密度、窗外天空／屋頂深度仍有明顯差距。正在另行試實際靜態幾何的Cycles間接光烘焙，尚未接入；它是光照資料試驗，不是替代遊戲的概念圖／完成畫面。沒有新故事／玩法／店舖／套裝、沒有merge/deploy/Normal玩家資料/使用者Chrome/Unity/關機。持續重建，不把技術回歸通過冒充目標美術驗收。


## 第四個 checkpoint — 新貼圖映射／外景與實際遊戲內 GI 試驗，尚未達標

保留第三個checkpoint已改善的胸肩／短頸／服裝連續輪廓，不再反覆重做。新改的是：皮膚眼瞼、薄眉／眼線、實際臉部與眼睛UV上下／左右映射（glTF貼圖座標方向；原錯位令腮紅／高光位置不正確）；更圓潤的葉片與成簇白花；真正窗洞幾何portal及程序遠天空，背景不再穿出剖開牆外。原160固定場景authoring預算連天空仍保留，Misaki11,960tri仍低於12,000。新增Web薄透光材質，標準glTF保留opaque PBR fallback及native extras，不冒稱兩個renderer最終外觀相同。

[實際預設遊戲／正常UI](../evidence/native-v11/checkpoint-4/game-default-normal.png)／[實際預設Zen](../evidence/native-v11/checkpoint-4/game-default-panorama.png)／[同一遊戲、同一鏡頭GI試驗](../evidence/native-v11/checkpoint-4/game-experimental-gi-panorama.png)／[明確標示非遊戲的補充人物studio](../evidence/native-v11/checkpoint-4/supplemental-studio-face.png)。179tests、139GLB零error/warning、305protected路徑通過；原純投影演算法、core/save/會計/五語/UI未改。最新完整High未剪動作證據仍是第三checkpoint的172秒，不假稱這次新shader已重跑該流程。

**有改變方法，但沒有假稱成功：**用實際245個靜態mesh／原始材質貼圖在Cycles烘焙2048²間接光atlas，再以compact UV sidecar接入真正遊戲。A/B確實有222個mesh套用，9個簽名未匹配；效果太弱且牆面出現噪點，因此**未採納為預設，也未算通過**。預設build不啟用該flag、不需要試驗資料；工具／原始試驗資料仍保留於saved cloud QA，沒有用圖片替代可玩3D。完整來源／雜湊／限制見[provenance](../evidence/native-v11/checkpoint-4/provenance.json)。

下一個重點依獨立覆核：實際暖焦點光／窗光與冷外景A/B；完成櫃檯＋中央桌的一組高中低、白花與既有非庫存展示樣品陳列；然後把男顧客的髮／胸肩／領口／手／袋提升至目前Misaki品質。兩位顧客仍未重建，不以studio或技術pass冒充原目標藝術驗收。沒有merge/deploy/Normal玩家資料/使用者Chrome/Unity/關機／故事玩法擴張。


## 第五個 checkpoint — 真正焦點光／一組高中低陳列，客人仍待重建

[同鏡頭焦點光前](../evidence/native-v11/checkpoint-5/game-before-focal-light.png)／[焦點光後](../evidence/native-v11/checkpoint-5/game-after-focal-light.png)：真正遊戲，用兩個有範圍的暖色bounce proxy建立櫃檯／中央桌焦點；spot candela與directional lux是不同單位，不宣稱實測物理照度。原吊燈位置保留，移位會遮商品的試驗已放棄。Low保留櫃檯固定焦點與基本人物動作，減少中央補光；不是新增玩法。

[實際陳列／正常UI](../evidence/native-v11/checkpoint-5/game-vignette-normal.png)／[實際Zen](../evidence/native-v11/checkpoint-5/game-vignette-zen.png)：原35件非庫存showroom只搬5件，三本書形成中層、卡片與托盤在櫃檯、白花在中央桌形成高層；按實際模型底面／高度安放，不改玩家庫存。中央桌可售樣品維持min(stock,8)，保留裝飾區與層架空間，10SKU實際bounds／堆疊／互不穿插測試通過。量體、價格、會計、存檔與五語UI不變。

[真正收銀](../evidence/native-v11/checkpoint-5/game-cashier-build46.png)／[實際毛利](../evidence/native-v11/checkpoint-5/game-margin-build46.png)／[175秒未剪High遊戲錄影](../evidence/native-v11/checkpoint-5/game-uncut-build46.webm)。招呼、實際結算、手部接觸／交袋、批次毛利、重載均觀察到，0pageerror、隔離Normal基線相同。這段是build46；build47只調中央／窗邊花材的落點／scale並封合小型裝飾瓶底，交易／人物／光照程式相同，**不假稱另跑build47動作**。182tests/build/validate/replay/assets、139GLB零error/warning、305protected檔／原歷史通過。[來源／雜湊／限制](../evidence/native-v11/checkpoint-5/provenance.json)。

**仍不合格於原目標：**整體場景／材質與原圖仍有明顯差距，兩位顧客還是主要V10資產；下一項是男顧客髮／胸肩／領口／手／袋，先保留已改善的Misaki與店景比例。沒有以182tests冒充美術驗收，沒有merge/deploy/使用者Chrome/Normal玩家資料/Unity/關機。原目標品質與風格gate持續開放。
