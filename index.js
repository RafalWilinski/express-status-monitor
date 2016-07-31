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

  const gatherOsMetrics = (io) => {
    pidusage.stat(process.pid, (err, stat) => {
      stat.timestamp = Date.now();
      osStats.push(stat);
      sendMetrics(io);
    });
  };

  const sendMetrics = (io) => {
     osStats.slice(Math.max(osStats.length - defaultConfig.retention, 1));

    io.emit('stats', {
      osStats: osStats.slice(Math.max(osStats.length - defaultConfig.retention, 1)),
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

    setInterval(() => gatherOsMetrics(io), config.interval * 1000);

    io.on('connection', (socket) => {

    });

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