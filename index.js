const fs = require('fs');
const path = require('path');
const onHeaders = require('on-headers');
const validate = require('./helpers/validate');
const gatherOsMetrics = require('./helpers/gather-os-metrics');
const socketIo = require('socket.io');

let io;

const middlewareWrapper = (config) => {
  config = validate(config);

  const renderedHtml =
    fs.readFileSync(path.join(__dirname, '/index.html'))
      .toString()
      .replace(/{{title}}/g, config.title)
      .replace(/{{script}}/g, fs.readFileSync(path.join(__dirname, '/app.js')))
      .replace(/{{style}}/g, fs.readFileSync(path.join(__dirname, '/style.css')));

  return (req, res, next) => {
    if (io === null || io === undefined) {
      io = socketIo(req.socket.server);

      io.on('connection', (socket) => {
        socket.emit('start', config.spans);
        socket.on('change', () => {
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
              2: category === 2 ? 1 : 0,
              3: category === 3 ? 1 : 0,
              4: category === 4 ? 1 : 0,
              5: category === 5 ? 1 : 0,
              count: 1,
              mean: responseTime,
              timestamp: Date.now(),
            });
          }
        });
      });

      next();
    }
  };
};

module.exports = middlewareWrapper;
