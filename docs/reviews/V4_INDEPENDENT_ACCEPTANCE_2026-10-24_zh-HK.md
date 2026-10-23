# v4 獨立驗收摘要

審查時間：2026-10-24T01:54:58+08:00（Asia/Hong_Kong）。結論：**未接受為已完成原批准視覺目標嘅 v4 最終交付**；功能、資料保存同包裝驗證通過。

- Reviewed application source: `220a7165d67ecb5214587a305f55603ffc285a7e`。
- Baseline: `10c070c8121aecfd9e3e1ac9d0db213947416a08`（public v11 / Native 3D v3.1）。
- Handoff base main: `c6b1254ccc12cea382aaad06120eefa3567d0bd8`；其後繼同步文件已保留。
- 完整 8 頁 PDF 已交付使用者：`KeEv_v4_Independent_Acceptance_zh-HK.pdf`；Library reference `libfile_54a22507d7d48191aa75be8fd4d4bfe2`。此 ID 唔授予公開存取權。

## 嚴重程度排序

### P1 — 美術品質未達已選 Misaki 目標

位置：`src/art/native-characters.ts:39`（bob）、`:83`（Misaki 髮束）、`:100`（衣服／圍裙）、`:127`（肩袖／手臂）；`src/art/native-view.ts:48`（光影 intent）、`src/world.ts:45`（材質接入）。以上行號固定於 reviewed source。

實際打開 approved PNG、完整 Bible 嘅三張嵌入圖、候選 High 正常遊玩／店員鏡頭及新 Web/GLB 圖。角色身份、色系同約四頭身保留；CCW 方向已修好，Web 同標準 GLB 一致。但髮束仍有硬邊分件感，肩袖／袖口及圍裙似硬片，場景材質與暖內冷外層次仍比批准目標粗簡。呢個係可見精緻度差距，唔係要求同生成圖像素一致、增添未授權花朵／SKU，亦唔係將已修好嘅 winding 再報成失敗。

重現：候選 preview → 新 Sandbox → High → 正常小店／店員鏡頭；另開 dev-only `/tools/v4-mesh-review.html`，按 `tools/v4-render-qa.cjs` 比較 front／45° serve／back，同 `docs/codex-v4/reference/Approved_Visual_Target_Misaki.png` 及 v4 prompt §6.2–6.4 對照。

### P2 — 鍵盤入貨後焦點流失

位置：`src/main.ts:60`、`:74`、`:102`；`src/ui/stock.ts:13`。

重現：新 Sandbox → 入貨 → 木托盤數量 1 → Tab 到「入貨 1 件」→ Enter → 等 `aria-busy=false`。實測 `document.activeElement.tagName === 'BODY'`，冇可見焦點。下一個 Tab 仍去同一 `off.tray` 嘅 `stock-picker`，所以係中等 UX/accessibility 缺陷，唔係完全無法用鍵盤。busy repaint disable 原按鈕；按鈕冇 id，現有按 id 恢復焦點路徑無法復原。預期完成交易後保留可辨識焦點或移到同卡片下一步。

數量欄 DOM、raw text、caret、搜尋、draft、捲動保留本身通過；唔好把此缺陷誤報成所有輸入都重建。

## 今次新跑結果

| 命令／檢查 | 新結果 |
| --- | --- |
| `npm ci`（使用可寫 temporary cache） | 通過；初次預設 home cache 不可用，改暫存 cache 後解決，無改 lockfile |
| `npm test` | 142 passed / 0 failed / 0 skipped；約 7.67 秒 |
| `npm run validate` | 0 errors；10 offerings、5 locales、174 keys/locale |
| `npm run replay` | cash 5020、stock 4、net 180、units 6 |
| `npm run asset-check` | 通過；另獨立驗證 18 個 current GLB：0 errors / 0 warnings |
| `npm run build` | TypeScript＋Vite 通過；保留既有大 chunk 提示 |
| 文件列明嘅 texture／character／environment／product／fixture generators | 在隔離還原副本重建；比較嘅 141 個資產／public 檔 byte-identical，product master/manifest 亦另行重生核對 |
| `node tools/v4-render-qa.cjs` | 11 組新實際 WebGL Web／標準 GLB matched-camera images |
| `git fsck --full`／ancestry／protected paths | 通過；11 個 baseline commits 保留；core/platform/content/narrative/source-inputs/.openai/package manifests 同 v11 完全一致 |

新 browser walkthrough 用 production build、隔離 Sandbox 同真正命令；重跑既有 harness 時移除最後 Normal 身份註冊段落，另自寫慢寫入／中斷／焦點／lifecycle probes。沒有用玩家存檔。

- 清單下方逐件不同 quantity；雙擊只扣一次；restock 保留架位；原地空架／替換／搬架；換下商品庫存保留；非法／缺錢；缺貨 filter 暫留；真 export/import/reload：通過。
- 320/375px × 五語系十組實際選架提交；landscape 鍵盤及額外 320×420 可用 viewport：通過；呢啲唔係物理手機鍵盤測試。
- 慢交易：原本 3 件買入，連按後再改 draft／切另一商品，仍只買原先 3 件、只加一個 command。強制中斷獨立 QA transaction，舊完整 snapshot 保留並顯示 storage error。
- 新 Visitor A bag transfer 60.086秒、離店 84.886秒；未剪輯 gameplay 88.36秒，1000×760。新 **High Visitor B** 亦接袋同離店成功；未剪輯影片 442.52秒，1200×900；單袋 parent 為 Visitor B named socket。
- Low／Minimal／Reduce Motion 已檢查；Reduced Motion 清空 active props。20/30/60Hz 足部／腿長測試通過，2mm 支撐腳門檻保留。新實際畫面見到啟停、轉向、看貨、包裝及 handoff，但唔以 correctness 宣稱自然表演或美術完成。
- 原兩條交付影片 hash 匹配 tracked metadata，實際作時序抽幀檢視；不冒稱連續物理裝置播放／性能接受。

## 交付包獨立核對

Library 兩輪搜尋無結果後，從本雲端實際現存 delivery artifacts 找到 source A/B、Web ZIP 同 receipt。無捏造下載或其他 executor 本機路徑。

| Artifact | SHA-256 |
| --- | --- |
| `LittleShop-v4-source-A.zip` | `9cde43e1fb7c502f735c3ff29d2e053874cb05b404296f0c5dfd6a3a054f19f4` |
| `LittleShop-v4-source-B.zip` | `bc819e85564df26360b555e0888f8ea1b2f0a9306b358f1bd056b156379d1f1a` |
| `LittleShop-v4-Web-Candidate.zip` | `98dc97cdc387c99c1b8157edb2f4afa3956eb3c1760aba004a18b3bbf02a36b9` |
| Reconstructed `source-history.bundle` | `2234d4a07e10c2cde5b05942862362842a0120a72411aefac7e7ac73065419ef` |

CRC、重複名稱、manifest size／SHA 全通過；`git bundle verify`、以 `git clone --branch main` 真還原到 reviewed SHA、691 個 source 檔 manifest/Git blob/SHA 全一致。Web ZIP 116 個 `dist` 檔同今次 clean build byte-identical。

## 尚未驗證與建議

Chromium WebGL2／ANGLE Vulkan SwiftShader 係**軟體渲染**；影片編碼幀率與上述時長唔等於 target-device game FPS。真 hidden-tab return 未驗證：headless 開另一頁／bringToFront 仍 `visible`，無 visibilitychange；真 lifecycle frozen→active 後 snapshot 不變，相關 source/unit/integration tests 通過。此係環境驗證限制，非自動審批拒絕。

物理手機 GPU/FPS、Safari／iOS／Android 鍵盤、安全區、音樂／SFX／語音、native Unity/C#/URP 尚未驗證。rig 仍為 articulated rigid hierarchy，唔係 embedded skeletal clips；simulation 仍 `PORT_REQUIRED_FOR_UNITY`。

建議下一輪只修 P1 角色／材質光影品質及 P2 焦點，再做同鏡頭 target comparison 同 A/B 真結算互動重驗。保留已通過經濟／存檔／stock UX；不擴充新內容／重平衡、不自動發佈，無需使用者端 Unity／Blender。

本次只審查同補交接文件；無 application source/assets fixes、merge、Site save/deployment/access/identity change，無觸碰玩家 Normal save 或本機 Unity。public Site 仍按先前核實 v11／Native 3D v3.1 記錄，無新部署聲稱。
