/* eslint no-console: "off" */
const socketIoPort = 2222;

const express = require('express');

// This is optional. If your server uses socket.io already, pass it to config as `webserver` along with it's port.
const socketio = require('socket.io')(socketIoPort);

const app = express();
const port = process.env.PORT || 3000;

app.use(
  require('../index')({
    path: '/',
    // Use existing socket.io instance.
    // websocket: socketio,

    // Ignore requests which req.path begins with
    // ignoreStartsWith: '/return-status',

    // Pass socket.io instance port down to config.
    // Use only if you're passing your own instance.
    // port: socketIoPort,
    customCharts: [
      {
        id: 'mychart',
        title: 'MyChart',
        customLabel: `<h5>Money: <b id="mychartStat"></b></h5>
          <h6 class="status-code status-code-2xx">Some</h6>
          <h6 class="status-code status-code-3xx">Dots</h6>
          <h6 class="status-code status-code-4xx">Here</h6>`,
        defaultValue: '0.00',
        decimalFixed: 2,
        suffix: ' €',
        callback: () => {
          return Math.random();
        }
      }
    ],
    chartOrder: [
      'mychart',
      'cpu',
      'mem',
      'heap',
      'load',
      'eventLoop',
      'responseTime',
      'rps',
      'statusCodes'
    ],
    healthChecks: [
      {
        protocol: 'http',
        host: 'localhost',
        port: 3000,
        path: '/admin/health/ex1',
        headers: {},
      },
      {
        protocol: 'http',
        host: 'localhost',
        port: 3000,
        path: '/return-status/200',
        headers: {},
      },
    ],
  }),
);
app.use(require('express-favicon-short-circuit'));

// Example route throwing requested status code
app.get('/return-status/:statusCode', (req, res) =>
  res.sendStatus(200),
);

app.listen(port, () => {
  console.log(`Listening on http://0.0.0.0:${port}`);
});
