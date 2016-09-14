const request = require('request');

const requestUrl = 'http://localhost:3000/return-status/';
const interval = 50;

const makeDummyCall = () => setTimeout(() => {
  const code = 200 + Math.random() * 399;
  request.get(`${requestUrl}${code}`);
  makeDummyCall();
}, interval);

makeDummyCall();
