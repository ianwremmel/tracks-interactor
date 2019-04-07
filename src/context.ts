import {Exception} from '@ianwremmel/exception';
import {produce} from 'immer';

export interface Context<T> {
  data: T;
}

export interface FailedContext<T> extends Context<T> {
  error: InteractorFailure<T>;
}

/** Thrown when an Interactor is failed via context.fail */
export class InteractorFailure<T> extends Exception {
  context: FailedContext<T>;

  original?: Error;

  /** constructor */
  constructor(message: any, context: Context<T>) {
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

/** The "arguments" passed to an Interactor */
export class Context<T> {
  error?: InteractorFailure<T>;

  /** Indicates if the Interactor has not failed */
  get success() {
    return !this.error;
  }

  /** Indicates if the Interactor has failed */
  get failure() {
    return !!this.error;
  }

  /** constructor */
  constructor(data: T) {
    this.data = data;
  }

  /**
   * Used within Organied Interactor chains to produce a new context for passing to the next Interactor
   */
  extend<R>(fn: (data: T) => R): Context<R> {
    const nextData = produce(this.data, fn);
    const next = new Context(nextData);
    // @ts-ignore - I'm not sure how to get templating right here, but
    // typechecking works correctly outside of this function, so I think it's fine
    return next;
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
