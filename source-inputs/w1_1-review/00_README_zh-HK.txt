下一站・小店物語 — W1 審查及 W1.1 改善包
日期：2026-10-21

建議決定
繼續 Web-first。下一輪做 W1.1：暖木、奶油色與薰衣草紫的日式微縮小店美術，重整操作介面，修復已確認的經濟／存檔／教學問題。正式七個故事段落留待後續 Tokyo slice。

使用方法
1. 在目前開發遊戲的同一個 ChatGPT Work 對話／項目，附上這個 ZIP。
2. 讓 Work 先讀 02_W1_1_WORK_PROMPT.txt，再參考 01_REVIEW_zh-HK.txt、03_UI_ART_DIRECTION.txt 及 evidence。
3. 沿用現有 Site、原始 Bible、原始資產與存檔，直接實作與驗證。
4. 完成後交付更新網址、來源 checkpoint、HANDOFF 及實際測試結果。不要只交設計建議。

檔案
- 01_REVIEW_zh-HK.txt：審查結論、改善優先次序、敘事建議及證據限制。
- 02_W1_1_WORK_PROMPT.txt：完整執行 prompt，包含範圍、凍結規則、缺陷修復與驗收。
- 03_UI_ART_DIRECTION.txt：可直接落實的視覺、版面、互動與資產規格。
- 04_VERIFICATION_EVIDENCE.json：這次實際執行的檢查及可重現結果。
- reviewer_probes/：四個基準缺陷的重現程式及使用說明。它們是觀察工具，不是「通過就代表產品正常」的驗收測試。
- MANIFEST.sha256：包內檔案完整性清單。

來源基準
Site：https://next-stop-little-shop-w1.starry-ridge-5482.chatgpt.site
Site project_id：appgprj_6ad82a08ed2881918ebcc2dd206a122d
審查時 Site metadata 顯示 version 1、active、access_mode custom。
Source ZIP：Next_Stop_Little_Shop_W0_W1_Source_2026-10-21.zip
SHA256：4657259fe75717dce76099d2a7964d88ad6f1364f1514b4ccf05cea95bfbfaf1
附隨 handoff：HANDOFF(1).md；來源包內 docs/HANDOFF.md。

審查範圍
本次沒有更新或部署正式 Site。審查以提供的 source checkpoint、Bible、handoff、重新 build、核心重現程式及隔離瀏覽器 UI／IndexedDB 測試為根據。未逐位元比對線上部署與 ZIP。
審查瀏覽器不支援 WebGL，因此未能驗證原遊戲的實際 3D 畫面、材質、動畫、FPS 或觸控。HTTP preview 也缺少 crypto.randomUUID；UI 測試副本使用隔離的 command-ID adapter 才能繼續，沒有改動經濟計算或操作邏輯。這不等於 HTTPS 正式 Site 有相同環境問題。

對話中的互動介面是構圖／操作示意，數值是清楚標示的範例；不是新的遊戲版本，也不是正式 3D 模型。其文字規格已放入 03_UI_ART_DIRECTION.txt。
