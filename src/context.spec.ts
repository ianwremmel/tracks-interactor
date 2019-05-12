import {assert} from 'chai';

import {Context, InteractorFailure} from './context';

describe('Context', () => {
  describe('#success', () => {
    it('is true by default', () => {
      const context = new Context({});
      assert.isTrue(context.success);
    });

    it('is false after failing', () => {
      const context = new Context({});
      assert.isTrue(context.success);
      assert.throws(() => {
        context.fail('testing');
      }, InteractorFailure);
      assert.isFalse(context.success);
    });
  });

  describe('#failure', () => {
    it('is false by default', () => {
      const context = new Context({});
      assert.isFalse(context.failure);
    });

    it('is true after failing', () => {
      const context = new Context({});
      assert.isFalse(context.failure);
      assert.throws(() => {
        context.fail('test');
      }, InteractorFailure);
      assert.isTrue(context.failure);
    });
  });

  describe('#extend()', () => {
    it('produces a context with new data', () => {
      const ctx1 = new Context({a: 1});

      const recipe = () => {
        return {b: 2};
      };

      const ctx2 = ctx1.extend(recipe);

      expect(ctx2.data).toEqual({b: 2});
    });
  });
});
