const fs = require('fs');
const path = require('path');
const onHeaders = require('on-headers');
const Handlebars = require('handlebars');
const validate = require('./helpers/validate');
const onHeadersListener = require('./helpers/on-headers-listener');
const socketIoInit = require('./helpers/socket-io-init');
const healthChecker = require('./helpers/health-checker');

const middlewareWrapper = config => {
  const validatedConfig = validate(config);
  const bodyClasses = Object.keys(validatedConfig.chartVisibility)
    .reduce((accumulator, key) => {
      if (validatedConfig.chartVisibility[key] === false) {
        accumulator.push(`hide-${key}`);
      }
      return accumulator;
    }, [])
    .join(' ');

  const data = {
    title: validatedConfig.title,
    port: validatedConfig.port,
    socketPath: validatedConfig.socketPath,
    bodyClasses,
    script: fs.readFileSync(path.join(__dirname, '/public/javascripts/app.js')),
    style: fs.readFileSync(path.join(__dirname, '/public/stylesheets/', validatedConfig.theme))
  };

  const htmlTmpl = fs
    .readFileSync(path.join(__dirname, '/public/index.html'))
    .toString();

  const render = Handlebars.compile(htmlTmpl);

  const middleware = (req, res, next) => {
    socketIoInit(req.socket.server, validatedConfig);

    const startTime = process.hrtime();

    if (req.path === validatedConfig.path) {
      healthChecker(validatedConfig.healthChecks).then(results => {
        data.healthCheckResults = results;
        if (validatedConfig.iframe) {
          if (res.removeHeader) {
            res.removeHeader('X-Frame-Options');
          }

          if (res.remove) {
            res.remove('X-Frame-Options');
          }
        }

        res.send(render(data));
      });
    } else {
      if (!req.path.startsWith(validatedConfig.ignoreStartsWith)) {
        onHeaders(res, () => {
          onHeadersListener(res.statusCode, startTime, validatedConfig.spans);
        });
      }

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
    healthChecker(validatedConfig.healthChecks).then(results => {
      data.healthCheckResults = results;
      res.send(render(data));
    });
  };
  return middleware;
};

module.exports = middlewareWrapper;
