/*!
 * Copyright (c) 2014-2024 Chart.js Contributors
 * Released under the MIT license
 * https://github.com/chartjs/Chart.js/blob/master/LICENSE.md
 */

window.onload = function() {
  let timerInterval = null;
  let lapTimerInterval = null;
  let startTime = 0;
  let elapsedTime = 0;
  let lapStartTime = 0;
  let lapElapsedTime = 0;
  let lapTimes = [];
  let lapDifferences = [];
  let lastLapTime = 0;

  const timerElement = document.getElementById("timer");
  const smallTimerTimeElement = document.getElementById("small-timer-time");
  const lapTableBody = document.querySelector("#lapTable tbody");
  const lapGraph = document.getElementById("lapGraph").getContext("2d");
  const timeDisplayElement = document.getElementById("time-display");

  const startButton = document.getElementById("start");
  const stopButton = document.getElementById("stop");
  const yAxisSlider = document.getElementById("y-axis-slider");
  const sliderValueElement = document.getElementById("slider-value");

  // グラフ設定
  let chart = new Chart(lapGraph, {
    type: 'line',
    data: {
      labels: Array.from({ length: 10 }, (_, i) => `Lap ${i + 1}`),
      datasets: [{
        label: 'ラップタイム',
        data: Array(10).fill(null),
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 2
      }]
    },
    options: {
      scales: {
        x: {
          display: true,
          ticks: {
            padding: 5
          }
        },
        y: {
          title: {
            display: true,
            text: 'ラップタイム (seconds)'
          },
          min: 0,
          max: 40,
          ticks: {
            padding: 20
          }
        }
      },
      layout: {
        padding: {
          left: 20
        }
      }
    }
  });

  // スライダーを動かした時にグラフの縦軸の最大値を更新
  yAxisSlider.addEventListener('input', function() {
    const newValue = yAxisSlider.value;
    sliderValueElement.value = newValue; // スライダーの値を入力欄に反映
    chart.options.scales.y.max = parseInt(newValue); // グラフの縦軸の最大値を変更
    chart.update(); // グラフを更新
  });

  // 数字を入力した時にスライダーとグラフの表示を更新
  sliderValueElement.addEventListener('input', function() {
    const newValue = sliderValueElement.value;
    if (newValue >= 30 && newValue <= 200) { // 入力が範囲内の場合
      yAxisSlider.value = newValue; // スライダーの位置を更新
      chart.options.scales.y.max = parseInt(newValue); // グラフの縦軸の最大値を変更
      chart.update(); // グラフを更新
    }
  });

  // 初期状態のテーブルを作成
  function initializeLapTable() {
    for (let i = 1; i <= 10; i++) {
      let row = lapTableBody.insertRow();
      row.insertCell(0).textContent = `Lap ${i}`;
      row.insertCell(1);
      row.insertCell(2);
    }
  }

  // タイム表示エリアを非表示に設定
  timeDisplayElement.style.display = "none";
  // スタートボタン
  startButton.addEventListener("click", function() {
    if (timerInterval === null) {
      // 直近のラップデータを削除
      if (lapTimes.length > 0) {
        lapTimes.pop(); // 最後の周回タイムを削除
        lapDifferences.pop(); // 最後のラップタイムを削除
        removeLastLapFromTable(); // 表から最後の行を削除
        updateGraph(); // グラフを更新
      }

      startTime = Date.now() - elapsedTime;
      lapStartTime = Date.now() - lapElapsedTime;
      timerInterval = setInterval(updateTimer, 100);
      lapTimerInterval = setInterval(updateLapTimer, 100);
      startButton.style.display = "none";
      stopButton.style.display = "inline";

      // lastLapTime をリセットしない
      // スタート時にタイム表示エリアを非表示に
      timeDisplayElement.style.display = "none";
    }
  });

  // タイマー更新
  function updateTimer() {
    elapsedTime = Date.now() - startTime;
    let time = (elapsedTime / 1000).toFixed(1);
    timerElement.textContent = formatTime(time);
  }

  // 小さいラップタイマーの更新
  function updateLapTimer() {
    lapElapsedTime = Date.now() - lapStartTime;
    let lapTime = (lapElapsedTime / 1000).toFixed(1);
    smallTimerTimeElement.textContent = `${formatTime(lapTime)}`;  // 数字だけを表示
  }

  // ラップボタン
  document.getElementById("lap").addEventListener("click", function() {
    addLap();
    lapStartTime = Date.now();  // ラップタイマーをリセットして再スタート
    lapElapsedTime = 0;
  });

  // ストップボタン
  stopButton.addEventListener("click", function() {
    if (timerInterval !== null) {
      clearInterval(timerInterval);
      clearInterval(lapTimerInterval);
      timerInterval = null;
      lapTimerInterval = null;
      stopButton.style.display = "none";
      startButton.style.display = "inline";
      addLap();  // ストップ時にラップを追加
      timeDisplayElement.style.display = "block";
      timeDisplayElement.textContent = `最終タイム: ${formatTimeJP((elapsedTime / 1000).toFixed(1))}`;
    }
  });

  // リセットボタン
  document.getElementById("reset").addEventListener("click", function() {
    clearInterval(timerInterval);
    clearInterval(lapTimerInterval);
    elapsedTime = 0;
    lapElapsedTime = 0;
    lapTimes = [];
    lapDifferences = [];
    lastLapTime = 0;
    timerElement.textContent = "00:00.0";
    smallTimerTimeElement.textContent = "00:00.0";  // 小さいタイマーをリセット
    lapTableBody.innerHTML = "";
    initializeLapTable();
    chart.data.labels = Array.from({ length: 10 }, (_, i) => `Lap ${i + 1}`);
    chart.data.datasets[0].data = Array(10).fill(null);
    chart.update();
    timeDisplayElement.style.display = "none";  // リセット時にタイム表示エリアを非表示に
  });

  // 初期状態のテーブルを作成
  initializeLapTable();

  // ラップ追加関数
  function addLap() {
    let currentLapTime = (elapsedTime / 1000).toFixed(1); // 大きいタイマーの時間
    let smallLapTime = (lapElapsedTime / 1000).toFixed(1); // 小さいタイマーの時間
    lapTimes.push(currentLapTime); // 周回タイムとして大きいタイマーの時間を記録
    lapDifferences.push(smallLapTime); // ラップとして小さいタイマーの時間を記録

    addLapToTable(lapTimes.length, currentLapTime, smallLapTime); // 表に記入
    updateGraph(); // グラフを更新

    lastLapTime = currentLapTime;
  }

  // 表にラップ追加
  function addLapToTable(lapNumber, lapTime, lapDifference) {
    for (let i = 1; i <= 10; i++) {
      let row = lapTableBody.rows[i - 1];
      if (i === lapNumber) {
        row.cells[1].textContent = lapTime; // 周回タイムに大きいタイマーの時間を表示
        row.cells[2].textContent = lapDifference; // ラップに小さいタイマーの時間を表示
      }
    }
  }

  // 表から最後の行を削除する関数
  function removeLastLapFromTable() {
    let lapNumber = lapTimes.length + 1;
    let row = lapTableBody.rows[lapNumber - 1];
    if (row) {
      row.cells[1].textContent = ''; // 周回タイムを削除
      row.cells[2].textContent = ''; // ラップタイムを削除
    }
  }

  // グラフ更新
  function updateGraph() {
    chart.data.datasets[0].data = Array(10).fill(null);
    lapDifferences.forEach((diff, index) => {
      if (index < 10) {
        chart.data.datasets[0].data[index] = diff;
      }
    });
    chart.update();
  }

  // フォーマット関数 (通常の形式)
  function formatTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = (time % 60).toFixed(1);
    return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }

  // フォーマット関数 (日本語形式: 00分00秒0)
  function formatTimeJP(time) {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const milliseconds = (time % 1).toFixed(1).substring(2);
    return `${minutes < 10 ? '0' : ''}${minutes}分${seconds < 10 ? '0' : ''}${seconds}秒${milliseconds}`;
  }
};
