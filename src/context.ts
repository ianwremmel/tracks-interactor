import {Exception} from '@ianwremmel/exception';

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
