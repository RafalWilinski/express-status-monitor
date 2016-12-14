# express-status-monitor

[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/express-status-monitor/Lobby/?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)
[![express-status-monitor on npm](https://img.shields.io/npm/v/express-status-monitor.svg)](https://www.npmjs.com/express-status-monitor)
[![npm](https://img.shields.io/npm/dt/express-status-monitor.svg)](https://img.shields.io/npm/dt/express-status-monitor.svg)
[![bitHound Overall Score](https://www.bithound.io/github/RafalWilinski/express-status-monitor/badges/score.svg)](https://www.bithound.io/github/RafalWilinski/express-status-monitor)
[![CircleCI](https://img.shields.io/circleci/project/github/RafalWilinski/express-status-monitor/master.svg)](https://circleci.com/gh/RafalWilinski/express-status-monitor)

Simple, self-hosted module based on Socket.io and Chart.js to report realtime server metrics for Express-based node servers.

![Monitoring Page](http://i.imgur.com/AHizEWq.gif "Monitoring Page")

## Demo

[Demo available here](https://express-status-monitor-example-fjovaypblp.now.sh)

## Support for other Node.js frameworks

* [koa-monitor](https://github.com/capaj/koa-monitor) for Koa
* [hapijs-status-monitor](https://github.com/ziyasal/hapijs-status-monitor) for hapi.js

## Installation & setup

1. Run `npm install express-status-monitor --save`
2. Before any other middleware or router add following line:
`app.use(require('express-status-monitor')());`
3. Run server and go to `/status`

## Run examples

1. Go to `cd examples/`
2. Run `npm i`
3. Run server `npm start`
4. Go to `http://0.0.0.0:3000`

## Options

Monitor can be configured by passing options object into `expressMonitor` constructor.

Default config:
```javascript
title: 'Express Status',  // Default title
path: '/status',
websocket: existingSocketIoInstance,
spans: [{
  interval: 1,            // Every second
  retention: 60           // Keep 60 datapoints in memory
}, {
  interval: 5,            // Every 5 seconds
  retention: 60
}, {
  interval: 15,           // Every 15 seconds
  retention: 60
}]

```

## Securing endpoint

The HTML page handler is exposed as a `pageRoute` property on the main
middleware function.  So the middleware is mounted to intercept all requests
while the HTML page handler will be authenticated.

Example using https://www.npmjs.com/package/connect-ensure-login
```javascript
const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn()

const statusMonitor = require('express-status-monitor')();
app.use(statusMonitor);
app.get('/status', ensureLoggedIn, statusMonitor.pageRoute)
```

Credits to [@mattiaerre](https://github.com/mattiaerre)

Example using [http-auth](https://www.npmjs.com/package/http-auth)
```javascript
const auth = require('http-auth');
const basic = auth.basic({realm: 'Monitor Area'}, function(user, pass, callback) {
  callback(user === 'username' && pass === 'password');
});

const statusMonitor = require('express-status-monitor')();
app.use(statusMonitor);
app.get('/status', auth.connect(basic), statusMonitor.pageRoute)
```

## Using module with socket.io in project

If you're using socket.io in your project, this module could break your project because this module by default will spawn its own socket.io instance. To mitigate that, fill websocket parameter with your main socket.io instance as well as port parameter.

## Tests and coverage

In order to run test and coverage use the following npm commands:
```
npm test
npm run coverage
```

## License

[MIT License](https://opensource.org/licenses/MIT) © Rafal Wilinski
