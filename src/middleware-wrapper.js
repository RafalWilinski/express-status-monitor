const fs = require('fs');
const path = require('path');
const onHeaders = require('on-headers');
const validate = require('./helpers/validate');
const onHeadersListener = require('./helpers/on-headers-listener');
const socketIoInit = require('./helpers/socket-io-init');

const middlewareWrapper = config => {
  const validatedConfig = validate(config);

  const renderedHtml =
    fs.readFileSync(path.join(__dirname, '/public/index.html'))
      .toString()
      .replace(/{{title}}/g, validatedConfig.title)
      .replace(/{{port}}/g, validatedConfig.port)
      .replace(/{{script}}/g, fs.readFileSync(path.join(__dirname, '/public/javascripts/app.js')))
      .replace(/{{style}}/g, fs.readFileSync(path.join(__dirname, '/public/stylesheets/style.css')));

  const middleware = (req, res, next) => {
    socketIoInit(req.socket.server, validatedConfig);

    const startTime = process.hrtime();

    if (req.path === validatedConfig.path) {
      if (validatedConfig.iframe) {
        if (res.removeHeader) {
          res.removeHeader('X-Frame-Options');
        }
        if (res.remove) {
          res.remove('X-Frame-Options');
        }

      }
      res.send(renderedHtml);
    } else {
      onHeaders(res, () => {
        onHeadersListener(res.statusCode, startTime, validatedConfig.spans);
      });

      next();
    }
  };

  /* Provide two properties, the middleware and HTML page renderer separately
   * so that the HTML page can be authenticated while the middleware can be
   * earlier in the request handling chain.  Use like:
   * ```
   * const statusMonitor = require('express-status-monitor')(config);
   * server.use(statusMonitor);
   * server.get('/status', isAuthenticated, statusMonitor.pageRoute);
   * ```
   * discussion: https://github.com/RafalWilinski/express-status-monitor/issues/63
   */
  middleware.middleware = middleware;
  middleware.pageRoute = (req, res) => {
    res.send(renderedHtml);
  };
  return middleware;
};

module.exports = middlewareWrapper;
