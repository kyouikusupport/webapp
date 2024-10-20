window.onload = function() {
  let timerInterval = null;
  let startTime = 0;
  let elapsedTime = 0;
  let lapTimes = [];
  let lapDifferences = [];
  let lastLapTime = 0;

  const timerElement = document.getElementById("timer");
  const lapTableBody = document.querySelector("#lapTable tbody");
  const lapGraph = document.getElementById("lapGraph").getContext("2d");
  const timeDisplayElement = document.getElementById("time-display");

  const startButton = document.getElementById("start");
  const stopButton = document.getElementById("stop");

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
          display: true,  // 横軸（周回数）を非表示に
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
      startTime = Date.now() - elapsedTime;
      timerInterval = setInterval(updateTimer, 100);
      startButton.style.display = "none";
      stopButton.style.display = "inline";
      lastLapTime = 0;

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

  // ラップボタン
  document.getElementById("lap").addEventListener("click", function() {
    addLap();
  });

  // ストップボタン
  stopButton.addEventListener("click", function() {
    if (timerInterval !== null) {
      clearInterval(timerInterval);
      timerInterval = null;
      stopButton.style.display = "none";
      startButton.style.display = "inline";

      // ストップ時にラップを追加
      addLap();

      // ストップ時にタイム表示エリアを表示
      timeDisplayElement.style.display = "block";
      timeDisplayElement.textContent = `最終タイム: ${formatTimeJP((elapsedTime / 1000).toFixed(1))}`;
    }
  });

  // リセットボタン
  document.getElementById("reset").addEventListener("click", function() {
    clearInterval(timerInterval);
    elapsedTime = 0;
    lapTimes = [];
    lapDifferences = [];
    lastLapTime = 0;
    timerElement.textContent = "00:00.0";
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
    let currentLapTime = (elapsedTime / 1000).toFixed(1);
    let lapDifference = (lastLapTime === 0) ? currentLapTime : (currentLapTime - lastLapTime).toFixed(1);
    lapTimes.push(currentLapTime);
    lapDifferences.push(lapDifference);

    addLapToTable(lapTimes.length, currentLapTime, lapDifference);
    updateGraph();

    lastLapTime = currentLapTime;
  }

  // 表にラップ追加
  function addLapToTable(lapNumber, lapTime, lapDifference) {
    for (let i = 1; i <= 10; i++) {
      let row = lapTableBody.rows[i - 1];
      if (i === lapNumber) {
        row.cells[1].textContent = lapTime;
        row.cells[2].textContent = lapDifference;
      }
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
