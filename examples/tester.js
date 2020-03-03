const axios = require("axios");

const port = 3000;
const interval = 50;
const requestUrl = `http://0.0.0.0:${port}/return-status/`;

const makeDummyCall = () =>
  setTimeout(() => {
    const code = 200 + Math.random() * 399;
    axios.get(`${requestUrl}${code}`).catch(() => {});

    makeDummyCall();
  }, interval);

makeDummyCall();
