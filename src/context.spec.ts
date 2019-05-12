import {Context, InteractorFailure} from './context';

describe('Context', () => {
  describe('#failed', () => {
    it('is false by default', () => {
      const context = new Context({});
      expect(context.failed).toBe(false);
    });

    it('is true after failing', () => {
      const context = new Context({});
      expect(context.failed).toBe(false);
      expect(() => {
        context.fail('test');
      }).toThrow(InteractorFailure);
      expect(context.failed).toBe(true);
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
