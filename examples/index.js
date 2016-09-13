/* eslint no-console: "off" */

const express = require('express');

const app = express();
const port = process.env.PORT || 3000;

app.use(require('../index')({ path: '/' }));
app.use(require('express-favicon-short-circuit'));

// Example route throwing requested status code
app.get('/return-status/:statusCode', (req, res) => res.sendStatus(req.params.statusCode));

app.listen(port, () => {
  console.log(`Listening on http://0.0.0.0:${port}`);
});
