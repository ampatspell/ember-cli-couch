import Ember from 'ember';

const {
  computed,
  getOwner,
  A
} = Ember;

export const array = () => {
  return computed(function() {
    return A();
  });
}

export const object = () => {
  return computed(function() {
    return Object.create(null);
  });
}

export const lookup = (name, fn) => {
  return computed(function() {
    let props = fn ? fn.call(this, name) : {};
    let owner = getOwner(this);
    return owner.factoryFor(name).create(props);
  }).readOnly();
}

export const fastboot = () => {
  return computed(function() {
    return getOwner(this).lookup('service:fastboot');
  }).readOnly();
};

export const isFastBoot = () => {
  return computed(function() {
    let fastboot = getOwner(this).lookup('service:fastboot');
    if(!fastboot) {
      return false;
    }
    return !!fastboot.get('isFastBoot');
  }).readOnly();
}
