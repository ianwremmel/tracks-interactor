import {Exception} from '@ianwremmel/exception';

import {TypeNarrowingError} from './lib/type-narrowing-error';

/** Thrown when an Interactor is failed via context.fail */
export class InteractorFailure<S, T> extends Exception {
  context: Context<S, T>;

  /** constructor */
  constructor(message: any, context: Context<S, T>) {
    super(message);
    if (message instanceof Error) {
      this.original = message;
    }
    // @ts-ignore - context actually isn't a "FailedContext" until two lines
    // after this constructor is called because `this` is the error that
    // qualifies `context` as a `FailedContext`.
    this.context = context;
  }
}

export interface Context<S, T> {
  data: T;
  services: S;

  error?: InteractorFailure<S, T>;
}

/** The "arguments" passed to an Interactor */
export class Context<S, T> {
  /** Indicates if the Interactor has failed */
  get failed(): boolean {
    return !!this.error;
  }

  /** constructor */
  constructor(services: S, data: T) {
    this.data = data;
    this.services = services;
  }

  /** Marks this Interactor a failed */
  fail(message?: string | Error) {
    if (message instanceof Error) {
      const err = new InteractorFailure(message, this);
      err.stack = message.stack;
      this.error = err;
      throw err;
    }

    const err = new InteractorFailure(message, this);
    this.error = err;
    throw err;
  }
}

export interface SuccessContext<S, T> extends Context<S, T> {
  failed: false;
}

export interface FailedContext<S, T> extends Context<S, T> {
  failed: true;
  error: InteractorFailure<S, T>;
}

export interface Interactor<S, T, R> {
  // this should return a SuccessContext rather than a context, but that breaks
  // typescript inferrence when passing an Interactor to interact()
  (ctx: Context<S, T>): Promise<Context<S, R>>;
}

/**
 * `interact()` corresponds to the class method `Interactor.call` from ruby
 *
 * @param I The interactor or organizer to invoke
 * @param services
 * @param data
 */
export async function interact<S, T, R>(
  i: Interactor<S, T, R>,
  services: S,
  data: T
): Promise<SuccessContext<S, R> | FailedContext<S, T>> {
  const ctx = new Context(services, data);
  try {
    const ret = await i(ctx);
    if (ctx.failed) {
      throw new TypeNarrowingError();
    }
    return ret as SuccessContext<S, R>;
  } catch (err) {
    ctx.error = err;
    if (!ctx.failed) {
      throw new TypeNarrowingError();
    }
    return ctx as FailedContext<S, T>;
  }
}
