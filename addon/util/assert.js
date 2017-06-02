import Ember from 'ember';
import Error  from './error';

const {
  typeOf
} = Ember;

export function assert(message, ok) {
  if(!ok) {
    let hash;
    if(typeOf(message) === 'object') {
      hash = message;
    } else {
      hash = { error: 'assertion', reason: message };
    }
    throw new Error(hash);
  }
}

export function notBlank_(message, value) {
  assert(message, typeOf(value) === 'string' && value.trim().length > 0);
}

export function notBlank(key, value) {
  notBlank_(`${key} must not be blank`, value);
}

export function isString_(message, value) {
  assert(message, typeOf(value) === 'string');
}

export function isString(key, value) {
  isString_(`${key} must be string`, value);
}

export function isObject_(message, value) {
  assert(message, typeOf(value) === 'object');
}

export function isObject(key, value) {
  isObject_(`${key} must be object`, value);
}

export function isClass_(message, value) {
  assert(message, typeOf(value) === 'class');
}

export function isClass(key, value) {
  isClass_(`${key} must be class`, value);
}

export function isFunction_(message, value) {
  assert(message, typeOf(value) === 'function');
}

export function isFunction(key, value) {
  isFunction_(`${key} must be function`, value);
}

export function isOneOf(key, value, values) {
  assert(`${key} must be one of [${values.join(', ')}]`, values.indexOf(value) !== -1);
}

export default assert;
