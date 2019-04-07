import {Context} from './context';

export interface InteractorConstructor<S, T, R> {
  new (services: S, context: Context<T>): Interactor<S, T, R>;
}

export interface Interactor<S, T, R> {
  services: S;
  context: Context<T>;
  after(): Promise<void>;
  around(fn: () => Promise<void>): Promise<void>;
  before(): Promise<void>;
  rollback?(context: Context<R>): Promise<void>;
}

/** Standardized interface to business logic */
export abstract class Interactor<S, T, R = T> {
  /** constructor */
  constructor(services: S, context: Context<T>) {
    this.services = services;
    this.context = context;
  }
  abstract async call(): Promise<Context<R>>;
}
