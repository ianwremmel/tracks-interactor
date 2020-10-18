import {Context} from './context';

export interface InteractorConstructor<T, R> {
  new (): Interactor<T, R>;
}

// pretty sure R is needed so class and interface combine
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface Interactor<T, R> {
  context: Context<T>;
}

/** Standardized interface to business logic */
export abstract class Interactor<T, R = T> implements Interactor<T, R> {
  // yes, it's useless at runtime, but it seems necessor for the
  // InteractorConstructor interface to work correctly.
  // eslint-disable-next-line no-useless-constructor,@typescript-eslint/no-empty-function
  constructor() {}
  abstract async call(): Promise<Context<R>>;
}
