# express-status-monitor
Simple, self-hosted module based on Socket.io and Chart.js to report realtime server metrics for Express-based node servers. 

[Koa.js version of this library](https://github.com/capaj/koa-monitor).

More Node frameworks coming soon.

![Monitoring Page](http://i.imgur.com/AHizEWq.gif "Monitoring Page")

## Installation & setup
1. Run `npm install express-status-monitor --save`
2. Before any other middleware or router add following line:
`app.use(require('express-status-monitor')());`
3. Run server and go to `/status`

## Run examples

1. Go to `examples/`
2. Run `npm install`
3. Run server `node index.js`
4. Go to `http://0.0.0.0:3000`

## Options

Monitor can be configured by passing options object into `expressMonitor` constructor.

Default config:
```
title: 'Express Status',  // Default title
path: '/status',
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

Example using https://www.npmjs.com/package/connect-ensure-login
```
const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn()

app.get('/status', ensureLoggedIn, require('express-status-monitor')())
```

Credits to [@mattiaerre](https://github.com/mattiaerre)

## License

[MIT License](https://opensource.org/licenses/MIT) © Rafal Wilinski
