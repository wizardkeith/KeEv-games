# 固定8-bit sRGB色表：原master保護下修正本機1 ULP差異

本輪起點是本機 `f0492e66f30a076bed0aede48a1ff219e162756c`。Git登入／push hold維持，這是額外本機提交，不代表遠端已同步。

## 先證明不改既有資產

- 唯讀掃描91個既有GLB master、561個材質，其中342組明確linear-sRGB材質值與此共享轉換有關。
- 187個byte輸入由既有master的直接linear factor精確約束，無衝突；其餘69值保留修正前Node24.19.0的公式輸出。不是任意round或改gamma。原native橡木的 `v*.40+peak*.60` adapter完整保留，post-tint的額外捨入不能誤當base decode衝突。
- 候選bundle只在記憶體替換轉換函式，禁用exporter寫檔段；44個相關現用GLB重建全數與master逐byte相同。通過後才修改實際來源；再以實際來源重建44個，仍全部相同。
- 所有91個原GLB SHA不變；整個tracked masters/public資產集合458檔byte不變，沒有新增或覆寫master/public資產。R6 .blend/GLB及原reference不變，沒有新美術或畫風接受。

## 最小修正

`src/art/materials.ts`保留原格式驗證、material IDs、alpha、roles、roughness及介面，將8-bit channel decode改為共享唯讀 `src/art/srgb8-linear.ts` 查表。執行時不再用實作近似的Math.pow。

256值JSON digest：`4210c27d186eac98ef2b3ba3c256bf146fe6857ac5314a32c209794366164fe4`。

相對本機舊公式，唯一變更是byte41（VisitorA `#4F3729` 藍色）：

| 來源 | 值 | binary64 |
| --- | --- | --- |
| 原accepted master／固定表 | 0.02217388479338738 | 3f96b4c0380d2dee |
| 本機舊Math.pow結果 | 0.022173884793387385 | 3f96b4c0380d2def |

原 `native-characters.test.ts` 的完整SHA及bytes比較完全保留，現在通過；沒有改成epsilon或忽略JSON差異。另加2項回歸檢查，鎖完整256表digest、byte41 exact bits，並用原native adapter逐一deepEqual所有342組既有linear master factors。

ECMAScript允許冪運算採實作近似結果；這個改動移除該計算的執行環境差異，不改其他JSON數值或三角函式。[Number::exponentiate規格](https://tc39.es/ecma262/multipage/ecmascript-data-types-and-values.html#sec-numeric-types-number-exponentiate)

## Provenance處理

- 四個exporter的來源清單補入新色表；Day1、native characters、native products及environment的四份外部receipt精確更新材料／exporter來源hash，並加入新依賴hash。沒有重設GLB/master hashes。
- `assets/masters/native-v3/environment-v3.json`內嵌的是原snapshot來源指紋，仍逐byte保留（SHA256 `0c7f9c21d07808d07a040c55acc72a087003ee64bf1db28ce413a34a2dd10210`）。外部environment manifest新增明確compatibility說明：內嵌map是原master來源，外部 `manifest.sources`是現在經驗證相容的實作。沒有假稱凍結master已重寫成新來源。
- 本輪沒有執行完整environment JSON exporter來刷新內嵌provenance；那會產生另一份metadata snapshot。此處聲稱的是原master保留、recipe/material相容及44個GLB精確重建，不聲稱舊JSON的內嵌來源hash等於新程式。
- 測試自行改寫的歷史locomotion evidence已另存本輪結果，原歷史檔復原。既有source／asset保護斷言均未放寬。

## 實跑結果

- **304／304 tests pass，0fail／0skip**：原302項不改，新增2項。
- build（含原TypeScript）、validate、replay、asset-check、作者entry strict TS、R6 validator全部exit0。保留原Vite large-chunk warning；R6仍49,368tri、0error／0warning、29個accepted檔保護。
- 同一Windows機的Node24.19.0與隔離headless Chrome156實際載入256表，JSON digest及byte41 exact value相同。**沒有跑Linux A/B，不作該聲稱。**
- 修正後再次跑studio、真實game authoring及production preview：R6資產HTTP body與source/dist同SHA，0pageerror／requestfailure；全新Sandbox買3杯、reload、Low→High、獨立Normal隔離通過。沒有附加原玩家profile或桌面GUI輸入。
- headless browser及localhost server均已關閉。依賴／store／最新dist及全部未同步證據保留；沒有登入、push、PR、merge、公開或Unity操作。

完整證據在 `docs/reviews/evidence/material-determinism-20261028/`。來源與測試均於Windows執行；其他OS仍需實跑核對。
