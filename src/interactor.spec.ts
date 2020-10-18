import {Context} from './context';
import {AlwaysSucceedsA, services} from './test-helpers';

describe('Interactor', () => {
  describe('#call()', () => {
    it("does the bulk of the interactor's work", async () => {
      await expect(
        new AlwaysSucceedsA(new Context({a: true, services})).call()
      ).resolves.toMatchObject({
        data: {
          b: true,
        },
      });
    });
  });
});
