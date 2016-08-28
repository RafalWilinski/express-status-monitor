/* eslint no-console: "off" */

const express = require('express');

const app = express();

app.use(require('../index')({ path: '/' }));

app.listen(3000, () => {
  console.log('listening on http://0.0.0.0:3000');
});
