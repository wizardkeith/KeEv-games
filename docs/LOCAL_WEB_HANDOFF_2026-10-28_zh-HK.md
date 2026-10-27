# 本機 Web-first 交接能力核對 — 2026-10-28T00:25:40+08:00

後續：使用者已明確批准鎖定依賴及限定esbuild script；新的build／TypeScript／headless實載已通過，原測試301/302及唯一浮點byte差異完整保留。請看[本機Web驗證續篇](LOCAL_WEB_VALIDATION_2026-10-28_zh-HK.md)。下文保留此前階段的真實阻塞／清理記錄。

此記錄只核對環境、原提交資產完整性及雲端同步；沒有新美術、GUI 編輯、引擎遷移或視覺接受。

## 已核實基線

- 新獨立 task-owned checkout 的 branch 是 `codex/asset-foundation-v1`，初始本機與實際 `git ls-remote` 同為 `56dd5e3361917d7394d4e37eedbddd759c06d0f2`；展開後初始 working tree clean。
- 實讀遠端 main `db21f3cb4f57b254c3dcfd99c2737411ba4301b8` 的 PROJECT_STATE.md、分支 AGENTS.md、R6 狀態與相關 README。main 的進度入口保留，未寫 main／PR8。
- R6 source `9e62928511d0da45012c05d3197e0bc5d04bc309`、evidence `4c7a540ac85b2c42b47abb1b968455ab87675a5e` 為來源交接。R6 身份／畫風仍未接受；單一美術 writer 尚待父緒明確分派。
- 原 sandbox clone 在 Windows TLS 層 `SEC_E_NO_CREDENTIALS` exit128；同一 clone 經正式權限請求後成功。沒有改 safe.directory、TLS/security 設定、取得新憑證或改走替代下載。原不匹配擁有者的舊本機工程未碰。

## Blender：真正資產檢查通過

- 本機執行檔實際版本 5.2.3 LTS／e13b728c6880，background Python 3.13.13。
- 獨立測試 cube 真正輸出 smoke.blend 88,573bytes、smoke.glb 1,984bytes；分開程序重開 .blend、重新匯入 GLB，exit0。測試方塊明確標為 `SmokeTest_NotGameArt`，不是遊戲美術。
- 已用同一本機 Blender background 直接讀取**本分支已提交的** `assets/authoring/misaki-grayform-v1/misaki-grayform.blend`，再將實際 `public/assets/misaki-grayform-v1/misaki-grayform.glb` 匯入空場景，exit0。
- .blend：44mesh objects、20curves、evaluated49,368tri。GLB：902,132bytes、5meshes／10primitives／7materials、0images／skins／animations，實際匯入49,368tri。
- 兩檔檢查前後 SHA256 不變：
  - .blend `e8d5b774c5aba9fecbba3800732592c6b1eb66b34e74e6622c0099d6b60ed7a9`
  - .glb `29f4ff9e8711f80cef1f5d899d9c5f0fab0facbf1841274678313581998bb823`，與 R6 記錄完全一致。
- 未save、重建或重匯出原遊戲資產；未改 source、材質、reference、既有美術／經濟／存檔。

## GUI／三螢幕限制

- 視窗工具實際看見 Blender 3D workspace，但停在首次 Quick Setup。未按 Continue、未實測直接造型／材質編輯或 reference matching。啟動工具雖一度報視窗事件逾時，後續視窗與 screenshot 已證實啟動成功。
- 使用者提出三螢幕限制後，停止 GUI click／typing／focus changes。工具是 window-specific，Windows 輸入會啟用目標視窗；沒有獨立鍵鼠或單螢幕隔離保證。螢幕／協作範圍未確認前，不恢復 GUI 輸入。
- 唯讀 bounds：DISPLAY5(-1836,-2160)1920×1080；primary DISPLAY1(0,0)1707×1067；DISPLAY2(-2560,0)2560×1440。這是 caller/DPI 座標，不是獨立驗證的原生面板解析度。

## Unity：安裝／授權／整合分開記錄

- Hub 真正 FileVersion／使用者開啟視窗均是 **3.22.4**；先前安裝目錄的 `version` 檔值44.5.1不是正確的Hub產品版本，已更正。
- 6000.0.84f1、6000.3.25f1、6000.6.4f1 Editor 存在。唯讀 Hub 安裝頁實見 6.6 的 Web＋Windows、6.3 的 Android＋Windows、6.0 的 Windows。
- 獨立空 packages scratch project 的 6000.6.4f1 `-batchmode -nographics -noUpm -quit` 能啟動及 register WebGL extension，但 exit198：`No valid Unity Editor license found`。SmokeTest.Run 未完成，沒有 test scene。這是目前執行身分的結果，不表示使用者帳戶不能持有 license。
- 使用者之後開啟的是 Hub 安裝頁；當時未見開啟的 Editor project。沒有控制、關閉或重開用戶工程。CLI `license status` 在目前身分顯示沒有active license／未登入。
- 現有 Unity CLI 實際是 **1.0.0-beta.12**；已執行 --version、--help、pipeline list、plugin list、license status。
- `pipeline list` 表明無法檢查 running editors，沒有返回可用 Pipeline instance；故不能把空清單當作 Pipeline 一定未安裝。plugin list 的 licensingClient 是現有 managed runtime；所列 plastic／ugs／ai 為not-installed，這個清單不等於 Codex agent plugin 清單。
- 限定範圍內未找到 Unity Codex plugin cache 或 Unity/Pipeline MCP config heading，未發現本對話可呼叫的 Unity-specific connector。沒有安裝／configure MCP、改localhost政策或新增持續存取。
- 沒有登入、activate、接受條款、付費、WebGL build或Unity遷移。Web-first 不以 Unity 解鎖為前提。

## Web toolchain：基本可用，完整測試受阻

- 實際 Node v24.19.0；localhost GLB server／fetch test HTTP200、1,984bytes逐byte相同，exit0；server自行關閉。未執行瀏覽器／WebGL渲染，受GUI hold限制。
- npm 不在PATH，常見安裝路徑亦未找到。已找到現有 bundled pnpm11.25.0及fallback wrapper，沒有改PATH或安裝新的套件管理器。
- package.json：build=tsc --noEmit && vite build；test=node --import tsx --test tests/*.test.ts；validate／replay／asset-check依既有README。
- **意外必須保留：** 執行現有 pnpm `run test`／`run build` 時，pnpm11在跑腳本前自動install缺少依賴，下載25個專案套件，產生未追蹤pnpm-lock.yaml、pnpm-workspace.yaml、node_modules及task-local .pnpm-store。這超出「不安裝」限制，雖沒有明確呼叫install。
- 兩次pre-run均以 `ERR_PNPM_IGNORED_BUILDS: esbuild@0.25.12` exit1停止；**測試及build腳本沒有真正執行，不能稱通過**。沒有approve-builds、沒有改allowBuilds、沒有以另一條路繞過此政策。自動產生yaml含未決定的esbuild設定，不會提交。
- 已停止後續重試；本輪未跑validate／replay／asset-check（相關dependency gate仍待正式決定）。原package.json／package-lock.json及所有原tracked files保留。

## 同步／清理

本提交只新增此文件、最小可重現的診斷source／小型smoke .blend/.glb／JSON證據及PROJECT_STATE記錄。原R6資產已在遠端，未重複上傳。未納入raw license/session logs、個人檔案、node_modules、pnpm store、Unity Library/Temp/Logs或自動生成lock/config。新本機Git author未設定，使用既有授權GitHub連接建立文件／證據checkpoint；不更改本機identity/security設定。

遠端checkpoint建立後需以同一Git transport fetch／fast-forward並核對精確remote SHA及檔案hash；這不是Site發布。成功核對後才清理本任務可重建cache／重複測試檔，保留同步的source與最小證據，記錄實際bytes；清理前沒有宣稱釋放空間。沒有PR retry、merge、public deployment、player Normal save更改或Library重建。

## 已完成同步後清理 — 2026-10-28T00:29:50+08:00

- 文件／最小證據checkpoint `96fd480ba0afced2107d14ada60944346ccb5d99` 已由實際Git transport讀回，獨立checkout正常fast-forward；smoke .blend/.glb與R6原檔SHA256逐一匹配。depth1 fetch初次隱藏新提交parent，正常補取同分支兩層祖先後已解決，無reset／force／unrelated merge。
- 已刪除本任務可重建node_modules／task-local pnpm store、pnpm自動生成的兩個未追蹤yaml、Unity scratch Library／Temp／Logs／UserSettings及已核對同步的重複smoke輸出。原package-lock、所有tracked遊戲來源／資產／references、同步後最小證據及Unity測試source保留；未刪用戶原工程或不確定資料，未清空Recycle Bin。
- 刪除檔案邏輯總長 **258,697,689 bytes**；drive free採樣132,274,511,872→132,443,684,864，觀察增加 **169,172,992 bytes**。hardlinks及其他程式同期活動令兩數不可當成同一概念，不聲稱全部空間變化均由本清理造成。詳見 `docs/reviews/evidence/local-capability-20261028/cleanup-result.json`。
- Node HTTP server早已自行關閉、Unity batch早已exit198；沒有終止任何用戶app。task-launched Blender視窗因GUI/focus hold保留，避免自行關閉視窗造成桌面焦點變動。當前沒有本任務background建模／capture／preview server。
- pnpm auto-install產物已移除；完整Web build/test仍待依賴安裝與build-script範圍明確批准，不能用清理當成測試通過。後續先維持Web-first，GUI與writer交接界限不變。
