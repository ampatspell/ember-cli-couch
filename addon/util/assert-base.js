import { typeOf } from '@ember/utils';
import ArrayProxy from '@ember/array/proxy';

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

  function isInstance_(message, value) {
    assert(message, typeOf(value) === 'instance');
  }

  function isInstance(key, value) {
    isInstance_(`${key} must be ember object instance`, value);
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

  const _isArray = value => typeOf(value) === 'array';

  function isArray_(message, value) {
    assert(message, _isArray(value));
  }

  function isArray(key, value) {
    isArray_(`${key} must be array`, value);
  }

  const _isArrayProxy = value => ArrayProxy.detectInstance(value);

  function isArrayProxy_(message, value) {
    assert(message, _isArrayProxy(value));
  }

  function isArrayProxy(key, value) {
    isArrayProxy_(`${key} must be array proxy`, value);
  }

  function isArrayOrArrayProxy_(message, value) {
    assert(message, _isArray(value) || _isArrayProxy(value));
  }

  function isArrayOrArrayProxy(key, value) {
    isArrayOrArrayProxy_(`${key} must be array or array proxy`, value);
  }

  function isBoolean_(message, value) {
    assert(message, typeOf(value) === 'boolean');
  }

  function isBoolean(key, value) {
    isBoolean_(`${key} must be boolean`, value);
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
    isInstance_,
    isInstance,
    isClass_,
    isClass,
    isFunction_,
    isFunction,
    isArray_,
    isArray,
    isArrayProxy_,
    isArrayProxy,
    isArrayOrArrayProxy_,
    isArrayOrArrayProxy,
    isBoolean_,
    isBoolean,
    isOneOf
  };
}
