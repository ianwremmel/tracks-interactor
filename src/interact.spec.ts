import {Context, InteractorFailure} from './context';
import {interact} from './interact';
import {
  Identity,
  AlwaysFailsC,
  services,
  AlwaysSucceedsA,
} from './test-helpers';

describe('interact()', () => {
  it('invokes an interactor', async () => {
    const out = await interact(AlwaysSucceedsA, {a: false, services});
    expect(services.a.method).toHaveBeenCalled();
    expect(out.data).toMatchObject({b: true});
  });

  it('turn T into Context<T> when necessary', async () => {
    const context = await interact(Identity, 1);
    expect(context.data).toEqual(1);
  });

  it('produces a successful context from a context', async () => {
    const result = await interact(
      AlwaysSucceedsA,
      new Context({a: true, services})
    );
    if (result.failed) {
      expect(result.failed).toBe(false);
    } else {
      expect(result.data).toHaveProperty('b');
      expect(result.data.b).toBe(true);
    }
  });

  it('produces a successful context from literals', async () => {
    const result = await interact(AlwaysSucceedsA, {
      a: true,
      services,
    });
    if (result.failed) {
      expect(result.failed).toBe(false);
    } else {
      expect(result.data).toHaveProperty('b');
      expect(result.data.b).toBe(true);
    }
  });

  it('makes context failures throwsafe', async () => {
    const result = await interact(AlwaysFailsC, {c: true, services});
    expect(result.error).toMatchInlineSnapshot(
      `[InteractorFailure: mock failure]`
    );
  });

  it('produces a failed context', async () => {
    const result = await interact(AlwaysFailsC, {c: true, services});

    if (result.failed) {
      expect(result).not.toHaveProperty('data');
      expect(result.error).toBeInstanceOf(InteractorFailure);
      expect(result.error.message).toMatch(/mock failure/);
    } else {
      expect(result.failed).toBe(true);
    }
  });
});
