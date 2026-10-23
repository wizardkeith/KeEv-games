# v5 獨立增量發佈審查

時間：2026-10-24T03:00:26+08:00（Asia/Hong_Kong）。**建議：有條件通過安全增量試玩發佈；未代表最終參考圖美術接受。** 無發現需阻擋今次 incremental release 嘅軟件問題。由 parent 統籌原 Site 嘅整合／發佈，審查者無合併、部署、修改 application source 或改動 PR。

## 固定來源

- Draft PR：https://github.com/wizardkeith/KeEv-games/pull/2 。Reviewed tip：`de0a56b7820e1f5696cf30be2d73c50bc7844863`。
- Packaged source/evidence：`566e27ae3db5880490a0d2e541dff7f6f34a3bf0`；tip 只多兩份 delivery/library-status receipt。
- App checkpoint：`021e23a85c0212f6e780a5d5af4ebe70c4fadf76`。三者 `src` tree 均為 `33a8cdb4289c12e62b2c772245ee547a00948168`。
- Main progress read at `2cee5d178289865738ec250c6d71e7d4f2432fa0`。v4 baseline review 同未變動 core/motion evidence 有保留重用。

## 新跑驗證

| 檢查 | 獨立結果 |
| --- | --- |
| Pinned `npm test` | 144 passed / 0 failed / 0 skipped，約 14.08 秒 |
| `npm ci`、`npm run build` | 通過；TypeScript/Vite，既有大 chunk 提示保留 |
| `npm run validate` | 0 errors；10 offerings、5 locales、174 base keys each |
| `npm run replay` | cash 5020、stock 4、net 180、units 6 |
| `npm run asset-check`＋獨立 current GLB validation | 通過；18 GLBs，0 errors / 0 warnings |
| 所有文件列明嘅 texture/hair/character/environment/product/fixture generators | 207 tracked asset/public files byte-identical |
| Clean build 對 delivery receipt | 119 runtime payload size/SHA-256 全部一致 |
| Protected paths/history/fsck | 230 protected files 無變；原 11 commits 保留 |
| Production stock lifecycle browser run | 新真 IndexedDB／鍵盤／touch-emulated flows 完成，page errors 0 |
| v4 export → v5 import → reload → purchase | 真 QA export 完整保留 cash/inventory/shelves/tutorial/watermark/ledger/identity；新入貨成功 |
| Fresh High production／Web-GLB render | 11 組新 paired render 及真 High 店員鏡頭；圖像已檢視 |

入貨改善可見：逐商品數量／單價／明確總額／剩餘現金、1/5/10/20 設定值、可負擔／庫存上限、原地選架與保留原貨提示。v4 P2 已修：Tab→Enter 後保留 `buy-off.tray`，下一 Tab 去同商品 placement；選架後 focus 返回 persistent same-card action。

新慢寫入／雙擊／Enter／後續改 draft 仍只買原 3 件、加一個 command。強制 transaction abort 保留完整 snapshot，顯示 recovery、無上一宗 success toast。Raw `003`、DOM node、caret、focus、scroll 保留。十組五語系 320/375×420 真 buy/place touch-emulation、landscape、reload、frozen→active 通過；唔冒稱真手機鍵盤或 hidden-tab。

核心、storage/schema/namespaces、catalog、layout、story predicates、腳掌／route／handoff contracts、hosting identity、package/lockfile 無改動。因此重用上次有效未變基線證據，而非重新做整個 v4 驗收。

## 非阻擋發現與美術判斷

**P3 文案：後續銷售仍叫「第一步」。** [day1-copy.ts:15](https://github.com/wizardkeith/KeEv-games/blob/de0a56b7820e1f5696cf30be2d73c50bc7844863/src/narrative/day1-copy.ts#L15)、英文 `:73` 及簡中 equivalent，用同一 sale key；[main.ts:87](https://github.com/wizardkeith/KeEv-games/blob/de0a56b7820e1f5696cf30be2d73c50bc7844863/src/main.ts#L87) 每次已提交 sale 都會用。

重現：新隔離 Sandbox → 匯入已有銷售嘅 v4 QA export → 再入貨／保持真上架存貨 → 快進一小時有新售出。實測 toast 仍含「這是小店踏出的第一步」。建議之後改為通用完成語句，或只喺真 first-sale 使用；無影響存檔／收入，唔擋本次試玩更新。

五語系文字 key/placeholder 同語意連貫性已檢查；香港字句已由較口語化改為輕鬆書面語，操作、成本／盈利、保留存貨與失敗後重試交代更完整。日／泰母語 editorial certification 仍另列。

實際 approved PNG、新 render 同之前 v4 pixels 對照：髮型變成連續不對稱 bob，髮絲 colour/normal maps 確實接入；肩袖／奶油上衣／腰圍裙／裙擺連貫性提升，木紋與暖內冷外光影亦有收斂。Web／GLB 確為同一形體及 maps，唔係概念圖代替遊戲。臉部、髮束有機感、布料垂墜、場景精緻度仍未到最後目標，但此係持續美術工作，**唔係阻擋已檢查增量試玩發佈嘅理由**。

## 可追溯實畫面證據

以下為原 PR 上已檢視嘅 source-pinned evidence；本次另做 fresh production/lifecycle/render，無覆寫 PR 證據。

- [High shop matched render](https://github.com/wizardkeith/KeEv-games/blob/de0a56b7820e1f5696cf30be2d73c50bc7844863/evidence/native-v5/after/shop-matched.png)、[High staff matched render](https://github.com/wizardkeith/KeEv-games/blob/de0a56b7820e1f5696cf30be2d73c50bc7844863/evidence/native-v5/after/staff-matched.png)。
- [Web/GLB Misaki front](https://github.com/wizardkeith/KeEv-games/blob/de0a56b7820e1f5696cf30be2d73c50bc7844863/evidence/native-v5/after/mesh/misaki-0-idle-normal.png)。
- [A walkthrough](https://github.com/wizardkeith/KeEv-games/blob/de0a56b7820e1f5696cf30be2d73c50bc7844863/evidence/native-v5/browser/interaction.webm)、[B walkthrough](https://github.com/wizardkeith/KeEv-games/blob/de0a56b7820e1f5696cf30be2d73c50bc7844863/evidence/native-v5/visitor-b/interaction.webm)、[video metadata](https://github.com/wizardkeith/KeEv-games/blob/de0a56b7820e1f5696cf30be2d73c50bc7844863/evidence/native-v5/video-metadata.json)。
- 四段原 WebM size/hash/duration 全獨立核實，並從影片新作時序抽幀；A/B 收袋／離店實際可見。記錄 source `b9d240a5ebcf86f2ce939e1a815904b3ed8bd2de` 同 reviewed tip 無 `src` 差異，所以可重用。未聲稱今次重跑完整 A/B 全片或物理裝置連續播放。

## 發佈邊界

原 v5 A–D source ZIP、Web ZIP、deploy tar bytes 不在本審查環境，故今次**未重新 CRC／重組／hash 整個 archive**。tracked receipt 同 119 rebuilt runtime payload 已獨立核實，packaged commit 有 833 Git-tracked files。此係附件不可用，非權限拒絕或不確定寫入。

Publisher 可從 exact reviewed source clean-build 同一 payload；如用 supplied deploy tar，先核對 receipt SHA-256 `c7f20ca9f1533397ce58b6f3f00a6caa7b101a43b6abb8a244ea42e941589b2c`。保留原 project `appgprj_6ad82a08ed2881918ebcc2dd206a122d`、URL、audience、Normal/Sandbox namespaces，完成成功 save/deploy receipt 後先稱已發佈。

SwiftShader 係軟體 WebGL；desktop touch emulation、encoded FPS 唔等於手機 GPU/FPS／Safari／virtual keyboard／safe-area／audio／native Unity/C#/URP 接受。真 hidden-tab transition 仍未驗證；frozen→active 有測。最終 reference-art approval 同上述 device/native gates 繼續保留，但無新軟件 blocker。

本次審查無 app fix、PR metadata/head change、merge、deployment、Site save/access change、玩家 Normal-save 操作或本機 Unity 工作。此摘要及 canonical progress 只作 main 文件交接；parent 擁有發布協調。
