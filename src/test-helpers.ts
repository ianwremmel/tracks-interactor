/* eslint-env jest */
/* eslint-disable require-jsdoc */

import {Interactor} from './interactor';

export const services = {
  a: {
    method: jest.fn(),
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
  async call() {
    this.context.data.services.a.method();
    return {
      b: true,
      services: this.context.data.services,
    };
  }
}

export class AlwaysFailsC extends Interactor<CShape, DShape> {
  async call() {
    this.context.fail('mock failure');
    return {
      d: true,
      services: this.context.data.services,
    };
  }
}

export class Identity<T> extends Interactor<T> {
  async call() {
    return this.context;
  }
}

/* eslint-enable require-jsdoc */
