# V11 C28 反射暗化診斷／固定192（原圖品質未通過）

Application **104845d1af897902297fd759efd699bc8a7eeb38**／build192，PR8保持Draft，公開V17不變。C27已通過的窄幅構圖完全鎖定；build181獨立材質／接觸門檻FAIL，沒有把微小像素變化稱作目標風格通過。本輪只處理主花器低頻形體及來源釐清，沒有重排物件、加花瓣、加微紋或加深AO。

[唯一原圖](codex-v4/reference/Approved_Visual_Target_Misaki.png)／[C27正常BEFORE](../evidence/native-v11/checkpoint-28/before169-normal-game.png)／[固定192正常遊戲AFTER](../evidence/native-v11/checkpoint-28/selected192/combined-normal-game.png)。全是原始遊戲像素；原圖是參考，非遊戲畫面。角色idle時點可不同；店鋪相機／庫存／構圖一致，沒有注入姿態／狀態。原圖相機未知，不宣稱像素配準。

## 已完成的控制對照

- [C27／C28反射OFF／ON](../evidence/native-v11/checkpoint-28/reflection-diagnostic/c28-reflection-comparison.png)：185／186同幾何、相機、材質、直接光、漫反射SH及接觸，只切換新反射。ON腹部較暗；舊C28用較暗的解析背景替換原有房間反射，是實際暗化來源。
- 解碼mip0數值：原有房間RGB平均約0.804/0.696/0.603，舊C28約0.386/0.350/0.316；這是診斷，**不是視覺品質分數**。[保留房間187](../evidence/native-v11/checkpoint-28/reflection-diagnostic/c28-room-baseline-comparison.png)消除暗背景替換，但正常尺度增益不足。
- [窗孔強度×4試驗188](../evidence/native-v11/checkpoint-28/reflection-diagnostic/c28-window188-comparison.png)及[較厚／較粗釉層190](../evidence/native-v11/checkpoint-28/reflection-diagnostic/c28-coat190-comparison.png)主要強化小亮點，沒有足夠寬柔正常尺度增益，均不採用。主釉層恢復0.22/0.38，幾何／albedo不變。
- [選定寬柔反射191對照](../evidence/native-v11/checkpoint-28/reflection-diagnostic/c28-bounce191-comparison.png)：保留既有實際房間反射，加入朝既有窗孔的cos²低頻窗／室內反射光瓣。主花器肩腹比舊C28連續、明亮，為實作者觀察，**尚未獨立通過材質門檻**。191反射資產與192逐byte相同；64px／42RGBD faces／41008bytes，SH、直接光與其他材質不變。這是原創art-directed反射近似，非新GI、實測photometry、背景圖或目標圖片貼圖；未重試LTC403。

[各變體完整正常圖、runtime雜湊、作者腳本及限制](../evidence/native-v11/checkpoint-28/reflection-diagnostic/)保留。原有C28反射、原母檔及Blender仍在完整Git歷史／資產目錄；新線性HDR與生成器可重建。沒有擴散到全店或修改stock/economy/save/rig/相機演算法。

## 來源與驗證界線

固定192：244tests、build／validate五語174keys／replay／asset-check通過；146GLB零錯誤警告、305保護檔／相機演算法不變，39native及436 tracked資產／public素材重建前後一致（不聲稱436個均重新生成）。177個runtime與測試immutable192逐byte相同；新反射env／線性源／provenance四檔重新生成一致。[記錄](../evidence/native-v11/checkpoint-28/selected192/)。新測試實際解碼RGBD，防止反窗方向把原有房間反射重新壓暗，並非把測試當作美術驗收。

[192實際同高視角A](../evidence/native-v11/checkpoint-28/selected192/actual-orbit-a.png)／[B](../evidence/native-v11/checkpoint-28/selected192/actual-orbit-b.png)、[124.040秒未剪原片](../evidence/native-v11/checkpoint-28/selected192/gameplay-uncut.webm)／[85–115秒連續節錄](../evidence/native-v11/checkpoint-28/selected192/continuous-85-115s.webm)已完成。正常相機及8件經濟狀態與C27逐值相同；兩個實際pointer角度穩定後開面板／重選同一Shop視角保留角度，實買1杯cost70：cash3840→3770、stock8→9，重載存檔逐值相同、隔離Normal不變、0pageerror。[實際結果](../evidence/native-v11/checkpoint-28/selected192/results.json)。前兩次harness失敗分別為把同一Shop按鈕誤當reset、未等慣性停止；僅修正測試的穩定條件，未改遊戲／覆寫相機，失敗log保留。

原片50個CDP來源畫面，抽看0/14.34/30.58/44.46/58.61/80.62/90.44/105.28/122.84秒：視角變化和買入UI有實拍，未見明顯螢幕固定反射貼圖；不是所有角度／精確接觸認證。**片尾122.84秒在reload渲染暖機畫面，只確認資料重載，不宣稱post-reload3D畫面已完成**。原片與限制完整保留，沒有把這次局部流程序稱為新High完整結算／交接／離店／關店／B流程。

先前**85ff／184**的243tests、五語15尺寸／75面板、實買3+005至8／重載／兩次UI結算2→0／售罄reload及526.040秒未剪High另存[固定184證據與限制](V11_C28_MATERIAL_CONTACT_CHECKPOINT_2026-10-26_zh-HK.md)。原片266秒讀到18件+¥8400合計毛利／未扣人工租金；該來源servedExitAndStaffReturn=false及closure未驗證，沒有混作192通過。

**整體原圖仍不合格**：白花仍點狀、linen及整店材質／柔光豐富度仍不足；本輪較亮形體也不能自行宣告釉面標準通過。所有畫面是雲端SwiftShader實際WebGL／CDP稀疏錄影，非概念／studio替身，也非實體GPU/FPS/audio/native或連續流暢度認證。無merge／Site save/deploy／新發佈tar／Library重試／玩家Chrome或Normal／Unity／關機；沒有需使用者動作阻塞。
