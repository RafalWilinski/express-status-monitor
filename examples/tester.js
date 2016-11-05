const request = require('request');

const port = 3000;

const requestUrl = `http://localhost:${port}/return-status/`;
const interval = 50;

const makeDummyCall = () => setTimeout(() => {
  const code = 200 + Math.random() * 399;
  request.get(`${requestUrl}${code}`);

  makeDummyCall();
}, interval);

makeDummyCall();
