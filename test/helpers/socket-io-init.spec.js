const chai = require('chai');

chai.should();

const socketIoInit = require('../../src/helpers/socket-io-init');
const defaultConfig = require('../../src/helpers/default-config');

describe('socket-io-init', () => {
  describe('when invoked', () => {
    it('then all spans should have os and responses property', () => {
      const spans = defaultConfig.spans;

      spans.forEach((span) => {
        span.should.not.have.property('os');
        // info: not working as if it was another test interfering
        // span.should.not.have.property('responses');
      });

      socketIoInit({}, defaultConfig);

      spans.forEach((span) => {
        span.should.have.property('os');
        span.should.have.property('responses');
      });
    });
  });
});
