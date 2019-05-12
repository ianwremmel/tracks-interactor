/* eslint-env jest */
/* eslint-disable require-jsdoc */

import {Interactor} from './interactor';
import {organize} from './organize';

export const services = {
  a: {
    after: jest.fn(),
    before: jest.fn(),
    method: jest.fn(),
    unmethod: jest.fn(),
  },
  b: {
    after: jest.fn(),
    before: jest.fn(),
    method: jest.fn(),
    unmethod: jest.fn(),
  },
  c: {
    after: jest.fn(),
    before: jest.fn(),
    unmethod: jest.fn(),
  },
  d: {
    method: jest.fn(),
    unmethod: jest.fn(),
  },
};

export type ServiceMap = typeof services;

export interface CommonShape {
  services: ServiceMap;
}

export interface AShape extends CommonShape {
  a: boolean;
}

export interface BShape extends CommonShape {
  b: boolean;
}

export interface CShape extends CommonShape {
  c: boolean;
}

export interface DShape extends CommonShape {
  d: boolean;
}

export class AlwaysSucceedsA extends Interactor<AShape, BShape> {
  async after() {
    this.context.data.services.a.after();
  }

  async before() {
    this.context.data.services.a.before();
  }

  async call() {
    this.context.data.services.a.method();
    return this.context.extend((draft) => ({
      b: true,
      services: draft.services,
    }));
  }

  async rollback() {
    this.context.data.services.a.unmethod();
  }
}

export class AlwaysSucceedsB extends Interactor<BShape, CShape> {
  async around(fn: () => Promise<void>) {
    this.context.data.services.b.before();
    await fn();
    this.context.data.services.b.after();
  }
  async call() {
    this.context.data.services.b.method();
    return this.context.extend((draft) => ({
      c: true,
      services: draft.services,
    }));
  }

  async rollback() {
    this.context.data.services.b.unmethod();
  }
}

export class AlwaysFailsC extends Interactor<CShape, DShape> {
  async after() {
    this.context.data.services.c.after();
  }

  async before() {
    this.context.data.services.c.before();
  }

  async call() {
    this.context.fail('mock failure');
    return this.context.extend((draft) => ({
      d: true,
      services: draft.services,
    }));
  }

  async rollback() {
    this.context.data.services.c.unmethod();
  }
}

export class Identity<T> extends Interactor<T> {
  async call() {
    return this.context;
  }
}

/* eslint-enable require-jsdoc */
