// タイマーの状態を管理する変数
let timerElapsedTime = 0; // 経過時間を秒単位で管理
let timerIsRunning = false; // タイマーが動作中かどうか
let timerInterval; // タイマーのインターバルID
let timerIsCountdown = false; // カウントダウンモードかどうか

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

// モーダルを開く
document.getElementById("showTimerButton").addEventListener("click", () => {
    timerWindow.style.display = "block";
});

// モーダルを閉じる
closeTimerButton.addEventListener("click", () => {
    timerWindow.style.display = "none";
});

// タイマーをスタートまたはストップ
timerStartStopButton.addEventListener("click", () => {
    if (timerIsRunning) {
        clearInterval(timerInterval);
        timerIsRunning = false;
        timerStartStopButton.textContent = "スタート";
    } else {
        timerIsRunning = true;
        if (timerElapsedTime > 0) timerIsCountdown = true;
        timerStartStopButton.textContent = "ストップ";

        timerInterval = setInterval(() => {
            if (timerIsCountdown) {
                timerElapsedTime -= 1;
                if (timerElapsedTime <= 0) {
                    clearInterval(timerInterval);
                    timerElapsedTime = 0;
                    updateTimerDisplay();
                    timerDisplay.classList.add("flashing");
                    beepSound.play().catch((error) => console.error("音声エラー", error));
                    setTimeout(() => timerDisplay.classList.remove("flashing"), 4000);
                    timerIsRunning = false;
                    timerStartStopButton.textContent = "スタート";
                    return;
                }
            } else {
                timerElapsedTime += 1;
            }
            updateTimerDisplay();
        }, 1000);
    }
});

// タイマーをリセット
timerResetButton.addEventListener("click", () => {
    clearInterval(timerInterval);
    timerElapsedTime = 0;
    timerIsRunning = false;
    timerIsCountdown = false;
    updateTimerDisplay();
    timerDisplay.classList.remove("flashing");
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

    // マウスイベント: ドラッグ開始
    header.addEventListener("mousedown", (e) => {
        isDragging = true;
        offsetX = e.clientX - timerWindow.offsetLeft;
        offsetY = e.clientY - timerWindow.offsetTop;
        document.addEventListener("mousemove", moveTimerWindow);
        document.addEventListener("mouseup", stopDragging);
    });

    // タッチイベント: ドラッグ開始
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
