/* eslint strict: "off" */

'use strict';

const socketIo = require('socket.io');
const gatherOsMetrics = require('./gather-os-metrics');

let io;

module.exports = (server, config) => {
  if (io === null || io === undefined) {
    if (config.websocket !== null) {
      io = config.websocket;
    } else {
      io = socketIo(server);
    }

    io.on('connection', (socket) => {
      socket.emit('esm_start', config.spans);
      socket.on('esm_change', () => {
        socket.emit('esm_start', config.spans);
      });
    });

    config.spans.forEach((span) => {
      span.os = [];
      span.responses = [];
      const interval = setInterval(() => gatherOsMetrics(io, span), span.interval * 1000);
      interval.unref(); // don't keep node.js process up
    });
  }
};
