# C36 最終採用 checkpoint：瓶口修正及新來源驗證完成

**本輪source-specific採用檢查完成，供獨立覆核；不是整體原圖或release接受。** C35窄幅材質標準已設為V11開發預設；原穿瓶口阻塞已修正，259 tests全通過。沒有merge／Ready／公開Site寫入，公開V17不變。

Application `5e826991e2125cf2722ecd71590918c73567e0e8`，**普通無authoring旗標build232**。[182個最終runtime檔由此source重建逐byte一致](../evidence/native-v11/checkpoint-36-resolution/neck-runtime-parity.json)。下列最終flow／stock／Low全為232，不把修正前231或C35的檢查冒作本輪。

## 瓶口阻塞真正修正，沒有放寬斷言

[修正前記錄](V11_C36_DEFAULT_ADOPTION_CHECKS_2026-10-27_zh-HK.md)保留初次發現與失敗斷言。父任務隨後明確要求解決實際枝／瓶接合，故本次只重建兩條側主枝的中間分叉點（Y=.395m、半徑.055m），原下根點／上端節點保留。新增`flower-spray-c36.json/.blend`與可重建來源，原C33母檔未覆寫。

- [最終實際截面](../evidence/native-v11/checkpoint-36-resolution/neck-after.json)：part11／22瓶口最大半徑 **.05020／.05078m**，通過原來`<.069m`斷言；實際花器rim約.07157–.07243m。沒有把門檻改為容許穿壁。
- [變更範圍證明](../evidence/native-v11/checkpoint-36-resolution/repair-scope.json)：33部件只改11／22，其餘31部件逐byte相同。原根點／上端節點在1e-8m內相同，拓撲／三角數不增；新根部環在瓶內下界收進原範圍.725mm，沒有擴張外框。C32布、C35兩張色面、C27構圖、192反射、原圖雜湊不變。
- [實際遊戲同鏡頭局部before231→after232](../evidence/native-v11/checkpoint-36-resolution/neck-fit-before-after-crop.png)只補充接合檢查；沒有重做已接受的三簇、遮蓋、間隙、花面或布轉面。

## 普通預設的真實遊戲及生命週期

[正常全頁實拍](../evidence/native-v11/checkpoint-36-resolution/flow232/01b-normal-game.png)、[同桌局部](../evidence/native-v11/checkpoint-36-resolution/actual-default-table-crop.png)、[原始目標左店景與同店高實拍](../evidence/native-v11/checkpoint-36-resolution/original-target-and-default-game.png)。所有AFTER都是可玩WebGL，沒有concept／studio替代或合成場景。

[349.920秒未剪High／MinimalFX=false影片](../evidence/native-v11/checkpoint-36-resolution/flow232/gameplay-uncut.webm)、[140個CDP幀時序](../evidence/native-v11/checkpoint-36-resolution/flow232/recording-provenance.json)、[逐事件原記錄](../evidence/native-v11/checkpoint-36-resolution/flow232/timeline.json)／[結果](../evidence/native-v11/checkpoint-36-resolution/flow232/results.json)：

- fresh隔離Sandbox真買8／三款上架，實際招呼、一次UI小時結算、cashier contact及接袋。
- 同revision9的visitor-a實際hasBag／carriedBag對應，18件revenue1710−實際COGS870=毛利840；[約257.148秒原CDP幀](../evidence/native-v11/checkpoint-36-resolution/flow232/actual-margin-pixels.jpg)人工查見 **18件／+¥8,400／未扣人工租金**，不是net或虛構單客收益。[來源定位](../evidence/native-v11/checkpoint-36-resolution/flow232/actual-margin-pixel-proof.json)。
- staff home264.967s、顧客outside／袋清除287.481s；不要求兩個事件必須同一取樣幀。reload後真3D／save逐值相同，0pageerror，fresh隔離Normal不變。

這是稀疏雲端SwiftShader連續證據，不是實體GPU/FPS、逐幀平滑／精確手接觸毫米級、audio/native接受；沒有宣稱人工看完每一幀。完整原始JPG保留本executor QA，repo提供未剪影片、全部時序及關鍵原幀。

## 最終232庫存／Low／Reduce Motion

[真實stock-cycle結果](../evidence/native-v11/checkpoint-36-resolution/stock232/results.json)：全部是正常UI買入／上架／兩次分別提交小時／reload，無注入state／clock。invalid0 Enter不寫core，keyboard005保留原稿，placement不收款。

| 每款stock | cash（內部單位） | purchases | eventSequence |
|---|---:|---:|---:|
| 初始0 | 5000 | 0 | 0 |
| 買入／上架3 | 4565 | 435 | 0 |
| 加5至8／reload8 | 3840 | 1160 | 0 |
| 第1個真UI小時，剩2 | 5490 | 1160 | 18 |
| 第2小時售罄0／reload0 | 6000 | 1160 | 24 |

每次cash／stock、已售bookCost→COGS、report units→eventSequence逐項核對；cash按sales−salary−rent−operating，沒有將早已支付的存貨成本再扣現金。修正前我寫錯的QA驗算及其說明保留在前一checkpoint，**遊戲經濟程式沒有改動**。

[初始0與售罄reload0的實際table對照](../evidence/native-v11/checkpoint-36-resolution/empty-versus-soldout-table.png)：固定花器／書／布保留，沒有可見固定杯影殘留；0時杯caster被移除，影圖於幾何變更刷新，兩實際幀穩定。不是所有視角毫米級證明。

[232 Low與Reduce Motion結果](../evidence/native-v11/checkpoint-36-resolution/low232/results.json)：兩個fresh context都真買／上架8件，實際普通default mode=values；HTTP下載的兩張atlas SHA與C35已接受的`8b737b…cc74`／`956b76…3563`完全相同。保存了正常全頁／table crop；Reduce Motion兩實際幀根位置不變、activeProps0，0pageerror／fresh Normal不變。不是Low整段顧客流程或實體手機認證。

## 驗證及重建

- [259／259 tests](../evidence/native-v11/checkpoint-36-resolution/neck-final-tests.log)、tsc/build、validate五語174keys／replay／asset-check通過。歷史C29斷言仍明確檢查保留母檔；新預設驗證C36根部、保留C33可見31部件及C35 atlas，原瓶口閾值／承托斷言沒有放寬。
- 原style+canopy **15776tri／17styling群**、4448底點／541布接觸保持；146GLB零錯警告、305保護檔通過。GLB規格合法沒有被當成接合正確的替代。
- 普通Web與Node配方同為新預設，C36 JSON/provenance及四native exporters重建後，[486個tracked assets/public逐byte一致](../evidence/native-v11/checkpoint-36-resolution/neck-asset-rebuild-parity.json)。Blend是保留的可編輯來源，不宣稱Blender二進位重建一致或native裝置release。
- [整合摘要](../evidence/native-v11/checkpoint-36-resolution/adoption-summary.json)與SHA256SUMS固定本輪source／場景／atlas／交易資料。沒有發佈包、merge／Site／audience／identity／玩家Normal／Chrome／Unity／關機操作，沒有Library或LTC重試。

## 下一個whole-scene差距（尚未實作）

[原圖與最終正常畫面](../evidence/native-v11/checkpoint-36-resolution/original-target-and-default-game.png)仍相距明顯：後牆長水平木架、規整低高度陳列與灰綠窗景形成平面帶；原圖以高低錯落的紙／陶器／植物、明亮有深度的窗外與前景收銀互動連成緊密層次。這不是休息截圖沒有顧客的問題，也不能靠再拉近鏡頭或多調一個白花高光解決。

下一個coherent slice應以**後牆—窗側的大形、混合展示層次與室外深度／材質受光**為全景優先，保留C21傢俬／路徑／穩定鏡頭及已過中央桌標準，不加新SKU／故事／玩法、不用零散小物充當整體進步。此處只識別差距，等待本固定checkpoint覆核；整體原圖品質與畫風仍未接受。
