import {interact} from './interact';
import {Interactor} from './interactor';
import {organize} from './organize';

const services = {
  a: {
    method: jest.fn(),
    unmethod: jest.fn(),
  },
  b: {
    method: jest.fn(),
    unmethod: jest.fn(),
  },
  c: {
    method: jest.fn(),
    unmethod: jest.fn(),
  },
};

type ServiceMap = typeof services;

interface CommonShape {
  services: ServiceMap;
}

interface AShape extends CommonShape {
  a: boolean;
}

interface BShape extends CommonShape {
  b: boolean;
}

interface CShape extends CommonShape {
  c: boolean;
}

interface DShape extends CommonShape {
  d: boolean;
}

describe('Kernel', () => {
  describe('Interactor', () => {
    describe('interact()', () => {
      it('chains together multiple interactors', async () => {
        class A extends Interactor<AShape, BShape> {
          async call() {
            this.context.data.services.a.method();
            return this.context.extend((draft) => ({
              b: true,
              services: draft.services,
            }));
          }
        }

        class B extends Interactor<BShape, CShape> {
          async call() {
            this.context.data.services.b.method();
            return this.context.extend((draft) => ({
              c: true,
              services: draft.services,
            }));
          }
        }

        class O extends Interactor<AShape, CShape> {
          async call() {
            return organize(A)
              .organize(B)
              .call(this.context);
          }
        }

        const context = await interact(O, {a: true, services});
        expect(context.data).toEqual({c: true, services});
        expect(services.a.method).toHaveBeenCalled();
        expect(services.b.method).toHaveBeenCalled();
        expect(services.c.method).not.toHaveBeenCalled();
      });

      it('reverts interactor actions if a failure occurs', async () => {
        class A extends Interactor<AShape, BShape> {
          async call() {
            this.context.data.services.a.method();
            return this.context.extend((draft) => ({
              b: true,
              services: draft.services,
            }));
          }
          async rollback() {
            this.context.data.services.a.unmethod();
          }
        }

        class B extends Interactor<BShape, CShape> {
          async call() {
            this.context.data.services.b.method();
            return this.context.extend((draft) => ({
              c: true,
              services: draft.services,
            }));
          }

          async rollback() {
            this.context.data.services.b.unmethod();
          }
        }

        class C extends Interactor<CShape, DShape> {
          async call() {
            this.context.data.services.c.method();
            this.context.fail('mock failure');
            return this.context.extend((draft) => ({
              d: true,
              services: draft.services,
            }));
          }

          async rollback() {
            this.context.data.services.c.unmethod();
          }
        }

        class O extends Interactor<AShape, DShape> {
          async call() {
            return organize(A)
              .organize(B)
              .organize(C)
              .call(this.context);
          }
        }

        const context = await interact(O, {a: true, services});
        expect(services.a.method).toHaveBeenCalled();
        expect(services.b.method).toHaveBeenCalled();
        expect(services.c.method).toHaveBeenCalled();
        expect(services.c.unmethod).not.toHaveBeenCalled();
        expect(services.b.unmethod).toHaveBeenCalled();
        expect(services.a.unmethod).toHaveBeenCalled();
        expect(context.failure).toBe(true);
      });
    });
  });
});
