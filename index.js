const fs = require('fs');
const path = require('path');
const onHeaders = require('on-headers');
const validate = require('./helpers/validate');
const gatherOsMetrics = require('./helpers/gather-os-metrics');
const onHeadersListener = require('./helpers/on-headers-listener');
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
      onHeaders(res, () => { onHeadersListener(res.statusCode, startTime, config.spans) });
      next();
    }
  };
};

module.exports = middlewareWrapper;
