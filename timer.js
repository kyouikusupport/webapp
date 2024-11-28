// タイマーの状態を管理する変数
let timerElapsedTime = 0; // 経過時間を秒単位で管理
let timerIsRunning = false; // タイマーが動作中かどうか
let timerTimeout; // setTimeoutのID
let timerIsCountdown = null; // カウントダウンモードかどうか
let timerInitialCountdownValue = 0; // カウントダウンモード時の初期値
let timerIsFlashing = false; // 点滅中かどうか
let beepSoundPlaying = false; // 音が再生中かどうか

// タイマー関連の要素を取得
const timerWindow = document.getElementById("TimerWindow");
const timerDisplay = document.getElementById("TimerDisplay");
const timerStartStopButton = document.getElementById("timerStartStopButton");
const timerResetButton = document.getElementById("timerResetButton");
const timerAddMinuteButton = document.getElementById("timerAddMinuteButton");
const timerSubtractMinuteButton = document.getElementById("timerSubtractMinuteButton");
const timerAddSecondButton = document.getElementById("timerAddSecondButton");
const timerSubtractSecondButton = document.getElementById("timerSubtractSecondButton");
const closeTimerButton = document.getElementById("closeTimerButton");
const beepSound = document.getElementById("beep-sound");

// 通知の許可をリクエスト
if (Notification.permission !== "granted") {
    Notification.requestPermission().then((permission) => {
        if (permission !== "granted") {
            console.warn("通知の許可が得られませんでした。");
        }
    });
}

// タイマー表示を更新
function updateTimerDisplay() {
    const hours = Math.floor(timerElapsedTime / 3600);
    const minutes = Math.floor((timerElapsedTime % 3600) / 60);
    const seconds = timerElapsedTime % 60;
    timerDisplay.textContent = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

// タイマーを動作させる
function startTimer() {
    const updateInterval = 1000; // 1秒間隔
    let lastTime = performance.now(); // 前回の時間を記録

    function timerLoop() {
        if (!timerIsRunning) return; // タイマーが停止中の場合は終了

        const now = performance.now();
        const elapsed = Math.floor((now - lastTime) / 1000);

        if (elapsed > 0) {
            lastTime += elapsed * 1000;

            if (timerIsCountdown) {
                if (timerElapsedTime > 0) {
                    timerElapsedTime -= elapsed;
                }

                if (timerElapsedTime <= 0) {
                    timerElapsedTime = 0;
                    updateTimerDisplay();

                    // 点滅と音声を開始
                    if (!timerIsFlashing) {
                        timerDisplay.classList.add("flashing");
                        timerIsFlashing = true;
                    }
                    if (!beepSoundPlaying) {
                        beepSound.play().catch((error) => console.error("音声エラー", error));
                        beepSoundPlaying = true;
                    }

                    // 通知を送信
                    if (Notification.permission === "granted") {
                        new Notification("タイマーが終了しました！");
                    }

                    return; // タイマー終了後はループを停止
                }
            } else {
                timerElapsedTime += elapsed; // カウントアップ
            }

            updateTimerDisplay(); // 表示を更新
        }

        timerTimeout = setTimeout(timerLoop, updateInterval);
    }

    timerLoop(); // タイマー処理を開始
}

// モーダルを表示または非表示に切り替える
document.getElementById("showTimerButton").addEventListener("click", () => {
    if (timerWindow.style.display === "block") {
        timerWindow.style.display = "none";
    } else {
        timerWindow.style.display = "block";
    }
});

// モーダルを閉じる
closeTimerButton.addEventListener("click", () => {
    timerWindow.style.display = "none";
});

// タイマーをスタートまたはストップ
timerStartStopButton.addEventListener("click", () => {
    if (timerIsRunning) {
        timerIsRunning = false;
        clearTimeout(timerTimeout);
        timerStartStopButton.textContent = "スタート";

        // 点滅と音声を停止
        if (timerIsFlashing) {
            timerDisplay.classList.remove("flashing");
            timerIsFlashing = false;
        }
        if (beepSoundPlaying) {
            beepSound.pause();
            beepSound.currentTime = 0;
            beepSoundPlaying = false;
        }

        // タイマーが0の場合のみ初期値に戻す
        if (timerIsCountdown && timerElapsedTime === 0) {
            timerElapsedTime = timerInitialCountdownValue;
            updateTimerDisplay();
        }
    } else {
        timerIsRunning = true;

        if (timerIsCountdown === null) {
            timerIsCountdown = timerElapsedTime > 0; // 初回のみ設定
            if (timerIsCountdown) timerInitialCountdownValue = timerElapsedTime; // 初期値を記録
        }

        timerStartStopButton.textContent = "ストップ";

        // 音声の予約再生
        beepSound.play().then(() => beepSound.pause()).catch((error) => console.error("音声予約失敗:", error));

        startTimer(); // タイマーを開始
    }
});

// タイマーをリセット
timerResetButton.addEventListener("click", () => {
    timerIsRunning = false;
    clearTimeout(timerTimeout);
    timerElapsedTime = 0; // リセット時は常に0に戻す
    timerIsCountdown = null;
    updateTimerDisplay();

    // 点滅と音声を停止
    if (timerIsFlashing) {
        timerDisplay.classList.remove("flashing");
        timerIsFlashing = false;
    }
    if (beepSoundPlaying) {
        beepSound.pause();
        beepSound.currentTime = 0;
        beepSoundPlaying = false;
    }

    timerStartStopButton.textContent = "スタート";
});

// +1分
timerAddMinuteButton.addEventListener("click", () => {
    timerElapsedTime += 60;
    updateTimerDisplay();
});

// -1分
timerSubtractMinuteButton.addEventListener("click", () => {
    timerElapsedTime = Math.max(0, timerElapsedTime - 60);
    updateTimerDisplay();
});

// +1秒
timerAddSecondButton.addEventListener("click", () => {
    timerElapsedTime += 1;
    updateTimerDisplay();
});

// -1秒
timerSubtractSecondButton.addEventListener("click", () => {
    timerElapsedTime = Math.max(0, timerElapsedTime - 1);
    updateTimerDisplay();
});

// 初期状態でタイマー表示を更新
updateTimerDisplay();
