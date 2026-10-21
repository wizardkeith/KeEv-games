# 下一站・小店物語 / Next Stop, Little Shop
## Game Bible v0.1 + Tokyo Vertical Slice Production Spec
Current baseline · 2026-10-03

> **Core fantasy:** 由一間屬於自己的小店開始，建立穩定事業與被動收入；認識員工、熟客、供應商與城市，逐步成為真正的老闆，最終獲得自由去旅行、看世界。

## Product identity
- zh-HK: 下一站・小店物語
- en: Next Stop, Little Shop
- ja: 次の街へ ～小さなお店物語～
- th: ร้านเล็ก ณ จุดหมายถัดไป
- zh-CN: 下一站・小店物语
- Developer/publisher: KeEv Games (outside fiction)
- Player company/shop identity: player-created
- Target: Apple App Store / Google Play
- Engine direction: Unity + C# + URP
- Visual: KeEv Living Diorama
- Monetisation: F2P direct-purchase boutique, no paid gacha, no paid power ceiling

## Frozen design rules
- Player is the founder; KeEv is not the in-game company.
- Cozy first; playing less is not punished.
- Core content, story, regions, Masterpiece items and Core Collection are free-completable.
- New content expands horizontally; no power-creep treadmill.
- City/culture attributes are researched before gameplay encoding.
- Economy effects are deterministic, typed, capped, explainable and replayable.
- Appearance / collection / social display are major retention and monetisation pillars.


## 1. Player fantasy & identity
玩家自訂公司／品牌／店名；由店主成長為跨城市創辦人與自由旅人。財務自由是 milestone，不是 ending。

## 2. Core gameplay loop
5/15/30/60 分鐘皆完整；Observe → Decide → Manage → Discover → Collect → Connect → Grow → Leave → Return；無 streak punishment。

## 3. Real-time schedule
現實 1 日 = 遊戲 1 日；每城市按當地時間；offline 被動營運；server time authoritative。

## 4. Regions / cities / districts
Region=城市/都會區；每區最多 10 店、3–5 代表性商圈；Research-backed attributes；正常 2–4 週解鎖；paid 可 early access。

## 5. Shop type system
五 archetypes：Retail、Food & Café、Lifestyle Services、Professional Services、Leisure & Experience；用 specialization / city / build 製造差異。

## 6. Store management & P&L
Revenue − costs = profit；交通/轉換/客單價驅動；全部 modifier deterministic / capped / auditable；每店有多個 ratings。

## 7. Offering system
共用 Offering framework；文化身份 + 商業價值 + build + collection story；同 base item 可有不同 quality。

## 8. Discovery
以做生意、旅行、人物與探索形成 ??? → identify → quality → affix → hidden trait；no paid random loot；城市有自己 discovery pool。

## 9. Quality tiers
Standard / Select / Premium / Signature / Prestige / Masterpiece；Unique 是 tag，不是第七階；Masterpiece 改玩法但不必 power-creep。

## 10. Builds / sets
Item affix + named set + synergy tags + business strategy；build 可追 profit / cozy / culture / visual / regulars；set visual 必須一致。

## 11. Equipment / furniture
Functional + Style layers；Smart Snap、Lock、Save Layout、Appearance Override；免費也可做出頂級美術店。

## 12. Staff
五能力 + traits + role mastery + story + local voice + outfits；Day-1 staff 長期 viable；paid staff side-grade。

## 13. Suppliers
Local/Regional/International；Partnership 升得慢；server-wide requests；重點是 hidden stock、collaboration、story、network。

## 14. Customers
一般客→回訪→熟客→named→special visitor；重要 story deterministic；NPC 有 memory、可跨城市重逢。

## 15. Missions
Daily / World Moments / Customer / Staff / Supplier / Region / Hidden；任務是邀請，不是 checklist；重要 content 不靠低 RNG。

## 16. Collection
Journey Book 記商品、店、人物、supplier、region、culture、memories、Masterpiece；Core 100% free；完整 set 解鎖 Design Page。

## 17. Achievements
Titles 0 stats；hidden achievements 真 hidden；reward 以 identity / cosmetics / memories / HQ display 為主。

## 18. Pets / offline
所有人有 basic pet/helper；paid pet direct-purchase side-grade；只一隻 active helper；不代玩 main progression。

## 19. Living World
Local time + calendar + researched climate + server simulated weather + festivals + world events；同城所有玩家共享 state。

## 20. Story
Global / Region / Character / Small Moments 四層；Cozy base + 感動/開心/鼓勵/感恩/黑暗/精彩/幽默；soft branching。

## 21. One-tap recommendation
玩家先選目標；Preview → Explain → Apply → Undo；可 lock items/theme；deterministic engine；core QoL free。

## 22. Economy curve
正常 2–4 週一 Region；Lifetime Regional Net Profit + core story；capacity/diminishing returns/caps；後期 money sinks。

## 23. Free-player experience
所有 core regions/story/quality/sets/collections/staff/pets/QoL free-completable；paid 是 choice / art / early access。

## 24. Monetisation
Direct-purchase Boutique：interiors、outfits、pets、optional staff、backgrounds、early region access、music/profile cosmetics；launch no subscription/battle pass/premium currency/ads。

## 25. Daily / Weekly / Events
Daily Pulse 3 件；World Journal；Weekly Thread；seasonal events；no login streak；server-wide opportunity windows；region vote 一 account 一票。

## 26. Social
Async visits / likes / reactions / inspiration / multi-category leaderboards；no chat/trading at launch；server-authoritative rankings；paid cosmetics no score ceiling advantage。

## 27. Audio
City identity + adaptive layers + local-language voice + story silence；ElevenLabs Starter 可做 prototype/production pipeline，Work 負責 orchestration/QA。

## 28. Visual
Full 3D + curated 2.5D camera；3.5–4頭身 anime-toon chibi + soft stylized PBR；cinematic lighting；30/60/Auto；Zen View / Photo Mode。

## 29. Tokyo Vertical Slice
Tokyo→Ikebukuro；1 Lifestyle shop；7 opening beats；Misaki/Ren/Momo；3 suppliers；3 named customers；36 offerings；2.5 sets；Prestige discovery；rain/day/night。

## 30. Technical blueprint
Unity+C#+URP；pure deterministic simulation core；stable IDs；data packs；offline aggregate simulation；local-first MVP；Economy Replay Tool + Content Validator。

## 31. V1.0 scope
Target Tokyo/Hong Kong/Bangkok；~12 districts；~200 base offerings；~18 named staff；~16–18 named customers；~15 suppliers；~18–22 sets；3 free + 2 premium pets；5 locales。

## 32. Long-term roadmap
Horizontal expansion, no power creep；new regions reconnect old ones；old city refreshes；player voting；Masterpiece stays top core tier；endgame=ownership & memories。

## Tokyo Vertical Slice production sequence
1. Technical spike
2. Deterministic simulation core
3. Graybox shop MVP
4. Save / real-time / offline simulation
5. Layout & equipment
6. Quality / build / set / discovery
7. Living World
8. Character pipeline
9. Visual polish
10. Audio factory
11. Narrative / collection / QoL
12. Vertical Slice QA gate

## GO / NO-GO gates
Gameplay · Economy · Retention fantasy · Character · Discovery · Visual · Performance · Content pipeline

## Launch red lines
No paid gacha; no paid power boosters; no energy gates; no player trading at launch; no login-streak punishment; no core content locked behind payment; no cosmetic-paid leaderboard ceiling; no city stereotypes without research; no Masterpiece power-creep tier.
