const defaultConfig = require('./default-config');

module.exports = config => {
  if (!config) {
    return defaultConfig;
  }

  const mungeChartVisibility = configChartVisibility => {
    Object.keys(defaultConfig.chartVisibility).forEach(key => {
      if (configChartVisibility[key] === false) {
        defaultConfig.chartVisibility[key] = false;
      }
    });
    return defaultConfig.chartVisibility;
  };

  const prependWithSlash = string => {
    if (string && !string.startsWith('/')) {
      return `/${string}`;
    }
    return string;
  };

  config.title =
    typeof config.title === 'string' ? config.title : defaultConfig.title;
  config.theme =
    typeof config.theme === 'string' ? config.theme : defaultConfig.theme;
  config.path =
    prependWithSlash(
      typeof config.path === 'string'
        ? config.path
        : defaultConfig.path
    );
  config.namespace =
    prependWithSlash(
      typeof config.namespace === 'string'
        ? config.namespace
        : defaultConfig.namespace
    );
  config.socketPath =
    prependWithSlash(
      typeof config.socketPath === 'string'
        ? config.socketPath
        : defaultConfig.socketPath
    );
  config.spans =
    typeof config.spans === 'object' ? config.spans : defaultConfig.spans;
  config.port =
    typeof config.port === 'number' ? config.port : defaultConfig.port;
  config.websocket =
    typeof config.websocket === 'object'
      ? config.websocket
      : defaultConfig.websocket;
  config.iframe =
    typeof config.iframe === 'boolean' ? config.iframe : defaultConfig.iframe;
  config.chartVisibility =
    typeof config.chartVisibility === 'object'
      ? mungeChartVisibility(config.chartVisibility)
      : defaultConfig.chartVisibility;
  config.ignoreStartsWith =
    prependWithSlash(
      typeof config.ignoreStartsWith === 'string'
        ? config.ignoreStartsWith
        : defaultConfig.ignoreStartsWith
    );

  config.healthChecks =
    Array.isArray(config.healthChecks)
      ? config.healthChecks
      : defaultConfig.healthChecks;
  config.healthChecks.forEach(healthCheck => {
    if (healthCheck.path) {
      healthCheck.path = prependWithSlash(healthCheck.path);
    }
  });

  return config;
};
