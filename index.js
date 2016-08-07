(function () {
  'use strict';

  const path = require('path');
  const onHeaders = require('on-headers');
  const pidusage = require('pidusage');

  const defaultConfig = {
    socketPort: 41338,
    path: '/status',
    spans: [{
      interval: 1,
      retention: 60
    }]
  };

  const gatherOsMetrics = (io, span) => {
    pidusage.stat(process.pid, (err, stat) => {
      stat.timestamp = Date.now();

      // Convert from B to MB
      stat.memory = stat.memory / 1024 / 1024;

      span.osStats.push(stat);
      if (span.osStats.length >= span.retention) span.osStats.shift();
      if (span.responses[0] && span.responses[0].timestamp + (span.interval * span.retention * 1000) < Date.now()) span.responses.shift();

      sendMetrics(io, span);
    });
  };

  const sendMetrics = (io, span) => {
    io.emit('stats', {
      osStats: span.osStats,
      responses: span.responses,
    });
  };

  const middlewareWrapper = (config) => {
    if (config === null || config === {} || config === undefined) {
      config = defaultConfig;
    }

    if (config.path === undefined || !config instanceof String) {
      config.path = defaultConfig.path;
    }

    if (config.socketPort === undefined || !config instanceof Number) {
      config.socketPort = defaultConfig.socketPort;
    }

    if (config.spans === undefined || !config instanceof Array) {
      config.spans = defaultConfig.span;
    }

    const io = require('socket.io')(config.socketPort);

    io.on('connection', (socket) => {
      console.log('User connected! ' + socket);
    });

    config.spans.forEach((span) => {
      span.osStats = [];
      span.responses = [];
      setInterval(() => gatherOsMetrics(io, span), span.interval * 1000);
    });

    return (req, res, next) => {
      const startTime = process.hrtime();
      if (req.path === config.path) {
        res.sendFile(path.join(__dirname + '/index.html'));
      } else {
        onHeaders(res, () => {
          const diff = process.hrtime(startTime);
          const responseTime = diff[0] * 1e3 + diff[1] * 1e-6;
          const category = Math.floor(res.statusCode / 100);

          config.spans.forEach((span) => {
            if (span.responses[span.responses.length - 1] !== undefined &&
              span.responses[span.responses.length - 1].timestamp / 1000 + span.interval > Date.now() / 1000) {
              span.responses[span.responses.length - 1][category]++;
              span.responses[span.responses.length - 1].count++;
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

}());