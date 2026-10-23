# Day 1 集中修正 — HANDOFF
2026-10-23（香港）

同一 Site：appgprj_6ad82a08ed2881918ebcc2dd206a122d
https://next-stop-little-shop-w1.starry-ridge-5482.chatgpt.site
起點核對：canonical main 2686019a76d020543cfa0bca3efa867422add4d5／v8／public／policy2，clean；接續此來源，沒有回退其他工作。
最終 commit、版本及實際部署結果見精簡交付包內 DELIVERY_RECEIPT.json；回執是 commit 後產生，並非聲稱已存在同一 source commit。

三項修正：
A. 開店故事主 CTA 使用原五語「開始營業／Open shop」標籤，直接經 run→act→Saves.command 開店，不再把玩家送到窄屏隱藏開店控制的貨架頁。只在未開店且不 busy 時執行；重複／延後事件不新增關店 toggle，另一分頁舊 revision 仍被原 CAS 拒絕。正常模式原時間結算及 committed boundary 保留。
B. 五語 profitPending 改為「目前這份報表沒有正淨利」的溫和提示，不否認已發生／已讀首次盈利。主卡／手記根據目前 report 判斷，不從 profitDay 重建舊金額或當作目前盈利證據。正利但記憶點尚未讀完時仍給 P&L 說明，不誤用無正利提示。沒有新 ledger／schema／reward。
C. Misaki greet 右肩 Z 旋轉向外，保留原柔和曲線／幅度、售後 pose、neutral endpoints、原地站位及全部取消政策。只改程序 pose，不改模型幾何。兩個 GLB 及 public 副本與 v8 完全相同；manifest source hash 已更新，附 greeting-fix-rebuild.json。GLB 沒有 embedded clips，未聲稱動畫烘焙入檔案。

重現及針對性驗證：
- A/B 新回歸在舊來源分別重現錯誤導航及五語首次盈利未達成文案；修正後通過。
- 真正 run／act／Saves 行為測試：首次開店只一個 command；連按 busy、延後已開店、舊分頁 stale、正常時鐘 target 均檢查。沒有改 core 開店規則。
- 同一茶包 fixture：10:15 net +¥260；讀 report／memory／profit 後，14:15 net −¥540、cash ¥49,460。主卡及手記五語均不否認過往盈利，報表保留目前負數及 Tokyo 截至時間；未曾盈利分支仍可繼續。
- 實際 Babylon RH root／yaw／shoulder hierarchy＋作者12邊 torso／skirt triangle half-planes：舊 p=.5/.6 手掌117/117頂點進入衣服；修正後全招呼101採樣，手掌／拇指在實體內的採樣頂點均0。這是幾何驗證，不是看過GPU畫面。
- 原80具名案例與13個 test files byte-identical；新增3個缺口回歸，共83 PASS、0 FAIL／cancelled／skipped。
- content validate PASS（10商品、原5語各174keys；Day1仍各52keys）；TypeScript／production build PASS。既有 large chunk warning 保留，並非效能驗收。
- 154個保護檔案與v8相同，包括核心、storage、story state、原資產／字型、world、motion／feedback政策與package／lockfile；沒有改玩家進度、schema2／ts-w1-2、DB/store、薪酬／成本／需求／營業段。
- Misaki 兩 GLB 重新匯出及 validator：0 errors／warnings，所有master/public bytes不變。沒有無因重造歷史資產。

真正 browser QA：
Supported managed preview，獨立QA副本及不同320／375 test DB，只改QA資料庫名稱，未接觸公開站 normal／sandbox。
320×820鉛筆與375×820茶包：買5→上架→關入貨側欄→故事「開始營業」直接開店，無新drawer，next beat變sale。body clientWidth＝scrollWidth各320／375。
兩路線實際 +15分鐘、P&L、memory／profit；茶包+¥260、鉛筆+¥10，reload保留。
375茶包同日14:15實際−¥540、售5、收入3750／COGS1750／人工1270／租850／營運420／存貨帳面0；再實際查看五語主卡／手記，均為目前報表語意。
這些是CSS viewport及UI操作，不是手機硬體／GPU／觸控認證。

視覺界線：
managed preview仍回報 Error: WebGL not supported。
修正招呼的自然度、正常全景可讀性、calm／smile、售後動作及局部暖色紙卡仍為「3D 視覺待確認」。幾何／NullEngine／GLB驗證均不當成真正渲染。
已接受W1.1B靜態美術維持；未擴展Day2、Ren、Momo、雨景、36商品、完整七日或native。

回傳畫面：同一網址由手記重看，拍正常全景的招呼右手；再於沙盒營業段拍一次真實售後反應，加P&L截至時間及有側欄一張即可。勿重置正常進度，勿要求既有沙盒硬套全新fixture數字。

來源與證據：
同一 canonical Git 保存完整來源及全部歷史；精簡ZIP只裝本輪交接／實際回執／測試與修正來源，不冒稱整包歷史source。
npm ci → npm test → npm run validate → npm run build；角色交換重建仍為 node --import tsx tools/export-misaki.ts。
evidence/day1-fix/ 保存 before／after、83具名測試、build／content、preservation及browser結果。
assets/authoring/day1/greeting-fix-rebuild.json 保存來源hash與GLB不變記錄。舊v8交接封存docs/HANDOFF_Day1_v8_Archived.md。
ZIP完成關閉後才驗CRC、檔案清單及manifest SHA256；部署回執實際包含在包內。

