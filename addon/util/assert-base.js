import Ember from 'ember';

const {
  typeOf
} = Ember;

export default function(Error) {

  function assert(message, ok) {
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

  function notBlank_(message, value) {
    assert(message, typeOf(value) === 'string' && value.trim().length > 0);
  }

  function notBlank(key, value) {
    notBlank_(`${key} must not be blank`, value);
  }

  function isString_(message, value) {
    assert(message, typeOf(value) === 'string');
  }

  function isString(key, value) {
    isString_(`${key} must be string`, value);
  }

  function isObject_(message, value) {
    assert(message, typeOf(value) === 'object');
  }

  function isObject(key, value) {
    isObject_(`${key} must be object`, value);
  }

  function isClass_(message, value) {
    assert(message, typeOf(value) === 'class');
  }

  function isClass(key, value) {
    isClass_(`${key} must be class`, value);
  }

  function isFunction_(message, value) {
    assert(message, typeOf(value) === 'function');
  }

  function isFunction(key, value) {
    isFunction_(`${key} must be function`, value);
  }

  function isOneOf(key, value, values) {
    assert(`${key} must be one of [${values.join(', ')}]`, values.indexOf(value) !== -1);
  }

  return {
    assert,
    notBlank_,
    notBlank,
    isString_,
    isString,
    isObject_,
    isObject,
    isClass_,
    isClass,
    isFunction_,
    isFunction,
    isOneOf
  };
}
