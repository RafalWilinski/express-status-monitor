#### express-monitor
A module based on Socket.io and Chart.js to report realtime server metrics for Express-based node servers.

![Monitoring Page](/out.gif?raw=true "Monitoring Page")

### How to use it (in progress)
1. Add this as a dependency (will be on NPM soon)
2. Before any other middleware or router add following line: 
`app.use(expressMonitor());`
3. Run server and to go `/status`

