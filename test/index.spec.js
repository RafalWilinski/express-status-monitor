const chai = require('chai');
const sinon = require('sinon');
chai.should();

describe('given express-status-monitor', () => {
  const expresStatusMonitor = require('../index.js');
  describe('when initialised', () => {
    const config = { path: '/status' };
    const middleware = expresStatusMonitor(config);

    it('then it should be an instance of function', () => {
      middleware.should.be.an.instanceof(Function);
    });

    const req = { socket: {} };
    const res = { send: sinon.stub() };
    const next = sinon.stub();

    describe('when invoked', () => {
      beforeEach(() => {
        req.path = config.path;
        res.send.reset();
      });

      it('and req.path === config.path, then res.send called', () => {
        req.path = config.path;
        middleware(req, res, next);
        sinon.assert.called(res.send)
      });

      it('and req.path !== config.path, then res.send not called', () => {
        req.path = '/another-path';
        middleware(req, res, next);
        sinon.assert.notCalled(res.send)
      });
    });
  });
});