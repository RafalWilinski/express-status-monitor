module.exports = (statusCode, startTime, spans) => {
  const diff = process.hrtime(startTime);
  const responseTime = ((diff[0] * 1e3) + diff[1]) * 1e-6;
  const category = Math.floor(statusCode / 100);

  spans.forEach(span => {
    const last = span.responses[span.responses.length - 1];

    if (last !== undefined && (last.timestamp / 1000) + span.interval > Date.now() / 1000) {
      last[category] += 1;
      last.count += 1;
      last.mean += (responseTime - last.mean) / last.count;
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
};
