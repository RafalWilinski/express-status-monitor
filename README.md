# express-status-monitor
Simple, self-hosted module based on Socket.io and Chart.js to report realtime server metrics for Express-based node servers. More Node frameworks coming soon.

![Monitoring Page](http://i.imgur.com/AHizEWq.gif "Monitoring Page")

## Installation & setup
1. Run `npm install express-status-monitor --save`
2. Before any other middleware or router add following line: 
`app.use(require('express-status-monitor')());`
3. Run server and to go `/status`

## Options

Monitor can be configured by passing options object into `expressMonitor` constructor.
 
Default config:
```
path: '/status',
socketPort: 41338, // Port for Socket.io communication
spans: [{
  interval: 1,     // Every second
  retention: 60    // Keep 60 datapoints in memory
}, {
  interval: 5,     // Every 5 seconds
  retention: 60
}, {
  interval: 15,    // Every 15 seconds
  retention: 60
}]

```

## License

[MIT License](https://opensource.org/licenses/MIT) © Rafal Wilinski
