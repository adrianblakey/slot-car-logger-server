const CHART_COLORS = {
  red: "rgb(255, 99, 132)",
  orange: "rgb(255, 159, 64)",
  yellow: "rgb(255, 205, 86)",
  green: "rgb(75, 192, 192)",
  blue: "rgb(54, 162, 235)",
  thinblue: "rgb(54, 162, 235, 0.5)",
  purple: "rgb(153, 102, 255)",
  grey: "rgb(201, 203, 207)",
};

const NAMED_COLORS = [
  CHART_COLORS.red,
  CHART_COLORS.orange,
  CHART_COLORS.yellow,
  CHART_COLORS.green,
  CHART_COLORS.blue,
  CHART_COLORS.thinblue,
  CHART_COLORS.purple,
  CHART_COLORS.grey,
];

function namedColor(index) {
  return NAMED_COLORS[index % NAMED_COLORS.length];
}

function transparentize(value, opacity) {
  var alpha = opacity === undefined ? 0.5 : 1 - opacity;
  return colorLib(value).alpha(alpha).rgbString();
}

const data = {
  datasets: [
    {
      label: "Track Voltage",
      backgroundColor: CHART_COLORS.red,
      borderColor: CHART_COLORS.red,
      lineTension: 0,
      fill: false,
      data: [],
      yAxisID: "y",
      pointRadius: 0,
      order: 3,
    },
    {
      label: "Controller Voltage",
      backgroundColor: CHART_COLORS.thinblue,
      borderColor: CHART_COLORS.thinblue,
      lineTension: 0,
      fill: true,
      yAxisID: "y",
      data: [],
      pointRadius: 0,
      order: 1,
    },
    {
      label: "Controller Current",
      backgroundColor: CHART_COLORS.orange,
      borderColor: CHART_COLORS.orange,
      lineTension: 0,
      fill: false,
      yAxisID: "y1",
      data: [],
      pointRadius: 0,
      order: 2,
    },
  ],
};

const config = {
  type: "line",
  data: data,
  options: {
    interaction: {
      intersect: false,
      mode: 'index',
    },
    plugins: {
      tooltip: {
        enabled: true,
      },
      title: {
        display: true,
        text: "Slot Car Data Logger",
      },
      streaming: {
        duration: 2000, // 8 sec - 2 laps to compare
        refresh: 10,
        frameRate: 30,
        delay: 5,
      },
    },
    scales: {
      x: {
        type: "realtime",
      },
      y: {
        position: "left",
        title: {
          display: true,
          text: "Voltage",
        },
        min: 0,
        max: 15,
      },
      y1: {
        position: "right",
        title: {
          display: true,
          text: "Current",
        },
        // TODO The current can go very high on start and settles back - rescale it?
        min: -15,
        max: 15,
        // grid line settings
        grid: {
          drawOnChartArea: false, // grid lines for one axis to show up
        },
      },
    },
  },
};

const theChart = new Chart(document.getElementById("theChart"), config);
var targetUrl = `ws://${location.host}/ws`;
var websocket;
window.addEventListener("load", onLoad);

function onLoad() {
  initializeSocket();
}

function initializeSocket() {
  // console.log("Opening WebSocket connection MicroPython Server...");
  websocket = new WebSocket(targetUrl);
  websocket.onopen = onOpen;
  websocket.onclose = onClose;
  websocket.onmessage = onMessage;
}
function onOpen(event) {
  // console.log("Starting connection to WebSocket server..");
}
function onClose(event) {
  // console.log("Closing connection to server..");
  setTimeout(initializeSocket, 2000);
}
function onMessage(event) {
  let tok = event.data.split(",");
  // tv, cv, ci
  // console.log("Update values", tok[0], tok[1], tok[2]);
  const now = Date.now();
  //console.log(now, ts)
  theChart.data.datasets[0].data.push({
    x: now,
    y: parseFloat(tok[0]),
  });
  theChart.data.datasets[1].data.push({
    x: now,
    y: parseFloat(tok[1]),
  });
  theChart.data.datasets[2].data.push({
    x: now,
    y: parseFloat(tok[2]),
  });
  theChart.update("quiet");
}

function sendMessage(message) {
  websocket.send(message);
}

function updateValues(data) {
  sensorData.unshift(data);
  if (sensorData.length > 20) sensorData.pop();
  sensorValues.value = sensorData.join("\r\n");
}

