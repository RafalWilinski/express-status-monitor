const chai = require('chai');
const sinon = require('sinon');

chai.should();

const expresStatusMonitor = require('../src/middleware-wrapper');
const defaultConfig = require('../src/helpers/default-config');

describe('middleware-wrapper', () => {
  describe('when initialised', () => {
    const middleware = expresStatusMonitor();

    it('then it should be an instance of a Function', () => {
      middleware.should.be.an.instanceof(Function);
    });

    const req = { socket: {} };
    const res = { send: sinon.stub() };
    const next = sinon.stub();

    describe('when invoked', () => {
      beforeEach(() => {
        req.path = defaultConfig.path;
        res.send.reset();
      });

      it(`and req.path === ${defaultConfig.path}, then res.send called`, (done) => {
        middleware(req, res, next);
        setTimeout(() => {
          sinon.assert.called(res.send);
          done();
        });
      });

      it(`and req.path !== ${defaultConfig.path}, then res.send not called`, (done) => {
        req.path = '/another-path';
        middleware(req, res, next);
        setTimeout(() => {
          sinon.assert.notCalled(res.send);
          done();
        });
      });

      it('and res.removeHeader is present, then header is removed', (done) => {
        const middlewareWithConfig = expresStatusMonitor({
          iframe: true,
        });
        const resWithHeaders = Object.assign({}, res);
        resWithHeaders.headers = {
          'X-Frame-Options': 1,
        };
        resWithHeaders.removeHeader = sinon.stub();

        middlewareWithConfig(req, resWithHeaders, next);
        setTimeout(() => {
          sinon.assert.called(resWithHeaders.removeHeader);

          resWithHeaders.removeHeader = undefined;
          resWithHeaders.remove = sinon.stub();
          middlewareWithConfig(req, resWithHeaders, next);
          setTimeout(() => {
            sinon.assert.called(resWithHeaders.remove);
            done();
          });
        });
      });

      describe('and used as separate middleware and page handler', () => {
        it('exposes a page handler', (done) => {
          middleware.pageRoute.should.be.an.instanceof(Function);
          middleware.pageRoute(req, res, next);
          setTimeout(() => {
            sinon.assert.called(res.send);
            done();
          });
        });
      });
    });
  });
});
