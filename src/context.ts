import {Exception} from '@ianwremmel/exception';
import {produce} from 'immer';

/** Thrown when an Interactor is failed via context.fail */
export class InteractorFailure extends Exception {
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
  constructor(message: any) {
    super(message);
    if (message instanceof Error) {
      this.original = message;
    }
  }
}

export interface Context<T> {
  data: T;

  error?: InteractorFailure;
}

/** The "arguments" passed to an Interactor */
export class Context<T> {
  /** Indicates if the Interactor has failed */
  get failed(): boolean {
    return !!this.error;
  }

  /** constructor */
  constructor(data: T) {
    this.data = data;
  }

  /**
   * Creates a new Context from the existing. Typically use to produce the
   * return value for Interactor#call.
   *
   * A bit of a vestige from a time when we had Organizers. This method may be
   * removed in favor of returning a plan value.
   */
  extend<R>(fn: (data: T) => R): Context<R> {
    const nextData = produce(this.data, fn);
    const next = new Context(nextData);
    // @ts-expect-error - I'm not sure how to get templating right here, but
    // typechecking works correctly outside of this function, so I think it's
    // fine
    return next;
  }

  /** Marks this Interactor a failed */
  fail(message?: string | Error) {
    if (message instanceof Error) {
      const err = new InteractorFailure(message);
      err.stack = message.stack;
      this.error = err;
      throw err;
    }

    const err = new InteractorFailure(message);
    this.error = err;
    throw err;
  }
}

export interface SuccessContext<T> extends Context<T> {
  failed: false;
}

export interface FailedContext<T> extends Context<T> {
  data: never;
  failed: true;
  error: InteractorFailure;
}

export type ResultContext<T, R> = SuccessContext<R> | FailedContext<T>;
