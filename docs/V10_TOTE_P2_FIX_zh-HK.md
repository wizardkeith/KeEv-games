# V10 布袋 P2 接點修訂 — 待獨立複核

本輪只修 `off.tote` 的實際模型及衍生檔。[完整獨立審查 d1b4cb9](https://github.com/wizardkeith/KeEv-games/blob/d1b4cb9ad91338d5cebd56d971255041bc494647/docs/reviews/V10_INDEPENDENT_REVIEW_2026-10-25_zh-HK.md) 已讀；原候選486bc360／application0626469的P2仍是歷史拒絕結果。以下是作者自檢，**未代表 reviewer 已解除 hold，未合併／未發佈。原目標美術仍未接受。**

## 原因與實際改動

舊袋身使用向+Z單邊延伸的86mm厚布面，配件卻按居中平面設在負Z；袋身前後皮面／側邊的朝向也不一致，正常背面剔除會露出錯誤的皮面。新 `src/art/tote-v10.ts` 在袋身局部座標中置中厚度，明確建立向外的前／後面及側邊，再按真正三角形求接點。

- 印畫裁切並跟隨真正布面三角形。前面距布面0.60mm，實體背面伸入支撐0.05mm，側邊封合；實際0.65mm紙層橋接接觸，不是浮空平面或depth-bias。
- 兩條縫線沿實際布面取點；全50個環中心的最大距離1.14315mm，小於1.5mm線半徑；reviewer的左右中點射線均穿過縫線與袋面交集。
- 前後手挽四個根部中心接到各自真正的前／後袋面；運行時殘差低於0.001mm。保留原手挽高度、原SKU／顏色與陳列方式。
- 只改厚袋身自己的構造；共享 `sculptCloth`、人物／已修圍裙、收銀交袋小道具、路徑／手部接觸 solver 全不變。其餘九款商品及其GLB逐檔比對不變。

[實際量測及舊值](../evidence/native-v10/tote-fix/checks/attachments.json)：舊印畫51.217mm、左右縫80.305／80.051mm、前手挽根59.457mm。新量測直接讀 actual mesh，沒有把舊probe的固定Z值當作新接點。

## 實拍及查核

- 相同相機／正常剔除／相同PBR輸入的真正3D近鏡：[BEFORE正面](../evidence/native-v10/tote-fix/studio/before-front.png)、[AFTER正面](../evidence/native-v10/tote-fix/studio/after-front.png)、[BEFORE側面](../evidence/native-v10/tote-fix/studio/before-side.png)、[AFTER側面](../evidence/native-v10/tote-fix/studio/after-side.png)。這是獨立中性asset studio，不冒稱正常遊玩鏡頭或原目標接受。
- 真正production High、fresh Sandbox：購入2個布袋（stock0→2、內部金額5000→4840，UI為¥50,000→¥48,400）、陳列、重載，隔離Normal基線不變、0pageerrors。[遊戲畫面](../evidence/native-v10/tote-fix/play/tote-in-shop.png)、[結果](../evidence/native-v10/tote-fix/play/results.json)、[原始完整錄影](../evidence/native-v10/tote-fix/play/purchase-place-reload-full.webm)。
- **174tests pass**，含原圍裙獨立密集射線檢查，新增布袋皮面朝向／200+印畫接觸樣本／全縫環／四個手挽根回歸；舊分離模型會被區分。build／validate／replay／asset-check pass。[174tests](../evidence/native-v10/tote-fix/checks/174-tests.log)。
- 245資產重建一致、276原保護檔／原11commit保留；全部139保留GLB零errors/warnings。重開 `product-off.tote.glb` 比對21,144個position／normal／UV／index值，最大float誤差2.973e-8。[GLB parity](../evidence/native-v10/tote-fix/checks/glb-parity.json)、[範圍](../evidence/native-v10/tote-fix/checks/scope.json)。商品JSON master／manifest、布袋GLB／fixtures manifest及bundle已更新。
- 新部署包另存於 [tote-fix/delivery](../evidence/native-v10/tote-fix/delivery/receipt.json)，**保留舊原候選封包及證據**。application `b06247fcae6d02a69e8cff56e2ace124f4bfc883`，src tree `219e499f7421cdb7896a6e01fea825d53f269b54`；134runtime+hosting=135 actual tar entries，6,304,337bytes，SHA256 `4b6d1d360489bd0034d12202f71de32c9b37af5f99110e241c3d67c47dc8297a`；逐檔同實際browser build核對。

本次沒有重跑無變更的全店55個UI案例或完整138.76秒收銀；其源碼／帳目／動畫不變，既有獨立結果仍按原提交歸屬。45秒High idle-work close-up仍未接受，physical GPU/FPS/audio/native等界線不變。本輪只交P2修訂供複核，不宣稱整體美術或自然動作最終達標。沒有Site、玩家Normal、本機Unity／Blender、權限或Grok操作。

先前Library ZIP `libfile_41d39e7448688191a302ab2cc6a3f892` 保留原候選審查版本，**不包含本次修正**；本次新包／證據以本Git固定提交為準。
