const defaultConfig = require('./default-config');

module.exports = config => {
  if (!config) {
    return defaultConfig;
  }

  config.title = (typeof config.title === 'string') ? config.title : defaultConfig.title;

  config.path = (typeof config.path === 'string') ? config.path : defaultConfig.path;

  config.spans = (typeof config.spans === 'object') ? config.spans : defaultConfig.spans;

  config.port = (typeof config.port === 'number') ? config.port : defaultConfig.port;

  config.websocket = (typeof config.websocket === 'object') ? config.websocket : defaultConfig.websocket;

  config.iframe = (typeof config.iframe === 'boolean') ? config.iframe : defaultConfig.iframe;

  return config;
};
