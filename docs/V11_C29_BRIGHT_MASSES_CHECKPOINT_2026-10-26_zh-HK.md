# V11 C29 白花／布主體重建 — 進行中，原圖仍未通過

先補192來源的驗證缺口：**runtime104845d1af897902297fd759efd699bc8a7eeb38／immutable192**，不是拿184驗證冒充。C29花／布模型仍在本地實際正常畫面迭代，未宣稱材質門檻或原圖接受。PR8保持Draft，沒有merge／Site變更。

- [192重載後真實3D](../evidence/native-v11/checkpoint-29/baseline192-closure/reload/actual-post-reload-normal-game.png)：345 active meshes，兩實際幀後截圖，cash／inventory／存檔逐值相同、隔離Normal不變、0pageerror。
- [192五語Low／觸控模擬／Reduce Motion](../evidence/native-v11/checkpoint-29/baseline192-closure/low/results.json)：15尺寸案例、75面板切換、580px／44px／無overflow／camera穩定通過。
- [192新268.920秒未剪High](../evidence/native-v11/checkpoint-29/baseline192-closure/high/gameplay-uncut.webm)：真買入／上架／招呼／一次普通UI小時結算／A接觸交接／[185.5秒18件+¥8400合計毛利、未扣人工租金](../evidence/native-v11/checkpoint-29/baseline192-closure/high/actual-margin-185_5s.png)／[198.6秒店員回位](../evidence/native-v11/checkpoint-29/baseline192-closure/high/actual-staff-return-198_6s.png)／[215.3秒已服務客人離店](../evidence/native-v11/checkpoint-29/baseline192-closure/high/actual-served-exit-215_3s.png)／[結算後reload真3D](../evidence/native-v11/checkpoint-29/baseline192-closure/high/07-actual-post-reload-game.png)。0pageerror、隔離Normal不變。[完整結果與時間線](../evidence/native-v11/checkpoint-29/baseline192-closure/high/results.json)。

舊184「返回」harness要求店員home與客人outside同一取樣出現；實際店員先回位、客人稍後離店時，店員已恢復工作。新觀察分別記錄兩個真實checkout後事件，沒有改遊戲／覆寫姿態／注入clock或sale，沒有把舊false檔案改成true。192新資料staffHome198.623s、servedExit210.911s；原片手動抽看166.3/174.9/185.53/194.6/201.52/208.47/215.35/224.01秒，151 CDP畫面是稀疏雲端軟件錄影，不是完整流暢度／實體GPU/FPS/audio/native或B／hidden-tab／closure驗收。

C29保留192反射及C27已接受構圖。新花／布原創JSON＋Blender另存，C25/C28母檔不覆蓋；新實際幾何與畫面尚在迭代，**目前沒有C29完整tests／流程接受聲明**。193因TS作者工具缺型別，build失敗後舊dist被誤複製，該圖已標INVALID，不作C29證據；改用set-e及brightMasses runtime身份斷言。194布主褶可見但花冠仍點狀；195/196正在按實際normal-camera投影重建有疏密負空間的花簇，不加花器亮點／AO強度、不擴散全店。LTC403保持停止，無需使用者動作阻塞。
