const chai = require('chai');

chai.should();

const defaultConfig = require('../../src/helpers/default-config');
const validate = require('../../src/helpers/validate');

describe('helpers', () => {
  describe('validate', () => {
    describe('when config is null or undefined', () => {
      const config = validate();

      it(`then title === ${defaultConfig.title}`, () => {
        config.title.should.equal(defaultConfig.title);
      });

      it(`then path === ${defaultConfig.path}`, () => {
        config.path.should.equal(defaultConfig.path);
      });

      it(`then spans === ${JSON.stringify(defaultConfig.spans)}`, () => {
        config.spans.should.equal(defaultConfig.spans);
      });
    });

    describe('when config is invalid', () => {
      const config = validate({ title: true, path: false, spans: 'not-an-array' });

      it(`then title === ${defaultConfig.title}`, () => {
        config.title.should.equal(defaultConfig.title);
      });

      it(`then path === ${defaultConfig.path}`, () => {
        config.path.should.equal(defaultConfig.path);
      });

      it(`then spans === ${JSON.stringify(defaultConfig.spans)}`, () => {
        config.spans.should.equal(defaultConfig.spans);
      });
    });

    describe('when config is valid', () => {
      const customConfig = { title: 'Custom title', path: '/custom-path', spans: [{}, {}, {}] }
      const config = validate(customConfig);

      it(`then title === ${customConfig.title}`, () => {
        config.title.should.equal(customConfig.title);
      });

      it(`then path === ${customConfig.path}`, () => {
        config.path.should.equal(customConfig.path);
      });

      it(`then spans === ${JSON.stringify(customConfig.spans)}`, () => {
        config.spans.should.equal(customConfig.spans);
      });
    });
  });
});
