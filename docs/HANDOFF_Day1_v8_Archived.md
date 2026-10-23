# Day 1「第一盞燈」可玩候選 — HANDOFF
2026-10-22（香港）

同一 Site：appgprj_6ad82a08ed2881918ebcc2dd206a122d
https://next-stop-little-shop-w1.starry-ridge-5482.chatgpt.site
起點 canonical main：503ce1dfc22d369cc512084c1a4db9aa2930885c；v7／active／public／policy2。沒有覆蓋後續工作。
最終 source commit、saved version、部署及 archive hash 見交付包內實際 DELIVERY_RECEIPT.json。該回執是 commit 後產生的交付 metadata，不冒稱存在同一 source commit。

## 已實作
- 獨立 Misaki 3D 候選：不對稱 bob、側髮結／葉形髮夾、sage 外衣、米色長圍裙、plum 裙及平底鞋。約3.66頭身／高1.48m，平靜與微笑真實表情幾何。短招呼、售後程序動作，沒有根節點滑動。不是 generic 改名／換色。actor.misaki.day1.v1 明確綁定 staff.graybox；經濟 roster、薪酬／能力不變。
- 五語 Day1 台詞／手記，各52新 keys；原各174 keys 不變。可收起／略過／重看；自由選物→上架→開店→真實首售→P&L→溫柔手記。茶包／其他選物的反應依目前實際狀態，不假裝記得未保存的歷史選擇。
- P&L 重新讀取正在顯示的 validated report，附 Tokyo「截至」日期／時間；正／負分支不依舊盈利已讀旗標。舊玩家用回顧語氣，不重給資源或強迫重買。
- 顧客依 trading／quality 在首售前可以瀏覽。售出摘要／Misaki 售後回應才跟 committed eventSequence 增量；多件快進是一次摘要，reload／import／mode 不補播。沒有具名顧客交易 ledger 或虛構指定客人購買某商品。
- 收銀枱新增暖色迎賓紙卡，利用局部材質及非常低 emissive 作焦點；沒有新增燈、陰影貼圖、粒子、bloom、render target。實際柔光觀感待 GPU 畫面。
- 同商品換架提示具體 from／to，原 display 規則不變。原 reveal 資格及零經營加成小樣本保留，沒有 Day6 Prestige 燈獎勵。

## 存檔／生命週期
獨立 story.day1.v1.<mode>.<shopId> 記錄，使用原 IndexedDB saves store。
純 read／skip／dismiss／reopen 在 serialized transaction 讀最新 validated Snapshot 與 sidecar，合併單調 IDs；不經 Saves.write，不呼叫 core command／settle，不改任何核心欄位，連 revision／commandIds／watermark／lastWallTime 亦完全不變。
所有經濟資格由 Snapshot 推導；schema2／ts-w1-2、時鐘、營業段、需求、價格及成本不改。
import 與故事清理一次原子提交，仍用本地舊 revision＋1；舊 callback 不能恢復匯入前標記。缺失／壞v1可重建，未支援較新版本忽略並保留。normal／sandbox 隔離，沒有新增玩家 reset 功能。
raw Snapshot 備份相容，UI 說明故事閱讀位置匯入後重新整理。
Hidden／Skip／Minimal／Reduce Motion／Low／mode／import 取消新短動作，單一容量、不排隊；首次 deferred-world 不補播。

## 實際測試
npm test：80具名 PASS，0 FAIL／cancelled／skipped。
保留原62案例名稱與所有 assert 呼叫原文；兩份既有 VM fixtures 只補新 runtime bindings。
新增18：storage7、art5、copy3、實際 main／world presentation boundary3。
覆蓋核心 Snapshot 完整一致、純故事零核心寫入、多連線合併、import 原子 rollback／本地revision／舊回呼、壞／未來 sidecar、mode隔離、茶包固定路線、鉛筆自由選擇、時段外、同日正轉負、售前瀏覽、手勢取消、目前報表及安全文字。
content validator PASS：10商品、5語各174 baseline keys；另5×52 Day1 keys 對齊／插值 PASS。
TypeScript／Sites production build PASS；原 large chunk warning 保留，不當作效能通過。
Misaki exporter：2 GLB共517,276bytes；Khronos 0errors／0warnings；實際 vertex／normal／indices／pivot／linear material parity、Babylon獨立匯入、曲面繞序／比例／落點通過。這不是GPU視覺驗收。
preservation：179個受保護檔案與v7一致；原core／catalog／baseline五語／recipes／materials／direction／歷史資產與package／lockfile保持。
證據：evidence/day1/；完整原測試與歷史證據保留。

## 真正看過的介面
Supported cloud browser、獨立review build／DB；沒有操作公開站玩家存檔。
實際命名→買茶包5→架1→開店→＋15分鐘→報表→手記→盈利節拍→reload保留→reveal→重看／收起。
截至Tokyo10:15：售出1、收入¥750、COGS¥350、人工¥70、租金¥50、營運¥20、net¥260、現金¥48,860、存貨帳面¥1,400。符合固定新測試起點。
320×820 CSS iframe：五語故事／重看，body scrollWidth＝clientWidth＝320、card width290；繁中操作最少44px。泰文長段可讀；重看焦點到故事繼續，Return可繼續，收起回手記導航。不是手機實機／觸控硬體驗收。
連續玩家主動操作時間未量測；5–10分鐘仍為沙盒設計目標，不把工具或編碼時間當遊玩時長。

## 3D 視覺待確認
W1.1B靜態3D已由後續用戶AFTER影片完成獨立驗收，沒有重新變成待驗收。
本輪預覽實際回報 Error: WebGL not supported；UI／經營／故事流程已看過。
新Misaki輪廓／正常全景表情、局部暖色焦點、招呼／售後3D動作、小樣本3D開啟仍待真實畫面。
沒有以NullEngine、GLB validator、camera矩陣或錄製fps冒稱GPU畫面／效能；Android／iOS／URP、手機30／60FPS均未驗收。

簡單回傳：同一網址進沙盒，不重置正常存檔。正常全景＋有側欄各一張；另錄約30–90秒，拍招呼／目前選物、日間售出摘要、P&L「截至」時間及手記／小樣本。時段外可用原快進進Tokyo10:00–20:00；舊玩家可由手記重看，不需為劇情重買。既有沙盒累積租金／餘數不同，不應硬套全新fixture的¥260。

## 可重建來源
完整 source checkpoint 留同一 canonical Git；報告ZIP是交接／新資源／證據包，不冒稱包含整包歷史source。
Node24／原lockfile：npm ci → npm test → npm run validate → npm run build。
角色重匯：node --import tsx tools/export-misaki.ts。
保留核對：node --import tsx tools/day1-preservation.ts。
新設計卡 docs/MISAKI_DAY1_DESIGN.md；作者來源 src/art/misaki.ts、day1-focus.ts；程序姿態 misakiPose＋src/presentation/day1.ts；交換資產 assets/masters/day1、public/assets/day1；manifest／hash／權利來源 assets/authoring/day1。
Metres／RH／+Y up／+Z forward，人物面朝-Z、地面pivot；無骨架／embedded clips的聲稱。程序動作及URP材質／光影仍需native adapter與實機校準。
外觀／逐句台詞是今次原創提案；Bible只定service／regulars／cozy等定位，不能冒稱完整正式staff系統完成。

W1.1B正常交接補註：15masters真實容量503,056bytes，原503,072屬文字誤差；檔案／manifest原本正確。歷史HANDOFF封存docs/HANDOFF_W1_1B_Archived.md；後續用戶影片完成該輪AFTER評審。
未擴展Day2 suppliers／Ren／Momo／雨景／36商品／七日全套／native。下一步先收新角色／演出真實畫面。

