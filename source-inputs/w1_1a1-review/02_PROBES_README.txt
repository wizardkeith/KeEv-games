審核重現工具使用說明

本包reviewer_probes是observational probes，用來重現W1.1A已識別問題。
它們不修改遊戲source、玩家存檔或Site；也不是已修復後的acceptance tests。
使用真實source／helpers／已輸出GLB，部分UI生命周期以mocked presentation boundary重現；沒有宣稱WebGL渲染或實體裝置驗收。

先在一份W1.1A source checkout以原lockfile安裝依賴，再在該checkout執行：

node --import tsx /absolute/path/to/reviewer_probes/art-review.mts /absolute/path/to/W1.1A/source
node --import tsx /absolute/path/to/reviewer_probes/vfx-review.mts /absolute/path/to/W1.1A/source

請以腳本的實際參數／輸出說明為準。輸出應保留於review evidence，不當作玩家存檔。
腳本針對所附source commit；若修正時改了函數介面，按新的實作介面更新重現工具及回歸測試，不要為讓舊字串抽取成功而扭曲正式架構。

原43個測試可逐檔獨立執行，以保持fake IndexedDB的process isolation並看到具名案例：
node --import tsx tests/art-w1_1a.test.ts
node --import tsx tests/economy.test.ts
node --import tsx tests/presentation-w1_1a.test.ts
node --import tsx tests/storage.test.ts
node --import tsx tests/w1_1.test.ts

證據界線
- GLB validator／NullEngine：結構及匯入，不是光影效果或FPS。
- 幾何射線／bounds：可證缺口或分離，不等於已看到遊戲中顯眼程度。
- mock lifecycle：可證事件交接邏輯，不等於已看過慢幀動畫。
- CSS／DOM browser：介面行為，不等於實體手機與觸控。
- public與Site version：由Site metadata核對，沒有改分享設定。
