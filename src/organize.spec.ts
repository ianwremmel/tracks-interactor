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

interface AShape {
  a: boolean;
}

interface BShape {
  b: boolean;
}

interface CShape {
  c: boolean;
}

interface DShape {
  d: boolean;
}

describe('Kernel', () => {
  describe('Interactor', () => {
    describe('interact()', () => {
      it('chains together multiple interactors', async () => {
        class A extends Interactor<ServiceMap, AShape, BShape> {
          async call() {
            this.services.a.method();
            return this.context.extend(() => ({b: true}));
          }
        }

        class B extends Interactor<ServiceMap, BShape, CShape> {
          async call() {
            this.services.b.method();
            return this.context.extend(() => ({c: true}));
          }
        }

        class O extends Interactor<ServiceMap, AShape, CShape> {
          async call() {
            return organize(A)
              .organize(B)
              .call(this.services, this.context);
          }
        }

        const context = await interact(services, O, {a: true});
        expect(context.data).toEqual({c: true});
        expect(services.a.method).toHaveBeenCalled();
        expect(services.b.method).toHaveBeenCalled();
        expect(services.c.method).not.toHaveBeenCalled();
      });

      it('reverts interactor actions if a failure occurs', async () => {
        class A extends Interactor<ServiceMap, AShape, BShape> {
          async call() {
            this.services.a.method();
            return this.context.extend(() => ({b: true}));
          }
          async rollback() {
            this.services.a.unmethod();
          }
        }

        class B extends Interactor<ServiceMap, BShape, CShape> {
          async call() {
            this.services.b.method();
            return this.context.extend(() => ({c: true}));
          }

          async rollback() {
            this.services.b.unmethod();
          }
        }

        class C extends Interactor<ServiceMap, CShape, DShape> {
          async call() {
            this.services.c.method();
            this.context.fail('mock failure');
            return this.context.extend(() => ({d: true}));
          }

          async rollback() {
            this.services.c.unmethod();
          }
        }

        class O extends Interactor<ServiceMap, AShape, DShape> {
          async call() {
            return organize(A)
              .organize(B)
              .organize(C)
              .call(this.services, this.context);
          }
        }

        const context = await interact(services, O, {a: true});
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
