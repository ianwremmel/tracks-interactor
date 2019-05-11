import {Context} from './context';
import {interact} from './interact';
import {Interactor} from './interactor';

interface Shape {
  a: boolean;
}

abstract class BaseInteractor extends Interactor<Shape, Shape> {}

describe('Kernel', () => {
  describe('Interactor', () => {
    describe('Interactor', () => {
      describe('#call()', () => {
        it("does the bulk of the interactor's work", async () => {
          class A extends BaseInteractor {
            async call() {
              return new Context({a: !this.context.data.a});
            }
          }

          await expect(
            new A(new Context({a: true})).call()
          ).resolves.toMatchObject({
            data: {
              a: false,
            },
          });
        });

        it('exits early if the interactor fails', () => {
          const spy1 = jest.fn();
          const spy2 = jest.fn();

          class A extends BaseInteractor {
            async call() {
              spy1();
              this.context.fail();
              spy2();
              return this.context;
            }
          }

          expect(new A(new Context({a: true})).call()).rejects.toThrow();
          expect(spy1).toHaveBeenCalled();
          expect(spy2).not.toHaveBeenCalled();
        });
      });

      describe('#before()', () => {
        it('invokes common functionality before `#call()`', async () => {
          const commonBeforeSpy = jest.fn();
          const specializedBeforeSpy = jest.fn();

          abstract class CommonBase extends Interactor<Shape, Shape> {
            async before() {
              commonBeforeSpy();
            }
          }

          class Specialized extends CommonBase {
            async before() {
              super.before();
              specializedBeforeSpy();
            }

            async call() {
              return this.context;
            }
          }

          await interact(Specialized, {a: false});

          expect(commonBeforeSpy).toHaveBeenCalled();
          expect(specializedBeforeSpy).toHaveBeenCalled();
        });

        it('halts execution if the context is failed', async () => {
          const commonBeforeSpy = jest.fn();
          const specializedBeforeSpy = jest.fn();

          abstract class CommonBase extends Interactor<Shape, Shape> {
            async before() {
              commonBeforeSpy();
            }
          }

          class Specialized extends CommonBase {
            async before() {
              super.before();
              this.context.fail('beep');
              specializedBeforeSpy();
            }

            async call() {
              return this.context;
            }
          }

          await expect(
            interact(Specialized, {a: false})
          ).resolves.toMatchObject({success: false});

          expect(commonBeforeSpy).toHaveBeenCalled();
          expect(specializedBeforeSpy).not.toHaveBeenCalled();
        });
      });

      describe('#after()', () => {
        it('invokes common functionality after `#call()`', async () => {
          const commonAfterSpy = jest.fn();
          const specializedAfterSpy = jest.fn();

          abstract class CommonBase extends Interactor<Shape, Shape> {
            async after() {
              commonAfterSpy();
            }
          }

          class Specialized extends CommonBase {
            async after() {
              super.after();
              specializedAfterSpy();
            }

            async call() {
              return this.context;
            }
          }

          await interact(Specialized, {a: false});

          expect(commonAfterSpy).toHaveBeenCalled();
          expect(specializedAfterSpy).toHaveBeenCalled();
        });
      });

      describe('#around()', () => {
        it('halts execution on failure', async () => {
          const spy = jest.fn();

          abstract class CommonBase extends Interactor<Shape, Shape> {
            async around(fn: () => Promise<void>) {
              spy('base before');
              this.context.fail('beep');
              await fn();
              spy('base after');
            }
          }

          class Specialized extends CommonBase {
            async around(fn: () => Promise<void>) {
              spy('specialized before');
              await super.around(fn);
              spy('specialized after');
            }
            async call() {
              return this.context;
            }
          }

          await interact(Specialized, {a: false});

          expect(spy).toHaveBeenCalledTimes(2);
          expect(spy).toHaveBeenNthCalledWith(1, 'specialized before');
          expect(spy).toHaveBeenNthCalledWith(2, 'base before');
        });

        it('invokes common functionality before and after `#call()`', async () => {
          const spy = jest.fn();

          abstract class CommonBase extends Interactor<Shape, Shape> {
            async around(fn: () => Promise<void>) {
              spy('base before');
              await fn();
              spy('base after');
            }
          }

          class Specialized extends CommonBase {
            async around(fn: () => Promise<void>) {
              spy('specialized before');
              await super.around(fn);
              spy('specialized after');
            }
            async call() {
              return this.context;
            }
          }

          await interact(Specialized, {a: false});

          expect(spy).toHaveBeenNthCalledWith(1, 'specialized before');
          expect(spy).toHaveBeenNthCalledWith(2, 'base before');
          expect(spy).toHaveBeenNthCalledWith(3, 'base after');
          expect(spy).toHaveBeenNthCalledWith(4, 'specialized after');
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
              return this.context;
            }
          }

          await interact(I, {a: false});

          expect(spy).toHaveBeenCalledTimes(4);
          expect(spy).toHaveBeenNthCalledWith(1, 'around: before');
          expect(spy).toHaveBeenNthCalledWith(2, 'before');
          expect(spy).toHaveBeenNthCalledWith(3, 'after');
          expect(spy).toHaveBeenNthCalledWith(4, 'around: after');
        });
      });
    });
  });
});
