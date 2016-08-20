const express = require('express');
const app = express();

const config = {
  path: '/',
  title: 'Express Status',
  spans: [{
    interval: 1,
    retention: 60
  }, {
    interval: 5,
    retention: 60
  }, {
    interval: 15,
    retention: 60
  }]
}

app.use(require('../index')(config));

app.listen(3000, () => {
  console.log('🌏  http://0.0.0.0:3000');
});
