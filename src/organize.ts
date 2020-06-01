import {TypeNarrowingError} from './lib/type-narrowing-error';
import {Interactor, InteractorConstructor} from './interactor';
import {Context} from './context';
import {interact} from './interact';

interface Organizer<T, R> {
  organize<RR>(I: InteractorConstructor<R, RR>): Organizer<T, RR>;
  call(context: Context<T>): Promise<Context<R>>;
  rollback(): Promise<void>;
}

/**
 * Wrapper around each entry in an Organizer chain
 * @private
 */
class ChainedOrganizer<T, TN, RL> implements Organizer<T, TN> {
  IC: InteractorConstructor<RL, TN>;
  last: Organizer<T, RL>;
  interactor?: Interactor<RL, TN>;
  nextContext?: Context<TN>;

  /** constructor */
  constructor(IC: InteractorConstructor<RL, TN>, last: Organizer<T, RL>) {
    this.IC = IC;
    this.last = last;
  }

  /** Invokes the wrapped Interactor */
  async call(context: Context<T>): Promise<Context<TN>> {
    const result = await this.last.call(context);
    const {context: final, interactor} = await interact(this.IC, result, true);
    if (final.failed) {
      await this.last.rollback();
      throw final.error;
    }
    this.interactor = interactor;
    this.nextContext = final;
    return final;
  }

  /** Adds another Interactor to the chain */
  organize<RN>(IC: InteractorConstructor<TN, RN>): Organizer<T, RN> {
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
class InitialOrganizer<T, TN> implements Organizer<T, TN> {
  IC: InteractorConstructor<T, TN>;
  interactor?: Interactor<T, TN>;
  nextContext?: Context<TN>;

  /** constructor */
  constructor(IC: InteractorConstructor<T, TN>) {
    this.IC = IC;
  }

  /** Invokes the wrapped Interactor */
  async call(context: Context<T>): Promise<Context<TN>> {
    const {context: final, interactor} = await interact(this.IC, context, true);
    this.interactor = interactor;
    if (final.failed) {
      throw final.error;
    }
    this.nextContext = final;
    return final;
  }

  /** Adds another Interactor to the chain */
  organize<RN>(IC: InteractorConstructor<TN, RN>): Organizer<T, RN> {
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
export function organize<T, R>(
  IC: InteractorConstructor<T, R>
): Organizer<T, R> {
  return new InitialOrganizer(IC);
}
