import Ember from 'ember';

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
