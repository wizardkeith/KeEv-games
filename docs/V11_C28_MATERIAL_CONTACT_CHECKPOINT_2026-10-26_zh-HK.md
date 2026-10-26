# V11 C28 同桌材質／接觸：進行中，原圖品質仍未通過

Application **c44345d3dcc7abb60b428448021a405c3170c115**；正常選定build181（與實拍180的177個runtime檔逐byte相同）。PR8保持Draft，沒有merge／Site變更。本輪從父執行緒轉述的獨立C27像素覆核繼續：**只通過八庫存狀態的窄幅構圖門檻，沒有通過整體美術，也沒有重跑238tests／386秒影片。**

同一正常鏡頭：[C27 BEFORE](../evidence/native-v11/checkpoint-28/before169-normal-game.png)／[C28正常遊戲AFTER](../evidence/native-v11/checkpoint-28/selected181/combined-normal-game.png)。同一原像素裁切：[BEFORE](../evidence/native-v11/checkpoint-28/before169-full-group.png)／[AFTER](../evidence/native-v11/checkpoint-28/selected181/central-full-group-crop.png)／[唯一原圖局部](../evidence/native-v11/checkpoint-28/original-target-central-crop.png)。[實際UI匯出／匯入、鏡頭及cash/inventory/shelves相同](../evidence/native-v11/checkpoint-28/matched-camera-economy.json)，沒有注入狀態或姿態；原圖相機未知，不宣稱像素配準。

C27花器／書／布／杯群位置完全鎖定，所有實體頂點／indices及60花／300瓣數不變。中央花瓣只改柔和著色法線及既有暖白matte批次；沒有增加批次或花瓣。主花器較寬的釉層／粗糙度、linen sheen經真實材質單獨對照；初期倍率和僅加陰影的收益不足。新增依**既有實際窗孔**計算的64px HDR反射燈光資產，只給主花器且保留原diffuse；是原創解析反射近似，不是場景圖、目標貼圖、GI或動態反射。

同桌實際固定幾何烘焙0.12m接觸AO，四個獨立桌板高度映射UV2。排除人物、玩家庫存、門、FX和存檔，所以不會售罄後殘留杯影。初版V方向錯誤已撤回，用[明確標示的unlit座標診斷](../evidence/native-v11/checkpoint-28/diagnostics/179-UV-diagnostic/)和實際PNG取樣驗證修正；這些白桌圖**不是交付美術**。既有中央燈的局部1024接觸陰影限0.2–5m，避免沿用相機90m深度掩蓋毫米接觸；Low停用該燈的陰影目標，基本動作／存檔不變。沒有重試可選LTC403。

**243tests、build、validate、replay、asset-check通過；146GLB零錯誤警告、305受保護檔案／相機演算法不變。** 原有母檔／Blend及所有已改善模型保留；新增解析反射源、contact Blend／實際幾何輸入和標準GLB occlusion／sheen可重建。styling＋canopy仍15990tri／17材質群。測試沒有冒充原圖品質或實體GPU/FPS驗收。

花器肩腹已有較連續窗光亮帶、固定接觸位置更有層次；白花仍偏點狀、布的光感及整體豐富度仍與原圖有差距。**同桌柔和材質／接觸品質門檻仍開放；不向全店擴散。** 最終材質與照明隔離對照、真實交易及Low／Reduce Motion證據仍在補充；目前不是發佈建議。未新建發佈tar／Site版本／Library重試，未動玩家Chrome／Normal存檔／Unity／關機或帳戶設定，無需使用者動作的阻塞。


## 固定85ff／184驗證完成；獨立材質門檻仍失敗

Application **85ff32d64b127b133e6542344e27be225fa4fb0b**／build184。新增靜態局部陰影快取，只在真實庫存增減／尺寸改變失效；人物仍用原有動態主陰影。[177個runtime檔重建逐byte相同](../evidence/native-v11/checkpoint-28/final184/runtime-rebuild-parity.json)，[39native及319tracked asset檔重建前後不變](../evidence/native-v11/checkpoint-28/final184/c28-rebuild-parity184.json)。319是tracked資產數，並非聲稱319個均重新生成。

- [固定來源正常畫面](../evidence/native-v11/checkpoint-28/final184/stock-cycle/02-eight.png)／[同桌原像素局部](../evidence/native-v11/checkpoint-28/final184/central-group-crop.png)。[實際流程](../evidence/native-v11/checkpoint-28/final184/stock-cycle/results.json)：無效0+Enter不寫入、真實買3再以鍵盤買005至8、8件重載、分別兩次確認小時售至2→0、售罄重載；所有階段AO位置及固定裝飾保留。陰影renderCount 1→2→3，重載後新場景1→2→3；兩實際動畫畫面間不重算，非實體GPU效能認證。
- [15五語／三尺寸案例、75面板切換](../evidence/native-v11/checkpoint-28/final184/framing/results.json)通過，含Low／觸控模擬／Reduce Motion。243tests、build、validate／replay／asset-check，146GLB零錯誤警告、305保護檔通過；記錄在同資料夾。
- [526.040秒未剪真遊戲原片](../evidence/native-v11/checkpoint-28/final184/flow/gameplay-uncut.webm)／[250–280秒連續節錄](../evidence/native-v11/checkpoint-28/final184/flow/continuous-250-280s.webm)／[原片266秒實際合計毛利](../evidence/native-v11/checkpoint-28/final184/flow/actual-margin-266s.png)。High招呼、真實一次結算、收銀接觸、18件+¥8400未扣人工租金已觀察；[原始結果](../evidence/native-v11/checkpoint-28/final184/flow/results.json)的 servedExitAndStaffReturn=false、normalCloseDrainReopen=false，**未宣稱離店返回／關店／B完整流程通過**。182個CDP來源畫面是稀疏雲端軟件錄影，非流暢度／實體GPU/FPS/audio/native。

父執行緒轉述獨立build181像素覆核：**材質／接觸門檻FAIL**。正常大小C27/C28仍相近；放大後花器腹部較暗，但沒有可讀的寬柔釉層形體，白花仍點狀、布未改變整桌觀感。略有接觸改善，不等於原圖風格提升。下一步保持同幾何／相機／漫反射，只切換新反射OFF/ON找出暗化來源，先改善正常尺度肩腹明暗，不加微紋／AO強度、不向全店擴散。公開V17不變，PR8仍Draft。
