module.exports = (io, span) => {
  io.emit('stats', {
    os: span.os[span.os.length - 2],
    responses: span.responses[span.responses.length - 2],
    interval: span.interval,
    retention: span.retention,
  });
};
