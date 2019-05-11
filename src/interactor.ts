import {Context} from './context';

export interface InteractorConstructor<T, R> {
  new (context: Context<T>): Interactor<T, R>;
}

export interface Interactor<T, R> {
  context: Context<T>;
  after(): Promise<void>;
  around(fn: () => Promise<void>): Promise<void>;
  before(): Promise<void>;
  rollback?(context: Context<R>): Promise<void>;
}

/** Standardized interface to business logic */
export abstract class Interactor<T, R = T> {
  /** constructor */
  constructor(context: Context<T>) {
    this.context = context;
  }
  abstract async call(): Promise<Context<R>>;
}
