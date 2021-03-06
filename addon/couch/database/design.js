import EmberObject from '@ember/object';
import { merge } from '@ember/polyfills';
import { typeOf } from '@ember/utils';
import { reject } from 'rsvp';
import buildDeepEqual from '../../util/deep-equal';

const deepEqual = buildDeepEqual({ allowEmberObjects: false });
const functionRegex = /^(?:function)?(?:\s*)(?:\w*)(?:\s*)(\([\w,\s]*\))(?:\s*)([\S\s]*)(?:\w*)$/i;

export default EmberObject.extend({

  database: null,

  _stringify(arg) {
    let type = typeOf(arg);
    if(type === 'array') {
      let ret = [];
      for(let i = 0; i < arg.length; i++) {
        ret.push(this._stringify(arg[i]));
      }
      return ret;
    } else if(type === 'object') {
      let ret = {};
      for(let key in arg) {
        ret[key] = this._stringify(arg[key]);
      }
      return ret;
    } else if(type === 'function') {
      let string = arg.toString();
      // es6 transpiler adds function name, CouchDB doesn't like it
      // es6 without transpiler doesn't add 'function', obviously CouchDB doesn't like it either
      string = string.replace(functionRegex, (match, args, body) => `function${args} ${body.trim()}`);
      return string;
    }
    return arg;
  },

  _build(name, hash) {
    return merge({ _id: this.id(name), language: 'javascript' }, this._stringify(hash));
  },

  _deepEqual(a, b) {
    return deepEqual(a, b);
  },

  id(name) {
    return `_design/${name}`;
  },

  load(name, opts) {
    opts = merge({ optional: false }, opts);
    let id = this.id(name);
    return this.get('database').load(id, { encoded: true }).then((doc) => {
      return doc;
    }, (err) => {
      if(opts.optional && err.status === 404) {
        return;
      }
      return reject(err);
    });
  },

  save(name, hash) {
    let doc = this._build(name, hash);
    return this.load(name, { encoded: true, optional: true }).then((cur) => {
      if(cur) {
        doc._rev = cur._rev;
        if(this._deepEqual(doc, cur)) {
          return { ok: true, id: doc._id, rev: doc._rev, saved: false };
        }
      }
      return this.get('database').save(doc, { encoded: true }).then((data) => {
        data.saved = true;
        return data;
      });
    });
  },

  delete(name, opts) {
    opts = merge({ optional: false }, opts);
    return this.load(name, { optional: opts.optional }).then((cur) => {
      if(cur) {
        return this.get('database').delete(cur._id, cur._rev, { encoded: true }).then((data) => {
          data.deleted = true;
          return data;
        });
      }
      return { ok: true, id: this.id(name), deleted: false };
    });
  },

});
