import Ember from 'ember';
import { isObject, isFunction_ } from './assert';

const {
  computed,
  getOwner,
  A
} = Ember;

export function array() {
  return computed(function() {
    return A();
  });
}

export function object() {
  return computed(function() {
    return Object.create(null);
  });
}

export function lookup(name, fn) {
  return computed(function() {
    let props = fn ? fn.call(this, name) : {};
    let owner = getOwner(this);
    return owner.factoryFor(name).create(props);
  }).readOnly();
}

export function createInternal(InternalClass) {
  return computed(function() {
    return new InternalClass(this);
  }).readOnly();
}

export function forwardCall(prop) {
  return function(name) {
    return function(...args) {
      let object = this.get(prop);
      isObject(prop, object);
      let fn = object[name];
      isFunction_(`${prop}.${name} must be function not ${fn}`, fn);
      return fn.call(object, ...args);
    };
  };
}
