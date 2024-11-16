let strategies = []; // 複数の作戦を管理する配列
let currentStrategyIndex = 0; // 現在選択中の作戦インデックス
let currentScene = 0; // 現在のシーン（0〜4）
let isPlaying = false; // 再生中かどうかのフラグ
let frameIndex = 0; // 現在のフレームインデックス
let animationFrameId; // `requestAnimationFrame`のID
let redPointCounter = parseInt(localStorage.getItem('redPointCounter')) || 1; // ローカルストレージから赤のカウンターを取得
let bluePointCounter = parseInt(localStorage.getItem('bluePointCounter')) || 1; // ローカルストレージから青のカウンターを取得

// 作戦の初期化
window.onload = () => {
    const savedData = JSON.parse(localStorage.getItem('strategiesData'));

    if (savedData) {
        strategies = savedData;
    } else {
        strategies = [[[], [], [], [], []]]; 
    }
    
    updateTabs();
    loadStrategy(0); // 最初の作戦をロード
    changeScene(1); // 最初のシーンを表示

    // ウインドウの初期位置を右下に設定
    const pointControlWindow = document.getElementById('pointControlWindow');
    if (pointControlWindow) {
        pointControlWindow.style.bottom = '10px'; // 画面下から10px
        pointControlWindow.style.left = '10px'; // 画面右から10px
        pointControlWindow.style.position = 'fixed'; // 固定位置
    }
     // 縦ラインの数を復元
    const savedLineCount = localStorage.getItem("verticalLineCount");
    const lineCountInput = document.getElementById("verticalLineCountInput");
    if (savedLineCount) {
        lineCountInput.value = savedLineCount;
    } else {
        lineCountInput.value = 2; // デフォルト値
    }
    
    const container = document.getElementById("strategyDisplay");
    addVerticalLines(container); // 初期表示の縦ラインを描画
    
};

// 作戦のタブを更新
function updateTabs() {
    const tabsContainer = document.getElementById('tabs');
    tabsContainer.innerHTML = ''; // タブをクリア
    strategies.forEach((_, index) => {
        const tab = document.createElement('button');
        tab.textContent = `作戦 ${index + 1}`;
        tab.className = 'tab-button';
        tab.onclick = () => loadStrategy(index);
        if (index === currentStrategyIndex) tab.classList.add('active');
        tabsContainer.appendChild(tab);
    });
}

// 作戦をロード
function loadStrategy(index) {
    currentStrategyIndex = index; // 選択した作戦のインデックスを更新
    highlightActiveTab();         // 選択されたタブを強調表示
    changeScene(1);               // 常にシーン1を表示
}

// シーンの切り替え
function changeScene(sceneNumber) {
    currentScene = sceneNumber - 1;
    const currentStrategy = strategies[currentStrategyIndex];
    const pointControlWindow = document.getElementById('pointControlWindow');
    const pointControlTable = document.getElementById('pointControlTable');
    const copyPreviousSceneButton = document.getElementById('copyPreviousSceneButton');

    // シーンデータが未定義の場合、前のシーンデータをコピー
    if (!currentStrategy[currentScene]) {
        currentStrategy[currentScene] = currentStrategy[currentScene - 1]
            ? JSON.parse(JSON.stringify(currentStrategy[currentScene - 1]))
            : [];
    }

    // シーン2以降でポイントが1つもない場合、自動で前のシーンをコピー
    if (currentScene > 0 && currentStrategy[currentScene].length === 0) {
        copyPreviousScene(); // 前のシーンをコピー
    }

    // シーンごとのウインドウ内容の切り替え
    if (sceneNumber === 1) {
        pointControlTable.style.display = 'block'; // シーン1ではポイント追加テーブルを表示
        copyPreviousSceneButton.style.display = 'none'; // 「前のシーンをコピー」ボタンは非表示
        pointControlWindow.style.display = 'block'; // ウインドウを表示
    } else {
        pointControlTable.style.display = 'none'; // ポイント追加テーブルを非表示
        copyPreviousSceneButton.style.display = 'block'; // 「前のシーンをコピー」ボタンを表示
        pointControlWindow.style.display = 'block'; // ウインドウを表示
    }

    displayScene();
    highlightActiveScene(sceneNumber);
}

// 前のシーンを現在のシーンにコピーする
function copyPreviousScene() {
    if (currentScene > 0 && strategies[currentStrategyIndex][currentScene - 1]) {
        strategies[currentStrategyIndex][currentScene] = JSON.parse(JSON.stringify(strategies[currentStrategyIndex][currentScene - 1])); // 深いコピー
        displayScene();
    }
}

// シーン表示
function displayScene() {
    const display = document.getElementById('strategyDisplay');
    display.innerHTML = ''; // 表示をクリア

    // 縦棒を追加
    addVerticalLines(display);

    const currentSceneData = strategies[currentStrategyIndex][currentScene] || [];

    currentSceneData.forEach((point, index) => {
        const pointElement = document.createElement('div');
        pointElement.className = 'draggable';
        pointElement.style.position = 'absolute';
        pointElement.style.left = `${point.x}px`;
        pointElement.style.top = `${point.y}px`;
        pointElement.style.backgroundColor = point.color;

        // 色に応じてサイズを設定
        if (point.color === 'red') {
            pointElement.style.width = '25px';
            pointElement.style.height = '25px';
        } else if (point.color === 'blue') {
            pointElement.style.width = '25px';
            pointElement.style.height = '25px';
        } else {
            pointElement.style.width = '15px';
            pointElement.style.height = '15px';
        }

        // 番号ラベルの追加（赤と青のポイントにのみ表示）
        if (point.color === 'red' || point.color === 'blue') {
            const label = document.createElement('span');
            label.textContent = point.number; // ポイントの番号を表示
            label.style.position = 'absolute';
            label.style.top = '-10px';
            label.style.left = '5px';
            label.style.color = 'black';
            label.style.fontSize = '12px';
            pointElement.appendChild(label);
        }

        // ドラッグ操作のための変数
        let isDragging = false;
        let startX, startY;

        // マウス押下時にドラッグを開始
        pointElement.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX - point.x;
            startY = e.clientY - point.y;
            pointElement.style.cursor = 'grabbing';
        });

        // タッチ開始時にドラッグを開始
        pointElement.addEventListener('touchstart', (e) => {
            isDragging = true;
            const touch = e.touches[0];
            startX = touch.clientX - point.x;
            startY = touch.clientY - point.y;
            pointElement.style.cursor = 'grabbing';
            e.preventDefault();
        });

        // マウス移動時に位置を更新
        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                const x = e.clientX - startX;
                const y = e.clientY - startY;
                pointElement.style.left = `${x}px`;
                pointElement.style.top = `${y}px`;
            }
        });

        // タッチ移動時に位置を更新
        document.addEventListener('touchmove', (e) => {
            if (isDragging) {
                const touch = e.touches[0];
                const x = touch.clientX - startX;
                const y = touch.clientY - startY;
                pointElement.style.left = `${x}px`;
                pointElement.style.top = `${y}px`;
                e.preventDefault();
            }
        });

        // マウスボタンを離したときにドラッグを終了
        document.addEventListener('mouseup', (e) => {
            if (isDragging) {
                isDragging = false;
                const x = e.clientX - startX;
                const y = e.clientY - startY;
                updatePointPosition(index, x, y); // データ上の位置も更新
                pointElement.style.cursor = 'grab';
            }
        });

        // タッチ終了時にドラッグを終了
        document.addEventListener('touchend', (e) => {
            if (isDragging) {
                isDragging = false;
                const touch = e.changedTouches[0];
                const x = touch.clientX - startX;
                const y = touch.clientY - startY;
                updatePointPosition(index, x, y); // データ上の位置も更新
                pointElement.style.cursor = 'grab';
            }
        });

        display.appendChild(pointElement);
    });
}

function removePoint(color) {
    // 現在の作戦の全シーンを取得
    const currentStrategy = strategies[currentStrategyIndex];

    for (let sceneIndex = 0; sceneIndex < currentStrategy.length; sceneIndex++) {
        const sceneData = currentStrategy[sceneIndex];

        // 指定された色のポイントのうち、一番番号が大きいポイントを探す
        let maxIndex = -1;
        for (let i = sceneData.length - 1; i >= 0; i--) {
            if (sceneData[i].color === color) {
                maxIndex = i;
                break; // 最後に追加された（番号が大きい）ポイントが見つかったらループを抜ける
            }
        }

        // 見つかった場合にそのポイントを削除
        if (maxIndex !== -1) {
            sceneData.splice(maxIndex, 1);
        }
    }

    // データをローカルストレージに保存
    localStorage.setItem('strategiesData', JSON.stringify(strategies));

    // 表示を更新
    displayScene();
}

// 縦棒を等間隔で2本追加する関数
function addVerticalLines(container) {
    // 既存の縦棒だけを削除
    const existingLines = container.querySelectorAll('.vertical-line');
    existingLines.forEach(line => line.remove());

    // 縦ライン数を取得
    const lineCountInput = document.getElementById("verticalLineCountInput");
    const lineCount = parseInt(lineCountInput.value) || 2;

    const containerWidth = container.offsetWidth;
    const interval = containerWidth / (lineCount + 1);

    // 新しい縦ラインを追加
    for (let i = 1; i <= lineCount; i++) {
        const line = document.createElement('div');
        line.className = 'vertical-line';
        line.style.left = `${interval * i}px`; // 等間隔に配置
        container.appendChild(line);
    }
}

document.getElementById("verticalLineCountInput").addEventListener("input", () => {
    const container = document.getElementById("strategyDisplay");
    addVerticalLines(container); // 縦ラインを再描画
});

document.getElementById("verticalLineCountInput").addEventListener("input", (event) => {
    const lineCount = event.target.value;
    saveVerticalLineCount(lineCount); // 保存
    const container = document.getElementById("strategyDisplay");
    addVerticalLines(container); // 縦ラインを再描画
    displayScene(); // ポイントを再描画
});

function saveVerticalLineCount(count) {
    localStorage.setItem("verticalLineCount", count);
}

// ポイント位置の更新
function updatePointPosition(index, x, y) {
    strategies[currentStrategyIndex][currentScene][index].x = x;
    strategies[currentStrategyIndex][currentScene][index].y = y;
    displayScene();
}

// ポイントを追加
function addPoint(color) {
    const currentSceneData = strategies[currentStrategyIndex][currentScene];

    // 色ごとに現在のポイント数を数えて次の番号を決定
    let newNumber;
    if (color === 'red') {
        const redPoints = currentSceneData.filter(point => point.color === 'red');
        newNumber = redPoints.length + 1;
    } else if (color === 'blue') {
        const bluePoints = currentSceneData.filter(point => point.color === 'blue');
        newNumber = bluePoints.length + 1;
    } else {
        newNumber = null; // 黒のポイントは番号なし
    }

    // 色ごとの初期位置設定と位置調整
    let newPoint;
    if (color === 'red') {
        const redPoints = currentSceneData.filter(point => point.color === 'red');
        if (redPoints.length > 0) {
            const lastRedPoint = redPoints[redPoints.length - 1];
            newPoint = { x: lastRedPoint.x + 30, y: lastRedPoint.y + 30, color: color, number: newNumber };
        } else {
            newPoint = { x: 50, y: 150, color: color, number: newNumber }; // 初期位置
        }
    } else if (color === 'blue') {
        const bluePoints = currentSceneData.filter(point => point.color === 'blue');
        if (bluePoints.length > 0) {
            const lastBluePoint = bluePoints[bluePoints.length - 1];
            newPoint = { x: lastBluePoint.x + 30, y: lastBluePoint.y + 30, color: color, number: newNumber };
        } else {
            newPoint = { x: 250, y: 150, color: color, number: newNumber }; // 初期位置
        }
    } else {
        const blackPoints = currentSceneData.filter(point => point.color === 'black');
        if (blackPoints.length > 0) {
            const lastBlackPoint = blackPoints[blackPoints.length - 1];
            newPoint = { x: lastBlackPoint.x + 30, y: lastBlackPoint.y + 30, color: color, number: newNumber };
        } else {
            newPoint = { x: 450, y: 150, color: color, number: newNumber }; // 初期位置
        }
    }

    // 現在のシーンにポイントを追加
    currentSceneData.push(newPoint);

    // 他のシーンにも同じポイントを追加
    for (let i = 0; i < strategies[currentStrategyIndex].length; i++) {
        if (i !== currentScene && strategies[currentStrategyIndex][i].length > 0) {
            const sceneData = strategies[currentStrategyIndex][i];
            sceneData.push(JSON.parse(JSON.stringify(newPoint))); // 深いコピーで追加
        }
    }

    // データをローカルストレージに保存
    localStorage.setItem('strategiesData', JSON.stringify(strategies));

    displayScene();
}


// 現在の作戦を保存
function saveCurrentStrategy() {
    localStorage.setItem('strategiesData', JSON.stringify(strategies));
    alert("作戦が保存されました");
}

// 新しい作戦を追加
function addNewStrategy() {
    const newStrategy = [[], [], [], [], []]; // 新しい作戦を初期化
    strategies.push(newStrategy); // 作戦リストに追加

    // 新しい作戦を選択
    currentStrategyIndex = strategies.length - 1;

    // ローカルストレージに保存
    localStorage.setItem('strategiesData', JSON.stringify(strategies));

    // タブを更新
    updateTabs();

    // 新しい作戦のシーン1を自動で選択
    changeScene(1);
}

// 現在の作戦を削除
function deleteCurrentStrategy() {
    if (strategies.length > 1) {
        // 現在の作戦を削除
        strategies.splice(currentStrategyIndex, 1);

        // 作戦インデックスを前に戻す（削除前の作戦）
        currentStrategyIndex = Math.max(0, currentStrategyIndex - 1);

        // ローカルストレージに保存
        localStorage.setItem('strategiesData', JSON.stringify(strategies));

        // タブを更新
        updateTabs();

        // シーン1を自動で選択
        changeScene(1);
    } else {
        alert("最低1つの作戦が必要です");
    }
}

function togglePlayPause() {
    if (isPlaying) {
        // 再生中なら停止
        isPlaying = false;
        cancelAnimationFrame(animationFrameId);
        document.getElementById("playPauseButton").textContent = "再生";
    } else {
        // 停止中なら再生を開始
        isPlaying = true;
        document.getElementById("playPauseButton").textContent = "停止";
        playAnimation();
    }
}

// シーンごとにアニメーション再生
function playAnimation() {
    const frames = strategies[currentStrategyIndex];
    if (frameIndex >= frames.length - 1) {
        frameIndex = 0; // 再生が終わったら最初に戻る
    }

    function animate() {
        if (!isPlaying) return; // 停止ボタンが押されたら停止

        const currentFrame = frames[frameIndex];
        const nextFrame = frames[frameIndex + 1] || frames[frameIndex];
        const duration = 1000; // 1秒で次のフレームに移行
        const startTime = performance.now();

        // ポイントの番号順に並べる
        const sortedCurrentFrame = [...currentFrame].sort((a, b) => (a.number || 0) - (b.number || 0));
        const sortedNextFrame = [...nextFrame].sort((a, b) => (a.number || 0) - (b.number || 0));

        function smoothTransition(timestamp) {
            if (!isPlaying) return; // 停止ボタンが押されたら停止

            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // 番号順に対応するポイントを比較しながら計算
            const interpolatedFrame = sortedCurrentFrame.map((point, index) => {
                const nextPoint = sortedNextFrame[index] || point;
                return {
                    x: point.x + (nextPoint.x - point.x) * progress,
                    y: point.y + (nextPoint.y - point.y) * progress,
                    color: point.color,
                    number: point.number // 番号情報を保持
                };
            });

            displayFrame(interpolatedFrame);

            if (progress < 1) {
                animationFrameId = requestAnimationFrame(smoothTransition);
            } else {
                frameIndex++;
                if (frameIndex < frames.length - 1) {
                    animationFrameId = requestAnimationFrame(animate);
                } else {
                    isPlaying = false;
                    document.getElementById("playPauseButton").textContent = "再生";
                }
            }
        }

        animationFrameId = requestAnimationFrame(smoothTransition);
    }

    animate();
}


// 選択中の作戦だけをリセット
function resetCurrentStrategy() {
    // 選択中の作戦をリセット
    strategies[currentStrategyIndex] = [[], [], [], [], []]; // 選択中の作戦を初期状態に

    // カウンターをリセット
    redPointCounter = 1;
    bluePointCounter = 1;

    // ローカルストレージに保存
    localStorage.setItem('strategiesData', JSON.stringify(strategies));
    localStorage.setItem('redPointCounter', redPointCounter);
    localStorage.setItem('bluePointCounter', bluePointCounter);

    // 表示を更新
    displayScene();
    alert("選択中の作戦がリセットされました");

    // シーン1を自動で選択
    changeScene(1);
}

// 特定のフレームを表示
function displayFrame(frame) {
    const display = document.getElementById('strategyDisplay');
    display.innerHTML = ''; // 表示をクリア

    // 縦棒を再度追加
    addVerticalLines(display);

    frame.forEach((point) => {
        const pointElement = document.createElement('div');
        pointElement.style.position = 'absolute';
        pointElement.style.left = `${point.x}px`;
        pointElement.style.top = `${point.y}px`;
        pointElement.style.backgroundColor = point.color;
        pointElement.style.borderRadius = '50%'; // 丸い形に設定


        // 色に応じてサイズを設定
        if (point.color === 'red') {
            pointElement.style.width = '25px';
            pointElement.style.height = '25px';
            pointElement.style.zIndex = '2'; // 赤ポイントのZインデックス
        } else if (point.color === 'blue') {
            pointElement.style.width = '25px';
            pointElement.style.height = '25px';
            pointElement.style.zIndex = '1'; // 青ポイントのZインデックス
        } else {
            pointElement.style.width = '15px';
            pointElement.style.height = '15px';
            pointElement.style.zIndex = '3'; // 黒ポイントのZインデックス
        }

        // 番号を表示するラベルを追加
        const label = document.createElement('span');
        label.textContent = point.number; // ポイントの番号を表示
        label.style.position = 'absolute';
        label.style.top = '-10px';
        label.style.left = '5px';
        label.style.color = 'black';
        label.style.fontSize = '12px';
        pointElement.appendChild(label);

        display.appendChild(pointElement);
    });
}

// アクティブな作戦タブを強調
function highlightActiveTab() {
    document.querySelectorAll('#tabs .tab-button').forEach((button, index) => {
        button.classList.toggle('active', index === currentStrategyIndex);
    });
}

// アクティブなシーンを強調
function highlightActiveScene(sceneNumber) {
    document.querySelectorAll('#sceneTabs button').forEach((button, index) => {
        button.classList.toggle('active', index === sceneNumber - 1);
    });
}

// ページを離れる直前にデータを保存
window.onbeforeunload = () => {
    localStorage.setItem('strategiesData', JSON.stringify(strategies));
};


// ウインドウの表示・非表示を切り替える
function togglePointControlWindow() {
    const windowElement = document.getElementById('pointControlWindow');
    if (windowElement.style.display === 'none' || !windowElement.style.display) {
        windowElement.style.display = 'block';
    } else {
        windowElement.style.display = 'none';
    }
}

// ウインドウを閉じる
document.getElementById('closeWindowButton').addEventListener('click', () => {
    document.getElementById('pointControlWindow').style.display = 'none';
});

// ウインドウをドラッグで移動可能にする
function makeWindowDraggable(windowId) {
    const windowElement = document.getElementById(windowId);
    const header = windowElement.querySelector('.window-header');
    let offsetX = 0, offsetY = 0, isDragging = false;

    // マウスイベント: ドラッグ開始
    header.addEventListener('mousedown', (e) => {
        isDragging = true;
        offsetX = e.clientX - windowElement.offsetLeft;
        offsetY = e.clientY - windowElement.offsetTop;
    });

    // タッチイベント: ドラッグ開始
    header.addEventListener('touchstart', (e) => {
        isDragging = true;
        const touch = e.touches[0];
        offsetX = touch.clientX - windowElement.offsetLeft;
        offsetY = touch.clientY - windowElement.offsetTop;
    });

    // マウス移動でウインドウを移動
    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            const newX = e.clientX - offsetX;
            const newY = e.clientY - offsetY;
            windowElement.style.left = `${newX}px`;
            windowElement.style.top = `${newY}px`;
        }
    });

    // タッチ移動でウインドウを移動
    document.addEventListener('touchmove', (e) => {
        if (isDragging) {
            const touch = e.touches[0];
            const newX = touch.clientX - offsetX;
            const newY = touch.clientY - offsetY;
            windowElement.style.left = `${newX}px`;
            windowElement.style.top = `${newY}px`;
            e.preventDefault(); // タッチスクロールを防止
        }
    });

    // マウスボタンを離したときにドラッグを終了
    document.addEventListener('mouseup', () => {
        isDragging = false;
    });

    // タッチ終了時にドラッグを終了
    document.addEventListener('touchend', () => {
        isDragging = false;
    });
}

// ドラッグ機能を有効化
makeWindowDraggable('pointControlWindow');
