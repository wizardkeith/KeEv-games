# V10 美術重做與 Grok 手動素材 brief

本輪沿用原有批准方向，沒有新目標。原圖：[Approved_Visual_Target_Misaki.png](codex-v4/reference/Approved_Visual_Target_Misaki.png)。Bible第28章：真正3D、35–45°呈現、3.5–4頭身、柔和anime toon人物、soft stylized PBR環境、暖內冷外。請把原圖附給Grok；不用把本頁交給另一個服務自動操作。本助手不會直接聯絡Grok。

## 已讀像素的全場景差距／處理次序

對照原圖與V16同來源實拍紀錄，V16保留了店面布局，但整體仍較像規則幾何模型，未達目標的自然精緻程度。公開V16來源8277b32與本輪基準main6c4c3c4的應用程式一致；雲端live HTTP受既有proxy403限制，本輪會另拍本地production WebGL基準，不冒稱重新瀏覽了公開Site。

| 範圍 | 明顯差距 | 本輪直接可做的工作 |
| --- | --- | --- |
| Misaki／客人 | 頭髮整塊及碎片邊界突出，眼面偏平；衣袖肩線、裙與圍裙較硬 | 重新雕整連續曲面及髮流，調整眼／臉層次、衣料輪廓與接縫；保留已驗證骨長、手部接觸、腳底及身份 |
| 建築／構圖 | 牆面過空、窗外幾何塊感重；缺少前中後景層次 | 細化原有窗框／牆裙／外景比例和層次，保持門洞、碰撞走廊與已接受鏡頭 |
| 家具 | 木材像同一種塑膠，板材／邊緣／抽屜層次不夠 | 更有節制的木紋、邊角、面板及編織／陶瓷材質分工；不新增功能家具或經濟加乘 |
| 商品 | 重複、整齊、部分像圖形代號 | 原有SKU的可辨識形狀、紙頁／釉面／包裝與成組陳列；不新增SKU或假庫存 |
| 植物 | 片狀幾何重複、對稱球形樹冠 | 重新做枝葉曲率、疏密、前後遮擋及小花輪廓；不以一張背景代替整間3D店 |
| 材質／光照 | 木紋條紋過規則；暖光較平均、缺少柔和接觸與窗光層次 | 重做原創材質輸入及貼圖尺度、表面回應、暖內冷外、有限陰影預算；實際渲染比較後調整 |
| UI／FX | 已接受清單可用；故事、毛利及新對話若同時顯示會擠迫 | 保留580px drawer／清單／鏡頭，單一有冷卻的店內對話；真實批次毛利不與閒聊重疊，不偽裝收益 |
| 營業感／互動 | 只有到店wave，離店／回應不足；部分姿態轉換較機械 | 到店與離店招呼、情境短對話及回應、自然等待／轉身／走路／交袋／返回；Exactly-once財務不依賴動畫 |

## 最值得先交給Grok的兩組素材（可選，毋須等素材才開工）

### A. 可真正整合為3D材質的原創植物／紙品圖

請一次只生成一張，避免把不同任務壓在同一張概念板。先做A1；回傳原始檔，不用自行裁切或安裝工具。本助手會檢查邊緣、alpha、色域、尺度、權利來源和實際3D效果再整合。

**A1 — 植物albedo atlas，可直接複製：**

> Use the attached approved “Next Stop, Little Shop” image as the same established art direction. Create an ORIGINAL production albedo atlas for small leaves and tiny cream wildflowers in a warm Japanese lifestyle-shop diorama. Soft hand-painted stylized PBR, natural asymmetry, sage/olive greens, a few fresh yellow-green edges, delicate veins; rich organic variation, no photorealistic noise. Exactly 1024×1024 pixels. Arrange six separate leaf silhouettes in the upper two thirds and three small cream flower-head clusters in the lower third, each fully separated with at least32px transparent padding. RGBA PNG, genuinely transparent background, straight alpha; no white fringe or checkerboard baked into pixels. Front-facing flat botanical shapes, orthographic, no perspective. Even neutral illumination, no cast shadow, no pot, no stem crossing another cell, no scene/background, no text/logo/watermark. These are texture inputs for real 3D geometry, not a replacement shop screenshot. Keep every motif safely within its cell and provide the original uncompressed PNG. If true alpha export is unavailable, return a clean flat neutral background and explicitly say so; do not pretend it is transparent.

A1不是normal／roughness貼圖。請不要把AI畫出的彩色「normal map」當作正確法線；本助手會按真正幾何／高度另行處理。

**A2 — 紙品印刷圖，可直接複製：**

> Using the same attached approved target, make an ORIGINAL2048×2048sRGB PNG print sheet for tiny paper products and framed botanical prints in a cozy3D lifestyle shop. Six separate rectangular designs with32px gutters: two minimalist leaf studies, two quiet abstract plant motifs, two cream stationery cover patterns. Muted sage, warm ivory, dusty plum and restrained tan. Flat front view, neutral even illumination, crisp at small sizes, subtle paper character, no readable words, price, branding, tier badges, copyrighted characters, objects, mockup, folded paper, perspective, lighting bake or cast shadow. Opaque ivory background within each design. This is albedo artwork to place on existing models; do not render a new store. Provide one original PNG without compression artifacts.

### B. 人物與動作研究（不是可直接載入的遊戲模型）

**B1 — Misaki一致轉面研究，可直接複製：**

> Follow ONLY the attached previously approved Misaki target. Create an ORIGINAL consistent character turnaround for the existing Misaki: same soft brown short bob with a small cream hair ornament, warm brown anime eyes, sage cardigan over ivory blouse, cream waist apron, muted plum A-line skirt, cream socks and brown shoes;3.5–4heads tall, gentle adult shopkeeper identity. Four equal separate2048×2048PNG views: front, exact left profile, back, and front three-quarter. Orthographic camera, identical neutral A-pose and proportions/garment lengths in all views, feet on the same baseline, full body with10% safe margin. Soft neutral light and plain warm-gray opaque background; no dramatic shadows, scene, accessories not in the target, text or labels. Hair must be coherent flowing volumes, sleeves must join the shoulders naturally, apron must be cloth rather than a rigid plate. These images guide remodeling; they are NOT a rigged GLB. Do not claim to supply a skeleton, animation file or game-ready3D mesh merely by returning images.

**B2 — 動作研究，每個動作獨立輸出，可直接複製：**

> Use the same Misaki turnaround and approved target, with a locked front three-quarter camera, plain background and full body always visible. Produce one continuous uncut motion reference per file,30fps MP4 if supported: (1)4s calm breathing idle, seamless first/last pose; (2)2s natural in-place walk cycle, seamless, no root drift or foot sliding; (3)1.8s small arrival greeting, turn eyes/head first, gentle outward wave, return to neutral; (4)1.8s departure thank-you, restrained nod/small wave, return to neutral; (5)2.8s cashier handover: prepare/lift/reach, pause with hand in contact at64–74% of the clip, release only at contact, recover. No cuts, camera movement, teleporting bag, extra fingers, wardrobe clipping, exaggerated bouncing or mouth-sync dialogue. Keep garment/body/face identity stable. State the actual duration, frame rate and whether the idle/walk loop joins. This is a motion-study video for retargeting/re-authoring, not a native game animation, sale event or financial timing authority.

如Grok不能輸出指定解析度／透明／一致轉面／長度，請回傳實際能力與原始結果，不用反覆為了「看似符合」而剪接。請保留生成服務、日期、prompt、參考圖及使用權條款來源；沒有把握的授權要說明。

## 整合與驗收界線

真正人物仍需可檢查的3D拓樸、固定joint IDs／pivot、UV／PBR材質與可重建來源。若服務實際提供3D，請另附GLB或FBX、貼圖及授權；仍需驗證而非自動接受。MP4／sprite不能替代店員在3D中繞櫃、面向客人和雙手接觸。

保持原有角色／家具／商品身份和所有master；不新增故事／店鋪／SKU／套裝／能力。新的到店／離店和客人短對話只是presentation，不加Memory、好感或經濟效果。五語意思一致、自然輕鬆書面語，最多一個對話泡、有間隔，財務／故事／面板優先。實作以新draft PR交獨立審查，不在本輪合併或發佈。既有不可讀placement附件不重試；原repo target已實際觀看。
