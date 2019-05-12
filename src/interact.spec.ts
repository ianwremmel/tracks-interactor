import {Context} from './context';
import {interact} from './interact';
import {Interactor} from './interactor';
import {
  Identity,
  AlwaysFailsC,
  services,
  AlwaysSucceedsA,
} from './test-helpers';

describe('interact()', () => {
  it('turn T into Context<T> when necessary', async () => {
    const context = await interact(Identity, 1);
    expect(context.data).toEqual(1);
  });

  it('makes context failures throwsafe', async () => {
    const result = await interact(AlwaysFailsC, {c: true, services});
    expect(services.c.after).not.toHaveBeenCalled();
    expect(services.c.before).toHaveBeenCalled();
    expect(result.error).toMatchInlineSnapshot(
      `[InteractorFailure: mock failure]`
    );
  });

  it('invokes an interactor', async () => {
    const out = await interact(AlwaysSucceedsA, {a: false, services});
    expect(services.a.method).toHaveBeenCalled();
    expect(out.data).toMatchObject({b: true});
  });
});
