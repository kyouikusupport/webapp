let buttonStates = {};  // ボタンの状態を保持する

window.onload = function() {
    // 初期状態で結果ボックスを非表示にする
    hideResult();
};

function toggleButton(button, index) {
    // ボタンの状態をトグルする
    if (button.textContent === "－") {
        button.textContent = "✕";
    } else if (button.textContent === "✕") {
        button.textContent = "〇";
    } else if (button.textContent === "〇") {
        button.textContent = "－";
    }

    // ボタンの状態を更新する
    const buttons = document.querySelectorAll(`#result${index} button`);
    const states = Array.from(buttons).map(btn => btn.textContent);
    buttonStates[index] = states;

    // すべてのボタンが「✕」になった場合に結果を表示し、それ以外の場合は非表示にする
    if (states.every(state => state === "✕")) {
        showResult();  // 記録を表示
    } else {
        hideResult();  // 記録を非表示
    }
}

function calculateTarget() {
    const height = parseFloat(document.getElementById("height").value);
    const time = parseFloat(document.getElementById("time").value);
    const difficulty = parseFloat(document.getElementById("difficulty").value);

    if (!isNaN(height) && !isNaN(time) && !isNaN(difficulty)) {
        const targetRecord = height * 0.5 - time * 10 + difficulty;
        document.getElementById("targetRecord").textContent = `${targetRecord.toFixed(1)} cm`;
    } else {
        document.getElementById("targetRecord").textContent = "--";
    }
}

function incrementSpecificHeight(index, value) {
    // 対応するセルの高さを取得して、値を変更
    const targetHeightSpan = document.getElementById(`height${index}`);
    const currentHeight = parseInt(targetHeightSpan.textContent.replace("cm", ""));
    const newHeight = currentHeight + value;

    // 変更対象のセルの値を更新
    targetHeightSpan.textContent = `${newHeight}cm`;

    // 自分より右側のセルの高さを自動で+5cmずつ更新
    for (let i = index + 1; i <= 12; i++) {
        const heightSpan = document.getElementById(`height${i}`);
        const updatedHeight = newHeight + (i - index) * 5;
        heightSpan.textContent = `${updatedHeight}cm`;
    }
}

// 初期化時にローカルストレージからデータを読み込み
window.onload = function() {
    loadStoredData();
    calculateTarget(); // 初期表示の目標記録を計算
};

function adjustValue(id, increment) {
    if (id === "height") {
        const heightSpan = document.getElementById("height");
        let currentHeight = parseInt(heightSpan.textContent);
        currentHeight = Math.max(100, Math.min(250, currentHeight + increment)); // 身長は100～250cmの範囲に制限
        heightSpan.textContent = currentHeight;
        localStorage.setItem("height", currentHeight); // ローカルストレージに保存
    } else if (id === "time") {
        const timeSpan = document.getElementById("time");
        let currentTime = parseFloat(timeSpan.textContent);
        currentTime = Math.max(5, Math.min(20, currentTime + increment)); // タイムは5～20秒の範囲に制限
        currentTime = parseFloat(currentTime.toFixed(1)); // 小数点以下1桁に丸める
        timeSpan.textContent = currentTime;
        localStorage.setItem("time", currentTime); // ローカルストレージに保存
    }
    calculateTarget(); // 値が変わったので目標記録を再計算
}

function calculateTarget() {
    const height = parseInt(document.getElementById("height").textContent);
    const time = parseFloat(document.getElementById("time").textContent);
    
    // 選択された難易度のラジオボタンの値を取得
    const difficulty = document.querySelector('input[name="difficulty"]:checked');
    const difficultyValue = difficulty ? parseFloat(difficulty.value) : 0;

    if (!isNaN(height) && !isNaN(time) && difficultyValue) {
        const targetRecord = height * 0.5 - time * 10 + difficultyValue;
        document.getElementById("targetRecord").textContent = `${targetRecord.toFixed(1)} cm`;
    } else {
        document.getElementById("targetRecord").textContent = "--";
    }

    // 難易度が選択されている場合にローカルストレージに保存
    if (difficulty) {
        localStorage.setItem("difficulty", difficulty.value);
    }
}

// ローカルストレージからデータを読み込む関数
function loadStoredData() {
    const storedHeight = localStorage.getItem("height");
    const storedTime = localStorage.getItem("time");
    const storedDifficulty = localStorage.getItem("difficulty");

    if (storedHeight !== null) {
        document.getElementById("height").textContent = storedHeight;
    }
    if (storedTime !== null) {
        document.getElementById("time").textContent = storedTime;
    }
    if (storedDifficulty !== null) {
        document.querySelector(`input[name="difficulty"][value="${storedDifficulty}"]`).checked = true;
    }
}

function showResult() {
    let maxRecord = 0;

    // 〇がついているセルの中で最大の記録を探す
    for (let i = 1; i <= 12; i++) {
        if (buttonStates[i] && buttonStates[i].includes("〇")) {
            const height = parseInt(document.getElementById(`height${i}`).textContent.replace("cm", ""));
            if (height > maxRecord) {
                maxRecord = height;
            }
        }
    }

    // 記録を表示する
    const resultBox = document.getElementById("result-box");
    if (maxRecord > 0) {
        resultBox.textContent = `記録: ${maxRecord}cm`;
    } else {
        resultBox.textContent = "記録: なし";
    }
    resultBox.style.display = "block";  // 記録を表示
}

function hideResult() {
    const resultBox = document.getElementById("result-box");
    resultBox.style.display = "none";  // 記録を非表示
}
