const chai = require('chai');
const sinon = require('sinon');

chai.should();

const onHeadersListener = require('../../src/helpers/on-headers-listener');
const defaultConfig = require('../../src/helpers/default-config');

describe('on-headers-listener', () => {
  describe('when invoked', () => {
    const clock = sinon.useFakeTimers();
    const spans = defaultConfig.spans;

    before(() => {
      spans.forEach((span) => {
        span.responses = [];
      });
    });

    after(() => {
      clock.restore();
    });

    it('then for all spans, responses length should equal 1', () => {
      onHeadersListener(404, process.hrtime(), spans);

      spans.forEach((span) => {
        span.responses.length.should.equal(1);
      });
    });

    describe('when invoked after 1 second', () => {
      it('then for span interval 1, responses length should equal 2', () => {
        clock.tick(1000);
        onHeadersListener(500, process.hrtime(), spans);

        spans.forEach((span) => {
          if (span.interval === 1) {
            span.responses.length.should.equal(2);
          } else {
            span.responses.length.should.equal(1);
          }
        });
      });
    });
  });
});
