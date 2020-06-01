import {Context} from './context';
import {interact} from './interact';
import {Interactor} from './interactor';
import {
  AlwaysSucceedsA,
  services,
  AlwaysFailsC,
  AlwaysSucceedsB,
} from './test-helpers';

interface Shape {
  a: boolean;
}

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

    it('exits early if the interactor fails', async () => {
      await interact(AlwaysFailsC, {c: true, services});
      expect(services.c.before).toHaveBeenCalled();
      expect(services.c.after).not.toHaveBeenCalled();
    });
  });

  describe('#before()', () => {
    it('invokes common functionality before `#call()`', async () => {
      await interact(AlwaysSucceedsA, {a: true, services});
      expect(services.a.before).toHaveBeenCalled();
    });
  });

  describe('#after()', () => {
    it('invokes common functionality after `#call()`', async () => {
      await interact(AlwaysSucceedsA, {a: true, services});
      expect(services.a.after).toHaveBeenCalled();
    });
  });

  describe('#around()', () => {
    it('invokes common functionality before and after `#call()`', async () => {
      await interact(AlwaysSucceedsB, {b: false, services});

      expect(services.b.before).toBeCalled();
      expect(services.b.after).toBeCalled();
    });
  });

  describe('#before(), #around(), #after()', () => {
    it('execute in the correct order', async () => {
      const spy = jest.fn();

      class I extends Interactor<Shape, Shape> {
        async before() {
          spy('before');
        }
        async after() {
          spy('after');
        }
        async around(fn: () => Promise<void>) {
          spy('around: before');
          await fn();
          spy('around: after');
        }
        async call() {
          spy('call');
          return this.context;
        }
      }

      await interact(I, {a: false});

      expect(spy).toHaveBeenCalledTimes(5);
      expect(spy).toHaveBeenNthCalledWith(1, 'around: before');
      expect(spy).toHaveBeenNthCalledWith(2, 'before');
      expect(spy).toHaveBeenNthCalledWith(3, 'call');
      expect(spy).toHaveBeenNthCalledWith(4, 'after');
      expect(spy).toHaveBeenNthCalledWith(5, 'around: after');
    });
  });
});
