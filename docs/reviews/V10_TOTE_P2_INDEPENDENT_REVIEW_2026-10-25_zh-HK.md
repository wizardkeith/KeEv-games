# V10 布袋 P2 獨立複核

2026-10-25T17:49:50+08:00。**有條件通過技術增量發佈，布袋 P2 release hold 已解除。** 本次範圍未見新增 P1/P2；原目標美術品質／風格仍未接受，內容擴張繼續凍結。Parent 協調整合／發佈；本 reviewer 沒有修改實作、合併或發佈，公開仍 V16。

固定 candidate **`be2486c45c8a5b0ea8c6660a96915c0e0b07e45e`**，application **`b06247fcae6d02a69e8cff56e2ace124f4bfc883`**；二者 src tree **`219e499f7421cdb7896a6e01fea825d53f269b54`** 一致，candidate 之後只有交付文件／證據。先讀最新遠端 AGENTS／PROJECT_STATE（main a15ec610）、[作者修訂](https://github.com/wizardkeith/KeEv-games/blob/be2486c45c8a5b0ea8c6660a96915c0e0b07e45e/docs/V10_TOTE_P2_FIX_zh-HK.md)，保留[原拒收與目標差距報告](V10_INDEPENDENT_REVIEW_2026-10-25_zh-HK.md)。沒有使用未更新的舊 Library ZIP。

## P2 實際接觸／像素複核

來源是 `src/art/products-v10.ts:23` 呼叫新 `src/art/tote-v10.ts`：袋厚置中並重建向外皮面，按真正布面三角形設配件；共享 `sculptCloth` 未改。沒有把舊 probe 的固定Z值當作新接點。獨立[場景射線探針](probes/v10-tote-ray-review.ts)使用 Babylon `Mesh.intersects` 對真正 indexed meshes 求前／後交點；以實際 swept-ring vertices 驗四根部及五十縫線環，分開於作者的 `surfaceZ` 實作。

| 項目 | 舊 P2 | 本次獨立複核 |
|---|---|---|
| 印畫 | 中心沿Z離袋面51.217mm | **285點**：前面約0.600mm偏移，紙背至少伸入支撐0.050mm；實體0.65mm紙層接觸，非浮空平面。 |
| 左右縫 | 中點沿Z約80.305／80.051mm懸空 | **50個環**中心最大距布面1.14315mm；1.5mm半徑的實際環頂點前後跨過支撐，最小背向穿接約0.845mm。 |
| 前後四個手挽根 | 舊前左根約59.457mm懸空 | 四根分別接正確前／後面，最大中心殘差約6.123e-11m（遠低於0.001mm），非只驗前左一根。 |

[實測JSON](evidence/v10-tote-independent/independent-ray.json)。引擎 picking 採紙層10µm、縫／根2µm容差；初版 harness 空material會退回bbox，已加真實可拾取材質；超嚴格0.1µm檢查曾出現0.324µm picking偏差。另改以縫環實際頂點跨面測接觸，因管端中心同XY射線並不必穿過側面接觸。這些是獨立探針設置／判據修正，沒有改產品幾何、作者測試或把厘米級舊缺陷放寬通過。

已自行重拍正常back-face culling／同相機／同PBR的真3D正面及側面，[BEFORE正面](evidence/v10-tote-independent/before-front.png)、[AFTER正面](evidence/v10-tote-independent/after-front.png)、[BEFORE側面](evidence/v10-tote-independent/before-side.png)、[AFTER側面](evidence/v10-tote-independent/after-side.png)。舊浮空印畫、側線、手挽分離消失，袋面朝向正確；貼紙仍見多邊形／接縫痕及簡化材質，屬未完成美術品質，不把本修訂叫作目標接受。Studio是中性資產檢視，另有下列標準遊玩證據。

## 本次新跑的驗證

- `npm test` **174 pass / 0 fail / skip0**；`npm run build`、`validate`、`replay`、`asset-check` 全通過，包括既有圍裙密集射線與角色接觸回歸。
- `tools/v10-audit.py` 實際重建245 assets/public檔，hash不變；276protected檔及原11commit ancestry通過。全139保留GLB逐一validator零errors/warnings；`tools/v10-tote-glb-parity.ts`重開布袋GLB，**21,144**個position/normal/UV/index值匹配actual Web/nativeGrouped，最大float差2.973e-8。
- 不只相信scope manifest：與486bc360比較受保護源碼／其他fixture GLB，並將old/new商品JSON逐SKU深比對，**其餘九款 recipe parts及GLB完全一致**；sharedcloth／人物與圍裙／UI／經濟存檔／動作接觸solver／會計來源不變。Studio的before recipe亦與原受審JSON master一致。[範圍核對](evidence/v10-tote-independent/scope.json)。
- 自行執行`tools/v10-tote-capture.cjs`（只在隔離副本改本地QA埠）及`tools/v10-tote-play-qa.cjs`。真production High、fresh Sandbox購入2袋：stock0→2、內部cash5000→4840（UI JPY50000→48400）、一個購買command，陳列／reload全snapshot一致、隔離Normal不變、0pageerrors。[39.48秒原始完整錄影](evidence/v10-tote-independent/purchase-place-reload-39s.webm)、[連續取樣](evidence/v10-tote-independent/play-sequence.png)、[結果](evidence/v10-tote-independent/play-results.json)。實際影片及前後像素已看，沒有用測試數代替外觀。
- 新tar **135檔／6,304,337bytes** 全部安全唯一路徑，同fresh build／hosting／receipt逐一byte match；重新執行`V10_PACKAGE_OUT=<isolated output> python3 tools/package-v10.py`再用`cmp`，整個deterministic gzip archive亦byte-identical。SHA256 **`4b6d1d360489bd0034d12202f71de32c9b37af5f99110e241c3d67c47dc8297a`**。[本次封包核對](evidence/v10-tote-independent/package.json)。舊LibraryZIP／舊V10封包仍是未修原候選，不可當新版本發佈來源。

## 保留界線／下一步

本次只有布袋資產／接點及衍生bundle變更。沿用有效的上一輪五語55案例歸屬、完整138.76秒High收銀、真實批次毛利／queue/reload、舊QA Sandbox相容等證據，沒有冒稱本次重跑全部。所有互動／經濟／存檔來源byte-identical，新174整套測試另已重跑。

原P1目標美術仍未接受：髮殼、面／肩頸／衣料、自然度、豐富陳列／植物／窗外深度及光材質差距保留；不因一件接點修好而解除內容凍結。45秒High idle-work close-up仍未成功觀察；舊V16本機187秒、兩次180秒失敗仍是歷史失敗。SwiftShader／編碼fps不是實機GPU/FPS／Safari／實體手機鍵盤／音訊／native驗收；真正OS hidden-tab仍未驗證。三張placement圖未讀，bonus HUD僅planned/handoff-only；沒有重試先前被拒的localreview.html報告瀏覽路徑。

建議 parent 以此固定新candidate／新tar作後續增量整合發佈，再做隔離Sandbox裝置smoke；沒有本次新增軟件阻擋要求使用者先改本機Unity。開始時執行環境暫未就緒，稍後正常恢復，所有本次操作已完成，無新的denied／pending／uncertain外部寫入。只更新審查文件／證據及PROJECT_STATE；不改app/assets、PR、merge、deploy、Site、玩家Normal、Unity／Blender或權限。文件正常push/readback的SHA在外部回報。
