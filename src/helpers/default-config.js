module.exports = {
  title: 'Express Status',
  path: '/status',
  spans: [
    {
      interval: 1,
      retention: 60,
    },
    {
      interval: 5,
      retention: 60,
    },
    {
      interval: 15,
      retention: 60,
    },
  ],
  port: null,
  websocket: null,
  iframe: false,
};
