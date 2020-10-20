import {Context} from './context';
import {AlwaysSucceedsA, services} from './test-helpers';

describe('Interactor', () => {
  describe('#call()', () => {
    it("does the bulk of the interactor's work", async () => {
      const i = new AlwaysSucceedsA();
      const c = new Context({a: true, services});
      i.context = c;
      await expect(i.call()).resolves.toMatchObject({
        b: true,
      });
    });
  });
});
