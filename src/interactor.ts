import {Context} from './context';

export interface InteractorConstructor<T, R> {
  new (context: Context<T>): Interactor<T, R>;
}

// pretty sure R is needed so class and interface combine
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface Interactor<T, R> {
  context: Context<T>;
}

/** Standardized interface to business logic */
export abstract class Interactor<T, R = T> implements Interactor<T, R> {
  /** constructor */
  constructor(context: Context<T>) {
    this.context = context;
  }
  abstract async call(): Promise<Context<R>>;
}
