import { isArray } from '@ember/array';
import { typeOf } from '@ember/utils';
import { merge } from '@ember/polyfills';
import CouchError from './error';

export class DeepEqual {

  constructor(opts) {
    this.opts = merge({ Error: CouchError, allowEmberObjects: false }, opts);
  }

  typeOf(arg) {
    if(isArray(arg)) {
      return 'array';
    }
    return typeOf(arg);
  }

  isEqual(a, b) {
    let type = this.typeOf(a);
    if(type !== this.typeOf(b)) {
      return false;
    }
    if(type === 'object') {
      if(Object.keys(a).length !== Object.keys(b).length) {
        return false;
      }
      for(let key in a) {
        if(!this.isEqual(a[key], b[key])) {
          return false;
        }
      }
      return true;
    } else if(type === 'array') {
      if(a.length !== b.length) {
        return false;
      }
      for(let i = 0; i < a.length; i++) {
        if(!this.isEqual(a[i], b[i])) {
          return false;
        }
      }
      return true;
    } else if(type === 'instance' && !this.opts.allowEmberObjects) {
      throw new this.opts.Error({ error: 'deep-equal', reason: 'ember object instances are not allowed' });
    }
    return a === b;
  }

}

export default opts => {
  let deepEqual = new DeepEqual(opts);
  return deepEqual.isEqual.bind(deepEqual);
}
