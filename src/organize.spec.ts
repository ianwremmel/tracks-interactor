import {interact} from './interact';
import {Interactor} from './interactor';
import {organize} from './organize';
import {
  services,
  AShape,
  CShape,
  DShape,
  AlwaysSucceedsA,
  AlwaysSucceedsB,
  AlwaysFailsC,
} from './test-helpers';

describe('interact()', () => {
  it('chains together multiple interactors', async () => {
    class O extends Interactor<AShape, CShape> {
      async call() {
        return organize(AlwaysSucceedsA)
          .organize(AlwaysSucceedsB)
          .call(this.context);
      }
    }

    const context = await interact(O, {a: true, services});
    expect(context.data).toEqual({c: true, services});
    expect(services.a.method).toHaveBeenCalled();
    expect(services.b.method).toHaveBeenCalled();
    expect(services.c.after).not.toHaveBeenCalled();
  });

  it('reverts interactor actions if a failure occurs', async () => {
    class O extends Interactor<AShape, DShape> {
      async call() {
        return organize(AlwaysSucceedsA)
          .organize(AlwaysSucceedsB)
          .organize(AlwaysFailsC)
          .call(this.context);
      }
    }

    const context = await interact(O, {a: true, services});
    expect(services.a.method).toHaveBeenCalled();
    expect(services.b.method).toHaveBeenCalled();
    expect(services.c.after).not.toHaveBeenCalled();
    expect(services.c.unmethod).not.toHaveBeenCalled();
    expect(services.b.unmethod).toHaveBeenCalled();
    expect(services.a.unmethod).toHaveBeenCalled();
    expect(context.failed).toBe(true);
  });
});
