'use strict';

const request = require('request-promise-native');

module.exports = async (healthChecks) => {
  healthChecks = healthChecks || [];

  const checkPromises = [];

  healthChecks.forEach(healthCheck => {
    let uri = `${healthCheck.protocol}://${healthCheck.host}`;
    
    if (healthCheck.port) {
      uri += `:${healthCheck.port}`;
    }

    uri += healthCheck.path;

    checkPromises.push(request({
      uri: uri,
      method: 'GET'
    }));
  });

  let checkResults = [];

  return _allSettled(checkPromises).then((results) => {
    results.forEach((result, index) => {
      if (result.state === 'rejected') {
        checkResults.push({
          path: healthChecks[index].path,
          status: 'failed'
        });
      } else {
        checkResults.push({
          path: healthChecks[index].path,
          status: 'ok'
        });
      }
    });

    return checkResults;
  });
};

function _allSettled(promises) {
  let wrappedPromises = promises.map(p => Promise.resolve(p)
      .then(
          val => ({ state: 'fulfilled', value: val }),
          err => ({ state: 'rejected', reason: err })));
  return Promise.all(wrappedPromises);
}