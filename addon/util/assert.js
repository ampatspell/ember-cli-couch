import CouchError  from './error';
import Base from './assert-base';

let {
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
} = Base(CouchError);

export {
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
}

export default assert;
