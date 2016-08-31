'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const onHeaders = require('on-headers');
const pidusage = require('pidusage');
let io;

const defaultConfig = {
  title: 'Express Status',
  path: '/status',
  spans: [{
    interval: 1,
    retention: 60
  }, {
    interval: 5,
    retention: 60
  }, {
    interval: 15,
    retention: 60
  }]
};

const gatherOsMetrics = (io, span) => {
  const defaultResponse = {
    '2': 0,
    '3': 0,
    '4': 0,
    '5': 0,
    count: 0,
    mean: 0,
    timestamp: Date.now()
  };

  pidusage.stat(process.pid, (err, stat) => {
    if (err) {
      console.error(err)
      return
    }

    const last = span.responses[span.responses.length - 1];
    // Convert from B to MB
    stat.memory = stat.memory / 1024 / 1024;
    stat.load = os.loadavg();
    stat.timestamp = Date.now();

    span.os.push(stat);
    if (!span.responses[0] || last.timestamp + (span.interval * 1000) < Date.now()) span.responses.push(defaultResponse);

    if (span.os.length >= span.retention) span.os.shift();
    if (span.responses[0] && span.responses.length > span.retention) span.responses.shift();

    sendMetrics(io, span);
  });
};

const sendMetrics = (io, span) => {
  io.emit('stats', {
    os: span.os[span.os.length - 2],
    responses: span.responses[span.responses.length - 2],
    interval: span.interval,
    retention: span.retention
  });
};

const middlewareWrapper = (config) => {
  if (config === null || config === undefined) {
    config = defaultConfig;
  }

  if (config.path === undefined || !config.path instanceof String) {
    config.path = defaultConfig.path;
  }

  if (config.spans === undefined || !config.spans instanceof Array) {
    config.spans = defaultConfig.spans;
  }

  if (config.title === undefined || !config.title instanceof String) {
    config.title = 'Express Status';
  }

  let renderedHtml;
  fs.readFile(path.join(__dirname, '/index.html'), function (err, html) {
    renderedHtml = html.toString()
      .replace(/{{title}}/g, config.title)
      .replace(/{{script}}/g, fs.readFileSync(path.join(__dirname, '/app.js')))
      .replace(/{{style}}/g, fs.readFileSync(path.join(__dirname, '/style.css')));
  });

  return (req, res, next) => {
    if (io === null || io === undefined) {

      io = require('socket.io')(req.socket.server);

      io.on('connection', (socket) => {
        socket.emit('start', config.spans);
        socket.on('change', function () {
          socket.emit('start', config.spans);
        });
      });

      config.spans.forEach((span) => {
        span.os = [];
        span.responses = [];
        const interval = setInterval(() => gatherOsMetrics(io, span), span.interval * 1000);
        interval.unref(); // don't keep node.js process up
      });
    }

    const startTime = process.hrtime();
    if (req.path === config.path) {
      res.send(renderedHtml);
    } else {
      onHeaders(res, () => {
        const diff = process.hrtime(startTime);
        const responseTime = diff[0] * 1e3 + diff[1] * 1e-6;
        const category = Math.floor(res.statusCode / 100);

        config.spans.forEach((span) => {
          const last = span.responses[span.responses.length - 1];
          if (last !== undefined &&
              last.timestamp / 1000 + span.interval > Date.now() / 1000) {
            last[category]++;
            last.count++;
            last.mean = last.mean + ((responseTime - last.mean) / last.count);
          } else {
            span.responses.push({
              '2': category === 2 ? 1 : 0,
              '3': category === 3 ? 1 : 0,
              '4': category === 4 ? 1 : 0,
              '5': category === 5 ? 1 : 0,
              count: 1,
              mean: responseTime,
              timestamp: Date.now()
            });
          }
        });
      });

      next();
    }
  };
};

module.exports = middlewareWrapper;
