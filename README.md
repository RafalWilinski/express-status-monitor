# express-status-monitor
A module based on Socket.io and Chart.js to report realtime server metrics for Express-based node servers. More Node frameworks coming soon.

![Monitoring Page](/out.gif?raw=true "Monitoring Page")

## How to use it (in progress)
1. Add this as a dependency (will be on NPM soon)
2. Before any other middleware or router add following line: 
`app.use(expressMonitor());`
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
