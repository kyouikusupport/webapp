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
        const elapsed = now - lastTime;

        if (elapsed >= updateInterval) {
            lastTime = now;

            if (timerIsCountdown) {
                if (timerElapsedTime > 0) {
                    timerElapsedTime -= 1; // カウントを減らす
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

                    return; // ここで終了（カウントをこれ以上進めない）
                }
            } else {
                timerElapsedTime += 1; // カウントアップ
            }

            updateTimerDisplay(); // 表示を更新
        }

        timerTimeout = setTimeout(timerLoop, updateInterval - (elapsed % updateInterval));
    }

    timerLoop(); // タイマー処理を開始
}

// モーダルを表示または非表示に切り替える
document.getElementById("showTimerButton").addEventListener("click", () => {
    if (timerWindow.style.display === "block") {
        // ウィンドウが表示中の場合は非表示にする
        timerWindow.style.display = "none";
    } else {
        // ウィンドウが非表示の場合は表示する
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
        // ストップボタンの動作
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

        // タイマーを初期値に戻す（カウントダウン時のみ）
        if (timerIsCountdown) {
            timerElapsedTime = timerInitialCountdownValue;
            updateTimerDisplay();
        }
    } else {
        // スタートボタンの動作
        timerIsRunning = true;

        if (timerIsCountdown === null) {
            timerIsCountdown = timerElapsedTime > 0; // 初回のみ設定
            if (timerIsCountdown) timerInitialCountdownValue = timerElapsedTime; // 初期値を記録
        }

        timerStartStopButton.textContent = "ストップ";

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

// タイマーウインドウをドラッグ可能にする
function makeTimerWindowDraggable() {
    const header = timerWindow.querySelector(".timer-window-header");
    let offsetX = 0, offsetY = 0, isDragging = false;

    header.addEventListener("mousedown", (e) => {
        isDragging = true;
        offsetX = e.clientX - timerWindow.offsetLeft;
        offsetY = e.clientY - timerWindow.offsetTop;
        document.addEventListener("mousemove", moveTimerWindow);
        document.addEventListener("mouseup", stopDragging);
    });

    header.addEventListener("touchstart", (e) => {
        isDragging = true;
        const touch = e.touches[0];
        offsetX = touch.clientX - timerWindow.offsetLeft;
        offsetY = touch.clientY - timerWindow.offsetTop;
        document.addEventListener("touchmove", moveTimerWindow);
        document.addEventListener("touchend", stopDragging);
    });

    function moveTimerWindow(e) {
        if (isDragging) {
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            timerWindow.style.left = `${clientX - offsetX}px`;
            timerWindow.style.top = `${clientY - offsetY}px`;
        }
    }

    function stopDragging() {
        isDragging = false;
        document.removeEventListener("mousemove", moveTimerWindow);
        document.removeEventListener("mouseup", stopDragging);
        document.removeEventListener("touchmove", moveTimerWindow);
        document.removeEventListener("touchend", stopDragging);
    }
}

makeTimerWindowDraggable();

// 初期状態でタイマー表示を更新
updateTimerDisplay();
