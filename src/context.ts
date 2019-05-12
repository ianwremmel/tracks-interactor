import {Exception} from '@ianwremmel/exception';
import {produce} from 'immer';

/** Thrown when an Interactor is failed via context.fail */
export class InteractorFailure<T> extends Exception {
  context: Context<T>;

  original?: Error;

  /** constructor */
  constructor(message: any, context: Context<T>) {
    super(message);
    if (message instanceof Error) {
      this.original = message;
    }

    this.context = context;
  }
}

export interface Context<T> {
  data: T;

  error?: InteractorFailure<T>;
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
   * Used within Organized Interactor chains to produce a new context for
   * passing to the next Interactor
   */
  extend<R>(fn: (data: T) => R): Context<R> {
    const nextData = produce(this.data, fn);
    const next = new Context(nextData);
    // @ts-ignore - I'm not sure how to get templating right here, but
    // typechecking works correctly outside of this function, so I think it's
    // fine
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

export interface SuccessContext<T> extends Context<T> {
  failed: false;
}

export interface FailedContext<T> extends Context<T> {
  failed: true;
  error: InteractorFailure<T>;
}

export type ResultContext<T, R> = SuccessContext<R> | FailedContext<T>;
