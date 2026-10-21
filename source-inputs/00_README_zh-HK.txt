下一站・小店物語 / Next Stop, Little Shop
Web First 開工包 v1.0
日期：2026-10-21（香港）

用途
Keith 希望在公司電腦透過 ChatGPT Work Cloud，先玩到 Web 版本；日後繼續 Android／iOS 製作。此包是交給另一個 ChatGPT Work 工作階段的製作指令與參考資料，並不是已完成的遊戲、已通過的移植測試或原 Bible 的替代版本。

使用方法
1. 在 ChatGPT Work 開一個 Cloud 工作，繼續使用你選定的模型與設定。
2. 附上整個 ZIP，貼上 02_WORK_W0_W1_START_PROMPT.txt 的全文。
3. 請 Work 解壓、讀完整 DOCX Bible、讀技術附錄，然後完成 W0＋W1。
4. 今輪成果應有可玩的私人預覽網址、可重建原始碼、資產紀錄及實際測試報告。
5. 把 Work 的交付報告及原始碼包交回本對話審核，再決定下一個階段。

本輪已授權方向
• 雲端優先；不要求存取公司電腦、Local Driver、Unity、Android SDK 或 Xcode。
• 先做真正 3D Web 遊戲，以 Bible 規定的 2.5D 鏡頭呈現。
• Web 畫面採 Babylon.js；共用內容與原始資產獨立保存。
• 優先驗證 Bible 的純 C# 經營核心能否經 .NET WebAssembly 在瀏覽器執行。
• 若有實際雲端工具鏈阻礙，允許有限、明確標示的 TypeScript 試作核心；該程式碼日後要移植，不可聲稱已共用。
• 可以做 Web 最佳化，但不得改變玩法、經濟結果、故事時間、付費公平性或正式美術方向。

資源重用承諾的準確意思
資料、翻譯、原始音訊與貼圖、模型／骨架／動畫資料，以及符合相容範圍的 C# 核心，應以日後可重用為製作目標。Web 專屬 shader、React 介面、平台服務及動畫控制器，仍需在 Unity 接駁或重做。灰盒素材本來就是暫代；不能將它們當成已完成的正式美術。Unity 實際匯入、URP 畫面、IL2CPP 與 Android／iOS 真機驗證，必須留待真正執行後才能標示通過。

第一輪會玩到甚麼
跟原 Bible Part II P2：一間池袋背景的小店、約 10 件 Offering、1 位暫代員工、1 個供應商、一般顧客、基本入貨／陳列／定價／銷售／P&L、測試套裝、基本發現、存檔與返回結算。世界先用靜態環境，音效可暫代，故事只做教學。這一輪不加入寵物，不製作完整七日故事或最終畫質。

完整 Tokyo Slice 的 Misaki、Ren、三花貓 Momo、36 件 Offering、三個供應商、三位具名顧客、雨夜玻璃小燈、日夜／雨天及正式風格，依原 Bible 分階段加入。

檔案清單
00_README_zh-HK.txt：本說明。
01_WEB_FIRST_ADDENDUM_v1.0.txt：共用架構、資產格式、Web 最佳化與製作邊界。
02_WORK_W0_W1_START_PROMPT.txt：可直接複製到 Work 的今輪開工 prompt。
03_ROADMAP_AND_ACCEPTANCE.txt：階段順序、驗收方式與後續手機版接駁要求。
04_SOURCES_AND_PROVENANCE.txt：原 Bible 識別、官方技術來源與證據邊界。
source_bible/：兩份原裝 Bible；未修改內容。
reference_extracts/Bible_full_text.txt：從 DOCX 抽取的全文，方便搜尋；不包含圖片版面，與原裝 DOCX 有衝突時以原裝完整內容為準。
MANIFEST.sha256：本開工包內檔案的 SHA-256。

重要原則
• 正常模式維持現實一日＝遊戲一日；測試快進使用獨立時鐘與存檔。
• 低畫質、少顯示顧客、低 FPS 或背景分頁，不可改變同一組輸入的經營結果。
• Web 壓縮檔是衍生版本；不可覆蓋唯一的高品質原檔。
• 「尚未在今輪載入」不等於無用檔案；未來共用素材、授權、產生腳本及測試必須保留。
• 這次是先做 Web、同步保留手機版所需基礎，不代表現在同時建置手機安裝包。
