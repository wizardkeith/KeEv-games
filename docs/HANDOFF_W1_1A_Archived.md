# 《下一站・小店物語》W1.1A — 美術精修與輕量特效候選

2026-10-21。已實作、可玩的美術候選；**3D 美術／動態待實際畫面確認**。原 Game Bible v0.1、Part II 和三張視覺參考仍是基準；原始資料保留於 source-inputs。未開始完整東京故事、Day 4 雨天、Momo／正式角色或商業發行。

## 同一 Site 與保存

- Site：appgprj_6ad82a08ed2881918ebcc2dd206a122d
- 網址：https://next-stop-little-shop-w1.starry-ridge-5482.chatgpt.site
- 本輪起點：W1.1 commit `f48dc15030fd89af0fe99e00f890ba204bdc0185`、Site version 2。
- 本輪讀取到目前 access 為 public、policy revision 2；沿用此設定，沒有還原成舊 HANDOFF 記錄的私密設定。
- 新 source commit、實際 Site version、部署 ID／結果以隨 checkpoint 的 DELIVERY_RECEIPT.json 為準；獨立下載版 HANDOFF 亦附該實際回執。

經營核心、依賴／lockfile、schema 2 / ts-w1-2 沒有改動。原 IndexedDB `next-stop-little-shop-w1`、`saves`、`shop.w1.normal`／`shop.w1.sandbox`、CAS、command dedup、遷移、復業支援、歷史損益及 W1.1 修正全部保留。本輪互動驗收使用 compile-only 美術審查資料庫及獨立模式／草稿／語言／偏好 key，沒有匯入或覆寫現有正常／沙盒存檔。Minimal effects 只儲存在獨立 presentation preference，不寫入 Snapshot。

## 已實作

1. **曲面光照來源修正。** 橢球、漸變橢圓圓柱和非均勻 torus 法線使用正確縮放與旋轉，正規化並檢查繞序／退化三角形。重新匯出 15 個 W1.1A GLB，舊 W1.1 masters 和證據保持 hash 不變。
2. **固定瀏覽站位。** 兩位通用顧客一開始便有不同的靜態位置，與可見性、局部動作分開；不再以 sin/cos 移動角色根節點。標準模式只有輕微頭部／手臂動作；Low、最少特效或減少動態時保留正確靜態姿勢。不是滑行或假步行。
3. **美術細節與材質。** 調整暖窗光與柔和陰影，保持 35–45° 有限軌道鏡頭。木、紙、布、陶、玻璃、金屬、皮膚等穩定材質角色共享 runtime／GLB 參數；同色異材質不再誤合併。筆記簿頁厚／書脊、鉛筆木尖／金屬箍、真正空心陶杯、布袋縫線／提手；通用角色眼睛／髮型／圍裙／手部細節已加入。沒有把通用角色冒稱正式角色。
4. **易用介面。** 五個原創 SVG 導覽圖示，四件主商品縮圖、柔和邊界／陰影、清楚鍵盤焦點。面板／提示採 160–180ms 短過渡，輸入與操作不等待動畫；減少動態／最少特效停用過渡。保留草稿、焦點、捲動、選架及錯誤處理。
5. **克制回饋。** 選架短淡入後穩定紫邊；成功陳列的 200ms 小幅落定；真實成交／補貨／復業支援各用不同收據色與文字；原樣品成功儲存後用獨立局部開箱代理，完成卡立即可用並可略過。重新載入、匯入、切模式不補播；沒有假硬幣收入或 NPC 假成交。
6. **唯一環境特效。** 窗邊最多 8 粒稀疏微塵，無新貼圖；Low／最少特效／減少動態關閉。沒有空杯蒸氣、bloom、DoF、全畫面發光、雨幕或動態反射。既有提示音維持 opt-in，音量 .12，未加新音效。

## 已確認與待確認

| 類別 | 本輪結果 |
|---|---|
| 核心／儲存與新風險測試 | **43 PASS、0 fail、0 skipped**：原有 30 + 法線／材質等 8 + presentation／隔離等 5。 |
| 內容／字體 | 10 Offerings、五語言各 168 keys；結構檢查 PASS。字型原始 TTF／OFL 保留，只更新子集。原生語言審校仍待做。 |
| GLB | 新 15 件共 491,144 bytes；Khronos 0 error／0 warning；15/15 NullEngine 獨立重載。舊 original counter／skin fixture 亦重新通過檢查。**不是實際渲染證明。** |
| 建置 | TypeScript／production build PASS；Babylon 8.32.0 等精確依賴不變，既有 >500KB chunk 提示未隱藏。production 不含 review key／資料庫字串或本機 QA 頁。 |
| 真正介面／IDB | 隔離 fixture 實際走過命名→入貨→架 2→營業→成交→開樣品→reload，再補貨→改價→成交→報告。重載完成卡／現金保留，無重播。 |
| 草稿與偏好 | 提示消失後未提交 1230JPY 保留，輸入仍聚焦、scrollTop 268；Minimal effects 重載保留，不增加經營 revision。 |
| 模式 | QA normal 與 sandbox 分開；切回 sandbox 仍為原身份、¥52,490／revision 9。既有正常／沙盒保護亦有原測試及新隔離測試。 |
| 版面 | 五語言 ×320／375／430／1200 CSS iframe 共20組，無水平溢出、面板在界內；320px 導覽最小58×54 CSS px。不是實體手機。 |
| **已實際 3D 渲染確認** | **沒有。** 本輪重新測試 supported preview，Engine 啟動明確回報 `WebGL not supported`。只有 UI-only 證據；未取得 3D 前後圖或動態短片。 |
| **待確認** | 真正曲面受光、材質高光、陰影／遮擋、商品可辨性、人物與家具實際穿模、局部 FX 觀感、OS 減少動態切換、動態略過／隱藏／模式效果、手機觸控與幀時間。 |

實際第二段報告：收入 ¥7,690、已售成本 ¥3,200、人工 ¥600、租金 ¥400、營運費 ¥200、淨利 ¥3,290；現金 ¥52,490、存貨成本 ¥800、累計入貨付款 ¥4,000。買貨現金與成本費用仍分開。完整 browser 紀錄：evidence/w1_1a/BROWSER_REVIEW.md。

## 輕量特效與效能量度

單一 render callback，dt 上限 50ms；隱藏頁面取消短暫演出、暫停環境時間，不追補；scene.dispose 會清理 clock、render loop、listeners／observer。主要特效上限 1、queue 0；固定 FX pool 12 meshes（8 微塵、1 收據、3 開箱代理），沒有新增動態燈、shadow caster、render target、貼圖或 dynamic texture。參數／觸發／降級見 assets/authoring/w1_1a/vfx.json 與 docs/VFX_W1_1A.md。

來源幾何盤點（包括停用物件，**不是 draw calls／GPU／FPS**）：舊 empty／max-stocked 為 123／171 meshes、35 材質身份；新為 173／233 meshes、64 材質身份，最重陳列盤點 28,378 vertices／32,736 triangles。增加包括商品細節、分材質及角色語義部件。Low 先停微塵／短特效／小動作，再降至1位顧客、1.5硬件縮放及隔幀 shadow refresh；Auto 保留90個可見樣本且p75>35ms後降Low的政策。

本機 production files：W1.1 **3,634,471 raw／1,449,141 gzip-9 bytes** → 本輪 **4,183,538 raw／1,588,367 gzip-9 bytes**。總量包括保留的新舊 GLB 和擴充字型子集；runtime 從共用 recipe 建構，沒有下載所有 GLB 作場景。這不是首次載入、實際網絡傳輸、啟動時間或 FPS；以上仍無可用實測值。

## 資源來源與 native 適配

原始 Bible／規格／參考、src/art、SVG 縮圖／圖示、GLB masters／Web copies、字型／OFL、原 WAV、授權、hash、測試和證據全部保留。新資源為 project-original procedural geometry，沒有新增外來模型／圖片／音樂。W1.1 authoring 原版另存 source_snapshot；W1.1A 清單及數值材質見 assets/authoring/w1_1a、docs/ART_W1_1A.md。

GLB、recipe、材質角色、局部 pivots、VFX ID／參數可以用於後續 Android／iOS；Babylon PBR／shadow、camera／input、IndexedDB、HTML UI、時間／聲音／pool 仍需 native adapter。通用角色不是正式 rig／步行動畫管線。Unity／URP／IL2CPP／實體裝置未驗；C# proof 保持凍結，TypeScript 核心仍標記 PORT_REQUIRED_FOR_UNITY，未聲稱 native 版本已完成。

## 重建、交付與回退

Node24，安裝精確 lockfile 後：`npm test`、`npm run validate`、`npm run asset-check`、`node tools/validate-art-w1_1a.mjs`、`npm run build`。重匯 GLB：`node --import tsx tools/art-w1_1.ts`；新 exporter 只寫 w1_1a。效能盤點與 VFX 資料的重現工具在 tools/。

安全本機審查：`VITE_ART_REVIEW=1 npm run build` 使用隔離資料庫／偏好，不要用匯入覆寫既有 sandbox 擺拍。發佈必須再用普通 `npm run build`，review flag 不在 production 開啟。

完整來源 checkpoint 排除憑證、node_modules、快取、build output 及玩家存檔；附實際發佈回執。前一版 W1.1 可從 Site version history／commit f48dc15030fd89af0fe99e00f890ba204bdc0185 回退，只回退程式／資源，不匯入舊玩家存檔或更改 access。舊交接已封存於 docs/HANDOFF_W1_1_Archived.md。

後續只需最多三種畫面：Zen 全景、架2＋面板、商品／角色近景；方便的話其中一份可為10–15秒短片。簡單指引見 docs/W1_1A_Visual_Check_zh-HK.md。這些是下一輪觀感調整依據，不是本輪交付的前置條件。
