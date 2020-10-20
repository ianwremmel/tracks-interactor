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
});
