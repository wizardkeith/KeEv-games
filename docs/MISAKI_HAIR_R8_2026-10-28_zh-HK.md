# Misaki R8：全髮體積重排候選，身分／畫風仍未通過

本輪基線 `6e1fd6dcbad834765331b893d5f709953e29244d`，來源提交 `231722cf1ed06178877c88f4da368c94a54722ae`，既有隔離分支 `codex/asset-foundation-v1`。R7獨立覆核FAIL後，本輪解凍全部未接受的頭髮10–16，停止只改兩片前髮的策略。Source checkpoint已normal push及獨立讀回相同SHA；本報告、PNG、JSON及log構成額外證據checkpoint，其最終hash與遠端讀回由交付訊息外部報告。

**R8仍不是身分／畫風PASS。** 本輪完成全髮重排和真實檢驗，但對原圖仍有顯著差距，不能稱已匹配或採用。沒有衣服、細髮絲、rig、Unity或新材質工作。原公開Site及玩家存檔不變。

## 實際像素證據

編輯前再次打開原圖 `docs/codex-v4/reference/Approved_Visual_Target_Misaki.png`，SHA256 `9f855d2ecfd120bb45c001db3fa9b5a3e3b58b2b3c2a4cf9e7ebfda84f8f7114`，以及R7對照與獨立FAIL意見。沒有重試PlanB，也沒有聲稱看過其內容；側／背與背部細節仍為推定。

- [原圖／同機R7／R8正面頭部](reviews/evidence/misaki-grayform-v1-r8/original-r7-r8-front-head480.png)
- [原圖／同機R7／R8三分之四頭部](reviews/evidence/misaki-grayform-v1-r8/original-r7-r8-threequarter-head480.png)
- [原圖／R7／R8正常遊戲鏡頭](reviews/evidence/misaki-grayform-v1-r8/original-r7-r8-normal-game480.png)
- [側／背推定體積](reviews/evidence/misaki-grayform-v1-r8/r8-inferred-side-back480.png)
- [14張原始實拍、載入hash及鏡頭／光／材質條件](reviews/evidence/misaki-grayform-v1-r8/capture.json)
- [每個比較圖的來源、crop、比例縮放及SHA](reviews/evidence/misaki-grayform-v1-r8/comparison-provenance.json)

R7與R8使用同一台機的headless Chrome156／Intel ANGLE渲染，以獨立fresh contexts載入已固定SHA的各自GLB；相同、未改的studio/gameplay TS、相同鏡頭、燈光和灰材質。只改頁面revision文字。比較圖僅裁切、等比縮放、排列、標註；沒有補畫、調色或生成參考。原圖三分之四姿勢／投影不同，並非精確正交正面或turnaround，不能以排版假裝同視角。

## 這次全髮重排與實際回饋

七個原生hair objects保留，但內部重建成14個中等髮束控制網：兩束主前髮、獨立朝髮夾方向展開的副束、兩束耳前／耳後框架、兩束後中髮、三束較長自身右側bob、兩束較短自身左後bob，以及兩片偏心分界根部。每束都有明確逐列中心／橫向向量、轉動的曲面和獨立終點；兩層閉合側壁的厚度控制為1.6–3.8mm，局部Subsurf1，沒有球殼底、全局融合、voxel、decimation或個別細髮絲。

第一份真正引擎實拍顯示髮束之間空隙太大、固定髮夾失去承托；看圖時曾初判部分髮束可能陷入頭部。其後檢查實際頭部射線包絡，**沒有觸發任何外移控制點：0點、最大位移0**，因此不能聲稱修好了穿頭問題。一次整體結構修正加強中段覆蓋和重疊、重畫髮夾下方副束轉向、把耳前髮退到耳前、安排不等長下顎附近收尾；前髮不是再向下遮眼。最後保存的是真正控制頂點，曲線只作參考，並非live drivers。

實拍可見兩束主髮分開收尾、耳側開口與長短不一的尾部。精確相同鏡頭方向的上睫毛取樣射線：R7正面自身右側30/78頂點被hair擋住，R8兩眼正面及三分之四均0/78。這只證明此取樣，**不是最終像素、眼睛可讀性或美術接受**。

仍然明顯不足：髮根的交接與狹縫機械化；大片側／背層次仍偏面板，副束和耳前束仍顯長條／尖片；額前分束也未重現原圖自然的掃勢、鬆散重疊與飽滿bob。正常遊戲尺度下並沒有可據以宣稱身分通過的改善。髮夾可見度／貼髮關係仍需覆核：156個固定clip頂點至hair的unsigned距離約0.047–14.893mm、平均6.728mm，較R7更差；沒有移動髮夾或把距離說成碰撞／依附證明。**本輪自檢仍未達身分／畫風門檻，停止造型修改交獨立覆核。**

## 保留範圍與真正產物

37個非頭髮物件的原生頂點／面／TRS／材質，以及evaluated幾何逐項保留。原嚴格validator繼續核對所有27個非hair GLB POSITION／NORMAL／index streams和TRS；R3臉／眼／身體24streams、R2臉頸定義、七灰材質及29個accepted prop files仍保持原byte assertions。沒有放寬hash／容差。身體、耳朵、髮夾、確定性sRGB8、五語、經濟、存檔及studio/game TS均未改；scope guard另檢查其餘5,264個既有tracked檔案不變。

| 產物 | 大小 | SHA256 |
| --- | ---: | --- |
| [可編輯 `.blend`](../assets/authoring/misaki-grayform-v1/misaki-grayform.blend) | 1,335,728 bytes | `5cd7463fd7a83f13a13612569ab671e17fc8723b973133eb6ec9a84c47b080e4` |
| [真正 `.glb`](../public/assets/misaki-grayform-v1/misaki-grayform.glb) | 925,244 bytes | `0da0ef622a775aaa8d75b951cd8d8705bfc1bf73fd0ea94965216e722b7fc2f8` |

Blender5.2.3LTS保存後以獨立背景程序重新打開`.blend`，再在空場景import實際GLB：44個原生mesh、14個參考guide、七個hair groups／14個closed clumps、5個GLB meshes、10primitives、7materials、50,632tri（比R7多912tri），0images／skins／animations，足底Y=0。closed shell／無零面積面不等於clump互不穿插、全頭焊接、製作拓撲、碰撞或rig合格。

這是背景Python明確控制頂點＋實際渲染回饋；沒有GUI拖點、monitor隔離或Unity/MCP能力宣稱。原生控制網／局部modifier可供後續直接編輯，但本輪沒有控制使用者視窗或滑鼠鍵盤。背景匯入有既有非阻塞extensions cache權限警告，沒有因此改設定或裝外掛。

## 本輪真正執行的驗證

- native build／export及獨立`.blend`、GLB重開，原生控制網計數及上睫毛取樣射線記錄。
- 原`validate-misaki-gray.mjs`：0errors、0warnings，所有舊保留斷言照用。
- `tsc --noEmit`、`vite build`、**304/304tests、0fail、0skip**、`validate`、`replay`、root `asset-check`及authoring strict TS均exit0。Vite既有大chunk提示保留。
- 最終同機14張引擎實拍及GLB HTTP body SHA核對，0pageerror；fresh Sandbox買3杯cash5000→4790、stock3／slot2，reload逐值相同，Low→High保留模型，隔離context的Normal基線不變。從未附加或讀寫玩家原browser profile／Normal存檔。
- 測試輸出的歷史locomotion證據已另存本輪結果並還原tracked原byte，沒有覆蓋舊驗證歷史。

所有命令／log收於[驗證清單](reviews/evidence/misaki-grayform-v1-r8/command-results.json)，沒有把先前R7測試冒充本輪重跑。正常畫面中的後方灰色A-pose是DEV authoring sample `[.85,.079,1.35]`、yawπ；前方彩色gameplay staff仍是原版，普通`/`未換人。沒有完整遊戲角色、動畫、持續FPS、實體裝置或音訊認證。

重現指令見[authoring README](../tools/asset-foundation/MISAKI_GRAY_README.md)。完整證據提交 `8775cd2e3809ddffae3c988b580ab2c0b4cda2a8` 已normal push及獨立讀回同SHA；此後只補收尾記錄，未再改來源、美術或圖片。

同步後才清理本任務 `hair-r8` 冗餘暫存：25個檔案先收入ZIP，逐一核對檔長及SHA256後才移除原目錄。邏輯資料容量由2,595,374變為1,180,836 bytes，減少1,414,538 bytes；未量度或聲稱實體磁碟free-space／RAM節省。回退ZIP仍在task根目錄 `hair-r8-scratch-rollback-8775cd2.zip`，SHA256 `83115ef04e5e8719a5d6614d93390674941b6cddf5f700a6d89dfae9ba8524a6`；詳見[清理回執](reviews/evidence/misaki-grayform-v1-r8/cleanup.json)。保留原圖、最新來源、所有必要實拍及驗證、Git中R7 rollback、先前R7回退ZIP及可重用依賴，沒有終止用戶程序。

本輪停在未接受的全髮候選，最終收尾commit與遠端SHA由交付訊息外部讀回，不在本文自引用。沒有再追加造型、PR重試、merge、公開Site、Unity遷移或玩家存檔變更。
