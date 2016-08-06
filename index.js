(function () {
  'use strict';

  const path = require('path');
  const onHeaders = require('on-headers');
  const pidusage = require('pidusage');
  const responseTimes = [];
  const osStats = [];

  const defaultConfig = {
    socketPort: 41338,
    path: '/status',
    interval: 1,
    retention: 100,
  };

  const gatherOsMetrics = (io, config) => {
    pidusage.stat(process.pid, (err, stat) => {
      stat.timestamp = Date.now();
      // Convert from B to MB
      stat.memory = stat.memory / 1024 / 1024;

      osStats.push(stat);
      if (osStats.length >= config.retention) osStats.shift();

      sendMetrics(io);
    });
  };

  const sendMetrics = (io) => {
    io.emit('stats', {
      osStats,
      responseTimes
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

    if (config.interval === undefined || !config instanceof Number) {
      config.interval = defaultConfig.interval;
    }

    const io = require('socket.io')(config.socketPort);

    setInterval(() => gatherOsMetrics(io, config), config.interval * 1000);

    return (req, res, next) => {
      const startTime = process.hrtime();
      if (req.path === config.path) {
        res.sendFile(path.join(__dirname + '/index.html'));
      } else {
        onHeaders(res, () => {
          var diff = process.hrtime(startTime);
          var responseTime = diff[0] * 1e3 + diff[1] * 1e-6;

          responseTimes.push({
            endpoint: req.path,
            responseTime,
            timestamp: Date.now()
          });
        });

        next();
      }
    };
  };

  module.exports = middlewareWrapper;

}());