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
