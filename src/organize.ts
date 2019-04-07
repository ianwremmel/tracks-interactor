import {TypeNarrowingError} from './lib/type-narrowing-error';
import {Interactor, InteractorConstructor} from './interactor';
import {Context, FailedContext} from './context';
import {interact} from './interact';

interface Organizer<S, T, R> {
  organize<RR>(I: InteractorConstructor<S, R, RR>): Organizer<S, T, RR>;
  call(services: S, context: Context<T>): Promise<Context<R>>;
  rollback(): Promise<void>;
}

/**
 * Wrapper around each entry in an Organizer chain
 * @private
 */
class ChainedOrganizer<S, T, TN, RL> implements Organizer<S, T, TN> {
  IC: InteractorConstructor<S, RL, TN>;
  last: Organizer<S, T, RL>;
  interactor?: Interactor<S, RL, TN>;
  nextContext?: Context<TN>;

  /** constructor */
  constructor(IC: InteractorConstructor<S, RL, TN>, last: Organizer<S, T, RL>) {
    this.IC = IC;
    this.last = last;
  }

  /** Invokes the wrapped Interactor */
  async call(services: S, context: Context<T>): Promise<Context<TN>> {
    const result = await this.last.call(services, context);
    const {context: final, interactor} = await interact(
      services,
      this.IC,
      result,
      true
    );
    this.interactor = interactor;
    this.nextContext = final;
    if (result.failure) {
      await this.last.rollback();
    }
    return final;
  }

  /** Adds another Interactor to the chain */
  organize<RN>(IC: InteractorConstructor<S, TN, RN>): Organizer<S, T, RN> {
    return new ChainedOrganizer(IC, this);
  }

  /** Undoes the wrapped Interactor (if necessary) if chain fails */
  async rollback() {
    if (!this.interactor) {
      throw new TypeNarrowingError();
    }
    if (!this.nextContext) {
      throw new TypeNarrowingError();
    }
    if (typeof this.interactor.rollback === 'function') {
      await this.interactor.rollback(this.nextContext);
    }
    await this.last.rollback();
  }
}

/**
 * First Interactor in an Organizer chain
 * @private
 */
class InitialOrganizer<S, T, TN> implements Organizer<S, T, TN> {
  IC: InteractorConstructor<S, T, TN>;
  interactor?: Interactor<S, T, TN>;
  nextContext?: Context<TN>;

  /** constructor */
  constructor(IC: InteractorConstructor<S, T, TN>) {
    this.IC = IC;
  }

  /** Invokes the wrapped Interactor */
  async call(services: S, context: Context<T>): Promise<Context<TN>> {
    const {context: final, interactor} = await interact(
      services,
      this.IC,
      context,
      true
    );
    this.interactor = interactor;
    this.nextContext = final;
    return final;
  }

  /** Adds another Interactor to the chain */
  organize<RN>(IC: InteractorConstructor<S, TN, RN>): Organizer<S, T, RN> {
    return new ChainedOrganizer(IC, this);
  }

  /** Undoes the wrapped Interactor (if necessary) if chain fails */
  async rollback() {
    if (!this.interactor) {
      throw new TypeNarrowingError();
    }
    if (!this.nextContext) {
      throw new TypeNarrowingError();
    }
    if (typeof this.interactor.rollback === 'function') {
      await this.interactor.rollback(this.nextContext);
    }
  }
}

/** Chains Interactors */
export function organize<S, T, R>(
  IC: InteractorConstructor<S, T, R>
): Organizer<S, T, R> {
  return new InitialOrganizer(IC);
}
