# W1.1B 集中3D美術候選 — 交接

2026-10-22（香港）。延續已驗收UI v6及W1.1A1 Closeout；本輪只完善既有靜態小店呈現。**真正BEFORE已看；已完成source候選，AFTER觀感待真實畫面確認。**

同一Site：appgprj_6ad82a08ed2881918ebcc2dd206a122d
URL：https://next-stop-little-shop-w1.starry-ridge-5482.chatgpt.site

開始前正式source helper核對canonical為b093c50fa13cfca80c8b10fdfd96e716114a2d7d，Site v6／public／policy revision2，tracked tree clean，沒有較新工作被覆蓋。最終source commit、Site version及部署結果見交付包內真正的DELIVERY_RECEIPT.json；這是commit後產生的交付metadata，不冒稱已在同一Git commit內。

## 本輪處理

| BEFORE問題 | 來源候選改動 |
|---|---|
| 整體灰淡，牆／木／人物明度相近 | materials.ts統一sRGB→linear PBR色彩轉換，runtime與新版GLB同步；recipes.ts分開暖木地板、桌面、支撐及頭髮／皮膚／圍裙色塊 |
| 接觸層次弱 | 查出桌腳／櫃身底部實際離地約14.1cm，延伸原有支撐至地面；鞋底、盆栽及商品落點使用地板／桌面基準。既有1024陰影調低偏移，標準用PCF medium，簡約回到原低成本路徑 |
| 商品／人物細、留白較多 | direction.ts收近及重新平衡焦點；aspect1.6半徑15.8→14.3298545，約9.3%收近。保留有限角度／zoom及原viewport避讓，依完整房間邊界保護窄屏構圖 |
| 材質識別不清 | 保留原有木／紙／布／陶roughness與透明面政策，透過正確線性色彩、色階、光線與接觸改善；沒有重開杯口／杯把／提帶修復 |

詳細設計、數值與可攜／引擎專用界線見docs/ART_W1_1B.md。新assets/authoring/w1_1b/presentation-intent.json保存色彩、光源關係、構圖邊界、地面及降級意圖。沒有新增光源、貼圖、後製、天氣、步行、正式角色或故事；既有FX常數／生命週期／Minimal／Reduce Motion保留。

## 已看過的真正畫面

成功開啟三張原PNG：Zen、入貨與已上架畫面；亦查看原MP4在12s及18s的抽幀。不是完整逐幀播放／GPU測量。原PNG與兩幀保存在evidence/art_2026_10_22/before/，before-evidence.json保存來源、hash及影片參照。影片19.866633秒、1862×1206、錄製30fps；錄製fps不代表遊戲fps。

因此，不再說「沒有3D證據」。本輪after仍未目視：最終候選的支援managed Chrome預覽再次回報Error: WebGL not supported（2026-10-21T17:39:44.751Z，即香港2026-10-22 01:39）。正常fallback UI可用，沿用隔離審查進度¥51,400，沒有操作經濟、匯入／重置、改玩家DB或注入假庫存。

## 真正完成的驗證

- **62 tests PASS，0 fail／skip／cancelled**。原57具名案例保留，新增5個：IEC色彩轉換／alpha、實際GLB factor一致性、Babylon RH鏡頭投影、家具／人物／商品實際落點、歷史資源／來源hash。
- 鏡頭測試用真實Babylon view/projection矩陣，在5種viewport與每種231個yaw／beta取樣檢查房間邊界；這是headless數學驗證，不是實拍構圖、遮擋或選取舒適度驗收。
- 現行runtime材質工廠與獨立匯入GLB保持一致；原杯口／杯把射線案例繼續讀已接受的W1.1A1 GLB，未刪去原測試。
- 新15個GLB共503,072bytes；Khronos結構檢查0errors／0warnings；NullEngine獨立匯入15個、77個材質政策通過。這些不是3D觀感或native驗收。
- content validator PASS：10商品、五語各174keys、品質及Unique含義不變。TypeScript／正常production build PASS；原有大chunk warning保留。
- source inventory：空店mesh分組173→174、滿陳列233→234；材質身份64→66；opaque caster分組144→146／204→206。頂點／三角形數不變；新燈／貼圖／render target均0。只是來源成本盤點，並非GPU／draw calls／FPS。
- 主程式／boot、UI v6、五語、字型、core、storage、時間、catalog、schema2／ts-w1-2、玩家進度及package/lockfile完全不變。scope-preservation.json記錄範圍。

## 資源與可重建來源

完整可回復來源、交換素材及資源歷史保存在同一Site canonical Git checkpoint。新15masters：assets/masters/w1_1b/；15相同public交換副本：public/assets/w1_1b/；manifest保存hash／sRGB／linear factors／材質意圖。runtime依然使用共用recipes建立場景，不新增GLB下載依賴。

舊W1.1／W1.1A／W1.1A1素材、manifests及證據不變。已接受W1.1A1的精確recipes／materials／geometry／world／exporter來源另存assets/authoring/w1_1a1/source_snapshot/，帶原commit及hash。舊exporter改為明確讀凍結來源，避免今後誤用新色票覆寫舊masters。

Node24＋原lockfile：npm ci → npm test → npm run validate → npm run build。
本輪交換檔：node --import tsx tools/art-w1_1b.ts。
獨立匯入：node tools/validate-art-w1_1b.mjs。
Unity／URP、Android／iOS仍需adapter及裝置驗證；沒有換引擎或要求安裝native工具。

## 發佈及下一份畫面

沿用同一public Site及網址，不搬移／重設玩家存檔。交付證據包附真正部署回執、目前manifest／intent、實際測試及before參照；它是本輪報告包，完整source由canonical Git保存，不重製封存Closeout證明包。ZIP完整關閉後用正常reader核對CRC／完整清單／各項hash，再提供大小與SHA256。

候選after最少比較：用平時能看3D的原網址、相同進度／viewport／畫質，拍一張Zen全景及一張架2＋入貨／店務。盡量維持before角度；不需要重新買貨或重置。先看亮暗細節、腳底／商品落點、全店入鏡與人物色塊；方便才補一次普通互動短片看既有FX。沒有錄影前不再加強特效。

回退點：v6／b093c50fa13cfca80c8b10fdfd96e716114a2d7d，只回退程式，不回退存檔或更改public。已驗收UI交接完整封存在docs/HANDOFF_UI_v6_Archived.md。這輪候選完成後停在after觀感門檻，不自動展開故事、全面重設計或新內容。
