'use strict';

Chart.defaults.global.defaultFontSize = 8;
Chart.defaults.global.animation.duration = 500;
Chart.defaults.global.legend.display = false;
Chart.defaults.global.elements.line.backgroundColor = "rgba(0,0,0,0)";
Chart.defaults.global.elements.line.borderColor = "rgba(0,0,0,0.9)";
Chart.defaults.global.elements.line.borderWidth = 2;

var socket = io(location.protocol + '//' + location.hostname + ':' + location.port);
var defaultSpan = 0;
var spans = [];

var defaultDataset = {
  label: '',
  data: [],
  lineTension: 0.2,
  pointRadius: 0
};

var defaultOptions = {
  scales: {
    yAxes: [{
      ticks: {
        beginAtZero: true
      }
    }],
    xAxes: [{
      type: 'time',
      time: {
        unitStepSize: 30
      },
      gridLines: {
        display: false
      }
    }]
  },
  tooltips: {
    enabled: false
  },
  responsive: true,
  maintainAspectRatio: false,
  animation: false
};

var createChart = function (ctx, dataset) {
  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: dataset
    },
    options: defaultOptions
  });
};

var addTimestamp = function(point) {
  return point.timestamp;
};

var cpuDataset = [Object.create(defaultDataset)];
var memDataset = [Object.create(defaultDataset)];
var loadDataset = [Object.create(defaultDataset)];
var responseTimeDataset = [Object.create(defaultDataset)];
var rpsDataset = [Object.create(defaultDataset)];

var cpuStat = document.getElementById('cpuStat');
var memStat = document.getElementById('memStat');
var loadStat = document.getElementById('loadStat');
var responseTimeStat = document.getElementById('responseTimeStat');
var rpsStat = document.getElementById('rpsStat');

var cpuChartCtx = document.getElementById("cpuChart");
var memChartCtx = document.getElementById("memChart");
var loadChartCtx = document.getElementById("loadChart");
var responseTimeChartCtx = document.getElementById("responseTimeChart");
var rpsChartCtx = document.getElementById("rpsChart");

var cpuChart = createChart(cpuChartCtx, cpuDataset);
var memChart = createChart(memChartCtx, memDataset);
var loadChart = createChart(loadChartCtx, loadDataset);
var responseTimeChart = createChart(responseTimeChartCtx, responseTimeDataset);
var rpsChart = createChart(rpsChartCtx, rpsDataset);

var charts = [cpuChart, memChart, loadChart, responseTimeChart, rpsChart];

var onSpanChange = function (e) {
  e.target.classList.add('active');
  defaultSpan = parseInt(e.target.id);

  var otherSpans = document.getElementsByTagName('span');
  for (var i = 0; i < otherSpans.length; i++) {
    if (otherSpans[i] !== e.target) otherSpans[i].classList.remove('active');
  }

  socket.emit('change');
};

socket.on('start', function (data) {
  // Remove last element of Array because it contains malformed responses data.
  // To keep consistency we also remove os data.
  data[defaultSpan].responses.pop();
  data[defaultSpan].os.pop();

  if(!data[defaultSpan].os[data[defaultSpan].os.length - 1]) {
    data[defaultSpan].os[data[defaultSpan].os.length - 1]= {
      cpu:0,
      memory:0,
      load: [0,0,0]
    }
  }
  if(!data[defaultSpan].responses[data[defaultSpan].responses.length - 1]) {
    data[defaultSpan].responses[data[defaultSpan].responses.length - 1]= {
      mean:0
    }
  }
  
  cpuStat.textContent = data[defaultSpan].os[data[defaultSpan].os.length - 1].cpu.toFixed(1) + '%';
  cpuChart.data.datasets[0].data = data[defaultSpan].os.map(function (point) {
    return point.cpu;
  });
  cpuChart.data.labels = data[defaultSpan].os.map(addTimestamp);

  memStat.textContent = data[defaultSpan].os[data[defaultSpan].os.length - 1].memory.toFixed(1) + 'MB';
  memChart.data.datasets[0].data = data[defaultSpan].os.map(function (point) {
    return point.memory;
  });
  memChart.data.labels = data[defaultSpan].os.map(addTimestamp);

  loadStat.textContent = data[defaultSpan].os[data[defaultSpan].os.length - 1].load[defaultSpan].toFixed(2);
  loadChart.data.datasets[0].data = data[defaultSpan].os.map(function (point) {
    return point.load[0];
  });
  loadChart.data.labels = data[defaultSpan].os.map(addTimestamp);

  responseTimeStat.textContent = data[defaultSpan].responses[data[defaultSpan].responses.length - 1].mean.toFixed(2) + 'ms';
  responseTimeChart.data.datasets[0].data = data[defaultSpan].responses.map(function (point) {
    return point.mean;
  });
  responseTimeChart.data.labels = data[defaultSpan].responses.map(addTimestamp);

  if (data[defaultSpan].responses.length >= 2) {
    var deltaTime = data[defaultSpan].responses[data[defaultSpan].responses.length - 1].timestamp - data[defaultSpan].responses[data[defaultSpan].responses.length - 2].timestamp;
    rpsStat.textContent = (data[defaultSpan].responses[data[defaultSpan].responses.length - 1].count / deltaTime * 1000).toFixed(2);
    rpsChart.data.datasets[0].data = data[defaultSpan].responses.map(function (point) {
      return point.count / deltaTime * 1000;
    });
    rpsChart.data.labels = data[defaultSpan].responses.map(addTimestamp);
  }

  charts.forEach(function(chart) {
    chart.update();
  });

  var spanControls = document.getElementById('span-controls');
  if (data.length !== spans.length) {
    data.forEach(function (span, index) {
      spans.push({
        retention: span.retention,
        interval: span.interval
      });

      var spanNode = document.createElement('span');
      var textNode = document.createTextNode((span.retention * span.interval) / 60 + "M");
      spanNode.appendChild(textNode);
      spanNode.setAttribute('id', index);
      spanNode.onclick = onSpanChange;
      spanControls.appendChild(spanNode);
    });
    document.getElementsByTagName('span')[0].classList.add('active');
  }
});

socket.on('stats', function (data) {
  if (data.retention === spans[defaultSpan].retention && data.interval === spans[defaultSpan].interval) {
    if(!data.os) data.os = {};
    if(!data.os.cpu) data.os.cpu=0;
    if(!data.os.memory) data.os.memory=0;
    if(!data.os.load) data.os.load=[0,0,0];
    if(!data.responses) {
      data.responses = {};
    }    
    if(!data.responses.timestamp) {
      var ts = new Date();
      data.responses.timestamp = ts.getTime()/1000;
    }
    if(!data.responses.mean) data.responses.mean = 0;
    
    cpuStat.textContent = data.os.cpu.toFixed(1) + '%';
    cpuChart.data.datasets[0].data.push(data.os.cpu);
    cpuChart.data.labels.push(data.os.timestamp);

    memStat.textContent = data.os.memory.toFixed(1) + 'MB';
    memChart.data.datasets[0].data.push(data.os.memory);
    memChart.data.labels.push(data.os.timestamp);

    loadStat.textContent = data.os.load[0].toFixed(2);
    loadChart.data.datasets[0].data.push(data.os.load[0]);
    loadChart.data.labels.push(data.os.timestamp);

    responseTimeStat.textContent = data.responses.mean.toFixed(2) + 'ms';
    responseTimeChart.data.datasets[0].data.push(data.responses.mean);
    responseTimeChart.data.labels.push(data.responses.timestamp);

    var deltaTime = data.responses.timestamp - rpsChart.data.labels[rpsChart.data.labels.length - 1];
    var rpsTemp = (data.responses.count / deltaTime * 1000);
    if(!isFinite(rpsTemp) || isNaN(rpsTemp)) {
      rpsTemp=0;
    }
    rpsStat.textContent = rpsTemp.toFixed(2);
    rpsChart.data.datasets[0].data.push(rpsTemp);
    rpsChart.data.labels.push(data.responses.timestamp);

    charts.forEach(function (chart) {
      if (spans[defaultSpan].retention < chart.data.labels.length) {
        chart.data.datasets[0].data.shift();
        chart.data.labels.shift();
      }

      chart.update();
    });
  }
});
