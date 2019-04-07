import {Context} from './context';
import {interact} from './interact';
import {Interactor} from './interactor';

describe('Kernel', () => {
  describe('Interactor', () => {
    describe('interact()', () => {
      it('turn T into Context<T> when necessary', async () => {
        class A extends Interactor<{}, 1> {
          async call() {
            return this.context;
          }
        }

        const context = await interact({}, A, 1);
        expect(context.data).toEqual(1);
      });

      it('makes context failures throwsafe', async () => {
        const spy = jest.fn();

        class A extends Interactor<{}, any> {
          async call() {
            this.context.fail(new Error('something bad happened'));
            spy();
            return this.context;
          }
        }

        await expect(
          interact({}, A, new Context({}))
        ).resolves.toMatchSnapshot();
        expect(spy).not.toHaveBeenCalled();
      });

      it('invokes an interactor', async () => {
        const spy = jest.fn();

        interface Input {
          a: boolean;
        }

        interface Output {
          b: boolean;
        }

        class A extends Interactor<{}, Input, Output> {
          async call(): Promise<Context<Output>> {
            spy(this.context);
            return this.context.extend(() => ({
              b: true,
            }));
          }
        }

        const out = await interact(
          {},
          A,
          new Context({
            a: false,
          })
        );
        expect(out).toMatchSnapshot();
        expect(spy).toHaveBeenCalled();
        expect(out.data).toEqual({b: true});
      });
    });
  });
});
