const chai = require('chai');

chai.should();

const socketIoInit = require('../../helpers/socket-io-init');
const defaultConfig = require('../../helpers/default-config');

describe('helpers', () => {
  describe('socket-io-init', () => {
    describe('when invoked', () => {
      it('then ...', () => {
        const spans = defaultConfig.spans;

        socketIoInit({}, spans);

        // todo: not sure what should I test, maybe the resulted span structure?
        // todo: also this component has got some internal timing events?
      });
    });
  });
});
